# Product Icon Theme

> 纯声明式扩展（**无 `main`、无 `src`**）：只在 `package.json` 里声明 `contributes.productIconThemes`——一个把工作台「产品图标」（活动栏、状态栏、视图标题等处的 codicon 字形）错位重映射的主题：`search` 显示 GitHub 猫、`settings-gear` 显示分支图标、`source-control` 显示放大镜。

## 起步

```bash
npm install   # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npx uex dev   # 起 Extension Development Host 并装载本目录（无需 build，本扩展无 JS）
```

## 运行步骤

1. 打开命令面板（`Ctrl+Shift+P`）运行 `Preferences: Product Icon Theme`（命令 id `workbench.action.selectProductIconTheme`），列表里出现 `Product Icon Theme Sample`。
2. 选中后活动栏 / 状态栏 / 视图标题里的 `search` 图标变成 GitHub 猫、`settings-gear` 变成分支、`source-control` 变成放大镜（三个 glyph 互相错位，一眼可辨）。

## 与 VSCode 对应概念的关系

- `contributes.productIconThemes` 与 VSCode 同型但为子集：字段 `id`（必填）/ `label` / `path`；主题文件仅支持 `.json`。
- 主题文件字段：`fonts`（必填，`[{ id, weight?, style?, src: [{ path, format }] }]`，`format` 限 woff/woff2/truetype/opentype/embedded-opentype/svg，`src.path` 相对主题文件目录）+ `iconDefinitions`（`{ [iconId]: { fontCharacter, fontId? } }`，`fontId` 缺省 = 第一个 font）。`fonts` 不能为空——这是与文件图标主题的差异，产品图标主题必须自带字体才能覆盖字形。
- `productIconThemes[].id` 即选中该主题时的 settingsId（内部注册 id 会加 `<publisher>.<name>-` 前缀，settingsId 保持原始 `id`）：切换主题即把 `workbench.productIconTheme` 配置写为该 settingsId，本示例为 `product-icon-theme-sample`。
- 生成 CSS 注入 `style.contributedProductIconTheme`，规则形如 `.codicon-<id>:before { content: '<fontCharacter>'; font-family: 'pi-<fontId>' }`；字体资源经 `universe-app://root/_resource_/...` 协议加载。
- 切换入口：设置项 `workbench.productIconTheme`（默认 `Default`）或命令 `workbench.action.selectProductIconTheme`。

## 字体来源与许可

`themes/codicon.ttf` 拷贝自 [`@vscode/codicons`](https://github.com/microsoft/vscode-codicons)（版本 0.0.45，fontVersion 1.15），字体以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。`iconDefinitions` 里的 `fontCharacter` 取自该字体的字符映射（`search=U+EA6D`、`settings-gear=U+EB51`、`source-control=U+EA68`），本示例刻意错位赋值以让视觉效果可辨。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- 主题字段与行为见主仓库 `docs/extension-dev/zh-CN/contribution-points.md` 的 `productIconThemes` 节。
