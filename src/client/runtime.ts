export type SetState<T> = (value: T | ((previous: T) => T)) => void;
export type HFunction = (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => unknown;

export interface ReactLike {
  Fragment: unknown;
  createElement: HFunction;
  useState<T>(initialValue: T): [T, SetState<T>];
  useEffect(effect: () => void | (() => void), dependencies: readonly unknown[]): void;
}

export interface ClientRuntime {
  React: ReactLike;
  h: HFunction;
  t: DshTranslate;
}

export interface PlatformInfo {
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

export interface AccountInfo {
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

export interface DashboardData {
  baseUrl: string;
  fetchedAt: string;
  platform: PlatformInfo;
  account: AccountInfo;
  authenticated?: boolean;
  persisted?: boolean;
}

export interface ApiKeyInfo {
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

export interface ApiKeyGroup {
  name: string;
  desc: string;
  ratio: number | null;
}

export interface ApiError {
  code?: string;
  message?: string;
}

export interface SessionData extends DashboardData {
  savedLoginInvalid?: boolean;
}

export interface SessionPayload {
  ok?: boolean;
  data?: SessionData;
  error?: ApiError;
}

export interface QueryPayload {
  ok?: boolean;
  data?: DashboardData;
  error?: ApiError;
}

export interface ApiKeysPayload {
  ok?: boolean;
  data?: { keys?: ApiKeyInfo[]; total?: number; groups?: ApiKeyGroup[] };
  error?: ApiError;
}

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
  models?: ModelInfo[];
  groups?: string[];
}

export interface ModelsPayload {
  ok?: boolean;
  data?: ModelCatalog;
  error?: ApiError;
}

export interface ApiKeySecretPayload {
  ok?: boolean;
  data?: { id?: number | string; key?: string };
  error?: ApiError;
}

export interface ApiKeyActionPayload {
  ok?: boolean;
  data?: unknown;
  error?: ApiError;
}

export interface TopupPaymentMethod {
  name?: string;
  type?: string;
}

export interface TopupConfig {
  amountOptions?: number[];
  minTopup?: number | string;
  onlineTopupEnabled?: boolean;
  paymentMethods?: TopupPaymentMethod[];
}

export interface TopupPaymentResult {
  amount?: number;
  paymentMethod?: string;
  payMoney?: string | null;
  outTradeNo?: string | null;
  payUrl?: string;
}

export interface TopupConfigPayload {
  ok?: boolean;
  data?: TopupConfig;
  error?: ApiError;
}

export interface TopupPaymentPayload {
  ok?: boolean;
  data?: TopupPaymentResult;
  error?: ApiError;
}

export interface SubscriptionPlan {
  id: number;
  title: string;
  subtitle: string;
  priceAmount: number;
  currency: string;
  durationUnit: string;
  durationValue: number;
  customSeconds: number;
  quotaResetPeriod: string;
  quotaResetCustomSeconds: number;
  sortOrder: number;
  allowBalancePay: boolean;
  allowWalletOverflow: boolean;
  maxPurchasePerUser: number;
  upgradeGroup: string;
  downgradeGroup: string;
  totalQuota: number | null;
}

export interface SubscriptionRecord {
  id: number;
  planId: number;
  planTitle: string;
  status: string;
  source: string;
  startTime: number;
  endTime: number;
  amountTotal: number;
  amountUsed: number;
  nextResetTime: number;
}

export interface SubscriptionConfig {
  plans?: SubscriptionPlan[];
  subscriptions?: SubscriptionRecord[];
  allSubscriptions?: SubscriptionRecord[];
  paymentMethods?: TopupPaymentMethod[];
  billingPreference?: string;
  onlinePaymentEnabled?: boolean;
}

export interface SubscriptionPaymentResult {
  planId?: number;
  paymentMethod?: string;
  payMoney?: string | null;
  outTradeNo?: string | null;
  payUrl?: string;
}

export interface SubscriptionConfigPayload {
  ok?: boolean;
  data?: SubscriptionConfig;
  error?: ApiError;
}

export interface SubscriptionPaymentPayload {
  ok?: boolean;
  data?: SubscriptionPaymentResult;
  error?: ApiError;
}

export interface ChangeEventLike {
  target: { value: string; checked?: boolean };
}

export interface FormEventLike {
  preventDefault?: () => void;
}

export interface ClickEventLike {
  key?: string;
  target?: unknown;
  currentTarget?: unknown;
  stopPropagation?: () => void;
}

export interface PanelIconViewProps {
  size?: number;
  active?: boolean;
}

export interface LoginFormProps {
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

export interface CardProps {
  data: DashboardData;
}

export interface CurrencyUnit {
  symbol: string;
  code: string;
  rate: number;
}

export type UiStatus = 'restoring' | 'idle' | 'pending' | 'ready';
export type PanelView = 'overview' | 'models' | 'subscription' | 'apiKeys';

export function formatNumber(value: unknown): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  const text = Math.abs(number) >= 1 ? number.toFixed(2) : number.toFixed(4);
  return text.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

export function currency(platform?: PlatformInfo): CurrencyUnit {
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

export function topupAmountCurrency(): CurrencyUnit {
  return { symbol: '$', code: 'USD', rate: 1 };
}

export function paymentCurrency(): CurrencyUnit {
  return { symbol: '¥', code: 'CNY', rate: 1 };
}

export function formatQuota(quota: unknown, platform?: PlatformInfo): string {
  const perUnit = Number(platform?.quota_per_unit) || 500000;
  const unit = currency(platform);
  return `${unit.symbol}${formatNumber((Number(quota) || 0) / perUnit * unit.rate)}`;
}

export function formatPercent(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

export function displayQuotaToUnits(value: unknown, platform?: PlatformInfo): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  const perUnit = Number(platform?.quota_per_unit) || 500000;
  const rate = currency(platform).rate || 1;
  const units = Math.round(amount * perUnit / rate);
  return Number.isSafeInteger(units) && units >= 0 ? units : null;
}

export function expiryTimeFromDays(value: unknown): number | null {
  const days = Number(value ?? 0);
  if (!Number.isFinite(days) || days < 0 || days > 36500) return null;
  if (days === 0) return -1;
  return Math.floor(Date.now() / 1000 + days * 86400);
}

export function apiKeyStatusLabel(t: DshTranslate, status: unknown): string {
  const value = Number(status);
  if (value === 1) return t('apiKeyStatusEnabled');
  if (value === 2) return t('apiKeyStatusDisabled');
  if (value === 3) return t('apiKeyStatusExpired');
  if (value === 4) return t('apiKeyStatusExhausted');
  return t('apiKeyStatusUnknown');
}

export function apiKeyStatusTone(status: unknown): string {
  return Number(status) === 1 ? 'mat-badge-ok' : 'mat-badge-warn';
}

export function apiKeyExpiryLabel(t: DshTranslate, expiredTime: unknown): string {
  const seconds = Number(expiredTime);
  if (seconds === -1) return t('neverExpires');
  if (!Number.isFinite(seconds) || seconds <= 0) return t('empty');
  return new Date(seconds * 1000).toLocaleString();
}

export function roleLabel(t: DshTranslate, role: unknown): string {
  const value = Number(role);
  if (value >= 100) return t('roleRoot');
  if (value >= 10) return t('roleAdmin');
  if (value === 1) return t('roleUser');
  return t('roleUnknown');
}

