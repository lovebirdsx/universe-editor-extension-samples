import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('decorator')

const SEED = 'HIGHLIGHT first line\nplain middle line\nHIGHLIGHT third line'

test.describe('@p1 decorator', () => {
  test('toggle command decorates matching lines and then clears them', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    const dir = mkdtempSync(join(tmpdir(), 'ues-decorator-'))
    const filePath = join(dir, 'sample.txt')
    writeFileSync(filePath, SEED, 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()

    const uri = await page.evaluate(() => window.__E2E__!.getActiveEditorUri())
    expect(typeof uri).toBe('string')

    const decorated = () =>
      page.evaluate(
        (u) =>
          window
            .__E2E__!.getEditorDecorations(u)
            .then((ds) => ds.filter((d) => d.className?.startsWith('ext-deco'))),
        uri,
      )

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('decorator.toggleHighlight')), {
        timeout: 15000,
      })
      .toBe(true)

    // First invocation activates the extension (onCommand:) and decorates. Run it
    // once, retrying only through the cold-start window, then poll decorations
    // separately — setDecorations is fire-and-forget across the RPC boundary.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('decorator.toggleHighlight'))
          return true
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
          return false
        }
      })
      .toBe(true)

    await expect.poll(async () => (await decorated()).length).toBe(2)
    const lines = await decorated()
    expect(lines.map((d) => d.startLineNumber).sort()).toEqual([1, 3])

    // Second invocation clears (empty range array).
    await page.evaluate(() => window.__E2E__!.runCommand('decorator.toggleHighlight'))
    await expect.poll(async () => (await decorated()).length).toBe(0)
  })
})
