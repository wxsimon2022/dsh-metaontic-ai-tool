import {
  API_KEYS_ROUTE,
  MODELS_ROUTE,
  QUERY_ROUTE,
  SESSION_ROUTE,
  SUBSCRIPTION_ROUTE,
  TOPUP_ROUTE,
} from './host/constants.js';
import {
  createApiKeysHandler,
  createModelsHandler,
  createQueryHandler,
  createSessionHandler,
  createSubscriptionHandler,
  createTopupHandler,
} from './host/handlers.js';
import { createLoginReporter } from './host/login-reporter.js';
import { createLoginStore } from './host/login-store.js';
import type { PluginContext } from './host/types.js';

export { QueryError } from './host/errors.js';
export { normalizeAccessToken, normalizeBaseUrl } from './host/http.js';
export { queryPlatform } from './host/platform.js';
export type { AccountInfo, PlatformInfo, QueryFunction, QueryResult } from './host/platform.js';
export type {
  LoginRecord,
  LoginStore,
  LoginStoreOptions,
  PluginContext,
  QueryOptions,
} from './host/types.js';
export { createLoginStore } from './host/login-store.js';
export {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  revealApiKey,
  setApiKeyStatus,
} from './host/api-keys.js';
export type {
  ApiKeyDeleteOptions,
  ApiKeyInfo,
  ApiKeyRevealOptions,
  ApiKeyStatusOptions,
  CreateApiKeyOptions,
} from './host/api-keys.js';
export { createTopup, getTopupInfo } from './host/topup.js';
export type {
  CreateTopupOptions,
  TopupInfo,
  TopupPayment,
  TopupPaymentMethod,
} from './host/topup.js';
export { createSubscriptionPayment, getSubscriptionInfo } from './host/subscription.js';
export type {
  CreateSubscriptionOptions,
  SubscriptionInfo,
  SubscriptionPayment,
  SubscriptionPlan,
  SubscriptionRecord,
} from './host/subscription.js';
export { listModels } from './host/models.js';
export type { ModelCatalog, ModelInfo } from './host/models.js';
export {
  createApiKeysHandler,
  createModelsHandler,
  createQueryHandler,
  createSessionHandler,
  createSubscriptionHandler,
  createTopupHandler,
} from './host/handlers.js';
export type {
  ApiKeyHandlerOptions,
  ModelHandlerOptions,
  QueryHandlerOptions,
  SessionHandlerOptions,
  SubscriptionHandlerOptions,
  TopupHandlerOptions,
} from './host/handlers.js';

export const inject = ['connection'];

export function apply(ctx: PluginContext): (() => void) | undefined {
  const connectionFetch = ctx.connection?.fetch;
  if (!connectionFetch?.register) {
    ctx.logger?.warn?.('[dsh-metaontic-newapi-lite] connection.fetch is unavailable');
    return;
  }
  const store = createLoginStore({ ctx });
  const reporter = createLoginReporter({ ctx });
  const disposers = [
    connectionFetch.register({
      path: QUERY_ROUTE,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: createQueryHandler({ store, reporter }),
    }),
    connectionFetch.register({
      path: SESSION_ROUTE,
      methods: ['GET', 'DELETE'],
      requestBody: 'buffered',
      fetch: createSessionHandler({ store, reporter }),
    }),
    connectionFetch.register({
      path: API_KEYS_ROUTE,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
      requestBody: 'buffered',
      fetch: createApiKeysHandler({ store }),
    }),
    connectionFetch.register({
      path: TOPUP_ROUTE,
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: createTopupHandler({ store }),
    }),
    connectionFetch.register({
      path: SUBSCRIPTION_ROUTE,
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: createSubscriptionHandler({ store }),
    }),
    connectionFetch.register({
      path: MODELS_ROUTE,
      methods: ['GET'],
      requestBody: 'buffered',
      fetch: createModelsHandler({ store }),
    }),
  ];
  return () => {
    for (const dispose of disposers) {
      try { dispose?.(); } catch { /* continue cleanup */ }
    }
  };
}
