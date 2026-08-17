# MCP Server

> 演示声明式 `contributes.mcpServers`（stdio）：扩展自带一个只依赖 Node 内置模块的最小 MCP stdio server 脚本（`server/index.mjs`，实现 `initialize` + `tools/list` + `tools/call`，提供 `echo` / `add` 两个玩具工具）；manifest 里 `command` 用 `${execPath}`、args 指向 `${extensionPath}/server/index.mjs`，声明后即可被注入 AI Agent 会话，无需任何扩展代码。

- server 名：`sample-tools`（会话里看到的 MCP server id）
- 工具：`echo`（回显文本）、`add`（两数相加）

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 直接跑脚本自测（与编辑器无关，纯 node）：`node server/index.mjs`，逐行输入 JSON-RPC 的 `initialize` / `tools/list` / `tools/call` 请求，观察 stdout 的 JSON 响应。
2. 在编辑器里装好本扩展后，新建 AI Agent 会话：`sample-tools` 作为最低优先级 MCP server 被注入，`echo` / `add` 两个工具对会话可见。
3. 用户在 settings.json 里写同名 `sample-tools` 会覆盖扩展贡献；卸载/禁用扩展后注入立即消失。

## 与 VSCode 对应概念的关系

- 本能力为 **universe-editor 特有**：VSCode 没有声明式 `contributes.mcpServers` 贡献点（VSCode 的 MCP 支持走配置/内置机制，形态不同）。这是本项目把 MCP server 作为扩展一等能力注入 AI Agent 会话的方式。
- `${execPath}` 解析为编辑器自带的可执行文件（`ELECTRON_RUN_AS_NODE` 语义跑脚本），`${extensionPath}` 解析为扩展根绝对路径——用户机器上无需装 Node；解析结果并入 `acp.mcpServers` 设置合并管线（最低优先级），不落盘。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- mcpServers 贡献点的字段与行为见主仓库 `docs/extension-dev/zh-CN/contribution-points.md` 的 `mcpServers` 节。
