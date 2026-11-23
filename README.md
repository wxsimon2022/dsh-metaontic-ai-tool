# dsh-metaontic-ai-tool

MetaOntic AI 管理工具的 dsh 插件。MetaOntic AI 以开源 New API 为底层平台，
当前提供访问令牌登录、平台状态与账户信息查询，默认平台地址为
`https://ai.bileego.com/`。

## 功能

- 用户在左侧栏面板填写访问令牌后登录，不要求用户名或密码。
- 查询 New API 的 `/api/status` 与 `/api/user/self`。
- 展示平台名称、版本、服务地址、账户分组、可用余额、已用额度和请求次数。
- 登录成功后由 Host 把平台地址与访问令牌保存到本机 profile，下次自动恢复登录。

## 结构

```text
.
├── index.js            # Host 入口与平台查询接口
├── client.js           # 左侧栏登录与查询界面
├── cordis.patch.yml    # 插件挂载条目
├── locale/             # 插件元信息（中文 / English）
├── icon.svg            # 插件图标
└── tests/              # node:test 离线测试
```

## 开发与验证

```bash
npm run check     # 检查 Host、Client 与测试文件语法
npm test          # 运行离线接口契约测试
npm pack          # 生成安装包
```

安装本地包：

```bash
dsh plugin --profile desktop add ./dsh-metaontic-ai-tool-0.1.0.tgz
```

重启 Harness 后，点击左侧栏的 **MetaOntic AI**，确认平台地址并填入访问令牌。
令牌可在 MetaOntic AI 控制台的个人安全设置中创建。

## 查询方式

浏览器界面把令牌提交到 `POST /api/dsh-metaontic-ai-tool.query`，Host 验证成功
后以 `Authorization: Bearer <access-token>` 查询平台并保存登录信息。下次打开
面板时通过 `GET /api/dsh-metaontic-ai-tool.session` 恢复；退出登录通过
`DELETE` 同一路径清除。保存的令牌不会返回浏览器。

登录文件位于当前 profile 的 `.dsh-metaontic-ai-tool/login.json`，目录权限为
`0700`、文件权限为 `0600`，仅当前系统用户可读。所有上游请求禁止重定向并设置
超时；返回账户字段经过白名单过滤，不会把上游令牌、邮箱或其他未使用字段带到界面。
