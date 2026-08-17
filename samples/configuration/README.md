# Configuration

> 演示 `contributes.configuration`（`enum` / `boolean` / `default` 属性）配合 `workspace.getConfiguration().get()`、`workspace.onDidChangeConfiguration` 读写配置：命令 A 读取并打印当前值，配置变化时自动写一行日志。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 命令面板搜索并运行 `Configuration: Read`（命令 id `configuration.read`）。
2. Output 面板的 `Configuration` 通道打印 `[read] configuration.greeting = Hello`（默认值）与 `[read] configuration.showCount = true`。
3. 在设置 UI 或 settings.json 里把 `configuration.greeting` 改成 `Hi`，`onDidChangeConfiguration` 会自动打印 `[change] configuration.greeting = Hi`。
4. 再次运行命令 A，打印出新的值。

## 与 VSCode 原版的差异

- `workspace.getConfiguration(...).get()` 返回 **Promise**（配置值在渲染进程），`update(key, value)` 同样异步且**无 target 参数**——本项目只支持单一用户级配置，没有 `ConfigurationTarget`（Global / Workspace / WorkspaceFolder）与 `has` / `inspect`。原版 configuration-sample 演示的 window / resource / language-overridable 三种 `scope` 与多 target 更新在本项目不可用。
- `contributes.configuration` 的属性只支持 `type` / `default` / `description` / `enum` / `minimum` / `maximum`，无 `scope` / `editPresentation` 等字段。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
