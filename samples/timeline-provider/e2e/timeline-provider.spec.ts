import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('timeline-provider')

test.describe('@p1 timeline-provider', () => {
  test('contributes timeline items for a file and runs its context menu command', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // The provider registers on onStartupFinished; poll until the host has booted
    // and the timeline service sees it.
    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.hasCommand('timeline-provider.inspectItem')),
        {
          timeout: 15000,
        },
      )
      .toBe(true)

    const dir = mkdtempSync(join(tmpdir(), 'ues-timeline-'))
    const filePath = join(dir, 'abc.txt')
    writeFileSync(filePath, '', 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()

    const uri = await page.evaluate(() => window.__E2E__!.getActiveEditorUri())
    expect(typeof uri).toBe('string')

    // The toy provider emits one item per character of the file name.
    const items = async () =>
      page.evaluate(
        (u) =>
          window
            .__E2E__!.getTimelineItems(u)
            .then((all) => all.filter((it) => it.contextValue === 'sample-timeline:event')),
        uri,
      )

    await expect.poll(async () => (await items()).length, { timeout: 20000 }).toBe(7)

    const timelineItems = await items()
    expect(timelineItems[0].label).toBe("Character 1: 'a'")
    expect(timelineItems[1].label).toBe("Character 2: 'b'")
    expect(timelineItems[2].label).toBe("Character 3: 'c'")
    expect(timelineItems[0].contextValue).toBe('sample-timeline:event')

    // Run the timeline/item/context command; it writes the item label to the
    // extension's output channel.
    await page.evaluate(() =>
      window.__E2E__!.runCommand('timeline-provider.inspectItem', { label: "Character 1: 'a'" }),
    )
    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Timeline Provider')),
        {
          timeout: 15000,
        },
      )
      .toContain("Inspected: Character 1: 'a'")
  })

  test('refresh command fires onDidChange so the view reloads', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('timeline-provider.refresh')), {
        timeout: 15000,
      })
      .toBe(true)

    await page.evaluate(() => window.__E2E__!.runCommand('timeline-provider.refresh'))
    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Timeline Provider')),
        {
          timeout: 15000,
        },
      )
      .toContain('Timeline refreshed.')
  })
})
