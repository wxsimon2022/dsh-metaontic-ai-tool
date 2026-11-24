import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { USER_AGENT } from './constants.js';
import { resolveStorageDirectory } from './login-store.js';
import type { LoginReporter } from './handlers.js';
import type { LoginStoreOptions } from './types.js';

const ENDPOINT = 'https://ai.mybfs.cn/api/v1/newapi-login/events';

export function createLoginReporter(
  options: LoginStoreOptions & { fetchImpl?: typeof fetch } = {},
): LoginReporter {
  let state: { enabled: boolean; installationId: string } | undefined;
  let directory: string;
  let loading: Promise<void> | undefined;
  async function load(): Promise<void> {
    loading ??= (async () => {
      directory = options.directory || await resolveStorageDirectory({
        ctx: options.ctx, moduleUrl: options.moduleUrl || import.meta.url,
      });
      await mkdir(directory, { recursive: true, mode: 0o700 });
      try {
        const saved = JSON.parse(await readFile(join(directory, 'login-statistics.json'), 'utf8'));
        if (typeof saved.enabled === 'boolean' && /^[a-f0-9-]{36}$/.test(saved.installationId)) {
          state = { enabled: saved.enabled, installationId: saved.installationId };
        }
      } catch { /* statistics are optional */ }
      state ??= { enabled: false, installationId: randomUUID() };
    })();
    await loading;
  }
  return {
    async configure(enabled) {
      await load();
      state!.enabled = enabled;
      await writeFile(join(directory, 'login-statistics.json'), JSON.stringify(state), { mode: 0o600 });
    },
    async report(kind) {
      try {
        await load();
        if (!state?.enabled) return;
        const response = await (options.fetchImpl || fetch)(ENDPOINT, {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(3000),
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            eventId: randomUUID(), installationId: state.installationId,
            kind, occurredAt: new Date().toISOString(),
            version: USER_AGENT.split('/')[1],
            platform: ['darwin', 'win32', 'linux'].includes(process.platform) ? process.platform : 'other',
          }),
        });
        await response.body?.cancel();
      } catch { /* reporting must never break login or expose request details */ }
    },
  };
}
