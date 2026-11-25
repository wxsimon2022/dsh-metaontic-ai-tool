import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLoginReporter } from '../dist/host/login-reporter.js';
import { createQueryHandler, createSessionHandler } from '../dist/host/handlers.js';

test('one report per installation, with consent and no account data', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'login-stats-'));
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, ...options, payload: JSON.parse(options.body) });
    return Response.json({ code: 0, data: { accepted: 1 } });
  };
  const options = { directory, deviceDirectory: join(directory, 'device'), installationDirectory: join(directory, 'package'), fetchImpl };
  try {
    const reporter = createLoginReporter(options);
    await reporter.report('login');
    assert.equal(calls.length, 0);
    await reporter.configure(true);
    await reporter.report('login');
    await createLoginReporter(options).report('restore');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://ai.mybfs.cn/api/v1/newapi-login/events');
    assert.equal(calls[0].redirect, 'error');
    assert.deepEqual(Object.keys(calls[0].payload).sort(), ['eventId', 'installationId', 'deviceId', 'kind', 'occurredAt', 'version', 'platform'].sort());
    await reporter.configure(false);
    await reporter.report('restore');
    assert.equal(calls.length, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('login and restore finish even when reporting never resolves', async () => {
  const forever = new Promise(() => {});
  const reporter = { configure: () => forever, report: () => forever };
  const query = async () => ({ baseUrl: 'https://example.com/', account: {}, platform: {} });
  const store = { save: async () => {}, load: async () => ({ baseUrl: 'https://example.com/', accessToken: 'private' }), clear: async () => {} };
  const timeout = () => new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error('login blocked by telemetry')), 200);
    timer.unref();
  });
  const login = createQueryHandler({ store, query, reporter });
  const result = await Promise.race([login(new Request('https://local/', { method: 'POST', body: JSON.stringify({ reportStats: true }) })), timeout()]);
  assert.equal(result.status, 200);
  const restore = createSessionHandler({ store, query, reporter });
  assert.equal((await Promise.race([restore(new Request('https://local/')), timeout()])).status, 200);
});

test('reinstall reports again without changing device identity; multiple devices remain distinct', async () => {
  const root = await mkdtemp(join(tmpdir(), 'device-stats-'));
  const calls = [];
  const fetchImpl = async (_url, options) => {
    calls.push(JSON.parse(options.body));
    return Response.json({ code: 0, data: { accepted: 1 } });
  };
  const make = (profile, install, device = 'device-a') => createLoginReporter({
    directory: join(root, profile), deviceDirectory: join(root, device),
    installationDirectory: join(root, install), fetchImpl,
  });
  try {
    const a = make('profile-a', 'install-a');
    const b = make('profile-b', 'install-b');
    await Promise.all([a.configure(true), b.configure(true)]);
    await Promise.all([a.report('login'), b.report('login')]);
    await a.report('restore');
    assert.equal(calls.length, 2);
    assert.equal(new Set(calls.map(x => x.deviceId)).size, 1);
    assert.equal(new Set(calls.map(x => x.installationId)).size, 2);
    await rm(join(root, 'install-a'), { recursive: true });
    await make('profile-a', 'install-a').report('login');
    assert.equal(calls.length, 3);
    assert.equal(calls[0].deviceId, calls[2].deviceId);
    assert.notEqual(calls[0].installationId, calls[2].installationId);
    const c = make('profile-c', 'install-c', 'device-b');
    await c.configure(true);
    await c.report('login');
    assert.notEqual(calls[3].deviceId, calls[0].deviceId);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('failed delivery retries with a stable event ID and marks only acknowledged reports', async () => {
  const root = await mkdtemp(join(tmpdir(), 'retry-stats-'));
  const calls = [];
  let fail = true;
  const options = {
    directory: root, deviceDirectory: join(root, 'device'), installationDirectory: join(root, 'install'),
    fetchImpl: async (_url, options) => {
      calls.push(JSON.parse(options.body));
      if (fail) throw new Error('offline');
      return Response.json({ code: 0, data: { accepted: 0 } });
    },
  };
  try {
    const a = createLoginReporter(options);
    await a.configure(true);
    await a.report('login');
    fail = false;
    await a.report('restore');
    await createLoginReporter(options).report('restore');
    assert.equal(calls.length, 2);
    assert.equal(calls[0].eventId, calls[1].eventId);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('opening the login page reports installation without a saved account', async () => {
  const kinds = [];
  const reporter = { configure: async () => {}, report: async kind => { kinds.push(kind); } };
  const handler = createSessionHandler({ reporter, store: { load: async () => null, save: async () => {}, clear: async () => {} } });
  const response = await handler(new Request('https://local/'));
  assert.equal((await response.json()).data.authenticated, false);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(kinds, ['open']);
});
