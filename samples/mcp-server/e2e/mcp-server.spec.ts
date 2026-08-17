import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const { test, expect } = makeSampleTest('mcp-server')

const serverScript = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'index.mjs')

function runMcpServer(scriptPath: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`server exited ${code}: ${stderr}`))
        return
      }
      resolvePromise(stdout)
    })
    child.stdin.write(
      `${JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'e2e', version: '1.0.0' },
        },
      })}\n`,
    )
    child.stdin.write(
      `${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`,
    )
    child.stdin.end()
  })
}

test.describe('@p1 mcp-server', () => {
  test('contributes its MCP server with a resolved command', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    const command = async () =>
      page.evaluate(
        () =>
          window.__E2E__!.getContributedMcpServers().find((s) => s.name === 'sample-tools')
            ?.command ?? '',
      )

    // The extension host resolves ${execPath} against the environment snapshot on
    // boot; poll until the contributed record lands with a real executable path.
    await expect.poll(command, { timeout: 15000 }).not.toBe('')

    const resolved = await command()
    expect(resolved).not.toContain('${execPath}')
  })

  test('server script answers initialize and tools/list over stdio', async () => {
    const stdout = await runMcpServer(serverScript)
    const lines = stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
    const toolsList = lines.find((message) => message.id === 2)
    expect(toolsList).toBeTruthy()
    const names = toolsList.result.tools.map((tool) => tool.name)
    expect(names).toContain('echo')
    expect(names).toContain('add')
  })
})
