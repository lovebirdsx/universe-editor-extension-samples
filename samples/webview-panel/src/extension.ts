import {
  commands,
  window,
  type ExtensionContext,
  type UriComponents,
  type Webview,
  type WebviewPanel,
} from '@universe-editor/extension-api'

const VIEW_TYPE = 'webview-panel.counter'

let panel: WebviewPanel | undefined
let count = 0

function fileUri(fsPath: string): UriComponents {
  const forward = fsPath.replace(/\\/g, '/')
  return { scheme: 'file', path: forward.startsWith('/') ? forward : `/${forward}` }
}

function getWebviewContent(webview: Webview, extensionRoot: string): string {
  const scriptUri = webview.asWebviewUri(fileUri(`${extensionRoot}/media/main.js`))
  const styleUri = webview.asWebviewUri(fileUri(`${extensionRoot}/media/main.css`))
  const codiconUri = webview.asWebviewUri(fileUri(`${extensionRoot}/media/codicon.css`))
  const csp = `default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; font-src ${webview.cspSource}; script-src 'unsafe-inline' ${webview.cspSource};`
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<link rel="stylesheet" href="${styleUri}">
<link rel="stylesheet" href="${codiconUri}">
<title>Webview Panel</title>
</head>
<body>
<h1>Webview Panel</h1>
<p class="codicon-row">
  <span class="codicon codicon-search" aria-hidden="true"></span>
  <span class="codicon codicon-source-control" aria-hidden="true"></span>
  <span class="codicon codicon-check" aria-hidden="true"></span>
</p>
<p>Extension-pushed count: <span id="counter">0</span></p>
<button id="notify" type="button">Notify Extension</button>
<script src="${scriptUri}"></script>
</body>
</html>`
}

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Webview Panel')

  context.subscriptions.push(
    output,
    commands.registerCommand('webview-panel.show', () => {
      if (panel) {
        panel.reveal()
        return
      }
      panel = window.createWebviewPanel(VIEW_TYPE, 'Webview Panel', undefined, {
        enableScripts: true,
        localResourceRoots: [fileUri(context.extensionPath)],
      })
      panel.webview.html = getWebviewContent(panel.webview, context.extensionPath)
      panel.webview.onDidReceiveMessage((message) => {
        if (
          message &&
          typeof message === 'object' &&
          (message as { type?: string }).type === 'notify'
        ) {
          output.appendLine('Received notify from webview')
        }
      })
      panel.onDidDispose(() => {
        panel = undefined
      })
    }),
    commands.registerCommand('webview-panel.sendMessage', () => {
      count += 1
      if (panel) {
        void panel.webview.postMessage({ type: 'update', count })
      }
    }),
    commands.registerCommand('webview-panel.dispose', () => {
      panel?.dispose()
    }),
  )
}

export function deactivate(): void {}
