import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const repository = 'hackloop/dsh-metaontic-ai-tool';
const apiBase = `https://gitee.com/api/v5/repos/${repository}`;

export async function publishGitee({ token, tag, archive, notes, request = fetch, log = console.log }) {
  if (!token) throw new Error('缺少 GITEE_TOKEN，无法发布 Gitee Release。');
  if (!/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag)) {
    throw new Error('版本标签必须符合 v主版本.次版本.修订号 格式。');
  }

  async function api(path, { method = 'GET', data, file, allow404 = false } = {}) {
    const url = new URL(apiBase + path);
    let body;
    if (method === 'GET') {
      url.searchParams.set('access_token', token);
    } else if (file) {
      body = new FormData();
      body.set('access_token', token);
      body.set('file', new Blob([file]), basename(archive));
    } else {
      body = new URLSearchParams({ access_token: token, ...data });
    }

    const response = await request(url, {
      method,
      body,
      signal: AbortSignal.timeout(file ? 300000 : 60000),
    });
    if (allow404 && response.status === 404) return null;
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Gitee ${method} ${path}: HTTP ${response.status}${detail ? ` ${detail.slice(0, 300)}` : ''}`);
    }
    return response.json();
  }

  let release = await api(`/releases/tags/${tag}`, { allow404: true });
  if (!release) {
    release = await api('/releases', {
      method: 'POST',
      data: {
        tag_name: tag,
        name: `MetaOntic AI 管理工具 ${tag}`,
        body: notes,
        target_commitish: 'master',
        prerelease: 'false',
      },
    });
  } else if (release.body !== notes) {
    release = await api(`/releases/${release.id}`, {
      method: 'PATCH',
      data: {
        tag_name: tag,
        name: `MetaOntic AI 管理工具 ${tag}`,
        body: notes,
        prerelease: 'false',
      },
    });
  }
  if (!release?.id) throw new Error('Gitee 未返回发行版 ID。');

  const path = `/releases/${release.id}/attach_files`;
  const attachments = await api(path);
  if (!Array.isArray(attachments)) throw new Error('Gitee 返回的附件列表格式无效。');

  const bytes = await readFile(archive);
  const name = basename(archive);
  const existing = attachments.find(item => (item.name || item.file_name) === name);
  if (existing) {
    log(`Gitee ${tag} 已有附件 ${name}，本次只核对不覆盖。`);
  } else {
    await api(path, { method: 'POST', file: bytes });
  }

  const finalList = await api(path);
  const uploaded = finalList.find(item => (item.name || item.file_name) === name);
  if (!uploaded) throw new Error(`Gitee 未找到附件 ${name}。`);
  if (!existing && Number(uploaded.size) !== bytes.length) {
    throw new Error(`Gitee 附件大小不一致：本地 ${bytes.length} 字节，远端 ${uploaded.size} 字节。`);
  }
  return `https://gitee.com/${repository}/releases/tag/${tag}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [tag, archive, notesFile] = process.argv.slice(2);
  try {
    if (!tag || !archive || !notesFile) {
      throw new Error('用法：node scripts/publish-gitee.mjs <v版本> <安装包> <说明文件>');
    }
    const url = await publishGitee({
      token: process.env.GITEE_TOKEN,
      tag,
      archive,
      notes: await readFile(notesFile, 'utf8'),
    });
    console.log(`Gitee Release 已发布：${url}`);
  } catch (error) {
    console.error(`发布停止：${error.message}`);
    process.exitCode = 1;
  }
}
