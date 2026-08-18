import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { test, expect } = makeSampleTest('source-control')

const COMMIT_MESSAGE = 'sample commit message'

test.describe('@p1 source-control', () => {
  test('creates a source control with groups, resources and a commit flow', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // The SCM provider is bound to the open workspace folder, so open one first.
    const dir = mkdtempSync(join(tmpdir(), 'ues-source-control-'))
    await page.evaluate((p) => window.__E2E__!.openWorkspace(p), dir)
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getCurrentWorkspacePath()), {
        timeout: 10000,
      })
      .toBe(dir.replace(/\\/g, '/'))

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('sourceControl.activate')), {
        timeout: 15000,
      })
      .toBe(true)

    // First invocation activates the extension (onCommand:) and creates the
    // provider + groups + resources. Run it once, retrying only through the
    // cold-start window — the command is guarded idempotent, but a second real
    // execution would still be a no-op, so re-running only risks the race.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('sourceControl.activate'))
          return true
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
          return false
        }
      })
      .toBe(true)

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getScmSourceControlCount()), {
        timeout: 20000,
      })
      .toBeGreaterThanOrEqual(1)

    // Both non-empty groups are visible, in registration order.
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getVisibleScmGroupIds()), {
        timeout: 20000,
      })
      .toEqual(['staged', 'changes'])

    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.getScmGroupIdsForResource('sample-staged.txt')),
        {
          timeout: 20000,
        },
      )
      .toContain('staged')

    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.getScmGroupIdsForResource('sample-changed.txt')),
        {
          timeout: 20000,
        },
      )
      .toContain('changes')

    const output = () =>
      page.evaluate(() => window.__E2E__!.getOutputChannelContent('Source Control'))
    await expect.poll(output, { timeout: 20000 }).toContain('activated: count=3')

    // No probe writes the SCM input box, so the extension sets its own value to
    // simulate the user typing a commit message.
    await page.evaluate(() => window.__E2E__!.runCommand('sourceControl.setInputBox'))
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getScmInputBoxValue()), { timeout: 20000 })
      .toBe(COMMIT_MESSAGE)

    // Run the accept-input (commit) command and assert the commit flow: message
    // captured, input cleared, resources + count cleared.
    await page.evaluate(() => window.__E2E__!.runCommand('sourceControl.commit'))
    await expect.poll(output, { timeout: 20000 }).toContain(`commit: ${COMMIT_MESSAGE}`)
    await expect.poll(output, { timeout: 20000 }).toContain('committed: count=0')
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getScmInputBoxValue()), { timeout: 20000 })
      .toBe('')
    await expect
      .poll(
        () => page.evaluate(() => window.__E2E__!.getScmGroupIdsForResource('sample-changed.txt')),
        {
          timeout: 20000,
        },
      )
      .toEqual([])
    // The emptied `staged` group hides (hideWhenEmpty) while `changes` (no flag)
    // stays visible even when empty.
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getVisibleScmGroupIds()), { timeout: 20000 })
      .toEqual(['changes'])
  })
})
