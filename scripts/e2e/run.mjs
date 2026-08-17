#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  run.mjs — run this samples repo's Playwright e2e against a local universe-editor.
 *
 *  The samples repo is self-contained: @universe-editor/e2e-harness and
 *  @universe-editor/e2e-contract are ordinary npm deps, and @playwright/test is a
 *  root devDependency, so the whole tree shares ONE physical Playwright. This
 *  runner is the thin seam left after that:
 *
 *    1. Resolve Playwright's CLI from THIS repo (createRequire) — the same
 *       physical @playwright/test the harness dist resolves to (Playwright
 *       breaks if two copies load).
 *    2. Strip ELECTRON_RUN_AS_NODE (Claude Code's shell injects it, degrading
 *       Electron to plain Node which rejects Chromium flags).
 *    3. Build each tested sample (node esbuild.config.mjs) so the suite never
 *       runs a stale bundle.
 *    4. Run Playwright; positional args select samples (samples/<name>, <name>).
 *
 *  The editor to launch is resolved inside each worker by the harness
 *  (resolveEditorLaunchTarget reads UNIVERSE_EDITOR_BIN from env), so this runner
 *  neither parses nor intercepts that env — it is passed through verbatim.
 *--------------------------------------------------------------------------------------------*/

import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const samplesRoot = resolve(__dirname, '../..')

// Positional args name the samples to run (samples/<name>, <name>, or a spec path).
const sampleNames = process.argv.slice(2).map((arg) => {
  let a = arg.replace(/\\/g, '/')
  if (a.startsWith('samples/')) a = a.slice('samples/'.length)
  return a.split('/')[0]
})

const { ELECTRON_RUN_AS_NODE: _ignored, ...inheritedEnv } = process.env

if (inheritedEnv['UNIVERSE_EDITOR_BIN']) {
  console.log(`run: UNIVERSE_EDITOR_BIN=${inheritedEnv['UNIVERSE_EDITOR_BIN']}`)
} else {
  console.log(
    'run: UNIVERSE_EDITOR_BIN unset — harness will auto-detect (win32 installed build, then in-repo dev build)',
  )
}

// Single physical @playwright/test: resolve from THIS repo, the same tree the
// harness dist resolves its @playwright/test from.
const require = createRequire(import.meta.url)
const playwrightCli = require.resolve('@playwright/test/cli')

function run(command, args, opts = {}) {
  const res = spawnSync(command, args, { stdio: 'inherit', ...opts })
  if (res.error) throw res.error
  return res.status ?? 1
}

// Build each tested sample so the suite loads a fresh dist/.
for (const name of sampleNames) {
  const sampleDir = resolve(samplesRoot, 'samples', name)
  const config = resolve(sampleDir, 'esbuild.config.mjs')
  if (!existsSync(config)) {
    console.error(`run: no esbuild.config.mjs in samples/${name}`)
    process.exit(1)
  }
  const status = run(process.execPath, [config], { env: inheritedEnv, cwd: sampleDir })
  if (status !== 0) {
    console.error(`run: build failed for samples/${name}`)
    process.exit(status)
  }
}

// Run Playwright. Positional filters match against paths RELATIVE to the
// config's testDir (../samples), so each filter is the sample name anchored
// to its e2e dir (regex-escaped): testMatch '**/e2e/*.spec.ts' then selects
// every spec under that sample.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const config = resolve(samplesRoot, 'e2e/playwright.config.ts')
const filters = sampleNames.map((n) => `${escapeRe(n)}/e2e`)
const status = run(process.execPath, [playwrightCli, 'test', '-c', config, ...filters], {
  env: { ...inheritedEnv, PLAYWRIGHT_FORCE_TTY: '0' },
  cwd: samplesRoot,
})
process.exit(status)
