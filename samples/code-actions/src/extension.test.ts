import { describe, expect, it } from 'vitest'
import { findBadWordRanges, offsetToPosition, overlaps } from './extension.js'

const range = (sl: number, sc: number, el: number, ec: number) => ({
  start: { line: sl, character: sc },
  end: { line: el, character: ec },
})

describe('offsetToPosition', () => {
  it('offset 0 映射到行首', () => {
    expect(offsetToPosition('abc', 0)).toEqual({ line: 0, character: 0 })
  })

  it('行内偏移映射到正确的 character', () => {
    expect(offsetToPosition('abc', 3)).toEqual({ line: 0, character: 3 })
  })

  it('换行后的偏移映射到下一行', () => {
    expect(offsetToPosition('a\nbc', 2)).toEqual({ line: 1, character: 0 })
    expect(offsetToPosition('a\nbc', 3)).toEqual({ line: 1, character: 1 })
  })
})

describe('findBadWordRanges', () => {
  it('无匹配返回空数组', () => {
    expect(findBadWordRanges('')).toEqual([])
    expect(findBadWordRanges('foo_good')).toEqual([])
  })

  it('单个出现定位正确', () => {
    expect(findBadWordRanges('foo_bad')).toEqual([range(0, 0, 0, 7)])
  })

  it('多个出现依次定位', () => {
    expect(findBadWordRanges('a foo_bad b foo_bad')).toEqual([
      range(0, 2, 0, 9),
      range(0, 12, 0, 19),
    ])
  })

  it('indexOf 语义：子串形式也命中', () => {
    expect(findBadWordRanges('xfoo_badx')).toEqual([range(0, 1, 0, 8)])
  })
})

describe('overlaps', () => {
  it('完全分离的两个 range 不重叠', () => {
    expect(overlaps(range(0, 0, 0, 1), range(0, 2, 0, 3))).toBe(false)
  })

  it('相同的 range 重叠', () => {
    expect(overlaps(range(0, 0, 0, 1), range(0, 0, 0, 1))).toBe(true)
  })

  it('首尾相接不视为重叠（<= 语义）', () => {
    expect(overlaps(range(0, 0, 0, 1), range(0, 1, 0, 2))).toBe(false)
  })

  it('包含关系重叠', () => {
    expect(overlaps(range(0, 0, 0, 5), range(0, 1, 0, 2))).toBe(true)
  })

  it('交错关系重叠', () => {
    expect(overlaps(range(0, 1, 0, 3), range(0, 2, 0, 4))).toBe(true)
  })

  it('跨行 range 比较', () => {
    expect(overlaps(range(0, 0, 1, 0), range(0, 0, 0, 1))).toBe(true)
    expect(overlaps(range(0, 0, 0, 1), range(1, 0, 1, 1))).toBe(false)
  })
})
