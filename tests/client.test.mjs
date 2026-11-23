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
