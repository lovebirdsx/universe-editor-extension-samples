import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('codelens')

const SEED = 'TODO: fix this\nplain line'

test.describe('@p1 codelens', () => {
  test('resolves a CodeLens for a TODO line and runs its command', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    // Seed a temp .txt whose first line starts with the marker, and open it.
    const dir = mkdtempSync(join(tmpdir(), 'ues-codelens-'))
    const filePath = join(dir, 'sample.txt')
    writeFileSync(filePath, SEED, 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()
    const uri = (await page.evaluate(() => window.__E2E__!.getActiveEditorUri())) as string

    // A lens is provided for line 1 and resolves to this extension's command.
    await expect
      .poll(() => page.evaluate((u) => window.__E2E__!.getCodeLensDebug(u, 1), uri), {
        timeout: 20000,
      })
      .toEqual(
        expect.objectContaining({
          lensCount: 1,
          resolvedCommandId: 'codelens.showMessage',
        }),
      )

    // Running the resolved command writes to the output channel.
    await page.evaluate(() => window.__E2E__!.runCommand('codelens.showMessage'))
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('CodeLens Sample')), {
        timeout: 20000,
      })
      .toContain('CodeLens action')
  })
})
