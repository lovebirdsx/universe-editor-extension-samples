import { commands, window, workspace, type ExtensionContext } from '@universe-editor/extension-api'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Configuration')
  context.subscriptions.push(
    output,
    commands.registerCommand('configuration.read', async () => {
      const greeting = await workspace.getConfiguration('configuration').get('greeting', '')
      const showCount = await workspace.getConfiguration('configuration').get('showCount', false)
      output.appendLine(`[read] configuration.greeting = ${greeting}`)
      output.appendLine(`[read] configuration.showCount = ${showCount}`)
    }),
    workspace.onDidChangeConfiguration(async (e) => {
      if (!e.affectsConfiguration('configuration.greeting')) return
      const greeting = await workspace.getConfiguration('configuration').get('greeting', '')
      output.appendLine(`[change] configuration.greeting = ${greeting}`)
    }),
  )
}

export function deactivate(): void {}
