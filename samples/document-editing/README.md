# Document Editing

> 演示读写活动编辑器文档：命令 A 在光标处插入一行文本（经 `TextEditor.edit` + `TextEditorEdit.insert`），命令 B 统计当前文档行数 / 字符数并弹信息提示、写 OutputChannel。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开任意文本文件，把光标放到想插入的位置。
2. 命令面板搜索并运行 `Document Editing: Insert Line`（命令 id `document-editing.insertLine`），在光标处插入一行。
3. 命令面板运行 `Document Editing: Count`（命令 id `document-editing.count`），弹信息提示并往 Output 面板的 `Document Editing` 通道打印 `lines: N, chars: M`。

## 与 VSCode 原版的差异

- `window.activeTextEditor`（同步属性）→ `window.getActiveTextEditor()`（**异步方法**，返回快照句柄，外部变化后需重新获取）。
- `TextDocument` 更薄：只有 `uri` / `languageId` / `version` / `isUntitled` / `getText()`，**没有 `lineAt` / `offsetAt` / `lineCount` / `fileName` / `isDirty` / `save()`**——本示例的「行数 / 字符数」因此用 `getText().split('\n')` 与 `getText().length` 自己算，而不是 `document.lineCount`。
- `TextEditorEdit` 只有 `insert` / `replace` / `delete`，坐标一律 LSP 风格（0-based）；原版 document-editing-sample 的 `editor.edit(editBuilder => editBuilder.replace(...))` 中的 `replace` 在本项目同样可用。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
