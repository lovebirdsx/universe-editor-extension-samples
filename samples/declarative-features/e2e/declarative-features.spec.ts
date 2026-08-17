import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('declarative-features')

test.describe('@p1 declarative-features', () => {
  test('jsonValidation flags a bad *.sample-config.json against its schema', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    const dir = mkdtempSync(join(tmpdir(), 'ues-decl-'))
    const filePath = join(dir, 'bad.sample-config.json')
    // Missing required "name" and "version" is a string, not a number.
    writeFileSync(filePath, '{ "version": "not-a-number" }\n', 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()

    const uri = await page.evaluate(() => window.__E2E__!.getActiveEditorUri())
    expect(typeof uri).toBe('string')

    const markers = async () => page.evaluate((u) => window.__E2E__!.getMarkers(u), uri)

    await expect.poll(async () => (await markers()).length, { timeout: 20000 }).toBeGreaterThan(0)

    const all = await markers()
    expect(all.some((m) => m.message.includes('Missing property "name"'))).toBe(true)
    expect(all.some((m) => m.message.includes('Incorrect type'))).toBe(true)
  })

  test('grammar takes over the sample-log language id it self-registers', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()
    await workbench.waitForBootstrapFocusSettled()

    const dir = mkdtempSync(join(tmpdir(), 'ues-decl-'))
    const filePath = join(dir, 'sample.slog')
    writeFileSync(filePath, 'ERROR boom\nWARN warn\nINFO info\n', 'utf8')
    await page.evaluate((p) => window.__E2E__!.openFileUri(p), filePath)
    await expect(workbench.editor.monacoEditor).toBeVisible()

    // The grammar self-registers the sample-log language id, but this editor has
    // no contributes.languages, so .slog is not auto-associated: switch the open
    // model's language to sample-log to make the tokenization factory resolve.
    await page.evaluate(() => {
      void window.__E2E__!.runCommand('workbench.action.editor.changeLanguageMode')
    })
    await workbench.quickInput.waitForVisible()
    await page.keyboard.type('sample-log')
    await page.keyboard.press('Enter')
    await workbench.quickInput.waitForHidden()

    await expect
      .poll(
        () =>
          page
            .evaluate((lang) => window.__E2E__!.getTokenizationSupportInfo(lang), 'sample-log')
            .then((info) => info?.constructorName),
        { timeout: 30000 },
      )
      .toBe('TokenizationSupportWithLineLimit')
  })

  test('icon theme is registered', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(
        () =>
          page.evaluate(() =>
            window
              .__E2E__!.getRegisteredFileIconThemeIds()
              .some((id) => id.endsWith('-sample-log-icons')),
          ),
        { timeout: 15000 },
      )
      .toBe(true)
  })
})
