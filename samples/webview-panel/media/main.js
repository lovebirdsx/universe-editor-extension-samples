const vscode = acquireVsCodeApi()

const button = document.getElementById('notify')
if (button) {
  button.addEventListener('click', () => {
    vscode.postMessage({ type: 'notify' })
  })
}

window.addEventListener('message', (event) => {
  const message = event.data
  if (message && message.type === 'update') {
    const counter = document.getElementById('counter')
    if (counter) {
      counter.textContent = String(message.count)
    }
  }
})
