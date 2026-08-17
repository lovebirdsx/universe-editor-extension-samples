import { commands, window, type ExtensionContext } from '@universe-editor/extension-api'

const INSERTED_LINE = 'Inserted by Document Editing\n'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Document Editing')
  context.subscriptions.push(
    output,
    commands.registerCommand('document-editing.insertLine', async () => {
      const editor = await window.getActiveTextEditor()
      if (!editor) {
        output.appendLine('no active editor')
        return
      }
      const position = editor.selection.active
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, INSERTED_LINE)
      })
      output.appendLine('inserted a line at the cursor')
    }),
    commands.registerCommand('document-editing.count', async () => {
      const editor = await window.getActiveTextEditor()
      if (!editor) {
        output.appendLine('no active editor')
        return
      }
      const text = editor.document.getText()
      const message = `lines: ${text.split('\n').length}, chars: ${text.length}`
      output.appendLine(message)
      void window.showInformationMessage(message)
    }),
  )
}

export function deactivate(): void {}
