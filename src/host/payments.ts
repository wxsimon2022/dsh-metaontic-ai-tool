import { MAX_PAYMENT_URL_LENGTH } from './constants.js';
import { isRecord, QueryError } from './errors.js';
import { assertUpstreamSuccess } from './http.js';

export interface PaymentMethod {
  name: string;
  type: string;
}

export interface SignedPayment {
  payMoney: string | null;
  outTradeNo: string | null;
  payUrl: string;
}

export function paymentString(value: unknown, maxLength = 160): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();
  return text ? text.slice(0, maxLength) : null;
}

export function paymentMethodType(value: unknown): string {
  const method = String(value ?? '').trim();
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(method)) {
    throw new QueryError('INVALID_PAYMENT_METHOD', '请选择有效的支付方式。');
  }
  return method;
}

function paymentMethod(value: unknown): PaymentMethod | null {
  if (!isRecord(value)) return null;
  const type = String(value.type ?? '').trim();
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(type)) return null;
  const name = String(value.name ?? '')
    .trim()
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 40);
  return { name: name || type, type };
}

export function paymentMethods(value: unknown): PaymentMethod[] {
  if (!Array.isArray(value)) return [];
  const methods: PaymentMethod[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const method = paymentMethod(item);
    if (!method || seen.has(method.type)) continue;
    seen.add(method.type);
    methods.push(method);
    if (methods.length >= 8) break;
  }
  return methods;
}

export function signedPaymentUrl(action: unknown, data: unknown): string {
  if (typeof action !== 'string' || !action.trim() || !isRecord(data)) {
    throw new QueryError('INVALID_RESPONSE', '平台没有返回完整的支付信息。', 502);
  }
  let url: URL;
  try {
    url = new URL(action.trim());
  } catch {
    throw new QueryError('INVALID_RESPONSE', '平台返回了无效的支付地址。', 502);
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new QueryError('INVALID_RESPONSE', '平台返回了无效的支付地址。', 502);
  }

  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(key)) {
      throw new QueryError('INVALID_RESPONSE', '平台返回了无效的支付参数。', 502);
    }
    if (value === null || value === undefined) params[key] = '';
    else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      params[key] = String(value);
    }
  }
  if (!params.sign?.trim()) {
    throw new QueryError('INVALID_RESPONSE', '平台返回的支付信息缺少签名。', 502);
  }
  for (const [key, value] of Object.entries(params)) url.searchParams.append(key, value);
  const payUrl = url.toString();
  if (payUrl.length > MAX_PAYMENT_URL_LENGTH) {
    throw new QueryError('INVALID_RESPONSE', '平台返回的支付地址过长。', 502);
  }
  return payUrl;
}

export function signedPayment(payload: unknown): SignedPayment {
  assertUpstreamSuccess(payload);
  const response = isRecord(payload) ? payload : {};
  const data = isRecord(response.data) ? response.data : {};
  return {
    payMoney: paymentString(data.money, 32),
    outTradeNo: paymentString(data.out_trade_no ?? data.trade_no, 128),
    payUrl: signedPaymentUrl(response.url ?? response.pay_url, data),
  };
}
