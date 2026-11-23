# MetaOntic模型中转助手

> DeepSeek Harness（DSH）插件 · New API / OpenAI 兼容 · 模型广场 · API Key 管理 · 订阅充值

`dsh-metaontic-newapi-lite` 是面向 DeepSeek Harness 的 MetaOntic 模型中转管理插件。使用访问令牌登录后，可在 DSH 侧边栏查看账户与额度、浏览模型广场、管理 API Key 分组、购买订阅并发起充值。默认平台为 `https://ai.bileego.com/`，也兼容提供 New API 风格接口的自建模型中转平台。

## 功能亮点

- **模型广场**：查看可用模型、模型说明、标签、支持分组、接口类型与计费倍率。
- **API Key 管理**：新建时选择分组、额度与有效期；支持启用、禁用、删除，并按需显示完整密钥。
- **订阅与充值**：查看套餐和当前订阅，生成订阅或充值支付链接。
- **账户概览**：查看余额、已用额度、请求次数、剩余比例与平台信息。
- **注册入口**：无访问令牌时显示注册按钮，跳转带邀请码的注册页面。
- **本地安全**：访问令牌由 DSH Host 保存在本机私有文件；API Key 列表保持脱敏。

## 兼容性

- DeepSeek Harness（DSH）插件市场与 npm 安装。
- New API 兼容平台，默认 `https://ai.bileego.com/`。
- 模型列表读取 `/api/pricing`，账户查询读取 `/api/status` 与 `/api/user/self`。

## 安装

在 DSH 插件市场搜索 `MetaOntic模型中转助手` 或 `dsh-metaontic-newapi-lite`，安装后重启 Harness。

```bash
dsh plugin --profile desktop add dsh-metaontic-newapi-lite
```

## 使用

1. 打开 DSH 左侧栏的 **MetaOntic模型中转助手**。
2. 确认平台地址，填写 MetaOntic AI 访问令牌并登录。
3. 在 **概况与充值** 查看余额、用量并发起充值。
4. 切换到 **订阅**、**模型广场** 或 **API Key 管理**，完成套餐购买、模型查看和密钥管理。

没有账号时，可点击面板中的 **注册账号**，或访问 [MetaOntic AI 注册页](https://ai.bileego.com/sign-up?aff=VzYr)。

## 数据与隐私

访问令牌只发送到用户填写的平台地址，并由 DSH Host 保存在当前 profile 的私有文件中，不会返回浏览器或写入日志。完整 API Key 仅在用户主动点击显示时读取，不随列表批量下发。订阅与充值的支付签名参数只用于生成当前支付链接。

## 关键词

DeepSeek Harness 插件、DSH 插件、New API、OpenAI 兼容、模型中转、模型广场、API Key 管理、API Key 分组、订阅管理、充值支付、余额查询、用量查询、MetaOntic。

## English

MetaOntic model relay assistant for DeepSeek Harness. Browse the model plaza, manage API keys with group selection, subscriptions and recharge on New API / OpenAI-compatible gateways.

## 链接

- [GitHub 仓库](https://github.com/wxsimon2022/dsh-metaontic-newapi-lite)
- [Gitee 仓库](https://gitee.com/hackloop/dsh-metaontic-newapi-lite)
- [npm 包](https://www.npmjs.com/package/dsh-metaontic-newapi-lite)
- [MIT License](LICENSE)
