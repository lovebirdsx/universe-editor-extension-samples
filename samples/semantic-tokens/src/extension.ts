import {
  languages,
  type DocumentSemanticTokensProvider,
  type ExtensionContext,
  type SemanticTokens,
  type TextDocument,
} from '@universe-editor/extension-api'

const TOKEN_TYPES = ['keyword', 'function']
const TOKEN_MODIFIERS = ['declaration']

const KEYWORD = 0
const FUNCTION = 1
const DECLARATION = 1 << 0

interface ParsedToken {
  line: number
  startCharacter: number
  length: number
  tokenType: number
  tokenModifiers: number
}

function parseText(text: string): ParsedToken[] {
  const tokens: ParsedToken[] = []
  const lines = text.split(/\r\n|\r|\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    for (const match of line.matchAll(/\b[A-Z][A-Z0-9_]*\b/g)) {
      tokens.push({
        line: i,
        startCharacter: match.index,
        length: match[0].length,
        tokenType: KEYWORD,
        tokenModifiers: 0,
      })
    }
    for (const match of line.matchAll(/\bfn\s+([A-Za-z_][A-Za-z0-9_]*)\b/g)) {
      const name = match[1] ?? ''
      tokens.push({
        line: i,
        startCharacter: match.index + match[0].indexOf(name),
        length: name.length,
        tokenType: FUNCTION,
        tokenModifiers: DECLARATION,
      })
    }
  }
  return tokens.sort((a, b) => a.line - b.line || a.startCharacter - b.startCharacter)
}

function encode(tokens: readonly ParsedToken[]): number[] {
  const data: number[] = []
  let prevLine = 0
  let prevStart = 0
  for (const token of tokens) {
    const deltaLine = token.line - prevLine
    const deltaStart = deltaLine === 0 ? token.startCharacter - prevStart : token.startCharacter
    data.push(deltaLine, deltaStart, token.length, token.tokenType, token.tokenModifiers)
    prevLine = token.line
    prevStart = token.startCharacter
  }
  return data
}

export function activate(context: ExtensionContext): void {
  const provider: DocumentSemanticTokensProvider = {
    legend: { tokenTypes: TOKEN_TYPES, tokenModifiers: TOKEN_MODIFIERS },
    provideDocumentSemanticTokens(document: TextDocument): SemanticTokens {
      return { data: encode(parseText(document.getText())) }
    },
  }
  context.subscriptions.push(
    languages.registerDocumentSemanticTokensProvider('plaintext', provider),
  )
}

export function deactivate(): void {}
