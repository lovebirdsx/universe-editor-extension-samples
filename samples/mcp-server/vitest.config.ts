import { defineConfig } from 'vitest/config'

// mcp-server 的单测是黑盒进程测试（test/server.test.mjs，纯 .mjs，无 TS）。
// 不放 server/ 下：package.json 的 files 白名单含 server/，会随 VSIX 发布。
export default defineConfig({
  test: { include: ['test/**/*.test.mjs'] },
})
