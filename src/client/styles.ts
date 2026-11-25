export const PANEL_CSS = `
  .mat-root{container-type:inline-size;box-sizing:border-box;width:100%;max-width:1040px;height:100%;max-height:100vh;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;margin:0 auto;padding:22px 24px 40px;color:var(--dsw-alias-label-primary,#1f2329);font-size:13px;line-height:1.5}
  .mat-hero{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;padding:17px 18px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 14%,var(--dsw-alias-border-l1,#e4e8ee));border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 9%,transparent),transparent 62%),var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 10px 30px rgba(15,23,42,.05)}
  .mat-mark{flex:0 0 auto;display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1,#e4e8ee),0 6px 16px rgba(15,23,42,.06)}
  .mat-panel-logo{display:block;flex:0 0 auto;object-fit:contain;filter:drop-shadow(0 0 1px rgba(255,255,255,.95))}
  .mat-panel-logo-active{filter:drop-shadow(0 0 1px rgba(255,255,255,.95)) drop-shadow(0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 55%,transparent))}
  .mat-title{margin:0;font-size:20px;font-weight:680;letter-spacing:-.015em;line-height:1.35}
  .mat-intro{margin:4px 0 0;color:var(--dsw-alias-label-secondary,#67707c);font-size:12.5px;line-height:1.6}
  .mat-card{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:16px;background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1,#fff));padding:18px;box-shadow:0 10px 28px rgba(15,23,42,.045)}
  .mat-login{display:flex;flex-direction:column;gap:22px;width:100%;max-width:520px;box-sizing:border-box;margin:24px auto 0;padding:28px;box-shadow:0 16px 42px rgba(15,23,42,.06)}
  .mat-login-analytics{display:flex;align-items:flex-start;gap:8px}.mat-login-analytics input{flex-shrink:0;margin-top:3px}
  .mat-token-heading{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px 12px}
  .mat-token-help{border:0;padding:0;background:transparent;color:var(--dsw-alias-brand-primary,#2563eb);font:inherit;font-size:12px;cursor:pointer}
  .mat-token-help:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2563eb);outline-offset:3px}
  .mat-token-dialog{box-sizing:border-box;width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;margin:auto;padding:22px;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:16px;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#1f2329);box-shadow:0 24px 70px rgba(15,23,42,.25);font:inherit}
  .mat-register-dialog>.mat-hint{margin:12px 0}.mat-register-fields{display:grid;gap:14px;margin:16px 0}.mat-register-dialog>.mat-btn{margin-top:12px}.mat-register-dialog>.mat-notice,.mat-register-dialog>.mat-error{margin-top:12px}
  .mat-register-dialog{width:min(480px,calc(100vw - 32px));padding:26px;border-radius:20px;line-height:1.6}
  .mat-register-dialog .mat-modal-head{padding-bottom:16px;border-bottom:1px solid var(--dsw-alias-border-l1,#e4e8ee)}
  .mat-register-dialog .mat-modal-title{font-size:20px;letter-spacing:-.02em}
  .mat-register-dialog>.mat-hint{margin:14px 0 20px;font-size:12px;line-height:1.7}
  .mat-register-dialog .mat-register-fields{gap:16px;margin:0 0 18px}
  .mat-register-dialog .mat-field{gap:7px}.mat-register-dialog .mat-label{font-size:12px}
  .mat-register-dialog .mat-input{height:42px;font-family:inherit}
  .mat-register-dialog .mat-input-wrap{display:flex;flex-wrap:nowrap;gap:8px}
  .mat-register-dialog .mat-input-wrap>.mat-btn{height:42px;flex-shrink:0;padding:0 12px;color:var(--dsw-alias-brand-primary,#2563eb);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 5%,var(--dsw-alias-bg-layer-1,#fff))}
  .mat-register-terms{display:flex;align-items:flex-start;gap:9px;padding:12px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,#f5f7fa);font-size:12px;cursor:pointer}
  .mat-register-terms>input{width:15px;height:15px;flex:0 0 auto;margin:2px 0 0;accent-color:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-register-terms a,.mat-register-web{color:var(--dsw-alias-brand-primary,#2563eb);text-decoration:none}.mat-register-terms a:hover,.mat-register-web:hover{text-decoration:underline}
  .mat-register-fields>.mat-btn-primary,.mat-register-dialog>.mat-btn-primary{width:100%;height:44px;font-size:14px}
  .mat-register-web{display:block;margin-top:18px;padding-top:16px;border-top:1px solid var(--dsw-alias-border-l1,#e4e8ee);text-align:center;font-size:12px;font-weight:600}
  @media(max-width:420px){.mat-register-dialog{padding:20px;border-radius:16px}.mat-register-dialog .mat-input-wrap>.mat-btn{padding:0 10px;font-size:12px}}
  .mat-token-dialog::backdrop{background:rgba(15,23,42,.48);backdrop-filter:blur(2px)}
  .mat-token-help-steps{margin:16px 0 0;padding:14px 14px 14px 32px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,#f5f7fa);color:var(--dsw-alias-label-secondary,#67707c);font-size:13px;line-height:1.8}.mat-token-help-steps li+li{margin-top:10px}
  .mat-login-heading{display:grid;gap:6px;padding-bottom:18px;border-bottom:1px solid var(--dsw-alias-border-l1,#e4e8ee)}
  .mat-login-title{margin:0;font-size:18px;font-weight:650;letter-spacing:-.01em}
  .mat-login .mat-input{height:44px}
  .mat-login .mat-input-wrap>.mat-btn{height:44px}
  .mat-login .mat-register{flex-direction:column;justify-content:center;gap:12px;margin-top:0;padding:20px 0 0;border-top:1px solid var(--dsw-alias-border-l1,#e4e8ee)}
  .mat-login .mat-register-actions{display:flex;flex-wrap:nowrap;gap:8px;width:100%;max-width:320px}.mat-login .mat-register-actions>.mat-btn{flex:1;min-width:0;height:38px}
  .mat-login-privacy{text-align:center;margin-top:-12px}
  .mat-login .mat-login-token{position:relative;display:flex;flex-wrap:nowrap}.mat-login-token>.mat-input{padding-right:72px}.mat-login .mat-login-token>.mat-btn{position:absolute;right:5px;top:5px;height:34px;border:0;background:transparent;padding:0 10px;color:var(--dsw-alias-label-secondary,#67707c)}
  .mat-login>.mat-actions{margin-top:0}
  .mat-login>.mat-actions .mat-btn{height:44px;font-size:14px;border-radius:10px}
  @container (max-width:380px){.mat-login{padding:18px;gap:18px;margin-top:16px}.mat-login .mat-login-token{flex-wrap:nowrap}}
  .mat-field{display:flex;flex-direction:column;gap:8px}
  .mat-label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary,#1f2329)}
  .mat-input-wrap{display:flex;gap:8px}
  .mat-input{box-sizing:border-box;width:100%;min-width:0;height:40px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 12px;font:inherit;outline:none;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}
  .mat-input:hover{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 24%,var(--dsw-alias-border-l1,#d9dee6))}
  .mat-input:focus{border-color:var(--dsw-alias-brand-primary,#2563eb);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 13%,transparent)}
  .mat-hint{margin:0;color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;line-height:1.55}
  .mat-register-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mat-register-actions>.mat-btn{min-width:96px;justify-content:center;margin:0}
  .mat-register{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
  .mat-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 14px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s ease,border-color .15s ease,box-shadow .15s ease,transform .15s ease}
  .mat-btn:hover{background:var(--dsw-alias-bg-layer-2,#f5f7fa);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 18%,var(--dsw-alias-border-l1,#d9dee6))}
  .mat-btn:active{transform:translateY(1px)}
  .mat-btn:focus-visible{outline:2px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 42%,transparent);outline-offset:2px}
  .mat-btn:disabled{cursor:not-allowed;opacity:.55}
  .mat-btn-primary{border-color:transparent;background:var(--dsw-alias-brand-primary,#2563eb);color:#fff;box-shadow:0 5px 14px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 24%,transparent)}
  .mat-btn-primary:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 88%,#000)}
  .mat-btn-register{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 32%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 7%,transparent);color:var(--dsw-alias-brand-primary,#2563eb);text-decoration:none}
  .mat-btn-register:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 13%,transparent)}
  .mat-actions{display:flex;flex-wrap:wrap;align-items:center;gap:9px}
  .mat-actions .mat-btn-primary{flex:1 1 210px}
  .mat-error{display:flex;gap:8px;align-items:flex-start;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 8%,transparent);color:var(--dsw-alias-state-error-primary,#c62828);padding:9px 11px;font-size:12px;line-height:1.55}
  .mat-notice{display:flex;gap:8px;align-items:flex-start;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2e7d32) 8%,transparent);color:var(--dsw-alias-state-success-primary,#2e7d32);padding:9px 11px;font-size:12px;line-height:1.55}
  .mat-topbar{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-bottom:14px;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:14px;background:var(--dsw-alias-bg-layer-1,#fff);padding:12px 14px;box-shadow:0 6px 18px rgba(15,23,42,.035)}
  .mat-topbar-title{flex:1 1 220px;min-width:0}
  .mat-platform-name{margin:0;font-size:16.5px;font-weight:680;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mat-subtle{color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;line-height:1.5}
  .mat-page-tabs{display:flex;gap:4px;margin:0 0 16px;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:12px;background:var(--dsw-alias-bg-layer-2,#f5f7fa);padding:4px;overflow-x:auto;scrollbar-width:none}
  .mat-page-tabs::-webkit-scrollbar{display:none}
  .mat-page-tab{flex:1 0 auto;height:32px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#67707c);padding:0 14px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s ease,color .15s ease,box-shadow .15s ease}
  .mat-page-tab:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 58%,transparent);color:var(--dsw-alias-label-primary,#1f2329)}
  .mat-page-tab-active{background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-brand-primary,#2563eb);box-shadow:0 1px 4px rgba(15,23,42,.08),inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 16%,transparent)}
  .mat-overview{margin-top:0;padding:16px 18px}
  .mat-overview .mat-card-head{margin-bottom:9px}
  .mat-overview .mat-metrics{gap:8px}
  .mat-overview .mat-metric{padding:11px 12px}
  .mat-overview .mat-metric-value{font-size:18px}
  .mat-overview .mat-progress{margin:7px 0 0}
  .mat-overview-stack{display:grid;overflow:hidden;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:16px;background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1,#fff));box-shadow:0 10px 28px rgba(15,23,42,.045)}
  .mat-overview-stack>.mat-card{margin:0;border:0;border-radius:0;background:transparent;padding:16px 18px;box-shadow:none}
  .mat-overview-stack>.mat-card+.mat-card{border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee)}
  .mat-badges{display:flex;flex-wrap:wrap;gap:6px}
  .mat-compact-lines{display:grid;gap:5px;margin-top:10px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:9px}
  .mat-compact-line{display:flex;gap:8px;font-size:11.5px;line-height:1.5}
  .mat-compact-label{flex:0 0 60px;color:var(--dsw-alias-label-secondary,#67707c)}
  .mat-compact-value{min-width:0;overflow-wrap:anywhere}
  .mat-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
  .mat-card-title{font-size:13.5px;font-weight:680;letter-spacing:-.01em}
  .mat-badge{border-radius:999px;background:var(--dsw-alias-bg-layer-2,#f1f4f8);color:var(--dsw-alias-label-secondary,#67707c);padding:3px 9px;font-size:10.5px;font-weight:600;line-height:1.35}
  .mat-badge-ok{background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2e7d32) 10%,transparent);color:var(--dsw-alias-state-success-primary,#2e7d32)}
  .mat-badge-warn{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b26a00) 10%,transparent);color:var(--dsw-alias-state-warn-primary,#b26a00)}
  .mat-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
  .mat-metric{border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#e4e8ee) 82%,transparent);border-radius:12px;background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 4%,transparent),transparent);padding:12px 13px}
  .mat-metric-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:10.5px}
  .mat-metric-value{margin-top:6px;font-size:19px;font-weight:700;letter-spacing:-.02em;line-height:1.2;overflow-wrap:anywhere}
  .mat-progress{height:8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,#eef1f5);overflow:hidden;margin:13px 0 7px}
  .mat-progress-bar{height:100%;border-radius:inherit;background:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-progress-bar.mat-progress-warn{background:#d97706}
  .mat-progress-bar.mat-progress-danger{background:#dc2626}
  .mat-ratio-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:14px}
  .mat-ratio-value{color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;font-variant-numeric:tabular-nums;white-space:nowrap}
  .mat-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}
  .mat-foot{margin-top:14px;text-align:right}
  .mat-api-keys{margin-top:0}
  .mat-card-head-copy{min-width:0}
  .mat-card-head-copy .mat-hint{margin-top:3px}
  .mat-key-create{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(120px,.8fr) minmax(120px,.8fr);gap:10px;align-items:end;border:1px dashed var(--dsw-alias-border-l1,#e4e8ee);border-radius:11px;padding:12px;margin:0 0 12px}
  .mat-key-create .mat-field{gap:5px}
  .mat-key-check{display:flex;align-items:center;gap:7px;min-height:38px;font-size:12px;font-weight:600}
  .mat-key-create-actions{display:flex;flex-wrap:wrap;gap:8px;grid-column:1/-1;justify-content:flex-end}
  .mat-key-list{display:flex;flex-direction:column;gap:8px;max-height:min(58vh,520px);overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding-right:4px;scrollbar-gutter:stable}
  .mat-key-list-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 7px}
  .mat-key-item{flex:0 0 auto;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:10px;padding:10px 12px;background:var(--dsw-alias-bg-layer-1,#fff);transition:border-color .15s ease,box-shadow .15s ease}
  .mat-key-item:hover{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 20%,var(--dsw-alias-border-l1,#e4e8ee));box-shadow:0 4px 14px rgba(15,23,42,.04)}
  .mat-key-head{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:5px}
  .mat-key-name{min-width:0;flex:1 1 180px;font-size:12.5px;font-weight:650;overflow-wrap:anywhere}
  .mat-key-secret{display:block;box-sizing:border-box;width:100%;border-radius:7px;background:var(--dsw-alias-bg-layer-2,#f5f7fa);padding:5px 7px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;overflow-wrap:anywhere;user-select:all;margin-top:5px}
  .mat-key-meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:3px 14px;margin:5px 0 0}
  .mat-key-meta>div{display:flex;align-items:baseline;gap:4px;min-width:0}
  .mat-key-meta-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:10px}
  .mat-key-meta-value{margin-top:0;font-size:11px;font-weight:600;overflow-wrap:anywhere}
  .mat-key-actions{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}
  .mat-topup{margin-top:0}
  .mat-topup .mat-card-head{margin-bottom:9px}
  .mat-topup .mat-card-title{font-size:14px}
  .mat-topup-status{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-bottom:9px}
  .mat-topup-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,.8fr);gap:12px;align-items:end}
  .mat-choice-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
  .mat-choice{height:30px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 11px;font:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:background .15s ease,border-color .15s ease,color .15s ease}
  .mat-topup .mat-choice{height:28px;padding:0 9px;font-size:10.5px}
  .mat-choice:hover{background:var(--dsw-alias-bg-layer-2,#f5f7fa)}
  .mat-choice-active{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 9%,transparent);color:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-pay-result{display:grid;gap:8px;margin-top:12px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:10px}
  .mat-topup-pay{display:grid;gap:10px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 16%,var(--dsw-alias-border-l1,#e4e8ee));border-radius:12px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 5%,transparent),transparent 72%),var(--dsw-alias-bg-layer-2,#f7f9fc);padding:14px}
  .mat-pay-line{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:11.5px}
  .mat-pay-line span{color:var(--dsw-alias-label-secondary,#67707c)}
  .mat-pay-line strong{font-size:13px;overflow-wrap:anywhere;text-align:right}
  .mat-pay-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:2px}
  .mat-pay-actions .mat-btn-primary{flex:1 1 180px}
  .mat-models{margin-top:0;padding:18px}
  .mat-model-toolbar{display:grid;grid-template-columns:minmax(0,1fr) minmax(140px,200px);gap:12px;align-items:end;margin:4px 0 12px}
  .mat-model-count{margin:0 0 8px;color:var(--dsw-alias-label-secondary,#67707c);font-size:11px}
  .mat-model-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));align-content:start;gap:10px;max-height:min(58vh,520px);overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding-right:4px;scrollbar-gutter:stable}
  .mat-model-item{display:flex;flex-direction:column;gap:8px;min-width:0;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:12px;background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 2.5%,transparent),transparent 58%),var(--dsw-alias-bg-layer-1,#fff);padding:13px 14px;transition:border-color .15s ease,box-shadow .15s ease}
  .mat-model-item:hover{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 22%,var(--dsw-alias-border-l1,#e4e8ee));box-shadow:0 6px 18px rgba(15,23,42,.045)}
  .mat-model-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .mat-model-name{min-width:0;font-size:12.5px;font-weight:650;line-height:1.45;overflow-wrap:anywhere}
  .mat-model-price{flex:0 0 auto;white-space:nowrap}
  .mat-model-desc{display:-webkit-box;margin:0;overflow:hidden;color:var(--dsw-alias-label-secondary,#67707c);font-size:11px;line-height:1.55;white-space:pre-line;-webkit-box-orient:vertical;-webkit-line-clamp:3}
  .mat-model-tags{display:flex;flex-wrap:wrap;gap:4px}
  .mat-model-tag{border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 10%,transparent);color:var(--dsw-alias-brand-primary,#2563eb);padding:3px 8px;font-size:10px;line-height:1.3}
  .mat-model-meta{display:grid;gap:4px}
  .mat-model-meta-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-width:0}
  .mat-model-meta-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:10px}
  .mat-btn-sm{height:28px;padding:0 8px;font-size:11px}
  .mat-btn-danger{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 28%,transparent);color:var(--dsw-alias-state-error-primary,#c62828)}
  .mat-btn-danger:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 8%,transparent)}
  .mat-modal-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.48);backdrop-filter:blur(2px)}
  .mat-key-create.mat-modal{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:12px;width:min(500px,100%);max-height:calc(100vh - 40px);overflow-y:auto;margin:0;padding:18px;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:16px;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 24px 70px rgba(15,23,42,.28);animation:mat-modal-in .16s ease-out}
  .mat-key-create.mat-modal .mat-field{gap:6px}
  .mat-modal-head{grid-column:1/-1;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .mat-modal-copy{min-width:0}
  .mat-modal-title{font-size:15px;font-weight:650;line-height:1.4}
  .mat-modal-close{flex:0 0 auto;width:30px;height:30px;border:0;border-radius:8px;background:var(--dsw-alias-bg-layer-2,#f5f7fa);color:var(--dsw-alias-label-secondary,#67707c);font:inherit;font-size:18px;line-height:1;cursor:pointer}
  .mat-modal-close:hover{background:var(--dsw-alias-bg-layer-3,#eef1f5);color:var(--dsw-alias-label-primary,#1f2329)}
  .mat-modal-wide{grid-column:1/-1}
  .mat-subscription{margin-top:0;padding:18px}
  .mat-sub-section{margin-top:14px}
  .mat-sub-section:first-of-type{margin-top:0}
  .mat-sub-section-title{margin-bottom:8px;font-size:12px;font-weight:650}
  .mat-sub-current-list{display:grid;gap:10px}
  .mat-sub-current{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:12px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 3%,transparent),transparent 66%),var(--dsw-alias-bg-layer-2,#f7f9fc);padding:11px 13px}
  .mat-sub-current-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mat-sub-current-title{min-width:0;font-size:13px;overflow-wrap:anywhere}
  .mat-sub-meta{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:6px;color:var(--dsw-alias-label-secondary,#67707c);font-size:11px}
  .mat-sub-quota-line{display:flex;align-items:center;gap:10px;margin-top:7px}
  .mat-sub-quota-line .mat-progress{flex:1 1 auto;margin:0}
  .mat-sub-quota-text{flex:0 0 auto;color:var(--dsw-alias-label-secondary,#67707c);font-size:10.5px;font-variant-numeric:tabular-nums}
  .mat-sub-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:10px}
  .mat-sub-plan{display:flex;flex-direction:column;gap:8px;width:100%;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:13px 14px;text-align:left;font:inherit;cursor:pointer;transition:background .15s ease,border-color .15s ease,box-shadow .15s ease}
  .mat-sub-plan:hover{background:var(--dsw-alias-bg-layer-2,#f5f7fa);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 20%,var(--dsw-alias-border-l1,#e4e8ee))}
  .mat-sub-plan:disabled{cursor:not-allowed;opacity:.6}
  .mat-sub-plan-active{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 48%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 6%,var(--dsw-alias-bg-layer-1,#fff));box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 28%,transparent) inset,0 6px 18px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 8%,transparent)}
  .mat-sub-plan-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .mat-sub-plan-title{min-width:0;font-size:12.5px;line-height:1.45;overflow-wrap:anywhere}
  .mat-sub-plan-price{flex:0 0 auto;color:var(--dsw-alias-brand-primary,#2563eb);font-size:15px;font-weight:700;white-space:nowrap}
  .mat-sub-plan-subtitle{margin:0;color:var(--dsw-alias-label-secondary,#67707c);font-size:11px;line-height:1.55}
  .mat-sub-plan-meta{display:flex;flex-wrap:wrap;gap:4px}
  .mat-sub-pay{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:12px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:12px}
  .mat-sub-pay .mat-field{flex:1 1 240px}
  .mat-sub-pay-actions{display:flex;flex:1 1 240px;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px}
  .mat-root :where(.mat-hero>div,.mat-card,.mat-field,.mat-topup-pay,.mat-sub-plan){min-width:0}
  .mat-hero>div:last-child{overflow-wrap:anywhere}
  .mat-card-head{flex-wrap:wrap}
  .mat-metric-value{font-variant-numeric:tabular-nums}
  .mat-sub-plan{box-sizing:border-box}
  .mat-input-wrap{align-items:center}
  .mat-input-wrap>.mat-btn{flex-shrink:0;height:40px}
  .mat-page-tab:focus-visible,.mat-choice:focus-visible,.mat-sub-plan:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2563eb);outline-offset:2px}
  @container (max-width:620px){
    .mat-topbar-title{flex-basis:100%}
    .mat-topup-grid,.mat-model-toolbar,.mat-key-create{grid-template-columns:1fr}
    .mat-model-list,.mat-sub-plans{grid-template-columns:1fr}
    .mat-model-head,.mat-sub-plan-head{flex-wrap:wrap}
    .mat-sub-pay-actions{justify-content:flex-start}
    .mat-overview-stack>.mat-card{padding:14px}
  }
  @container (max-width:380px){
    .mat-metrics{grid-template-columns:1fr}
    .mat-hero{padding:12px;gap:10px}
    .mat-title{font-size:18px}
    .mat-card{padding:14px}
    .mat-sub-quota-line{flex-wrap:wrap}
    .mat-sub-quota-line .mat-progress{flex-basis:100%}
    .mat-pay-actions .mat-btn{flex:1 1 100%}
    .mat-page-tab{padding:0 10px}
  }
  .mat-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:1100;max-width:calc(100vw - 40px);box-sizing:border-box;padding:12px 20px;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-state-success-primary,#2e7d32);box-shadow:0 8px 32px rgba(15,23,42,.16);pointer-events:none}
  @keyframes mat-modal-in{from{opacity:0;transform:translateY(4px) scale(.985)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.mat-key-create.mat-modal{animation:none}}
  @media (max-width:620px){.mat-root{padding:16px 14px 30px}.mat-hero{padding:14px;border-radius:16px}.mat-topbar{padding:10px 12px}.mat-metrics{grid-template-columns:1fr}.mat-overview-stack>.mat-card{padding:14px}.mat-key-create{grid-template-columns:1fr}.mat-key-create.mat-modal{grid-template-columns:1fr}.mat-topup-grid{grid-template-columns:1fr}.mat-model-toolbar{grid-template-columns:1fr}.mat-model-list{grid-template-columns:1fr}.mat-pay-actions .mat-btn{flex:1 1 100%}.mat-sub-plans{grid-template-columns:1fr}.mat-sub-pay-actions{justify-content:flex-start}}
`;

