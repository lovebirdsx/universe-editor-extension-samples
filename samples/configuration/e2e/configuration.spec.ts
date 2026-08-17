import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('configuration')

test.describe('@p1 configuration', () => {
  test('reads the contributed default, fires onDidChangeConfiguration, and re-reads the new value', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // 1) The contributed default is visible through the probe.
    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.getConfigurationValue('configuration.greeting')),
        { timeout: 15000 },
      )
      .toBe('Hello')

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('configuration.read')), {
        timeout: 15000,
      })
      .toBe(true)

    // 2) Command A reads the current value into the output channel. The first
    // invocation activates the extension (onCommand:), so swallow the host's
    // transient "extension host may only execute" rejection until the real handler
    // is registered.
    await expect
      .poll(
        async () => {
          try {
            await page.evaluate(() => window.__E2E__!.runCommand('configuration.read'))
          } catch (err) {
            if (!/extension host may only execute/.test(String(err))) throw err
          }
          return page.evaluate(() => window.__E2E__!.getOutputChannelContent('Configuration'))
        },
        { timeout: 20000 },
      )
      .toContain('[read] configuration.greeting = Hello')

    // 3) Changing the value fires onDidChangeConfiguration in the extension.
    await page.evaluate(() => window.__E2E__!.updateConfigValue('configuration.greeting', 'Hi'))
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Configuration')), {
        timeout: 20000,
      })
      .toContain('[change] configuration.greeting = Hi')

    // 4) Command A now reports the new value.
    await page.evaluate(() => window.__E2E__!.runCommand('configuration.read'))
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getOutputChannelContent('Configuration')), {
        timeout: 20000,
      })
      .toContain('[read] configuration.greeting = Hi')
  })
})
