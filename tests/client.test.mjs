import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

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

  assert.equal(registration?.id, 'dsh-metaontic-ai-tool');
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

  const states = [];
  const effects = [];
  const startedEffects = new Set();
  let cursor = 0;
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) {
      return { type, props: { ...(props || {}), children: children.flat(Infinity) } };
    },
    useState(initialValue) {
      const slot = cursor++;
      if (!(slot in states)) states[slot] = initialValue;
      return [states[slot], value => {
        states[slot] = typeof value === 'function' ? value(states[slot]) : value;
      }];
    },
    useEffect(effect) {
      const slot = cursor++;
      if (!startedEffects.has(slot)) {
        startedEffects.add(slot);
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
    if (typeof node.type === 'function') return flatten(node.type(node.props), result);
    if (node.type === React.Fragment) return flatten(node.props?.children, result);
    result.push(node);
    flatten(node.props?.children, result);
    return result;
  }

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
    cursor = 0;
    const tree = Dashboard();
    while (effects.length) effects.shift()();
    return flatten(tree);
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

  const states = [];
  const effects = [];
  const startedEffects = new Set();
  let cursor = 0;
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) {
      return { type, props: { ...(props || {}), children: children.flat(Infinity) } };
    },
    useState(initialValue) {
      const slot = cursor++;
      if (!(slot in states)) states[slot] = initialValue;
      return [states[slot], value => {
        states[slot] = typeof value === 'function' ? value(states[slot]) : value;
      }];
    },
    useEffect(effect) {
      const slot = cursor++;
      if (!startedEffects.has(slot)) {
        startedEffects.add(slot);
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
    if (typeof node.type === 'function') return flatten(node.type(node.props), result);
    if (node.type === React.Fragment) return flatten(node.props?.children, result);
    result.push(node);
    flatten(node.props?.children, result);
    return result;
  }

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
    cursor = 0;
    const tree = Dashboard();
    while (effects.length) effects.shift()();
    return flatten(tree);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  const nodes = render();
  const progress = nodes.find(node => node.props?.role === 'progressbar');
  const fill = nodes.find(node => String(node.props?.className || '').startsWith('mat-progress-bar'));
  const percentage = nodes.find(node => node.props?.className === 'mat-ratio-value');

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
    if (target.endsWith('/api/dsh-metaontic-ai-tool.session')) {
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
    if (target.endsWith('/api/dsh-metaontic-ai-tool.api-keys') && method === 'GET') {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            total: 1,
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
    if (target.endsWith('/api/dsh-metaontic-ai-tool.api-keys') && method === 'PUT') {
      return {
        ok: true,
        json: async () => ({ ok: true, data: { id: 7, key: 'sk-explicit-reveal' } }),
      };
    }
    throw new Error(`unexpected request: ${method} ${target}`);
  };
  vm.runInNewContext(code, { window, console, URL, setTimeout, clearTimeout, fetch, navigator: {} });

  const states = [];
  const effects = [];
  const startedEffects = new Set();
  let cursor = 0;
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) {
      return { type, props: { ...(props || {}), children: children.flat(Infinity) } };
    },
    useState(initialValue) {
      const slot = cursor++;
      if (!(slot in states)) states[slot] = initialValue;
      return [states[slot], value => {
        states[slot] = typeof value === 'function' ? value(states[slot]) : value;
      }];
    },
    useEffect(effect) {
      const slot = cursor++;
      if (!startedEffects.has(slot)) {
        startedEffects.add(slot);
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
    if (typeof node.type === 'function') return flatten(node.type(node.props), result);
    if (node.type === React.Fragment) return flatten(node.props?.children, result);
    result.push(node);
    flatten(node.props?.children, result);
    return result;
  }

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
    cursor = 0;
    const tree = Dashboard();
    while (effects.length) effects.shift()();
    return flatten(tree);
  }

  render();
  await new Promise(resolve => setImmediate(resolve));
  render();
  await new Promise(resolve => setImmediate(resolve));
  render();
  await new Promise(resolve => setImmediate(resolve));
  let nodes = render();

  const listHeadIndex = nodes.findIndex(node => node.props?.className === 'mat-key-list-head');
  const keyItemIndex = nodes.findIndex(node => node.props?.className === 'mat-key-item');
  assert.ok(listHeadIndex >= 0);
  assert.ok(keyItemIndex > listHeadIndex);
  assert.ok(nodes.some(node => node.props?.className === 'mat-key-item'));
  assert.ok(nodes.some(node => node.props?.children?.[0] === 'dsh-desktop'));
  assert.equal(JSON.stringify(nodes).includes('sk-explicit-reveal'), false);

  const reveal = nodes.find(node => node.type === 'button' && node.props?.children?.[0] === 'apiKeyShow');
  assert.ok(reveal);
  reveal.props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  nodes = render();
  const secret = nodes.find(node => node.type === 'code' && String(node.props?.className || '').startsWith('mat-key-secret'));
  assert.equal(secret?.props.children[0], 'sk-explicit-reveal');
});
