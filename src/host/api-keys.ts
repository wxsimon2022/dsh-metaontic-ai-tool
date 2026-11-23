import { MAX_TOKEN_LENGTH } from './constants.js';
import { isRecord, QueryError } from './errors.js';
import { endpoint, pickFields, readJson, requestJson, unwrap, upstreamOptions } from './http.js';
import type { QueryOptions } from './types.js';

const API_KEY_FIELDS = [
  'id',
  'name',
  'status',
  'created_time',
  'accessed_time',
  'expired_time',
  'remain_quota',
  'unlimited_quota',
  'used_quota',
  'model_limits_enabled',
  'group',
] as const;

type ApiKeyField = (typeof API_KEY_FIELDS)[number];

export type ApiKeyInfo = Partial<Record<ApiKeyField, unknown>>;

export interface ApiKeyGroup {
  name: string;
  desc: string;
  ratio: number | null;
}

export interface CreateApiKeyOptions extends QueryOptions {
  name: unknown;
  unlimitedQuota?: unknown;
  remainQuota?: unknown;
  expiredTime?: unknown;
  group?: unknown;
}

export interface ApiKeyStatusOptions extends QueryOptions {
  id: unknown;
  status: unknown;
}

export interface ApiKeyDeleteOptions extends QueryOptions {
  id: unknown;
}

export interface ApiKeyRevealOptions extends QueryOptions {
  id: unknown;
}

function apiKeyId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new QueryError('INVALID_API_KEY_ID', 'API Key ID 无效。');
  }
  return id;
}

function apiKeyName(value: unknown): string {
  const name = String(value ?? '').trim();
  if (!name) throw new QueryError('API_KEY_NAME_REQUIRED', '请填写 API Key 名称。');
  if (name.length > 50 || /[\u0000-\u001f]/.test(name)) {
    throw new QueryError('INVALID_API_KEY_NAME', 'API Key 名称无效，最多 50 个字符。');
  }
  return name;
}

function apiKeyQuota(value: unknown): number {
  const quota = Number(value);
  if (!Number.isSafeInteger(quota) || quota < 0) {
    throw new QueryError('INVALID_API_KEY_QUOTA', 'API Key 额度必须是非负整数。');
  }
  return quota;
}

function apiKeyExpiredTime(value: unknown): number {
  if (value === undefined || value === null || value === '') return -1;
  const expiredTime = Number(value);
  if (!Number.isSafeInteger(expiredTime) || (expiredTime !== -1 && expiredTime <= 0)) {
    throw new QueryError('INVALID_API_KEY_EXPIRY', 'API Key 过期时间无效。');
  }
  return expiredTime;
}

function apiKeyGroup(value: unknown): string {
  const group = String(value ?? '').trim();
  if (group.length > 64 || /[\u0000-\u001f]/.test(group)) {
    throw new QueryError('INVALID_API_KEY_GROUP', 'API Key 分组无效。');
  }
  return group;
}

function mapApiKey(value: unknown): ApiKeyInfo | null {
  if (!isRecord(value)) return null;
  const id = Number(value.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return { ...pickFields(value, API_KEY_FIELDS), id };
}

function cleanGroupText(value: unknown, limit: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

function mapGroups(value: unknown): ApiKeyGroup[] {
  if (!isRecord(value)) return [];
  const groups: ApiKeyGroup[] = [];
  for (const [rawName, rawGroup] of Object.entries(value)) {
    if (!isRecord(rawGroup) || Array.isArray(rawGroup)) continue;
    const name = cleanGroupText(rawName, 64);
    if (!name || groups.some(group => group.name === name)) continue;
    const source = rawGroup;
    const ratio = Number(source.ratio);
    groups.push({
      name,
      desc: cleanGroupText(source.desc, 120),
      ratio: Number.isFinite(ratio) && ratio >= 0 ? ratio : null,
    });
    if (groups.length >= 50) break;
  }
  return groups;
}

async function listGroups(upstream: ReturnType<typeof upstreamOptions>): Promise<ApiKeyGroup[]> {
  try {
    const payload = await readJson(endpoint(upstream.baseUrl, 'api/user/self/groups'), upstream);
    return mapGroups(unwrap(payload));
  } catch {
    return [];
  }
}

export async function listApiKeys(options: QueryOptions = {}): Promise<{ keys: ApiKeyInfo[]; total: number; groups: ApiKeyGroup[] }> {
  const upstream = upstreamOptions(options);
  const [payload, groups] = await Promise.all([
    readJson(endpoint(upstream.baseUrl, 'api/token/?p=0&size=100'), upstream),
    listGroups(upstream),
  ]);
  const data = unwrap(payload);
  if (!isRecord(data) || !Array.isArray(data.items)) {
    throw new QueryError('INVALID_RESPONSE', '平台返回的 API Key 列表不完整。', 502);
  }
  const keys = data.items.map(mapApiKey).filter((key): key is ApiKeyInfo => key !== null);
  const total = Number(data.total);
  return { keys, total: Number.isSafeInteger(total) && total >= 0 ? total : keys.length, groups };
}

export async function createApiKey(options: CreateApiKeyOptions): Promise<{ created: true; name: string }> {
  const upstream = upstreamOptions(options);
  const unlimitedQuota = options.unlimitedQuota === undefined ? true : Boolean(options.unlimitedQuota);
  const remainQuota = unlimitedQuota ? 0 : apiKeyQuota(options.remainQuota);
  const group = apiKeyGroup(options.group);
  const body: Record<string, unknown> = {
    name: apiKeyName(options.name),
    remain_quota: remainQuota,
    unlimited_quota: unlimitedQuota,
    expired_time: apiKeyExpiredTime(options.expiredTime),
    model_limits_enabled: false,
    model_limits: '',
    allow_ips: '',
    cross_group_retry: false,
  };
  if (group) body.group = group;
  const payload = await requestJson(endpoint(upstream.baseUrl, 'api/token/'), {
    ...upstream,
    method: 'POST',
    body,
  });
  unwrap(payload);
  return { created: true, name: String(body.name) };
}

export async function setApiKeyStatus(options: ApiKeyStatusOptions): Promise<{ id: number; status: number }> {
  const upstream = upstreamOptions(options);
  const id = apiKeyId(options.id);
  const status = Number(options.status);
  if (status !== 1 && status !== 2) {
    throw new QueryError('INVALID_API_KEY_STATUS', 'API Key 状态无效。');
  }
  const payload = await requestJson(endpoint(upstream.baseUrl, 'api/token/?status_only=true'), {
    ...upstream,
    method: 'PUT',
    body: { id, status },
  });
  unwrap(payload);
  return { id, status };
}

export async function deleteApiKey(options: ApiKeyDeleteOptions): Promise<{ id: number; deleted: true }> {
  const upstream = upstreamOptions(options);
  const id = apiKeyId(options.id);
  const payload = await requestJson(endpoint(upstream.baseUrl, `api/token/${id}`), {
    ...upstream,
    method: 'DELETE',
  });
  unwrap(payload);
  return { id, deleted: true };
}

export async function revealApiKey(options: ApiKeyRevealOptions): Promise<{ id: number; key: string }> {
  const upstream = upstreamOptions(options);
  const id = apiKeyId(options.id);
  const payload = await requestJson(endpoint(upstream.baseUrl, `api/token/${id}/key`), {
    ...upstream,
    method: 'POST',
  });
  const data = unwrap(payload);
  const rawKey = isRecord(data) ? data.key : undefined;
  const key = typeof rawKey === 'string' ? rawKey.trim() : '';
  const normalizedKey = key.startsWith('sk-') ? key : `sk-${key}`;
  if (!key || /\s/.test(key) || normalizedKey.length > MAX_TOKEN_LENGTH) {
    throw new QueryError('INVALID_RESPONSE', '平台返回的 API Key 无效。', 502);
  }
  return { id, key: normalizedKey };
}
