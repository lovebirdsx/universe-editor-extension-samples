# Progress

演示 `window.withProgress` 的 `ProgressLocation.Notification` + `report({ increment, message })` + 取消：命令 A 启动一个分步长任务并在完成时写 `done`，命令 B 通过扩展持有的 `CancellationTokenSource` 取消进行中的任务并在取消路径写 `cancelled`。

- 命令：`progress.startTask`（`Progress: Start Task`）、`progress.cancelTask`（`Progress: Cancel Task`）
- OutputChannel：`Progress`

## 起步

```bash
npm install                 # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch               # bundle src/ → dist/，改动即重编
npx uex dev --inspect=9229  # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 命令面板运行 `Progress: Start Task`，通知区出现带百分比条与取消按钮的进度条目，约 1.5 秒后完成，`Progress` 通道追加 `started`、`done`。
2. 再运行一次 `Progress: Start Task`，趁它进行中运行 `Progress: Cancel Task`，任务中止，`Progress` 通道追加 `cancelled`（而非 `done`）。
3. 也可以点进度通知上的取消按钮——宿主翻转 `withProgress` 传入的 token，扩展把它转发到同一个取消源。

## 与 VSCode 原版差异 / 降级说明

对标 vscode-extension-samples 的 `progress-sample`。`withProgress` 的调用形状（`options` + `task(progress, token)`）与 `cancellable` 取消语义对齐。

- `ProgressLocation` 仅 `Window` / `Notification` / `SourceControl` 三档（`SourceControl` 当前按 `Window` 渲染），无 VSCode 其余位置。
- `progress.report` 载荷仅 `{ message, increment }`，无 `total` 等字段。
- 原版只演示 `token.onCancellationRequested`（点通知取消按钮）；本示例额外演示扩展自建 `CancellationTokenSource` 的程序化取消路径——两个 token 通过 `token.onCancellationRequested(() => source.cancel())` 合并，一条循环统一判断 `source.token.isCancellationRequested`。

## 关联

能力对照表见仓库根 [README](../../README.md)「与官方 vscode-extension-samples 的能力对照」。
