import {
  commands,
  window,
  type ExtensionContext,
  type Range,
  type TextEditor,
  type TextEditorDecorationType,
} from '@universe-editor/extension-api'

const MATCH = 'HIGHLIGHT'

let decorationType: TextEditorDecorationType | undefined
let decorated = false

function highlightRanges(editor: TextEditor): Range[] {
  const ranges: Range[] = []
  const lines = editor.document.getText().split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (line.includes(MATCH)) {
      ranges.push({ start: { line: i, character: 0 }, end: { line: i, character: line.length } })
    }
  }
  return ranges
}

export function activate(context: ExtensionContext): void {
  decorationType = window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: 'rgba(255, 200, 0, 0.35)',
  })
  context.subscriptions.push(
    decorationType,
    commands.registerCommand('decorator.toggleHighlight', async () => {
      const editor = await window.getActiveTextEditor()
      if (!editor || !decorationType) return
      if (decorated) {
        editor.setDecorations(decorationType, [])
        decorated = false
      } else {
        editor.setDecorations(decorationType, highlightRanges(editor))
        decorated = true
      }
    }),
  )
}

export function deactivate(): void {}
