import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('semantic-tokens')

const SEED = 'fn greet\nCONSTANT VALUE'

test.describe('@p1 semantic-tokens', () => {
  test('registers a semantic tokens provider and produces tokens', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    const dir = mkdtempSync(join(tmpdir(), 'ues-semtok-'))
    const filePath = join(dir, 'sample.txt')
    writeFileSync(filePath, SEED, 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()

    const uri = await page.evaluate(() => window.__E2E__!.getActiveEditorUri())
    expect(typeof uri).toBe('string')

    // The extension activates on onLanguage:plaintext, registering the provider
    // during the first open; poll through the activation window.
    const debug = () => page.evaluate((u) => window.__E2E__!.getSemanticTokenDebug(u, 1, 4), uri)
    await expect
      .poll(async () => (await debug()).providerCount, { timeout: 20000 })
      .toBeGreaterThan(0)

    const info = await debug()
    expect(info.providerCount).toBeGreaterThan(0)
    expect(info.directTokenCount).toBeGreaterThan(0)
    expect(info.legend?.tokenTypes).toContain('keyword')
    expect(info.legend?.tokenTypes).toContain('function')
  })
})
