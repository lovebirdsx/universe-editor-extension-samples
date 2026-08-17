# Decorator

> 演示文本编辑器装饰：命令扫描活动文档，把包含 `HIGHLIGHT` 的每一行整行打上背景色装饰；再次执行同一命令清除装饰。

- 命令：`decorator.toggleHighlight`（命令面板搜 `Decorator: Toggle Highlight`）

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开一个 `.txt` 文件，写入至少一行含 `HIGHLIGHT` 的文本。
2. 命令面板运行 `Decorator: Toggle Highlight`，所有命中行整行染上黄色背景。
3. 再次运行同一条命令，装饰被清除（`setDecorations` 传空数组）。

## 与 VSCode 原版的差异

- `window.createTextEditorDecorationType` 的装饰选项是**子集**：只有 `gutterIconPath`（data-URI）/ `isWholeLine` / `backgroundColor` / `borderColor` / `borderWidth` / `overviewRulerColor` / `overviewRulerLane`，**没有** `light`/`dark` 主题分支、`cursor`、`borderStyle` 等；本示例只用 `isWholeLine` + `backgroundColor` 两个子集内字段。
- `TextEditor.setDecorations(type, ranges)` 的第二参是 **LSP `Range[]`**（0-based），不是 VSCode 的 `DecorationOptions[]`——不能带 `hoverMessage`。
- `window.activeTextEditor`（同步属性）→ `window.getActiveTextEditor()`（**异步方法**，返回快照句柄）。
- 原版 decorator-sample 是自动装饰（监听 `onDidChangeActiveTextEditor` / `onDidChangeTextDocument` 实时刷新）；本示例改成**命令驱动**的开关（`onCommand:` 激活），更贴近 Universe 命令式的最小形态。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- 装饰选项的完整说明见主仓库 `docs/extension-dev/zh-CN/migration-from-vscode.md`（window 装饰行）。
