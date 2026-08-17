# Declarative Features

> 纯声明式扩展合集（**无 `main`、无 `src`**）：只在 `package.json` 里声明三件套——`contributes.jsonValidation`（为 `*.sample-config.json` 配本地 schema）、`contributes.grammars`（为自定义语言 `sample-log` 提供一个高亮 ERROR/WARN/INFO 行的 tmLanguage）、`contributes.iconThemes`（一个把 `.slog` 关联到图标的极简文件图标主题）。

## 起步

```bash
npm install   # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npx uex dev   # 起 Extension Development Host 并装载本目录（无需 build，本扩展无 JS）
```

## 运行步骤

1. 新建 `foo.sample-config.json`，写成 `{ "version": "abc" }`：缺必填 `name`、`version` 非数字，出现 schema 校验波浪线。
2. 新建 `foo.slog`，写入以 `ERROR` / `WARN` / `INFO` 开头的行；用「更改语言模式」把该文件切到 `sample-log`，三行分别按 error / string / comment 高亮。
3. 文件图标主题选择器里出现 `Sample Log Icons`，选中后资源管理器里 `.slog` 文件使用自定义图标。

## 与 VSCode 对应概念的关系

- 三件套与 VSCode 的 `contributes.jsonValidation` / `contributes.grammars` / `contributes.iconThemes` **同型但为子集**：字段形状对齐，行为裁剪（如 grammars 只支持 `language`/`scopeName`/`path`/`embeddedLanguages`/`tokenTypes`/`injectTo`/括号 scope 等子集）。
- **grammars 的语言自注册**：本项目**没有** `contributes.languages`，`grammars[].language` 会把语言 id 注册进 Monaco 语言注册表并挂上 tokenization factory（这正是 `sample-log` 能出现在「更改语言模式」列表里的原因）；但文件后缀 → 语言 id 的关联是编辑器硬编码的（`resourceLanguage.ts`），`.slog` 不会自动解析成 `sample-log`，因此需要手动切一次语言模式让 factory 解析。
- `jsonValidation` 的本地 schema 在扫描阶段被宿主读入并注册为 inline schema（Monaco JSON worker 不能自己取文件）；`iconThemes` 注册后的 id 为 `<扩展 id>-<主题 id>`（本例 `universe-samples.declarative-features-sample-log-icons`）。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- 三个贡献点的字段与行为见主仓库 `docs/extension-dev/zh-CN/contribution-points.md` 的 `jsonValidation` / `grammars` / `iconThemes` 节。
