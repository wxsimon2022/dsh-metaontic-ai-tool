import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import {
  createLoginStore,
  createQueryHandler,
  createSessionHandler,
  normalizeAccessToken,
  normalizeBaseUrl,
  QueryError,
  queryPlatform,
} from '../dist/index.js';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const STATUS = {
  system_name: 'MetaOntic AI',
  server_address: 'https://ai.bileego.com',
  version: '1.0.0-rc.40',
  quota_per_unit: 500000,
  quota_display_type: 'CNY',
  usd_exchange_rate: 7.3,
  custom_currency_symbol: '¤',
  custom_currency_exchange_rate: 1,
  display_in_currency: true,
  price: 7.3,
};

const ACCOUNT = {
  id: 6,
  username: 'tester',
  display_name: 'Tester',
  role: 1,
  status: 1,
  group: 'svip',
  quota: 1234995,
  used_quota: 66504732,
  request_count: 37910,
  access_token: 'must-not-leak',
};

function platformFetch(requests, { selfStatus = 200, selfPayload = { success: true, data: ACCOUNT } } = {}) {
  return async (url, init) => {
    const parsed = new URL(url);
    assert.equal(init.method, 'GET');
    if (parsed.pathname.endsWith('/api/status')) {
      return jsonResponse({ success: true, data: STATUS });
    }
    if (parsed.pathname.endsWith('/api/user/self')) {
      requests.push({
        authorization: init.headers.authorization,
        path: parsed.pathname,
      });
      return jsonResponse(selfPayload, selfStatus);
    }
    return jsonResponse({ success: false, message: 'not found' }, 404);
  };
}

function sampleData(baseUrl = 'https://ai.bileego.com') {
  return {
    baseUrl,
    fetchedAt: '2026-11-23T05:00:00.000Z',
    platform: STATUS,
    account: {
      id: ACCOUNT.id,
      username: ACCOUNT.username,
      quota: ACCOUNT.quota,
    },
  };
}

async function temporaryStore(t) {
  const directory = await mkdtemp(join(tmpdir(), 'dsh-metaontic-ai-tool-'));
  t.after(async () => rm(directory, { recursive: true, force: true }));
  return { directory, store: createLoginStore({ directory }) };
}

test('normalizes platform URLs and access tokens', () => {
  assert.equal(normalizeBaseUrl('https://ai.bileego.com/'), 'https://ai.bileego.com');
  assert.equal(normalizeBaseUrl('https://example.com/new-api///'), 'https://example.com/new-api');
  assert.equal(normalizeAccessToken('  Bearer test-token  '), 'test-token');
  assert.throws(() => normalizeBaseUrl('ftp://example.com'), /HTTP/);
  assert.throws(() => normalizeBaseUrl('https://example.com/?token=secret'), /查询参数/);
  assert.throws(() => normalizeAccessToken('   '), /访问令牌/);
});

test('queries the platform and returns only approved account fields', async () => {
  const requests = [];
  const result = await queryPlatform({
    baseUrl: 'https://example.com/new-api/',
    accessToken: 'Bearer test-token',
    fetchImpl: platformFetch(requests),
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].authorization, 'Bearer test-token');
  assert.equal(requests[0].path, '/new-api/api/user/self');
  assert.equal(result.baseUrl, 'https://example.com/new-api');
  assert.equal(result.platform.system_name, 'MetaOntic AI');
  assert.equal(result.platform.quota_display_type, 'CNY');
  assert.equal(result.account.username, 'tester');
  assert.equal(result.account.quota, 1234995);
  assert.equal('access_token' in result.account, false);
  assert.equal(typeof result.fetchedAt, 'string');
});

test('maps an invalid access token to a stable authentication error', async () => {
  await assert.rejects(
    queryPlatform({
      baseUrl: 'https://example.com/',
      accessToken: 'bad-token',
      fetchImpl: platformFetch([], {
        selfStatus: 401,
        selfPayload: { success: false, message: 'invalid token' },
      }),
    }),
    error => error.code === 'AUTH_FAILED' && error.status === 401,
  );
});

test('validates the query route without contacting the platform', async () => {
  const handler = createQueryHandler({ store: null });
  const response = await handler(new Request('http://localhost/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ baseUrl: 'https://ai.bileego.com/', accessToken: '' }),
  }));
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(payload.ok, false);
  assert.equal(payload.error.code, 'TOKEN_REQUIRED');
});

test('saves a successful login locally with private permissions', async t => {
  const { directory, store } = await temporaryStore(t);
  const handler = createQueryHandler({ store, query: async () => sampleData() });
  const response = await handler(new Request('http://localhost/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ baseUrl: 'https://ai.bileego.com/', accessToken: 'saved-test-token' }),
  }));
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.authenticated, true);
  assert.equal(payload.data.persisted, true);
  const saved = JSON.parse(await readFile(join(directory, 'login.json'), 'utf8'));
  assert.equal(saved.baseUrl, 'https://ai.bileego.com');
  assert.equal(saved.accessToken, 'saved-test-token');
  assert.equal((await stat(join(directory, 'login.json'))).mode & 0o777, 0o600);
});

test('falls back to the profile directory beside cordis.patch.yml', async t => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-profile-'));
  t.after(async () => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'cordis.patch.yml'), '[]\n');
  const store = createLoginStore({
    moduleUrl: pathToFileURL(join(root, 'node_modules', 'dsh-metaontic-ai-tool', 'index.js')).href,
  });
  await store.save('https://ai.bileego.com/', 'saved-test-token');
  const saved = JSON.parse(await readFile(join(root, '.dsh-metaontic-ai-tool', 'login.json'), 'utf8'));
  assert.equal(saved.accessToken, 'saved-test-token');
});

test('restores the saved session without returning the token', async t => {
  const { store } = await temporaryStore(t);
  await store.save('https://ai.bileego.com/', 'saved-test-token');
  const handler = createSessionHandler({
    store,
    query: async saved => {
      assert.equal(saved.accessToken, 'saved-test-token');
      return sampleData(saved.baseUrl);
    },
  });

  const response = await handler(new Request('http://localhost/session', { method: 'GET' }));
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.data.authenticated, true);
  assert.equal(payload.data.persisted, true);
  assert.equal(JSON.stringify(payload).includes('saved-test-token'), false);
});

test('clears the saved login on logout or an invalid saved token', async t => {
  const { store } = await temporaryStore(t);
  await store.save('https://ai.bileego.com/', 'saved-test-token');

  const invalid = createSessionHandler({
    store,
    query: async () => { throw new QueryError('AUTH_FAILED', 'expired', 401); },
  });
  const invalidResponse = await invalid(new Request('http://localhost/session', { method: 'GET' }));
  const invalidPayload = await invalidResponse.json();
  assert.equal(invalidResponse.status, 401);
  assert.equal(invalidPayload.data.savedLoginInvalid, true);
  assert.equal(await store.load(), null);

  await store.save('https://ai.bileego.com/', 'saved-test-token');
  const logout = createSessionHandler({ store, query: async () => sampleData() });
  const logoutResponse = await logout(new Request('http://localhost/session', { method: 'DELETE' }));
  assert.equal(logoutResponse.status, 200);
  assert.equal(await store.load(), null);
});
