import { readFile } from 'node:fs/promises'
import {
  Uri,
  window,
  type CustomDocument,
  type ExtensionContext,
  type UriComponents,
  type WebviewPanel,
} from '@universe-editor/extension-api'

const VIEW_TYPE = 'custom-editor.hexView'

class HexDocument implements CustomDocument {
  constructor(readonly uri: UriComponents) {}
  dispose(): void {}
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function hexDump(bytes: Uint8Array): string {
  const lines: string[] = []
  for (let offset = 0; offset < bytes.length; offset += 16) {
    const chunk = bytes.subarray(offset, offset + 16)
    const hex = Array.from(chunk, (b) => b.toString(16).padStart(2, '0')).join(' ')
    const ascii = Array.from(chunk, (b) =>
      b >= 32 && b <= 126 ? String.fromCharCode(b) : '.',
    ).join('')
    lines.push(`${offset.toString(16).padStart(8, '0')}  ${hex.padEnd(47)}  ${ascii}`)
  }
  return lines.join('\n')
}

export function activate(context: ExtensionContext): void {
  const provider = {
    openCustomDocument(uri: UriComponents): HexDocument {
      return new HexDocument(uri)
    },
    async resolveCustomEditor(document: HexDocument, panel: WebviewPanel): Promise<void> {
      panel.webview.options = { enableScripts: false }
      const fsPath = Uri.from(document.uri).fsPath
      const bytes = await readFile(fsPath)
      const fileName = document.uri.path?.split('/').pop() ?? 'untitled'
      panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<title>Hex View</title>
<style>
body { font-family: monospace; padding: 1rem; color: var(--vscode-foreground, #cccccc); }
pre { line-height: 1.4; }
</style>
</head>
<body>
<h1>${escapeHtml(fileName)}</h1>
<pre>${escapeHtml(hexDump(bytes))}</pre>
</body>
</html>`
    },
  }

  context.subscriptions.push(window.registerCustomEditorProvider(VIEW_TYPE, provider))
}

export function deactivate(): void {}
