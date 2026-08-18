import { commands, extensions, window, type ExtensionContext } from '@universe-editor/extension-api'

type LocalizedManifest = {
  displayName: string
  description: string
  contributes: { commands: { title: string }[] }
}

export function activate(context: ExtensionContext): void {
  const output = window.createOutputChannel('L10n Sample')
  context.subscriptions.push(
    output,
    commands.registerCommand('l10n.showLocalizedManifest', () => {
      const manifest = extensions.getExtension('universe-samples.l10n')!
        .packageJSON as unknown as LocalizedManifest
      output.appendLine(`displayName = ${manifest.displayName}`)
      output.appendLine(`description = ${manifest.description}`)
      output.appendLine(`command.title = ${manifest.contributes.commands[0]!.title}`)
    }),
  )
}

export function deactivate(): void {}
