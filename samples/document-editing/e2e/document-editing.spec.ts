import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('document-editing')

const SEED = 'first\nsecond'
const INSERTED_LINE = 'Inserted by Document Editing\n'
const AFTER_INSERT = INSERTED_LINE + SEED

test.describe('@p1 document-editing', () => {
  test('inserts a line at the cursor and reports line/char counts', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    // Seed a temp .txt and open it as the active editor.
    const dir = mkdtempSync(join(tmpdir(), 'ues-docedit-'))
    const filePath = join(dir, 'sample.txt')
    writeFileSync(filePath, SEED, 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()

    // Seed the active editor text (cursor resets to the top line).
    await page.evaluate((text) => window.__E2E__!.setActiveEditorText(text), SEED)

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('document-editing.insertLine')), {
        timeout: 15000,
      })
      .toBe(true)

    // Command A: insert a line at the cursor. The first invocation activates the
    // extension (onCommand:), so swallow the host's transient rejection until the
    // real handler is registered.
    await expect
      .poll(
        async () => {
          try {
            await page.evaluate(() => window.__E2E__!.runCommand('document-editing.insertLine'))
          } catch (err) {
            if (!/extension host may only execute/.test(String(err))) throw err
          }
          return page.evaluate(() => window.__E2E__!.getActiveEditorText())
        },
        { timeout: 20000 },
      )
      .toBe(AFTER_INSERT)

    // Command B: count lines/chars and report via output channel + notification.
    const expected = `lines: ${AFTER_INSERT.split('\n').length}, chars: ${AFTER_INSERT.length}`
    await page.evaluate(() => window.__E2E__!.runCommand('document-editing.count'))
    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Document Editing')),
        { timeout: 20000 },
      )
      .toContain(expected)
  })
})
