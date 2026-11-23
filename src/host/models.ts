import { isRecord, QueryError } from './errors.js';
import { endpoint, readJson, unwrap, upstreamOptions } from './http.js';
import type { QueryOptions } from './types.js';

const MAX_MODELS = 100;
const MAX_GROUPS = 40;

export interface ModelInfo {
  name: string;
  description: string;
  tags: string[];
  icon: string;
  groups: string[];
  endpoints: string[];
  ratio: number | null;
  price: number | null;
  completionRatio: number | null;
}

export interface ModelCatalog {
  models: ModelInfo[];
  groups: string[];
}

function cleanText(value: unknown, limit: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

function cleanList(value: unknown, limit: number, itemLimit: number): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    const text = cleanText(item, itemLimit);
    if (!text || result.includes(text)) continue;
    result.push(text);
    if (result.length >= limit) break;
  }
  return result;
}

function tagList(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return cleanList(value.split(','), 12, 24);
}

function finiteNumber(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function mapModel(value: unknown): ModelInfo | null {
  if (!isRecord(value)) return null;
  const name = cleanText(value.model_name, 120);
  if (!name) return null;
  return {
    name,
    description: cleanText(value.description, 500),
    tags: tagList(value.tags),
    icon: cleanText(value.icon, 64),
    groups: cleanList(value.enable_groups, MAX_GROUPS, 64),
    endpoints: cleanList(value.supported_endpoint_types, 10, 32),
    ratio: finiteNumber(value.model_ratio),
    price: finiteNumber(value.model_price),
    completionRatio: finiteNumber(value.completion_ratio),
  };
}

export async function listModels(options: QueryOptions = {}): Promise<ModelCatalog> {
  const upstream = upstreamOptions(options);
  const payload = await readJson(endpoint(upstream.baseUrl, 'api/pricing'), upstream);
  const data = isRecord(payload) && Array.isArray(payload.data) ? payload.data : unwrap(payload);
  if (!Array.isArray(data)) {
    throw new QueryError('INVALID_RESPONSE', '平台返回的模型列表不完整。', 502);
  }

  const groups = new Set<string>();
  const models: ModelInfo[] = [];
  const seen = new Set<string>();
  for (const item of data) {
    const model = mapModel(item);
    if (!model || seen.has(model.name)) continue;
    seen.add(model.name);
    models.push(model);
    for (const group of model.groups) groups.add(group);
    if (models.length >= MAX_MODELS) break;
  }

  models.sort((left, right) => left.name.localeCompare(right.name, 'en'));
  return {
    models,
    groups: [...groups].sort((left, right) => left.localeCompare(right, 'en')),
  };
}
