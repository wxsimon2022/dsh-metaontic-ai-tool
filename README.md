# MetaOntic模型中转助手

> 在 DeepSeek Harness 内查看额度、挑选模型、管理 API Key、购买订阅与充值。

`dsh-metaontic-newapi-lite` 是 MetaOntic AI 的 DeepSeek Harness（DSH）插件。通过账户访问令牌登录，即可在侧边栏完成常用的平台管理操作。默认连接 [MetaOntic AI](https://ai.bileego.com/)，也可填写提供兼容 New API 管理接口的平台地址。

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

没有账号时，可点击面板中的 **注册账号**，或访问 [MetaOntic AI 注册页](https://ai.bileego.com/sign-up?aff=VzYr)。

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

## 平台兼容性

插件依赖 New API 风格的账户、模型、Key、订阅与充值管理接口。仅提供 OpenAI 兼容的模型调用接口，并不足以支持本插件的全部功能。

自建平台需提供对应接口及访问权限。例如，模型广场读取 `/api/pricing`，账户与平台信息读取 `/api/user/self` 和 `/api/status`。不同平台版本、配置和权限可能影响可用功能；充值和订阅还需要平台开启相关能力并配置支付方式。

## 常见问题

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
dsh plugin --profile desktop add ./release/dsh-metaontic-newapi-lite-0.0.3.tgz
```

本地包位于 `release/`，不包含 README，避免仓库说明显示在插件设置页。更新本地包后需重启 DSH；如同名包被缓存，可将包复制为新的文件名后重新安装。

## English

MetaOntic model relay assistant for DeepSeek Harness. Sign in with an account access token to view balance and usage, search models and filter by group, create and manage API keys, copy keys without revealing them in the list, and purchase subscriptions or recharge credits.

Recharge amounts are entered in USD and paid in CNY. A CNY estimate is shown when a valid platform exchange rate is available; the payment order determines the final amount. Subscription prices are displayed in CNY.

Account tokens are stored privately by the local DSH Host. Key lists stay masked, and full keys are fetched individually only when you choose to reveal or copy them. Custom platforms must provide compatible New API management endpoints; OpenAI-compatible inference endpoints alone are insufficient.

## 链接与许可

- [GitHub 仓库](https://github.com/wxsimon2022/dsh-metaontic-newapi-lite)
- [Gitee 仓库](https://gitee.com/hackloop/dsh-metaontic-newapi-lite)
- [npm 包](https://www.npmjs.com/package/dsh-metaontic-newapi-lite)
- [MIT License](LICENSE)
