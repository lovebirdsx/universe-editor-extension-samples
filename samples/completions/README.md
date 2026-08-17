# Completions

> 演示 `languages.registerCompletionItemProvider`：对纯文本文档返回一组普通补全候选（带 `kind` / `detail` / `documentation`），并注册触发字符 `@`，在 `@` 之后的位置返回另一组特殊的包名候选。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开任意 `.txt` 文件（扩展经 `onLanguage:plaintext` 激活）。
2. 光标停在普通文本处按 `Ctrl+Space`（或输入任意字符触发补全），出现 `universe-editor` / `universe-editor-core` / `universe-editor-extension` 三条候选。
3. 输入 `@`，触发字符补全出现 `@universe-editor/extension-api` / `@universe-editor/platform` / `@universe-editor/workbench-ui` 三条候选。

## 与 VSCode 原版的差异

- provider 签名为 `provideCompletionItems(document, position, context)`，`context` 是 LSP 风格（`triggerKind: 1|2|3` + 可选 `triggerCharacter`），不是 VSCode 的 `CompletionContext` 类；`position` 是 LSP `Position`（**0-based** `{line, character}`）。
- `CompletionItem` 是 **LSP 类型**（从 `vscode-languageserver-types` re-export），不是 `vscode.CompletionItem` 类：用**字面量**构造，`kind` 是**数字枚举**（`CompletionItemKind` 只 re-export 类型、没有值导出，本示例用 `KIND` 常量表写出 `Class=7 / Field=5 / Module=9 / Keyword=14`），`documentation` 是 `string | MarkupContent`（不能写 `new vscode.MarkdownString`）。
- `registerCompletionItemProvider(selector, provider, ...triggerCharacters)` 可变参触发字符与 VSCode 一致；`DocumentSelector` 简化为语言 id 字符串（无 `{language, scheme, pattern}` 对象形）。
- 没有 `new vscode.CompletionItem(...)` / `SnippetString` / `commitCharacters` / `command` 等 VSCode 富能力；需要的话直接写 LSP 字段（`insertText` / `sortText` / `filterText` / `textEdit` / `additionalTextEdits` / `command`）。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
