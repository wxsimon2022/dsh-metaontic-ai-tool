import { TOPUP_PATH } from './constants.js';
import { formatNumber, paymentCurrency, topupAmountCurrency } from './runtime.js';
import type {
  CardProps,
  ChangeEventLike,
  ClientRuntime,
  FormEventLike,
  TopupConfig,
  TopupConfigPayload,
  TopupPaymentPayload,
  TopupPaymentResult,
} from './runtime.js';

export function createTopupPage({ React, h, t }: ClientRuntime) {
  return function TopupPage({ data }: CardProps) {
    const [config, setConfig] = React.useState<TopupConfig | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>('');
    const [notice, setNotice] = React.useState<string>('');
    const [amount, setAmount] = React.useState<string>('');
    const [paymentMethod, setPaymentMethod] = React.useState<string>('');
    const [creating, setCreating] = React.useState<boolean>(false);
    const [payment, setPayment] = React.useState<TopupPaymentResult | null>(null);
    const methods = Array.isArray(config?.paymentMethods) ? config.paymentMethods : [];
    const amountOptions = Array.isArray(config?.amountOptions) ? config.amountOptions : [];
    const minTopup = Number(config?.minTopup) || 1;
    const unit = topupAmountCurrency();
    const payUnit = paymentCurrency();

    async function loadConfig(): Promise<void> {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(TOPUP_PATH, { method: 'GET', cache: 'no-store' });
        let payload: TopupConfigPayload;
        try {
          payload = await response.json() as TopupConfigPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok || !payload.data) {
          throw new Error(payload?.error?.message || t('topupLoadFailed'));
        }
        const next = payload.data;
        const nextMethods = Array.isArray(next.paymentMethods) ? next.paymentMethods : [];
        const nextAmounts = Array.isArray(next.amountOptions) ? next.amountOptions : [];
        const nextMin = Number(next.minTopup) || 1;
        setConfig(next);
        setAmount(String(nextAmounts[0] || nextMin));
        setPaymentMethod(String(nextMethods[0]?.type || ''));
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('topupLoadFailed'));
      } finally {
        setLoading(false);
      }
    }

    React.useEffect(() => {
      void loadConfig();
    }, [data.baseUrl]);

    React.useEffect(() => {
      if (!payment?.payUrl || typeof document === 'undefined') return;
      const node = document.querySelector('.mat-pay-inline');
      node?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    }, [payment?.payUrl]);

    async function submit(event?: FormEventLike): Promise<void> {
      event?.preventDefault?.();
      if (creating || !config) return;
      const value = Number(amount);
      if (!Number.isSafeInteger(value) || value <= 0) {
        setError(t('topupAmountInvalid'));
        return;
      }
      if (value < minTopup) {
        setError(t('topupAmountTooSmall', { amount: `${unit.symbol}${formatNumber(minTopup)}` }));
        return;
      }
      if (!paymentMethod || !methods.some(method => method.type === paymentMethod)) {
        setError(t('topupNoMethods'));
        return;
      }
      setCreating(true);
      setError('');
      setNotice('');
      setPayment(null);
      try {
        const response = await fetch(TOPUP_PATH, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ amount: value, paymentMethod }),
        });
        let payload: TopupPaymentPayload;
        try {
          payload = await response.json() as TopupPaymentPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok || !payload.data?.payUrl) {
          throw new Error(payload?.error?.message || t('topupCreateFailed'));
        }
        setPayment(payload.data);
        setNotice(t('topupCreated'));
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('topupCreateFailed'));
      } finally {
        setCreating(false);
      }
    }

    function restart(): void {
      setPayment(null);
      setError('');
      setNotice('');
    }

    const form = config?.onlineTopupEnabled && methods.length > 0
      ? h('form', { key: 'form', className: 'mat-topup-grid', onSubmit: submit }, [
        h('label', { key: 'amount-field', className: 'mat-field' }, [
          h('span', { key: 'label', className: 'mat-label' }, t('topupAmount')),
          h('input', {
            key: 'input',
            className: 'mat-input',
            type: 'number',
            min: minTopup,
            step: 1,
            value: amount,
            onChange: (event: ChangeEventLike) => {
              setAmount(event.target.value);
              setPayment(null);
              setNotice('');
            },
            placeholder: t('topupAmountPlaceholder'),
            disabled: creating,
            required: true,
          }),
          amountOptions.length > 0
            ? h('div', { key: 'amounts', className: 'mat-choice-row' }, amountOptions.map(option => {
              const selected = Number(amount) === Number(option);
              return h('button', {
                key: String(option),
                type: 'button',
                className: `mat-choice${selected ? ' mat-choice-active' : ''}`,
                onClick: () => {
                  setAmount(String(option));
                  setPayment(null);
                  setNotice('');
                },
                disabled: creating,
              }, `${unit.symbol}${formatNumber(option)}`);
            }))
            : null,
          h('span', { key: 'hint', className: 'mat-hint' }, t('topupMinAmount', {
            amount: `${unit.symbol}${formatNumber(minTopup)}`,
          })),
        ]),
        h('div', { key: 'method-field', className: 'mat-field' }, [
          h('span', { key: 'label', className: 'mat-label' }, t('topupPayment')),
          h('div', { key: 'methods', className: 'mat-choice-row' }, methods.map(method => {
            const type = String(method.type || '');
            const selected = paymentMethod === type;
            return h('button', {
              key: type,
              type: 'button',
              className: `mat-choice${selected ? ' mat-choice-active' : ''}`,
              onClick: () => setPaymentMethod(type),
              disabled: creating,
            }, String(method.name || type));
          })),
        ]),
        h('div', { key: 'actions', className: 'mat-actions', style: { gridColumn: '1/-1' } }, h('button', {
          type: 'submit',
          className: 'mat-btn mat-btn-primary',
          disabled: creating,
        }, creating ? t('topupSubmitting') : t('topupSubmit'))),
      ])
      : null;

    const paidMoney = payment?.payMoney ? `${payUnit.symbol}${payment.payMoney}` : '';
    const paymentPanel = payment?.payUrl ? h('div', { key: 'payment', className: 'mat-topup-pay mat-pay-inline' }, [
      h('div', { key: 'money', className: 'mat-pay-line' }, [
        h('span', { key: 'label' }, paidMoney ? t('topupPayMoney') : t('topupAmount')),
        h('strong', { key: 'value' }, paidMoney || `${unit.symbol}${formatNumber(payment.amount || amount)}`),
      ]),
      payment.outTradeNo ? h('div', { key: 'order', className: 'mat-pay-line' }, [
        h('span', { key: 'label' }, t('topupOrderNo')),
        h('strong', { key: 'value', className: 'mat-mono' }, payment.outTradeNo),
      ]) : null,
      h('div', { key: 'actions', className: 'mat-pay-actions' }, [
        h('button', { key: 'again', type: 'button', className: 'mat-btn', onClick: restart }, t('topupAgain')),
        h('a', {
          key: 'open',
          className: 'mat-btn mat-btn-primary',
          href: payment.payUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          referrerPolicy: 'no-referrer',
        }, t('topupOpenPayment')),
      ]),
    ]) : null;

    return h('section', { className: 'mat-card mat-topup' }, [
      h('div', { key: 'head', className: 'mat-card-head' }, [
        h('div', { key: 'copy', className: 'mat-card-head-copy' }, [
          h('div', { key: 'title', className: 'mat-card-title' }, t('topup')),
          h('div', { key: 'hint', className: 'mat-hint' }, t('topupHint')),
        ]),
        h('button', {
          key: 'refresh',
          type: 'button',
          className: 'mat-btn mat-btn-sm',
          onClick: () => void loadConfig(),
          disabled: loading || creating,
        }, loading ? t('apiKeyRefreshing') : t('apiKeyRefresh')),
      ]),
      loading
        ? h('p', { key: 'loading', className: 'mat-hint' }, t('topupLoading'))
        : config
        ? h(React.Fragment, null, [
          h('div', { key: 'status', className: 'mat-topup-status' }, [
            h('span', {
              key: 'online',
              className: `mat-badge ${config.onlineTopupEnabled ? 'mat-badge-ok' : 'mat-badge-warn'}`,
            }, config.onlineTopupEnabled ? t('topupOnline') : t('topupOffline')),
          ]),
          !config.onlineTopupEnabled
            ? h('div', { key: 'offline', className: 'mat-error', role: 'alert' }, t('topupUnavailable'))
            : methods.length === 0
            ? h('div', { key: 'no-methods', className: 'mat-error', role: 'alert' }, t('topupNoMethods'))
            : paymentPanel || form,
        ])
        : null,
      error ? h('div', { key: 'error', className: 'mat-error', role: 'alert', style: { marginTop: 12 } }, error) : null,
      notice ? h('div', { key: 'notice', className: 'mat-notice', role: 'status', style: { marginTop: 12 } }, notice) : null,
    ]);
  };
}
