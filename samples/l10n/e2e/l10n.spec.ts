import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('l10n')

test.describe('@p1 l10n', () => {
  test('localizes %key% manifest placeholders via package.nls.json', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // The contributed command must be registered (host booted + manifest scanned)
    // before direct execution can reach the extension's handler.
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('l10n.showLocalizedManifest')), {
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
            await page.evaluate(() => window.__E2E__!.runCommand('l10n.showLocalizedManifest'))
          } catch (err) {
            if (!/extension host may only execute/.test(String(err))) throw err
          }
          return page.evaluate(() => window.__E2E__!.getOutputChannelContent('L10n Sample'))
        },
        { timeout: 20000 },
      )
      .toContain('displayName = Localization Sample')

    const content = await page.evaluate(() =>
      window.__E2E__!.getOutputChannelContent('L10n Sample'),
    )
    expect(content).toContain(
      'description = Demonstrates manifest localization through package.nls.json.',
    )
    expect(content).toContain('command.title = L10n: Show Localized Manifest')
    expect(content).not.toContain('%')
  })
})
