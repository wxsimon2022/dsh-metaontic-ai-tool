const PANEL_ID = 'dsh-metaontic-ai-tool';
const NS = 'sidebar.metaonticAiTool';
const QUERY_PATH = '/api/dsh-metaontic-ai-tool.query';
const SESSION_PATH = '/api/dsh-metaontic-ai-tool.session';
const API_KEYS_PATH = '/api/dsh-metaontic-ai-tool.api-keys';
const DEFAULT_BASE_URL = 'https://ai.bileego.com/';
const REGISTER_URL = 'https://ai.bileego.com/sign-up?aff=VzYr';

const zh = {
  sidebarLabel: 'MetaOntic AI',
  title: 'MetaOntic AI 管理工具',
  intro: 'MetaOntic AI 是多模型聚合平台，提供稳定可靠的模型服务。使用访问令牌登录后查询平台与当前账户信息。',
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
  usageRatio: '额度剩余情况',
  usageRemainingPercent: '剩余 {percent}%',
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
  rawQuota: '余额 {quota} · 累计已用 {used}',
  apiKeys: 'API Key 管理',
  apiKeysHint: '为应用创建和管理访问密钥。完整密钥仅在点击显示时读取，不会随列表下发。',
  apiKeyListTitle: 'Key 列表（{count}）',
  apiKeyRefresh: '刷新',
  apiKeyRefreshing: '正在刷新…',
  apiKeyNew: '新建 API Key',
  apiKeyCreate: '创建',
  apiKeyCreating: '正在创建…',
  apiKeyCancel: '取消',
  apiKeyName: '名称',
  apiKeyNamePlaceholder: '例如 dsh-desktop',
  apiKeyUnlimited: '无限额度',
  apiKeyQuota: '额度',
  apiKeyQuotaPlaceholder: '例如 10',
  apiKeyQuotaHint: '按平台当前结算币种填写。',
  apiKeyExpiryDays: '有效期（天）',
  apiKeyNeverExpiresHint: '填 0 表示永不过期。',
  apiKeyNone: '暂无 API Key，点击“新建 API Key”创建。',
  apiKeyHidden: '点击“显示密钥”查看',
  apiKeyShow: '显示密钥',
  apiKeyHide: '隐藏密钥',
  apiKeyCopy: '复制',
  apiKeyCopied: 'API Key 已复制。',
  apiKeyCopyUnavailable: '无法访问剪贴板，请手动选择并复制密钥。',
  apiKeyCreated: 'API Key 已创建，请显示并妥善保存密钥。',
  apiKeyDeleted: 'API Key 已删除。',
  apiKeyEnabledNotice: 'API Key 已启用。',
  apiKeyDisabledNotice: 'API Key 已禁用。',
  apiKeyDeleteConfirm: '确定删除 API Key“{name}”吗？此操作不可撤销。',
  apiKeyDelete: '删除',
  apiKeyEnable: '启用',
  apiKeyDisable: '禁用',
  apiKeyStatusEnabled: '已启用',
  apiKeyStatusDisabled: '已禁用',
  apiKeyStatusExpired: '已过期',
  apiKeyStatusExhausted: '额度用尽',
  apiKeyStatusUnknown: '未知状态',
  apiKeyQuotaLabel: '剩余额度',
  apiKeyUsedLabel: '已用额度',
  apiKeyExpires: '过期时间',
  apiKeyCreatedAt: '创建时间',
  neverExpires: '永不过期',
  unlimited: '无限',
  apiKeyLoadFailed: 'API Key 列表加载失败。',
  apiKeyActionFailed: 'API Key 操作失败。',
  apiKeyRevealFailed: '读取 API Key 失败。',
  apiKeyNameRequired: '请填写 API Key 名称。',
  apiKeyQuotaInvalid: '额度格式无效。',
  apiKeyExpiryInvalid: '有效期格式无效。',
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
  intro: 'MetaOntic AI is a multi-model aggregation platform offering stable, reliable model services. Sign in with an access token to inspect the platform and your account.',
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
  usageRatio: 'Remaining quota',
  usageRemainingPercent: 'Remaining {percent}%',
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
  rawQuota: 'Balance {quota} · Cumulative used {used}',
  apiKeys: 'API Key management',
  apiKeysHint: 'Create and manage access keys for applications. Full keys are read only when explicitly shown and are never included in the list response.',
  apiKeyListTitle: 'Key list ({count})',
  apiKeyRefresh: 'Refresh',
  apiKeyRefreshing: 'Refreshing…',
  apiKeyNew: 'New API Key',
  apiKeyCreate: 'Create',
  apiKeyCreating: 'Creating…',
  apiKeyCancel: 'Cancel',
  apiKeyName: 'Name',
  apiKeyNamePlaceholder: 'For example, dsh-desktop',
  apiKeyUnlimited: 'Unlimited quota',
  apiKeyQuota: 'Quota',
  apiKeyQuotaPlaceholder: 'For example, 10',
  apiKeyQuotaHint: 'Enter an amount in the platform display currency.',
  apiKeyExpiryDays: 'Valid for (days)',
  apiKeyNeverExpiresHint: 'Use 0 for no expiration.',
  apiKeyNone: 'No API keys yet. Click “New API Key” to create one.',
  apiKeyHidden: 'Click “Show key” to reveal',
  apiKeyShow: 'Show key',
  apiKeyHide: 'Hide key',
  apiKeyCopy: 'Copy',
  apiKeyCopied: 'API Key copied.',
  apiKeyCopyUnavailable: 'Clipboard access is unavailable. Select and copy the key manually.',
  apiKeyCreated: 'API Key created. Show it and store it securely.',
  apiKeyDeleted: 'API Key deleted.',
  apiKeyEnabledNotice: 'API Key enabled.',
  apiKeyDisabledNotice: 'API Key disabled.',
  apiKeyDeleteConfirm: 'Delete API Key “{name}”? This cannot be undone.',
  apiKeyDelete: 'Delete',
  apiKeyEnable: 'Enable',
  apiKeyDisable: 'Disable',
  apiKeyStatusEnabled: 'Enabled',
  apiKeyStatusDisabled: 'Disabled',
  apiKeyStatusExpired: 'Expired',
  apiKeyStatusExhausted: 'Quota exhausted',
  apiKeyStatusUnknown: 'Unknown status',
  apiKeyQuotaLabel: 'Remaining quota',
  apiKeyUsedLabel: 'Used quota',
  apiKeyExpires: 'Expires',
  apiKeyCreatedAt: 'Created',
  neverExpires: 'Never expires',
  unlimited: 'Unlimited',
  apiKeyLoadFailed: 'Could not load API keys.',
  apiKeyActionFailed: 'API Key operation failed.',
  apiKeyRevealFailed: 'Could not read the API Key.',
  apiKeyNameRequired: 'Enter an API Key name.',
  apiKeyQuotaInvalid: 'Invalid quota amount.',
  apiKeyExpiryInvalid: 'Invalid expiration period.',
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
  .mat-progress-bar.mat-progress-warn{background:#d97706}
  .mat-progress-bar.mat-progress-danger{background:#dc2626}
  .mat-ratio-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:13px}
  .mat-ratio-value{color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;font-variant-numeric:tabular-nums;white-space:nowrap}
  .mat-rows{display:flex;flex-direction:column;gap:8px}
  .mat-row{display:grid;grid-template-columns:minmax(90px,128px) minmax(0,1fr);gap:10px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:8px}
  .mat-row:first-child{border-top:0;padding-top:0}
  .mat-row-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px}
  .mat-row-value{min-width:0;overflow-wrap:anywhere;font-size:12px}
  .mat-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}
  .mat-foot{margin-top:14px;text-align:right}
  .mat-api-keys{margin-top:12px}
  .mat-card-head-copy{min-width:0}
  .mat-card-head-copy .mat-hint{margin-top:3px}
  .mat-key-create{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(120px,.8fr) minmax(120px,.8fr);gap:10px;align-items:end;border:1px dashed var(--dsw-alias-border-l1,#e4e8ee);border-radius:11px;padding:12px;margin:0 0 12px}
  .mat-key-create .mat-field{gap:5px}
  .mat-key-check{display:flex;align-items:center;gap:7px;min-height:38px;font-size:12px;font-weight:600}
  .mat-key-create-actions{display:flex;flex-wrap:wrap;gap:8px;grid-column:1/-1;justify-content:flex-end}
  .mat-key-list{display:flex;flex-direction:column;gap:9px}
  .mat-key-list-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 9px}
  .mat-key-item{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:11px;padding:12px;background:var(--dsw-alias-bg-layer-1,#fff)}
  .mat-key-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:9px}
  .mat-key-name{min-width:0;flex:1 1 180px;font-size:13px;font-weight:650;overflow-wrap:anywhere}
  .mat-key-secret{display:block;box-sizing:border-box;width:100%;border-radius:8px;background:var(--dsw-alias-bg-layer-2,#f5f7fa);padding:8px 9px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;overflow-wrap:anywhere;user-select:all}
  .mat-key-secret-empty{color:var(--dsw-alias-label-secondary,#67707c);user-select:none}
  .mat-key-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:10px 0}
  .mat-key-meta-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:10.5px}
  .mat-key-meta-value{margin-top:3px;font-size:12px;font-weight:600;overflow-wrap:anywhere}
  .mat-key-actions{display:flex;flex-wrap:wrap;gap:7px}
  .mat-btn-sm{height:30px;padding:0 10px;font-size:11.5px}
  .mat-btn-danger{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 28%,transparent);color:var(--dsw-alias-state-error-primary,#c62828)}
  .mat-btn-danger:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 8%,transparent)}
  @media (max-width:620px){.mat-root{padding:20px 16px 32px}.mat-metrics{grid-template-columns:1fr}.mat-row{grid-template-columns:1fr;gap:3px}.mat-key-create{grid-template-columns:1fr}.mat-key-meta{grid-template-columns:1fr}}
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

interface ApiKeyInfo {
  id?: number | string;
  name?: string;
  status?: number | string;
  created_time?: number | string;
  accessed_time?: number | string;
  expired_time?: number | string;
  remain_quota?: number | string;
  unlimited_quota?: boolean;
  used_quota?: number | string;
  model_limits_enabled?: boolean;
  group?: string;
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

interface ApiKeysPayload {
  ok?: boolean;
  data?: { keys?: ApiKeyInfo[]; total?: number };
  error?: ApiError;
}

interface ApiKeySecretPayload {
  ok?: boolean;
  data?: { id?: number | string; key?: string };
  error?: ApiError;
}

interface ApiKeyActionPayload {
  ok?: boolean;
  data?: unknown;
  error?: ApiError;
}

interface ChangeEventLike {
  target: { value: string; checked?: boolean };
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

function formatPercent(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

function displayQuotaToUnits(value: unknown, platform?: PlatformInfo): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  const perUnit = Number(platform?.quota_per_unit) || 500000;
  const rate = currency(platform).rate || 1;
  const units = Math.round(amount * perUnit / rate);
  return Number.isSafeInteger(units) && units >= 0 ? units : null;
}

function expiryTimeFromDays(value: unknown): number | null {
  const days = Number(value ?? 0);
  if (!Number.isFinite(days) || days < 0 || days > 36500) return null;
  if (days === 0) return -1;
  return Math.floor(Date.now() / 1000 + days * 86400);
}

function apiKeyStatusLabel(t: DshTranslate, status: unknown): string {
  const value = Number(status);
  if (value === 1) return t('apiKeyStatusEnabled');
  if (value === 2) return t('apiKeyStatusDisabled');
  if (value === 3) return t('apiKeyStatusExpired');
  if (value === 4) return t('apiKeyStatusExhausted');
  return t('apiKeyStatusUnknown');
}

function apiKeyStatusTone(status: unknown): string {
  return Number(status) === 1 ? 'mat-badge-ok' : 'mat-badge-warn';
}

function apiKeyExpiryLabel(t: DshTranslate, expiredTime: unknown): string {
  const seconds = Number(expiredTime);
  if (seconds === -1) return t('neverExpires');
  if (!Number.isFinite(seconds) || seconds <= 0) return t('empty');
  return new Date(seconds * 1000).toLocaleString();
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
    const remainingPercentage = total > 0 ? Math.min(100, Math.max(0, remaining / total * 100)) : 0;
    const progressTone = remainingPercentage <= 5 ? ' mat-progress-danger' : remainingPercentage <= 20 ? ' mat-progress-warn' : '';
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
      h('div', { key: 'ratio-label', className: 'mat-ratio-head' }, [
        h('div', { key: 'label', className: 'mat-hint' }, t('usageRatio')),
        h('div', { key: 'value', className: 'mat-ratio-value' }, t('usageRemainingPercent', {
          percent: formatPercent(remainingPercentage),
        })),
      ]),
      h('div', {
        key: 'progress',
        className: 'mat-progress',
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': Math.round(remainingPercentage),
        'aria-valuetext': t('usageRemainingPercent', { percent: formatPercent(remainingPercentage) }),
        title: t('rawQuota', {
          quota: formatQuota(remaining, platform),
          used: formatQuota(used, platform),
        }),
      }, h('div', { className: `mat-progress-bar${progressTone}`, style: { width: `${remainingPercentage}%` } })),
      h('div', { key: 'raw', className: 'mat-hint' }, t('rawQuota', {
        quota: formatQuota(remaining, platform),
        used: formatQuota(used, platform),
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

  function ApiKeysCard({ data }: CardProps) {
    const [keys, setKeys] = React.useState<ApiKeyInfo[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>('');
    const [notice, setNotice] = React.useState<string>('');
    const [busyId, setBusyId] = React.useState<number | null>(null);
    const [createOpen, setCreateOpen] = React.useState<boolean>(false);
    const [creating, setCreating] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>('');
    const [unlimited, setUnlimited] = React.useState<boolean>(true);
    const [quota, setQuota] = React.useState<string>('');
    const [expiryDays, setExpiryDays] = React.useState<string>('0');
    const [revealed, setRevealed] = React.useState<Record<string, string>>({});

    async function loadKeys(showLoading = true): Promise<void> {
      if (showLoading) setLoading(true);
      setError('');
      try {
        const response = await fetch(API_KEYS_PATH, { method: 'GET', cache: 'no-store' });
        let payload: ApiKeysPayload;
        try {
          payload = await response.json() as ApiKeysPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error?.message || t('apiKeyLoadFailed'));
        }
        setKeys(Array.isArray(payload.data?.keys) ? payload.data.keys : []);
        setRevealed({});
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('apiKeyLoadFailed'));
      } finally {
        if (showLoading) setLoading(false);
      }
    }

    React.useEffect(() => {
      void loadKeys();
    }, [data.baseUrl]);

    function resetCreateForm(): void {
      setName('');
      setUnlimited(true);
      setQuota('');
      setExpiryDays('0');
    }

    async function createKey(event?: FormEventLike): Promise<void> {
      event?.preventDefault?.();
      const keyName = name.trim();
      if (!keyName) {
        setError(t('apiKeyNameRequired'));
        return;
      }
      let remainQuota = 0;
      if (!unlimited) {
        const units = displayQuotaToUnits(quota, data.platform);
        if (units === null) {
          setError(t('apiKeyQuotaInvalid'));
          return;
        }
        remainQuota = units;
      }
      const expiredTime = expiryTimeFromDays(expiryDays);
      if (expiredTime === null) {
        setError(t('apiKeyExpiryInvalid'));
        return;
      }
      setCreating(true);
      setError('');
      setNotice('');
      try {
        const response = await fetch(API_KEYS_PATH, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: keyName,
            unlimitedQuota: unlimited,
            remainQuota,
            expiredTime,
            group: data.account.group,
          }),
        });
        let payload: ApiKeyActionPayload;
        try {
          payload = await response.json() as ApiKeyActionPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error?.message || t('apiKeyActionFailed'));
        }
        setCreateOpen(false);
        resetCreateForm();
        setNotice(t('apiKeyCreated'));
        await loadKeys(false);
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('apiKeyActionFailed'));
      } finally {
        setCreating(false);
      }
    }

    async function toggleStatus(apiKey: ApiKeyInfo): Promise<void> {
      const id = Number(apiKey.id);
      if (!Number.isSafeInteger(id) || id <= 0) return;
      const nextStatus = Number(apiKey.status) === 1 ? 2 : 1;
      setBusyId(id);
      setError('');
      setNotice('');
      try {
        const response = await fetch(API_KEYS_PATH, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id, status: nextStatus }),
        });
        let payload: ApiKeyActionPayload;
        try {
          payload = await response.json() as ApiKeyActionPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error?.message || t('apiKeyActionFailed'));
        }
        setNotice(nextStatus === 1 ? t('apiKeyEnabledNotice') : t('apiKeyDisabledNotice'));
        await loadKeys(false);
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('apiKeyActionFailed'));
      } finally {
        setBusyId(null);
      }
    }

    async function deleteKey(apiKey: ApiKeyInfo): Promise<void> {
      const id = Number(apiKey.id);
      if (!Number.isSafeInteger(id) || id <= 0) return;
      const keyName = String(apiKey.name || id);
      if (typeof confirm === 'function' && !confirm(t('apiKeyDeleteConfirm', { name: keyName }))) return;
      setBusyId(id);
      setError('');
      setNotice('');
      try {
        const response = await fetch(API_KEYS_PATH, {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        let payload: ApiKeyActionPayload;
        try {
          payload = await response.json() as ApiKeyActionPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error?.message || t('apiKeyActionFailed'));
        }
        setNotice(t('apiKeyDeleted'));
        await loadKeys(false);
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('apiKeyActionFailed'));
      } finally {
        setBusyId(null);
      }
    }

    async function toggleReveal(apiKey: ApiKeyInfo): Promise<void> {
      const id = Number(apiKey.id);
      if (!Number.isSafeInteger(id) || id <= 0) return;
      if (revealed[String(id)]) {
        setRevealed(previous => {
          const next = { ...previous };
          delete next[String(id)];
          return next;
        });
        return;
      }
      setBusyId(id);
      setError('');
      setNotice('');
      try {
        const response = await fetch(API_KEYS_PATH, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        let payload: ApiKeySecretPayload;
        try {
          payload = await response.json() as ApiKeySecretPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        const key = payload?.data?.key;
        if (!response.ok || !payload?.ok || typeof key !== 'string' || !key) {
          throw new Error(payload?.error?.message || t('apiKeyRevealFailed'));
        }
        setRevealed(previous => ({ ...previous, [String(id)]: key }));
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('apiKeyRevealFailed'));
      } finally {
        setBusyId(null);
      }
    }

    async function copyKey(apiKey: ApiKeyInfo): Promise<void> {
      const key = revealed[String(apiKey.id)];
      if (!key) return;
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(key);
          setNotice(t('apiKeyCopied'));
        } else {
          setNotice(t('apiKeyCopyUnavailable'));
        }
      } catch {
        setNotice(t('apiKeyCopyUnavailable'));
      }
    }

    const createForm = createOpen
      ? h('form', { key: 'create', className: 'mat-key-create', onSubmit: createKey }, [
        h('label', { key: 'name', className: 'mat-field' }, [
          h('span', { key: 'label', className: 'mat-label' }, t('apiKeyName')),
          h('input', {
            key: 'input',
            className: 'mat-input',
            value: name,
            onChange: (event: ChangeEventLike) => setName(event.target.value),
            placeholder: t('apiKeyNamePlaceholder'),
            maxLength: 50,
            autoComplete: 'off',
            disabled: creating,
            required: true,
          }),
        ]),
        h('label', { key: 'quota', className: 'mat-field' }, [
          h('span', { key: 'label', className: 'mat-label' }, t('apiKeyQuota')),
          h('input', {
            key: 'input',
            className: 'mat-input',
            type: 'number',
            min: 0,
            step: 0.01,
            value: quota,
            onChange: (event: ChangeEventLike) => setQuota(event.target.value),
            placeholder: t('apiKeyQuotaPlaceholder'),
            disabled: creating || unlimited,
          }),
          h('span', { key: 'hint', className: 'mat-hint' }, t('apiKeyQuotaHint')),
        ]),
        h('label', { key: 'expiry', className: 'mat-field' }, [
          h('span', { key: 'label', className: 'mat-label' }, t('apiKeyExpiryDays')),
          h('input', {
            key: 'input',
            className: 'mat-input',
            type: 'number',
            min: 0,
            step: 1,
            value: expiryDays,
            onChange: (event: ChangeEventLike) => setExpiryDays(event.target.value),
            disabled: creating,
          }),
          h('span', { key: 'hint', className: 'mat-hint' }, t('apiKeyNeverExpiresHint')),
        ]),
        h('label', { key: 'unlimited', className: 'mat-key-check' }, [
          h('input', {
            key: 'input',
            type: 'checkbox',
            checked: unlimited,
            onChange: (event: ChangeEventLike) => setUnlimited(Boolean(event.target.checked)),
            disabled: creating,
          }),
          h('span', { key: 'label' }, t('apiKeyUnlimited')),
        ]),
        h('div', { key: 'actions', className: 'mat-key-create-actions' }, [
          h('button', { key: 'cancel', type: 'button', className: 'mat-btn mat-btn-sm', onClick: () => {
            setCreateOpen(false);
            resetCreateForm();
          }, disabled: creating }, t('apiKeyCancel')),
          h('button', { key: 'submit', type: 'submit', className: 'mat-btn mat-btn-primary mat-btn-sm', disabled: creating },
            creating ? t('apiKeyCreating') : t('apiKeyCreate')),
        ]),
      ])
      : null;

    const keyList = loading && keys.length === 0
      ? h('p', { key: 'loading', className: 'mat-hint' }, t('apiKeyRefreshing'))
      : keys.length === 0
      ? h('p', { key: 'empty', className: 'mat-hint' }, t('apiKeyNone'))
      : h('div', { key: 'list', className: 'mat-key-list' }, keys.map(apiKey => {
        const id = Number(apiKey.id);
        const keyText = revealed[String(id)];
        const enabled = Number(apiKey.status) === 1;
        return h('div', { key: String(apiKey.id), className: 'mat-key-item' }, [
          h('div', { key: 'head', className: 'mat-key-head' }, [
            h('div', { key: 'name', className: 'mat-key-name' }, apiKey.name || t('empty')),
            h('span', { key: 'status', className: `mat-badge ${apiKeyStatusTone(apiKey.status)}` },
              apiKeyStatusLabel(t, apiKey.status)),
            apiKey.group ? h('span', { key: 'group', className: 'mat-badge' }, apiKey.group) : null,
          ]),
          h('code', {
            key: 'secret',
            className: `mat-key-secret${keyText ? '' : ' mat-key-secret-empty'}`,
          }, keyText || t('apiKeyHidden')),
          h('div', { key: 'meta', className: 'mat-key-meta' }, [
            h('div', { key: 'quota' }, [
              h('div', { key: 'label', className: 'mat-key-meta-label' }, t('apiKeyQuotaLabel')),
              h('div', { key: 'value', className: 'mat-key-meta-value' },
                apiKey.unlimited_quota ? t('unlimited') : formatQuota(apiKey.remain_quota, data.platform)),
            ]),
            h('div', { key: 'used' }, [
              h('div', { key: 'label', className: 'mat-key-meta-label' }, t('apiKeyUsedLabel')),
              h('div', { key: 'value', className: 'mat-key-meta-value' }, formatQuota(apiKey.used_quota, data.platform)),
            ]),
            h('div', { key: 'expires' }, [
              h('div', { key: 'label', className: 'mat-key-meta-label' }, t('apiKeyExpires')),
              h('div', { key: 'value', className: 'mat-key-meta-value' }, apiKeyExpiryLabel(t, apiKey.expired_time)),
            ]),
          ]),
          h('div', { key: 'actions', className: 'mat-key-actions' }, [
            h('button', {
              key: 'reveal',
              type: 'button',
              className: 'mat-btn mat-btn-sm',
              onClick: () => void toggleReveal(apiKey),
              disabled: busyId === id,
            }, keyText ? t('apiKeyHide') : t('apiKeyShow')),
            keyText ? h('button', {
              key: 'copy',
              type: 'button',
              className: 'mat-btn mat-btn-sm',
              onClick: () => void copyKey(apiKey),
            }, t('apiKeyCopy')) : null,
            h('button', {
              key: 'toggle',
              type: 'button',
              className: 'mat-btn mat-btn-sm',
              onClick: () => void toggleStatus(apiKey),
              disabled: busyId === id,
            }, enabled ? t('apiKeyDisable') : t('apiKeyEnable')),
            h('button', {
              key: 'delete',
              type: 'button',
              className: 'mat-btn mat-btn-sm mat-btn-danger',
              onClick: () => void deleteKey(apiKey),
              disabled: busyId === id,
            }, t('apiKeyDelete')),
          ]),
        ]);
      }));

    return h('section', { className: 'mat-card mat-api-keys' }, [
      h('div', { key: 'head', className: 'mat-card-head' }, [
        h('div', { key: 'copy', className: 'mat-card-head-copy' }, [
          h('div', { key: 'title', className: 'mat-card-title' }, t('apiKeys')),
          h('div', { key: 'hint', className: 'mat-hint' }, t('apiKeysHint')),
        ]),
        h('div', { key: 'head-actions', className: 'mat-actions' }, [
          h('button', {
            key: 'refresh',
            type: 'button',
            className: 'mat-btn mat-btn-sm',
            onClick: () => void loadKeys(),
            disabled: loading,
          }, loading ? t('apiKeyRefreshing') : t('apiKeyRefresh')),
          h('button', {
            key: 'new',
            type: 'button',
            className: 'mat-btn mat-btn-primary mat-btn-sm',
            onClick: () => {
              setCreateOpen(value => !value);
              setError('');
              setNotice('');
            },
          }, createOpen ? t('apiKeyCancel') : t('apiKeyNew')),
        ]),
      ]),
      error ? h('div', { key: 'error', className: 'mat-error', role: 'alert', style: { marginBottom: 10 } }, error) : null,
      notice ? h('div', { key: 'notice', className: 'mat-notice', role: 'status', style: { marginBottom: 10 } }, notice) : null,
      h('div', { key: 'list-head', className: 'mat-key-list-head' }, [
        h('div', { key: 'title', className: 'mat-card-title' }, t('apiKeyListTitle', { count: keys.length })),
        h('span', { key: 'count', className: 'mat-badge' }, String(keys.length)),
      ]),
      keyList,
      createForm,
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
            h(ApiKeysCard, { key: 'api-keys', data }),
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
