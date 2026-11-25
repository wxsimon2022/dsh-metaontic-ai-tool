import { randomUUID } from 'node:crypto';
import { link, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { USER_AGENT } from './constants.js';
import { resolveStorageDirectory } from './login-store.js';
import type { LoginReporter } from './handlers.js';
import type { LoginStoreOptions } from './types.js';

const ENDPOINT = 'https://ai.mybfs.cn/api/v1/newapi-login/events';
const UUID = /^[a-f0-9-]{36}$/;

// Publish a complete ID atomically, so concurrent profiles never read an empty file.
async function persistentId(directory: string, name: string): Promise<string> {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const path = join(directory, name);
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, randomUUID(), { mode: 0o600 });
    try {
      await link(temporary, path);
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'EEXIST') throw error;
    }
    const value = (await readFile(path, 'utf8')).trim();
    if (!UUID.test(value)) throw new Error('Invalid anonymous ID');
    return value;
  } finally {
    await unlink(temporary).catch(() => {});
  }
}

export function createLoginReporter(
  options: LoginStoreOptions & {
    fetchImpl?: typeof fetch; deviceDirectory?: string; installationDirectory?: string;
  } = {},
): LoginReporter {
  let state: { enabled: boolean } | undefined;
  let directory: string;
  let loading: Promise<void> | undefined;
  let pending: Promise<void> | undefined;
  const installationDirectory = options.installationDirectory || join(
    dirname(fileURLToPath(options.moduleUrl || import.meta.url)), '..', '..', '.anonymous-login',
  );
  async function load(): Promise<void> {
    loading ??= (async () => {
      directory = options.directory || await resolveStorageDirectory({
        ctx: options.ctx, moduleUrl: options.moduleUrl || import.meta.url,
      });
      await mkdir(directory, { recursive: true, mode: 0o700 });
      try {
        const saved = JSON.parse(await readFile(join(directory, 'login-statistics.json'), 'utf8'));
        if (typeof saved.enabled === 'boolean') state = { enabled: saved.enabled };
      } catch { /* statistics are optional */ }
      state ??= { enabled: false };
    })();
    await loading;
  }
  async function reportOnce(kind: 'open' | 'login' | 'restore'): Promise<void> {
    try {
      await load();
      if (!state?.enabled) return;
      const installationId = await persistentId(installationDirectory, 'installation-id');
      const sentFile = join(installationDirectory, 'reported');
      try { if ((await readFile(sentFile, 'utf8')).trim() === installationId) return; } catch { /* not reported */ }
      const deviceId = await persistentId(
        options.deviceDirectory || join(homedir(), '.dsh-metaontic-newapi-lite'), 'anonymous-device-id',
      );
      if (!state.enabled) return;
      const response = await (options.fetchImpl || fetch)(ENDPOINT, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(3000),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          eventId: installationId, installationId, deviceId, kind,
          occurredAt: new Date().toISOString(), version: USER_AGENT.split('/')[1],
          platform: ['darwin', 'win32', 'linux'].includes(process.platform) ? process.platform : 'other',
        }),
      });
      // Only mark delivery after an accepted (or already deduplicated) server response.
      const payload = await response.json() as { code?: number; data?: { accepted?: number; disabled?: boolean } };
      if (response.ok && payload.code === 0 && !payload.data?.disabled
        && (payload.data?.accepted === 0 || payload.data?.accepted === 1)) {
        await writeFile(sentFile, installationId, { mode: 0o600 });
      }
    } catch { /* reporting must never break login or expose request details */ }
  }
  return {
    async configure(enabled) {
      await load();
      state!.enabled = enabled;
      await writeFile(join(directory, 'login-statistics.json'), JSON.stringify(state), { mode: 0o600 });
    },
    report(kind) {
      pending ??= reportOnce(kind).finally(() => { pending = undefined; });
      return pending;
    },
  };
}
