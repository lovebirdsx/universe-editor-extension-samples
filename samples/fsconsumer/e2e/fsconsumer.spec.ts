import { makeSampleTest } from '../../../e2e/sampleApp.mjs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const { test, expect } = makeSampleTest('fsconsumer')

const CONTENT = 'hello from workspace.fs'

test.describe('@p1 fsconsumer', () => {
  test('creates, reads, copies, renames and deletes files via workspace.fs', async ({
    page,
    workbench,
  }) => {
    test.slow()
    await workbench.waitForRestored()

    // The gated fs only touches the open workspace folder, so open one first.
    const dir = mkdtempSync(join(tmpdir(), 'ues-fsconsumer-'))
    await page.evaluate((p) => window.__E2E__!.openWorkspace(p), dir)
    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.getCurrentWorkspacePath()), {
        timeout: 10000,
      })
      .toBe(dir.replace(/\\/g, '/'))

    await expect
      .poll(() => page.evaluate(() => window.__E2E__!.hasCommand('fsconsumer.run')), {
        timeout: 15000,
      })
      .toBe(true)

    // First invocation activates the extension (onCommand:); retry only through
    // the cold-start window, then poll the output channel separately — the command
    // is not idempotent, so re-running it past a real execution would fail on the
    // already-existing directory.
    await expect
      .poll(async () => {
        try {
          await page.evaluate(() => window.__E2E__!.runCommand('fsconsumer.run'))
          return true
        } catch (err) {
          if (!/extension host may only execute/.test(String(err))) throw err
          return false
        }
      })
      .toBe(true)

    const output = () => page.evaluate(() => window.__E2E__!.getOutputChannelContent('FS Consumer'))
    await expect.poll(output, { timeout: 20000 }).toContain(`read fs-sample/hello.txt: ${CONTENT}`)
    await expect
      .poll(output, { timeout: 20000 })
      .toContain('stat fs-sample/hello.txt: size=23 type=file')
    await expect
      .poll(output, { timeout: 20000 })
      .toContain('readDirectory fs-sample: copy.txt, hello.txt')
    await expect.poll(output, { timeout: 20000 }).toContain('readDirectory fs-sample: renamed.txt')

    // Cross-check the real on-disk result through the editor's IFileService.
    const sampleUri = pathToFileURL(join(dir, 'fs-sample')).toString()
    const renamedUri = pathToFileURL(join(dir, 'fs-sample', 'renamed.txt')).toString()

    await expect
      .poll(() => page.evaluate((u) => window.__E2E__!.readFileText(u), renamedUri), {
        timeout: 20000,
      })
      .toBe(CONTENT)

    await expect
      .poll(() => page.evaluate((u) => window.__E2E__!.listResource(u), sampleUri), {
        timeout: 20000,
      })
      .toEqual(['renamed.txt'])

    await expect
      .poll(() => page.evaluate((u) => window.__E2E__!.statResource(u), renamedUri), {
        timeout: 20000,
      })
      .toMatchObject({ isFile: true, size: CONTENT.length })
  })
})
