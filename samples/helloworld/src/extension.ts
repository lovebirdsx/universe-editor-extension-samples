import { commands, window, type ExtensionContext } from '@universe-editor/extension-api'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Hello World')
  context.subscriptions.push(
    output,
    commands.registerCommand('helloworld.helloWorld', () => {
      output.appendLine('Hello from Hello World!')
      void window.showInformationMessage('Hello from Hello World!')
    }),
  )
}

export function deactivate(): void {}
