# Diagnostic Related Information

> 演示诊断相关位置信息：监听文档打开 / 变更，扫描同一文件里重复出现的 `duplicate_id`，对第二处推一条 Warning 诊断，并用 `Diagnostic.relatedInformation` 指向第一处（"first declared here"）。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开一个 `.txt` 文件（`onLanguage:plaintext` 激活本扩展）。
2. 写入两处 `duplicate_id`，第二处会出现黄色波浪线；悬停或查看问题时，会看到指向第一处的 "first declared here"。

## 与 VSCode 原版的差异

- `createDiagnosticCollection` 对齐（`set` / `delete` / `clear` / `dispose`；`set(uri, undefined)` 清空该文件），但 `Diagnostic` 是 **LSP 类型**：`severity` 用 LSP `DiagnosticSeverity` 数值（1 Error / 2 Warning / 3 Info / 4 Hint），不是 VSCode 的枚举常量。
- `Diagnostic.relatedInformation` 是 LSP `DiagnosticRelatedInformation[]`（`{ location: { uri, range }, message }`），其中 `location.uri` 是**字符串**；而 `TextDocument.uri` 是平面 `UriComponents` 对象，需 `Uri.from(document.uri).toString()` 转成字符串再填。
- `workspace.onDidOpenTextDocument` / `onDidChangeTextDocument` 对齐；原版 diagnostic-related-information-sample 还依赖 `path.basename(document.uri.fsPath)` 按文件名过滤，本项目因 `TextDocument` 更薄（无 `fileName` / `fsPath`）改为按 `languageId` 过滤。
- 反向读回 `languages.getDiagnostics()` 返回 **Promise** 且非 live 视图，读回不含 `relatedInformation`。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- 诊断推送模型见主仓库 `docs/extension-dev/zh-CN/language-guide.md`（「诊断」节）。
