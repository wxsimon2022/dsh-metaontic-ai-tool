# dsh-metaontic-ai-tool

MetaOntic AI 是面向多模型聚合管理的平台。本仓库提供其 dsh 插件，基于开源
New API，当前支持访问令牌登录、平台状态与账户信息查询，默认平台地址为
`https://ai.bileego.com/`。

## 功能

- 用户在左侧栏面板填写访问令牌后登录，不要求用户名或密码。
- 未填写访问令牌时显示注册入口，跳转至带邀请码的 MetaOntic AI 注册页。
- 查询 New API 的 `/api/status` 与 `/api/user/self`。
- 展示平台名称、版本、服务地址、账户分组、可用余额、已用额度和请求次数。
- 登录成功后由 Host 把平台地址与访问令牌保存到本机 profile，下次自动恢复登录。

## 结构

```text
.
├── src/
│   ├── index.ts        # Host 入口与平台查询接口
│   ├── client.ts       # 左侧栏登录与查询界面
│   └── types/dsh.d.ts  # DSH 浏览器端最小类型声明
├── dist/               # tsc 生成，随安装包发布
├── cordis.patch.yml    # 插件挂载条目
├── locale/             # 插件元信息（中文 / English）
├── icon.svg            # 插件图标
└── tests/              # node:test 离线测试
```

## 开发与验证

```bash
npm install       # 安装 TypeScript 与 Node 类型
npm run build     # 将 src/*.ts 编译到 dist/
npm run check     # 类型检查并校验测试文件语法
npm test          # 构建后运行离线接口契约测试
npm run pack:check # 检查安装包内容
npm run pack:plugin # 生成不含 README 的插件包到 release/
npm pack          # 自动构建并生成安装包
```

安装本地包：

```bash
dsh plugin --profile desktop add ./release/dsh-metaontic-ai-tool-0.0.3.tgz
```

重启 Harness 后，点击左侧栏的 **MetaOntic AI**，确认平台地址并填入访问令牌。
令牌可在 MetaOntic AI 控制台的个人安全设置中创建。

插件设置页只展示插件信息，不渲染仓库 README；发布包由 `npm run pack:plugin`
生成，并在打包后移除 `README.md`。

## 查询方式

浏览器界面把令牌提交到 `POST /api/dsh-metaontic-ai-tool.query`，Host 验证成功
后以 `Authorization: Bearer <access-token>` 查询平台并保存登录信息。下次打开
面板时通过 `GET /api/dsh-metaontic-ai-tool.session` 恢复；退出登录通过
`DELETE` 同一路径清除。保存的令牌不会返回浏览器。

登录文件位于当前 profile 的 `.dsh-metaontic-ai-tool/login.json`，目录权限为
`0700`、文件权限为 `0600`，仅当前系统用户可读。所有上游请求禁止重定向并设置
超时；返回账户字段经过白名单过滤，不会把上游令牌、邮箱或其他未使用字段带到界面。

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
