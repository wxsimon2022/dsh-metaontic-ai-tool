import { REGISTER_PATH, REGISTER_URL } from './constants.js';
import { cachedRegisterConfig, loadRegisterConfig } from './register-config.js';
import type { RegisterConfig } from './register-config.js';
import type { ChangeEventLike, ClientRuntime } from './runtime.js';

interface RegisterPayload { ok?: boolean; data?: RegisterConfig; error?: { message?: string }; }

export function createRegisterDialog({ React, h, t }: ClientRuntime) {
  return function RegisterDialog({ onClose }: { onClose: () => void }) {
    const [config, setConfig] = React.useState<RegisterConfig | null>(cachedRegisterConfig());
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirm, setConfirm] = React.useState('');
    const [code, setCode] = React.useState('');
    const [acceptedTerms, setAcceptedTerms] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState('');
    const [notice, setNotice] = React.useState('');
    const [done, setDone] = React.useState(false);
    const [cooldown, setCooldown] = React.useState(0);
    React.useEffect(() => {
      let active = true;
      void loadRegisterConfig().then(data => {
        if (active) setConfig(data);
      }).catch(() => { if (active) setError(t('registerUnavailable')); });
      return () => { active = false; };
    }, []);
    React.useEffect(() => {
      if (!cooldown) return;
      const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
      return () => clearTimeout(timer);
    }, [cooldown]);
    async function submit(action: 'register' | 'send-code') {
      if (busy || !config || done) return;
      setError(''); setNotice('');
      if ((config.userAgreement || config.privacyPolicy) && !acceptedTerms) { setError(t('registerTermsRequired')); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(t('registerEmailInvalid')); return; }
      if (action === 'register' && (password.length < 8 || password.length > 128 || password !== confirm)) {
        setError(t('registerPasswordInvalid')); return;
      }
      if (action === 'register' && (!username.trim() || (config.emailVerification && !code.trim()))) {
        setError(t('registerFieldsRequired')); return;
      }
      setBusy(true);
      try {
        const response = await fetch(REGISTER_PATH, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify(action === 'send-code' ? { action, email, acceptedTerms } : {
            action, email, username, password, verification_code: code, acceptedTerms,
          }),
        });
        const payload = await response.json() as RegisterPayload;
        if (!response.ok || !payload.ok) throw new Error(payload.error?.message || t('registerUnavailable'));
        if (action === 'send-code') { setCooldown(60); setNotice(t('registerCodeSent')); }
        else { setPassword(''); setConfirm(''); setCode(''); setDone(true); setNotice(t('registerSuccess')); }
      } catch (failure) { setError(failure instanceof Error ? failure.message : t('registerUnavailable')); }
      finally { setBusy(false); }
    }
    function field(label: string, value: string, setter: (value: string) => void, type: string, autoComplete: string) {
      return h('label', { key: label, className: 'mat-field' }, [
        h('span', { key: 'label', className: 'mat-label' }, label),
        h('input', { key: 'input', className: 'mat-input', type, value, autoComplete, disabled: busy,
          maxLength: type === 'password' ? 128 : type === 'email' ? 254 : 20,
          onChange: (event: ChangeEventLike) => setter(event.target.value) }),
      ]);
    }
    const available = config?.enabled && !config.webRequired;
    return h('dialog', { className: 'mat-token-dialog mat-register-dialog',
      'aria-labelledby': 'mat-register-title',
      ref: (node: HTMLDialogElement | null) => { if (node && !node.open) node.showModal(); },
      onCancel: onClose, onClose,
      onKeyDown: (event: { key: string; target: { tagName?: string }; preventDefault: () => void }) => {
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
          event.preventDefault();
          if (available) void submit('register');
        }
      },
    }, [
      h('div', { key: 'head', className: 'mat-modal-head' }, [
        h('div', { key: 'title', className: 'mat-modal-title', id: 'mat-register-title' }, t('registerInline')),
        h('button', { key: 'close', type: 'button', className: 'mat-modal-close', 'aria-label': t('apiKeyCancel'), onClick: onClose }, '×'),
      ]),
      h('p', { key: 'hint', className: 'mat-hint' }, t('registerPlatformHint')),
      !config && !error ? h('p', { key: 'loading', className: 'mat-hint' }, t('registerLoading')) : null,
      config && !available ? h('p', { key: 'web-required', className: 'mat-hint' }, t('registerWebRequired')) : null,
      available && !done ? h('div', { key: 'fields', className: 'mat-register-fields' }, [
        field(t('registerUsername'), username, setUsername, 'text', 'username'),
        field(t('registerEmail'), email, setEmail, 'email', 'email'),
        field(t('registerPassword'), password, setPassword, 'password', 'new-password'),
        field(t('registerConfirm'), confirm, setConfirm, 'password', 'new-password'),
        config?.emailVerification ? h('div', { key: 'code', className: 'mat-field' }, [
          h('label', { key: 'label', className: 'mat-label', htmlFor: 'mat-register-code' }, t('registerCode')),
          h('div', { key: 'row', className: 'mat-input-wrap' }, [
            h('input', { key: 'input', id: 'mat-register-code', className: 'mat-input', value: code, maxLength: 32,
              autoComplete: 'one-time-code', disabled: busy, onChange: (e: ChangeEventLike) => setCode(e.target.value) }),
            h('button', { key: 'send', type: 'button', className: 'mat-btn', disabled: busy || cooldown > 0,
              onClick: () => void submit('send-code') }, cooldown ? `${cooldown}s` : t('registerSendCode')),
          ]),
        ]) : null,
        config.userAgreement || config.privacyPolicy ? h('label', { key: 'terms', className: 'mat-hint mat-register-terms' }, [
          h('input', { key: 'check', type: 'checkbox', checked: acceptedTerms, disabled: busy,
            onChange: (event: { target: { checked: boolean } }) => setAcceptedTerms(event.target.checked) }),
          h('span', { key: 'copy', className: 'mat-register-terms-copy' }, [t('registerAcceptTerms'),
          config.userAgreement ? h('a', { key: 'agreement', href: 'https://ai.bileego.com/user-agreement', target: '_blank', rel: 'noopener noreferrer' }, t('registerAgreement')) : null,
          config.userAgreement && config.privacyPolicy ? ' / ' : null,
          config.privacyPolicy ? h('a', { key: 'privacy', href: 'https://ai.bileego.com/privacy-policy', target: '_blank', rel: 'noopener noreferrer' }, t('registerPrivacy')) : null,
          ]),
        ]) : null,
        h('button', { key: 'submit', type: 'button', className: 'mat-btn mat-btn-primary', disabled: busy,
          onClick: () => void submit('register') }, busy ? t('registerWorking') : t('registerSubmit')),
      ]) : null,
      error ? h('div', { key: 'error', className: 'mat-error', role: 'alert' }, error) : null,
      notice ? h('div', { key: 'notice', className: 'mat-notice', role: 'status' }, notice) : null,
      done ? h('button', { key: 'done', type: 'button', className: 'mat-btn mat-btn-primary', onClick: onClose }, t('registerBack')) : null,
      h('a', { key: 'web', href: REGISTER_URL, target: '_blank', rel: 'noopener noreferrer', referrerPolicy: 'no-referrer', className: 'mat-register-web' }, t('registerWeb')),
    ]);
  };
}
