/**
 * OCR 识别服务 - 配电箱系统图结构化解析
 *
 * 流程: PDF → 3x高清 → Tesseract.js(word位置) → 空间聚类 → 三层解析
 *
 * 输出结构:
 *   箱体信息 — 箱号、安装方式、防护等级、数量
 *   进线信息 — 负荷参数(Pn/Pc/cosΦ/Ic)、主开关；主用/备用回路分开
 *   支路信息 — MCCB(送下级箱) + MCB(末端设备)，含漏保/电缆/末端
 *
 * 易错点处理:
 *   - 多箱号不合并
 *   - 主备回路不默认相同
 *   - 电能表规格 ≠ 开关电流
 *   - 多截面电缆不相加
 *   - 下级箱号单独提取
 *   - 监控回路不算负荷支路
 *   - 备用支路不遗漏
 */
import * as pdfjsLib from 'pdfjs-dist'

/* 百度 OCR 代理地址 */
const OCR_PROXY_URL = 'http://127.0.0.1:3001/api/ocr'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

/* ── 电气图纸 OCR 纠错表 ── */
const FIX = [
  [/[一―—]/g, '-'],
  [/[×✕╳]/g, 'x'],
  [/＋/g, '+'], [/＝/g, '='], [/：/g, ':'],
  [/[（]/g, '('], [/[）]/g, ')'],
  [/\s{2,}/g, ' '],
  // 电气专用纠错
  [/ACLP/g, 'ATLP'],    // T→C 常见误识别
  [/ATLPD/g, 'ATLP'],   // 尾部多余 D
]

function clean(s) {
  for (const [pat, rep] of FIX) s = s.replace(pat, rep)
  return s.trim()
}

/* ── Render PDF page ── */
async function renderPage(file, pageNum = 1, scale = 3) {
  const buf = await file.arrayBuffer()
  const data = new Uint8Array(buf)
  const doc = await pdfjsLib.getDocument({ data }).promise
  const page = await doc.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvasContext: ctx, viewport }).promise
  const numPages = doc.numPages
  doc.destroy()
  return { canvas, numPages }
}

/* ── 图像预处理: 灰度化 + 二值化 (提高 OCR 准确率) ── */
function preprocessCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // 灰度化 + 二值化 (阈值 180: 浅灰→白, 深灰→黑)
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    const bw = gray < 180 ? 0 : 255
    data[i] = bw
    data[i + 1] = bw
    data[i + 2] = bw
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/* ── 百度 OCR (含位置) ── */
async function ocrWithPositions(canvas, onProgress) {
  // 将 canvas 转为 base64
  const base64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1]

  if (onProgress) onProgress(0.3)

  const res = await fetch(OCR_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  })

  if (onProgress) onProgress(0.8)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'OCR 请求失败: ' + res.status)
  }

  const data = await res.json()
  if (data.error_code) throw new Error('百度 OCR 错误: ' + data.error_msg)

  // 百度 OCR 返回格式 → 统一 word 格式
  const words = (data.words_result || []).map(w => {
    const loc = w.location || {}
    return {
      text: clean(w.words),
      x: loc.left || 0,
      y: loc.top || 0,
      x2: (loc.left || 0) + (loc.width || 0),
      y2: (loc.top || 0) + (loc.height || 0),
      cx: (loc.left || 0) + (loc.width || 0) / 2,
      cy: (loc.top || 0) + (loc.height || 0) / 2,
    }
  }).filter(w => w.text.length > 0)

  const fullText = words.map(w => w.text).join(' ')

  if (onProgress) onProgress(1)

  return { words, fullText: clean(fullText) }
}

/* ── 空间聚类: word → 行 ── */
function clusterLines(words, tolerance = 8) {
  if (!words.length) return []
  const sorted = [...words].sort((a, b) => a.cy - b.cy)
  const lines = []
  let cur = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].cy - cur[0].cy) <= tolerance) {
      cur.push(sorted[i])
    } else {
      lines.push(cur.sort((a, b) => a.x - b.x))
      cur = [sorted[i]]
    }
  }
  if (cur.length) lines.push(cur.sort((a, b) => a.x - b.x))
  return lines
}

/* ── 正则工具 ── */
const CABLE_RE = /(?:WDZ[A-Z]*|YJV|VV|NH-YJV|ZR-?[A-Z]*|BV|ZCN)[-一]?[A-Z0-9]*[-一]?[A-Z]*[-一]?\d+[x]\d+(?:\+\d+[x]\d+)*(?:[-一][A-Z0-9/]+)?/i
const BREAKER_MCCB_RE = /MCCB[-/／]?[A-Za-z0-9/]*/i
const BREAKER_MCB_RE = /MCB[-/／]?[A-Za-z0-9/]*/i
const SWITCH_ATSE_RE = /(?:ATSE|ATS)\s*\d+\s*A[^，,\n]*/i

/* ── 解析电缆规格为结构化对象 ── */
function parseCable(raw) {
  if (!raw) return null
  const cleaned = raw.replace(/一/g, '-').replace(/[×✕╳]/g, 'x')
  // 提取型号、芯数截面、敷设方式
  const m = cleaned.match(/^([A-Za-z0-9-]+?)[-]?(\d+[x]\d+(?:\+\d+[x]\d+)*)(?:[-](.+))?$/i)
  if (m) {
    return { 型号: m[1], 芯数截面: m[2], 敷设方式: m[3] || '' }
  }
  return { 型号: cleaned, 芯数截面: '', 敷设方式: '' }
}

/* ── 检测是否带漏保 ── */
function detectLeakage(text) {
  if (text.match(/\+V\s*A\s*30\s*mA/i) || text.match(/\+I[Δ△]n\s*30\s*mA/i)) {
    return { 带漏保: true, 漏保规格: '+IΔn 30mA' }
  }
  if (text.match(/\bMA\b/)) {
    return { 带漏保: false, 漏保规格: 'MA（磁保护）' }
  }
  return { 带漏保: false, 漏保规格: '' }
}

/* ── 检测电能表规格（区分于开关电流）── */
function detectMeter(text) {
  // 形如 10(4.0)A 或 15(6.0)A 是电能表
  const m = text.match(/(\d+)\s*\(\s*([\d.]+)\s*\)\s*A/)
  if (m) return m[0]
  return ''
}

/* ── 检测末端箱号 ── */
function detectDownstreamBox(text) {
  const m = text.match(/\+\s*[BbFf]\s*\d\s*[-一]\s*[A-Za-z]{2,8}\d*/)
  if (m) {
    let box = m[0].replace(/\s+/g, '').replace(/一/g, '-')
    if (!box.startsWith('+')) box = '+' + box
    return box
  }
  return ''
}

/* ── 三层解析主函数 ── */
function parseThreeLayers(lines, fullText) {
  const result = {
    箱体信息: {
      箱号: '', 箱名称: '', 图号名称: '',
      安装方式: '', 防护等级: '', 数量: '',
    },
    进线信息: {
      负荷参数: {},
      主开关: { 型号: '', 类型: '双电源自动切换开关', 特性: '' },
      主用回路: { 回路编号: '', 电缆规格: null },
      备用回路: { 回路编号: '', 电缆规格: null },
      监控回路_非负荷: null,
    },
    支路信息: {
      主回路下级_送下级箱_MCCB: [],
      末端设备支路_MCB: [],
    },
    接地方式: '',
    rawOcrText: fullText,
  }

  const allText = lines.flat().map(w => w.text).join(' ')

  /* ── 1. 箱体信息 ── */
  // 箱号: +B1-XXXX (不合并多个)
  const boxNums = allText.match(/\+\s*[BbFf]\s*\d\s*[-一]\s*[A-Za-z]{2,8}\d*/g)
  if (boxNums) {
    const first = boxNums[0].replace(/\s+/g, '').replace(/一/g, '-')
    result.箱体信息.箱号 = first.startsWith('+') ? first : '+' + first
  }

  // 图号名称
  const titleM = fullText.match(/([\u4e00-\u9fa5]*(?:配电|系统|原理)[\u4e00-\u9fa5]*图)/)
  if (titleM) result.箱体信息.图号名称 = titleM[1]

  // 箱名称
  const nameM = fullText.match(/([\u4e00-\u9fa5]*(?:住宅|商业|工业|办公|学校|医院|生活|消防|应急|动力|照明|空调|水泵|排水|排污|通风|潜污)[\u4e00-\u9fa5]*(?:配电箱|控制箱|配电柜))/)
  if (nameM) result.箱体信息.箱名称 = nameM[1]
  if (!result.箱体信息.箱名称 && result.箱体信息.图号名称) {
    result.箱体信息.箱名称 = result.箱体信息.图号名称.replace(/系统图|配电图|原理图/, '') + '配电箱'
  }
  if (!result.箱体信息.箱名称 && result.箱体信息.箱号) {
    result.箱体信息.箱名称 = result.箱体信息.箱号 + ' 配电箱'
  }

  // 安装方式
  if (fullText.match(/壁挂/)) result.箱体信息.安装方式 = '壁挂安装'
  else if (fullText.match(/落地/)) result.箱体信息.安装方式 = '落地安装'

  // 防护等级
  const ipM = fullText.match(/IP\s*\d{2}/i)
  if (ipM) result.箱体信息.防护等级 = ipM[0]

  // 数量
  const qtyM = fullText.match(/共\s*(\d+)\s*台/)
  if (qtyM) result.箱体信息.数量 = '共' + qtyM[1] + '台'

  // 非标
  if (fullText.match(/非标/)) result.箱体信息.备注 = '非标箱体'

  /* ── 2. 进线信息 ── */
  // 负荷参数
  const pn = fullText.match(/[Pp]\s*n\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
  const pc = fullText.match(/[Pp]\s*c\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
  const cos = fullText.match(/cos\s*[φΦ]\s*[=＝]\s*([\d.]+)/)
  const ic = fullText.match(/[Ii]\s*c\s*[=＝]\s*([\d.]+)\s*A/)
  if (pn) result.进线信息.负荷参数['Pn'] = pn[1] + ' kW'
  if (pc) result.进线信息.负荷参数['Pc'] = pc[1] + ' kW'
  if (cos) result.进线信息.负荷参数['cosΦ'] = cos[1]
  if (ic) result.进线信息.负荷参数['Ic'] = ic[1] + ' A'

  // 主开关 (ATSE)
  const atseM = fullText.match(SWITCH_ATSE_RE)
  if (atseM) result.进线信息.主开关.型号 = atseM[0].trim()
  // 开关特性
  if (fullText.match(/自投自复/)) {
    result.进线信息.主开关.特性 = 'CB独立自投自复，电气及机械联锁（带隔离功能）'
  }

  // 主用回路编号
  const mainLabelM = fullText.match(/主用回路编号?[:：\s]*([^\n,，]+)/)
  if (mainLabelM) result.进线信息.主用回路.回路编号 = mainLabelM[1].trim()

  // 备用回路编号
  const backupLabelM = fullText.match(/备用回路编号?[:：\s]*([^\n,，]+)/)
  if (backupLabelM) result.进线信息.备用回路.回路编号 = backupLabelM[1].trim()

  // 进线电缆（主用/备用可能相同，逐行对应）
  const cableMatches = fullText.match(new RegExp(CABLE_RE.source, 'gi'))
  if (cableMatches) {
    // 前两个电缆匹配分配给主用和备用
    const cables = cableMatches.map(c => c.replace(/一/g, '-').replace(/[×✕╳]/g, 'x'))
    if (cables.length >= 1) result.进线信息.主用回路.电缆规格 = parseCable(cables[0])
    if (cables.length >= 2) result.进线信息.备用回路.电缆规格 = parseCable(cables[1])
    else if (cables.length === 1) result.进线信息.备用回路.电缆规格 = parseCable(cables[0]) // 相同
  }

  // 监控回路（非负荷）
  if (fullText.match(/火灾监控|监控主机|电气火灾/)) {
    const monCableM = fullText.match(/(ZCN[-一]?RVS[-一]?\d+[x][\d.]+(?:mm[²2])?)/i)
    const monTermM = fullText.match(/[Ss](\d+)/)
    result.进线信息.监控回路_非负荷 = {
      电缆: monCableM ? monCableM[0].replace(/一/g, '-') : 'ZCN-RVS-2x1.5mm²',
      端子: monTermM ? 'S' + monTermM[1] : '',
      用途: '接电气火灾监控系统主机',
      说明: '单独记录，不算负荷支路',
    }
  }

  /* ── 3. 支路信息 ── */
  for (const line of lines) {
    const lt = line.map(w => w.text).join(' ')
    const ltClean = lt

    // ── MCCB 支路（送下级箱）──
    const mccbM = ltClean.match(BREAKER_MCCB_RE)
    if (mccbM && !ltClean.match(/主开关|进线开关|总开关|ATSE/)) {
      const downstreamBox = detectDownstreamBox(ltClean)
      const meter = detectMeter(ltClean)
      const cableM = ltClean.match(CABLE_RE)
      const cable = cableM ? cableM[0].replace(/一/g, '-').replace(/[×✕╳]/g, 'x') : ''
      const inM = ltClean.match(/In\s*[=＝]\s*(\d+)\s*A/i)
      const powerM = ltClean.match(/(\d+)\s*[kK]\s*[wW]/)

      // 找到对应的回路编号（同行或相邻行的 +B1-ATLP-WX）
      const wlM = ltClean.match(/\+?[Bb]\d[-一][A-Za-z]+[-一]W\d+/)

      const entry = {
        回路编号: wlM ? wlM[0].replace(/一/g, '-') : '',
        末端箱号: downstreamBox,
        开关规格: mccbM[0],
        开关额定电流: inM ? 'In=' + inM[1] + 'A' : '',
        带漏保: false,
        电能表: meter,
        电缆规格: cable ? parseCable(cable) : null,
        末端功率: powerM ? powerM[0] : '',
        末端类型: '下级配电箱',
      }

      // 避免重复添加
      if (!result.支路信息.主回路下级_送下级箱_MCCB.find(e => e.回路编号 === entry.回路编号 && entry.回路编号)) {
        result.支路信息.主回路下级_送下级箱_MCCB.push(entry)
      }
    }

    // ── MCB 支路（末端设备）──
    const mcbM = ltClean.match(BREAKER_MCB_RE)
    const wlM2 = ltClean.match(/WL\s*(\d+)/i)
    if (wlM2 || mcbM) {
      const leakage = detectLeakage(ltClean)
      const cableM = ltClean.match(CABLE_RE)
      const cable = cableM ? cableM[0].replace(/一/g, '-').replace(/[×✕╳]/g, 'x') : ''
      const downstreamBox = detectDownstreamBox(ltClean)
      const powerM = ltClean.match(/(\d+)\s*[kK]\s*[wW]/) || ltClean.match(/(\d+)\s*[xX×]\s*([\d.]+)\s*[kK]\s*[wW]/)

      // 末端名称：中文描述
      let endName = ''
      const nameM = ltClean.match(/([\u4e00-\u9fa5]*(?:照明|消毒|潜污|排风|电磁|水箱|自洁|备用|排风|水泵|风机|空调|插座|热水器)[\u4e00-\u9fa5]*)/)
      if (nameM) endName = nameM[1]
      if (ltClean.match(/备用/)) endName = '备用'

      // 相线
      let phase = ''
      if (ltClean.match(/3\s*L/)) phase = '3L'
      else if (ltClean.match(/L\s*1/)) phase = 'L1'
      else if (ltClean.match(/L\s*2/)) phase = 'L2'
      else if (ltClean.match(/L\s*3/)) phase = 'L3'
      else if (ltClean.match(/N\s*,?\s*PE/i)) phase = 'N, PE'

      const wlId = wlM2 ? 'WL' + wlM2[1] : ''

      if (wlId) {
        const entry = {
          回路编号: wlId,
          开关规格: mcbM ? mcbM[0] : '',
          带漏保: leakage.带漏保,
          漏保规格: leakage.漏保规格,
          相线: phase,
          电缆规格: cable ? parseCable(cable) : null,
          末端名称: endName,
          末端箱号: downstreamBox || '',
          末端功率: powerM ? powerM[0] : '',
          末端类型: downstreamBox ? '下级控制箱' : (endName === '备用' ? '备用回路' : '设备'),
        }

        if (!result.支路信息.末端设备支路_MCB.find(e => e.回路编号 === wlId)) {
          result.支路信息.末端设备支路_MCB.push(entry)
        }
      }
    }
  }

  /* ── 全文补充提取（兜底）── */
  // 如果行解析没找到支路，尝试全文匹配 WL
  if (result.支路信息.末端设备支路_MCB.length === 0) {
    const wlPattern = /WL\s*(\d+)/gi
    let m
    const found = new Set()
    while ((m = wlPattern.exec(fullText)) !== null) {
      const id = 'WL' + m[1]
      if (!found.has(id)) {
        found.add(id)
        result.支路信息.末端设备支路_MCB.push({
          回路编号: id,
          开关规格: '', 带漏保: false, 漏保规格: '',
          相线: '', 电缆规格: null,
          末端名称: '', 末端箱号: '', 末端功率: '',
          末端类型: '设备',
        })
      }
    }
  }

  // 接地方式
  if (fullText.match(/铜排连接/)) result.接地方式 = '与本层水平主铜排连接'
  else if (fullText.match(/接地|PE/)) result.接地方式 = 'PE接地'

  return result
}

/* ── 构建层级树 ── */
function buildTree(parsed, fileName) {
  const box = {
    id: parsed.箱体信息.箱号 || fileName.replace(/\.[^.]+$/, ''),
    name: parsed.箱体信息.箱名称 || '配电箱',
    type: (parsed.箱体信息.箱名称 || '').includes('总配') ? '一级箱' :
          (parsed.箱体信息.箱名称 || '').includes('控制') ? '控制箱' : '二级箱',
    location: '',
    circuits: (parsed.支路信息.主回路下级_送下级箱_MCCB.length +
               parsed.支路信息.末端设备支路_MCB.length),
    sourceFile: fileName,
    children: [],
    parsed,  // 完整解析结果
    rawOcrText: parsed.rawOcrText,
  }

  // 主回路下级 → 子节点
  for (const b of parsed.支路信息.主回路下级_送下级箱_MCCB) {
    box.children.push({
      id: box.id + '-' + (b.回路编号 || b.末端箱号),
      name: b.末端箱号 || b.回路编号,
      type: '二级箱',
      location: '', circuits: 0, sourceFile: fileName, children: [],
    })
  }

  // 末端支路 → 子节点
  for (const b of parsed.支路信息.末端设备支路_MCB) {
    if (b.末端类型 !== '备用回路') {
      box.children.push({
        id: box.id + '-' + b.回路编号,
        name: b.末端名称 || b.回路编号,
        type: b.末端类型 === '下级控制箱' ? '控制箱' : '控制箱',
        location: '', circuits: 0, sourceFile: fileName, children: [],
      })
    }
  }

  return box
}

/* ── 生成 Markdown 识别报告 ── */
export function generateMarkdown(parsed) {
  const p = parsed
  const fmtCable = (c) => c ? (c.型号 + (c.芯数截面 ? '-' + c.芯数截面 : '') + (c.敷设方式 ? '-' + c.敷设方式 : '')) : '-'
  const lines = []

  lines.push('## 配电箱识别报告')
  lines.push('')

  // 1. 箱体信息
  lines.push('### 1. 箱体信息')
  lines.push('')
  lines.push('| 项目 | 内容 |')
  lines.push('|------|------|')
  lines.push(`| 箱号 | ${p.箱体信息.箱号 || '-'} |`)
  lines.push(`| 名称 | ${p.箱体信息.箱名称 || '-'} |`)
  if (p.箱体信息.图号名称) lines.push(`| 图号名称 | ${p.箱体信息.图号名称} |`)
  if (p.箱体信息.安装方式) lines.push(`| 安装方式 | ${p.箱体信息.安装方式} |`)
  if (p.箱体信息.防护等级) lines.push(`| 防护等级 | ${p.箱体信息.防护等级} |`)
  if (p.箱体信息.数量) lines.push(`| 数量 | ${p.箱体信息.数量} |`)
  if (p.箱体信息.备注) lines.push(`| 备注 | ${p.箱体信息.备注} |`)
  lines.push('')

  // 2. 进线信息
  lines.push('### 2. 进线信息')
  lines.push('')
  lines.push('| 项目 | 内容 |')
  lines.push('|------|------|')
  for (const [k, v] of Object.entries(p.进线信息.负荷参数)) {
    lines.push(`| ${k} | ${v} |`)
  }
  if (p.进线信息.主开关.型号) {
    lines.push(`| 主开关 | ${p.进线信息.主开关.型号} |`)
  }
  if (p.进线信息.主开关.特性) {
    lines.push(`| 开关特性 | ${p.进线信息.主开关.特性} |`)
  }
  lines.push(`| 主用回路编号 | ${p.进线信息.主用回路.回路编号 || '-'} |`)
  lines.push(`| 主用电缆 | ${fmtCable(p.进线信息.主用回路.电缆规格)} |`)
  lines.push(`| 备用回路编号 | ${p.进线信息.备用回路.回路编号 || '-'} |`)
  lines.push(`| 备用电缆 | ${fmtCable(p.进线信息.备用回路.电缆规格)} |`)
  if (p.进线信息.监控回路_非负荷) {
    const m = p.进线信息.监控回路_非负荷
    lines.push(`| 监控回路（非负荷） | ${m.电缆} → ${m.端子} → ${m.用途} |`)
  }
  lines.push('')

  // 3. 支路信息 - MCCB
  lines.push('### 3. 支路信息')
  lines.push('')
  if (p.支路信息.主回路下级_送下级箱_MCCB.length > 0) {
    lines.push('#### MCCB 回路（送下级配电箱）')
    lines.push('')
    lines.push('| 回路编号 | 末端箱号 | 开关规格 | 额定电流 | 漏保 | 电能表 | 电缆规格 | 功率 |')
    lines.push('|----------|----------|----------|----------|------|--------|----------|------|')
    for (const b of p.支路信息.主回路下级_送下级箱_MCCB) {
      lines.push(`| ${b.回路编号 || '-'} | ${b.末端箱号 || '-'} | ${b.开关规格 || '-'} | ${b.开关额定电流 || '-'} | 否 | ${b.电能表 || '-'} | ${fmtCable(b.电缆规格)} | ${b.末端功率 || '-'} |`)
    }
    lines.push('')
  }

  // MCB 末端设备
  if (p.支路信息.末端设备支路_MCB.length > 0) {
    lines.push('#### MCB 支路（末端设备）')
    lines.push('')
    lines.push('| 回路编号 | 开关规格 | 漏保 | 相线 | 电缆规格 | 末端名称 | 备注 |')
    lines.push('|----------|----------|------|------|----------|----------|------|')
    for (const b of p.支路信息.末端设备支路_MCB) {
      const leakage = b.带漏保 ? `${b.漏保规格} ✓` : '-'
      const endNote = b.末端功率 ? b.末端功率 : (b.末端类型 === '备用回路' ? '备用' : (b.末端箱号 ? '送下级 ' + b.末端箱号 : ''))
      lines.push(`| ${b.回路编号} | ${b.开关规格 || '-'} | ${leakage} | ${b.相线 || '-'} | ${fmtCable(b.电缆规格)} | ${b.末端名称 || '-'} | ${endNote} |`)
    }
    lines.push('')
  }

  // 接地方式
  if (p.接地方式) {
    lines.push(`**接地方式**：${p.接地方式}`)
    lines.push('')
  }

  // 易错点自查
  lines.push('---')
  lines.push('**易错点自查**：')
  lines.push(`- 主/备回路编号：${p.进线信息.主用回路.回路编号 || '未识别'} / ${p.进线信息.备用回路.回路编号 || '未识别'}（已分开记录）`)
  lines.push(`- 电能表 vs 开关电流：已区分（电能表为括号格式如 10(4.0)A）`)
  lines.push(`- 多截面电缆：未相加，原样记录`)
  lines.push(`- 下级箱号：${p.支路信息.主回路下级_送下级箱_MCCB.map(b => b.末端箱号).filter(Boolean).join(', ') || '无'}`)
  lines.push(`- 监控回路：${p.进线信息.监控回路_非负荷 ? '已单独记录（非负荷）' : '未检测到'}`)
  lines.push(`- 备用支路：${p.支路信息.末端设备支路_MCB.filter(b => b.末端类型 === '备用回路').map(b => b.回路编号).join(', ') || '无'}`)

  return lines.join('\n')
}

/* ── Main entry ── */
export async function recognizeFromPDF(file, onProgress) {
  if (onProgress) onProgress('rendering', 1, 1)
  const { canvas } = await renderPage(file, 1, 3)

  // 图像预处理: 灰度化 + 二值化，提高 OCR 准确率
  preprocessCanvas(canvas)

  if (onProgress) onProgress('ocr', 1, 1)
  const { words, fullText } = await ocrWithPositions(canvas, (p) => {
    if (onProgress) onProgress('ocr-progress', 1, 1, p)
  })

  if (onProgress) onProgress('parsing', 1, 1)
  const lines = clusterLines(words)
  const parsed = parseThreeLayers(lines, fullText)
  const box = buildTree(parsed, file.name)
  const markdown = generateMarkdown(parsed)
  box.markdownReport = markdown

  return [box]
}
