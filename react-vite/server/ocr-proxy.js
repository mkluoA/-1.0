/**
 * 百度 OCR 代理服务
 * 解决浏览器 CORS 限制 + 管理 access_token
 */
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '20mb' }))

const API_KEY = 'AsTcVZyF0YH31KXZbT0lgAlr'
const SECRET_KEY = 'wuIXm0GSXMjnFCmQ6FeC71SaHLcQQo8s'

let accessToken = ''
let tokenExpiry = 0

/* 获取百度 access_token */
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`
  const res = await fetch(url, { method: 'POST' })
  const data = await res.json()

  if (data.access_token) {
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    console.log('[OCR] Token refreshed, expires in', data.expires_in, 's')
    return accessToken
  } else {
    throw new Error('获取 access_token 失败: ' + JSON.stringify(data))
  }
}

/* OCR 代理接口 */
app.post('/api/ocr', async (req, res) => {
  try {
    const token = await getAccessToken()
    const { image } = req.body // base64 image

    // 百度通用文字识别（含位置）API
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token=${token}`
    const params = new URLSearchParams()
    params.append('image', image)
    params.append('language_type', 'CHN_ENG')
    params.append('detect_direction', 'true')
    params.append('paragraph', 'true')

    const ocrRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await ocrRes.json()

    if (data.error_code) {
      console.error('[OCR] Baidu error:', data.error_code, data.error_msg)
      return res.status(400).json({ error: data.error_msg })
    }

    res.json(data)
  } catch (e) {
    console.error('[OCR] Proxy error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

const PORT = 3001
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[OCR Proxy] Running on http://127.0.0.1:${PORT}`)
})
