import { window, type ExtensionContext } from '@universe-editor/extension-api'

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('MCP Server')
  output.appendLine(
    'mcp-server activated; the sample MCP server is injected declaratively via contributes.mcpServers',
  )
  context.subscriptions.push(output)
}

export function deactivate(): void {}
