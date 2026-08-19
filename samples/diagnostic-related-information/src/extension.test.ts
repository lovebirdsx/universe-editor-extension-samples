import { Uri } from '@universe-editor/extension-api'
import { describe, expect, it, vi } from 'vitest'
import { occurrenceRanges, refreshDiagnostics } from './extension.js'

const WORD = 'duplicate_id'

const doc = (text: string) => ({
  uri: { scheme: 'file', path: '/a.txt' },
  getText: () => text,
})

describe('occurrenceRanges', () => {
  it('无出现返回空数组', () => {
    expect(occurrenceRanges({ getText: () => 'clean' })).toEqual([])
  })

  it('单行单次出现定位正确', () => {
    expect(occurrenceRanges({ getText: () => `x ${WORD} y` })).toEqual([
      { start: { line: 0, character: 2 }, end: { line: 0, character: 2 + WORD.length } },
    ])
  })

  it('单行多次出现', () => {
    expect(occurrenceRanges({ getText: () => `${WORD} ${WORD}` }).length).toBe(2)
  })

  it('多行出现行号正确', () => {
    const ranges = occurrenceRanges({ getText: () => `a\n${WORD}\nb ${WORD}` })
    expect(ranges.map((r) => r.start.line)).toEqual([1, 2])
  })

  it('支持 CRLF 与 CR 分行', () => {
    expect(occurrenceRanges({ getText: () => `a\r\n${WORD}` })[0]?.start.line).toBe(1)
    expect(occurrenceRanges({ getText: () => `a\r${WORD}` })[0]?.start.line).toBe(1)
  })
})

describe('refreshDiagnostics', () => {
  it('出现不足两次时清空诊断', () => {
    const collection = { set: vi.fn() }
    refreshDiagnostics(doc(`only one ${WORD}`), collection)
    expect(collection.set).toHaveBeenCalledWith(doc('').uri, [])
  })

  it('出现两次及以上时产生指向首个出现的 relatedInformation', () => {
    const text = `${WORD} then ${WORD} again`
    const collection = { set: vi.fn() }
    refreshDiagnostics(doc(text), collection)

    const [uri, diagnostics] = collection.set.mock.calls[0]!
    expect(uri).toEqual(doc('').uri)
    expect(diagnostics).toHaveLength(1)

    const diagnostic = diagnostics[0]!
    expect(diagnostic.range).toEqual({
      start: { line: 0, character: WORD.length + 6 },
      end: { line: 0, character: WORD.length + 6 + WORD.length },
    })
    expect(diagnostic.severity).toBe(2)
    expect(diagnostic.message).toContain(WORD)
    expect(diagnostic.source).toBe('duplicate-check')
    expect(diagnostic.relatedInformation).toEqual([
      {
        location: {
          uri: Uri.from({ scheme: 'file', path: '/a.txt' }).toString(),
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: WORD.length } },
        },
        message: 'first declared here',
      },
    ])
  })
})
