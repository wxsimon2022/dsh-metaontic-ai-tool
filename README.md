# MetaOntic AI 模型中转助手

> 将多模型平台管理融入 DeepSeek Harness，让模型接入、密钥与费用管理更集中。

## MetaOntic AI

MetaOntic AI 是统一 AI 接口网关与多模型聚合平台，将多家模型服务集中到统一的接入与管理体系中。

- **统一接入**：兼容 OpenAI、Anthropic 与 Gemini 协议，降低模型接入与切换成本。
- **分层管控**：支持账号、分组与令牌多层额度管理，以及个人与团队配额隔离。
- **权限管理**：按用途配置密钥权限、限额和有效期。
- **集中可查**：统一查看调用用量、消耗与请求记录，便于成本核算和问题排查。

实际可用模型、接口与权限以 [MetaOntic AI 平台](https://ai.bileego.com/)为准。

## 插件能力

**MetaOntic模型中转助手**（`dsh-metaontic-newapi-lite`）是 MetaOntic AI 的 DSH 管理插件，在工作台侧栏提供常用管理入口。

| 能力 | 说明 |
| --- | --- |
| 模型浏览 | 搜索与筛选模型，查看可用分组、接口类型及计费信息 |
| 密钥管理 | 创建、分组、复制及管理 API Key，配置额度与有效期 |
| 费用管理 | 查看账户余额、累计用量与请求次数 |
| 订阅充值 | 查看订阅与套餐，发起订阅购买和充值 |
| 账号接入 | 支持在线注册、网页注册和账户访问令牌登录 |

平台负责模型服务、协议兼容及完整调用记录；插件提供上述管理入口。兼容自建平台需具备 New API 风格管理接口。

## 安装

在 DSH 插件市场搜索 **MetaOntic模型中转助手**，或执行：

```bash
dsh plugin --profile desktop add dsh-metaontic-newapi-lite
```

安装后重启 DSH，在侧栏打开插件，使用平台账户访问令牌登录。

## 数据与隐私

账户访问令牌由本机 Host 保存；密钥列表默认脱敏，完整密钥仅在主动显示或复制时读取。插件首次打开时异步发送匿名安装统计，不包含账号或密钥，不影响正常使用。

## English

MetaOntic AI is a unified multi-model API gateway compatible with OpenAI, Anthropic and Gemini protocols, with layered quotas, isolated personal and team allocations, key permissions and centralized usage records.

The MetaOntic AI Management Tool brings model browsing, API key management, balance and usage queries, subscriptions, recharge and account registration into DeepSeek Harness. Sign in with an account access token. Compatible custom platforms require New API management endpoints.

## 链接

[MetaOntic AI](https://ai.bileego.com/) · [npm](https://www.npmjs.com/package/dsh-metaontic-newapi-lite) · [GitHub](https://github.com/wxsimon2022/dsh-metaontic-newapi-lite) · [Gitee](https://gitee.com/hackloop/dsh-metaontic-newapi-lite) · [产品事实与问答](llms.txt) · [MIT License](LICENSE)
