import {
  FileType,
  commands,
  window,
  workspace,
  type ExtensionContext,
} from '@universe-editor/extension-api'
import { join } from 'node:path'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const CONTENT = 'hello from workspace.fs'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('FS Consumer')
  context.subscriptions.push(
    output,
    commands.registerCommand('fsconsumer.run', async () => {
      const root = workspace.rootPath
      if (!root) {
        output.appendLine('no workspace folder open')
        return
      }
      const dir = join(root, 'fs-sample')
      const hello = join(dir, 'hello.txt')
      const copy = join(dir, 'copy.txt')
      const renamed = join(dir, 'renamed.txt')

      output.appendLine(`workspace: ${root}`)

      await workspace.fs.createDirectory(dir)
      output.appendLine('created directory fs-sample')

      await workspace.fs.writeFile(hello, encoder.encode(CONTENT))
      output.appendLine('wrote fs-sample/hello.txt')

      const content = decoder.decode(await workspace.fs.readFile(hello))
      output.appendLine(`read fs-sample/hello.txt: ${content}`)

      const stat = await workspace.fs.stat(hello)
      const type = stat.type === FileType.File ? 'file' : 'directory'
      output.appendLine(`stat fs-sample/hello.txt: size=${stat.size} type=${type}`)

      await workspace.fs.copy(hello, copy)
      output.appendLine('copied fs-sample/hello.txt -> fs-sample/copy.txt')

      const entries = (await workspace.fs.readDirectory(dir)).map(([name]) => name).sort()
      output.appendLine(`readDirectory fs-sample: ${entries.join(', ')}`)

      await workspace.fs.rename(copy, renamed)
      output.appendLine('renamed fs-sample/copy.txt -> fs-sample/renamed.txt')

      await workspace.fs.delete(hello)
      output.appendLine('deleted fs-sample/hello.txt')

      const after = (await workspace.fs.readDirectory(dir)).map(([name]) => name).sort()
      output.appendLine(`readDirectory fs-sample: ${after.join(', ')}`)
    }),
  )
}

export function deactivate(): void {}
