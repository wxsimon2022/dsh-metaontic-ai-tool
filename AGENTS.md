# Repository Guidelines

## Project Structure & Module Organization

This repository is the `dsh` Host and browser plugin for the MetaOntic AI multi-model aggregation platform, built on open-source New API. Host code is split under `src/host/` into constants, shared types, HTTP utilities, platform queries, login storage, API Key operations, shared payment signing, subscription operations, recharge operations, and route handlers; `index.ts` only exposes the public API and registers routes. Browser code is split under `src/client/` into dictionaries, styles, runtime types/helpers, shell, pages, dashboard state, and the loader entry `client.ts`. `src/types/dsh.d.ts` declares browser-side host APIs. `tsc` emits Host ESM files to `dist/`, while esbuild bundles the browser entry into a single IIFE at `dist/client.js`; `package.json` exports those files. `cordis.patch.yml` mounts the bundle, and metadata lives in `locale/`.

## Build, Test, and Development Commands

- `npm run build` compiles Host modules to `dist/` and bundles `src/client.ts` to `dist/client.js`.
- `npm run build:host` and `npm run build:client` run the two build stages separately.
- `npm run typecheck` checks types without emitting files.
- `npm run check` runs type checking and validates test syntax.
- `npm test` builds, then runs the offline `node:test` suite against `dist/`.
- `npm run pack:check` verifies the published file list.
- `npm run pack:plugin` builds `release/dsh-metaontic-newapi-lite-0.0.1.tgz` and removes its README so the plugin settings page does not render the repository README.
- `dsh plugin --profile desktop add ./release/dsh-metaontic-newapi-lite-0.0.1.tgz` installs it locally.

Use Node.js 20 or newer. Run `npm install`, `npm run check`, and `npm test` before submitting changes. Never edit `dist/` by hand; it is generated and ignored by Git.

## Coding Style & Naming Conventions

Use TypeScript, ES modules, two-space indentation, semicolons, and single quotes. Prefer explicit interfaces for API payloads and avoid `any` unless typing a host-provided dynamic object. Keep JSON indented by two spaces and plugin IDs in kebab case, such as `dsh-metaontic-newapi-lite`. The browser UI uses the host-provided React instance through `require('react')`. No formatter or linter is configured; match surrounding files and keep changes focused.

## Testing Guidelines

Tests use the built-in `node:test` runner with `*.test.mjs` names. Prefer injected `fetch` mocks and temporary directories so tests remain offline and deterministic. Cover URL/token validation, authorization headers, response sanitization, saved-session restore, logout cleanup, and stable error codes. Add a test for every behavior change.

## Release Policy

- Do not publish a release unless the user explicitly says “发版”, “发布版本”, or gives an equally explicit publish instruction.
- Bug fixes, UI changes, documentation or GEO updates, commits, builds, local plugin packages, and local profile installations are not release approval.
- Do not bump the version, publish to npm, create tags or GitHub/Gitee releases, or update plugin-market submissions as part of routine work.
- It is fine to run tests, build, create a local tarball, and install that tarball into a local DSH profile for verification without publishing.
- When the request is ambiguous, stop before any publish step and ask for explicit confirmation.

## npm 发版授权规范

- npm 发版统一走浏览器授权，明确使用官方源 `https://registry.npmjs.org`，不使用镜像源进行登录或发布。
- 发布前执行 `npm login --auth-type=web --registry=https://registry.npmjs.org`，将 CLI 返回的官方授权链接提供给用户，等待浏览器授权成功；不要索要或让用户在聊天中发送密码、OTP、恢复码或访问令牌。
- 使用交互终端发布已验证的安装包：`npm publish ./release/dsh-metaontic-newapi-lite-<version>.tgz --access public --auth-type=web --registry=https://registry.npmjs.org`。若发布还需二次验证，继续走 CLI 提供的浏览器授权流程；登录成功不等于发布成功。
- 遇到授权失败或过期，重新发起浏览器授权，不重复使用旧授权链接，不退回索要 OTP 或长期令牌的方式。不得输出本机 npm 凭据配置的内容。
- 发布后核对官方源的 `latest`、版本及 tarball 可下载性，再核对国内镜像；镜像尚未同步时明确告知，不重复发布同一版本。
- 浏览器授权不能代替用户的明确发版指令，仍遵守上方 Release Policy。

## Commit & Pull Request Guidelines

Use concise imperative subjects, for example `Add access-token platform query`. Pull requests should describe user-visible changes, list validation commands, keep Chinese and English metadata in sync, and include screenshots for UI changes.

## Security & Configuration

Access tokens are entered by users and saved only by the Host in the active profile at `.dsh-metaontic-newapi-lite/login.json` with directory mode `0700` and file mode `0600`. Legacy `.dsh-metaontic-ai-tool/login.json` files are migrated on read. Never send the saved token back to the browser, and never log, echo, or include tokens in URLs, fixtures, commits, or release notes. Keep `redirect: 'error'` and timeouts on upstream requests. Only expose approved account fields; do not return upstream tokens, email, or unrelated settings. API Key lists must stay masked; full API Key material may be read only through an explicit per-key reveal request and must never be persisted by the browser. The default platform URL is `https://ai.bileego.com/`.
