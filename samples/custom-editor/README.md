# Custom Editor

> 演示 `contributes.customEditors` + `window.registerCustomEditorProvider`（只读 `CustomReadonlyEditorProvider`）：声明一个 `*.hexview` 玩具二进制格式，双击文件后工作台开一个 tab，扩展在 `resolveCustomEditor` 里读文件内容、生成 hex dump（偏移 + 十六进制 + ASCII）注入 webview 渲染。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 新建一个扩展名为 `.hexview` 的文件（任意内容，纯文本或二进制均可），双击打开。
2. 打开匹配文件时宿主先派发 `onCustomEditor:custom-editor.hexView` 激活扩展，再回调 provider 的 `resolveCustomEditor`。
3. `resolveCustomEditor` 里用 `Uri.from(document.uri).fsPath` 取路径、`node:fs/promises.readFile` 读字节，生成 hex dump（每行 16 字节：偏移 + hex + ASCII 列）赋给 `webview.html`。
4. webview 渲染出的页面显示文件名与完整 hex dump，ASCII 列保留可打印字符。

## 与 VSCode 原版的差异

对标 vscode-extension-samples 的 `custom-editor-sample`。原版是两个编辑器（`pawDraw` 可写、`catScratch` 只读），本示例只做一个最简只读 hex view。

- **只读边界**：本 API 目前只有 `CustomReadonlyEditorProvider`（`openCustomDocument` + `resolveCustomEditor`），**没有**可写 custom editor（save / backup / edit 都是后续阶段）——原版 `pawDraw` 的 `save` / `saveAs` / `backup` / `revert` / `onDidChange` 在本 API 面完全不可用，故本示例不演示任何写回路径。
- provider 的 `openCustomDocument` 返回的 `CustomDocument` 只需携带 `uri`（需要持有资源时自行扩展并 `dispose()`）；本示例直接 `new` 一个只含 `uri` 的文档对象。
- `webview.options` 先设 `enableScripts`（本示例静态渲染设为 `false`），再赋 `html`；`asWebviewUri` 加载本地资源、`postMessage` 双向通信等 webview 能力见 [webview-panel](../webview-panel/README.md) 与主仓库 `docs/extension-dev/zh-CN/webview-guide.md`。
- 文件读取用 `node:fs/promises`（扩展宿主是普通 Node 进程，无路径策略限制）；`workspace.fs.readFile` 走宿主路径策略（拒敏感目录、禁逃逸工作区根），读工作区外文件时不可用。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
