import { describe, expect, it, vi } from 'vitest'
import { fileUri, getWebviewContent } from './extension.js'

describe('fileUri', () => {
  it('Windows 盘符路径转为带前导斜杠的规范形式', () => {
    expect(fileUri('C:\\x\\y.js')).toEqual({ scheme: 'file', path: '/C:/x/y.js' })
  })

  it('绝对路径保持单前导斜杠', () => {
    expect(fileUri('/x/y.js')).toEqual({ scheme: 'file', path: '/x/y.js' })
  })

  it('相对路径补前导斜杠', () => {
    expect(fileUri('x/y.js')).toEqual({ scheme: 'file', path: '/x/y.js' })
  })

  it('UNC 路径的反斜杠全部转正斜杠', () => {
    expect(fileUri('\\\\server\\share')).toEqual({ scheme: 'file', path: '//server/share' })
  })
})

describe('getWebviewContent', () => {
  const root = '/ext/root'

  function makeFakeWebview() {
    return {
      asWebviewUri: vi.fn((uri: { path?: string }) => `webview:${uri.path ?? ''}`),
      cspSource: 'webview:',
    }
  }

  it('三个 media 资源经 asWebviewUri 重写后嵌入 HTML', () => {
    const webview = makeFakeWebview()
    const html = getWebviewContent(webview, root)
    expect(html).toContain('webview:/ext/root/media/main.js')
    expect(html).toContain('webview:/ext/root/media/main.css')
    expect(html).toContain('webview:/ext/root/media/codicon.css')
    expect(html).toContain('<script src="webview:/ext/root/media/main.js"></script>')
  })

  it('asWebviewUri 恰好调用 3 次且收到 fileUri 结果', () => {
    const webview = makeFakeWebview()
    getWebviewContent(webview, root)
    expect(webview.asWebviewUri).toHaveBeenCalledTimes(3)
    for (const name of ['main.js', 'main.css', 'codicon.css']) {
      expect(webview.asWebviewUri).toHaveBeenCalledWith(fileUri(`${root}/media/${name}`))
    }
  })

  it('CSP 含 cspSource 与 unsafe-inline', () => {
    const html = getWebviewContent(makeFakeWebview(), root)
    expect(html).toContain("style-src 'unsafe-inline' webview:")
    expect(html).toContain("script-src 'unsafe-inline' webview:")
  })
})
