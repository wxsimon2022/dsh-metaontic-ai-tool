import { DEFAULT_BASE_URL, QUERY_PATH, SESSION_PATH } from './constants.js';
import { createApiKeysPage } from './api-keys-page.js';
import { createModelsPage } from './models-page.js';
import { createOverviewPage } from './overview-page.js';
import { createHeader, createLoginForm } from './shell.js';
import { PANEL_CSS } from './styles.js';
import { createSubscriptionPage } from './subscription-page.js';
import { createTopupPage } from './topup-page.js';
import type {
  ClientRuntime,
  DashboardData,
  FormEventLike,
  PanelView,
  QueryPayload,
  SessionPayload,
  UiStatus,
} from './runtime.js';

export function createDashboard(runtime: ClientRuntime) {
  const { React, h, t } = runtime;
  const Header = createHeader(runtime);
  const LoginForm = createLoginForm(runtime);
  const OverviewPage = createOverviewPage(runtime);
  const SubscriptionPage = createSubscriptionPage(runtime);
  const ModelsPage = createModelsPage(runtime);
  const ApiKeysPage = createApiKeysPage(runtime);
  const TopupPage = createTopupPage(runtime);

  return function Dashboard() {
    const [baseUrl, setBaseUrl] = React.useState<string>(DEFAULT_BASE_URL);
    const [token, setToken] = React.useState<string>('');
    const [showToken, setShowToken] = React.useState<boolean>(false);
    const [status, setStatus] = React.useState<UiStatus>('restoring');
    const [data, setData] = React.useState<DashboardData | null>(null);
    const [error, setError] = React.useState<string>('');
    const [notice, setNotice] = React.useState<string>('');
    const [persisted, setPersisted] = React.useState<boolean>(false);
    const [view, setView] = React.useState<PanelView>('overview');
    const pending = status === 'pending';

    async function fetchSession(): Promise<{ response: Response; payload: SessionPayload }> {
      const response = await fetch(SESSION_PATH, { method: 'GET', cache: 'no-store' });
      let payload: SessionPayload;
      try {
        payload = await response.json() as SessionPayload;
      } catch {
        throw new Error(t('invalidResponse'));
      }
      return { response, payload };
    }

    function acceptSession(payload: SessionPayload): boolean {
      const value = payload?.data;
      if (!value?.authenticated) return false;
      setBaseUrl(value.baseUrl || DEFAULT_BASE_URL);
      setData(value);
      setPersisted(value.persisted !== false);
      setError('');
      setNotice('');
      setStatus('ready');
      return true;
    }

    React.useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const { response, payload } = await fetchSession();
          if (cancelled) return;
          if (acceptSession(payload)) return;
          if (payload?.data?.baseUrl) setBaseUrl(payload.data.baseUrl);
          if (payload?.data?.savedLoginInvalid) {
            setError(t('savedLoginExpired'));
          } else if (!response.ok) {
            setError(payload?.error?.message || t('restoreFailed'));
          }
          setStatus('idle');
        } catch {
          if (!cancelled) {
            setError(t('restoreFailed'));
            setStatus('idle');
          }
        }
      })();
      return () => { cancelled = true; };
    }, []);

    async function query(event?: FormEventLike): Promise<void> {
      event?.preventDefault?.();
      if (pending) return;
      if (!token.trim()) {
        setError(t('tokenRequired'));
        return;
      }
      setStatus('pending');
      setError('');
      setNotice('');
      try {
        const response = await fetch(QUERY_PATH, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ baseUrl, accessToken: token }),
        });
        let payload: QueryPayload;
        try {
          payload = await response.json() as QueryPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok || !payload.data) {
          throw new Error(payload?.error?.message || t('requestFailed'));
        }
        setBaseUrl(payload.data.baseUrl || baseUrl);
        setData(payload.data);
        setPersisted(payload.data.persisted === true);
        if (payload.data.persisted) {
          setToken('');
          setShowToken(false);
        } else {
          setNotice(t('notPersisted'));
        }
        setStatus('ready');
        setView('overview');
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('requestFailed'));
        setStatus(data ? 'ready' : 'idle');
      }
    }

    async function refresh(event?: FormEventLike): Promise<void> {
      event?.preventDefault?.();
      if (pending) return;
      if (token.trim()) return query(event);
      setStatus('pending');
      setError('');
      setNotice('');
      try {
        const { response, payload } = await fetchSession();
        if (acceptSession(payload)) return;
        if (payload?.data?.baseUrl) setBaseUrl(payload.data.baseUrl);
        if (payload?.data?.savedLoginInvalid) {
          setData(null);
          setPersisted(false);
          setStatus('idle');
          setError(t('savedLoginExpired'));
          return;
        }
        throw new Error(!response.ok ? payload?.error?.message || t('restoreFailed') : t('restoreFailed'));
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('restoreFailed'));
        setStatus(data ? 'ready' : 'idle');
      }
    }

    async function logout(event?: FormEventLike): Promise<void> {
      event?.preventDefault?.();
      if (pending) return;
      setStatus('pending');
      try {
        await fetch(SESSION_PATH, { method: 'DELETE', cache: 'no-store' });
      } catch {
        /* clearing local UI state still proceeds */
      }
      setToken('');
      setShowToken(false);
      setData(null);
      setError('');
      setNotice('');
      setPersisted(false);
      setView('overview');
      setStatus('idle');
    }

    return h(React.Fragment, null, [
      h('style', { key: 'style' }, PANEL_CSS),
      h('div', { key: 'panel', className: 'mat-root' }, [
        h(Header, { key: 'header' }),
        status === 'restoring' && !data
          ? h('div', { key: 'restoring', className: 'mat-card mat-login' }, h('p', { className: 'mat-hint' }, t('restoringLogin')))
          : data
          ? h(React.Fragment, { key: 'result' }, [
            h('div', { key: 'bar', className: 'mat-topbar' }, [
              h('div', { key: 'name', className: 'mat-topbar-title' }, [
                h('h3', { key: 'title', className: 'mat-platform-name' }, data.platform.system_name || baseUrl),
                h('div', { key: 'url', className: 'mat-subtle mat-mono' }, data.baseUrl),
              ]),
              persisted ? h('span', { key: 'saved', className: 'mat-badge mat-badge-ok' }, t('savedLogin')) : null,
              h('button', { key: 'refresh', type: 'button', className: 'mat-btn', disabled: pending, onClick: refresh },
                pending ? t('refreshing') : t('refresh')),
              h('button', { key: 'logout', type: 'button', className: 'mat-btn', disabled: pending, onClick: logout }, t('logout')),
            ]),
            h('div', { key: 'tabs', className: 'mat-page-tabs', role: 'tablist', 'aria-label': t('title') }, [
              h('button', {
                key: 'overview',
                type: 'button',
                role: 'tab',
                'aria-selected': view === 'overview',
                className: `mat-page-tab${view === 'overview' ? ' mat-page-tab-active' : ''}`,
                onClick: () => setView('overview'),
              }, t('overviewPage')),
              h('button', {
                key: 'subscription',
                type: 'button',
                role: 'tab',
                'aria-selected': view === 'subscription',
                className: `mat-page-tab${view === 'subscription' ? ' mat-page-tab-active' : ''}`,
                onClick: () => setView('subscription'),
              }, t('subscription')),
              h('button', {
                key: 'models',
                type: 'button',
                role: 'tab',
                'aria-selected': view === 'models',
                className: `mat-page-tab${view === 'models' ? ' mat-page-tab-active' : ''}`,
                onClick: () => setView('models'),
              }, t('modelsPage')),
              h('button', {
                key: 'api-keys',
                type: 'button',
                role: 'tab',
                'aria-selected': view === 'apiKeys',
                className: `mat-page-tab${view === 'apiKeys' ? ' mat-page-tab-active' : ''}`,
                onClick: () => setView('apiKeys'),
              }, t('apiKeys')),
            ]),
            error ? h('div', { key: 'error', className: 'mat-error', role: 'alert', style: { marginBottom: 12 } }, error) : null,
            notice ? h('div', { key: 'notice', className: 'mat-notice', role: 'status', style: { marginBottom: 12 } }, notice) : null,
            view === 'overview'
              ? h('div', { key: 'overview', className: 'mat-overview-stack' }, [
                h(OverviewPage, { key: 'overview-card', data }),
                h(TopupPage, { key: 'topup-card', data }),
              ])
              : view === 'models'
              ? h(ModelsPage, { key: 'models', data })
              : view === 'subscription'
              ? h(SubscriptionPage, { key: 'subscription', data })
              : view === 'apiKeys'
              ? h(ApiKeysPage, { key: 'api-keys', data })
              : null,
          ])
          : h(LoginForm, {
            key: 'login',
            baseUrl,
            setBaseUrl,
            token,
            setToken,
            showToken,
            setShowToken,
            pending,
            error,
            onSubmit: query,
          }),
      ]),
    ]);
  };
}
