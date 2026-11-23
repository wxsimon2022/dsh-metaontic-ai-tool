import { MAX_TOPUP_AMOUNT } from './constants.js';
import { isRecord, QueryError } from './errors.js';
import { endpoint, readJson, requestJson, unwrap, upstreamOptions } from './http.js';
import { paymentMethodType, paymentMethods, signedPayment } from './payments.js';
import type { PaymentMethod } from './payments.js';
import type { QueryOptions } from './types.js';

export type TopupPaymentMethod = PaymentMethod;

export interface TopupInfo {
  amountOptions: number[];
  minTopup: number;
  onlineTopupEnabled: boolean;
  paymentMethods: TopupPaymentMethod[];
}

export interface CreateTopupOptions extends QueryOptions {
  amount: unknown;
  paymentMethod: unknown;
}

export interface TopupPayment {
  amount: number;
  paymentMethod: string;
  payMoney: string | null;
  outTradeNo: string | null;
  payUrl: string;
}

function topupMinimum(value: unknown): number {
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_TOPUP_AMOUNT ? amount : 1;
}

function topupAmountOptions(value: unknown, minTopup: number): number[] {
  if (!Array.isArray(value)) return [];
  const amounts: number[] = [];
  for (const item of value) {
    const amount = Number(item);
    if (
      Number.isSafeInteger(amount)
      && amount >= minTopup
      && amount <= MAX_TOPUP_AMOUNT
      && !amounts.includes(amount)
    ) {
      amounts.push(amount);
    }
    if (amounts.length >= 12) break;
  }
  return amounts;
}

function topupAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_TOPUP_AMOUNT) {
    throw new QueryError('INVALID_TOPUP_AMOUNT', '充值金额必须是有效的正整数。');
  }
  return amount;
}

export async function getTopupInfo(options: QueryOptions = {}): Promise<TopupInfo> {
  const upstream = upstreamOptions(options);
  const payload = await readJson(endpoint(upstream.baseUrl, 'api/user/topup/info'), upstream);
  const data = unwrap(payload);
  if (!isRecord(data)) {
    throw new QueryError('INVALID_RESPONSE', '平台返回的充值配置不完整。', 502);
  }
  const minTopup = topupMinimum(data.min_topup);
  return {
    amountOptions: topupAmountOptions(data.amount_options, minTopup),
    minTopup,
    onlineTopupEnabled: data.enable_online_topup === true,
    paymentMethods: paymentMethods(data.pay_methods),
  };
}

export async function createTopup(options: CreateTopupOptions): Promise<TopupPayment> {
  const upstream = upstreamOptions(options);
  const amount = topupAmount(options.amount);
  const paymentMethod = paymentMethodType(options.paymentMethod);
  const payload = await requestJson(endpoint(upstream.baseUrl, 'api/user/pay'), {
    ...upstream,
    method: 'POST',
    body: { amount, payment_method: paymentMethod },
  });
  const payment = signedPayment(payload);
  return {
    amount,
    paymentMethod,
    ...payment,
  };
}
