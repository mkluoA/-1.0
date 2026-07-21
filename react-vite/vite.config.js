import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/* ── 百度 OCR 代理（内嵌到 Vite dev server）── */
const API_KEY = 'AsTcVZyF0YH31KXZbT0lgAlr'
const SECRET_KEY = 'wuIXm0GSXMjnFCmQ6FeC71SaHLcQQo8s'
let accessToken = ''
let tokenExpiry = 0

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`
  const res = await fetch(url, { method: 'POST' })
  const data = await res.json()
  if (data.access_token) {
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return accessToken
  }
  throw new Error('获取 token 失败: ' + JSON.stringify(data))
}

function ocrProxyPlugin() {
  return {
    name: 'ocr-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ocr', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const token = await getAccessToken()
            const { image } = JSON.parse(body)
            const params = new URLSearchParams()
            params.append('image', image)
            params.append('language_type', 'CHN_ENG')
            params.append('detect_direction', 'true')
            params.append('paragraph', 'true')
            const ocrRes = await fetch(
              `https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token=${token}`,
              { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
            )
            const data = await ocrRes.json()
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify(data))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
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
