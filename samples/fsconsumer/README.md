# FS Consumer

演示 `workspace.fs` 文件系统 API：一条命令 `fsconsumer.run` 在工作区根下 `createDirectory` 建目录、`writeFile` 写文件、`readFile` 读回、`stat` 取元数据、`copy` 复制、`readDirectory` 列目录、`rename` 改名、`delete` 删除，每步把结果写进 OutputChannel。

## 起步

```bash
npm install       # 在仓库根跑一次即可（npm workspaces hoist 依赖）
npm run watch     # bundle src/ → dist/，改动即重编
npx uex dev       # 起 Extension Development Host 并装载本目录
```

## 运行步骤

1. 打开任意文件夹作为工作区（`workspace.fs` 的路径策略要求所有操作都发生在工作区根内）。
2. 命令面板运行 `FS Consumer: Run`（命令 id `fsconsumer.run`）。
3. 打开 Output 面板切到 `FS Consumer` 通道，可见每步结果：

   ```
   created directory fs-sample
   wrote fs-sample/hello.txt
   read fs-sample/hello.txt: hello from workspace.fs
   stat fs-sample/hello.txt: size=23 type=file
   copied fs-sample/hello.txt -> fs-sample/copy.txt
   readDirectory fs-sample: copy.txt, hello.txt
   renamed fs-sample/copy.txt -> fs-sample/renamed.txt
   deleted fs-sample/hello.txt
   readDirectory fs-sample: renamed.txt
   ```

4. 磁盘上最终残留 `fs-sample/renamed.txt`（内容为 `hello from workspace.fs`），`hello.txt` 已删除。

## 与 VSCode 原版差异 / 降级说明

对标 vscode-extension-samples 的 `fsconsumer-sample`。本实现按 Universe 的 API 形状调整：

- **路径是字符串，不是 `Uri`**：`workspace.fs` 的每个方法参数都是绝对文件系统路径字符串（`readFile(path)` / `writeFile(path, content)` / `stat(path)` / `readDirectory(path)` / `createDirectory(path)` / `delete(path, { recursive? })` / `rename(source, target, { overwrite? })` / `copy(source, target, { overwrite? })`）。
- **门控语义**：所有调用经 host 的路径策略门控——禁访问敏感位置、禁逃逸工作区根；扩展侧取工作区根用 `workspace.rootPath`（`string | undefined`）。
- **`FileType` 只有两值**：`File = 1` / `Directory = 2`；`FileStat` 只含 `type` / `size` / `mtime`（无 `ctime` / `permissions`）。

## 关联

能力对照表见仓库根 [README](../../README.md)「与官方 vscode-extension-samples 的能力对照」。
