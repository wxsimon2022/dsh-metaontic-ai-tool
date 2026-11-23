import { DEFAULT_BASE_URL, REGISTER_URL } from './constants.js';
import logoUrl from '../metaontic-ai.png';
import type {
  ChangeEventLike,
  ClientRuntime,
  FormEventLike,
  LoginFormProps,
  PanelIconViewProps,
} from './runtime.js';

export function createPanelIconView({ h }: ClientRuntime) {
  return function PanelIconView({ size = 18, active = false }: PanelIconViewProps) {
    const pixels = Number(size) || 18;
    return h('img', {
      src: logoUrl,
      width: pixels,
      height: pixels,
      alt: '',
      className: active ? 'mat-panel-logo mat-panel-logo-active' : 'mat-panel-logo',
      'aria-hidden': true,
      draggable: false,
      style: { width: `${pixels}px`, height: `${pixels}px` },
    });
  };
}

export function createHeader(runtime: ClientRuntime) {
  const { h, t } = runtime;
  const PanelIconView = createPanelIconView(runtime);
  return function Header() {
    return h('div', { className: 'mat-hero' }, [
      h('div', { key: 'mark', className: 'mat-mark', 'aria-hidden': true }, h(PanelIconView, { size: 30 })),
      h('div', { key: 'copy' }, [
        h('h2', { key: 'title', className: 'mat-title' }, t('title')),
        h('p', { key: 'intro', className: 'mat-intro' }, t('intro')),
      ]),
    ]);
  };
}

export function createLoginForm({ h, t }: ClientRuntime) {
  return function LoginForm({ baseUrl, setBaseUrl, token, setToken, showToken, setShowToken, pending, error, onSubmit }: LoginFormProps) {
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
  };
}
