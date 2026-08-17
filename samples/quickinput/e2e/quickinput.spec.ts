import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('quickinput')

test.describe('@p1 quickinput', () => {
  test('runs the two-step quick pick + input box flow and writes the result', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // The contributed command must be registered before direct execution reaches
    // the extension's handler (host booted + manifest scanned).
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('quickinput.run')), {
        timeout: 15000,
      })
      .toBe(true)

    // The command blocks on two steps of user input, so fire-and-forget and drive
    // the quick-input UI from the DOM.
    await page.evaluate(() => {
      void window.__E2E__!.runCommand('quickinput.run')
    })

    // Step 1: the quick pick. Select the "Alpha" option.
    await workbench.quickInput.waitForVisible()
    await workbench.quickInput.dialog.getByRole('option', { name: /Alpha/ }).click()

    // Step 2: the input box (its field carries this sample's placeholder, not the
    // pick panel's, so the locator disambiguates the two panels).
    const nameInput = page.getByPlaceholder('Enter a name')
    await expect(nameInput).toBeVisible()
    await nameInput.fill('my-name')
    await nameInput.press('Enter')

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Quick Input')), {
        timeout: 20000,
      })
      .toContain('picked=Alpha name=my-name')
  })
})
