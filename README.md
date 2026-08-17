# universe-editor-extension-samples

Universe Editor 扩展示例仓库 —— 与主仓库 `universe-editor` 分离的独立仓库，汇集可直接抄写的第三方扩展示例。每个 sample（`samples/<name>/`）是一个自包含的扩展工程：带 `package.json` / `tsconfig` / `esbuild.config.mjs` / `src/extension.ts` / `README.md` / `icon.png`，并带 e2e 冒烟 spec，借本机可运行的 Universe Editor + `@universe-editor/e2e-harness` 跑端到端验证。

> 本仓库不是 pnpm workspace：sample 依赖经 npm workspaces 由各自 `package.json` 声明并 hoist 到根 `node_modules`；e2e 依赖 `@universe-editor/e2e-harness`（devDep）+ 根 devDep `@playwright/test`（harness 的 peerDep，整棵树必须唯一一份，**绝不出现第二份 playwright**，见 `scripts/e2e/run.mjs`）。

## 运行 e2e 的前置要求

1. `npm install`（装齐 `@universe-editor/e2e-harness` / `@universe-editor/e2e-contract` 与根 devDep `@playwright/test`）。
2. 一个可运行的 Universe Editor：Windows 装了安装版即可零配置（自动探测 `%LOCALAPPDATA%\Programs\Universe Editor\Universe Editor.exe`）；否则设 `UNIVERSE_EDITOR_BIN`（由 harness 的 `resolveEditorLaunchTarget` 读取）指向以下三形态之一：

| 形态                                                            | `UNIVERSE_EDITOR_BIN` | 备注                                                  |
| --------------------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| 打包版可执行文件（NSIS 安装版 / win-unpacked / linux-unpacked） | 可执行文件路径        | 无额外要求                                            |
| dev 产物                                                        | `out/main/index.js`   | 该仓库 node_modules 需有 electron                     |
| dev-bundle                                                      | electron 二进制       | 同时设 `UNIVERSE_EDITOR_MAIN_ENTRY=out/main/index.js` |

```bash
npm run e2e -- samples/helloworld   # 单个 sample（samples/<name>、<name> 均可）
npm run e2e                         # 全量
```

e2e-harness 版本约定：minor 跟随编辑器 minor；升级编辑器时同步升级 harness（探针 API 随编辑器演进）。

## 样本索引

19 个 sample，按「入门 UI / 语言特性 / 视图 / 平台特色」四批组织。

| 目录                                                                     | 核心 API / 贡献点                                                                           | e2e 验证点                                                           | 所属批   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| [helloworld](samples/helloworld)                                         | `commands.registerCommand` + `window.showInformationMessage` + `window.createOutputChannel` | 激活后注册命令并写入输出通道                                         | 入门 UI  |
| [statusbar](samples/statusbar)                                           | `window.createStatusBarItem`                                                                | toggle 命令创建状态栏项并更新文案                                    | 入门 UI  |
| [notifications](samples/notifications)                                   | `window.showInformationMessage / showWarningMessage / showErrorMessage`（含按钮 action）    | 显示 info/warning/error 通知；带按钮通知把点击结果写入输出           | 入门 UI  |
| [progress](samples/progress)                                             | `window.withProgress`（可取消任务 + 进度通知）                                              | startTask 跑完写 done；cancelTask 取消写 cancelled                   | 入门 UI  |
| [quickinput](samples/quickinput)                                         | `window.showQuickPick` + `window.showInputBox`（无 `createQuickPick`）                      | 两步 quick pick + input box 流程并把结果写入输出                     | 入门 UI  |
| [configuration](samples/configuration)                                   | `contributes.configuration` + `workspace.getConfiguration` + `onDidChangeConfiguration`     | 读默认值、变更事件触发、重读新值                                     | 入门 UI  |
| [document-editing](samples/document-editing)                             | `window.getActiveTextEditor` + `TextEditor.edit`（插入行）+ 文档计数                        | 光标处插行并报告行列计数                                             | 入门 UI  |
| [completions](samples/completions)                                       | `languages.registerCompletionItemProvider`（triggerCharacters + `@` 触发）                  | 提供 plaintext 补全与 `@` 触发补全                                   | 语言特性 |
| [codelens](samples/codelens)                                             | `languages.registerCodeLensProvider`（`resolveCodeLens` + 命令）                            | 为 TODO 行解析 CodeLens 并运行其命令                                 | 语言特性 |
| [code-actions](samples/code-actions)                                     | `languages.createDiagnosticCollection` + `registerCodeActionsProvider`（edit 型 quickfix）  | 标记坏词并提供 edit quickfix 修复                                    | 语言特性 |
| [decorator](samples/decorator)                                           | `window.createTextEditorDecorationType` + `setDecorations`                                  | toggle 命令装饰匹配行然后清除                                        | 语言特性 |
| [semantic-tokens](samples/semantic-tokens)                               | `languages.registerDocumentSemanticTokensProvider`（全量文档 + legend）                     | 注册 provider 并产出 token                                           | 语言特性 |
| [diagnostic-related-information](samples/diagnostic-related-information) | `createDiagnosticCollection` + `Diagnostic.relatedInformation`                              | 为重复词推带 relatedInformation 的 Warning                           | 语言特性 |
| [tree-view](samples/tree-view)                                           | `contributes.viewsContainers` + `contributes.views` + `registerTreeDataProvider`            | 贡献 view container 并渲染两级树                                     | 视图     |
| [webview-panel](samples/webview-panel)                                   | `window.createWebviewPanel`（双向 postMessage）                                             | 打开面板并与 webview 交换消息                                        | 视图     |
| [custom-editor](samples/custom-editor)                                   | `contributes.customEditors` + `registerCustomEditorProvider`（只读）                        | 用只读自定义编辑器打开 `.hexview` 文件                               | 视图     |
| [timeline-provider](samples/timeline-provider)                           | `workspace.registerTimelineProvider` + `menus`(timeline/item/context)                       | 为文件贡献 timeline 项并运行上下文菜单命令；refresh 触发 onDidChange | 平台特色 |
| [mcp-server](samples/mcp-server)                                         | `contributes.mcpServers`（声明式 stdio MCP server）                                         | 贡献解析后的命令；server 回应 initialize 与 tools/list               | 平台特色 |
| [declarative-features](samples/declarative-features)                     | 纯声明式 `jsonValidation` + `grammars` + `iconThemes`                                       | schema 校验坏 JSON；grammar 接管自注册语言 id；icon theme 已注册     | 平台特色 |

## 与官方 vscode-extension-samples 的能力对照

官方仓库 81 个 sample 的对照如下。状态四档：**✅ 已提供**（写对应目录名）、**⚠️ 可做未做**（API 已支持，本仓库暂无对应示例）、**❌ API 未支持**（缺哪个 API/贡献点）、**➖ 不适用**（VSCode 构建工具链/生态专属）。缺失清单口径与主仓库 `docs/extension-dev/zh-CN/migration-from-vscode.md` 对照表一致，不夸大不虚标。

| 官方 sample                                                                 | 状态          | 对应 / 说明                                                                                                   |
| --------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| helloworld-sample / helloworld-minimal-sample / getting-started-sample      | ✅ 已提供     | [helloworld](samples/helloworld)                                                                              |
| statusbar-sample                                                            | ✅ 已提供     | [statusbar](samples/statusbar)                                                                                |
| notifications-sample                                                        | ✅ 已提供     | [notifications](samples/notifications)                                                                        |
| progress-sample                                                             | ✅ 已提供     | [progress](samples/progress)                                                                                  |
| quickinput-sample                                                           | ✅ 已提供     | [quickinput](samples/quickinput)（降级：无 `createQuickPick`）                                                |
| configuration-sample                                                        | ✅ 已提供     | [configuration](samples/configuration)（降级：单 scope）                                                      |
| document-editing-sample                                                     | ✅ 已提供     | [document-editing](samples/document-editing)                                                                  |
| completions-sample                                                          | ✅ 已提供     | [completions](samples/completions)                                                                            |
| codelens-sample                                                             | ✅ 已提供     | [codelens](samples/codelens)                                                                                  |
| code-actions-sample                                                         | ✅ 已提供     | [code-actions](samples/code-actions)                                                                          |
| decorator-sample                                                            | ✅ 已提供     | [decorator](samples/decorator)                                                                                |
| semantic-tokens-sample                                                      | ✅ 已提供     | [semantic-tokens](samples/semantic-tokens)                                                                    |
| diagnostic-related-information-sample                                       | ✅ 已提供     | [diagnostic-related-information](samples/diagnostic-related-information)                                      |
| tree-view-sample                                                            | ✅ 已提供     | [tree-view](samples/tree-view)（降级：无拖拽/checkbox/badge/reveal）                                          |
| webview-sample                                                              | ✅ 已提供     | [webview-panel](samples/webview-panel)（降级：无 ViewColumn/retainContextWhenHidden/serializer）              |
| custom-editor-sample                                                        | ✅ 已提供     | [custom-editor](samples/custom-editor)（降级：只读）                                                          |
| source-control-sample                                                       | ⚠️ 可做未做   | `scm.createSourceControl` 已支持，暂无对应示例                                                                |
| l10n-sample                                                                 | ⚠️ 可做未做   | `package.nls` 已支持，暂无对应示例                                                                            |
| theme-sample                                                                | ⚠️ 可做未做   | `contributes.themes` 已支持；同族 `iconThemes` 已由 [declarative-features](samples/declarative-features) 演示 |
| product-icon-theme-sample                                                   | ⚠️ 可做未做   | `contributes.productIconThemes` 已支持；同族 `iconThemes` 已演示                                              |
| fsconsumer-sample                                                           | ⚠️ 可做未做   | `workspace.fs` 已支持，暂无对应示例                                                                           |
| webview-codicons-sample                                                     | ⚠️ 可做未做   | codicon 用法可并入 [webview-panel](samples/webview-panel)                                                     |
| lsp-*（7 个）                                                               | ⚠️ 可做未做   | 无 `vscode-languageclient` 集成；`languages` provider 可手写，参考 completions/code-actions 等                |
| basic-multi-root-sample                                                     | ❌ API 未支持 | 单文件夹模型，无多根工作区                                                                                    |
| snippet-sample                                                              | ❌ API 未支持 | 无 `contributes.snippets`                                                                                     |
| language-configuration-sample                                               | ❌ API 未支持 | 无 `contributes.languages`                                                                                    |
| custom-data-sample                                                          | ❌ API 未支持 | 无 `contributes.customData`                                                                                   |
| terminal-sample / extension-terminal-sample / shell-integration-sample      | ❌ API 未支持 | 无 terminal API                                                                                               |
| task-provider-sample                                                        | ❌ API 未支持 | 无 `vscode.tasks`                                                                                             |
| test-provider-sample                                                        | ❌ API 未支持 | 无 test API                                                                                                   |
| comment-sample                                                              | ❌ API 未支持 | 无 comments                                                                                                   |
| authenticationprovider-sample / github-authentication-sample                | ❌ API 未支持 | 无 authentication                                                                                             |
| notebook-_（5 个）/ jupyter-_（2 个）                                       | ❌ API 未支持 | 无 notebook                                                                                                   |
| fsprovider-sample / nodefs-provider-sample                                  | ❌ API 未支持 | 无 `registerFileSystemProvider`                                                                               |
| contentprovider-sample / virtual-document-sample                            | ❌ API 未支持 | 无 `TextDocumentContentProvider`                                                                              |
| uri-handler-sample                                                          | ❌ API 未支持 | 无 `registerUriHandler`                                                                                       |
| tabs-api-sample                                                             | ❌ API 未支持 | 无 Tab API                                                                                                    |
| welcome-view-content-sample                                                 | ❌ API 未支持 | 无 `viewsWelcome`                                                                                             |
| webview-view-sample                                                         | ❌ API 未支持 | 无 `registerWebviewViewProvider`                                                                              |
| vim-sample                                                                  | ❌ API 未支持 | 无 `type` 命令拦截                                                                                            |
| inline-completions                                                          | ❌ API 未支持 | 无 inline completion API                                                                                      |
| document-paste / drop-on-document                                           | ❌ API 未支持 | 无对应 provider                                                                                               |
| call-hierarchy-sample                                                       | ❌ API 未支持 | `languages` 无 callHierarchy                                                                                  |
| telemetry-sample                                                            | ❌ API 未支持 | 无 telemetry API                                                                                              |
| proposed-api-sample                                                         | ❌ API 未支持 | VSCode proposed API 生态专属                                                                                  |
| chat-*（5 个）/ lm-api-tutorial                                             | ❌ API 未支持 | `ai` namespace 仅内置扩展，第三方不可用                                                                       |
| mcp-extension-sample                                                        | ❌ API 未支持 | 编程式 MCP API 无；声明式 `contributes.mcpServers` 已支持，参考 [mcp-server](samples/mcp-server)              |
| wasm-*（4 个）                                                              | ❌ API 未支持 | 无 WebAssembly 扩展执行上下文                                                                                 |
| webpack-sample / esbuild-sample                                             | ➖ 不适用     | 本仓库每个 sample 已内置 esbuild，即最佳实践                                                                  |
| helloworld-test-sample / helloworld-test-cli-sample / helloworld-web-sample | ➖ 不适用     | VSCode 测试工具链 / Web 运行环境专属                                                                          |

### Universe Editor 特有（官方无对应）

| sample                                               | 说明                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| [timeline-provider](samples/timeline-provider)       | `workspace.registerTimelineProvider`（官方仅 proposed API） |
| [mcp-server](samples/mcp-server)                     | `contributes.mcpServers` 声明式 MCP server（官方仅编程式）  |
| [declarative-features](samples/declarative-features) | 纯声明式 jsonValidation / grammars / iconThemes 合一        |

## 样本契约（新增 sample 照此写）

**目录**：`samples/<小写目录名>/`，`package.json` 的 `name` 用同名小写目录名、`publisher: "universe-samples"`。

**package.json 要点**：`"type": "module"`、`main: "./dist/extension.js"`、`engines.universe: ">=0.12.0 <1.0.0"`（勿 `^0.x`，host 的 semver 谈判不认）、`files` 白名单（`dist`、`icon.png`、被 contributes 引用的资源）、显式 `activationEvents`、`capabilities.untrustedWorkspaces: true`、scripts `build`/`watch`/`package`，devDeps 与根 `sdk-versions.json` 一致（跑 `npm run check` 校验）。`tsconfig.json` / `esbuild.config.mjs` 自包含（不 extends 根，保单目录可拎出）。代码风格：无分号、单引号、尾逗号、宽 100，默认不写注释。

**spec 契约**：`samples/<name>/e2e/<name>.spec.ts` 从固定相对路径 import：

```ts
import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('helloworld')
```

断言走 `window.__E2E__` 探针（`hasCommand` / `runCommand` / `getOutputChannelContent` / `getActiveEditorTypeId` / `openFileUri` / `getContextKey` …），类型声明见 `e2e/sampleApp.d.mts`。`page.evaluate` 里用 `window.__E2E__!`（非空断言）。

## 校验

```bash
npm run check          # sdk drift + prettier
npm run build:all      # 构建所有 sample 的 dist/
npm run package:all    # 打包所有 sample 的 .vsix
npm run e2e -- samples/<name>   # 跑单个 sample 的 e2e
```
