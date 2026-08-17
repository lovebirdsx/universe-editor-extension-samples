import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('progress')

test.describe('@p1 progress', () => {
  test('startTask runs to completion and writes done', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('progress.startTask')), {
        timeout: 15000,
      })
      .toBe(true)

    // runCommand awaits the whole ~1.5s task, so a successful run already wrote
    // 'done'. Retry only through the cold-start activation window.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('progress.startTask'))
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
        }
        return page.evaluate(() => window.__E2E__!.getOutputChannelContent('Progress'))
      })
      .toContain('done')
  })

  test('cancelTask cancels a running task and writes cancelled', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('progress.cancelTask')), {
        timeout: 15000,
      })
      .toBe(true)

    // Warm up: the no-op cancel command activates the extension (registering both
    // handlers) so the fire-and-forget start below can't hit the cold-start race.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('progress.cancelTask'))
          return true
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
          return false
        }
      })
      .toBe(true)

    // Start the long task; it only ends when cancelled, so fire-and-forget it.
    await page.evaluate(() => {
      void window.__E2E__!.runCommand('progress.startTask')
    })

    // Wait for the task to begin (its 'started' marker lands), then cancel it.
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Progress')), {
        timeout: 15000,
      })
      .toContain('started')

    await page.evaluate(() => window.__E2E__!.runCommand('progress.cancelTask'))

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Progress')), {
        timeout: 10000,
      })
      .toContain('cancelled')
  })
})
