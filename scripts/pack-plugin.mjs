import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listTarGzEntries, stripReadmeFromPackage } from './strip-package-readme.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = join(root, 'release');
const cacheDirectory = join(tmpdir(), `dsh-metaontic-pack-${process.pid}`);

try {
  execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
  mkdirSync(outputDirectory, { recursive: true });
  mkdirSync(cacheDirectory, { recursive: true });
  const output = execFileSync('npm', [
    'pack',
    '--ignore-scripts',
    '--json',
    '--pack-destination',
    outputDirectory,
  ], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: cacheDirectory },
  });
  const [{ filename }] = JSON.parse(output);
  const archive = join(outputDirectory, filename);
  stripReadmeFromPackage(archive);

  if (listTarGzEntries(readFileSync(archive)).some(name => name.toLowerCase().startsWith('package/readme'))) {
    throw new Error('插件包仍包含 README。');
  }
  console.log(`插件包已生成，且不包含 README：${archive}`);
} finally {
  rmSync(cacheDirectory, { recursive: true, force: true });
}
