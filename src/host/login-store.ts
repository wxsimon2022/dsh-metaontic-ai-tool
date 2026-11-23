import { access, chmod, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORAGE_DIR_NAME, STORAGE_FILE_NAME } from './constants.js';
import { hasErrorCode, isRecord, QueryError } from './errors.js';
import { normalizeAccessToken, normalizeBaseUrl } from './http.js';
import type { LoginRecord, LoginStore, LoginStoreOptions, PluginContext } from './types.js';

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
