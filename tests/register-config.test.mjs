import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

 test('registration preloading shares requests, caches briefly, and retries failures', async () => {
  const { outputFiles } = await build({ entryPoints: ['src/client/register-config.ts'], bundle: true, format: 'esm', write: false });
  const config = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = 1000;
  let calls = 0;
  let fail = false;
  const data = { enabled: true, emailVerification: true, webRequired: false, userAgreement: true, privacyPolicy: true };
  globalThis.fetch = async () => {
    calls++;
    if (fail) throw new Error('offline');
    return Response.json({ ok: true, data });
  };
  Date.now = () => now;
  try {
    assert.equal(config.cachedRegisterConfig(), null);
    await Promise.all([config.loadRegisterConfig(), config.loadRegisterConfig()]);
    assert.equal(calls, 1);
    assert.deepEqual(config.cachedRegisterConfig(), data);
    await config.loadRegisterConfig();
    assert.equal(calls, 1);
    now += 60_001;
    assert.equal(config.cachedRegisterConfig(), null);
    fail = true;
    await assert.rejects(config.loadRegisterConfig(), /offline/);
    fail = false;
    await config.loadRegisterConfig();
    assert.equal(calls, 3);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
});
