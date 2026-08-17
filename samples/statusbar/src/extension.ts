import {
  StatusBarAlignment,
  commands,
  window,
  type ExtensionContext,
  type StatusBarItem,
} from '@universe-editor/extension-api'

let item: StatusBarItem | undefined
let count = 0

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(
    commands.registerCommand('statusbar.toggle', () => {
      count += 1
      item ??= window.createStatusBarItem(StatusBarAlignment.Right, 100)
      item.text = `$(megaphone) Toggled ${count} time(s)`
      item.tooltip = 'Toggle again to update the count'
      item.command = 'statusbar.toggle'
      item.show()
    }),
  )
}

export function deactivate(): void {
  item?.dispose()
}
