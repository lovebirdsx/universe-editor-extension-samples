import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// 黑盒进程测试：不起 shell、直接 spawn node 跑真实 stdio MCP server，
// 保持 contributes.mcpServers 声明的入口原样不动（package.json 的 files
// 白名单含 server/，会随 VSIX 发布，测试文件因此不放 server/ 下）。
const serverPath = resolve(dirname(fileURLToPath(import.meta.url)), '../server/index.mjs')

let child
let rl
let queue = []
let notify = null

function nextMessage() {
  if (queue.length > 0) return Promise.resolve(queue.shift())
  return new Promise((resolveMessage) => {
    notify = resolveMessage
  })
}

async function waitFor(id) {
  for (;;) {
    const message = await nextMessage()
    if (message.id === id) return message
  }
}

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`)
}

beforeEach(() => {
  child = spawn(process.execPath, [serverPath], { stdio: ['pipe', 'pipe', 'pipe'] })
  queue = []
  notify = null
  rl = createInterface({ input: child.stdout, crlfDelay: Infinity })
  rl.on('line', (line) => {
    const message = JSON.parse(line)
    if (notify) {
      const resolveMessage = notify
      notify = null
      resolveMessage(message)
    } else {
      queue.push(message)
    }
  })
})

afterEach(() => {
  rl.close()
  child.kill()
})

describe('mcp server (stdio black-box)', () => {
  it('initialize 应答协议版本、能力与 serverInfo', async () => {
    send({ jsonrpc: '2.0', id: 1, method: 'initialize' })
    const message = await waitFor(1)
    expect(message.jsonrpc).toBe('2.0')
    expect(message.result.protocolVersion).toBe('2024-11-05')
    expect(message.result.capabilities).toEqual({ tools: {} })
    expect(message.result.serverInfo).toEqual({ name: 'sample-tools', version: '0.0.1' })
  })

  it('tools/list 返回 echo 与 add 两个工具及输入 schema', async () => {
    send({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
    const message = await waitFor(2)
    expect(message.result.tools.map((tool) => tool.name)).toEqual(['echo', 'add'])
    expect(message.result.tools[0].inputSchema.required).toEqual(['text'])
    expect(message.result.tools[1].inputSchema.required).toEqual(['a', 'b'])
  })

  it('tools/call echo 回显文本；缺 text 时为空串', async () => {
    send({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'echo', arguments: { text: 'hi' } },
    })
    const echoed = await waitFor(3)
    expect(echoed.result.content).toEqual([{ type: 'text', text: 'hi' }])

    send({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'echo', arguments: {} } })
    const empty = await waitFor(4)
    expect(empty.result.content).toEqual([{ type: 'text', text: '' }])
  })

  it('tools/call add 做 Number 强转求和', async () => {
    send({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: { name: 'add', arguments: { a: 2, b: '3' } },
    })
    const message = await waitFor(5)
    expect(message.result.content).toEqual([{ type: 'text', text: '5' }])
  })

  it('未知工具返回 isError 结果', async () => {
    send({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: { name: 'nope', arguments: {} },
    })
    const message = await waitFor(6)
    expect(message.result.isError).toBe(true)
    expect(message.result.content[0].text).toContain('Unknown tool: nope')
  })

  it('无 id 的通知不产生响应行', async () => {
    send({ jsonrpc: '2.0', method: 'notifications/initialized' })
    send({ jsonrpc: '2.0', id: 7, method: 'initialize' })
    // 若通知被应答，第一条消息的 id 会是 undefined；这里断言第一条即 initialize 的响应。
    const message = await nextMessage()
    expect(message.id).toBe(7)
    expect(message.result.serverInfo.name).toBe('sample-tools')
  })

  it('非法 JSON 行被跳过且服务器保持存活', async () => {
    child.stdin.write('this is not json\n')
    send({ jsonrpc: '2.0', id: 8, method: 'initialize' })
    const message = await waitFor(8)
    expect(message.id).toBe(8)
    expect(message.result.serverInfo.name).toBe('sample-tools')
  })
})
