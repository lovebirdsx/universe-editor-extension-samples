import {
  languages,
  type CompletionItem,
  type ExtensionContext,
  type Position,
  type TextDocument,
} from '@universe-editor/extension-api'

// LSP CompletionItemKind is a numeric enum re-exported as a type only, so the
// values are spelled out here (Class=7, Field=5, Module=9, Keyword=14).
const KIND = { class: 7, field: 5, module: 9, keyword: 14 } as const

const TRIGGER_CHARACTER = '@'

const NORMAL_ITEMS: CompletionItem[] = [
  {
    label: 'universe-editor',
    kind: KIND.class,
    detail: 'class',
    documentation: 'The Universe Editor workbench.',
  },
  {
    label: 'universe-editor-core',
    kind: KIND.field,
    detail: 'field',
    documentation: { kind: 'markdown', value: 'The **core** runtime field.' },
  },
  {
    label: 'universe-editor-extension',
    kind: KIND.module,
    detail: 'module',
    documentation: 'An extension module.',
  },
]

const TRIGGER_ITEMS: CompletionItem[] = [
  { label: '@universe-editor/extension-api', kind: KIND.module, detail: 'module' },
  { label: '@universe-editor/platform', kind: KIND.module, detail: 'module' },
  { label: '@universe-editor/workbench-ui', kind: KIND.module, detail: 'module' },
]

export function getCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
  const line = document.getText().split('\n')[position.line] ?? ''
  const prefix = line.slice(0, position.character)
  return prefix.endsWith(TRIGGER_CHARACTER) ? TRIGGER_ITEMS : NORMAL_ITEMS
}

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      'plaintext',
      {
        provideCompletionItems(document, position) {
          return getCompletionItems(document, position)
        },
      },
      TRIGGER_CHARACTER,
    ),
  )
}

export function deactivate(): void {}
