# L10n

演示 manifest 本地化（`%key%` + `package.nls.json`）：`displayName` / `description` / 命令 `title` 全部用 `%key%` 占位，扩展主机扫描时按显示语言替换，运行时经 `extensions.getExtension(...).packageJSON` 读回已本地化的清单。

- 语言文件：`package.nls.json`（默认英语，必须存在）+ `package.nls.zh-cn.json`（按 locale 覆盖，缺 key 回退英语）
- 命令：`l10n.showLocalizedManifest`（Command Palette 里搜 `L10n: Show Localized Manifest`）
- OutputChannel：`L10n Sample`（运行命令后写入已本地化的 `displayName` / `description` / 命令 `title`）

## Develop

```bash
npm install                 # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch               # bundle src/ → dist/，改动即重编
npx uex dev --inspect=9229  # 起 Extension Development Host 并装载本目录
```

## Package

```bash
npm run package             # → universe-samples.l10n-0.0.1.vsix（会先跑 universe:prepublish）
```

> 语言文件必须列入 `package.json` 的 `files` 白名单，否则打包 `.vsix` 时会丢失，安装后占位符退化为字面 `%key%`。

## 与 VSCode 原版差异 / 降级说明

对标 vscode-extension-samples 的 `l10n-sample`。原版覆盖运行时 `vscode.l10n.t()`（bundled/nls 两种布局）+ manifest `%key%`；本示例只演示 manifest 静态替换——Universe 无运行时 `t()` / l10n API。

- manifest `%key%` 替换对齐：占位符须整串匹配 `^%([\w.-]+)%$`，对整个 manifest 所有字符串值深度替换（displayName / description / commands[].title / configuration 标题描述等均可）。
- locale 来源：编辑器显示语言经 `UNIVERSE_DISPLAY_LOCALE` 写入扩展主机；`package.nls.<locale 小写>.json` 覆盖默认，缺 key 回退英语，缺 key 时保留字面 `%key%`。

## e2e

```bash
# 仓库根；编辑器定位见根 README「运行 e2e 的前置要求」（Windows 安装版零配置，否则设 UNIVERSE_EDITOR_BIN）
npm run e2e -- samples/l10n
```

spec 经 `makeSampleTest('l10n')` 冷启动编辑器并只装载本 sample，断言命令已注册、执行后 OutputChannel 里出现英语 bundle 替换后的 `displayName` / `description` / 命令 `title`（且不含字面 `%`）。

## 关联

能力对照表见仓库根 [README](../../README.md)「与官方 vscode-extension-samples 的能力对照」。
