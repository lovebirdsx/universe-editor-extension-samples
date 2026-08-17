#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  check-sdk-drift.mjs — keep every sample's SDK wiring pinned to sdk-versions.json.
 *
 *  For each samples/<name>/package.json it asserts:
 *    - engines.universe matches the canonical range derived from extensionApi
 *      (">=<api> <1.0.0" — the host's semver negotiation rejects `^0.x` and `||`),
 *    - the @universe-editor/* devDeps (extension-api / uex) and the toolchain
 *      devDeps (esbuild / typescript / @types/node) match sdk-versions.json.
 *
 *  With UNIVERSE_EDITOR_REPO set it additionally cross-checks sdk-versions.json
 *  against the main repo's packages/create-extension/src/sdkVersions.ts, so a
 *  bumped SDK that never landed here fails loudly.
 *--------------------------------------------------------------------------------------------*/

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

const sdkVersions = JSON.parse(readFileSync(join(repoRoot, 'sdk-versions.json'), 'utf8'))

// sdk-versions.json key → { devDependency name, sdkVersions.ts key }.
const DEPS = {
  extensionApi: { dep: '@universe-editor/extension-api', tsKey: 'extensionApi' },
  uex: { dep: '@universe-editor/uex', tsKey: 'uex' },
  esbuild: { dep: 'esbuild', tsKey: 'esbuild' },
  typescript: { dep: 'typescript', tsKey: 'typescript' },
  nodeTypes: { dep: '@types/node', tsKey: 'nodeTypes' },
}

const stripCaret = (v) => (v.startsWith('^') ? v.slice(1) : v)
const enginesUniverse = `>=${stripCaret(sdkVersions.extensionApi)} <1.0.0`

const issues = []

function samples() {
  const dir = join(repoRoot, 'samples')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

for (const name of samples()) {
  const pkgPath = join(repoRoot, 'samples', name, 'package.json')
  let pkg
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  } catch (err) {
    issues.push(`samples/${name}: cannot read package.json — ${err.message}`)
    continue
  }

  if (pkg.engines?.universe !== enginesUniverse) {
    issues.push(
      `samples/${name}: engines.universe is "${pkg.engines?.universe}" — expected "${enginesUniverse}"`,
    )
  }

  const devDeps = pkg.devDependencies ?? {}
  for (const [key, { dep }] of Object.entries(DEPS)) {
    const actual = devDeps[dep]
    const expected = sdkVersions[key]
    if (actual !== expected) {
      issues.push(
        `samples/${name}: devDependency "${dep}" is ${actual === undefined ? 'missing' : `"${actual}"`} — expected "${expected}"`,
      )
    }
  }
}

// Optional cross-check against the main repo's SDK_VERSIONS.
const editorRepo = process.env.UNIVERSE_EDITOR_REPO
if (editorRepo) {
  const sdkVersionsTs = resolve(editorRepo, 'packages/create-extension/src/sdkVersions.ts')
  if (!existsSync(sdkVersionsTs)) {
    issues.push(`UNIVERSE_EDITOR_REPO: sdkVersions.ts not found at ${sdkVersionsTs}`)
  } else {
    const src = readFileSync(sdkVersionsTs, 'utf8')
    const block = src.slice(src.indexOf('SDK_VERSIONS'))
    const tsValues = {}
    for (const m of block.matchAll(/(\w+):\s*'([^']+)'/g)) tsValues[m[1]] = m[2]

    const expectedTs = {
      extensionApi: stripCaret(sdkVersions.extensionApi),
      uex: stripCaret(sdkVersions.uex),
      esbuild: sdkVersions.esbuild,
      typescript: sdkVersions.typescript,
      nodeTypes: sdkVersions.nodeTypes,
    }
    for (const [key, { tsKey }] of Object.entries(DEPS)) {
      if (tsValues[tsKey] !== expectedTs[key]) {
        issues.push(
          `sdk-versions.json "${key}" (${expectedTs[key]}) drifts from sdkVersions.ts "${tsKey}" (${tsValues[tsKey]})`,
        )
      }
    }
  }
}

if (issues.length > 0) {
  console.error('sdk drift:')
  for (const issue of issues) console.error(`  - ${issue}`)
  process.exit(1)
}

console.log('sdk drift check passed')
