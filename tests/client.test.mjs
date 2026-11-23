import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

function createReactHarness() {
  const states = new Map();
  const startedEffects = new Set();
  const effects = [];
  const componentIds = new WeakMap();
  let nextComponentId = 1;
  let currentComponent = null;
  let cursor = 0;

  function componentId(component) {
    if (!component || (typeof component !== 'function' && typeof component !== 'object')) return 'root';
    let id = componentIds.get(component);
    if (!id) {
      id = nextComponentId++;
      componentIds.set(component, id);
    }
    return String(id);
  }

  function hookKey(slot) {
    return `${componentId(currentComponent)}:${slot}`;
  }

  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) {
      return { type, props: { ...(props || {}), children: children.flat(Infinity) } };
    },
    useState(initialValue) {
      const key = hookKey(cursor++);
      if (!states.has(key)) states.set(key, initialValue);
      return [states.get(key), value => {
        states.set(key, typeof value === 'function' ? value(states.get(key)) : value);
      }];
    },
    useEffect(effect) {
      const key = hookKey(cursor++);
      if (!startedEffects.has(key)) {
        startedEffects.add(key);
        effects.push(effect);
      }
    },
  };

  function flatten(node, result = []) {
    if (Array.isArray(node)) {
      for (const child of node) flatten(child, result);
      return result;
    }
    if (!node || typeof node !== 'object') return result;
    if (typeof node.type === 'function') {
      const previousComponent = currentComponent;
      const previousCursor = cursor;
      currentComponent = node.type;
      cursor = 0;
      const rendered = node.type(node.props);
      currentComponent = previousComponent;
      cursor = previousCursor;
      return flatten(rendered, result);
    }
    if (node.type === React.Fragment) return flatten(node.props?.children, result);
    result.push(node);
    flatten(node.props?.children, result);
    return result;
  }

  function render(root) {
    cursor = 0;
    currentComponent = root;
    const tree = root();
    while (effects.length) effects.shift()();
    return flatten(tree);
  }

  return { React, flatten, render };
}

test('loads the compiled browser client as a classic script', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  assert.doesNotMatch(code, /^\s*export\s/m);

  let registration;
  const window = {
    __ModuleLoader__: {
      load(options) {
        registration = options;
      },
    },
  };
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch });

  assert.equal(registration?.id, 'dsh-metaontic-newapi-lite');
  const React = {
    Fragment: Symbol('Fragment'),
    createElement() {},
  };
  const client = registration.factory(id => {
    assert.equal(id, 'react');
    return React;
  });
  assert.deepEqual(Array.from(client.inject), ['slots', 'locale']);

  const slots = [];
  const context = {
    effect(callback) {
      callback();
    },
    locale: {
      register() {},
      bind() {
        return key => key;
      },
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(definition) {
        slots.push(definition.name);
      },
    },
  };
  client.apply(context);
  assert.deepEqual(slots, ['sidebar.panellist', 'main']);
});

test('keeps the API key list independently scrollable', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  assert.match(code, /\.mat-key-list\{[^}]*max-height:[^;]+;[^}]*overflow-y:auto/);
  assert.match(code, /\.mat-key-item\{[^}]*flex:0 0 auto/);
  assert.match(code, /\.mat-key-item\{[^}]*padding:10px 12px/);
  assert.match(code, /\.mat-key-meta\{[^}]*display:flex/);
  assert.match(code, /\.mat-key-actions\{[^}]*margin-top:6px/);
});

test('keeps the model plaza independently scrollable', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  assert.match(code, /\.mat-model-list\{[^}]*max-height:[^;]+;[^}]*overflow-y:auto/);
  assert.match(code, /\.mat-model-list\{[^}]*overscroll-behavior:contain/);
  assert.match(code, /\.mat-model-list\{[^}]*touch-action:pan-y/);
});

test('shows the registration link only while the access token is empty', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  let registration;
  const window = {
    __ModuleLoader__: {
      load(options) {
        registration = options;
      },
    },
  };
  const fetch = async () => ({
    ok: true,
    json: async () => ({ ok: false, data: {} }),
  });
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch });

  const { React, render: renderTree } = createReactHarness();

  const client = registration.factory(() => React);
  let Dashboard;
  client.apply({
    effect(callback) {
      callback();
    },
    locale: {
      register() {},
      bind() {
        return key => key;
      },
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(definition, component) {
        if (definition.name === 'main') Dashboard = component;
      },
    },
  });

  function render() {
    return renderTree(Dashboard);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  let nodes = render();
  const registerLink = nodes.find(node => node.type === 'a' && node.props.href === 'https://ai.bileego.com/sign-up?aff=VzYr');
  assert.ok(registerLink);
  assert.equal(registerLink.props.target, '_blank');
  assert.equal(registerLink.props.rel, 'noopener noreferrer');

  const tokenInput = nodes.find(node => node.type === 'input' && node.props.type === 'password');
  assert.ok(tokenInput);
  tokenInput.props.onChange({ target: { value: 'new-token' } });
  nodes = render();
  assert.equal(nodes.some(node => node.type === 'a' && node.props.href === 'https://ai.bileego.com/sign-up?aff=VzYr'), false);
});

test('shows remaining quota with a matching progress width', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  let registration;
  const window = {
    __ModuleLoader__: {
      load(options) {
        registration = options;
      },
    },
  };
  const fetch = async () => ({
    ok: true,
    json: async () => ({
      ok: true,
      data: {
        authenticated: true,
        baseUrl: 'https://ai.bileego.com',
        fetchedAt: '2026-11-23T08:00:00.000Z',
        platform: {
          quota_per_unit: 500000,
          quota_display_type: 'CNY',
          usd_exchange_rate: 7.3,
        },
        account: {
          quota: 958524,
          used_quota: 66781203,
          request_count: 38206,
          status: 1,
        },
      },
    }),
  });
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch });

  const { React, render: renderTree } = createReactHarness();

  const client = registration.factory(() => React);
  let Dashboard;
  client.apply({
    effect(callback) {
      callback();
    },
    locale: {
      register() {},
      bind() {
        return (key, params) => key === 'usageRemainingPercent' ? `剩余 ${params.percent}%` : key;
      },
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(definition, component) {
        if (definition.name === 'main') Dashboard = component;
      },
    },
  });

  function render() {
    return renderTree(Dashboard);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  const nodes = render();
  const progress = nodes.find(node => node.props?.role === 'progressbar');
  const fill = nodes.find(node => String(node.props?.className || '').startsWith('mat-progress-bar'));
  const percentage = nodes.find(node => node.props?.className === 'mat-ratio-value');
  const overview = nodes.find(node => node.props?.className === 'mat-card mat-overview');
  const summary = nodes.find(node => node.props?.className === 'mat-compact-lines');

  assert.ok(overview);
  assert.ok(summary);
  assert.equal(nodes.some(node => node.props?.className === 'mat-grid'), false);
  assert.ok(progress);
  assert.equal(progress.props['aria-valuetext'], '剩余 1.4%');
  assert.ok(fill);
  assert.match(fill.props.className, /mat-progress-danger/);
  assert.equal(Math.round(Number.parseFloat(fill.props.style.width) * 10) / 10, 1.4);
  assert.deepEqual(percentage?.props.children, ['剩余 1.4%']);
});

test('lists API keys masked and reveals one only on request', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  let registration;
  let capturedCreate;
  const window = {
    __ModuleLoader__: {
      load(options) {
        registration = options;
      },
    },
  };
  const fetch = async (url, init = {}) => {
    const target = String(url);
    const method = String(init.method || 'GET').toUpperCase();
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.session')) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            authenticated: true,
            baseUrl: 'https://ai.bileego.com',
            fetchedAt: '2026-11-23T08:00:00.000Z',
            platform: { quota_per_unit: 500000, quota_display_type: 'CNY', usd_exchange_rate: 7.3 },
            account: { quota: 958524, used_quota: 66781203, group: 'svip', status: 1 },
          },
        }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.api-keys') && method === 'GET') {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            total: 1,
            groups: [
              { name: 'default', desc: '默认分组', ratio: 1 },
              { name: 'ds-75', desc: '用户分组', ratio: 0.75 },
            ],
            keys: [{
              id: 7,
              name: 'dsh-desktop',
              status: 1,
              remain_quota: 500000,
              used_quota: 1000,
              unlimited_quota: false,
              expired_time: -1,
              group: 'svip',
            }],
          },
        }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.api-keys') && method === 'POST') {
      capturedCreate = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({ ok: true, data: { created: true, name: capturedCreate.name } }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.api-keys') && method === 'PUT') {
      return {
        ok: true,
        json: async () => ({ ok: true, data: { id: 7, key: 'sk-explicit-reveal' } }),
      };
    }
    throw new Error(`unexpected request: ${method} ${target}`);
  };
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch, navigator: {} });

  const { React, render: renderTree } = createReactHarness();

  const client = registration.factory(() => React);
  let Dashboard;
  client.apply({
    effect(callback) {
      callback();
    },
    locale: {
      register() {},
      bind() {
        return key => key;
      },
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(definition, component) {
        if (definition.name === 'main') Dashboard = component;
      },
    },
  });

  function render() {
    return renderTree(Dashboard);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  render();
  await new Promise(resolve => setImmediate(resolve));
  render();
  await new Promise(resolve => setImmediate(resolve));
  let nodes = render();

  assert.ok(nodes.some(node => node.props?.className === 'mat-card mat-overview'));
  assert.equal(nodes.some(node => node.props?.className === 'mat-key-item'), false);
  const apiKeysTab = nodes.find(node => node.type === 'button' && node.props?.children?.[0] === 'apiKeys');
  assert.ok(apiKeysTab);
  apiKeysTab.props.onClick();
  render();
  await new Promise(resolve => setImmediate(resolve));
  render();
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();

  const listHeadIndex = nodes.findIndex(node => node.props?.className === 'mat-key-list-head');
  const keyItemIndex = nodes.findIndex(node => node.props?.className === 'mat-key-item');
  assert.ok(listHeadIndex >= 0);
  assert.ok(keyItemIndex > listHeadIndex);
  assert.ok(nodes.some(node => node.props?.className === 'mat-key-item'));
  assert.ok(nodes.some(node => node.props?.children?.[0] === 'dsh-desktop'));
  assert.equal(nodes.some(node => node.type === 'code' && String(node.props?.className || '').startsWith('mat-key-secret')), false);
  assert.equal(JSON.stringify(nodes).includes('sk-explicit-reveal'), false);

  const reveal = nodes.find(node => node.type === 'button' && node.props?.children?.[0] === 'apiKeyShow');
  assert.ok(reveal);
  reveal.props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();
  const secret = nodes.find(node => node.type === 'code' && String(node.props?.className || '').startsWith('mat-key-secret'));
  assert.equal(secret?.props.children[0], 'sk-explicit-reveal');

  const newKey = nodes.find(node => node.type === 'button' && node.props?.children?.[0] === 'apiKeyNew');
  assert.ok(newKey);
  newKey.props.onClick();
  nodes = render();
  const dialog = nodes.find(node => node.type === 'form' && node.props?.role === 'dialog');
  assert.ok(dialog);
  assert.equal(dialog.props['aria-modal'], 'true');
  assert.match(String(dialog.props.className), /mat-modal/);
  assert.ok(nodes.some(node => node.props?.className === 'mat-modal-backdrop'));
  const groupSelect = nodes.find(node => node.type === 'select');
  assert.ok(groupSelect);
  assert.equal(groupSelect.props.value, 'default');
  const closeDialog = nodes.find(node => node.type === 'button' && node.props?.['aria-label'] === 'apiKeyCancel');
  assert.ok(closeDialog);
  closeDialog.props.onClick();
  nodes = render();
  assert.equal(nodes.some(node => node.props?.role === 'dialog'), false);

  const reopenKey = nodes.find(node => node.type === 'button' && node.props?.children?.[0] === 'apiKeyNew');
  assert.ok(reopenKey);
  reopenKey.props.onClick();
  nodes = render();
  const nameInput = nodes.find(node => node.type === 'input' && node.props?.placeholder === 'apiKeyNamePlaceholder');
  assert.ok(nameInput);
  nameInput.props.onChange({ target: { value: 'grouped-key' } });
  nodes = render();
  const select = nodes.find(node => node.type === 'select');
  assert.ok(select);
  select.props.onChange({ target: { value: 'ds-75' } });
  nodes = render();
  const groupDialog = nodes.find(node => node.type === 'form' && node.props?.role === 'dialog');
  assert.ok(groupDialog);
  await groupDialog.props.onSubmit({ preventDefault() {} });
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();

  assert.equal(capturedCreate.name, 'grouped-key');
  assert.equal(capturedCreate.group, 'ds-75');
  assert.equal(nodes.some(node => node.props?.role === 'dialog'), false);
});

test('keeps recharge on the overview page and shows a signed payment link', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  let registration;
  const window = {
    __ModuleLoader__: {
      load(options) {
        registration = options;
      },
    },
  };
  let capturedPayment;
  const fetch = async (url, init = {}) => {
    const target = String(url);
    const method = String(init.method || 'GET').toUpperCase();
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.session')) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            authenticated: true,
            baseUrl: 'https://ai.bileego.com',
            fetchedAt: '2026-11-23T08:00:00.000Z',
            platform: { quota_per_unit: 500000, quota_display_type: 'CNY', usd_exchange_rate: 7.3 },
            account: { quota: 958524, used_quota: 66781203, status: 1 },
          },
        }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.topup') && method === 'GET') {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            amountOptions: [10, 20, 50],
            minTopup: 1,
            onlineTopupEnabled: true,
            paymentMethods: [{ name: '微信', type: 'wxpay' }],
          },
        }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.topup') && method === 'POST') {
      capturedPayment = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            amount: 20,
            paymentMethod: 'wxpay',
            payMoney: '14.60',
            outTradeNo: 'USR6NOtclRqn1795355599',
            payUrl: 'https://pay.example.com/submit.php?sign=abc123&type=wxpay',
          },
        }),
      };
    }
    throw new Error(`unexpected request: ${method} ${target}`);
  };
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch });

  const { React, render: renderTree } = createReactHarness();

  const client = registration.factory(() => React);
  let Dashboard;
  client.apply({
    effect(callback) {
      callback();
    },
    locale: {
      register() {},
      bind() {
        return key => key;
      },
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(definition, component) {
        if (definition.name === 'main') Dashboard = component;
      },
    },
  });

  function render() {
    return renderTree(Dashboard);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  let nodes = render();
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();
  assert.ok(nodes.some(node => node.props?.className === 'mat-card mat-overview'));
  assert.ok(nodes.some(node => node.props?.className === 'mat-card mat-topup'));
  assert.deepEqual(
    nodes.filter(node => node.props?.role === 'tab').map(node => node.props?.children?.[0]),
    ['overviewPage', 'subscription', 'modelsPage', 'apiKeys'],
  );
  assert.equal(nodes.some(node => node.type === 'button' && node.props?.children?.[0] === 'topup'), false);
  assert.equal(nodes.some(node => node.props?.className === 'mat-key-item'), false);
  const amountInput = nodes.find(node => node.type === 'input' && node.props?.type === 'number');
  assert.ok(amountInput);
  assert.ok(nodes.some(node => node.type === 'button' && node.props?.children?.[0] === '$20'));
  amountInput.props.onChange({ target: { value: '20' } });
  nodes = render();
  const form = nodes.find(node => node.type === 'form' && node.props?.className === 'mat-topup-grid');
  assert.ok(form);
  await form.props.onSubmit({ preventDefault() {} });
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();

  assert.deepEqual(capturedPayment, { amount: 20, paymentMethod: 'wxpay' });
  assert.ok(nodes.some(node => node.props?.className === 'mat-notice' && node.props.children?.[0] === 'topupCreated'));
  assert.equal(nodes.some(node => node.type === 'form' && node.props?.className === 'mat-topup-grid'), false);
  assert.ok(nodes.some(node => node.props?.className === 'mat-topup-pay mat-pay-inline'));
  assert.ok(nodes.some(node => node.type === 'button' && node.props?.children?.[0] === 'topupAgain'));
  assert.equal(JSON.stringify(nodes).includes('¥14.60'), true);
  const payLink = nodes.find(node => node.type === 'a' && String(node.props?.className || '').includes('mat-btn-primary'));
  assert.equal(payLink?.props.href, 'https://pay.example.com/submit.php?sign=abc123&type=wxpay');
  assert.equal(payLink?.props.target, '_blank');
  assert.equal(payLink?.props.rel, 'noopener noreferrer');
});

test('shows subscriptions on their own page and creates a signed subscription link', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  let registration;
  const window = {
    __ModuleLoader__: {
      load(options) {
        registration = options;
      },
    },
  };
  let capturedPayment;
  const fetch = async (url, init = {}) => {
    const target = String(url);
    const method = String(init.method || 'GET').toUpperCase();
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.session')) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            authenticated: true,
            baseUrl: 'https://ai.bileego.com',
            fetchedAt: '2026-11-23T08:00:00.000Z',
            platform: { quota_per_unit: 500000, quota_display_type: 'CNY', usd_exchange_rate: 7.3 },
            account: { quota: 958524, used_quota: 66781203, status: 1 },
          },
        }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.subscription') && method === 'GET') {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            plans: [{
              id: 1,
              title: '短视频生成套餐',
              subtitle: '购买即送 88 折优惠',
              priceAmount: 99,
              currency: 'USD',
              durationUnit: 'month',
              durationValue: 1,
              customSeconds: 0,
              quotaResetPeriod: 'never',
              quotaResetCustomSeconds: 0,
              sortOrder: 0,
              allowBalancePay: true,
              allowWalletOverflow: true,
              maxPurchasePerUser: 1,
              upgradeGroup: 'vip',
              downgradeGroup: 'default',
              totalQuota: 6780822,
            }],
            subscriptions: [{
              id: 9,
              planId: 1,
              planTitle: '短视频生成套餐',
              status: 'active',
              source: 'epay',
              startTime: 1790000000,
              endTime: 1792592000,
              amountTotal: 6780822,
              amountUsed: 780822,
              nextResetTime: 0,
            }],
            allSubscriptions: [],
            paymentMethods: [{ name: '微信', type: 'wxpay' }],
            onlinePaymentEnabled: true,
          },
        }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.subscription') && method === 'POST') {
      capturedPayment = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            planId: 1,
            paymentMethod: 'wxpay',
            payMoney: '719.28',
            outTradeNo: 'SUB6NO1795355599',
            payUrl: 'https://pay.example.com/submit.php?sign=sub123&type=wxpay',
          },
        }),
      };
    }
    throw new Error(`unexpected request: ${method} ${target}`);
  };
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch });

  const { React, render: renderTree } = createReactHarness();

  const client = registration.factory(() => React);
  let Dashboard;
  client.apply({
    effect(callback) {
      callback();
    },
    locale: {
      register() {},
      bind() {
        return key => key;
      },
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(definition, component) {
        if (definition.name === 'main') Dashboard = component;
      },
    },
  });

  function render() {
    return renderTree(Dashboard);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  let nodes = render();
  assert.ok(nodes.some(node => node.props?.className === 'mat-card mat-overview'));
  const subscriptionTab = nodes.find(node => node.type === 'button' && node.props?.children?.[0] === 'subscription');
  assert.ok(subscriptionTab);
  subscriptionTab.props.onClick();
  render();
  await new Promise(resolve => setImmediate(resolve));
  render();
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();

  assert.ok(nodes.some(node => node.props?.className === 'mat-card mat-subscription'));
  assert.ok(nodes.some(node => node.props?.className === 'mat-sub-plan mat-sub-plan-active'));
  assert.ok(nodes.some(node => node.props?.className === 'mat-sub-current'));
  assert.ok(nodes.some(node => node.props?.children?.[0] === '短视频生成套餐'));
  assert.equal(nodes.some(node => node.props?.className === 'mat-key-item'), false);

  const form = nodes.find(node => node.type === 'form' && node.props?.className === 'mat-sub-pay');
  assert.ok(form);
  await form.props.onSubmit({ preventDefault() {} });
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();

  assert.deepEqual(capturedPayment, { planId: 1, paymentMethod: 'wxpay' });
  assert.ok(nodes.some(node => node.props?.className === 'mat-notice' && node.props.children?.[0] === 'subscriptionPaymentCreated'));
  const payLink = nodes.find(node => node.type === 'a' && String(node.props?.className || '').includes('mat-btn-primary'));
  assert.equal(payLink?.props.href, 'https://pay.example.com/submit.php?sign=sub123&type=wxpay');
  assert.equal(payLink?.props.target, '_blank');
  assert.equal(payLink?.props.rel, 'noopener noreferrer');
});

test('shows the model plaza and filters models by search and group', async () => {
  const code = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  let registration;
  const window = {
    __ModuleLoader__: {
      load(options) {
        registration = options;
      },
    },
  };
  const fetch = async (url, init = {}) => {
    const target = String(url);
    const method = String(init.method || 'GET').toUpperCase();
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.session')) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            authenticated: true,
            baseUrl: 'https://ai.bileego.com',
            fetchedAt: '2026-11-23T08:00:00.000Z',
            platform: { quota_per_unit: 500000, quota_display_type: 'CNY', usd_exchange_rate: 7.3 },
            account: { quota: 1000, used_quota: 0, group: 'default', status: 1 },
          },
        }),
      };
    }
    if (target.endsWith('/api/dsh-metaontic-newapi-lite.models') && method === 'GET') {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            groups: ['default', 'vip'],
            models: [{
              name: 'deepseekv4pro',
              description: 'DeepSeek V4 pro',
              tags: ['chat', 'reasoning'],
              icon: 'DeepSeek.Color',
              groups: ['default', 'vip'],
              endpoints: ['openai'],
              ratio: 37.5,
              price: 0,
              completionRatio: 1,
            }, {
              name: 'GLM-5.3',
              description: 'Coding model',
              tags: ['coding'],
              icon: 'Zhipu.Color',
              groups: ['default'],
              endpoints: ['openai'],
              ratio: 1.5,
              price: 0,
              completionRatio: 1,
            }],
          },
        }),
      };
    }
    throw new Error(`unexpected request: ${method} ${target}`);
  };
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch });

  const { React, render: renderTree } = createReactHarness();
  const client = registration.factory(() => React);
  let Dashboard;
  client.apply({
    effect(callback) {
      callback();
    },
    locale: {
      register() {},
      bind() {
        return key => key;
      },
    },
    slots: {
      inject(_slot, callback) {
        callback();
      },
      register(definition, component) {
        if (definition.name === 'main') Dashboard = component;
      },
    },
  });

  function render() {
    return renderTree(Dashboard);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  let nodes = render();
  const modelsTab = nodes.find(node => node.type === 'button' && node.props?.children?.[0] === 'modelsPage');
  assert.ok(modelsTab);
  modelsTab.props.onClick();
  render();
  await new Promise(resolve => setImmediate(resolve));
  render();
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();

  assert.ok(nodes.some(node => node.props?.className === 'mat-card mat-models'));
  assert.ok(nodes.some(node => node.props?.children?.[0] === 'deepseekv4pro'));
  assert.ok(nodes.some(node => node.props?.children?.[0] === 'GLM-5.3'));
  assert.ok(nodes.some(node => node.props?.className === 'mat-model-desc' && node.props?.children?.[0] === 'DeepSeek V4 pro'));
  assert.equal(nodes.some(node => node.props?.className === 'mat-key-item'), false);

  const search = nodes.find(node => node.type === 'input' && node.props?.type === 'search');
  assert.ok(search);
  search.props.onChange({ target: { value: 'GLM' } });
  nodes = render();
  assert.ok(nodes.some(node => node.props?.children?.[0] === 'GLM-5.3'));
  assert.equal(nodes.some(node => node.props?.children?.[0] === 'deepseekv4pro'), false);

  search.props.onChange({ target: { value: '' } });
  render();
  nodes = render();
  const group = nodes.find(node => node.type === 'select');
  assert.ok(group);
  group.props.onChange({ target: { value: 'vip' } });
  nodes = render();
  assert.ok(nodes.some(node => node.props?.children?.[0] === 'deepseekv4pro'));
  assert.equal(nodes.some(node => node.props?.children?.[0] === 'GLM-5.3'), false);
});
