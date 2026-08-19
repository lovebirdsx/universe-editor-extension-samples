import { describe, expect, it } from 'vitest'
import { highlightRanges } from './extension.js'

const editor = (text: string) => ({ document: { getText: () => text } })

describe('highlightRanges', () => {
  it('无匹配返回空数组', () => {
    expect(highlightRanges(editor('plain text'))).toEqual([])
  })

  it('命中行返回整行 range', () => {
    expect(highlightRanges(editor('HIGHLIGHT'))).toEqual([
      { start: { line: 0, character: 0 }, end: { line: 0, character: 9 } },
    ])
  })

  it('词嵌在长行中仍是整行 range（includes 语义）', () => {
    expect(highlightRanges(editor('xx HIGHLIGHT yy'))).toEqual([
      { start: { line: 0, character: 0 }, end: { line: 0, character: 15 } },
    ])
  })

  it('多行命中行号正确', () => {
    expect(highlightRanges(editor('no\nHIGHLIGHT\nno HIGHLIGHT'))).toEqual([
      { start: { line: 1, character: 0 }, end: { line: 1, character: 9 } },
      { start: { line: 2, character: 0 }, end: { line: 2, character: 12 } },
    ])
  })

  it('大小写敏感：小写不命中', () => {
    expect(highlightRanges(editor('highlight'))).toEqual([])
  })
})
