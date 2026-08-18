import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('color-theme')

const THEME_SETTINGS_ID = 'color-theme-sample-dark'
const SIDEBAR_BACKGROUND = '#102030'

function cssVar(page, name) {
  return page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  )
}

test.describe('@p1 color-theme', () => {
  test('contributed color theme is registered and applied to the workbench chrome', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()
    await workbench.waitForBootstrapFocusSettled()

    // Apply by settingsId. The theme service resolves it against the registry and,
    // on an unknown id, silently falls back to the built-in default — so the chrome
    // recoloring below is what proves the scan actually registered the theme.
    await page.evaluate((id) => {
      window.__E2E__!.updateConfigValue('workbench.colorTheme', id)
    }, THEME_SETTINGS_ID)

    await expect
      .poll(() => cssVar(page, '--vscode-sideBar-background'), { timeout: 20000 })
      .toBe(SIDEBAR_BACKGROUND)

    await expect
      .poll(() =>
        page.evaluate(() => window.__E2E__!.getConfigurationValue('workbench.colorTheme')),
      )
      .toBe(THEME_SETTINGS_ID)
  })
})
