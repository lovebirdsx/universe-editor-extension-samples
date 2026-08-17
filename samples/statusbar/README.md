# Status Bar

演示 `window.createStatusBarItem` 的 alignment/priority、条目的 `text` 更新与 `show()`/`dispose()` 生命周期：一条命令在状态栏右侧挂一个条目，每次执行更新其文本计数。

## 起步

```bash
npm install                 # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch               # bundle src/ → dist/，改动即重编
npx uex dev --inspect=9229  # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开命令面板（`Ctrl+Shift+P`），运行 `Status Bar: Toggle Item`（命令 id `statusbar.toggle`）。
2. 状态栏右侧出现 `$(megaphone) Toggled 1 time(s)`，再运行一次变成 `2 time(s)`，依此类推。
3. 条目生命周期：首次执行 `createStatusBarItem(StatusBarAlignment.Right, 100)` 创建，之后每次只改 `text` 再 `show()`；停用扩展时 `deactivate` 里 `dispose()` 移除。

## 与 VSCode 原版差异 / 降级说明

对标 vscode-extension-samples 的 `statusbar-sample`。原版通过 `onDidChangeActiveTextEditor` / `onDidChangeTextEditorSelection` 实时展示选中行数、点击条目弹消息；本示例改为命令驱动的简单计数，聚焦演示 `createStatusBarItem` 与条目生命周期本身。

- `createStatusBarItem` 对齐：`alignment`/`priority`/`text`/`tooltip`/`command`/`show()`/`hide()`/`dispose()` 语义一致，另多出 Universe 扩展字段 `showProgress`；**无** VSCode 的 `name`/`color` 字段。
- 本示例未用到的 `onDidChangeActiveTextEditor` / `onDidChangeTextEditorSelection` 在 Universe 里同样可用（逐项差异见主仓库 `docs/extension-dev/zh-CN/migration-from-vscode.md`）。

## 关联

能力对照表见仓库根 [README](../../README.md)「与官方 vscode-extension-samples 的能力对照」。
