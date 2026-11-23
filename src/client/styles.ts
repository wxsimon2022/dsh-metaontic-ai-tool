export const PANEL_CSS = `
  .mat-root{box-sizing:border-box;width:100%;max-width:880px;margin:0 auto;padding:28px 30px 44px;color:var(--dsw-alias-label-primary,#1f2329);font-size:13px}
  .mat-hero{display:flex;align-items:flex-start;gap:13px;margin-bottom:20px}
  .mat-mark{flex:0 0 auto;display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 12%,transparent);color:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-title{margin:0;font-size:19px;font-weight:650;line-height:1.35}
  .mat-intro{margin:4px 0 0;color:var(--dsw-alias-label-secondary,#67707c);font-size:12.5px;line-height:1.6}
  .mat-card{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:14px;background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1,#fff));padding:18px}
  .mat-login{display:flex;flex-direction:column;gap:15px}
  .mat-field{display:flex;flex-direction:column;gap:7px}
  .mat-label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary,#1f2329)}
  .mat-input-wrap{display:flex;gap:8px}
  .mat-input{box-sizing:border-box;width:100%;min-width:0;height:38px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 11px;font:inherit;outline:none}
  .mat-input:focus{border-color:var(--dsw-alias-brand-primary,#2563eb);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 14%,transparent)}
  .mat-hint{margin:0;color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;line-height:1.55}
  .mat-register{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
  .mat-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 14px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap}
  .mat-btn:hover{background:var(--dsw-alias-bg-layer-2,#f5f7fa)}
  .mat-btn:disabled{cursor:not-allowed;opacity:.55}
  .mat-btn-primary{border-color:transparent;background:var(--dsw-alias-brand-primary,#2563eb);color:#fff}
  .mat-btn-primary:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 88%,#000)}
  .mat-btn-register{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 32%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 7%,transparent);color:var(--dsw-alias-brand-primary,#2563eb);text-decoration:none}
  .mat-btn-register:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 13%,transparent)}
  .mat-actions{display:flex;flex-wrap:wrap;align-items:center;gap:9px}
  .mat-actions .mat-btn-primary{flex:1 1 210px}
  .mat-error{display:flex;gap:8px;align-items:flex-start;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 8%,transparent);color:var(--dsw-alias-state-error-primary,#c62828);padding:9px 11px;font-size:12px;line-height:1.55}
  .mat-notice{display:flex;gap:8px;align-items:flex-start;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2e7d32) 8%,transparent);color:var(--dsw-alias-state-success-primary,#2e7d32);padding:9px 11px;font-size:12px;line-height:1.55}
  .mat-topbar{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-bottom:14px}
  .mat-topbar-title{flex:1 1 220px;min-width:0}
  .mat-platform-name{margin:0;font-size:16px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mat-subtle{color:var(--dsw-alias-label-secondary,#67707c);font-size:11.5px;line-height:1.5}
  .mat-page-tabs{display:flex;gap:4px;margin:0 0 12px;border-bottom:1px solid var(--dsw-alias-border-l1,#e4e8ee);overflow-x:auto;scrollbar-width:none}
  .mat-page-tabs::-webkit-scrollbar{display:none}
  .mat-page-tab{flex:0 0 auto;height:35px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,#67707c);padding:0 12px;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
  .mat-page-tab:hover{color:var(--dsw-alias-label-primary,#1f2329)}
  .mat-page-tab-active{border-bottom-color:var(--dsw-alias-brand-primary,#2563eb);color:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-overview{margin-top:10px;padding:14px 15px}
  .mat-overview .mat-card-head{margin-bottom:9px}
  .mat-overview .mat-metrics{gap:8px}
  .mat-overview .mat-metric{padding:9px 10px}
  .mat-overview .mat-metric-value{font-size:16px}
  .mat-overview .mat-progress{margin:7px 0 0}
  .mat-overview-stack{display:grid;overflow:hidden;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:14px;background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1,#fff))}
  .mat-overview-stack>.mat-card{margin:0;border:0;border-radius:0;background:transparent;padding:14px 15px}
  .mat-overview-stack>.mat-card+.mat-card{border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee)}
  .mat-badges{display:flex;flex-wrap:wrap;gap:6px}
  .mat-compact-lines{display:grid;gap:5px;margin-top:10px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:9px}
  .mat-compact-line{display:flex;gap:8px;font-size:11.5px;line-height:1.5}
  .mat-compact-label{flex:0 0 60px;color:var(--dsw-alias-label-secondary,#67707c)}
  .mat-compact-value{min-width:0;overflow-wrap:anywhere}
  .mat-card-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:12px}
  .mat-card-title{font-size:13px;font-weight:650}
  .mat-badge{border-radius:999px;background:var(--dsw-alias-bg-layer-2,#f1f4f8);color:var(--dsw-alias-label-secondary,#67707c);padding:2px 8px;font-size:10.5px;font-weight:600}
  .mat-badge-ok{background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2e7d32) 10%,transparent);color:var(--dsw-alias-state-success-primary,#2e7d32)}
  .mat-badge-warn{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b26a00) 10%,transparent);color:var(--dsw-alias-state-warn-primary,#b26a00)}
  .mat-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
  .mat-metric{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:11px;padding:11px}
  .mat-metric-label{color:var(--dsw-alias-label-secondary,#67707c);font-size:10.5px}
  .mat-metric-value{margin-top:5px;font-size:18px;font-weight:680;line-height:1.2;overflow-wrap:anywhere}
  .mat-progress{height:7px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,#eef1f5);overflow:hidden;margin:12px 0 7px}
  .mat-progress-bar{height:100%;border-radius:inherit;background:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-progress-bar.mat-progress-warn{background:#d97706}
  .mat-progress-bar.mat-progress-danger{background:#dc2626}
  .mat-ratio-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:13px}
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
  .mat-key-list{display:flex;flex-direction:column;gap:6px;max-height:min(58vh,520px);overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding-right:4px;scrollbar-gutter:stable}
  .mat-key-list-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 7px}
  .mat-key-item{flex:0 0 auto;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:9px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1,#fff)}
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
  .mat-topup-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,.8fr);gap:10px;align-items:end}
  .mat-choice-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
  .mat-choice{height:30px;border:1px solid var(--dsw-alias-border-l1,#d9dee6);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:0 10px;font:inherit;font-size:11px;font-weight:600;cursor:pointer}
  .mat-topup .mat-choice{height:28px;padding:0 9px;font-size:10.5px}
  .mat-choice:hover{background:var(--dsw-alias-bg-layer-2,#f5f7fa)}
  .mat-choice-active{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 9%,transparent);color:var(--dsw-alias-brand-primary,#2563eb)}
  .mat-pay-result{display:grid;gap:8px;margin-top:12px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:10px}
  .mat-pay-line{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:11.5px}
  .mat-pay-line span{color:var(--dsw-alias-label-secondary,#67707c)}
  .mat-pay-line strong{font-size:13px;overflow-wrap:anywhere;text-align:right}
  .mat-pay-actions{display:flex;justify-content:flex-end;margin-top:2px}
  .mat-btn-sm{height:28px;padding:0 8px;font-size:11px}
  .mat-btn-danger{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 28%,transparent);color:var(--dsw-alias-state-error-primary,#c62828)}
  .mat-btn-danger:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c62828) 8%,transparent)}
  .mat-modal-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.48);backdrop-filter:blur(2px)}
  .mat-key-create.mat-modal{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:12px;width:min(500px,100%);max-height:calc(100vh - 40px);overflow-y:auto;margin:0;padding:17px;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:14px;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 20px 60px rgba(15,23,42,.26);animation:mat-modal-in .16s ease-out}
  .mat-key-create.mat-modal .mat-field{gap:6px}
  .mat-modal-head{grid-column:1/-1;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .mat-modal-copy{min-width:0}
  .mat-modal-title{font-size:15px;font-weight:650;line-height:1.4}
  .mat-modal-close{flex:0 0 auto;width:30px;height:30px;border:0;border-radius:8px;background:var(--dsw-alias-bg-layer-2,#f5f7fa);color:var(--dsw-alias-label-secondary,#67707c);font:inherit;font-size:18px;line-height:1;cursor:pointer}
  .mat-modal-close:hover{background:var(--dsw-alias-bg-layer-3,#eef1f5);color:var(--dsw-alias-label-primary,#1f2329)}
  .mat-modal-wide{grid-column:1/-1}
  .mat-subscription{margin-top:0;padding:16px 17px}
  .mat-sub-section{margin-top:12px}
  .mat-sub-section:first-of-type{margin-top:0}
  .mat-sub-section-title{margin-bottom:8px;font-size:12px;font-weight:650}
  .mat-sub-current-list{display:grid;gap:8px}
  .mat-sub-current{border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:10px;background:var(--dsw-alias-bg-layer-2,#f7f9fc);padding:9px 11px}
  .mat-sub-current-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mat-sub-current-title{min-width:0;font-size:13px;overflow-wrap:anywhere}
  .mat-sub-meta{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:6px;color:var(--dsw-alias-label-secondary,#67707c);font-size:11px}
  .mat-sub-quota-line{display:flex;align-items:center;gap:10px;margin-top:7px}
  .mat-sub-quota-line .mat-progress{flex:1 1 auto;margin:0}
  .mat-sub-quota-text{flex:0 0 auto;color:var(--dsw-alias-label-secondary,#67707c);font-size:10.5px;font-variant-numeric:tabular-nums}
  .mat-sub-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px}
  .mat-sub-plan{display:flex;flex-direction:column;gap:7px;width:100%;border:1px solid var(--dsw-alias-border-l1,#e4e8ee);border-radius:11px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;padding:11px 12px;text-align:left;font:inherit;cursor:pointer}
  .mat-sub-plan:hover{background:var(--dsw-alias-bg-layer-2,#f5f7fa)}
  .mat-sub-plan:disabled{cursor:not-allowed;opacity:.6}
  .mat-sub-plan-active{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 48%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 6%,var(--dsw-alias-bg-layer-1,#fff));box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-brand-primary,#2563eb) 28%,transparent) inset}
  .mat-sub-plan-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .mat-sub-plan-title{min-width:0;font-size:12.5px;line-height:1.45;overflow-wrap:anywhere}
  .mat-sub-plan-price{flex:0 0 auto;color:var(--dsw-alias-brand-primary,#2563eb);font-size:15px;font-weight:700;white-space:nowrap}
  .mat-sub-plan-subtitle{margin:0;color:var(--dsw-alias-label-secondary,#67707c);font-size:11px;line-height:1.55}
  .mat-sub-plan-meta{display:flex;flex-wrap:wrap;gap:4px}
  .mat-sub-pay{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:10px;border-top:1px dashed var(--dsw-alias-border-l1,#e4e8ee);padding-top:10px}
  .mat-sub-pay .mat-field{flex:1 1 240px}
  .mat-sub-pay-actions{display:flex;flex:1 1 240px;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px}
  @keyframes mat-modal-in{from{opacity:0;transform:translateY(4px) scale(.985)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.mat-key-create.mat-modal{animation:none}}
  @media (max-width:620px){.mat-root{padding:20px 16px 32px}.mat-metrics{grid-template-columns:1fr}.mat-overview-stack>.mat-card{padding:13px 12px}.mat-key-create{grid-template-columns:1fr}.mat-key-create.mat-modal{grid-template-columns:1fr}.mat-topup-grid{grid-template-columns:1fr}.mat-sub-plans{grid-template-columns:1fr}.mat-sub-pay-actions{justify-content:flex-start}}
`;

