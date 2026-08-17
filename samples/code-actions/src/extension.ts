import {
  languages,
  workspace,
  Uri,
  type CodeAction,
  type Diagnostic,
  type DiagnosticCollection,
  type ExtensionContext,
  type Position,
  type Range,
  type TextDocument,
} from '@universe-editor/extension-api'

const BAD_WORD = 'foo_bad'
const GOOD_WORD = 'foo_good'
const OWNER = 'code-actions-sample'

function offsetToPosition(text: string, offset: number): Position {
  const before = text.slice(0, offset)
  return {
    line: before.split('\n').length - 1,
    character: offset - before.lastIndexOf('\n') - 1,
  }
}

function findBadWordRanges(text: string): Range[] {
  const ranges: Range[] = []
  let from = 0
  for (;;) {
    const index = text.indexOf(BAD_WORD, from)
    if (index === -1) break
    ranges.push({
      start: offsetToPosition(text, index),
      end: offsetToPosition(text, index + BAD_WORD.length),
    })
    from = index + BAD_WORD.length
  }
  return ranges
}

function overlaps(a: Range, b: Range): boolean {
  const aBeforeB =
    a.end.line < b.start.line ||
    (a.end.line === b.start.line && a.end.character <= b.start.character)
  const bBeforeA =
    b.end.line < a.start.line ||
    (b.end.line === a.start.line && b.end.character <= a.start.character)
  return !aBeforeB && !bBeforeA
}

export function activate(context: ExtensionContext): void {
  const diagnostics = languages.createDiagnosticCollection(OWNER)
  context.subscriptions.push(diagnostics)

  const refresh = (document: TextDocument): void => {
    diagnostics.set(
      document.uri,
      findBadWordRanges(document.getText()).map((range): Diagnostic => ({
        range,
        severity: 2,
        message: `'${BAD_WORD}' is discouraged; replace it with '${GOOD_WORD}'.`,
        source: OWNER,
      })),
    )
  }

  for (const document of workspace.textDocuments) refresh(document)

  context.subscriptions.push(
    workspace.onDidOpenTextDocument(refresh),
    workspace.onDidChangeTextDocument((event) => refresh(event.document)),
    workspace.onDidCloseTextDocument((document) => diagnostics.delete(document.uri)),
    languages.registerCodeActionsProvider('plaintext', {
      provideCodeActions(document, range) {
        const uri = Uri.from(document.uri).toString()
        const actions: CodeAction[] = []
        for (const bad of findBadWordRanges(document.getText())) {
          if (!overlaps(bad, range)) continue
          actions.push({
            title: `Replace '${BAD_WORD}' with '${GOOD_WORD}'`,
            kind: 'quickfix',
            edit: { changes: { [uri]: [{ range: bad, newText: GOOD_WORD }] } },
          })
        }
        return actions
      },
    }),
  )
}

export function deactivate(): void {}
