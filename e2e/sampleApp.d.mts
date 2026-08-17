/*---------------------------------------------------------------------------------------------
 *  Type surface for e2e/sampleApp.mjs + the `window.__E2E__` probe.
 *
 *  The real probe contract is @universe-editor/e2e-contract (private, inside the
 *  main repo) and the fixture types are @playwright/test — neither is resolvable
 *  from this out-of-workspace repo. Samples therefore declare only the surface
 *  their specs use: `test`/`expect` are typed loosely (the runtime objects come
 *  from the harness), and `window.__E2E__` is a minimal structural subset so
 *  `page.evaluate(() => window.__E2E__!.hasCommand(...))` type-checks.
 *--------------------------------------------------------------------------------------------*/

export interface SampleE2EStatusBarEntry {
  readonly id: string
  readonly text: string
  readonly alignment: 'left' | 'right'
  readonly icon?: string
  readonly tooltip?: string
  readonly entryId?: string
}

export interface SampleE2EMarkerRelatedInformation {
  readonly message: string
  readonly uri: string
}

export interface SampleE2EMarker {
  readonly message: string
  /** Monaco MarkerSeverity: 8 Error, 4 Warning, 2 Info, 1 Hint. */
  readonly severity: number
  readonly startLineNumber: number
  readonly relatedInformation?: readonly SampleE2EMarkerRelatedInformation[]
}

export interface SampleE2ENotification {
  readonly message: string
  readonly severity: 'info' | 'warning' | 'error'
  readonly actions: readonly string[]
}

export interface SampleE2ECodeAction {
  readonly title: string
  readonly kind?: string
  readonly hasEdit: boolean
}

export interface SampleE2EEditorDecoration {
  readonly startLineNumber: number
  readonly startColumn: number
  readonly endLineNumber: number
  readonly endColumn: number
  readonly className?: string
  readonly description?: string
}

export interface SampleE2ETreeItem {
  readonly label: string
  readonly collapsibleState: 0 | 1 | 2
}

export interface SampleE2ETimelineItem {
  readonly label: string
  readonly timestamp?: number
  readonly contextValue?: string
}

export interface SampleE2EContributedMcpServer {
  readonly name: string
  readonly command: string
}

export interface SampleE2ECodeLensDebug {
  error?: string
  providerCount?: number
  lensCount?: number
  resolvedCommandId?: string
}

export interface SampleE2ESemanticTokenDebug {
  error?: string
  providerCount?: number
  legend?: { tokenTypes: readonly string[]; tokenModifiers: readonly string[] }
  directTokenCount?: number
}

export interface SampleE2EProbe {
  whenReady(): Promise<void>
  whenRestored(): Promise<void>
  getLifecyclePhase(): string
  hasCommand(id: string): boolean
  runCommand<T = unknown>(id: string, ...args: unknown[]): Promise<T | undefined>
  getContextKey<T = unknown>(key: string): T | undefined
  getActiveEditorUri(): string | undefined
  getActiveEditorTypeId(): string
  openFileUri(uri: string): Promise<unknown>
  getOutputChannelContent(name: string): string
  createOutputChannel(name: string): void
  appendToOutputChannel(name: string, text: string): void
  setActiveOutputChannel(name: string): void
  getStatusBarEntries(): SampleE2EStatusBarEntry[]
  getNotifications(): SampleE2ENotification[]
  getConfigurationValue(key: string): unknown
  updateConfigValue(key: string, value: unknown): void
  getActiveEditorText(): string | undefined
  setActiveEditorText(text: string): boolean
  getMarkers(uri: string, owner?: string): Promise<readonly SampleE2EMarker[]>
  getCompletions(uri: string, lineNumber: number, column: number): Promise<readonly string[]>
  getCodeActions(
    uri: string,
    range: {
      startLineNumber: number
      startColumn: number
      endLineNumber: number
      endColumn: number
    },
  ): Promise<readonly SampleE2ECodeAction[]>
  getEditorDecorations(uri: string): Promise<readonly SampleE2EEditorDecoration[]>
  getCodeLensDebug(uri: string, lineNumber: number): Promise<SampleE2ECodeLensDebug>
  getSemanticTokenDebug(
    uri: string,
    lineNumber: number,
    column: number,
  ): Promise<SampleE2ESemanticTokenDebug>
  getTreeItems(viewId: string): Promise<readonly SampleE2ETreeItem[]>
  getTimelineItems(uri: string): Promise<readonly SampleE2ETimelineItem[]>
  getContributedMcpServers(): readonly SampleE2EContributedMcpServer[]
  getViewContainerIdsByLocation(location: number): readonly string[]
  getViewIdsByContainer(containerId: string): readonly string[]
  getTokenizationSupportInfo(languageId: string): Promise<{ constructorName: string } | null>
  getRegisteredFileIconThemeIds(): string[]
  getProductIconThemeId(): string
}

export interface SampleTest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly test: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly expect: any
}

export function makeSampleTest(sampleName: string): SampleTest

declare global {
  interface Window {
    __E2E__?: SampleE2EProbe
  }
}
