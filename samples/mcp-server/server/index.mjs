import { createInterface } from 'node:readline'

const tools = [
  {
    name: 'echo',
    description: 'Echo the given text back.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
  {
    name: 'add',
    description: 'Add two numbers.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b'],
    },
  },
]

function respond(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`)
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity })

for await (const line of rl) {
  let message
  try {
    message = JSON.parse(line)
  } catch {
    continue
  }
  const method = message?.method
  const id = message?.id
  if (method === 'initialize') {
    respond(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'sample-tools', version: '0.0.1' },
    })
  } else if (method === 'tools/list') {
    respond(id, { tools })
  } else if (method === 'tools/call') {
    const { name, arguments: args } = message?.params ?? {}
    let result
    if (name === 'echo') {
      result = String(args?.text ?? '')
    } else if (name === 'add') {
      result = Number(args?.a ?? 0) + Number(args?.b ?? 0)
    } else {
      respond(id, { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] })
      continue
    }
    respond(id, { content: [{ type: 'text', text: String(result) }] })
  }
  // Notifications (e.g. "notifications/initialized") carry no id and need no response.
}
