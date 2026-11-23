import { access, chmod, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUERY_ROUTE = '/api/dsh-metaontic-ai-tool.query';
const SESSION_ROUTE = '/api/dsh-metaontic-ai-tool.session';
const DEFAULT_BASE_URL = 'https://ai.bileego.com/';
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_TOKEN_LENGTH = 4096;
const STORAGE_DIR_NAME = '.dsh-metaontic-ai-tool';
const STORAGE_FILE_NAME = 'login.json';

const PLATFORM_FIELDS = [
  'system_name',
  'server_address',
  'version',
  'quota_per_unit',
  'quota_display_type',
  'usd_exchange_rate',
  'custom_currency_symbol',
  'custom_currency_exchange_rate',
  'display_in_currency',
  'price',
];

const ACCOUNT_FIELDS = [
  'id',
  'username',
  'display_name',
  'role',
  'status',
  'group',
  'quota',
  'used_quota',
  'request_count',
];

export class QueryError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'QueryError';
    this.code = code;
    this.status = status;
  }
}

export function normalizeBaseUrl(value) {
  const raw = String(value ?? DEFAULT_BASE_URL).trim() || DEFAULT_BASE_URL;
  let url;
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

export function normalizeAccessToken(value) {
  const token = String(value ?? '').trim().replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new QueryError('TOKEN_REQUIRED', '请填写访问令牌。');
  if (token.length > MAX_TOKEN_LENGTH || /\s/.test(token)) {
    throw new QueryError('INVALID_TOKEN', '访问令牌格式无效。');
  }
  return token;
}

function endpoint(baseUrl, path) {
  return new URL(path.replace(/^\/+/, ''), `${baseUrl}/`).toString();
}

function pickFields(value, fields) {
  const source = value && typeof value === 'object' ? value : {};
  const result = {};
  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null) result[field] = source[field];
  }
  return result;
}

function upstreamMessage(value) {
  const message = value && typeof value === 'object' ? value.message ?? value.error?.message : '';
  return String(message || '')
    .replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function unwrap(payload) {
  if (payload && typeof payload === 'object' && payload.success === false) {
    throw new QueryError('UPSTREAM_REJECTED', upstreamMessage(payload) || '平台拒绝了查询请求。', 502);
  }
  return payload && typeof payload === 'object' ? payload.data ?? payload : payload;
}

async function readJson(url, { accessToken, fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    accept: 'application/json',
    'user-agent': 'dsh-metaontic-ai-tool/0.1.0',
  };
  if (accessToken) headers.authorization = `Bearer ${accessToken}`;

  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers,
      redirect: 'error',
      signal: controller.signal,
    });
    const text = await response.text();
    let payload;
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
    if (error?.name === 'AbortError') {
      throw new QueryError('TIMEOUT', '平台响应超时，请稍后重试。', 504);
    }
    throw new QueryError('NETWORK_ERROR', '无法连接平台，请检查平台地址和网络。', 502);
  } finally {
    clearTimeout(timer);
  }
}

export async function queryPlatform({
  baseUrl = DEFAULT_BASE_URL,
  accessToken,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const normalizedToken = normalizeAccessToken(accessToken);
  if (typeof fetchImpl !== 'function') {
    throw new QueryError('NETWORK_ERROR', '当前运行环境不支持网络请求。', 502);
  }

  const [statusPayload, selfPayload] = await Promise.all([
    readJson(endpoint(normalizedBaseUrl, 'api/status'), { fetchImpl, timeoutMs }),
    readJson(endpoint(normalizedBaseUrl, 'api/user/self'), {
      accessToken: normalizedToken,
      fetchImpl,
      timeoutMs,
    }),
  ]);
  const platform = unwrap(statusPayload);
  const account = unwrap(selfPayload);
  if (!platform || typeof platform !== 'object' || !account || typeof account !== 'object') {
    throw new QueryError('INVALID_RESPONSE', '平台返回的数据不完整。', 502);
  }

  return {
    baseUrl: normalizedBaseUrl,
    fetchedAt: new Date().toISOString(),
    platform: pickFields(platform, PLATFORM_FIELDS),
    account: pickFields(account, ACCOUNT_FIELDS),
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function defaultProfileDirectory(moduleUrl) {
  let current = dirname(fileURLToPath(moduleUrl));
  for (let depth = 0; depth < 8; depth += 1) {
    if (await exists(join(current, 'cordis.patch.yml'))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

async function resolveStorageDirectory({ ctx, moduleUrl }) {
  const candidates = [];
  try { candidates.push(ctx?.settings?.documentPath); } catch { /* optional service */ }
  try { candidates.push(ctx?.configEditor?.documentPath); } catch { /* optional service */ }
  try { candidates.push(ctx?.get?.('settings')?.documentPath); } catch { /* optional service */ }
  try { candidates.push(ctx?.get?.('configEditor')?.documentPath); } catch { /* optional service */ }
  const documentPath = candidates.find(value => typeof value === 'string' && value);
  if (documentPath) return join(dirname(documentPath), STORAGE_DIR_NAME);
  const profileDirectory = await defaultProfileDirectory(moduleUrl);
  if (profileDirectory) return join(profileDirectory, STORAGE_DIR_NAME);
  throw new QueryError('STORAGE_UNAVAILABLE', '无法确定本机登录信息的保存位置。', 500);
}

export function createLoginStore({ ctx, directory, moduleUrl = import.meta.url } = {}) {
  let directoryPromise;
  function storageDirectory() {
    if (directory) return Promise.resolve(directory);
    directoryPromise ??= (async () => {
      const resolved = await resolveStorageDirectory({ ctx, moduleUrl });
      await mkdir(resolved, { recursive: true, mode: 0o700 });
      return resolved;
    })();
    return directoryPromise;
  }

  async function filePath() {
    return join(await storageDirectory(), STORAGE_FILE_NAME);
  }

  return {
    async save(baseUrl, accessToken) {
      const path = await filePath();
      const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
      const payload = JSON.stringify({
        version: 1,
        baseUrl: normalizeBaseUrl(baseUrl),
        accessToken: normalizeAccessToken(accessToken),
        savedAt: new Date().toISOString(),
      }, null, 2);
      try {
        await writeFile(temporary, payload, { mode: 0o600 });
        await chmod(temporary, 0o600);
        await rename(temporary, path);
        await chmod(path, 0o600);
      } finally {
        await unlink(temporary).catch(() => {});
      }
    },

    async load() {
      try {
        const text = await readFile(await filePath(), 'utf8');
        const saved = JSON.parse(text);
        return {
          baseUrl: normalizeBaseUrl(saved?.baseUrl),
          accessToken: normalizeAccessToken(saved?.accessToken),
          savedAt: typeof saved?.savedAt === 'string' ? saved.savedAt : undefined,
        };
      } catch (error) {
        if (error?.code === 'ENOENT') return null;
        return null;
      }
    },

    async clear() {
      try {
        await unlink(await filePath());
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    },
  };
}

async function readRequestBody(request) {
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

function errorResponse(error, data) {
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

export function createQueryHandler({ store, query = queryPlatform } = {}) {
  return async function handleQueryRequest(request) {
    try {
      const body = await readRequestBody(request);
      const data = await query({
        baseUrl: body?.baseUrl,
        accessToken: body?.accessToken,
      });
      let persisted = false;
      if (store) {
        try {
          await store.save(data.baseUrl, body.accessToken);
          persisted = true;
        } catch {
          persisted = false;
        }
      }
      return Response.json({ ok: true, data: { ...data, authenticated: true, persisted } }, {
        headers: { 'cache-control': 'no-store' },
      });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function createSessionHandler({ store, query = queryPlatform } = {}) {
  return async function handleSessionRequest(request) {
    try {
      if (request.method === 'DELETE') {
        if (store) await store.clear();
        return Response.json({ ok: true, data: { cleared: true } }, {
          headers: { 'cache-control': 'no-store' },
        });
      }

      const saved = store ? await store.load() : null;
      if (!saved) {
        return Response.json({
          ok: true,
          data: { authenticated: false, baseUrl: DEFAULT_BASE_URL },
        }, {
          headers: { 'cache-control': 'no-store' },
        });
      }

      try {
        const data = await query(saved);
        return Response.json({
          ok: true,
          data: { ...data, authenticated: true, persisted: true },
        }, {
          headers: { 'cache-control': 'no-store' },
        });
      } catch (error) {
        if (error instanceof QueryError && error.code === 'AUTH_FAILED' && store) {
          await store.clear().catch(() => {});
        }
        return errorResponse(error, {
          authenticated: false,
          baseUrl: saved.baseUrl,
          savedLoginInvalid: error instanceof QueryError && error.code === 'AUTH_FAILED',
        });
      }
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export const inject = ['connection'];

export function apply(ctx) {
  const connectionFetch = ctx.connection?.fetch;
  if (!connectionFetch?.register) {
    ctx.logger?.warn?.('[dsh-metaontic-ai-tool] connection.fetch is unavailable');
    return;
  }
  const store = createLoginStore({ ctx });
  const disposers = [
    connectionFetch.register({
      path: QUERY_ROUTE,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: createQueryHandler({ store }),
    }),
    connectionFetch.register({
      path: SESSION_ROUTE,
      methods: ['GET', 'DELETE'],
      requestBody: 'buffered',
      fetch: createSessionHandler({ store }),
    }),
  ];
  return () => {
    for (const dispose of disposers) {
      try { dispose?.(); } catch { /* continue cleanup */ }
    }
  };
}
