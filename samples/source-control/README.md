# Source Control

演示 `scm.createSourceControl` 的源码控制集成：一条命令 `sourceControl.activate` 在工作区根创建一个 Source Control provider，配两个 resource group（`Staged` / `Changes`，其一 `hideWhenEmpty`）、若干带 decorations 与点击命令的 resource state、`count` 徽标与 `inputBox` 占位符，并把 `acceptInputCommand` 接到自定义 commit 命令。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开任意文件夹作为工作区（Source Control 的 `rootUri` 绑定工作区根）。
2. 命令面板运行 `Source Control: Activate`（命令 id `sourceControl.activate`）。命令会在工作区根创建 `sample-staged.txt` / `sample-changed.txt` / `sample-removed.txt` 三个文件并建好 SCM provider。
3. 打开 SCM 侧栏（容器 `workbench.view.scm`），可见 `Staged`（1 个资源，`diff-added`）与 `Changes`（2 个资源，`diff-modified` / `diff-removed` 带删除线）两个分组，徽标 `count = 3`。
4. 在 input box 里输入提交信息（e2e 里由命令 `sourceControl.setInputBox` 代写），点提交按钮或运行 `Source Control: Commit`（`acceptInputCommand` 指向它）。命令把 inputBox 内容写进 Output 通道 `Source Control`，清空 inputBox、两个分组与 `count`。
5. 打开 Output 面板切到 `Source Control` 通道，可见：

   ```
   activated: count=3
   commit: sample commit message
   committed: count=0
   ```

6. 清空后 `Staged` 因 `hideWhenEmpty` 隐藏，`Changes` 无该标志仍保留；标题栏 `Refresh` 命令（`scm/title` 菜单）可重新填回资源。

## 与 VSCode 原版差异 / 降级说明

对标 vscode-extension-samples 的 `source-control-sample`。本实现按 Universe 的 API 形状调整：

- **`scm.createSourceControl(id, label, rootUri?)`**：`rootUri` 是字符串（绝对文件系统路径），不是 `Uri`；provider id 决定 `when` 子句里的 `scmProvider` 取值。
- **`SourceControlResourceState.resourceUri` 是路径字符串**（`join(root, name)`），`command.arguments` 随点击把该路径传给命令。
- **`SourceControl` 无 `quickDiffProvider`**：字段为 `inputBox`（`value` / `placeholder` / `onDidChange`）、`count`、`commitTemplate`、`acceptInputCommand`、`acceptInputActions`、`createResourceGroup(id, label, options?)`、`dispose()`。
- **`SourceControlResourceGroup`**：`label` / `hideWhenEmpty` / `resourceStates`（整体赋值替换，非增删 API）；`options.parentId` 可嵌套分组。
- **decorations 的 `iconPath` 是 codicon id**（如 `diff-added`），`color` 是 CSS 颜色，另有 `strikeThrough` / `faded` / `tooltip`。
- 菜单位置 `scm/title`、`scm/resourceState/context` 等沿用 VSCode 约定，本示例在 `scm/title` 放 `Refresh`、在 `scm/resourceState/context` 放 `Open Resource`。

## 关联

能力对照表见仓库根 [README](../../README.md)「与官方 vscode-extension-samples 的能力对照」。
