import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('statusbar')

test.describe('@p1 statusbar', () => {
  test('toggle command creates a status bar item and updates its text', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('statusbar.toggle')), {
        timeout: 15000,
      })
      .toBe(true)

    // First invocation activates the extension (onCommand:) and creates the item.
    // Run it exactly once, retrying only through the cold-start window, then poll
    // the observable separately — the command is stateful (increments a counter),
    // so re-running it inside the poll would advance the count past the assertion.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('statusbar.toggle'))
          return true
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
          return false
        }
      })
      .toBe(true)

    await expect
      .poll(() =>
        page.evaluate(() =>
          window.__E2E__!.getStatusBarEntries().some((e) => e.text.includes('Toggled 1 time')),
        ),
      )
      .toBe(true)

    // Second invocation updates the text in place (same item).
    await page.evaluate(() => window.__E2E__!.runCommand('statusbar.toggle'))
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.__E2E__!.getStatusBarEntries().some((e) => e.text.includes('Toggled 2 time')),
        ),
      )
      .toBe(true)
  })
})
