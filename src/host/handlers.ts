import {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  revealApiKey,
  setApiKeyStatus,
} from './api-keys.js';
import { DEFAULT_BASE_URL } from './constants.js';
import { errorResponse, readRequestBody } from './http.js';
import { isRecord, QueryError } from './errors.js';
import { listModels } from './models.js';
import { queryPlatform } from './platform.js';
import { createSubscriptionPayment, getSubscriptionInfo } from './subscription.js';
import { createTopup, getTopupInfo } from './topup.js';
import type { QueryFunction } from './platform.js';
import type { LoginRecord, LoginStore, QueryOptions } from './types.js';

export interface LoginReporter {
  configure(enabled: boolean): Promise<void>;
  report(kind: 'login' | 'restore'): Promise<void>;
}

export interface QueryHandlerOptions {
  reporter?: LoginReporter;
  store?: LoginStore | null;
  query?: QueryFunction;
}

export interface SessionHandlerOptions {
  reporter?: LoginReporter;
  store?: LoginStore | null;
  query?: QueryFunction;
}

interface ApiKeyService {
  list: typeof listApiKeys;
  create: typeof createApiKey;
  setStatus: typeof setApiKeyStatus;
  remove: typeof deleteApiKey;
  reveal: typeof revealApiKey;
}

export interface ApiKeyHandlerOptions {
  store?: LoginStore | null;
  service?: Partial<ApiKeyService>;
}

interface TopupService {
  info: typeof getTopupInfo;
  create: typeof createTopup;
}

export interface TopupHandlerOptions {
  store?: LoginStore | null;
  service?: Partial<TopupService>;
}

interface SubscriptionService {
  info: typeof getSubscriptionInfo;
  create: typeof createSubscriptionPayment;
}

export interface SubscriptionHandlerOptions {
  store?: LoginStore | null;
  service?: Partial<SubscriptionService>;
}

interface ModelService {
  list: typeof listModels;
}

export interface ModelHandlerOptions {
  store?: LoginStore | null;
  service?: Partial<ModelService>;
}

export function createQueryHandler({ store, query = queryPlatform, reporter }: QueryHandlerOptions = {}) {
  return async function handleQueryRequest(request: Request): Promise<Response> {
    try {
      const body = await readRequestBody(request);
      const payload: QueryOptions = isRecord(body)
        ? { baseUrl: body.baseUrl, accessToken: body.accessToken }
        : {};
      const data = await query(payload);
      if (reporter) {
        void reporter.configure(isRecord(body) && body.reportStats === true)
          .then(() => reporter.report('login')).catch(() => {});
      }
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

export function createSessionHandler({ store, query = queryPlatform, reporter }: SessionHandlerOptions = {}) {
  return async function handleSessionRequest(request: Request): Promise<Response> {
    try {
      if (request.method === 'DELETE') {
        if (store) await store.clear();
        await reporter?.configure(false).catch(() => {});
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
        void reporter?.report('restore').catch(() => {});
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

const defaultApiKeyService: ApiKeyService = {
  list: listApiKeys,
  create: createApiKey,
  setStatus: setApiKeyStatus,
  remove: deleteApiKey,
  reveal: revealApiKey,
};

const defaultTopupService: TopupService = {
  info: getTopupInfo,
  create: createTopup,
};

const defaultSubscriptionService: SubscriptionService = {
  info: getSubscriptionInfo,
  create: createSubscriptionPayment,
};

const defaultModelService: ModelService = {
  list: listModels,
};

async function requireSavedLogin(store?: LoginStore | null, message = '请先登录后再管理 API Key。'): Promise<LoginRecord> {
  const saved = store ? await store.load() : null;
  if (!saved) {
    throw new QueryError('LOGIN_REQUIRED', message, 401);
  }
  return saved;
}

export function createApiKeysHandler({ store, service }: ApiKeyHandlerOptions = {}) {
  const api = { ...defaultApiKeyService, ...service };

  return async function handleApiKeysRequest(request: Request): Promise<Response> {
    try {
      const saved = await requireSavedLogin(store);
      let data: unknown;
      if (request.method === 'GET') {
        data = await api.list(saved);
      } else {
        const body = await readRequestBody(request);
        if (!isRecord(body)) throw new QueryError('INVALID_REQUEST', '请求内容无效。');
        if (request.method === 'POST') {
          data = await api.create({
            ...saved,
            name: body.name,
            unlimitedQuota: body.unlimitedQuota,
            remainQuota: body.remainQuota,
            expiredTime: body.expiredTime,
            group: body.group,
          });
        } else if (request.method === 'PATCH') {
          data = await api.setStatus({ ...saved, id: body.id, status: body.status });
        } else if (request.method === 'DELETE') {
          data = await api.remove({ ...saved, id: body.id });
        } else if (request.method === 'PUT') {
          data = await api.reveal({ ...saved, id: body.id });
        } else {
          throw new QueryError('METHOD_NOT_ALLOWED', '不支持的请求方法。', 405);
        }
      }
      return Response.json({ ok: true, data }, {
        headers: { 'cache-control': 'no-store' },
      });
    } catch (error) {
      if (error instanceof QueryError && error.code === 'AUTH_FAILED' && store) {
        await store.clear().catch(() => {});
      }
      return errorResponse(error);
    }
  };
}

export function createTopupHandler({ store, service }: TopupHandlerOptions = {}) {
  const api = { ...defaultTopupService, ...service };

  return async function handleTopupRequest(request: Request): Promise<Response> {
    try {
      const saved = await requireSavedLogin(store, '请先登录后再充值。');
      let data: unknown;
      if (request.method === 'GET') {
        data = await api.info(saved);
      } else if (request.method === 'POST') {
        const body = await readRequestBody(request);
        if (!isRecord(body)) throw new QueryError('INVALID_REQUEST', '请求内容无效。');
        data = await api.create({
          ...saved,
          amount: body.amount,
          paymentMethod: body.paymentMethod,
        });
      } else {
        throw new QueryError('METHOD_NOT_ALLOWED', '不支持的请求方法。', 405);
      }
      return Response.json({ ok: true, data }, {
        headers: { 'cache-control': 'no-store' },
      });
    } catch (error) {
      if (error instanceof QueryError && error.code === 'AUTH_FAILED' && store) {
        await store.clear().catch(() => {});
      }
      return errorResponse(error);
    }
  };
}

export function createSubscriptionHandler({ store, service }: SubscriptionHandlerOptions = {}) {
  const api = { ...defaultSubscriptionService, ...service };

  return async function handleSubscriptionRequest(request: Request): Promise<Response> {
    try {
      const saved = await requireSavedLogin(store, '请先登录后再管理订阅。');
      let data: unknown;
      if (request.method === 'GET') {
        data = await api.info(saved);
      } else if (request.method === 'POST') {
        const body = await readRequestBody(request);
        if (!isRecord(body)) throw new QueryError('INVALID_REQUEST', '请求内容无效。');
        data = await api.create({
          ...saved,
          planId: body.planId,
          paymentMethod: body.paymentMethod,
        });
      } else {
        throw new QueryError('METHOD_NOT_ALLOWED', '不支持的请求方法。', 405);
      }
      return Response.json({ ok: true, data }, {
        headers: { 'cache-control': 'no-store' },
      });
    } catch (error) {
      if (error instanceof QueryError && error.code === 'AUTH_FAILED' && store) {
        await store.clear().catch(() => {});
      }
      return errorResponse(error);
    }
  };
}

export function createModelsHandler({ store, service }: ModelHandlerOptions = {}) {
  const api = { ...defaultModelService, ...service };

  return async function handleModelsRequest(request: Request): Promise<Response> {
    try {
      const saved = await requireSavedLogin(store, '请先登录后再查看模型广场。');
      if (request.method !== 'GET') {
        throw new QueryError('METHOD_NOT_ALLOWED', '不支持的请求方法。', 405);
      }
      const data = await api.list(saved);
      return Response.json({ ok: true, data }, {
        headers: { 'cache-control': 'no-store' },
      });
    } catch (error) {
      if (error instanceof QueryError && error.code === 'AUTH_FAILED' && store) {
        await store.clear().catch(() => {});
      }
      return errorResponse(error);
    }
  };
}
