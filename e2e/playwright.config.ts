import { defineE2EConfig } from '@universe-editor/e2e-harness'

// Shared knobs (timeout / retries / workers / reporter / trace-on-failure) +
// tag filtering come from the harness factory, so behaviour matches the core +
// built-in extension suites. Tests live one dir per sample under ../samples,
// matched by '**/e2e/*.spec.ts' (the factory doesn't expose testMatch, so it's
// layered on top of the shared config).
const config = defineE2EConfig({ testDir: '../samples' })

export default {
  ...config,
  testMatch: '**/e2e/*.spec.ts',
}
