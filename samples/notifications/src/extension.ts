import { commands, window, type ExtensionContext } from '@universe-editor/extension-api'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Notifications')

  context.subscriptions.push(
    output,
    commands.registerCommand('notifications.showAll', () => {
      void window.showInformationMessage('Information message')
      void window.showWarningMessage('Warning message')
      void window.showErrorMessage('Error message')
    }),
    commands.registerCommand('notifications.showWithActions', async () => {
      const choice = await window.showInformationMessage('Choose an action', 'Confirm', 'Cancel')
      output.appendLine(choice === 'Confirm' ? 'chose Confirm' : 'dismissed')
    }),
  )
}

export function deactivate(): void {}
