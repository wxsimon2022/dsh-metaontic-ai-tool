const PANEL_ID = 'dsh-metaontic-ai-tool';
const NS = 'sidebar.metaonticAiTool';
const QUERY_PATH = '/api/dsh-metaontic-ai-tool.query';
const SESSION_PATH = '/api/dsh-metaontic-ai-tool.session';
const DEFAULT_BASE_URL = 'https://ai.bileego.com/';
const REGISTER_URL = 'https://ai.bileego.com/sign-up?aff=VzYr';

const zh = {
  sidebarLabel: 'MetaOntic AI',
  title: 'MetaOntic AI 管理工具',
  intro: '使用访问令牌登录，查询 MetaOntic AI 平台与当前账户信息。',
  baseUrl: '平台地址',
  accessToken: '访问令牌',
  accessTokenPlaceholder: '请输入访问令牌',
  accessTokenHint: '令牌由用户在 MetaOntic AI 控制台创建，仅用于本次查询。',
  tokenPrivacy: '登录成功后，访问令牌由 Host 保存在本机 profile 的私有文件中，浏览器不保存令牌。',
  login: '访问令牌登录',
  loginPending: '正在验证访问令牌…',
  registerPrompt: '还没有访问令牌？',
  registerNow: '注册账号',
  restoringLogin: '正在恢复本机登录…',
  savedLogin: '登录信息已保存到本机',
  notPersisted: '登录成功，但登录信息未能保存到本机。',
  savedLoginExpired: '保存的访问令牌已失效，请重新登录。',
  restoreFailed: '无法恢复本机登录，请重新登录。',
  showToken: '显示令牌',
  hideToken: '隐藏令牌',
  logout: '退出登录',
  refresh: '刷新查询',
  refreshing: '正在刷新…',
  tokenRequired: '请填写访问令牌。',
  requestFailed: '查询失败，请稍后重试。',
  invalidResponse: '平台返回了无法识别的数据。',
  account: '账户信息',
  platform: '平台信息',
  balance: '可用余额',
  usedQuota: '已用额度',
  requests: '请求次数',
  usageRatio: '额度使用情况',
  username: '用户名',
  displayName: '显示名称',
  group: '用户分组',
  role: '账户角色',
  accountId: '用户 ID',
  accountStatus: '账户状态',
  systemName: '平台名称',
  version: '平台版本',
  serverAddress: '服务地址',
  currency: '结算币种',
  fetchedAt: '查询时间',
  rawQuota: '剩余额度 {quota} · 已用 {used}',
  enabled: '正常',
  disabled: '已禁用',
  roleUser: '普通用户',
  roleAdmin: '管理员',
  roleRoot: '超级管理员',
  roleUnknown: '未知角色',
  empty: '暂无数据',
};

const en = {
  sidebarLabel: 'MetaOntic AI',
  title: 'MetaOntic AI Management Tool',
  intro: 'Sign in with an access token to inspect the MetaOntic AI platform and account.',
  baseUrl: 'Platform URL',
  accessToken: 'Access token',
  accessTokenPlaceholder: 'Enter access token',
  accessTokenHint: 'Create the token in the MetaOntic AI console. It is used only for this query.',
  tokenPrivacy: 'After sign-in, the Host stores the token in a private local profile file. The browser does not store it.',
  login: 'Sign in with access token',
  loginPending: 'Verifying access token…',
  registerPrompt: 'Need an access token?',
  registerNow: 'Create account',
  restoringLogin: 'Restoring saved local login…',
  savedLogin: 'Login saved on this device',
  notPersisted: 'Signed in, but the login could not be saved on this device.',
  savedLoginExpired: 'The saved access token has expired. Sign in again.',
  restoreFailed: 'Could not restore the saved login. Sign in again.',
  showToken: 'Show token',
  hideToken: 'Hide token',
  logout: 'Sign out',
  refresh: 'Refresh query',
  refreshing: 'Refreshing…',
  tokenRequired: 'Enter an access token.',
  requestFailed: 'Query failed. Try again later.',
  invalidResponse: 'The platform returned an unrecognized response.',
  account: 'Account',
  platform: 'Platform',
  balance: 'Available balance',
  usedQuota: 'Used quota',
  requests: 'Requests',
  usageRatio: 'Quota usage',
  username: 'Username',
  displayName: 'Display name',
  group: 'Group',
  role: 'Role',
  accountId: 'User ID',
  accountStatus: 'Account status',
  systemName: 'Platform name',
  version: 'Version',
  serverAddress: 'Server address',
  currency: 'Currency',
  fetchedAt: 'Queried at',
  rawQuota: 'Remaining {quota} · Used {used}',
  enabled: 'Active',
  disabled: 'Disabled',
  roleUser: 'User',
  roleAdmin: 'Administrator',
  roleRoot: 'Super administrator',
  roleUnknown: 'Unknown role',
  empty: 'No data',
};

const PANEL_CSS = `
  .mat-root{box-sizing:border-box;width:100%;max-width:880px;margin:0 auto;padding:28px 30px 44px;color:var(--dsw-alias-label-primary,#1f2329);font-size:13px}
  .mat-hero{display:flex;align-items:flex-start;gap:13px;margin-bottom:20px}
  .mat-mark{flex:0 0 auto;display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 12%,transparent);color:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-title{margin:0;font-size:19px;font-weight:650;line-height:1.35}
  .mat-intro{margin:4px 0 0;color:var(--dsw-alias-label-secondary,#67707c);font-size:12.5px;line-height:1.6}
  .mat-card{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:14px;background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1,#fff));padding:18px}
  .mat-login{display:flex;flex-direction:column;gap:15px}
  .mat-field{display:flex;flex-direction:column;gap:7px}
  .mat-label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary,#1f2329)}
  .mat-input-wrap{display:flex;gap:8px}
  .mat-input{box-sizing:border-box;width:100%;min-width:0;height:38px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 11px;font:inherit;outline:none}
  .mat-input:focus{border-color:var(--dsw-alias-brand-primary,#2563eb);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 14%,transparent)}
  .mat-hint{margin:0;color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;line-height:1.55}
  .mat-register{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
  .mat-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 14px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap}
  .mat-btn:hover{background:var(--dsw-alias-bg-layer-2,#f5f7fa)}
  .mat-btn:disabled{cursor:not-allowed;opacity:.55}
  .mat-btn-primary{border-color:transparent;background:var(--dsw-alias-brand-primary,#2563eb);color:#fff}
  .mat-btn-primary:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 88%,#000)}
  .mat-btn-register{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 32%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 7%,transparent);color:var(--dsw-alias-brand-primary,#2563eb);text-decoration:none}
  .mat-btn-register:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 13%,transparent)}
  .mat-actions{display:flex;flex-wrap:wrap;align-items:center;gap:9px}
  .mat-actions .mat-btn-primary{flex:1 1 210px}
  .mat-error{display:flex;gap:8px;align-items:flex-start;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 8%,transparent);color:var(--dsw-alias-state-error-primary,#c62828);padding:9px 11px;font-size:12px;line-height:1.55}
  .mat-notice{display:flex;gap:8px;align-items:flex-start;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2e7d32) 8%,transparent);color:var(--dsw-alias-state-success-primary,#2e7d32);padding:9px 11px;font-size:12px;line-height:1.55}
  .mat-topbar{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-bottom:14px}
  .mat-topbar-title{flex:1 1 220px;min-width:0}
  .mat-platform-name{margin:0;font-size:16px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mat-subtle{color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;line-height:1.5}
  .mat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:12px;margin-top:12px}
  .mat-card-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:12px}
  .mat-card-title{font-size:13px;font-weight:650}
  .mat-badge{border-radius:999px;background:var(--dsw-alias-bg-layer-2,#f1f4f8);color:var(--dsw-alias-label-secondary,#67707c);padding:2px 8px;font-size:10.5px;font-weight:600}
  .mat-badge-ok{background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2e7d32) 10%,transparent);color:var(--dsw-alias-state-success-primary,#2e7d32)}
  .mat-badge-warn{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b26a00) 10%,transparent);color:var(--dsw-alias-state-warn-primary,#b26a00)}
  .mat-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
  .mat-metric{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:11px;padding:11px}
  .mat-metric-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:10.5px}
  .mat-metric-value{margin-top:5px;font-size:18px;font-weight:680;line-height:1.2;overflow-wrap:anywhere}
  .mat-progress{height:7px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,#eef1f5);overflow:hidden;margin:12px 0 7px}
  .mat-progress-bar{height:100%;border-radius:inherit;background:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-rows{display:flex;flex-direction:column;gap:8px}
  .mat-row{display:grid;grid-template-columns:minmax(90px,128px) minmax(0,1fr);gap:10px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:8px}
  .mat-row:first-child{border-top:0;padding-top:0}
  .mat-row-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px}
  .mat-row-value{min-width:0;overflow-wrap:anywhere;font-size:12px}
  .mat-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}
  .mat-foot{margin-top:14px;text-align:right}
  @media (max-width:620px){.mat-root{padding:20px 16px 32px}.mat-metrics{grid-template-columns:1fr}.mat-row{grid-template-columns:1fr;gap:3px}}
`;

type SetState<T> = (value: T | ((previous: T) => T)) => void;
type HFunction = (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => unknown;

interface ReactLike {
  Fragment: unknown;
  createElement: HFunction;
  useState<T>(initialValue: T): [T, SetState<T>];
  useEffect(effect: () => void | (() => void), dependencies: readonly unknown[]): void;
}

interface PlatformInfo {
  system_name?: string;
  server_address?: string;
  version?: string;
  quota_per_unit?: number | string;
  quota_display_type?: string;
  usd_exchange_rate?: number | string;
  custom_currency_symbol?: string;
  custom_currency_exchange_rate?: number | string;
  display_in_currency?: boolean;
  price?: number | string;
}

interface AccountInfo {
  id?: number | string;
  username?: string;
  display_name?: string;
  role?: number | string;
  status?: number | string;
  group?: string;
  quota?: number | string;
  used_quota?: number | string;
  request_count?: number | string;
}

interface DashboardData {
  baseUrl: string;
  fetchedAt: string;
  platform: PlatformInfo;
  account: AccountInfo;
  authenticated?: boolean;
  persisted?: boolean;
}

interface ApiError {
  code?: string;
  message?: string;
}

interface SessionData extends DashboardData {
  savedLoginInvalid?: boolean;
}

interface SessionPayload {
  ok?: boolean;
  data?: SessionData;
  error?: ApiError;
}

interface QueryPayload {
  ok?: boolean;
  data?: DashboardData;
  error?: ApiError;
}

interface ChangeEventLike {
  target: { value: string };
}

interface FormEventLike {
  preventDefault?: () => void;
}

interface RowProps {
  label: unknown;
  value?: unknown;
  mono?: boolean;
}

interface PanelIconViewProps {
  size?: number;
  active?: boolean;
}

interface LoginFormProps {
  baseUrl: string;
  setBaseUrl: SetState<string>;
  token: string;
  setToken: SetState<string>;
  showToken: boolean;
  setShowToken: SetState<boolean>;
  pending: boolean;
  error: string;
  onSubmit: (event?: FormEventLike) => void | Promise<void>;
}

interface CardProps {
  data: DashboardData;
}

interface CurrencyUnit {
  symbol: string;
  code: string;
  rate: number;
}

type UiStatus = 'restoring' | 'idle' | 'pending' | 'ready';

function formatNumber(value: unknown): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  const text = Math.abs(number) >= 1 ? number.toFixed(2) : number.toFixed(4);
  return text.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

function currency(platform?: PlatformInfo): CurrencyUnit {
  const type = String(platform?.quota_display_type || 'USD').toUpperCase();
  if (type === 'CNY') {
    return { symbol: '¥', code: 'CNY', rate: Number(platform?.usd_exchange_rate) || 1 };
  }
  if (type === 'CUSTOM') {
    return {
      symbol: String(platform?.custom_currency_symbol || '¤'),
      code: 'CUSTOM',
      rate: Number(platform?.custom_currency_exchange_rate) || 1,
    };
  }
  return { symbol: '$', code: 'USD', rate: 1 };
}

function formatQuota(quota: unknown, platform?: PlatformInfo): string {
  const perUnit = Number(platform?.quota_per_unit) || 500000;
  const unit = currency(platform);
  return `${unit.symbol}${formatNumber((Number(quota) || 0) / perUnit * unit.rate)}`;
}

function roleLabel(t: DshTranslate, role: unknown): string {
  const value = Number(role);
  if (value >= 100) return t('roleRoot');
  if (value >= 10) return t('roleAdmin');
  if (value === 1) return t('roleUser');
  return t('roleUnknown');
}

function createPanel(React: ReactLike, h: HFunction, t: DshTranslate) {
  function Row({ label, value, mono = false }: RowProps) {
    return h('div', { className: 'mat-row' }, [
      h('div', { key: 'label', className: 'mat-row-label' }, label),
      h('div', { key: 'value', className: `mat-row-value${mono ? ' mat-mono' : ''}` }, value ?? t('empty')),
    ]);
  }

  function PanelIconView({ size = 18, active = false }: PanelIconViewProps) {
    const pixels = Number(size) || 18;
    return h('svg', {
      width: pixels,
      height: pixels,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      style: { display: 'block', color: active ? 'var(--dsw-alias-brand-primary,#2563eb)' : 'currentColor' },
    }, [
      h('path', { key: 'outer', d: 'M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z' }),
      h('path', { key: 'inner', d: 'M8.2 12h7.6M12 8.2v7.6' }),
    ]);
  }

  function Header() {
    return h('div', { className: 'mat-hero' }, [
      h('div', { key: 'mark', className: 'mat-mark', 'aria-hidden': true }, h(PanelIconView, { size: 25 })),
      h('div', { key: 'copy' }, [
        h('h2', { key: 'title', className: 'mat-title' }, t('title')),
        h('p', { key: 'intro', className: 'mat-intro' }, t('intro')),
      ]),
    ]);
  }

  function LoginForm({ baseUrl, setBaseUrl, token, setToken, showToken, setShowToken, pending, error, onSubmit }: LoginFormProps) {
    return h('form', { className: 'mat-card mat-login', onSubmit }, [
      h('label', { key: 'url-field', className: 'mat-field' }, [
        h('span', { key: 'label', className: 'mat-label' }, t('baseUrl')),
        h('input', {
          key: 'input',
          className: 'mat-input mat-mono',
          type: 'url',
          value: baseUrl,
          onChange: (event: ChangeEventLike) => setBaseUrl(event.target.value),
          placeholder: DEFAULT_BASE_URL,
          autoComplete: 'url',
          disabled: pending,
          required: true,
        }),
      ]),
      h('label', { key: 'token-field', className: 'mat-field' }, [
        h('span', { key: 'label', className: 'mat-label' }, t('accessToken')),
        h('div', { key: 'wrap', className: 'mat-input-wrap' }, [
          h('input', {
            key: 'input',
            className: 'mat-input mat-mono',
            type: showToken ? 'text' : 'password',
            value: token,
            onChange: (event: ChangeEventLike) => setToken(event.target.value),
            placeholder: t('accessTokenPlaceholder'),
            autoComplete: 'off',
            spellCheck: false,
            disabled: pending,
            required: true,
          }),
          h('button', {
            key: 'toggle',
            type: 'button',
            className: 'mat-btn',
            onClick: () => setShowToken(value => !value),
            disabled: pending,
          }, showToken ? t('hideToken') : t('showToken')),
        ]),
        h('p', { key: 'hint', className: 'mat-hint' }, t('accessTokenHint')),
        h('p', { key: 'privacy', className: 'mat-hint' }, t('tokenPrivacy')),
        !token.trim() && !pending
          ? h('div', { key: 'register', className: 'mat-register' }, [
            h('span', { key: 'prompt', className: 'mat-hint' }, t('registerPrompt')),
            h('a', {
              key: 'link',
              className: 'mat-btn mat-btn-register',
              href: REGISTER_URL,
              target: '_blank',
              rel: 'noopener noreferrer',
              referrerPolicy: 'no-referrer',
            }, t('registerNow')),
          ])
          : null,
      ]),
      error ? h('div', { key: 'error', className: 'mat-error', role: 'alert' }, error) : null,
      h('div', { key: 'actions', className: 'mat-actions' }, h('button', {
        type: 'submit',
        className: 'mat-btn mat-btn-primary',
        disabled: pending,
      }, pending ? t('loginPending') : t('login')),
      ),
    ]);
  }

  function AccountCard({ data }: CardProps) {
    const { account, platform } = data;
    const remaining = Number(account.quota) || 0;
    const used = Number(account.used_quota) || 0;
    const total = remaining + used;
    const percentage = total > 0 ? Math.min(100, Math.max(0, used / total * 100)) : 0;
    const statusActive = Number(account.status) !== 2;
    return h('section', { className: 'mat-card' }, [
      h('div', { key: 'head', className: 'mat-card-head' }, [
        h('div', { key: 'title', className: 'mat-card-title' }, t('account')),
        h('span', { key: 'status', className: `mat-badge ${statusActive ? 'mat-badge-ok' : 'mat-badge-warn'}` },
          statusActive ? t('enabled') : t('disabled')),
      ]),
      h('div', { key: 'metrics', className: 'mat-metrics' }, [
        h('div', { key: 'balance', className: 'mat-metric' }, [
          h('div', { key: 'label', className: 'mat-metric-label' }, t('balance')),
          h('div', { key: 'value', className: 'mat-metric-value' }, formatQuota(remaining, platform)),
        ]),
        h('div', { key: 'used', className: 'mat-metric' }, [
          h('div', { key: 'label', className: 'mat-metric-label' }, t('usedQuota')),
          h('div', { key: 'value', className: 'mat-metric-value' }, formatQuota(used, platform)),
        ]),
        h('div', { key: 'requests', className: 'mat-metric' }, [
          h('div', { key: 'label', className: 'mat-metric-label' }, t('requests')),
          h('div', { key: 'value', className: 'mat-metric-value' }, String(Number(account.request_count) || 0)),
        ]),
      ]),
      h('div', { key: 'ratio-label', className: 'mat-hint', style: { marginTop: 13 } }, t('usageRatio')),
      h('div', { key: 'progress', className: 'mat-progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(percentage) },
        h('div', { className: 'mat-progress-bar', style: { width: `${percentage}%` } })),
      h('div', { key: 'raw', className: 'mat-hint' }, t('rawQuota', {
        quota: remaining.toLocaleString(),
        used: used.toLocaleString(),
      })),
      h('div', { key: 'rows', className: 'mat-rows', style: { marginTop: 14 } }, [
        h(Row, { key: 'username', label: t('username'), value: account.username }),
        h(Row, { key: 'display', label: t('displayName'), value: account.display_name }),
        h(Row, { key: 'group', label: t('group'), value: account.group }),
        h(Row, { key: 'role', label: t('role'), value: roleLabel(t, account.role) }),
        h(Row, { key: 'id', label: t('accountId'), value: String(account.id ?? ''), mono: true }),
      ]),
    ]);
  }

  function PlatformCard({ data }: CardProps) {
    const { platform, baseUrl, fetchedAt } = data;
    const unit = currency(platform);
    return h('section', { className: 'mat-card' }, [
      h('div', { key: 'head', className: 'mat-card-head' }, [
        h('div', { key: 'title', className: 'mat-card-title' }, t('platform')),
        h('span', { key: 'currency', className: 'mat-badge' }, `${unit.code} ${unit.symbol}`),
      ]),
      h('div', { key: 'rows', className: 'mat-rows' }, [
        h(Row, { key: 'name', label: t('systemName'), value: platform.system_name }),
        h(Row, { key: 'version', label: t('version'), value: platform.version, mono: true }),
        h(Row, { key: 'server', label: t('serverAddress'), value: platform.server_address || baseUrl, mono: true }),
        h(Row, { key: 'currency', label: t('currency'), value: unit.code }),
        h(Row, { key: 'time', label: t('fetchedAt'), value: new Date(fetchedAt).toLocaleString(), mono: true }),
      ]),
    ]);
  }

  function Dashboard() {
    const [baseUrl, setBaseUrl] = React.useState<string>(DEFAULT_BASE_URL);
    const [token, setToken] = React.useState<string>('');
    const [showToken, setShowToken] = React.useState<boolean>(false);
    const [status, setStatus] = React.useState<UiStatus>('restoring');
    const [data, setData] = React.useState<DashboardData | null>(null);
    const [error, setError] = React.useState<string>('');
    const [notice, setNotice] = React.useState<string>('');
    const [persisted, setPersisted] = React.useState<boolean>(false);
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
            error ? h('div', { key: 'error', className: 'mat-error', role: 'alert', style: { marginBottom: 12 } }, error) : null,
            notice ? h('div', { key: 'notice', className: 'mat-notice', role: 'status', style: { marginBottom: 12 } }, notice) : null,
            h('div', { key: 'grid', className: 'mat-grid' }, [
              h(AccountCard, { key: 'account', data }),
              h(PlatformCard, { key: 'platform', data }),
            ]),
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
  }

  return { Dashboard, PanelIconView };
}

window.__ModuleLoader__.load({
  id: PANEL_ID,
  factory(require) {
    const React = require('react') as ReactLike;
    const h = React.createElement;
    return {
      inject: ['slots', 'locale'],
      apply(ctx: DshClientContext) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-metaontic-ai-tool: dictionaries');
        const t = ctx.locale.bind(NS);
        const { Dashboard, PanelIconView } = createPanel(React, h, t);
        ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 40,
          locale: NS,
          label: () => t('sidebarLabel'),
        }, PanelIconView)), 'dsh-metaontic-ai-tool: sidebar entry');
        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, Dashboard)), 'dsh-metaontic-ai-tool: main panel');
      },
    };
  },
});
