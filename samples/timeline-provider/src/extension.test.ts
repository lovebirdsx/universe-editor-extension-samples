import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { SampleTimelineProvider } from './extension.js'

// pathToFileURL 生成与当前平台一致的 file URL（Windows 上无盘符的
// 'file:///tmp/...' 会被 fileURLToPath 拒绝）。
const fileUri = (name: string) => pathToFileURL(join(tmpdir(), name)).toString()

const token = {
  isCancellationRequested: false,
  onCancellationRequested: () => ({ dispose: () => {} }),
}

describe('SampleTimelineProvider', () => {
  it('暴露稳定 id 与展示 label', () => {
    const provider = new SampleTimelineProvider()
    expect(provider.id).toBe('sample-timeline')
    expect(provider.label).toBe('Sample Timeline')
  })

  it('为文件名每个字符生成一个 item', () => {
    const provider = new SampleTimelineProvider()
    const timeline = provider.provideTimeline(fileUri('abc.txt'), {}, token)
    expect(timeline?.items).toHaveLength(7)
    expect(timeline?.items.map((i) => i.label)).toEqual([
      "Character 1: 'a'",
      "Character 2: 'b'",
      "Character 3: 'c'",
      "Character 4: '.'",
      "Character 5: 't'",
      "Character 6: 'x'",
      "Character 7: 't'",
    ])
  })

  it('item 携带稳定 id、递增 60 秒的 timestamp 与文件描述', () => {
    const provider = new SampleTimelineProvider()
    const items = provider.provideTimeline(fileUri('abc.txt'), {}, token)?.items ?? []
    expect(items.map((i) => i.id)).toEqual(['ch-0', 'ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'ch-6'])
    expect(items[0]?.description).toBe('from abc.txt')
    expect(items[0]?.contextValue).toBe('sample-timeline:event')
    for (let i = 1; i < items.length; i++) {
      // 首字符最旧：timestamp 从 now - 7*60s 起逐项 +60s 到 now - 60s
      expect(items[i]!.timestamp - items[i - 1]!.timestamp).toBe(60_000)
    }
  })

  it('单字符文件名生成一个 item', () => {
    const provider = new SampleTimelineProvider()
    expect(provider.provideTimeline(fileUri('a'), {}, token)?.items).toHaveLength(1)
  })

  it('onDidChange 订阅后 fireChange 触发 reset 事件', () => {
    const provider = new SampleTimelineProvider()
    const fired = vi.fn()
    const subscription = provider.onDidChange(fired)
    provider.fireChange()
    expect(fired).toHaveBeenCalledTimes(1)
    expect(fired).toHaveBeenCalledWith({ reset: true })
    subscription.dispose()
  })

  it('dispose 后不再触发', () => {
    const provider = new SampleTimelineProvider()
    const fired = vi.fn()
    provider.onDidChange(fired).dispose()
    provider.fireChange()
    expect(fired).not.toHaveBeenCalled()
  })
})
