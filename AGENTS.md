# Repository Guidelines

## Project Structure & Module Organization

This repository is the `dsh` Host and browser plugin for the MetaOntic AI multi-model aggregation platform, built on open-source New API. TypeScript sources live in `src/`: `index.ts` contains the login/query routes, validation, upstream requests, sanitized mapping, and profile-local login storage; `client.ts` registers the sidebar icon and main panel. `src/types/dsh.d.ts` declares the browser-side host APIs. `tsc` emits runtime files to `dist/`; `package.json` exports those files. `cordis.patch.yml` mounts the bundle, and metadata lives in `locale/`.

## Build, Test, and Development Commands

- `npm run build` compiles `src/*.ts` to `dist/` with `tsc`.
- `npm run typecheck` checks types without emitting files.
- `npm run check` runs type checking and validates test syntax.
- `npm test` builds, then runs the offline `node:test` suite against `dist/`.
- `npm run pack:check` verifies the published file list.
- `npm pack` creates `dsh-metaontic-ai-tool-0.0.2.tgz`.
- `dsh plugin --profile desktop add ./dsh-metaontic-ai-tool-0.0.2.tgz` installs it locally.

Use Node.js 20 or newer. Run `npm install`, `npm run check`, and `npm test` before submitting changes. Never edit `dist/` by hand; it is generated and ignored by Git.

## Coding Style & Naming Conventions

Use TypeScript, ES modules, two-space indentation, semicolons, and single quotes. Prefer explicit interfaces for API payloads and avoid `any` unless typing a host-provided dynamic object. Keep JSON indented by two spaces and plugin IDs in kebab case, such as `dsh-metaontic-ai-tool`. The browser UI uses the host-provided React instance through `require('react')`. No formatter or linter is configured; match surrounding files and keep changes focused.

## Testing Guidelines

Tests use the built-in `node:test` runner with `*.test.mjs` names. Prefer injected `fetch` mocks and temporary directories so tests remain offline and deterministic. Cover URL/token validation, authorization headers, response sanitization, saved-session restore, logout cleanup, and stable error codes. Add a test for every behavior change.

## Commit & Pull Request Guidelines

Use concise imperative subjects, for example `Add access-token platform query`. Pull requests should describe user-visible changes, list validation commands, keep Chinese and English metadata in sync, and include screenshots for UI changes.

## Security & Configuration

Access tokens are entered by users and saved only by the Host in the active profile at `.dsh-metaontic-ai-tool/login.json` with directory mode `0700` and file mode `0600`. Never send the saved token back to the browser, and never log, echo, or include tokens in URLs, fixtures, commits, or release notes. Keep `redirect: 'error'` and timeouts on upstream requests. Only expose approved account fields; do not return upstream tokens, email, or unrelated settings. The default platform URL is `https://ai.bileego.com/`.
