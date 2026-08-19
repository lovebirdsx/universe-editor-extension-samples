import { TreeItemCollapsibleState } from '@universe-editor/extension-api'
import { describe, expect, it, vi } from 'vitest'
import { DependencyProvider } from './extension.js'

describe('DependencyProvider', () => {
  const provider = new DependencyProvider()

  describe('getChildren', () => {
    it('无元素时返回两个根节点', () => {
      const roots = provider.getChildren()
      expect(roots.map((r) => r.name)).toEqual(['Dependencies', 'Dev Dependencies'])
      expect(roots[0]?.children).toHaveLength(2)
      expect(roots[1]?.children).toHaveLength(2)
    })

    it('返回值为拷贝：修改结果不影响后续调用', () => {
      const roots = provider.getChildren()
      roots.push({ name: 'intruder', version: '0.0.0' })
      expect(provider.getChildren()).toHaveLength(2)
    })

    it('根节点的子节点为叶子依赖', () => {
      const roots = provider.getChildren()
      expect(provider.getChildren(roots[0])).toEqual([
        { name: 'react', version: '19.0.0' },
        { name: 'lodash', version: '4.17.21' },
      ])
    })

    it('叶子节点无子节点', () => {
      const leaf = provider.getChildren(provider.getChildren()[0])[0]!
      expect(provider.getChildren(leaf)).toEqual([])
    })
  })

  describe('getTreeItem', () => {
    it('根节点可折叠且图标为 folder', () => {
      const root = provider.getChildren()[0]!
      const item = provider.getTreeItem(root)
      expect(item.label).toBe('Dependencies')
      expect(item.collapsibleState).toBe(TreeItemCollapsibleState.Collapsed)
      expect(item.iconPath).toBe('folder')
      expect(item.description).toBeUndefined()
      expect(item.command).toBeUndefined()
    })

    it('叶子节点不可折叠且携带版本与打开命令', () => {
      const leaf = provider.getChildren(provider.getChildren()[0])[0]!
      const item = provider.getTreeItem(leaf)
      expect(item.label).toBe('react')
      expect(item.collapsibleState).toBe(TreeItemCollapsibleState.None)
      expect(item.iconPath).toBe('package')
      expect(item.description).toBe('19.0.0')
      expect(item.command).toEqual({
        command: 'tree-view.openDependency',
        title: 'Open Dependency',
        arguments: ['react'],
      })
    })
  })

  it('refresh 经 onDidChangeTreeData 触发一次变更事件', () => {
    const fired = vi.fn()
    provider.onDidChangeTreeData(fired)
    provider.refresh()
    expect(fired).toHaveBeenCalledTimes(1)
  })
})
