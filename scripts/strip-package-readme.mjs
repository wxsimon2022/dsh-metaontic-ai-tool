import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

const BLOCK_SIZE = 512;
const README_NAMES = new Set(['package/readme.md', 'package/readme', 'package/readme.markdown']);

function field(header, start, length) {
  return header.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '').trim();
}

function entryName(header) {
  const name = field(header, 0, 100);
  const prefix = field(header, 345, 155);
  return prefix ? `${prefix}/${name}` : name;
}

function entrySize(header) {
  if (header[124] & 0x80) {
    let size = 0;
    for (let index = 124; index < 136; index += 1) size = size * 256 + header[index];
    return size;
  }
  const raw = field(header, 124, 12);
  return raw ? Number.parseInt(raw, 8) : 0;
}

export function listTarGzEntries(archive) {
  const tar = gunzipSync(archive);
  const entries = [];
  let offset = 0;
  while (offset + BLOCK_SIZE <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK_SIZE);
    if (header.every(byte => byte === 0)) break;
    const name = entryName(header);
    entries.push(name);
    offset += BLOCK_SIZE + Math.ceil(entrySize(header) / BLOCK_SIZE) * BLOCK_SIZE;
  }
  return entries;
}

export function stripReadmeFromTarGz(archive) {
  const tar = gunzipSync(archive);
  const blocks = [];
  let offset = 0;
  let removed = 0;
  let terminated = false;

  while (offset + BLOCK_SIZE <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK_SIZE);
    if (header.every(byte => byte === 0)) {
      blocks.push(tar.subarray(offset));
      terminated = true;
      break;
    }

    const size = entrySize(header);
    const length = BLOCK_SIZE + Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
    if (offset + length > tar.length) throw new Error('插件包中的 tar 条目不完整。');

    if (README_NAMES.has(entryName(header).toLowerCase())) {
      removed += 1;
    } else {
      blocks.push(tar.subarray(offset, offset + length));
    }
    offset += length;
  }

  if (!terminated) blocks.push(Buffer.alloc(BLOCK_SIZE * 2));
  return { archive: gzipSync(Buffer.concat(blocks)), removed };
}

export function stripReadmeFromPackage(path) {
  const file = resolve(path);
  const result = stripReadmeFromTarGz(readFileSync(file));
  if (result.removed > 0) {
    const temporary = `${file}.tmp`;
    writeFileSync(temporary, result.archive);
    renameSync(temporary, file);
  }
  return result.removed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const path = process.argv[2];
  if (!path) {
    console.error('用法：node scripts/strip-package-readme.mjs <插件包.tgz>');
    process.exitCode = 1;
  } else {
    const removed = stripReadmeFromPackage(path);
    console.log(removed > 0 ? `已从插件包移除 README：${path}` : `插件包不含 README，无需修改：${path}`);
  }
}
