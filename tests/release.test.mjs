import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { publishGitee } from '../scripts/publish-gitee.mjs';

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

test('Gitee release requires a token', async () => {
  await assert.rejects(
    publishGitee({ tag: 'v0.0.1', archive: 'missing.tgz', notes: 'notes' }),
    /GITEE_TOKEN/,
  );
});

test('Gitee release rejects invalid tags', async () => {
  await assert.rejects(
    publishGitee({ token: 'token', tag: '0.0.1', archive: 'missing.tgz', notes: 'notes' }),
    /版本标签/,
  );
});

test('Gitee release creates the release and uploads the archive', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-metaontic-release-'));
  const archive = join(dir, 'dsh-metaontic-ai-tool-0.0.1.tgz');
  await writeFile(archive, 'package');
  const calls = [];
  const attachments = [];
  const notes = 'MetaOntic AI 管理工具 v0.0.1\n';

  const request = async (url, options = {}) => {
    const parsed = new URL(url);
    const method = options.method || 'GET';
    calls.push({ method, path: parsed.pathname });
    if (parsed.pathname.endsWith('/releases/tags/v0.0.1')) return response({}, 404);
    if (parsed.pathname.endsWith('/releases') && method === 'POST') {
      return response({ id: 7, body: notes }, 201);
    }
    if (parsed.pathname.endsWith('/attach_files') && method === 'GET') {
      return response(attachments);
    }
    if (parsed.pathname.endsWith('/attach_files') && method === 'POST') {
      const bytes = await readFile(archive);
      attachments.push({ name: 'dsh-metaontic-ai-tool-0.0.1.tgz', size: bytes.length });
      return response({}, 201);
    }
    throw new Error(`unexpected request ${method} ${parsed.pathname}`);
  };

  try {
    const url = await publishGitee({
      token: 'token',
      tag: 'v0.0.1',
      archive,
      notes,
      request,
      log: () => {},
    });
    assert.equal(url, 'https://gitee.com/hackloop/dsh-metaontic-ai-tool/releases/tag/v0.0.1');
    assert.ok(calls.some(call => call.method === 'POST' && call.path.endsWith('/releases')));
    assert.ok(calls.some(call => call.method === 'POST' && call.path.endsWith('/attach_files')));
    assert.equal(attachments[0].size, 7);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
