import { currency, formatPercent, formatQuota, roleLabel } from './runtime.js';
import type { CardProps, ClientRuntime } from './runtime.js';

export function createOverviewPage({ h, t }: ClientRuntime) {
  return function OverviewPage({ data }: CardProps) {
    const { account, platform, fetchedAt } = data;
    const remaining = Number(account.quota) || 0;
    const used = Number(account.used_quota) || 0;
    const total = remaining + used;
    const remainingPercentage = total > 0 ? Math.min(100, Math.max(0, remaining / total * 100)) : 0;
    const progressTone = remainingPercentage <= 5 ? ' mat-progress-danger' : remainingPercentage <= 20 ? ' mat-progress-warn' : '';
    const statusActive = Number(account.status) !== 2;
    const unit = currency(platform);
    const showDisplayName = Boolean(account.display_name && account.display_name !== account.username);
    const accountParts: string[] = [];
    if (account.username) accountParts.push(String(account.username));
    if (showDisplayName) accountParts.push(String(account.display_name));
    if (account.group) accountParts.push(String(account.group));
    accountParts.push(roleLabel(t, account.role));
    if (account.id !== undefined && account.id !== null && account.id !== '') {
      accountParts.push(`${t('accountId')} ${account.id}`);
    }
    const platformParts = [
      platform.version ? `${t('version')} ${platform.version}` : '',
      unit.code,
      `${t('fetchedAt')} ${new Date(fetchedAt).toLocaleString()}`,
    ].filter(Boolean);
    return h('section', { className: 'mat-card mat-overview' }, [
      h('div', { key: 'head', className: 'mat-card-head' }, [
        h('div', { key: 'title', className: 'mat-card-title' }, t('accountPlatform')),
        h('div', { key: 'badges', className: 'mat-badges' }, [
          h('span', { key: 'status', className: `mat-badge ${statusActive ? 'mat-badge-ok' : 'mat-badge-warn'}` },
            statusActive ? t('enabled') : t('disabled')),
          h('span', { key: 'currency', className: 'mat-badge' }, `${unit.code} ${unit.symbol}`),
        ]),
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
      h('div', { key: 'summary', className: 'mat-compact-lines' }, [
        h('div', { key: 'account', className: 'mat-compact-line' }, [
          h('span', { key: 'label', className: 'mat-compact-label' }, t('account')),
          h('span', { key: 'value', className: 'mat-compact-value' }, accountParts.join(' · ') || t('empty')),
        ]),
        h('div', { key: 'platform', className: 'mat-compact-line' }, [
          h('span', { key: 'label', className: 'mat-compact-label' }, t('platform')),
          h('span', { key: 'value', className: 'mat-compact-value' }, platformParts.join(' · ')),
        ]),
      ]),
    ]);
  };
}
