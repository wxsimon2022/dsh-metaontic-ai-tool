import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { gzipSync } from 'node:zlib';
import { listTarGzEntries, stripReadmeFromTarGz } from '../scripts/strip-package-readme.mjs';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

function header(name, size) {
  const block = Buffer.alloc(512);
  block.write(name, 0, 100, 'utf8');
  block.write('0000644\0', 100, 8, 'ascii');
  block.write('0000000\0', 108, 8, 'ascii');
  block.write('0000000\0', 116, 8, 'ascii');
  block.write(`${size.toString(8).padStart(11, '0')}\0`, 124, 12, 'ascii');
  block.write('00000000000\0', 136, 12, 'ascii');
  block.write('        ', 148, 8, 'ascii');
  block.write('0', 156, 1, 'ascii');
  block.write('ustar\0', 257, 6, 'ascii');
  block.write('00', 263, 2, 'ascii');
  const checksum = [...block].reduce((sum, byte) => sum + byte, 0);
  block.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii');
  return block;
}

function tarGz(entries) {
  const blocks = [];
  for (const [name, content] of entries) {
    const body = Buffer.from(content);
    blocks.push(header(name, body.length), body, Buffer.alloc((512 - body.length % 512) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks));
}

test('strips the package README without changing other entries', () => {
  const archive = tarGz([
    ['package/package.json', '{"name":"example"}'],
    ['package/README.md', '# Long plugin readme'],
    ['package/dist/client.js', 'console.log("plugin")'],
  ]);

  assert.deepEqual(listTarGzEntries(archive), [
    'package/package.json',
    'package/README.md',
    'package/dist/client.js',
  ]);

  const stripped = stripReadmeFromTarGz(archive);
  assert.equal(stripped.removed, 1);
  assert.deepEqual(listTarGzEntries(stripped.archive), [
    'package/package.json',
    'package/dist/client.js',
  ]);
  assert.equal(stripReadmeFromTarGz(stripped.archive).removed, 0);
});

test('publishes searchable package metadata without the repository README', () => {
  assert.equal(pkg.name, 'dsh-metaontic-ai-tool');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.homepage, 'https://github.com/wxsimon2022/dsh-metaontic-ai-tool#readme');
  assert.equal(pkg.bugs.url, 'https://github.com/wxsimon2022/dsh-metaontic-ai-tool/issues');

  for (const keyword of [
    'deepseek-harness',
    'dsh-plugin',
    'metaontic-ai',
    'new-api',
    'model-aggregation',
    'api-key-management',
    'balance-query',
    'usage-query',
  ]) {
    assert.ok(pkg.keywords.includes(keyword), `missing keyword: ${keyword}`);
  }

  assert.ok(pkg.files.includes('llms.txt'));
  assert.equal(pkg.files.includes('README.md'), false);

  const llms = readFileSync(new URL('llms.txt', root), 'utf8');
  assert.match(llms, /MetaOntic AI 是多模型聚合平台，提供稳定可靠的模型服务。/);
  assert.match(llms, /dsh plugin --profile desktop add dsh-metaontic-ai-tool/);
  assert.match(llms, /https:\/\/ai\.bileego\.com\/sign-up\?aff=VzYr/);
});

test('keeps installed plugin titles concise', () => {
  const zh = JSON.parse(readFileSync(new URL('locale/zh.json', root), 'utf8'));
  const en = JSON.parse(readFileSync(new URL('locale/en.json', root), 'utf8'));

  assert.equal(zh.meta.title, 'MetaOntic AI 管理工具');
  assert.equal(en.meta.title, 'MetaOntic AI Management Tool');
});

test('keeps packed archives out of the repository root', () => {
  const npmrc = readFileSync(new URL('.npmrc', root), 'utf8');

  assert.match(npmrc, /^pack-destination=release$/m);
});

test('keeps the upstream user agent in sync with the package version', () => {
  const index = readFileSync(new URL('src/index.ts', root), 'utf8');
  const agent = `dsh-metaontic-ai-tool/${pkg.version}`;

  assert.ok(index.includes(agent), `missing user agent: ${agent}`);
});
