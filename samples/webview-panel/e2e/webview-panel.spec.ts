import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('webview-panel')

test.describe('@p1 webview-panel', () => {
  test('opens a panel and exchanges messages with its webview', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('webview-panel.show')), {
        timeout: 15000,
      })
      .toBe(true)

    // First invocation activates the extension (onCommand:) and creates the panel.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('webview-panel.show'))
          return true
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
          return false
        }
      })
      .toBe(true)

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getActiveEditorTypeId()), {
        timeout: 15000,
      })
      .toBe('webviewPanel')

    const frame = page.frameLocator('[data-testid="webview-frame"]')
    await expect(frame.locator('h1')).toHaveText('Webview Panel', { timeout: 15000 })

    // Click the button in the webview: the page posts a message back, the
    // extension writes it to its output channel.
    await frame.locator('#notify').click()
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Webview Panel')), {
        timeout: 15000,
      })
      .toContain('Received notify from webview')

    // Close the panel so its renderer-side model is disposed before the teardown
    // leak gate runs.
    await page.evaluate(() => window.__E2E__!.runCommand('webview-panel.dispose'))
  })
})
