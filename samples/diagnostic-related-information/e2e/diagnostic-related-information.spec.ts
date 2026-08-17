import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('diagnostic-related-information')

const SEED = 'duplicate_id first\nplain middle line\nduplicate_id second'

test.describe('@p1 diagnostic-related-information', () => {
  test('pushes a warning with related information for a duplicate word', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    const dir = mkdtempSync(join(tmpdir(), 'ues-diag-'))
    const filePath = join(dir, 'sample.txt')
    writeFileSync(filePath, SEED, 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()

    const uri = await page.evaluate(() => window.__E2E__!.getActiveEditorUri())
    expect(typeof uri).toBe('string')

    // The extension activates on onLanguage:plaintext and pushes its diagnostic
    // from onDidOpenTextDocument; poll through activation + open.
    const duplicateMarker = async () => {
      const markers = await page.evaluate((u) => window.__E2E__!.getMarkers(u), uri)
      return markers.find((m) => m.message.includes('duplicate_id'))
    }

    await expect
      .poll(async () => (await duplicateMarker()) !== undefined, { timeout: 20000 })
      .toBe(true)

    const marker = await duplicateMarker()
    expect(marker.severity).toBe(4)
    expect(marker.startLineNumber).toBe(3)
    expect(marker.relatedInformation).toBeTruthy()
    expect(marker.relatedInformation.length).toBeGreaterThan(0)
    expect(marker.relatedInformation[0].message).toBe('first declared here')
    // Monaco percent-encodes the drive colon (file:///c%3a/...); decode both
    // sides and fold case so the comparison is about file identity, not encoding.
    expect(decodeURIComponent(marker.relatedInformation[0].uri).toLowerCase()).toBe(
      decodeURIComponent(uri).toLowerCase(),
    )
  })
})
