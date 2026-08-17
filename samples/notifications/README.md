# Notifications

演示 `window.showInformationMessage` / `showWarningMessage` / `showErrorMessage`：一条命令同时弹出三档通知，另一条命令弹带按钮的消息并把所选按钮写进 OutputChannel。

- 命令：`notifications.showAll`（`Notifications: Show All`）、`notifications.showWithActions`（`Notifications: Show With Actions`）
- OutputChannel：`Notifications`

## 起步

```bash
npm install                 # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch               # bundle src/ → dist/，改动即重编
npx uex dev --inspect=9229  # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 命令面板运行 `Notifications: Show All`，同时弹出信息/警告/错误三条通知。
2. 命令面板运行 `Notifications: Show With Actions`，在弹出的对话框点 `Confirm`，Output 面板的 `Notifications` 通道追加 `chose Confirm`；点 `Cancel` 或按 Esc 则追加 `dismissed`。

## 与 VSCode 原版差异 / 降级说明

对标 vscode-extension-samples 的 `notifications-sample`。API 表面（`showInformationMessage` / `showWarningMessage` / `showErrorMessage` + 可变 `items` 按钮）与 resolve 语义（点中的按钮作为返回值，未点返回 `undefined`）一致。

- **无按钮的消息**（如 `showInformationMessage('msg')`）以通知 toast 呈现，与 VSCode 一致。
- **带按钮的消息**在 Universe 里渲染为**模态确认对话框**（`role=dialog`），而不是 VSCode 的非模态通知动作按钮——这是宿主当前实现的行为差异，resolve 语义不变。
- 无 VSCode 的 `modal` 选项（Universe 里按钮消息本就模态）与 `MessageItem` 对象（只支持 `...items: string[]`）。
- 原版还有进度通知（`withProgress` + `ProgressLocation.Notification`），本仓库拆到 [progress](../progress) 示例单独演示。

## 关联

能力对照表见仓库根 [README](../../README.md)「与官方 vscode-extension-samples 的能力对照」。
