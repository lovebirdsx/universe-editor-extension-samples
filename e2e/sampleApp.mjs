/*---------------------------------------------------------------------------------------------
 *  sampleApp.mjs — cold-launch fixture factory for one sample's e2e.
 *
 *  Each spec calls makeSampleTest('<dirName>') to get a `test`/`expect` pair
 *  whose `test` cold-launches the editor with ONLY that sample loaded off disk
 *  (junction into an isolated user-extensions dir), mirroring VSCode's
 *  `--extensionDevelopmentPath`: no vsix pack, no install, no host relaunch race.
 *
 *  The editor binary comes from the harness's resolveEditorLaunchTarget (env
 *  driven), so this repo stays independent of any universe-editor checkout.
 *--------------------------------------------------------------------------------------------*/

import { createColdAppTest, resolveEditorLaunchTarget, expect } from '@universe-editor/e2e-harness'
import { existsSync, mkdtempSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const samplesRoot = resolve(__dirname, '..', 'samples')

export function makeSampleTest(sampleName) {
  const sampleDir = resolve(samplesRoot, sampleName)
  if (!existsSync(join(sampleDir, 'package.json'))) {
    throw new Error(`makeSampleTest: no package.json in ${sampleDir}`)
  }

  const target = resolveEditorLaunchTarget()

  // Isolated user-extensions dir holding a single junction → this sample. A
  // junction (dir symlink) works on Windows + CI Linux alike; the type arg is
  // ignored off Windows. Scanning follows it and reads the real dist/ in place.
  const userExtensionsDir = mkdtempSync(join(tmpdir(), `ues-${sampleName}-`))
  symlinkSync(sampleDir, join(userExtensionsDir, sampleName), 'junction')

  const test = createColdAppTest({
    ...target,
    extensions: [],
    env: { UNIVERSE_USER_EXTENSIONS_DIR: userExtensionsDir },
  })

  return { test, expect }
}
