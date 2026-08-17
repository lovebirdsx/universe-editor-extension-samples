# Tree View

> 演示 `contributes.viewsContainers`（活动栏新建一个容器）+ `contributes.views` + `window.registerTreeDataProvider`：一棵两层静态「依赖树」，顶层节点可折叠、叶子节点带 codicon 图标并挂命令（点击写 OutputChannel），另有刷新命令触发 `onDidChangeTreeData`。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 活动栏出现本扩展自建的 `Dependencies` 容器（图标 `$(list-tree)`，排在所有内置容器之后）。
2. 点击它，侧栏展开 `Dependencies` 视图，扩展经 `onView:tree-view.dependencies` 激活并注册树数据提供者。
3. 顶层是两个可折叠节点 `Dependencies` / `Dev Dependencies`；展开后是叶子依赖项（`react` / `lodash` / `typescript` / `esbuild`），带 `package` 图标与版本号。
4. 点击叶子执行命令 `tree-view.openDependency`，往 Output 面板的 `Tree View` 通道打印 `Opening dependency <name>`。
5. 命令面板运行 `Tree View: Refresh`（命令 id `tree-view.refreshEntry`）触发 `onDidChangeTreeData` 整树重拉。

## 与 VSCode 原版的差异

对标 vscode-extension-samples 的 `tree-view-sample`。本示例把原版最复杂的 `nodeDependencies`（读磁盘 package.json）缩成一个静态两层的演示树，聚焦 `viewsContainers` / `views` 声明与 `registerTreeDataProvider` 本身。

- 容器位置仅支持 `activitybar`（原版还有 `panel`）；扩展容器排在所有内置容器之后。
- 树首版裁剪：**无** `reveal`、拖拽、checkbox、badge、`title`/`description`/`message`；`TreeItem.iconPath` 只收 **codicon 名**（本示例用 `folder` / `package`），无文件路径或 `{ light, dark }` 主题图标。`getParent` 虽接受但不消费（没有 `reveal` 走不到）。
- `TreeItem.command` 的 `arguments` 原样传给命令 handler（活对象不出扩展宿主进程），`view/item/context` 菜单的 `view`/`viewItem` when 键可用——本示例为最小化未演示菜单。
- 刷新语义已对齐 VSCode：句柄跨刷新稳定、展开态保留、`onDidChangeTreeData(element)` 只失效该子树。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
