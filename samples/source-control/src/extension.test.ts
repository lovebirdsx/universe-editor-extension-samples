import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { changesResourceStates, stagedResourceStates } from './extension.js'

describe('stagedResourceStates', () => {
  const root = join('C:', 'proj')

  it('生成一个 staged 状态', () => {
    const states = stagedResourceStates(root)
    expect(states).toHaveLength(1)
    const state = states[0]!
    expect(state.resourceUri).toBe(join(root, 'sample-staged.txt'))
    expect(state.contextValue).toBe('staged')
    expect(state.decorations).toEqual({
      iconPath: 'diff-added',
      color: '#73c991',
      tooltip: 'Added',
    })
    expect(state.command).toEqual({
      command: 'sourceControl.openResource',
      title: 'Open',
      arguments: [join(root, 'sample-staged.txt')],
    })
  })
})

describe('changesResourceStates', () => {
  const root = join('C:', 'proj')

  it('生成 changed 与 removed 两个状态', () => {
    const states = changesResourceStates(root)
    expect(states).toHaveLength(2)

    const changed = states[0]!
    expect(changed.resourceUri).toBe(join(root, 'sample-changed.txt'))
    expect(changed.contextValue).toBe('changed')
    expect(changed.decorations).toEqual({
      iconPath: 'diff-modified',
      color: '#e2c08d',
      tooltip: 'Modified',
    })
    expect(changed.command?.arguments).toEqual([join(root, 'sample-changed.txt')])

    const removed = states[1]!
    expect(removed.resourceUri).toBe(join(root, 'sample-removed.txt'))
    expect(removed.contextValue).toBe('removed')
    expect(removed.decorations).toEqual({
      iconPath: 'diff-removed',
      color: '#c74e39',
      tooltip: 'Deleted',
      strikeThrough: true,
      faded: true,
    })
    expect(removed.command?.arguments).toEqual([join(root, 'sample-removed.txt')])
  })
})
