import { describe, expect, it } from 'vitest'
import { encode, parseText } from './extension.js'

describe('parseText', () => {
  it('单行单 token', () => {
    expect(parseText('FOO')).toEqual([
      { line: 0, startCharacter: 0, length: 3, tokenType: 0, tokenModifiers: 0 },
    ])
  })

  it('多行文本各行 token 行号正确', () => {
    expect(parseText('FOO\nBAR')).toEqual([
      { line: 0, startCharacter: 0, length: 3, tokenType: 0, tokenModifiers: 0 },
      { line: 1, startCharacter: 0, length: 3, tokenType: 0, tokenModifiers: 0 },
    ])
  })

  it('fn 声明 token 定位在函数名处', () => {
    expect(parseText('fn greet')).toEqual([
      { line: 0, startCharacter: 3, length: 5, tokenType: 1, tokenModifiers: 1 },
    ])
  })

  it('同行的 keyword 与 function token 按位置排序', () => {
    // keyword 循环先产出 BAR@3、FOO@7，function 循环补 BAR@3（fn 声明）；
    // 稳定排序按 (line, startCharacter) 升序，同位时保持 keyword 在前的插入顺序。
    expect(parseText('fn BAR FOO')).toEqual([
      { line: 0, startCharacter: 3, length: 3, tokenType: 0, tokenModifiers: 0 },
      { line: 0, startCharacter: 3, length: 3, tokenType: 1, tokenModifiers: 1 },
      { line: 0, startCharacter: 7, length: 3, tokenType: 0, tokenModifiers: 0 },
    ])
  })

  it('SNAKE_CASE 常量整体命中一个 token', () => {
    expect(parseText('SNAKE_CASE_NAME')).toEqual([
      { line: 0, startCharacter: 0, length: 15, tokenType: 0, tokenModifiers: 0 },
    ])
  })

  it('小写标识符不命中', () => {
    expect(parseText('foo BAR baz')).toEqual([
      { line: 0, startCharacter: 4, length: 3, tokenType: 0, tokenModifiers: 0 },
    ])
  })

  it('空串返回空数组', () => {
    expect(parseText('')).toEqual([])
  })
})

describe('encode', () => {
  it('单 token 编码为绝对坐标五元组', () => {
    expect(encode(parseText('FOO'))).toEqual([0, 0, 3, 0, 0])
  })

  it('同行第二个 token 的 startCharacter 是相对前一个的增量', () => {
    expect(encode(parseText('FOO BAR'))).toEqual([0, 0, 3, 0, 0, 0, 4, 3, 0, 0])
  })

  it('跨行 token 的 deltaLine 递增且 startCharacter 为绝对值', () => {
    expect(encode(parseText('FOO\nBAR'))).toEqual([0, 0, 3, 0, 0, 1, 0, 3, 0, 0])
  })

  it('空 token 列表编码为空数组', () => {
    expect(encode([])).toEqual([])
  })
})
