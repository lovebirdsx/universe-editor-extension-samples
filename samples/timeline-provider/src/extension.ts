import {
  commands,
  window,
  workspace,
  type CancellationToken,
  type Disposable,
  type Event,
  type ExtensionContext,
  type Timeline,
  type TimelineChangeEvent,
  type TimelineItem,
  type TimelineOptions,
  type TimelineProvider,
} from '@universe-editor/extension-api'
import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const CONTEXT_VALUE = 'sample-timeline:event'

class SampleTimelineProvider implements TimelineProvider {
  readonly id = 'sample-timeline'
  readonly label = 'Sample Timeline'

  private readonly _listeners = new Set<(e: TimelineChangeEvent) => void>()
  readonly onDidChange: Event<TimelineChangeEvent> = (listener) => {
    this._listeners.add(listener)
    return { dispose: () => this._listeners.delete(listener) }
  }

  fireChange(): void {
    for (const listener of this._listeners) listener({ reset: true })
  }

  provideTimeline(
    uri: string,
    _options: TimelineOptions,
    _token: CancellationToken,
  ): Timeline | undefined {
    const name = basename(fileURLToPath(uri))
    const chars = [...name]
    const now = Date.now()
    const items: TimelineItem[] = chars.map((ch, i) => ({
      id: `ch-${i}`,
      label: `Character ${i + 1}: '${ch}'`,
      description: `from ${name}`,
      timestamp: now - (chars.length - i) * 60_000,
      contextValue: CONTEXT_VALUE,
    }))
    return { items }
  }
}

export function activate(context: ExtensionContext): void {
  const provider = new SampleTimelineProvider()
  const output = window.createOutputChannel('Timeline Provider')

  context.subscriptions.push(
    output,
    workspace.registerTimelineProvider(['file'], provider),
    commands.registerCommand('timeline-provider.refresh', () => {
      provider.fireChange()
      output.appendLine('Timeline refreshed.')
    }),
    commands.registerCommand('timeline-provider.inspectItem', (item: unknown) => {
      const label = (item as { label?: string } | undefined)?.label ?? '(unknown item)'
      output.appendLine(`Inspected: ${label}`)
    }),
  )
}

export function deactivate(): void {}
