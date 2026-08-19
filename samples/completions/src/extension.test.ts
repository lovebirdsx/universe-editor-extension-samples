import type { TextDocument } from '@universe-editor/extension-api'
import { describe, expect, it } from 'vitest'
import { getCompletionItems } from './extension.js'

const doc = (text: string): TextDocument => ({
  uri: { scheme: 'file', path: '/x.txt' },
  languageId: 'plaintext',
  version: 1,
  isUntitled: false,
  getText: () => text,
})

const at = (line: number, character: number) => ({ line, character })

describe('getCompletionItems', () => {
  it('前缀不以 @ 结尾返回常规项', () => {
    const items = getCompletionItems(doc('hello'), at(0, 5))
    expect(items.map((i) => i.label)).toEqual([
      'universe-editor',
      'universe-editor-core',
      'universe-editor-extension',
    ])
    expect(items.map((i) => i.kind)).toEqual([7, 5, 9])
    expect(items[1]?.documentation).toEqual({
      kind: 'markdown',
      value: 'The **core** runtime field.',
    })
  })

  it('前缀以 @ 结尾返回触发项', () => {
    const items = getCompletionItems(doc('hello @'), at(0, 7))
    expect(items.map((i) => i.label)).toEqual([
      '@universe-editor/extension-api',
      '@universe-editor/platform',
      '@universe-editor/workbench-ui',
    ])
    expect(items.map((i) => i.kind)).toEqual([9, 9, 9])
  })

  it('@ 在行中非结尾时仍返回常规项', () => {
    expect(getCompletionItems(doc('@ hello'), at(0, 7))[0]?.label).toBe('universe-editor')
  })

  it('空行返回常规项', () => {
    expect(getCompletionItems(doc(''), at(0, 0)).length).toBe(3)
  })

  it('多行文档按 position.line 选行', () => {
    const items = getCompletionItems(doc('first\nsecond@'), at(1, 7))
    expect(items[0]?.label).toBe('@universe-editor/extension-api')
  })

  it('prefix 由 position.character 截取', () => {
    // 'abc@xyz' 中 position 落在 @ 之后：prefix 'abc@' 以 @ 结尾 → 触发项
    const items = getCompletionItems(doc('abc@xyz'), at(0, 4))
    expect(items[0]?.label).toBe('@universe-editor/extension-api')
    // position 落在 @ 之前：prefix 'abc' → 常规项
    expect(getCompletionItems(doc('abc@xyz'), at(0, 3))[0]?.label).toBe('universe-editor')
  })
})
