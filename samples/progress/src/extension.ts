import {
  CancellationTokenSource,
  ProgressLocation,
  commands,
  window,
  type ExtensionContext,
} from '@universe-editor/extension-api'

let currentTask: CancellationTokenSource | undefined

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('Progress')

  context.subscriptions.push(
    output,
    commands.registerCommand('progress.startTask', async () => {
      const source = new CancellationTokenSource()
      currentTask = source
      output.appendLine('started')
      try {
        await window.withProgress(
          {
            location: ProgressLocation.Notification,
            title: 'Long running task',
            cancellable: true,
          },
          async (progress, token) => {
            const sub = token.onCancellationRequested(() => source.cancel())
            try {
              for (let i = 1; i <= 10; i++) {
                if (source.token.isCancellationRequested) {
                  output.appendLine('cancelled')
                  return
                }
                progress.report({ increment: 10, message: `Step ${i}/10` })
                await delay(150)
              }
              output.appendLine('done')
            } finally {
              sub.dispose()
            }
          },
        )
      } finally {
        if (currentTask === source) currentTask = undefined
      }
    }),
    commands.registerCommand('progress.cancelTask', () => {
      currentTask?.cancel()
    }),
  )
}

export function deactivate(): void {
  currentTask?.cancel()
}
