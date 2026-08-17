import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('notifications')

test.describe('@p1 notifications', () => {
  test('shows info, warning and error notifications', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('notifications.showAll')), {
        timeout: 15000,
      })
      .toBe(true)

    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('notifications.showAll'))
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
        }
        return page.evaluate(() => {
          const ns = window.__E2E__!.getNotifications()
          const match = (m: string, s: 'info' | 'warning' | 'error') =>
            ns.some((n) => n.message === m && n.severity === s)
          return (
            match('Information message', 'info') &&
            match('Warning message', 'warning') &&
            match('Error message', 'error')
          )
        })
      })
      .toBe(true)
  })

  test('buttoned notification resolves the clicked button to the output channel', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // Activate the extension first via the idempotent showAll command, so the
    // modal command below can't hit the "extension host may only execute" race.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('notifications.showAll'))
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
        }
        return page.evaluate(() => window.__E2E__!.getNotifications().length)
      })
      .toBeGreaterThan(0)

    // The modal command blocks on the user's choice, so fire-and-forget it.
    await page.evaluate(() => {
      void window.__E2E__!.runCommand('notifications.showWithActions')
    })

    // A buttoned showInformationMessage renders as a modal confirm dialog
    // (role=dialog, data-renderer-dialog), not a toast with actions — click its
    // primary button directly.
    const dialog = page.locator('[data-renderer-dialog]')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Confirm' }).click()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Notifications')), {
        timeout: 10000,
      })
      .toContain('chose Confirm')
  })
})
