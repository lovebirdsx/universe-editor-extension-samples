import { defineConfig } from 'vitest/config'

// include 显式限定 src/**/*.test.ts，避免默认 include 抓到 e2e/*.spec.ts。
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
})
