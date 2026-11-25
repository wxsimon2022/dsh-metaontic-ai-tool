import { REGISTER_PATH } from './constants.js';

export interface RegisterConfig {
  enabled: boolean;
  emailVerification: boolean;
  webRequired: boolean;
  userAgreement: boolean;
  privacyPolicy: boolean;
}

const CACHE_MS = 60_000;
let cached: { data: RegisterConfig; expiresAt: number } | undefined;
let pending: Promise<RegisterConfig> | undefined;

export function cachedRegisterConfig(): RegisterConfig | null {
  return cached && cached.expiresAt > Date.now() ? cached.data : null;
}

export function loadRegisterConfig(): Promise<RegisterConfig> {
  const data = cachedRegisterConfig();
  if (data) return Promise.resolve(data);
  if (pending) return pending;
  pending = (async () => {
    const response = await fetch(REGISTER_PATH, { cache: 'no-store' });
    const payload = await response.json() as { ok?: boolean; data?: RegisterConfig };
    if (!response.ok || !payload.ok || !payload.data) throw new Error('Registration configuration unavailable');
    cached = { data: payload.data, expiresAt: Date.now() + CACHE_MS };
    return payload.data;
  })().finally(() => { pending = undefined; });
  return pending;
}
