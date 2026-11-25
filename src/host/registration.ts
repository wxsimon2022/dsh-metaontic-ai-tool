import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS } from './constants.js';
import { isRecord, QueryError } from './errors.js';
import { endpoint, errorResponse, readRequestBody, requestJson } from './http.js';

interface RegistrationOptions { fetchImpl?: typeof fetch; }

export function createRegistrationHandler({ fetchImpl = fetch }: RegistrationOptions = {}) {
  async function call(path: string, body?: unknown) {
    try {
      return await requestJson(endpoint(DEFAULT_BASE_URL.replace(/\/+$/, ''), path), {
        fetchImpl, timeoutMs: DEFAULT_TIMEOUT_MS,
        method: body === undefined ? 'GET' : 'POST', body,
      });
    } catch (error) {
      if (error instanceof QueryError && error.code === 'RATE_LIMITED') {
        throw new QueryError('RATE_LIMITED', '请求过于频繁，请稍后重试。', 429);
      }
      throw new QueryError('REGISTRATION_UNAVAILABLE', '注册服务暂不可用，请稍后重试或使用网页注册。', 502);
    }
  }
  async function config() {
    const payload = await call('api/status');
    if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) {
      throw new QueryError('REGISTRATION_UNAVAILABLE', '无法读取注册配置，请使用网页注册。', 502);
    }
    const data = payload.data;
    return {
      enabled: data.register_enabled === true && data.password_register_enabled === true,
      emailVerification: data.email_verification === true,
      webRequired: data.turnstile_check === true,
      userAgreement: data.user_agreement_enabled === true,
      privacyPolicy: data.privacy_policy_enabled === true,
    };
  }
  return async (request: Request): Promise<Response> => {
    try {
      const settings = await config();
      if (request.method === 'GET') return Response.json({ ok: true, data: settings }, { headers: { 'cache-control': 'no-store' } });
      if (!settings.enabled || settings.webRequired) {
        throw new QueryError('WEB_REGISTRATION_REQUIRED', '请使用网页注册完成平台验证或协议确认。');
      }
      const body = await readRequestBody(request);
      if (!isRecord(body)) throw new QueryError('INVALID_REQUEST', '注册参数无效。');
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new QueryError('INVALID_EMAIL', '请填写有效的邮箱地址。');
      }
      if ((settings.userAgreement || settings.privacyPolicy) && body.acceptedTerms !== true) {
        throw new QueryError('TERMS_REQUIRED', '请先阅读并同意用户协议和隐私政策。');
      }
      let result: unknown;
      if (body.action === 'send-code') {
        if (!settings.emailVerification) throw new QueryError('INVALID_REQUEST', '平台未启用邮箱验证。');
        result = await call(`api/verification?email=${encodeURIComponent(email)}`);
      } else if (body.action === 'register') {
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const code = typeof body.verification_code === 'string' ? body.verification_code.trim() : '';
        if (!username || username.length > 20 || /\s/.test(username)) throw new QueryError('INVALID_USERNAME', '用户名应为 1–20 个非空白字符。');
        if (password.length < 8 || password.length > 128) throw new QueryError('INVALID_PASSWORD', '密码长度应为 8–128 个字符。');
        if (settings.emailVerification && (!code || code.length > 32)) throw new QueryError('INVALID_VERIFICATION_CODE', '请填写邮箱验证码。');
        result = await call('api/user/register', {
          username, password, email, verification_code: code, aff_code: 'VzYr',
        });
      } else throw new QueryError('INVALID_REQUEST', '未知注册操作。');
      if (!isRecord(result) || result.success !== true) {
        // Never echo upstream messages: they may contain submitted account fields.
        throw new QueryError('REGISTRATION_REJECTED', body.action === 'send-code'
          ? '验证码发送失败，请确认邮箱或稍后使用网页注册。'
          : '注册未成功，请检查用户名、邮箱和验证码，或使用网页注册。');
      }
      return Response.json({ ok: true, data: { succeeded: true } }, { headers: { 'cache-control': 'no-store' } });
    } catch (error) { return errorResponse(error); }
  };
}
