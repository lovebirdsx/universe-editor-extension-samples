import {
  commands,
  scm,
  window,
  workspace,
  type ExtensionContext,
  type SourceControl,
  type SourceControlResourceGroup,
} from '@universe-editor/extension-api'
import { basename, join } from 'node:path'

const encoder = new TextEncoder()

const COMMIT_MESSAGE = 'sample commit message'

let sourceControl: SourceControl | undefined
let stagedGroup: SourceControlResourceGroup | undefined
let changesGroup: SourceControlResourceGroup | undefined

function seedResources(root: string): void {
  if (!sourceControl || !stagedGroup || !changesGroup) return
  stagedGroup.resourceStates = [
    {
      resourceUri: join(root, 'sample-staged.txt'),
      contextValue: 'staged',
      command: {
        command: 'sourceControl.openResource',
        title: 'Open',
        arguments: [join(root, 'sample-staged.txt')],
      },
      decorations: { iconPath: 'diff-added', color: '#73c991', tooltip: 'Added' },
    },
  ]
  changesGroup.resourceStates = [
    {
      resourceUri: join(root, 'sample-changed.txt'),
      contextValue: 'changed',
      command: {
        command: 'sourceControl.openResource',
        title: 'Open',
        arguments: [join(root, 'sample-changed.txt')],
      },
      decorations: { iconPath: 'diff-modified', color: '#e2c08d', tooltip: 'Modified' },
    },
    {
      resourceUri: join(root, 'sample-removed.txt'),
      contextValue: 'removed',
      command: {
        command: 'sourceControl.openResource',
        title: 'Open',
        arguments: [join(root, 'sample-removed.txt')],
      },
      decorations: {
        iconPath: 'diff-removed',
        color: '#c74e39',
        tooltip: 'Deleted',
        strikeThrough: true,
        faded: true,
      },
    },
  ]
  sourceControl.count = 3
}

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Source Control')

  context.subscriptions.push(
    output,
    commands.registerCommand('sourceControl.activate', async () => {
      if (sourceControl) return
      const root = workspace.rootPath
      if (!root) {
        output.appendLine('no workspace folder open')
        return
      }

      await workspace.fs.writeFile(
        join(root, 'sample-staged.txt'),
        encoder.encode('staged content'),
      )
      await workspace.fs.writeFile(
        join(root, 'sample-changed.txt'),
        encoder.encode('changed content'),
      )
      await workspace.fs.writeFile(
        join(root, 'sample-removed.txt'),
        encoder.encode('removed content'),
      )

      sourceControl = scm.createSourceControl('sample', 'Source Control Sample', root)
      sourceControl.inputBox.placeholder = 'Message (Ctrl+Enter to commit)'
      sourceControl.acceptInputCommand = { command: 'sourceControl.commit', title: 'Commit' }
      stagedGroup = sourceControl.createResourceGroup('staged', 'Staged')
      stagedGroup.hideWhenEmpty = true
      changesGroup = sourceControl.createResourceGroup('changes', 'Changes')

      seedResources(root)
      output.appendLine('activated: count=3')
    }),
    commands.registerCommand('sourceControl.refresh', () => {
      const root = workspace.rootPath
      if (!root) return
      seedResources(root)
      output.appendLine('refreshed: count=3')
    }),
    commands.registerCommand('sourceControl.commit', () => {
      if (!sourceControl || !stagedGroup || !changesGroup) return
      const message = sourceControl.inputBox.value
      output.appendLine(`commit: ${message}`)
      sourceControl.inputBox.value = ''
      stagedGroup.resourceStates = []
      changesGroup.resourceStates = []
      sourceControl.count = 0
      output.appendLine('committed: count=0')
    }),
    commands.registerCommand('sourceControl.setInputBox', () => {
      if (!sourceControl) return
      sourceControl.inputBox.value = COMMIT_MESSAGE
    }),
    commands.registerCommand('sourceControl.openResource', (resourceUri: unknown) => {
      output.appendLine(
        `open: ${typeof resourceUri === 'string' ? basename(resourceUri) : 'resource'}`,
      )
    }),
  )
}

export function deactivate(): void {
  sourceControl?.dispose()
}
