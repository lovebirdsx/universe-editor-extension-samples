import {
  commands,
  languages,
  window,
  type CodeLens,
  type ExtensionContext,
} from '@universe-editor/extension-api'

const MARKER = 'TODO:'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('CodeLens Sample')
  context.subscriptions.push(
    output,
    commands.registerCommand('codelens.showMessage', (...args: unknown[]) => {
      const line = args[0]
      output.appendLine(
        typeof line === 'number' ? `CodeLens action on line ${line}` : 'CodeLens action',
      )
    }),
    languages.registerCodeLensProvider('plaintext', {
      provideCodeLenses(document) {
        const lenses: CodeLens[] = []
        for (const [lineIndex, line] of document.getText().split('\n').entries()) {
          if (!line.startsWith(MARKER)) continue
          lenses.push({
            range: {
              start: { line: lineIndex, character: 0 },
              end: { line: lineIndex, character: line.length },
            },
          })
        }
        return lenses
      },
      resolveCodeLens(codeLens) {
        return {
          ...codeLens,
          command: {
            title: 'Show TODO',
            command: 'codelens.showMessage',
            arguments: [codeLens.range.start.line + 1],
          },
        }
      },
    }),
  )
}

export function deactivate(): void {}
