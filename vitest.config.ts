import { defineConfig } from 'vitest/config'

// 聚合所有带单元测试的 sample 项目；每个项目目录内都有各自的 vitest.config.ts。
// 显式列出目录（而非 glob samples/*）：没有 vitest.config.ts 的目录会回退到
// 本配置的默认 include，把 e2e/*.spec.ts（Playwright spec）误当单测。
// 新增带单测的 sample 时在此追加一行。
export default defineConfig({
  test: {
    projects: [
      'samples/code-actions',
      'samples/codelens',
      'samples/completions',
      'samples/custom-editor',
      'samples/decorator',
      'samples/diagnostic-related-information',
      'samples/mcp-server',
      'samples/semantic-tokens',
      'samples/source-control',
      'samples/timeline-provider',
      'samples/tree-view',
      'samples/webview-panel',
    ],
  },
})
