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
