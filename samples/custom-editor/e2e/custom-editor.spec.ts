import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('custom-editor')

const MARKER = 'HEX-MARKER-42'

test.describe('@p1 custom-editor', () => {
  test('opens a .hexview file in its read-only custom editor', async ({ page, workbench }) => {
    test.slow()
    const dir = mkdtempSync(join(tmpdir(), 'ues-custom-editor-'))
    const filePath = join(dir, 'sample.hexview')
    writeFileSync(filePath, MARKER, 'utf8')

    await workbench.waitForRestored()

    await expect
      .poll(
        async () => {
          await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
          return page.evaluate(() => window.__E2E__!.getActiveEditorTypeId())
        },
        { timeout: 15000 },
      )
      .toBe('customEditor')

    // The custom editor rendered the file content as a hex dump; the ASCII
    // column preserves the printable marker text.
    const frame = page.frameLocator('[data-testid="webview-frame"]')
    await expect(frame.locator('body')).toContainText(MARKER, { timeout: 15000 })
  })
})
