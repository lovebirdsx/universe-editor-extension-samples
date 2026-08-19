import {
  Uri,
  languages,
  workspace,
  type Diagnostic,
  type DiagnosticCollection,
  type ExtensionContext,
  type Range,
  type TextDocument,
} from '@universe-editor/extension-api'

const WORD = 'duplicate_id'

export function occurrenceRanges(document: Pick<TextDocument, 'getText'>): Range[] {
  const ranges: Range[] = []
  const lines = document.getText().split(/\r\n|\r|\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    let from = 0
    while (true) {
      const index = line.indexOf(WORD, from)
      if (index === -1) break
      ranges.push({
        start: { line: i, character: index },
        end: { line: i, character: index + WORD.length },
      })
      from = index + WORD.length
    }
  }
  return ranges
}

export function refreshDiagnostics(
  document: Pick<TextDocument, 'uri' | 'getText'>,
  collection: Pick<DiagnosticCollection, 'set'>,
): void {
  const ranges = occurrenceRanges(document)
  const diagnostics: Diagnostic[] =
    ranges.length >= 2
      ? [
          {
            range: ranges[1]!,
            severity: 2,
            message: `duplicate identifier "${WORD}"`,
            source: 'duplicate-check',
            relatedInformation: [
              {
                location: { uri: Uri.from(document.uri).toString(), range: ranges[0]! },
                message: 'first declared here',
              },
            ],
          },
        ]
      : []
  collection.set(document.uri, diagnostics)
}

export function activate(context: ExtensionContext): void {
  const collection = languages.createDiagnosticCollection('duplicate-check')
  context.subscriptions.push(
    collection,
    workspace.onDidOpenTextDocument((document) => {
      if (document.languageId === 'plaintext') refreshDiagnostics(document, collection)
    }),
    workspace.onDidChangeTextDocument((event) => {
      if (event.document.languageId === 'plaintext') refreshDiagnostics(event.document, collection)
    }),
  )
}

export function deactivate(): void {}
