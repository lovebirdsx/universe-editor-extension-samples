# CodeLens

> 演示 `languages.registerCodeLensProvider` 的两段式：`provideCodeLenses` 对每个以 `TODO:` 开头的行返回一个不带 command 的 lens，编辑器只对实际显示的行调用 `resolveCodeLens` 惰性填入 command；点击后执行扩展自己的命令并把结果写进 OutputChannel。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开任意 `.txt` 文件（扩展经 `onLanguage:plaintext` 激活），写一行以 `TODO:` 开头的内容。
2. 该行上方出现 CodeLens `Show TODO`。
3. 点击 CodeLens，执行命令 `codelens.showMessage`（命令面板里也可搜 `CodeLens: Show Message`），往 Output 面板的 `CodeLens Sample` 通道打印 `CodeLens action on line <行号>`。

## 与 VSCode 原版的差异

- `CodeLens` / `CodeLensProvider` 类型是 **LSP 风格**（从 `vscode-languageserver-types` re-export）：`CodeLens` 只有 `{ range, command?, data? }`，`range` 是 0-based LSP `Range`（`{start:{line,character}, end:{...}}`），不是 `new vscode.CodeLens(range)`。
- lens 的 command 是 **LSP `Command`** `{ title, command, arguments? }`（`command` 字段是命令 id），不是 VSCode 的 `vscode.Command`（VSCode 里命令 id 字段也叫 `command`，这里同形）。
- `provideCodeLenses(document)` 无 token 参数（原版 `_token` 省略）；`resolveCodeLens(codeLens)` 无 token、返回 `ProviderResult<CodeLens>`，直接用对象展开 `{ ...codeLens, command }` 返回。
- 原版 codelens-sample 用 `vscode.workspace.onDidChangeConfiguration` + `EventEmitter` 触发 `onDidChangeCodeLenses` 重取；本示例保持最小，未演示该刷新事件（`onDidChangeCodeLenses` 字段仍可用，返回一个 `Event<void>` 即可）。
- 原版用 `vscode.CompletionItemKind`/`DocumentSymbol` 等类的 `positionAt`/`lineAt` 计算 range；本示例的 `TextDocument` 更薄（只有 `uri/languageId/version/isUntitled/getText()`），所以用 `getText().split('\n')` 自算行号（0-based）。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
