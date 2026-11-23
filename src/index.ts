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
] as const;

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
] as const;

type PlatformField = (typeof PLATFORM_FIELDS)[number];
type AccountField = (typeof ACCOUNT_FIELDS)[number];

export type PlatformInfo = Partial<Record<PlatformField, unknown>>;
export type AccountInfo = Partial<Record<AccountField, unknown>>;

export interface QueryResult {
  baseUrl: string;
  fetchedAt: string;
  platform: PlatformInfo;
  account: AccountInfo;
}

export interface QueryOptions {
  baseUrl?: unknown;
  accessToken?: unknown;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export type QueryFunction = (options: QueryOptions) => Promise<QueryResult>;

interface ReadJsonOptions {
  accessToken?: string;
  fetchImpl: typeof fetch;
  timeoutMs: number;
}

interface SettingsService {
  documentPath?: unknown;
}

interface FetchRoute {
  path: string;
  methods: string[];
  requestBody: 'buffered';
  fetch: (request: Request) => Promise<Response>;
}

export interface PluginContext {
  settings?: SettingsService;
  configEditor?: SettingsService;
  get?: (name: string) => SettingsService | undefined;
  logger?: { warn?: (message: string) => void };
  connection?: {
    fetch?: {
      register?: (route: FetchRoute) => (() => void) | void;
    };
  };
}

export interface LoginRecord {
  baseUrl: string;
  accessToken: string;
  savedAt?: string;
}

export interface LoginStore {
  save(baseUrl: unknown, accessToken: unknown): Promise<void>;
  load(): Promise<LoginRecord | null>;
  clear(): Promise<void>;
}

interface LoginStoreOptions {
  ctx?: PluginContext;
  directory?: string;
  moduleUrl?: string;
}

interface QueryHandlerOptions {
  store?: LoginStore | null;
  query?: QueryFunction;
}

interface SessionHandlerOptions {
  store?: LoginStore | null;
  query?: QueryFunction;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasErrorCode(value: unknown): value is { code?: string } {
  return isRecord(value) && 'code' in value;
}

export class QueryError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'QueryError';
    this.code = code;
    this.status = status;
  }
}

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

function endpoint(baseUrl: string, path: string): string {
  return new URL(path.replace(/^\/+/, ''), `${baseUrl}/`).toString();
}

function pickFields<T extends string>(value: unknown, fields: readonly T[]): Partial<Record<T, unknown>> {
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

function unwrap(payload: unknown): unknown {
  if (isRecord(payload) && payload.success === false) {
    throw new QueryError('UPSTREAM_REJECTED', upstreamMessage(payload) || '平台拒绝了查询请求。', 502);
  }
  return isRecord(payload) && payload.data !== undefined ? payload.data : payload;
}

async function readJson(url: string, { accessToken, fetchImpl, timeoutMs }: ReadJsonOptions): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {
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

export async function queryPlatform(options: QueryOptions = {}): Promise<QueryResult> {
  const {
    baseUrl = DEFAULT_BASE_URL,
    accessToken,
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;
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

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function defaultProfileDirectory(moduleUrl: string): Promise<string | null> {
  let current = dirname(fileURLToPath(moduleUrl));
  for (let depth = 0; depth < 8; depth += 1) {
    if (await exists(join(current, 'cordis.patch.yml'))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

async function resolveStorageDirectory({ ctx, moduleUrl }: { ctx?: PluginContext; moduleUrl: string }): Promise<string> {
  const candidates: unknown[] = [];
  try { candidates.push(ctx?.settings?.documentPath); } catch { /* optional service */ }
  try { candidates.push(ctx?.configEditor?.documentPath); } catch { /* optional service */ }
  try { candidates.push(ctx?.get?.('settings')?.documentPath); } catch { /* optional service */ }
  try { candidates.push(ctx?.get?.('configEditor')?.documentPath); } catch { /* optional service */ }
  const documentPath = candidates.find((value): value is string => typeof value === 'string' && value.length > 0);
  if (documentPath) return join(dirname(documentPath), STORAGE_DIR_NAME);
  const profileDirectory = await defaultProfileDirectory(moduleUrl);
  if (profileDirectory) return join(profileDirectory, STORAGE_DIR_NAME);
  throw new QueryError('STORAGE_UNAVAILABLE', '无法确定本机登录信息的保存位置。', 500);
}

export function createLoginStore({ ctx, directory, moduleUrl = import.meta.url }: LoginStoreOptions = {}): LoginStore {
  let directoryPromise: Promise<string> | undefined;

  function storageDirectory(): Promise<string> {
    if (directory) return Promise.resolve(directory);
    directoryPromise ??= (async () => {
      const resolved = await resolveStorageDirectory({ ctx, moduleUrl });
      await mkdir(resolved, { recursive: true, mode: 0o700 });
      return resolved;
    })();
    return directoryPromise;
  }

  async function filePath(): Promise<string> {
    return join(await storageDirectory(), STORAGE_FILE_NAME);
  }

  return {
    async save(baseUrl: unknown, accessToken: unknown): Promise<void> {
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

    async load(): Promise<LoginRecord | null> {
      try {
        const text = await readFile(await filePath(), 'utf8');
        const saved: unknown = JSON.parse(text);
        if (!isRecord(saved)) return null;
        return {
          baseUrl: normalizeBaseUrl(saved?.baseUrl),
          accessToken: normalizeAccessToken(saved?.accessToken),
          savedAt: typeof saved?.savedAt === 'string' ? saved.savedAt : undefined,
        };
      } catch {
        return null;
      }
    },

    async clear() {
      try {
        await unlink(await filePath());
      } catch (error) {
        if (!hasErrorCode(error) || error.code !== 'ENOENT') throw error;
      }
    },
  };
}

async function readRequestBody(request: Request): Promise<unknown> {
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

function errorResponse(error: unknown, data?: unknown): Response {
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

export function createQueryHandler({ store, query = queryPlatform }: QueryHandlerOptions = {}) {
  return async function handleQueryRequest(request: Request): Promise<Response> {
    try {
      const body = await readRequestBody(request);
      const payload: QueryOptions = isRecord(body)
        ? { baseUrl: body.baseUrl, accessToken: body.accessToken }
        : {};
      const data = await query(payload);
      let persisted = false;
      if (store) {
        try {
          await store.save(data.baseUrl, payload.accessToken);
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

export function createSessionHandler({ store, query = queryPlatform }: SessionHandlerOptions = {}) {
  return async function handleSessionRequest(request: Request): Promise<Response> {
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

export function apply(ctx: PluginContext): (() => void) | undefined {
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
