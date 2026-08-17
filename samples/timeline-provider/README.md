# Timeline Provider

> 演示 `workspace.registerTimelineProvider(scheme, provider)`：为 `file` scheme 提供一个玩具时间线——把文件名的每个字符编成一条带 `timestamp` 的历史事件，条目带 `contextValue`；`timeline/item/context` 菜单挂一个命令，对条目执行时把 label 写进 OutputChannel；另有一条命令触发 `onDidChange` 演示刷新。

- 命令：`timeline-provider.refresh`（刷新时间线，命令面板搜 `Timeline Provider: Refresh Timeline`）
- 菜单：Timeline 条目右键 → `Timeline Provider: Inspect Event`（仅 `timelineItem == sample-timeline:event` 时可见）
- OutputChannel：`Timeline Provider`

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开任意文件（扩展经 `onStartupFinished` 激活并注册 provider）。
2. 切换到 Timeline 视图，选中刚打开的文件：每行一条 `Character N: '<字符>'` 事件，共「文件名长度」条。
3. 右键某条事件 → `Timeline Provider: Inspect Event`，Output 面板 `Timeline Provider` 通道打印 `Inspected: Character N: '<字符>'`。
4. 命令面板运行 `Timeline Provider: Refresh Timeline`，provider 触发 `onDidChange({ reset: true })`，视图丢弃缓存重新拉取。

## 与 VSCode 对应概念的关系

- 本能力对应 VSCode 的 **Timeline API**（`vscode.workspace.registerTimelineProvider`），契约几乎同形：`TimelineProvider` 提供 `id` / `label` / 可选 `onDidChange` / `provideTimeline(uri, options, token)`，`Timeline` 分页靠 `cursor` 回传。本示例为玩具实现未演示分页，但 `TimelineOptions.cursor` / `Timeline.cursor` 契约照旧可用。
- 差异：`TimelineItem.timestamp` 是 epoch 毫秒；条目身份由 `id` + `source` 组合（`source` 即 provider 的 `id`）；`timeline/item/context` 菜单的 `when` 用 `timelineItem` context key 对 `contextValue` 匹配，和 VSCode 一致。

## 相关

- 能力对照表与完整样本索引见仓库根 [README.md](../README.md)。
- Timeline 契约的完整定义见主仓库 `packages/extension-api/src/timeline.ts`。
