import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import {
  createApiKey,
  createApiKeysHandler,
  createLoginStore,
  createQueryHandler,
  createSessionHandler,
  createSubscriptionHandler,
  createSubscriptionPayment,
  createTopup,
  createTopupHandler,
  deleteApiKey,
  getTopupInfo,
  getSubscriptionInfo,
  listApiKeys,
  normalizeAccessToken,
  normalizeBaseUrl,
  QueryError,
  queryPlatform,
  revealApiKey,
  setApiKeyStatus,
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

test('lists API keys without returning full key material', async () => {
  const requests = [];
  const keyFetch = async (url, init) => {
    const parsed = new URL(url);
    requests.push({ path: parsed.pathname, search: parsed.search, method: init.method, authorization: init.headers.authorization });
    return jsonResponse({
      success: true,
      data: {
        page: 1,
        page_size: 100,
        total: 1,
        items: [{
          id: 60,
          name: 'video-key',
          key: 'sk-must-not-leak',
          status: 1,
          remain_quota: 146602,
          unlimited_quota: false,
          used_quota: 5835067,
          expired_time: -1,
          group: 'svip',
        }],
      },
    });
  };

  const result = await listApiKeys({
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: keyFetch,
  });

  assert.equal(requests[0].path, '/api/token/');
  assert.equal(requests[0].search, '?p=0&size=100');
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[0].authorization, 'Bearer saved-test-token');
  assert.equal(result.total, 1);
  assert.equal(result.keys[0].id, 60);
  assert.equal(result.keys[0].name, 'video-key');
  assert.equal('key' in result.keys[0], false);
  assert.equal(JSON.stringify(result).includes('sk-must-not-leak'), false);
});

test('creates API keys with validated fields', async () => {
  let captured;
  const keyFetch = async (url, init) => {
    captured = { url, method: init.method, body: JSON.parse(init.body) };
    return jsonResponse({ success: true, message: '' });
  };

  const result = await createApiKey({
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: keyFetch,
    name: '  dsh-key  ',
    unlimitedQuota: false,
    remainQuota: 500000,
    expiredTime: 1790000000,
    group: 'svip',
  });

  assert.deepEqual(result, { created: true, name: 'dsh-key' });
  assert.equal(captured.method, 'POST');
  assert.equal(captured.url, 'https://example.com/api/token/');
  assert.deepEqual(captured.body, {
    name: 'dsh-key',
    remain_quota: 500000,
    unlimited_quota: false,
    expired_time: 1790000000,
    model_limits_enabled: false,
    model_limits: '',
    allow_ips: '',
    cross_group_retry: false,
    group: 'svip',
  });

  await assert.rejects(
    createApiKey({ baseUrl: 'https://example.com/', accessToken: 'saved-test-token', fetchImpl: keyFetch, name: '   ' }),
    error => error.code === 'API_KEY_NAME_REQUIRED',
  );
});

test('updates, deletes and explicitly reveals API keys', async () => {
  const requests = [];
  const keyFetch = async (url, init) => {
    const parsed = new URL(url);
    requests.push({ path: parsed.pathname, search: parsed.search, method: init.method, body: init.body && JSON.parse(init.body) });
    if (init.method === 'POST') return jsonResponse({ success: true, data: { key: 'sk-explicit-reveal' } });
    return jsonResponse({ success: true, message: '' });
  };
  const common = {
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: keyFetch,
  };

  assert.deepEqual(await setApiKeyStatus({ ...common, id: 60, status: 2 }), { id: 60, status: 2 });
  assert.deepEqual(await deleteApiKey({ ...common, id: 60 }), { id: 60, deleted: true });
  assert.deepEqual(await revealApiKey({ ...common, id: 60 }), { id: 60, key: 'sk-explicit-reveal' });

  assert.deepEqual(requests, [
    { path: '/api/token/', search: '?status_only=true', method: 'PUT', body: { id: 60, status: 2 } },
    { path: '/api/token/60', search: '', method: 'DELETE', body: undefined },
    { path: '/api/token/60/key', search: '', method: 'POST', body: undefined },
  ]);
});

test('adds the sk- prefix only when an API key does not already have it', async () => {
  let responseKey = 'explicit-reveal';
  const keyFetch = async () => jsonResponse({ success: true, data: { key: responseKey } });
  const common = {
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: keyFetch,
  };

  assert.deepEqual(await revealApiKey({ ...common, id: 60 }), { id: 60, key: 'sk-explicit-reveal' });
  responseKey = 'sk-already-prefixed';
  assert.deepEqual(await revealApiKey({ ...common, id: 60 }), { id: 60, key: 'sk-already-prefixed' });
});

test('loads approved topup configuration fields', async () => {
  const requests = [];
  const topupFetch = async (url, init) => {
    const parsed = new URL(url);
    requests.push({ path: parsed.pathname, method: init.method, authorization: init.headers.authorization });
    return jsonResponse({
      success: true,
      data: {
        amount_options: [10, '20', 20, 0, -5, 'bad', 100],
        min_topup: 1,
        enable_online_topup: true,
        pay_methods: [
          { name: '微信', type: 'wxpay', secret: 'must-not-leak' },
          { name: '无效', type: 'bad type' },
          { name: '微信重复', type: 'wxpay' },
        ],
        payment_compliance_confirmed: true,
      },
    });
  };

  const result = await getTopupInfo({
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: topupFetch,
  });

  assert.deepEqual(result, {
    amountOptions: [10, 20, 100],
    minTopup: 1,
    onlineTopupEnabled: true,
    paymentMethods: [{ name: '微信', type: 'wxpay' }],
  });
  assert.deepEqual(requests, [{
    path: '/api/user/topup/info',
    method: 'GET',
    authorization: 'Bearer saved-test-token',
  }]);
});

test('creates a signed topup payment link without exposing the access token', async () => {
  let captured;
  const topupFetch = async (url, init) => {
    captured = { url, method: init.method, body: JSON.parse(init.body), authorization: init.headers.authorization };
    return jsonResponse({
      message: 'success',
      url: 'https://pay.example.com/submit.php?existing=1',
      data: {
        type: 'wxpay',
        money: '7.30',
        name: 'TUC1',
        out_trade_no: 'USR6NOtclRqn1795355599',
        device: 'pc',
        notify_url: 'https://relay.example.com/api/user/epay/notify',
        sign_type: 'MD5',
        sign: 'abc123',
      },
    });
  };

  const result = await createTopup({
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: topupFetch,
    amount: 10,
    paymentMethod: 'wxpay',
  });

  assert.equal(captured.url, 'https://example.com/api/user/pay');
  assert.equal(captured.method, 'POST');
  assert.equal(captured.authorization, 'Bearer saved-test-token');
  assert.deepEqual(captured.body, { amount: 10, payment_method: 'wxpay' });
  assert.equal(result.amount, 10);
  assert.equal(result.paymentMethod, 'wxpay');
  assert.equal(result.payMoney, '7.30');
  assert.equal(result.outTradeNo, 'USR6NOtclRqn1795355599');
  const payUrl = new URL(result.payUrl);
  assert.equal(payUrl.origin + payUrl.pathname, 'https://pay.example.com/submit.php');
  assert.equal(payUrl.searchParams.get('existing'), '1');
  assert.equal(payUrl.searchParams.get('sign'), 'abc123');
  assert.equal(payUrl.searchParams.get('type'), 'wxpay');
  assert.equal(payUrl.searchParams.get('notify_url'), 'https://relay.example.com/api/user/epay/notify');
  assert.equal(JSON.stringify(result).includes('saved-test-token'), false);

  await assert.rejects(
    createTopup({
      baseUrl: 'https://example.com/',
      accessToken: 'saved-test-token',
      fetchImpl: topupFetch,
      amount: 0,
      paymentMethod: 'wxpay',
    }),
    error => error.code === 'INVALID_TOPUP_AMOUNT',
  );
});

test('loads subscription plans and current subscriptions with approved fields', async () => {
  const requests = [];
  const subscriptionFetch = async (url, init) => {
    const parsed = new URL(url);
    requests.push({ path: parsed.pathname, method: init.method, authorization: init.headers.authorization });
    if (parsed.pathname.endsWith('/api/subscription/plans')) {
      return jsonResponse({
        success: true,
        data: [{
          plan: {
            id: 1,
            title: '短视频生成套餐',
            subtitle: '购买即送 88 折优惠',
            price_amount: 99,
            currency: 'USD',
            duration_unit: 'month',
            duration_value: 1,
            custom_seconds: 0,
            quota_reset_period: 'never',
            quota_reset_custom_seconds: 0,
            enabled: true,
            sort_order: 0,
            allow_balance_pay: true,
            allow_wallet_overflow: true,
            max_purchase_per_user: 1,
            upgrade_group: 'vip',
            downgrade_group: 'default',
            total_amount: 6780822,
            stripe_price_id: 'price_must_not_leak',
            creem_product_id: 'creem_must_not_leak',
            waffo_pancake_product_id: 'waffo_must_not_leak',
          },
        }],
      });
    }
    if (parsed.pathname.endsWith('/api/subscription/self')) {
      return jsonResponse({
        success: true,
        data: {
          billing_preference: 'wallet_only',
          subscriptions: [{
            id: 9,
            plan_id: 1,
            status: 'active',
            source: 'epay',
            start_time: 1790000000,
            end_time: 1792592000,
            amount_total: 6780822,
            amount_used: 780822,
            next_reset_time: 0,
            user_id: 6,
          }],
          all_subscriptions: [{
            id: 8,
            plan_id: 1,
            status: 'expired',
            source: 'epay',
            start_time: 1780000000,
            end_time: 1782592000,
            amount_total: 6780822,
            amount_used: 6780822,
            next_reset_time: 0,
          }],
        },
      });
    }
    if (parsed.pathname.endsWith('/api/user/topup/info')) {
      return jsonResponse({
        success: true,
        data: {
          enable_online_topup: true,
          pay_methods: [{ name: '微信', type: 'wxpay' }],
        },
      });
    }
    return jsonResponse({ success: false, message: 'not found' }, 404);
  };

  const result = await getSubscriptionInfo({
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: subscriptionFetch,
  });

  assert.deepEqual(result.plans, [{
    id: 1,
    title: '短视频生成套餐',
    subtitle: '购买即送 88 折优惠',
    priceAmount: 99,
    currency: 'USD',
    durationUnit: 'month',
    durationValue: 1,
    customSeconds: 0,
    quotaResetPeriod: 'never',
    quotaResetCustomSeconds: 0,
    enabled: true,
    sortOrder: 0,
    allowBalancePay: true,
    allowWalletOverflow: true,
    maxPurchasePerUser: 1,
    upgradeGroup: 'vip',
    downgradeGroup: 'default',
    totalQuota: 6780822,
  }]);
  assert.equal(result.subscriptions[0].planTitle, '短视频生成套餐');
  assert.equal(result.subscriptions[0].status, 'active');
  assert.equal('user_id' in result.subscriptions[0], false);
  assert.equal(result.allSubscriptions[0].status, 'expired');
  assert.deepEqual(result.paymentMethods, [{ name: '微信', type: 'wxpay' }]);
  assert.equal(result.onlinePaymentEnabled, true);
  assert.equal(JSON.stringify(result).includes('must_not_leak'), false);
  assert.equal(requests.every(request => request.authorization === 'Bearer saved-test-token'), true);
});

test('creates a signed subscription payment link', async () => {
  let captured;
  const subscriptionFetch = async (url, init) => {
    captured = { url, method: init.method, body: JSON.parse(init.body), authorization: init.headers.authorization };
    return jsonResponse({
      message: 'success',
      url: 'https://pay.example.com/submit.php',
      data: {
        type: 'wxpay',
        money: '719.28',
        name: '订阅套餐',
        out_trade_no: 'SUB6NO1795355599',
        sign_type: 'MD5',
        sign: 'sub123',
      },
    });
  };

  const result = await createSubscriptionPayment({
    baseUrl: 'https://example.com/',
    accessToken: 'saved-test-token',
    fetchImpl: subscriptionFetch,
    planId: 1,
    paymentMethod: 'wxpay',
  });

  assert.equal(captured.url, 'https://example.com/api/subscription/epay/pay');
  assert.equal(captured.method, 'POST');
  assert.equal(captured.authorization, 'Bearer saved-test-token');
  assert.deepEqual(captured.body, { plan_id: 1, payment_method: 'wxpay' });
  assert.equal(result.planId, 1);
  assert.equal(result.paymentMethod, 'wxpay');
  assert.equal(result.payMoney, '719.28');
  assert.equal(result.outTradeNo, 'SUB6NO1795355599');
  assert.equal(new URL(result.payUrl).searchParams.get('sign'), 'sub123');
  assert.equal(JSON.stringify(result).includes('saved-test-token'), false);

  await assert.rejects(
    createSubscriptionPayment({
      baseUrl: 'https://example.com/',
      accessToken: 'saved-test-token',
      fetchImpl: subscriptionFetch,
      planId: 0,
      paymentMethod: 'wxpay',
    }),
    error => error.code === 'INVALID_SUBSCRIPTION_PLAN',
  );
});

test('API key routes require a saved login', async () => {
  const handler = createApiKeysHandler({ store: null });
  const response = await handler(new Request('http://localhost/api-keys', { method: 'GET' }));
  const payload = await response.json();
  assert.equal(response.status, 401);
  assert.equal(payload.ok, false);
  assert.equal(payload.error.code, 'LOGIN_REQUIRED');
});

test('topup routes require a saved login', async () => {
  const handler = createTopupHandler({ store: null });
  const response = await handler(new Request('http://localhost/topup', { method: 'GET' }));
  const payload = await response.json();
  assert.equal(response.status, 401);
  assert.equal(payload.ok, false);
  assert.equal(payload.error.code, 'LOGIN_REQUIRED');
});

test('subscription routes require a saved login', async () => {
  const handler = createSubscriptionHandler({ store: null });
  const response = await handler(new Request('http://localhost/subscription', { method: 'GET' }));
  const payload = await response.json();
  assert.equal(response.status, 401);
  assert.equal(payload.ok, false);
  assert.equal(payload.error.code, 'LOGIN_REQUIRED');
});
