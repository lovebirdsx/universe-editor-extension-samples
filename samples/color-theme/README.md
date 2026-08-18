# Color Theme

> 纯声明式扩展（**无 `main`、无 `src`**）：只在 `package.json` 里声明 `contributes.themes`——一个把编辑器 / 侧栏染成显眼 `#102030`、状态栏染成 `#1f3a5f` 的暗色主题，并给 keyword / string / comment 三类 token 上色。

## 起步

```bash
npm install   # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npx uex dev   # 起 Extension Development Host 并装载本目录（无需 build，本扩展无 JS）
```

## 运行步骤

1. 打开命令面板（`Ctrl+Shift+P`）运行 `Preferences: Color Theme`（命令 id `workbench.action.selectTheme`，快捷键 `Ctrl+K Ctrl+T`），列表里出现 `Color Theme Sample Dark`。
2. 选中后编辑器背景与侧栏背景变成 `#102030`，状态栏变成 `#1f3a5f`。
3. 打开一个源码文件：`keyword` 加粗蓝色、`string` 橙红、`comment` 斜体绿色（需该语言注册了对应 token scope）。

## 与 VSCode 对应概念的关系

- `contributes.themes` 与 VSCode 同型但为子集：字段形状对齐（`id` / `label` / `description` / `uiTheme` / `path`），`uiTheme` 取值 `vs | vs-dark | hc-black | hc-light`；主题文件仅支持 `.json`（不支持 `.tmTheme`）。
- 主题文件字段：`colors`（colorId → CSS 色值）、`tokenColors`（`name` / `scope` / `settings.foreground` / `settings.fontStyle` 等）、可选 `include` 继承与 `semanticTokenColors` / `semanticHighlighting`。
- `themes[].id` 即选中该主题时的 settingsId（缺省回退为 `label`）：切换主题即把 `workbench.colorTheme` 配置写为该 settingsId，本示例为 `color-theme-sample-dark`。
- 切换入口：设置项 `workbench.colorTheme`（值为 settingsId）或命令 `workbench.action.selectTheme`（弹 quick pick，导航即预览、Enter 接受、Escape 回滚）。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- 主题字段与行为见主仓库 `docs/extension-dev/zh-CN/contribution-points.md` 的 `themes` 节。
