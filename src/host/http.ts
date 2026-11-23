import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  MAX_REQUEST_BYTES,
  MAX_TOKEN_LENGTH,
  USER_AGENT,
} from './constants.js';
import { isRecord, QueryError } from './errors.js';
import type { QueryOptions, RequestJsonOptions } from './types.js';

export function normalizeBaseUrl(value: unknown): string {
  const raw = String(value ?? DEFAULT_BASE_URL).trim() || DEFAULT_BASE_URL;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new QueryError('INVALID_BASE_URL', '平台地址格式无效。');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new QueryError('INVALID_BASE_URL', '平台地址必须使用 HTTP 或 HTTPS。');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new QueryError('INVALID_BASE_URL', '平台地址不能包含账号、查询参数或锚点。');
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString().replace(/\/$/, '');
}

export function normalizeAccessToken(value: unknown): string {
  const token = String(value ?? '').trim().replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new QueryError('TOKEN_REQUIRED', '请填写访问令牌。');
  if (token.length > MAX_TOKEN_LENGTH || /\s/.test(token)) {
    throw new QueryError('INVALID_TOKEN', '访问令牌格式无效。');
  }
  return token;
}

export function endpoint(baseUrl: string, path: string): string {
  return new URL(path.replace(/^\/+/, ''), `${baseUrl}/`).toString();
}

export function pickFields<T extends string>(value: unknown, fields: readonly T[]): Partial<Record<T, unknown>> {
  const source = isRecord(value) ? value : {};
  const result: Partial<Record<T, unknown>> = {};
  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null) result[field] = source[field];
  }
  return result;
}

function upstreamMessage(value: unknown): string {
  const payload = isRecord(value) ? value : {};
  const nestedError = isRecord(payload.error) ? payload.error : {};
  const message = payload.message ?? nestedError.message;
  return String(message || '')
    .replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

export function unwrap(payload: unknown): unknown {
  assertUpstreamSuccess(payload);
  return isRecord(payload) && payload.data !== undefined ? payload.data : payload;
}

export function assertUpstreamSuccess(payload: unknown): void {
  if (isRecord(payload) && payload.success === false) {
    throw new QueryError('UPSTREAM_REJECTED', upstreamMessage(payload) || '平台拒绝了查询请求。', 502);
  }
}

export async function requestJson(url: string, {
  accessToken,
  fetchImpl,
  timeoutMs,
  method = 'GET',
  body,
}: RequestJsonOptions): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {
    accept: 'application/json',
    'user-agent': USER_AGENT,
  };
  if (accessToken) headers.authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers['content-type'] = 'application/json';

  const init: RequestInit = {
    method,
    headers,
    redirect: 'error',
    signal: controller.signal,
  };
  if (body !== undefined) init.body = JSON.stringify(body);

  try {
    const response = await fetchImpl(url, init);
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      throw new QueryError('INVALID_RESPONSE', '平台返回了无法识别的响应。', 502);
    }
    if (!response.ok) {
      const authFailure = response.status === 401 || response.status === 403;
      const message = authFailure
        ? '访问令牌无效、已过期或权限不足。'
        : upstreamMessage(payload) || `平台请求失败（HTTP ${response.status}）。`;
      const code = authFailure ? 'AUTH_FAILED' : response.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_ERROR';
      throw new QueryError(code, message, authFailure ? 401 : response.status === 429 ? 429 : 502);
    }
    return payload;
  } catch (error) {
    if (error instanceof QueryError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new QueryError('TIMEOUT', '平台响应超时，请稍后重试。', 504);
    }
    throw new QueryError('NETWORK_ERROR', '无法连接平台，请检查平台地址和网络。', 502);
  } finally {
    clearTimeout(timer);
  }
}

export async function readJson(url: string, options: RequestJsonOptions): Promise<unknown> {
  return requestJson(url, { ...options, method: 'GET', body: undefined });
}

export function upstreamOptions(options: QueryOptions) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    throw new QueryError('NETWORK_ERROR', '当前运行环境不支持网络请求。', 502);
  }
  return {
    baseUrl: normalizeBaseUrl(options.baseUrl),
    accessToken: normalizeAccessToken(options.accessToken),
    fetchImpl,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
}

export async function readRequestBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers?.get?.('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new QueryError('INVALID_REQUEST', '请求内容过大。');
  }
  const text = await request.text();
  if (!text || Buffer.byteLength(text, 'utf8') > MAX_REQUEST_BYTES) {
    throw new QueryError('INVALID_REQUEST', '请求内容为空或过大。');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new QueryError('INVALID_REQUEST', '请求内容不是有效的 JSON。');
  }
}

export function errorResponse(error: unknown, data?: unknown): Response {
  const failure = error instanceof QueryError
    ? error
    : new QueryError('INTERNAL_ERROR', '操作失败。', 500);
  return Response.json({
    ok: false,
    error: { code: failure.code, message: failure.message },
    ...(data === undefined ? {} : { data }),
  }, {
    status: failure.status,
    headers: { 'cache-control': 'no-store' },
  });
}
