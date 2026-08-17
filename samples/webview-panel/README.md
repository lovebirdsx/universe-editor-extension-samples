# Webview Panel

> 演示 `window.createWebviewPanel` 的完整生命周期：扩展主动创建并持有一个不绑定文件的 webview tab，`webview.html` 里声明 CSP（用 `webview.cspSource`）、`asWebviewUri` 加载本地 `media/` 资源，`postMessage` / `onDidReceiveMessage` 双向通信（页面按钮回发消息 → 扩展写 OutputChannel；命令推数据 → 页面更新计数）。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 命令面板运行 `Webview Panel: Show Panel`（命令 id `webview-panel.show`），扩展经 `onCommand` 激活并在当前活动编辑器组打开一个 `Webview Panel` tab。
2. tab 里渲染出的页面：标题 + 一个计数 `<span>` + `Notify Extension` 按钮，样式与脚本分别经 `asWebviewUri` 从 `media/main.css` / `media/main.js` 加载。
3. 点击 `Notify Extension`：页面经 `acquireVsCodeApi().postMessage` 回发消息，扩展 `webview.onDidReceiveMessage` 收到后往 Output 面板的 `Webview Panel` 通道打印 `Received notify from webview`。
4. 命令面板运行 `Webview Panel: Send Message`（命令 id `webview-panel.sendMessage`）：扩展 `postMessage({ type: 'update', count })` 推数据，页面 `window.addEventListener('message', ...)` 收到后更新计数。

## 与 VSCode 原版的差异

对标 vscode-extension-samples 的 `webview-sample`（cat coding）。本示例把原版的「面板序列化 + 按 ViewColumn 换猫图」收缩成双向消息的最小演示（无 `WebviewPanelSerializer`，见下）。

- **无 `ViewColumn` 参数**：`createWebviewPanel(viewType, title, showOptions?, options?)` 的第三个参是 `{ preserveFocus?: boolean }`，tab 开在当前活动编辑器组（原版的 `ViewColumn.One/Two/Three` 不可用）。
- **无 `retainContextWhenHidden`**：iframe 在 tab 隐藏期间从不重建，状态天然保留。
- **无 `WebviewPanelSerializer`**：窗口 reload / 重启后 tab 不恢复，扩展重新激活后自行重建即可。
- `webview` 表面（`html` / `options` / `cspSource` / `asWebviewUri` / 双向消息）与自定义编辑器拿到的是同一类型；`title` 可写、`reveal()` / `dispose()` / `onDidDispose` 对齐。
- 消息桥：页面侧用 `acquireVsCodeApi()`（宿主同时注入别名 `acquireUniverseApi()`）；桥上的 `getState` / `setState` 是占位实现（`getState` 恒返回 `undefined`），webview 状态持久化未落地。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
