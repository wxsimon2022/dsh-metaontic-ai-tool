import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLoginReporter } from '../dist/host/login-reporter.js';
import { createQueryHandler, createSessionHandler } from '../dist/host/handlers.js';

test('anonymous reports require consent, persist an independent ID and never include account data', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'login-stats-'));
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, ...options, payload: JSON.parse(options.body) });
    return new Response('{}');
  };
  try {
    const reporter = createLoginReporter({ directory, deviceDirectory: join(directory, 'device'), fetchImpl });
    await reporter.report('login');
    assert.equal(calls.length, 0);
    await reporter.configure(true);
    await reporter.report('login');
    await createLoginReporter({ directory, deviceDirectory: join(directory, 'device'), fetchImpl }).report('restore');
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, 'https://ai.mybfs.cn/api/v1/newapi-login/events');
    assert.equal(calls[0].redirect, 'error');
    assert.equal(calls[0].payload.installationId, calls[1].payload.installationId);
    assert.deepEqual(Object.keys(calls[0].payload).sort(), ['eventId', 'installationId', 'kind', 'occurredAt', 'version', 'platform'].sort());
    assert.notEqual(calls[0].payload.eventId, calls[1].payload.eventId);
    await reporter.configure(false);
    await reporter.report('restore');
    assert.equal(calls.length, 2);
    await reporter.configure(true);
    await createLoginReporter({ directory, deviceDirectory: join(directory, 'device'), fetchImpl: async () => { throw new Error('offline'); } }).report('login');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
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

test('concurrent profiles share one device identity and keep it across reporter restarts', async () => {
  const root = await mkdtemp(join(tmpdir(), 'device-stats-'));
  const ids = [];
  const fetchImpl = async (_url, options) => {
    ids.push(JSON.parse(options.body).installationId);
    return new Response('{}');
  };
  const make = profile => createLoginReporter({
    directory: join(root, profile), deviceDirectory: join(root, 'shared-device'), fetchImpl,
  });
  try {
    const a = make('profile-a');
    const b = make('profile-b');
    await Promise.all([a.configure(true), b.configure(true)]);
    await Promise.all([a.report('login'), b.report('login')]);
    await make('profile-a').report('restore');
    assert.equal(ids.length, 3);
    assert.equal(new Set(ids).size, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
