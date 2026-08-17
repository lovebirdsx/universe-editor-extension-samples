import { commands, window, type ExtensionContext } from '@universe-editor/extension-api'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Quick Input')
  context.subscriptions.push(
    output,
    commands.registerCommand('quickinput.run', async () => {
      const pick = await window.showQuickPick(
        [
          { label: 'Alpha', description: 'first option', detail: 'shows description and detail' },
          { label: 'Beta', description: 'second option' },
          { label: 'Gamma', description: 'third option' },
        ],
        { placeHolder: 'Pick one (Alpha / Beta / Gamma)' },
      )
      if (pick === undefined) {
        output.appendLine('cancelled')
        return
      }
      const name = await window.showInputBox({
        prompt: 'Enter a name for the picked item',
        placeHolder: 'Enter a name',
      })
      if (name === undefined) {
        output.appendLine('cancelled')
        return
      }
      output.appendLine(`picked=${pick.label} name=${name}`)
    }),
  )
}

export function deactivate(): void {}
