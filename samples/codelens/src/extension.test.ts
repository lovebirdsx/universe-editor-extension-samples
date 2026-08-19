import { describe, expect, it } from 'vitest'
import { findTodoLenses, resolveCodeLens } from './extension.js'

describe('findTodoLenses', () => {
  it('无 TODO 行返回空数组', () => {
    expect(findTodoLenses('')).toEqual([])
    expect(findTodoLenses('plain line')).toEqual([])
  })

  it('TODO 行 lens 的 range 为整行', () => {
    expect(findTodoLenses('TODO: fix')).toEqual([
      { range: { start: { line: 0, character: 0 }, end: { line: 0, character: 9 } } },
    ])
  })

  it('多个 TODO 行号与行长正确', () => {
    expect(findTodoLenses('x\nTODO: a\nTODO: longer')).toEqual([
      { range: { start: { line: 1, character: 0 }, end: { line: 1, character: 7 } } },
      { range: { start: { line: 2, character: 0 }, end: { line: 2, character: 12 } } },
    ])
  })

  it('无冒号的 TODO 不命中', () => {
    expect(findTodoLenses('TODO')).toEqual([])
  })

  it('行首有空格不命中（startsWith 语义）', () => {
    expect(findTodoLenses(' TODO: x')).toEqual([])
  })
})

describe('resolveCodeLens', () => {
  it('生成 Show TODO 命令且参数为 1 起始行号', () => {
    const resolved = resolveCodeLens({
      range: { start: { line: 2, character: 0 }, end: { line: 2, character: 5 } },
    })
    expect(resolved.command).toEqual({
      title: 'Show TODO',
      command: 'codelens.showMessage',
      arguments: [3],
    })
  })

  it('spread 保留原 lens 字段', () => {
    const resolved = resolveCodeLens({
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
    })
    expect(resolved.range).toEqual({
      start: { line: 0, character: 0 },
      end: { line: 0, character: 5 },
    })
  })
})
