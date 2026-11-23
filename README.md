# MetaOntic AI 管理工具

`dsh-metaontic-ai-tool` 是 DeepSeek Harness（DSH）的 MetaOntic AI 管理插件。使用
访问令牌登录后，可在 DSH 侧边栏查看账户、管理 API Key、购买订阅并发起充值。

默认平台为 `https://ai.bileego.com/`，也支持兼容 New API 接口的自建平台。

## 主要能力

- **平台与账户**：查看平台名称、版本、账户分组、状态和用户信息。
- **额度与用量**：查看剩余额度、已用额度和请求次数。
- **API Key**：独立页面查看列表，新建、启用、禁用或删除密钥，按需查看完整密钥。
- **订阅**：查看当前套餐、到期时间与剩余额度，选择套餐和支付方式生成订阅支付链接。
- **充值**：在账户概览页选择金额和支付方式，由平台生成支付链接并前往支付。
- **注册入口**：没有访问令牌时，可直接前往 MetaOntic AI 注册账号。

插件不提供模型推理；订阅开通与充值到账由 MetaOntic AI 平台处理。

## 安装

在 DSH 插件市场搜索 `MetaOntic AI` 或 `dsh-metaontic-ai-tool`，安装后重启 Harness。

也可以使用命令行安装：

```bash
dsh plugin --profile desktop add dsh-metaontic-ai-tool
```

## 使用

1. 打开 DSH 左侧栏唯一的 **MetaOntic AI** 面板。
2. 确认平台地址，填写 MetaOntic AI 访问令牌并登录。
3. 在 **账户概览** 查看平台、余额与用量。
4. 在 **概况与充值** 页直接发起充值；或切换到 **订阅** 选择套餐、切换到 **API Key 管理** 创建应用密钥。

还没有账号时，可点击面板中的 **注册账号**，或访问
[MetaOntic AI 注册页](https://ai.bileego.com/sign-up?aff=VzYr)。

## 数据与隐私

访问令牌只发送到用户填写的平台地址，并由 DSH Host 保存在当前 profile 的私有文件
中，不会返回浏览器或写入日志。完整 API Key 仅在用户主动点击显示时读取，不随列表
批量下发。订阅与充值的支付签名参数只用于生成当前支付链接，不单独下发访问令牌。

## 链接

- [源码仓库](https://github.com/wxsimon2022/dsh-metaontic-ai-tool)
- [npm 包](https://www.npmjs.com/package/dsh-metaontic-ai-tool)
- [MIT License](LICENSE)
