import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS } from './constants.js';
import { QueryError } from './errors.js';
import { endpoint, normalizeAccessToken, normalizeBaseUrl, pickFields, readJson, unwrap } from './http.js';
import type { QueryOptions } from './types.js';

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

export type QueryFunction = (options: QueryOptions) => Promise<QueryResult>;

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
