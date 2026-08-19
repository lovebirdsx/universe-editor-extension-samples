import { describe, expect, it } from 'vitest'
import { escapeHtml, hexDump } from './extension.js'

describe('escapeHtml', () => {
  it('转义 & < >', () => {
    expect(escapeHtml('a<b>c&d')).toBe('a&lt;b&gt;c&amp;d')
  })

  it('连续 & 各自转义且不重复转义', () => {
    expect(escapeHtml('&&')).toBe('&amp;&amp;')
  })

  it('普通文本原样返回', () => {
    expect(escapeHtml("plain 'text'")).toBe("plain 'text'")
  })
})

describe('hexDump', () => {
  it('空输入返回空串', () => {
    expect(hexDump(new Uint8Array())).toBe('')
  })

  it('单字节行：offset + 47 宽 hex 列 + ascii 列', () => {
    expect(hexDump(new Uint8Array([0x00]))).toBe(`00000000  ${'00'.padEnd(47)}  .`)
  })

  it('16 字节恰好一行', () => {
    const bytes = new Uint8Array(Array.from({ length: 16 }, (_, i) => i))
    const hex = Array.from({ length: 16 }, (_, i) => i.toString(16).padStart(2, '0')).join(' ')
    expect(hexDump(bytes)).toBe(`00000000  ${hex.padEnd(47)}  ................`)
  })

  it('17 字节分两行且第二行 offset 为 0x10', () => {
    const lines = hexDump(new Uint8Array(17)).split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]?.startsWith('00000010')).toBe(true)
  })

  it('可见字符进入 ascii 列', () => {
    expect(hexDump(new Uint8Array([65, 66, 67])).endsWith('ABC')).toBe(true)
  })

  it('控制字符在 ascii 列显示为 .', () => {
    expect(hexDump(new Uint8Array([0x0a])).endsWith('.')).toBe(true)
  })
})
