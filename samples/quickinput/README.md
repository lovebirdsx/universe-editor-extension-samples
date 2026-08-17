# Quick Input

> 演示 `window.showQuickPick`（带 `description` / `detail` 的 `QuickPickItem` 列表）与 `window.showInputBox` 串成两步输入流，最终把结果写进 OutputChannel。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 命令面板（Ctrl+Shift+P）搜索并运行 `Quick Input: Run`（命令 id `quickinput.run`）。
2. 第一步弹出 Quick Pick，用方向键或鼠标选一项（Alpha / Beta / Gamma）。
3. 第二步弹出 Input Box，填一个名字后回车。
4. Output 面板的 `Quick Input` 通道打印一行 `picked=<label> name=<name>`。

## 与 VSCode 原版的差异

- 本项目**没有** `window.createQuickPick` / `window.createInputBox`（无多步可复用的交互式 QuickPick / InputBox 对象），只能把一次性的 `showQuickPick` / `showInputBox` 串接起来。原版 quickinput-sample 的 `multiStepInput` / `quickOpen` 都建立在 `createQuickPick` 之上，无法照搬。
- `showQuickPick` 的 `QuickPickItem` 仅支持 `label` / `description` / `detail` / `iconId`，没有 `canPickMany`、item 按钮等复杂管道。
- `showInputBox` 仅支持 `placeHolder` / `prompt` / `value`，**没有 `validateInput` / `password`**——原版示例里输入框的实时校验在本项目 API 面不可用。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
