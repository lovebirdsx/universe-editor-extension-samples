import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('helloworld')

test.describe('@p1 helloworld', () => {
  test('activates, registers its command and writes to its output channel', async ({
    page,
    workbench,
  }) => {
    // Cold extension host + activation on first command; give it room.
    test.slow()
    await workbench.waitForRestored()

    // The contributed command must be registered (host booted + manifest scanned)
    // before direct execution can reach the extension's handler.
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('helloworld.helloWorld')), {
        timeout: 15000,
      })
      .toBe(true)

    // Run the command; the first invocation activates the extension (onCommand:),
    // so poll through the cold-start window. Playwright's poll does not retry on
    // a thrown callback, so swallow the "extension host may only execute" rejection
    // the renderer emits until the host has registered the real handler.
    await expect
      .poll(
        async () => {
          try {
            await page.evaluate(() => window.__E2E__!.runCommand('helloworld.helloWorld'))
          } catch (err) {
            if (!/extension host may only execute/.test(String(err))) throw err
          }
          return page.evaluate(() => window.__E2E__!.getOutputChannelContent('Hello World'))
        },
        { timeout: 20000 },
      )
      .toContain('Hello from Hello World!')
  })
})
