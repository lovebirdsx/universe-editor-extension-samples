import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('completions')

test.describe('@p1 completions', () => {
  test('provides plain-text completions and @-triggered completions', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // Seed a temp .txt and open it as the active editor (activates onLanguage:plaintext).
    const dir = mkdtempSync(join(tmpdir(), 'ues-completions-'))
    const filePath = join(dir, 'sample.txt')
    writeFileSync(filePath, '', 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()
    const uri = (await page.evaluate(() => window.__E2E__!.getActiveEditorUri())) as string

    // Normal completions: with "hello" in the buffer, probing the end of the
    // line (line 1, col 6) returns the fixed word list.
    await page.evaluate(() => window.__E2E__!.setActiveEditorText('hello'))
    await expect
      .poll(() => page.evaluate((u) => window.__E2E__!.getCompletions(u, 1, 6), uri), {
        timeout: 20000,
      })
      .toEqual(expect.arrayContaining(['universe-editor']))

    // Trigger-character completions: after "@" (line 1, col 2) the provider
    // returns the special candidate set.
    await page.evaluate(() => window.__E2E__!.setActiveEditorText('@'))
    await expect
      .poll(() => page.evaluate((u) => window.__E2E__!.getCompletions(u, 1, 2), uri), {
        timeout: 20000,
      })
      .toEqual(expect.arrayContaining(['@universe-editor/extension-api']))
  })
})
