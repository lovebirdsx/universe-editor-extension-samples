import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('code-actions')

const BAD_WORD = 'foo_bad'
const GOOD_WORD = 'foo_good'

test.describe('@p1 code-actions', () => {
  test('flags the bad word and offers an edit-based quickfix', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    // Seed a temp .txt containing the bad word, and open it (onLanguage:plaintext
    // activates the extension, which refreshes diagnostics for open documents).
    const dir = mkdtempSync(join(tmpdir(), 'ues-codeactions-'))
    const filePath = join(dir, 'sample.txt')
    writeFileSync(filePath, `${BAD_WORD} on the first line\n`, 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()
    const uri = (await page.evaluate(() => window.__E2E__!.getActiveEditorUri())) as string

    // A Warning diagnostic (Monaco severity 4) covers the bad word.
    await expect
      .poll(() => page.evaluate((u) => window.__E2E__!.getMarkers(u, 'code-actions-sample'), uri), {
        timeout: 20000,
      })
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({ severity: 4, message: expect.stringContaining(BAD_WORD) }),
        ]),
      )

    // Requesting code actions over the bad word (line 1, cols 1..8) returns an
    // edit-based quickfix titled after the replacement.
    await expect
      .poll(
        () =>
          page.evaluate(
            (u) =>
              window.__E2E__!.getCodeActions(u, {
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 1,
                endColumn: 8,
              }),
            uri,
          ),
        { timeout: 20000 },
      )
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: expect.stringContaining(GOOD_WORD), hasEdit: true }),
        ]),
      )
  })
})
