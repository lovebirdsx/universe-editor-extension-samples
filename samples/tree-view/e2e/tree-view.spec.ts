import { makeSampleTest } from '../../../e2e/sampleApp.mjs'

const { test, expect } = makeSampleTest('tree-view')

const CONTAINER_ID = 'tree-view.explorer'
const VIEW_ID = 'tree-view.dependencies'

test.describe('@p1 tree-view', () => {
  test('contributes a view container and renders a two-level tree', async ({ page, workbench }) => {
    test.slow()
    await workbench.waitForRestored()

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getViewContainerIdsByLocation(0)), {
        timeout: 15000,
      })
      .toContain(CONTAINER_ID)

    await expect
      .poll(() => page.evaluate((id) => window.__E2E__!.getViewIdsByContainer(id), CONTAINER_ID), {
        timeout: 15000,
      })
      .toContain(VIEW_ID)

    // Reveal the view from the activity bar: mounting it fires the onView
    // activation event that registers the tree data provider.
    const containerItem = page.locator(`[data-testid="activitybar-item-${CONTAINER_ID}"]`)
    await expect(containerItem).toHaveCount(1, { timeout: 15000 })
    await containerItem.click()

    await expect
      .poll(
        () =>
          page.evaluate(
            (id) => window.__E2E__!.getTreeItems(id).then((items) => items.map((i) => i.label)),
            VIEW_ID,
          ),
        { timeout: 20000 },
      )
      .toEqual(['Dependencies', 'Dev Dependencies'])

    await expect
      .poll(
        () =>
          page.evaluate(
            (id) =>
              window
                .__E2E__!.getTreeItems(id)
                .then((items) => items.map((i) => i.collapsibleState)),
            VIEW_ID,
          ),
        { timeout: 20000 },
      )
      .toEqual([1, 1])

    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('tree-view.openDependency', 'react'))
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
        }
        return page.evaluate(() => window.__E2E__!.getOutputChannelContent('Tree View'))
      })
      .toContain('Opening dependency react')
  })
})
