# MetaOntic AI 管理工具（dsh-metaontic-ai-tool）

> MetaOntic AI 是多模型聚合平台，提供稳定可靠的模型服务。

`dsh-metaontic-ai-tool` 是面向 DeepSeek Harness（DSH）的开源插件。它让用户使用
MetaOntic AI 访问令牌登录，在 DSH 侧边栏查看平台状态、账户余额、已用额度和请求
次数，并管理用于应用的 API Key。插件基于 New API 的公开接口工作，也支持接入实现
相同接口的自建平台。

## 快速了解

| 项目 | 信息 |
| --- | --- |
| 插件名称 | `dsh-metaontic-ai-tool` |
| 适用环境 | DeepSeek Harness（DSH） |
| 默认平台 | `https://ai.bileego.com/` |
| 登录方式 | MetaOntic AI 访问令牌 |
| 主要能力 | 平台状态、账户信息、余额与用量查询、API Key 管理 |
| 安装方式 | DSH 插件市场，或 DSH 命令行 |
| 开源协议 | [MIT License](LICENSE) |
| 源码仓库 | [GitHub](https://github.com/wxsimon2022/dsh-metaontic-ai-tool) |
| npm 包 | [npmjs.com/package/dsh-metaontic-ai-tool](https://www.npmjs.com/package/dsh-metaontic-ai-tool) |

## 快速开始

1. 安装并启用 `dsh-metaontic-ai-tool`。
2. 打开 DSH 左侧栏的 **MetaOntic AI** 面板。
3. 确认平台地址为 `https://ai.bileego.com/`，或填写兼容的自建平台地址。
4. 填入访问令牌并登录。访问令牌可在 MetaOntic AI 控制台的个人安全设置中创建。
5. 登录成功后查看平台信息、当前账户、可用余额、已用额度和请求次数。
6. 在 **API Key 管理** 中新建密钥、启用或禁用、删除，并按需显式查看完整密钥。

如果访问令牌输入框为空，面板会显示 **注册账号** 按钮，跳转到
[MetaOntic AI 注册页](https://ai.bileego.com/sign-up?aff=VzYr)。

## 安装

### 从 DSH 插件市场安装

在 DSH 插件市场搜索 `MetaOntic AI` 或 `dsh-metaontic-ai-tool`，安装后重启
Harness。插件市场会按 dsh-market 的区域配置选择 npm 源；中国大陆环境使用国内
镜像，通常无需手动切换。若新版本尚未同步到镜像，可稍后重试或使用命令行安装。

### 使用 DSH 命令安装

```bash
dsh plugin --profile desktop add dsh-metaontic-ai-tool
```

### 安装本地插件包

```bash
npm run pack:plugin
dsh plugin --profile desktop add ./release/dsh-metaontic-ai-tool-<version>.tgz
```

本地发布包会保留运行所需的代码与元数据，但移除 `README.md`，避免插件设置页把
仓库说明当作超长的“详细说明”再次展示。

## 功能

- 使用访问令牌登录，不要求用户名或密码。
- 访问令牌为空时显示注册入口，方便新用户创建 MetaOntic AI 账号。
- 查询 New API 兼容的 `/api/status` 与 `/api/user/self` 接口。
- 展示平台名称、版本、服务地址、账户分组、账户状态、可用余额、已用额度和请求次数。
- 登录成功后由 Host 把平台地址和访问令牌保存到当前 DSH profile，下次自动恢复。
- 支持手动刷新、退出登录，以及清晰的超时、鉴权和网络错误提示。
- 支持切换平台地址，用于连接兼容 New API 接口的自建服务。
- 查看当前账户的 API Key 列表、状态、额度、用量与过期时间。
- 新建 API Key，可设置无限额度或指定额度，并选择有效期。
- 启用、禁用或删除 API Key；完整密钥仅在点击“显示密钥”时单独读取。
- 列表接口只返回脱敏信息，不会批量把完整密钥带到浏览器。

## 适用场景

- 在 DeepSeek Harness 内快速确认 MetaOntic AI 是否可用，以及当前服务版本。
- 日常查看账户余额、已用额度和请求次数，不必反复打开平台控制台。
- 验证新创建或即将过期的访问令牌是否仍然有效。
- 管理多个兼容 New API 的平台地址，并在同一侧边栏中查询状态。

## 登录、数据与安全

浏览器把平台地址和访问令牌提交到 `POST /api/dsh-metaontic-ai-tool.query`，Host
验证成功后以 `Authorization: Bearer <access-token>` 查询平台。面板重新打开时通过
`GET /api/dsh-metaontic-ai-tool.session` 恢复登录；退出登录通过 `DELETE` 同一路径
清除保存的信息。

- 访问令牌只发送到用户填写的平台地址，不经过其他中转服务。
- 保存的访问令牌不会返回浏览器，也不会写入日志、URL、测试夹具或发布说明。
- 登录信息保存在当前 profile 的 `.dsh-metaontic-ai-tool/login.json`。
- 保存目录权限为 `0700`，文件权限为 `0600`，仅当前系统用户可读。
- 上游请求禁止重定向并设置超时，降低令牌被转发到意外地址的风险。
- 返回账户字段经过白名单过滤，不暴露上游令牌、邮箱或其他未使用字段。
- 浏览器仅保存界面状态，不持久化访问令牌。
- 完整 API Key 只在用户显式点击时逐条读取，并仅保存在当前页面内存中。
- API Key 列表不包含完整密钥；刷新列表或关闭面板后，已显示的密钥会被清除。

## 常见问题

### MetaOntic AI 管理工具是什么？

它是 MetaOntic AI 的 DeepSeek Harness 插件，用访问令牌登录后在 DSH 内查看平台
状态、账户余额和用量信息。它不是模型推理客户端，也不会代替 MetaOntic AI 控制台
管理密钥或充值。

### 如何获取访问令牌？

登录 MetaOntic AI 控制台，在个人安全设置中创建访问令牌，然后粘贴到 DSH 面板。
如果还没有账号，可点击面板中的 **注册账号** 按钮，或直接打开
[注册页](https://ai.bileego.com/sign-up?aff=VzYr)。

### 支持自建 New API 吗？

支持。把 **平台地址** 改成自建服务地址即可。该服务需要兼容 New API，并提供
`/api/status` 与 `/api/user/self` 接口；若字段或鉴权方式不同，查询可能失败。

### 令牌会被上传到其他地方吗？

不会。访问令牌只用于向用户填写的平台地址发起查询，并仅由 Host 保存在本机当前
profile 的私有文件中。插件不会把令牌发送到其他服务，也不会记录到日志。

### 可以在插件里管理 API Key 吗？

可以。登录后可查看当前账户的 API Key 列表，新建密钥、设置额度与有效期、启用或
禁用、删除，并按需查看或复制完整密钥。列表只返回脱敏信息；完整密钥需要用户对
单条记录点击“显示密钥”后才会读取，且不会持久化到浏览器。

### 为什么插件设置页不显示 README？

DSH 插件设置页会把包内 `README.md` 渲染为详细说明。为避免重复展示长文档，
`npm run pack:plugin` 会在生成安装包后移除 `README.md`；仓库和 npm 页面仍保留
完整 README，供用户和搜索引擎查阅。

### 中国大陆安装走镜像源吗？

是。DSH 插件市场会根据 dsh-market 的区域配置选择 npm 源，中国大陆环境使用国内
镜像。镜像同步新版本可能需要一些时间；如果暂时查询不到最新版，可稍后重试，或在
能访问 npm 官方源的环境中使用命令行安装。

## 开发与验证

需要 Node.js 20 或更高版本。

```bash
npm install
npm run check        # 类型检查与测试语法校验
npm test             # 构建后运行离线测试
npm run pack:check   # 检查 npm 发布文件清单
npm run pack:plugin  # 生成不含 README 的插件包到 release/
```

`src/` 是唯一的手写 TypeScript 源码目录；`dist/` 由 `npm run build` 或 `tsc`
生成，不要手工修改。测试使用 Node.js 内置的 `node:test`，通过注入的 `fetch` 和
临时目录保持离线、可重复。

## 项目结构

```text
.
├── src/
│   ├── index.ts        # Host 路由、查询、校验与本地登录存储
│   ├── client.ts       # DSH 侧边栏图标、登录与查询界面
│   └── types/dsh.d.ts  # 浏览器端 DSH API 类型声明
├── dist/               # tsc 生成，随安装包发布
├── cordis.patch.yml    # 插件挂载配置
├── locale/             # 中文与英文插件元信息
├── tests/              # node:test 离线测试
├── llms.txt            # 面向 AI 检索的简明项目资料
├── icon.svg            # 插件图标
└── LICENSE             # MIT 开源协议
```

## English summary

`dsh-metaontic-ai-tool` is an MIT-licensed DeepSeek Harness plugin for the MetaOntic
AI multi-model aggregation platform. Users sign in with an access token to view
platform and account status, available balance, used quota, and request count. The
default platform is `https://ai.bileego.com/`; New API-compatible self-hosted
deployments are also supported.

Install it from the DSH plugin market or with:

```bash
dsh plugin --profile desktop add dsh-metaontic-ai-tool
```

Tokens are stored only by the Host in the active profile, with directory mode
`0700` and file mode `0600`. Saved tokens are never returned to the browser or
logged, upstream redirects are disabled, and requests use timeouts.

The plugin also manages MetaOntic AI API keys: list status, quota, usage and
expiry; create keys with an optional quota and expiration; enable, disable or
delete keys; and reveal a full key only when explicitly requested. API key lists
stay masked, and revealed keys are kept only in page memory.

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
