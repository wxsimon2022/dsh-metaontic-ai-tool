import { NS, PANEL_ID } from './client/constants.js';
import { createDashboard } from './client/dashboard.js';
import { en, zh } from './client/dictionaries.js';
import type { ReactLike } from './client/runtime.js';
import { createPanelIconView } from './client/shell.js';

window.__ModuleLoader__.load({
  id: PANEL_ID,
  factory(require) {
    const React = require('react') as ReactLike;
    const h = React.createElement;
    return {
      inject: ['slots', 'locale'],
      apply(ctx: DshClientContext) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-metaontic-ai-tool: dictionaries');
        const t = ctx.locale.bind(NS);
        const runtime = { React, h, t };
        const Dashboard = createDashboard(runtime);
        const PanelIconView = createPanelIconView(runtime);
        ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 40,
          locale: NS,
          label: () => t('sidebarLabel'),
        }, PanelIconView)), 'dsh-metaontic-ai-tool: sidebar entry');
        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, Dashboard)), 'dsh-metaontic-ai-tool: main panel');
      },
    };
  },
});
