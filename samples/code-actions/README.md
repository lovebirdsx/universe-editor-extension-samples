# Code Actions

> 演示诊断 + quickfix 的闭环：`languages.createDiagnosticCollection` 对含坏词 `foo_bad` 的文档推 Warning 诊断，`languages.registerCodeActionsProvider` 在坏词范围内提供「替换为 `foo_good`」的 edit 型 quickfix；监听 `onDidOpen/onDidChangeTextDocument` 刷新诊断，`onDidCloseTextDocument` 清掉该文件诊断。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开任意 `.txt` 文件（扩展经 `onLanguage:plaintext` 激活），输入含 `foo_bad` 的文本。
2. `foo_bad` 出现黄色波浪线（Warning 诊断，owner 为 `code-actions-sample`）。
3. 把光标放到 `foo_bad` 上（或点灯泡），出现 quickfix `Replace 'foo_bad' with 'foo_good'`；选中后坏词被替换为 `foo_good`，诊断随之消失。

## 与 VSCode 原版的差异

- `Diagnostic` / `Range` / `Position` / `TextEdit` / `WorkspaceEdit` / `CodeAction` 都是 **LSP 类型**（从 `vscode-languageserver-types` re-export），用**字面量**构造：`range` 是 0-based `{start:{line,character}, end:{...}}`，`severity` 是**数字枚举**（`1=Error 2=Warning 3=Information 4=Hint`，本示例用 `2`），不是 `new vscode.Range(...)` / `vscode.DiagnosticSeverity.Warning`。
- `CodeActionContext` 只有 `{ only?: string[] }`（LSP 风格），**没有** `context.diagnostics`——因此原版 code-actions-sample 里「按 `diagnostic.code` 过滤」的写法不可用；本示例改为直接扫描文档文本、用 range 重叠判断命中，不依赖诊断上下文。
- code action 的 edit 走 `edit.changes`（`{ [uri]: TextEdit[] }`）形式，`kind: 'quickfix'`；不要用 command 路由做 quickfix（renderer 只把 `edit` 转成 Monaco 编辑，不转 command）。
- `DiagnosticCollection.set` 是**整组替换**语义，`set(uri, undefined)` 或 `delete(uri)` 清单个文件；`document.uri` 是平面对象 `UriComponents`，要用 `Uri.from(document.uri).toString()` 得到 `WorkspaceEdit.changes` 的 URI 键。
- 刷新诊断的入口是 `workspace.onDidOpenTextDocument` / `onDidChangeTextDocument` / `onDidCloseTextDocument`（对齐），但 `window.activeTextEditor` 是异步 `getActiveTextEditor()` 快照，本示例改为遍历 `workspace.textDocuments` 兜底已打开文档。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
