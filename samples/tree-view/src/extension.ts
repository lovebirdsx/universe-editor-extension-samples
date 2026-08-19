import {
  EventEmitter,
  TreeItem,
  TreeItemCollapsibleState,
  commands,
  window,
  type ExtensionContext,
  type TreeDataProvider,
} from '@universe-editor/extension-api'

const VIEW_ID = 'tree-view.dependencies'

interface Dependency {
  readonly name: string
  readonly version: string
  readonly children?: readonly Dependency[]
}

const tree: readonly Dependency[] = [
  {
    name: 'Dependencies',
    version: '',
    children: [
      { name: 'react', version: '19.0.0' },
      { name: 'lodash', version: '4.17.21' },
    ],
  },
  {
    name: 'Dev Dependencies',
    version: '',
    children: [
      { name: 'typescript', version: '5.8.0' },
      { name: 'esbuild', version: '0.25.0' },
    ],
  },
]

export class DependencyProvider implements TreeDataProvider<Dependency> {
  private readonly _onDidChangeTreeData = new EventEmitter<Dependency | undefined | void>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: Dependency): TreeItem {
    const isRoot = element.children !== undefined
    const item = new TreeItem(
      element.name,
      isRoot ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
    )
    if (isRoot) {
      item.iconPath = 'folder'
    } else {
      item.iconPath = 'package'
      item.description = element.version
      item.command = {
        command: 'tree-view.openDependency',
        title: 'Open Dependency',
        arguments: [element.name],
      }
    }
    return item
  }

  getChildren(element?: Dependency): Dependency[] {
    if (!element) return [...tree]
    return [...(element.children ?? [])]
  }
}

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Tree View')
  const provider = new DependencyProvider()

  context.subscriptions.push(
    output,
    window.registerTreeDataProvider(VIEW_ID, provider),
    commands.registerCommand('tree-view.refreshEntry', () => provider.refresh()),
    commands.registerCommand('tree-view.openDependency', (name: unknown) => {
      output.appendLine(`Opening dependency ${String(name)}`)
    }),
  )
}

export function deactivate(): void {}
