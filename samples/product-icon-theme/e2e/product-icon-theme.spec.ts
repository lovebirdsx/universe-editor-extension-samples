import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('product-icon-theme')

const THEME_SETTINGS_ID = 'product-icon-theme-sample'

test.describe('@p1 product-icon-theme', () => {
  test('contributed product icon theme is registered and applied to the workbench', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()
    await workbench.waitForBootstrapFocusSettled()

    // Built-in default codicons have an empty theme id.
    await expect.poll(() => page.evaluate(() => window.__E2E__!.getProductIconThemeId())).toBe('')

    // Apply by settingsId with a re-apply toggle. Under load the extension scan can
    // land after waitForRestored, so a single apply may be silently ignored (the
    // settingsId is not yet registered) while the config value is already written and
    // never changes again. Flip the value away from the target and back each poll so
    // every iteration re-triggers the apply until the registration has landed. The
    // active id is the registered id (`<publisher>.<name>-<contribution.id>`), so it
    // matches by suffix rather than the raw settingsId.
    await expect
      .poll(
        () =>
          page.evaluate((id) => {
            window.__E2E__!.updateConfigValue('workbench.productIconTheme', '')
            window.__E2E__!.updateConfigValue('workbench.productIconTheme', id)
            return window.__E2E__!.getProductIconThemeId()
          }, THEME_SETTINGS_ID),
        { timeout: 30000 },
      )
      .toMatch(/-product-icon-theme-sample$/)

    await expect
      .poll(() =>
        page.evaluate(() => window.__E2E__!.getConfigurationValue('workbench.productIconTheme')),
      )
      .toBe(THEME_SETTINGS_ID)

    // The injected stylesheet carries the overridden glyph rules and the font
    // served through the universe-app resource protocol.
    const css = async () =>
      page.evaluate(
        () => document.querySelector('style.contributedProductIconTheme')?.textContent ?? '',
      )

    await expect.poll(css, { timeout: 20000 }).toContain('.codicon-search:before')

    const text = await css()
    expect(text).toContain('pi-sample-product-icons')
    expect(text).toContain('universe-app://root/_resource_')
  })
})
