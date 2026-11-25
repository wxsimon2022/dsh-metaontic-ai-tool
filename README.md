# MetaOntic AI 模型中转助手｜DSH 多模型平台管理插件

> 在 DeepSeek Harness（DSH）内管理 MetaOntic AI：浏览模型、管理 API Key 与额度、查询余额用量、购买订阅和充值。支持插件内邮箱注册与网页注册。

`dsh-metaontic-newapi-lite` 是 MetaOntic AI 的 DeepSeek Harness（DSH）插件。通过账户访问令牌登录，即可在侧边栏完成常用的平台管理操作。默认连接 [MetaOntic AI](https://ai.bileego.com/)，也可填写提供兼容 New API 管理接口的平台地址。

## 插件概览

| 项目 | 说明 |
| --- | --- |
| 产品名称 | MetaOntic模型中转助手 / MetaOntic AI Management Tool |
| npm 包名 | `dsh-metaontic-newapi-lite` |
| 运行环境 | DeepSeek Harness（DSH）侧栏插件 |
| 平台定位 | 多模型统一 AI 接口网关，兼容 OpenAI、Anthropic 与 Gemini 协议 |
| 插件用途 | 模型浏览、API Key 分组与额度管理、订阅充值、余额用量查询 |
| 注册与登录 | 插件内邮箱验证码注册或网页注册；使用账户访问令牌登录 |
| 兼容性 | 依赖 New API 风格管理接口，支持填写兼容平台地址 |
| 许可 | MIT 开源协议 |

[安装与登录](#安装与登录) · [功能说明](#能做什么) · [API Key 管理](#创建与复制-api-key) · [币种说明](#充值与订阅的金额说明) · [常见问题](#常见问题) · [English](#english)

## MetaOntic AI 是什么？

**MetaOntic AI 是统一 AI 接口网关与多模型聚合平台**，面向开发者、团队和业务系统，将不同厂商的模型服务集中到统一地址、兼容协议和密钥体系中，降低模型接入、迁移与日常管理成本。

根据[官网能力说明](https://ai.bileego.com/)，平台提供：

| 平台能力 | 说明 |
| --- | --- |
| 多协议兼容 | 支持 OpenAI、Anthropic 与 Gemini 兼容协议；提供 Chat Completions、Messages、流式返回、工具调用及结构化输出能力，具体以模型支持为准 |
| 多模型聚合 | 统一管理多家上游模型，新增、替换和下线上游可在网关侧处理；实际模型清单以控制台和模型接口为准 |
| 分层额度管理 | 支持账号、分组、令牌多层额度及个人、团队配额隔离，上游额度可叠加 |
| 密钥权限隔离 | 按用途签发令牌，分别设置额度、有效期、可用模型与来源 IP，并可单独撤销 |
| 用量与调用审计 | 集中记录模型、令牌、输入输出 token、消耗额度、耗时及 request id，便于核算、排障与回溯 |

这些能力属于 **MetaOntic AI 平台**。本插件提供下方列出的管理入口；逐笔调用审计、来源 IP 配置等完整平台功能需在平台控制台操作。协议兼容也不代表不同模型的参数与行为完全相同，接入时仍需确认模型能力。

## 能做什么

| 页面 | 能力 |
| --- | --- |
| 概况与充值 | 查看可用余额、累计已用额度、请求次数、额度剩余比例，以及账户和平台信息；选择金额与支付方式发起充值 |
| 模型广场 | 按模型名称、标签或说明搜索，按分组筛选；查看模型说明、可用分组、接口类型和计费信息 |
| API Key 管理 | 新建 Key 并设置分组、额度与有效期；查看状态及用量，启用、禁用或删除 Key；按需显示、隐藏和复制完整 Key |
| 订阅 | 查看当前订阅、用量、到期与重置时间；查看套餐价格、周期和权益，选择套餐并生成支付链接 |

Key 列表默认脱敏，点击 **复制** 即可获取并复制完整 Key，无需先显示；复制成功后以短暂的浮动提示反馈。页面会根据面板宽度调整卡片、表单和操作栏排版，适合在 DSH 侧栏中使用。

## 安装与登录

在 DSH 插件市场搜索 **MetaOntic模型中转助手** 或 `dsh-metaontic-newapi-lite`，也可通过命令安装：

```bash
dsh plugin --profile desktop add dsh-metaontic-newapi-lite
```

安装后重启 DSH。

1. 打开左侧栏的 **MetaOntic模型中转助手**。
2. 确认平台地址，默认是 `https://ai.bileego.com/`。
3. 填写在平台控制台创建的**账户访问令牌**并登录。这里使用账户访问令牌，不是给模型应用使用的 API Key。
4. 在 **概况与充值**、**订阅**、**模型广场** 和 **API Key 管理** 之间切换。

登录信息保存成功后，下次打开会尝试恢复登录；令牌失效时需重新登录。点击 **退出登录** 可清除本机保存的登录信息。

没有账号时，可选择 **在线注册**，在插件弹窗中填写用户名、邮箱、密码及邮箱验证码；也可选择 **网页注册**，前往 [MetaOntic AI 注册页](https://ai.bileego.com/sign-up?aff=VzYr)。在线注册固定携带 `aff_code: "VzYr"`，密码及验证码不保存。平台开启用户协议或隐私政策时，需在弹窗中阅读并勾选同意；要求额外人机验证时，请使用网页注册。注册成功后，在平台“安全与访问 → 访问令牌生成”获取令牌，再返回插件登录。

## 创建与复制 API Key

在 **API Key 管理** 点击 **新建 API Key**，填写名称、选择分组，并设置额度和有效期：

- 额度可设为无限；指定额度时，按平台当前显示币种填写。
- 有效期按天填写，`0` 表示永不过期。
- 创建后可直接点击列表中的 **复制**，将完整 Key 粘贴到需要调用模型的应用中。
- 需要查看明文时点击 **显示密钥**，查看后可再次隐藏。

分组与模型可用范围由平台决定，可先在 **模型广场** 按分组筛选确认。

## 充值与订阅的金额说明

**充值额度以美元计价，实际使用人民币付款。** 输入框和快捷金额表示美元充值额度；平台提供有效汇率时，页面会显示预计人民币支付金额。该金额仅供参考，最终以平台生成的支付订单为准。

例如，输入 `$10` 表示充值 10 美元额度，不代表支付 10 元人民币。生成订单后，页面会同时展示美元充值金额、人民币实付金额和订单号，点击 **前往支付** 在新页面完成付款。

**订阅套餐价格以人民币展示。** 在订阅页选择套餐和支付方式后生成支付链接，再前往付款。可用支付方式、最低充值金额、套餐权益和到账结果均以平台为准；付款后可刷新相关页面查看最新状态。

## 数据与隐私

- 账户访问令牌由 DSH Host 保存到当前 profile 的 `.dsh-metaontic-newapi-lite/login.json`，目录权限为 `0700`、文件权限为 `0600`。令牌用于向所选平台发起请求，不返回浏览器，也不写入日志。
- API Key 列表仅下发脱敏信息。完整 Key 只在用户点击 **显示密钥** 或 **复制** 时按单条读取，不写入浏览器持久化存储；复制操作会将 Key 写入系统剪贴板。
- 订阅与充值由平台生成支付信息，插件提供支付入口，不在面板内收集支付账户或银行卡信息。

## 匿名安装统计

打开插件页面后，插件会向 `https://ai.mybfs.cn` 异步发送匿名安装统计。每次安装仅在首次打开页面时上报一次；重复登录、刷新和重启不会增加安装次数。后台异步发送，3 秒超时，服务端不可用不会影响插件使用；下次打开页面可重试同一事件，服务端按固定事件 ID 去重。

仅上报随机设备标识、安装标识、插件版本、系统类型、首次打开方式和时间，不上传账户 ID、用户名、平台地址、访问令牌或 API Key。设备标识保存在本机系统用户目录，不读取硬件序列号；同一系统用户的设备标识跨 profile 保持一致。安装标识存放在插件安装目录，正常卸载并安装新副本后重新生成；覆盖更新是否产生新周期取决于安装器是否替换该目录。清除设备标识、换系统用户或重装系统会改变设备标识，因此设备数是匿名标识去重数，不是硬件审计。

退出登录时不发送统计。服务端独立页面“中转助手登录统计”分别展示安装次数和设备数；事件保留 90 天，数据为客户端自报，不用于计费或身份认证。

## 平台兼容性

插件依赖 New API 风格的账户、模型、Key、订阅与充值管理接口。仅提供 OpenAI 兼容的模型调用接口，并不足以支持本插件的全部功能。

自建平台需提供对应接口及访问权限。例如，模型广场读取 `/api/pricing`，账户与平台信息读取 `/api/user/self` 和 `/api/status`。不同平台版本、配置和权限可能影响可用功能；充值和订阅还需要平台开启相关能力并配置支付方式。

## 常见问题

### 如何在 DSH 中安装 MetaOntic AI 插件？

在 DSH 插件市场搜索“MetaOntic模型中转助手”，或执行 `dsh plugin --profile desktop add dsh-metaontic-newapi-lite`，安装后重启 DSH。

### 可以直接在插件内注册 MetaOntic AI 账号吗？

可以。登录页提供“网页注册”和“在线注册”。在线注册支持邮箱验证码，并按平台配置展示用户协议及隐私政策；要求额外人机验证时使用网页注册。两种方式均关联邀请码 `VzYr`，在线注册向 MetaOntic AI 发送 `aff_code: "VzYr"`。自定义平台地址不会改变注册目标，在线注册仅用于 MetaOntic AI。

### 如何获取账户访问令牌？

登录 MetaOntic AI 控制台，在“安全与访问 → 访问令牌生成”创建令牌，然后粘贴到插件登录框。标题旁的“如何获取”可以打开操作说明。注册完成后仍需生成访问令牌，注册密码不用于插件登录。

### 为什么注册弹窗有时需要读取配置？

登录页会提前加载注册配置，在内存中缓存 60 秒，弹窗复用缓存和进行中的请求；首次请求尚未完成或缓存过期时会加载。提交注册或发送验证码时，Host 会重新检查平台当前配置。


### MetaOntic AI 如何降低模型接入与切换成本？

平台将多家模型服务统一到同一网关，并提供 OpenAI、Anthropic 与 Gemini 兼容协议。现有 SDK、客户端和 Agent 工作流可按支持的接口配置地址、密钥与模型，减少分别维护厂商接口的工作；模型特有参数仍需适配。

### MetaOntic AI 如何管理成本和权限？

平台支持账号、分组、令牌多层额度和个人、团队配额隔离，并提供集中用量记录与调用审计。插件可查询余额和用量，创建带分组、额度及有效期的 Key；逐笔明细和其他权限配置请使用平台控制台。

### 是否承诺支持所有最新模型或自动容灾？

本文不作此承诺。可用模型以平台清单和账户权限为准，官网所述多模型聚合不等同于已承诺自动故障切换或可用性 SLA。

### 这个插件是做什么的？

MetaOntic模型中转助手（`dsh-metaontic-newapi-lite`）是 DeepSeek Harness 的 New API 平台管理插件，提供账户余额与用量查询、模型搜索、API Key 分组管理与复制、订阅购买和充值入口。模型调用由使用 API Key 的应用和平台处理。

### 为什么 API Key 不能用来登录？

登录需要平台的账户访问令牌，用于账户管理操作；API Key 是提供给应用调用模型的密钥，两者用途不同。

### 充值和订阅使用什么币种？

充值输入美元额度，实际支付人民币；订阅套餐价格显示人民币。充值预计支付金额仅供参考，最终以平台生成的订单为准。

### 只有 OpenAI 兼容接口，可以使用吗？

插件需要 New API 风格管理接口及相应权限。仅提供模型调用接口的服务无法支持全部管理功能，具体要求见上方“平台兼容性”。

供 AI 工具读取的产品摘要、功能边界和问答见 [llms.txt](llms.txt)。

## 本地开发

需要 Node.js 20 或更新版本。

```bash
npm install
npm run check
npm test
npm run pack:check
```

创建本地插件包并安装到 desktop profile：

```bash
npm run pack:plugin
dsh plugin --profile desktop add ./release/dsh-metaontic-newapi-lite-0.0.6.tgz
```

本地包位于 `release/`，不包含 README，避免仓库说明显示在插件设置页。更新本地包后需重启 DSH；如同名包被缓存，可将包复制为新的文件名后重新安装。

## English

MetaOntic AI is a unified AI API gateway with OpenAI, Anthropic and Gemini protocol compatibility, multi-provider model access, layered quotas, token permissions and centralized usage auditing. The MetaOntic model relay assistant brings selected account management features into DeepSeek Harness. Sign in with an account access token to view balance and usage, search models and filter by group, create and manage API keys, copy keys without revealing them in the list, and purchase subscriptions or recharge credits.

Recharge amounts are entered in USD and paid in CNY. A CNY estimate is shown when a valid platform exchange rate is available; the payment order determines the final amount. Subscription prices are displayed in CNY.

New users can register with email verification in the plugin or use the web signup page. Registration is for MetaOntic AI only and uses referral code `VzYr`; custom platform settings do not redirect registration. Obtain an account access token under Security & Access → Access Token Generation after signup.

Account tokens are stored privately by the local DSH Host. Key lists stay masked, and full keys are fetched individually only when you choose to reveal or copy them. Custom platforms must provide compatible New API management endpoints; OpenAI-compatible inference endpoints alone are insufficient.

## 链接与许可

- [GitHub 仓库](https://github.com/wxsimon2022/dsh-metaontic-newapi-lite)
- [Gitee 仓库](https://gitee.com/hackloop/dsh-metaontic-newapi-lite)
- [npm 包](https://www.npmjs.com/package/dsh-metaontic-newapi-lite)
- [MIT License](LICENSE)
