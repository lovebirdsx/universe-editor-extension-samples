# Hello World

最小的 Universe Editor 扩展示例：注册一条命令，运行后弹出一条信息并把一行文本写进 OutputChannel。

- 命令：`helloworld.helloWorld`（Command Palette 里搜 `Hello World: Hello World`）
- OutputChannel：`Hello World`

## Develop

```bash
npm install                 # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch               # bundle src/ → dist/，改动即重编
npx uex dev --inspect=9229  # 起 Extension Development Host 并装载本目录
```

## Package

```bash
npm run package             # → universe-samples.helloworld-0.0.1.vsix（会先跑 universe:prepublish）
```

在编辑器的 Extensions 视图 "Install from VSIX…" 安装后，从命令面板运行 `Hello World: Hello World`。

## e2e

```bash
# 仓库根，UNIVERSE_EDITOR_REPO 指向本地 universe-editor checkout
UNIVERSE_EDITOR_REPO=<path> npm run e2e -- samples/helloworld
```

spec 经 `makeSampleTest('helloworld')` 冷启动编辑器并只装载本 sample，断言命令已注册、执行后 OutputChannel 里出现 `Hello from Hello World!`。
