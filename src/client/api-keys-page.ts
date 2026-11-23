import { API_KEYS_PATH } from './constants.js';
import {
  apiKeyExpiryLabel,
  apiKeyStatusLabel,
  apiKeyStatusTone,
  displayQuotaToUnits,
  expiryTimeFromDays,
  formatQuota,
} from './runtime.js';
import type {
  ApiKeyActionPayload,
  ApiKeyInfo,
  ApiKeySecretPayload,
  ApiKeysPayload,
  CardProps,
  ChangeEventLike,
  ClickEventLike,
  ClientRuntime,
  FormEventLike,
} from './runtime.js';

export function createApiKeysPage({ React, h, t }: ClientRuntime) {
  return function ApiKeysPage({ data }: CardProps) {
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

    React.useEffect(() => {
      if (!createOpen || typeof document === 'undefined') return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previous; };
    }, [createOpen]);

    function resetCreateForm(): void {
      setName('');
      setUnlimited(true);
      setQuota('');
      setExpiryDays('0');
    }

    function closeCreate(): void {
      if (creating) return;
      setCreateOpen(false);
      resetCreateForm();
      setError('');
    }

    function handleBackdrop(event: ClickEventLike): void {
      if (event.target === event.currentTarget) closeCreate();
    }

    function handleDialogKeyDown(event: ClickEventLike): void {
      if (event.key === 'Escape') closeCreate();
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
      ? h('div', { key: 'create-modal', className: 'mat-modal-backdrop', onClick: handleBackdrop }, [
        h('form', {
          key: 'create',
          className: 'mat-key-create mat-modal',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'mat-key-dialog-title',
          onSubmit: createKey,
          onKeyDown: handleDialogKeyDown,
        }, [
          h('div', { key: 'head', className: 'mat-modal-head' }, [
            h('div', { key: 'copy', className: 'mat-modal-copy' }, [
              h('div', { key: 'title', id: 'mat-key-dialog-title', className: 'mat-modal-title' }, t('apiKeyNew')),
              h('div', { key: 'hint', className: 'mat-hint' }, t('apiKeyCreateHint')),
            ]),
            h('button', {
              key: 'close',
              type: 'button',
              className: 'mat-modal-close',
              'aria-label': t('apiKeyCancel'),
              onClick: closeCreate,
              disabled: creating,
            }, '×'),
          ]),
          h('label', { key: 'name', className: 'mat-field mat-modal-wide' }, [
            h('span', { key: 'label', className: 'mat-label' }, t('apiKeyName')),
            h('input', {
              key: 'input',
              className: 'mat-input',
              value: name,
              onChange: (event: ChangeEventLike) => setName(event.target.value),
              placeholder: t('apiKeyNamePlaceholder'),
              maxLength: 50,
              autoComplete: 'off',
              autoFocus: true,
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
          h('label', { key: 'unlimited', className: 'mat-key-check mat-modal-wide' }, [
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
            h('button', { key: 'cancel', type: 'button', className: 'mat-btn mat-btn-sm', onClick: closeCreate, disabled: creating }, t('apiKeyCancel')),
            h('button', { key: 'submit', type: 'submit', className: 'mat-btn mat-btn-primary mat-btn-sm', disabled: creating },
              creating ? t('apiKeyCreating') : t('apiKeyCreate')),
          ]),
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
          keyText ? h('code', {
            key: 'secret',
            className: 'mat-key-secret',
          }, keyText) : null,
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
              if (createOpen) {
                closeCreate();
              } else {
                setCreateOpen(true);
              }
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
  };
}
