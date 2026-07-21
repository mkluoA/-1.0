import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fork } from 'child_process'

/* ── 百度 OCR 代理（Vite 启动时自动启动）── */
function ocrProxyPlugin() {
  return {
    name: 'ocr-proxy',
    configureServer() {
      const child = fork(path.resolve(__dirname, 'server/ocr-proxy.js'), [], {
        stdio: 'pipe',
      })
      child.stdout?.on('data', (d) => process.stdout.write(`[OCR] ${d}`))
      child.stderr?.on('data', (d) => process.stderr.write(`[OCR ERR] ${d}`))
      process.on('exit', () => child.kill())
      console.log('[OCR Proxy] Auto-started on port 3001')
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ocrProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
