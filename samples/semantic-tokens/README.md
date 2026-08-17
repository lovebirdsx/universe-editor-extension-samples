# Semantic Tokens

> 演示语义着色：注册一个 `DocumentSemanticTokensProvider`，把文档里的全大写词（如 `CONSTANT`）标成 `keyword`，把 `fn <name>` 里的 `<name>` 标成 `function`（带 `declaration` 修饰）。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开一个 `.txt` 文件（`onLanguage:plaintext` 激活本扩展）。
2. 写入 `fn greet` 与 `CONSTANT VALUE` 这类文本，`greet` / `CONSTANT` / `VALUE` 会被语义着色（具体颜色取决于当前主题对 `function` / `keyword` token 的映射）。

## 与 VSCode 原版的差异

- `registerDocumentSemanticTokensProvider(selector, provider)`：**legend 是 provider 的字段**（`provider.legend`），注册时同步返回给编辑器；不是 VSCode 的第三个参数，也没有 `SemanticTokensLegend` 类。
- 仅支持**全量文档** provider：`provideDocumentSemanticTokens(document)` 只有 `document` 一个参数（无 `CancellationToken`）；无 range / delta provider，无 `onDidChangeSemanticTokens`。
- 返回的 `SemanticTokens` 是 **LSP 类型**（`{ data: number[] }`），`data` 是 5 元组 `[deltaLine, deltaStartChar, length, tokenType, tokenModifiers]` 的扁平编码；本项目没有 `SemanticTokensBuilder`，故本示例自己按行/列排序后手写 delta 编码。
- 原版 semantic-tokens-sample 用 `{ language: 'semanticLanguage' }` 选择器 + `SemanticTokensBuilder`；本项目 `DocumentSelector` 简化为语言 id 字符串（`'plaintext'`）。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- 语义 token 编码与 provider 模型见主仓库 `docs/extension-dev/zh-CN/language-guide.md`。
