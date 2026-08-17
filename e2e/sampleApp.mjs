/*---------------------------------------------------------------------------------------------
 *  sampleApp.mjs — cold-launch fixture factory for one sample's e2e.
 *
 *  Each spec calls makeSampleTest('<dirName>') to get a `test`/`expect` pair
 *  whose `test` cold-launches the packaged editor with ONLY that sample loaded
 *  off disk (junction into an isolated user-extensions dir), mirroring VSCode's
 *  `--extensionDevelopmentPath`: no vsix pack, no install, no host relaunch race.
 *--------------------------------------------------------------------------------------------*/

import { createColdAppTest, resolveEditorBuild, expect } from './harness.mjs'
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

  const { appRoot, mainEntry } = resolveEditorBuild()

  // Isolated user-extensions dir holding a single junction → this sample. A
  // junction (dir symlink) works on Windows + CI Linux alike; the type arg is
  // ignored off Windows. Scanning follows it and reads the real dist/ in place.
  const userExtensionsDir = mkdtempSync(join(tmpdir(), `ues-${sampleName}-`))
  symlinkSync(sampleDir, join(userExtensionsDir, sampleName), 'junction')

  const test = createColdAppTest({
    appRoot,
    mainEntry,
    extensions: [],
    env: { UNIVERSE_USER_EXTENSIONS_DIR: userExtensionsDir },
  })

  return { test, expect }
}
