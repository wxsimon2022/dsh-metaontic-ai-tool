import { isRecord, QueryError } from './errors.js';
import { endpoint, readJson, requestJson, unwrap, upstreamOptions } from './http.js';
import { paymentMethodType, paymentMethods, signedPayment } from './payments.js';
import { getTopupInfo } from './topup.js';
import type { PaymentMethod } from './payments.js';
import type { QueryOptions } from './types.js';

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
  enabled: boolean;
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

export interface SubscriptionInfo {
  plans: SubscriptionPlan[];
  subscriptions: SubscriptionRecord[];
  allSubscriptions: SubscriptionRecord[];
  paymentMethods: PaymentMethod[];
  billingPreference: string;
  onlinePaymentEnabled: boolean;
}

export interface CreateSubscriptionOptions extends QueryOptions {
  planId: unknown;
  paymentMethod: unknown;
}

export interface SubscriptionPayment {
  planId: number;
  paymentMethod: string;
  payMoney: string | null;
  outTradeNo: string | null;
  payUrl: string;
}

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function numberValue(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function integerValue(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

function mapPlan(value: unknown): SubscriptionPlan | null {
  const source = isRecord(value) && isRecord(value.plan) ? value.plan : value;
  if (!isRecord(source)) return null;
  const id = Number(source.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const totalQuota = Number(source.total_amount);
  return {
    id,
    title: cleanText(source.title, 120) || `#${id}`,
    subtitle: cleanText(source.subtitle, 240),
    priceAmount: numberValue(source.price_amount),
    currency: cleanText(source.currency, 12).toUpperCase() || 'USD',
    durationUnit: cleanText(source.duration_unit, 16).toLowerCase() || 'month',
    durationValue: integerValue(source.duration_value, 1),
    customSeconds: integerValue(source.custom_seconds),
    quotaResetPeriod: cleanText(source.quota_reset_period, 24).toLowerCase() || 'never',
    quotaResetCustomSeconds: integerValue(source.quota_reset_custom_seconds),
    enabled: source.enabled !== false,
    sortOrder: integerValue(source.sort_order),
    allowBalancePay: source.allow_balance_pay === true,
    allowWalletOverflow: source.allow_wallet_overflow === true,
    maxPurchasePerUser: integerValue(source.max_purchase_per_user),
    upgradeGroup: cleanText(source.upgrade_group, 64),
    downgradeGroup: cleanText(source.downgrade_group, 64),
    totalQuota: Number.isFinite(totalQuota) && totalQuota >= 0 ? totalQuota : null,
  };
}

function mapSubscription(value: unknown, titles: Map<number, string>): SubscriptionRecord | null {
  if (!isRecord(value)) return null;
  const id = Number(value.id);
  const planId = Number(value.plan_id);
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(planId) || planId <= 0) return null;
  return {
    id,
    planId,
    planTitle: cleanText(titles.get(planId), 120) || `#${planId}`,
    status: cleanText(value.status, 24).toLowerCase() || 'unknown',
    source: cleanText(value.source, 24).toLowerCase(),
    startTime: integerValue(value.start_time),
    endTime: integerValue(value.end_time),
    amountTotal: numberValue(value.amount_total),
    amountUsed: numberValue(value.amount_used),
    nextResetTime: integerValue(value.next_reset_time),
  };
}

function mapSubscriptions(value: unknown, titles: Map<number, string>): SubscriptionRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => mapSubscription(item, titles))
    .filter((item): item is SubscriptionRecord => item !== null)
    .sort((left, right) => right.startTime - left.startTime)
    .slice(0, 50);
}

function subscriptionPlanId(value: unknown): number {
  const planId = Number(value);
  if (!Number.isSafeInteger(planId) || planId <= 0) {
    throw new QueryError('INVALID_SUBSCRIPTION_PLAN', '请选择有效的订阅套餐。');
  }
  return planId;
}

export async function getSubscriptionInfo(options: QueryOptions = {}): Promise<SubscriptionInfo> {
  const upstream = upstreamOptions(options);
  const [plansPayload, selfPayload, topup] = await Promise.all([
    readJson(endpoint(upstream.baseUrl, 'api/subscription/plans'), upstream),
    readJson(endpoint(upstream.baseUrl, 'api/subscription/self'), upstream),
    getTopupInfo(options).catch(() => null),
  ]);

  const planItems = unwrap(plansPayload);
  const self = unwrap(selfPayload);
  if (!Array.isArray(planItems) || !isRecord(self)) {
    throw new QueryError('INVALID_RESPONSE', '平台返回的订阅信息不完整。', 502);
  }

  const plans = planItems
    .map(mapPlan)
    .filter((plan): plan is SubscriptionPlan => plan !== null && plan.enabled)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.priceAmount - right.priceAmount || left.id - right.id)
    .slice(0, 50);
  const titles = new Map(plans.map(plan => [plan.id, plan.title]));
  const subscriptions = mapSubscriptions(self.subscriptions, titles);
  const allSubscriptions = mapSubscriptions(self.all_subscriptions, titles);

  return {
    plans,
    subscriptions,
    allSubscriptions,
    paymentMethods: paymentMethods(topup?.paymentMethods),
    billingPreference: cleanText(self.billing_preference, 32).toLowerCase(),
    onlinePaymentEnabled: topup?.onlineTopupEnabled === true,
  };
}

export async function createSubscriptionPayment(options: CreateSubscriptionOptions): Promise<SubscriptionPayment> {
  const upstream = upstreamOptions(options);
  const planId = subscriptionPlanId(options.planId);
  const paymentMethod = paymentMethodType(options.paymentMethod);
  const payload = await requestJson(endpoint(upstream.baseUrl, 'api/subscription/epay/pay'), {
    ...upstream,
    method: 'POST',
    body: { plan_id: planId, payment_method: paymentMethod },
  });
  return {
    planId,
    paymentMethod,
    ...signedPayment(payload),
  };
}
