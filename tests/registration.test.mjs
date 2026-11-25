import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistrationHandler } from '../dist/host/registration.js';

const settings = { register_enabled: true, password_register_enabled: true, email_verification: true };
function fixture(config = settings, result = { success: true }) {
  const calls = [];
  const handler = createRegistrationHandler({ fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return Response.json(url.endsWith('/api/status') ? { success: true, data: config } : result);
  } });
  return { calls, handler };
}
function request(body) {
  return new Request('https://local.test/register', body ? {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  } : {});
}
const account = { action: 'register', username: 'example', email: 'example@example.com', password: 'test-password', verification_code: '123456' };

test('registration exposes only registration capability flags', async () => {
  const { handler } = fixture({ ...settings, unrelated_secret: 'hidden' });
  const response = await handler(request());
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: true, data: { enabled: true, emailVerification: true, webRequired: false, userAgreement: false, privacyPolicy: false } });
});

test('registration uses the fixed platform and affiliation without forwarding tokens', async () => {
  const { handler, calls } = fixture();
  const response = await handler(request({ ...account, aff_code: 'override', baseUrl: 'https://other.test', accessToken: 'private' }));
  assert.equal((await response.json()).ok, true);
  assert.equal(calls[1].url, 'https://ai.bileego.com/api/user/register');
  assert.deepEqual(JSON.parse(calls[1].init.body), { username: account.username, password: account.password, email: account.email, verification_code: '123456', aff_code: 'VzYr' });
  assert.equal(calls[1].init.headers.authorization, undefined);
  assert.equal(calls[1].init.redirect, 'error');
  assert.ok(calls[1].init.signal instanceof AbortSignal);
});

test('verification email is encoded and sent only on explicit request', async () => {
  const { handler, calls } = fixture();
  await handler(request({ action: 'send-code', email: 'example+test@example.com' }));
  assert.equal(calls[1].url, 'https://ai.bileego.com/api/verification?email=example%2Btest%40example.com');
  assert.equal(calls[1].init.method, 'GET');
});

test('missing verification and invalid passwords never reach registration upstream', async () => {
  for (const body of [{ ...account, verification_code: '' }, { ...account, password: 'short' }]) {
    const { handler, calls } = fixture();
    assert.equal((await (await handler(request(body))).json()).ok, false);
    assert.equal(calls.length, 1);
  }
});

test('additional verification and closed registration fall back to web registration', async () => {
  for (const config of [{ ...settings, turnstile_check: true }, { ...settings, register_enabled: false }]) {
    const { handler, calls } = fixture(config);
    const payload = await (await handler(request(account))).json();
    assert.equal(payload.error.code, 'WEB_REGISTRATION_REQUIRED');
    assert.equal(calls.length, 1);
  }
});

test('upstream responses never echo submitted credentials or account details', async () => {
  const { handler } = fixture(settings, { success: false, message: account.password });
  const response = await handler(request(account));
  assert.equal((await response.text()).includes(account.password), false);
  const unavailable = createRegistrationHandler({ fetchImpl: async () => { throw new Error(account.password); } });
  assert.equal((await (await unavailable(request())).text()).includes(account.password), false);
});

 test('legal terms allow inline registration after explicit acceptance', async () => {
  const { handler, calls } = fixture({ ...settings, user_agreement_enabled: true, privacy_policy_enabled: true });
  const config = await (await handler(request())).json();
  assert.equal(config.data.webRequired, false);
  assert.equal(config.data.userAgreement, true);
  assert.equal((await (await handler(request(account))).json()).error.code, 'TERMS_REQUIRED');
  assert.equal((await (await handler(request({ ...account, acceptedTerms: true }))).json()).ok, true);
  assert.equal(calls.filter(call => call.url.endsWith('/api/user/register')).length, 1);
});
