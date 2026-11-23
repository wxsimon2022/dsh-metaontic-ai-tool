import { SUBSCRIPTION_PATH } from './constants.js';
import { currency, formatNumber, formatPercent, formatQuota } from './runtime.js';
import type {
  CardProps,
  ClientRuntime,
  FormEventLike,
  PlatformInfo,
  SubscriptionConfig,
  SubscriptionConfigPayload,
  SubscriptionPaymentPayload,
  SubscriptionPaymentResult,
  SubscriptionPlan,
  SubscriptionRecord,
  TopupPaymentMethod,
} from './runtime.js';

function planPrice(plan: SubscriptionPlan, platform?: PlatformInfo): string {
  return `${currency(platform).symbol}${formatNumber(plan.priceAmount)}`;
}

function dateTime(value: unknown, fallback: string): string {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return fallback;
  return new Date(seconds * 1000).toLocaleString();
}

function durationLabel(t: DshTranslate, plan: SubscriptionPlan): string {
  const count = Math.max(1, Number(plan.durationValue) || 1);
  switch (String(plan.durationUnit || '').toLowerCase()) {
    case 'day': return t('subscriptionDays', { count });
    case 'week': return t('subscriptionWeeks', { count });
    case 'month': return t('subscriptionMonths', { count });
    case 'year': return t('subscriptionYears', { count });
    case 'hour': return t('subscriptionHours', { count });
    case 'minute': return t('subscriptionMinutes', { count });
    case 'second': return t('subscriptionSeconds', { count });
    case 'custom': return t('subscriptionCustomDuration', { count: Math.max(1, Number(plan.customSeconds) || 1) });
    default: return `${count} ${plan.durationUnit || ''}`.trim();
  }
}

function resetLabel(t: DshTranslate, plan: SubscriptionPlan): string {
  const period = String(plan.quotaResetPeriod || '').toLowerCase();
  if (!period || period === 'never') return t('subscriptionNeverReset');
  const unitKey = {
    day: 'subscriptionResetDay',
    week: 'subscriptionResetWeek',
    month: 'subscriptionResetMonth',
    year: 'subscriptionResetYear',
  }[period];
  if (unitKey) return t(unitKey);
  if (period === 'custom') {
    return t('subscriptionResetCustom', { count: Math.max(1, Number(plan.quotaResetCustomSeconds) || 1) });
  }
  return t('subscriptionResetOther', { period });
}

function statusLabel(t: DshTranslate, status: unknown): string {
  switch (String(status || '').toLowerCase()) {
    case 'active': return t('subscriptionStatusActive');
    case 'expired': return t('subscriptionStatusExpired');
    case 'cancelled':
    case 'canceled': return t('subscriptionStatusCancelled');
    case 'pending': return t('subscriptionStatusPending');
    default: return t('subscriptionStatusUnknown');
  }
}

function statusTone(status: unknown): string {
  const value = String(status || '').toLowerCase();
  return value === 'active' ? 'mat-badge-ok' : 'mat-badge-warn';
}

export function createSubscriptionPage({ React, h, t }: ClientRuntime) {
  return function SubscriptionPage({ data }: CardProps) {
    const [config, setConfig] = React.useState<SubscriptionConfig | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>('');
    const [notice, setNotice] = React.useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = React.useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = React.useState<string>('');
    const [creating, setCreating] = React.useState<boolean>(false);
    const [payment, setPayment] = React.useState<SubscriptionPaymentResult | null>(null);

    async function loadConfig(showLoading = true): Promise<void> {
      if (showLoading) setLoading(true);
      setError('');
      try {
        const response = await fetch(SUBSCRIPTION_PATH, { method: 'GET', cache: 'no-store' });
        let payload: SubscriptionConfigPayload;
        try {
          payload = await response.json() as SubscriptionConfigPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok || !payload.data) {
          throw new Error(payload?.error?.message || t('subscriptionLoadFailed'));
        }
        const next = payload.data;
        const plans = Array.isArray(next.plans) ? next.plans : [];
        const methods = Array.isArray(next.paymentMethods) ? next.paymentMethods : [];
        setConfig({ ...next, plans, paymentMethods: methods });
        setSelectedPlanId(previous => plans.some(plan => plan.id === previous) ? previous : plans[0]?.id ?? null);
        setPaymentMethod(previous => methods.some(method => method.type === previous) ? previous : methods[0]?.type || '');
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('subscriptionLoadFailed'));
      } finally {
        if (showLoading) setLoading(false);
      }
    }

    React.useEffect(() => {
      void loadConfig();
    }, [data.baseUrl]);

    async function submit(event?: FormEventLike): Promise<void> {
      event?.preventDefault?.();
      if (!selectedPlanId || !paymentMethod) {
        setError(t('subscriptionSelectRequired'));
        return;
      }
      setCreating(true);
      setError('');
      setNotice('');
      setPayment(null);
      try {
        const response = await fetch(SUBSCRIPTION_PATH, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ planId: selectedPlanId, paymentMethod }),
        });
        let payload: SubscriptionPaymentPayload;
        try {
          payload = await response.json() as SubscriptionPaymentPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok || !payload.data?.payUrl) {
          throw new Error(payload?.error?.message || t('subscriptionCreateFailed'));
        }
        setPayment(payload.data);
        setNotice(t('subscriptionPaymentCreated'));
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('subscriptionCreateFailed'));
      } finally {
        setCreating(false);
      }
    }

    const plans = config?.plans ?? [];
    const methods = config?.paymentMethods ?? [];
    const current = config?.subscriptions ?? [];
    const selectedPlan = plans.find(plan => plan.id === selectedPlanId) ?? null;

    const currentList = current.length === 0
      ? h('p', { key: 'empty-current', className: 'mat-hint' }, t('subscriptionNone'))
      : h('div', { key: 'current-list', className: 'mat-sub-current-list' }, current.map((record: SubscriptionRecord) => {
        const total = Math.max(0, Number(record.amountTotal) || 0);
        const used = Math.max(0, Number(record.amountUsed) || 0);
        const remaining = Math.max(0, total - used);
        const remainingPercent = total > 0 ? Math.min(100, remaining / total * 100) : 100;
        const tone = remainingPercent <= 5 ? ' mat-progress-danger' : remainingPercent <= 20 ? ' mat-progress-warn' : '';
        return h('div', { key: String(record.id), className: 'mat-sub-current' }, [
          h('div', { key: 'head', className: 'mat-sub-current-head' }, [
            h('strong', { key: 'title', className: 'mat-sub-current-title' }, record.planTitle),
            h('span', { key: 'status', className: `mat-badge ${statusTone(record.status)}` }, statusLabel(t, record.status)),
          ]),
          h('div', { key: 'meta', className: 'mat-sub-meta' }, [
            h('span', { key: 'end' }, `${t('subscriptionEndsAt')} ${dateTime(record.endTime, t('empty'))}`),
            h('span', { key: 'remaining' }, `${t('subscriptionRemainingQuota')} ${formatQuota(remaining, data.platform)}`),
            record.nextResetTime > 0
              ? h('span', { key: 'reset' }, `${t('subscriptionNextReset')} ${dateTime(record.nextResetTime, t('empty'))}`)
              : null,
          ]),
          total > 0 ? h('div', { key: 'quota', className: 'mat-sub-quota-line' }, [
            h('div', { key: 'progress', className: 'mat-progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(remainingPercent) },
              h('div', { className: `mat-progress-bar${tone}`, style: { width: `${remainingPercent}%` } })),
            h('span', { key: 'text', className: 'mat-sub-quota-text' }, t('subscriptionUsage', {
              used: formatQuota(used, data.platform),
              total: formatQuota(total, data.platform),
              percent: formatPercent(remainingPercent),
            })),
          ]) : null,
        ]);
      }));

    const planList = plans.length === 0
      ? h('p', { key: 'empty-plans', className: 'mat-hint' }, t('subscriptionNoPlans'))
      : h('div', { key: 'plans', className: 'mat-sub-plans' }, plans.map(plan => {
        const selected = plan.id === selectedPlanId;
        return h('button', {
          key: String(plan.id),
          type: 'button',
          className: `mat-sub-plan${selected ? ' mat-sub-plan-active' : ''}`,
          onClick: () => {
            setSelectedPlanId(plan.id);
            setPayment(null);
            setNotice('');
          },
          disabled: creating,
        }, [
          h('div', { key: 'head', className: 'mat-sub-plan-head' }, [
            h('strong', { key: 'title', className: 'mat-sub-plan-title' }, plan.title),
            h('span', { key: 'price', className: 'mat-sub-plan-price' }, planPrice(plan, data.platform)),
          ]),
          plan.subtitle ? h('p', { key: 'subtitle', className: 'mat-sub-plan-subtitle' }, plan.subtitle) : null,
          h('div', { key: 'meta', className: 'mat-sub-plan-meta' }, [
            h('span', { key: 'duration', className: 'mat-badge' }, durationLabel(t, plan)),
            plan.totalQuota !== null
              ? h('span', { key: 'quota', className: 'mat-badge' }, formatQuota(plan.totalQuota, data.platform))
              : null,
            h('span', { key: 'reset', className: 'mat-badge' }, resetLabel(t, plan)),
            plan.maxPurchasePerUser > 0
              ? h('span', { key: 'limit', className: 'mat-badge' }, t('subscriptionPurchaseLimit', { count: plan.maxPurchasePerUser }))
              : null,
          ]),
          plan.upgradeGroup ? h('span', { key: 'group', className: 'mat-hint' }, t('subscriptionUpgradeGroup', { group: plan.upgradeGroup })) : null,
        ]);
      }));

    const methodChoices = methods.length > 0
      ? h('div', { key: 'methods', className: 'mat-choice-row' }, methods.map((method: TopupPaymentMethod) => {
        const type = String(method.type || '');
        return h('button', {
          key: type,
          type: 'button',
          className: `mat-choice${paymentMethod === type ? ' mat-choice-active' : ''}`,
          onClick: () => {
            setPaymentMethod(type);
            setPayment(null);
            setNotice('');
          },
          disabled: creating,
        }, String(method.name || type));
      }))
      : null;

    const payForm = plans.length > 0 && methods.length > 0
      ? h('form', { key: 'pay', className: 'mat-sub-pay', onSubmit: submit }, [
        h('div', { key: 'method', className: 'mat-field' }, [
          h('span', { key: 'label', className: 'mat-label' }, t('subscriptionPayment')),
          methodChoices,
        ]),
        h('div', { key: 'actions', className: 'mat-sub-pay-actions' }, [
          selectedPlan ? h('span', { key: 'selection', className: 'mat-hint' }, t('subscriptionSelected', {
            title: selectedPlan.title,
            price: planPrice(selectedPlan, data.platform),
          })) : null,
          h('button', {
            key: 'submit',
            type: 'submit',
            className: 'mat-btn mat-btn-primary',
            disabled: creating || !selectedPlanId || !paymentMethod,
          }, creating ? t('subscriptionSubmitting') : t('subscriptionSubmit')),
        ]),
      ])
      : null;
    const paymentUnavailable = plans.length > 0 && methods.length === 0
      ? h('div', { key: 'no-methods', className: 'mat-error', role: 'alert', style: { marginTop: 10 } }, t('subscriptionNoMethods'))
      : null;

    return h('section', { className: 'mat-card mat-subscription' }, [
      h('div', { key: 'head', className: 'mat-card-head' }, [
        h('div', { key: 'copy', className: 'mat-card-head-copy' }, [
          h('div', { key: 'title', className: 'mat-card-title' }, t('subscription')),
          h('div', { key: 'hint', className: 'mat-hint' }, t('subscriptionHint')),
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
        ? h('p', { key: 'loading', className: 'mat-hint' }, t('subscriptionLoading'))
        : config
        ? h(React.Fragment, null, [
          h('div', { key: 'current-section', className: 'mat-sub-section' }, [
            h('div', { key: 'title', className: 'mat-sub-section-title' }, t('subscriptionCurrent')),
            currentList,
          ]),
          h('div', { key: 'plans-section', className: 'mat-sub-section' }, [
            h('div', { key: 'title', className: 'mat-sub-section-title' }, t('subscriptionPlans')),
            planList,
            paymentUnavailable,
            payForm,
          ]),
        ])
        : null,
      error ? h('div', { key: 'error', className: 'mat-error', role: 'alert', style: { marginTop: 12 } }, error) : null,
      notice ? h('div', { key: 'notice', className: 'mat-notice', role: 'status', style: { marginTop: 12 } }, notice) : null,
      payment?.payUrl ? h('div', { key: 'payment', className: 'mat-pay-result' }, [
        payment.payMoney ? h('div', { key: 'money', className: 'mat-pay-line' }, [
          h('span', { key: 'label' }, t('subscriptionPayMoney')),
          h('strong', { key: 'value' }, `${currency(data.platform).symbol}${payment.payMoney}`),
        ]) : null,
        payment.outTradeNo ? h('div', { key: 'order', className: 'mat-pay-line' }, [
          h('span', { key: 'label' }, t('topupOrderNo')),
          h('strong', { key: 'value', className: 'mat-mono' }, payment.outTradeNo),
        ]) : null,
        h('div', { key: 'actions', className: 'mat-pay-actions' }, h('a', {
          className: 'mat-btn mat-btn-primary',
          href: payment.payUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          referrerPolicy: 'no-referrer',
        }, t('subscriptionOpenPayment'))),
      ]) : null,
    ]);
  };
}
