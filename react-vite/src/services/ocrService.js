/**
 * OCR 识别服务 - 从 PDF 图纸中提取配电箱层级信息
 *
 * 流程: PDF → 3x高清图像 → Tesseract.js OCR(含位置) → 空间布局还原 → 层级解析
 *
 * 识别层级:
 *   箱号/名称
 *     └─ 进线电缆规格
 *     └─ 主回路 (电缆规格 + 开关)
 *         └─ 支路 WL1~N (开关参数 + 电缆规格 + 名称 + 功率)
 *     └─ 备用回路 (电缆规格 + 开关)
 *         └─ 支路 ...
 */
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

/* ── 电气图纸 OCR 纠错 ── */
const FIX = [
  [/[一―—]/g, '-'],        // 中文破折号 → 减号
  [/×|✕|╳/g, 'x'],        // 各种乘号 → x
  [/＋/g, '+'], [/＝/g, '='], [/：/g, ':'],
  [/[（]/g, '('], [/[）]/g, ')'],
  [/\s{2,}/g, ' '],        // 多余空格
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

/* ── OCR with word-level position data ── */
async function ocrWithPositions(canvas, onProgress) {
  const result = await Tesseract.recognize(canvas, 'chi_sim+eng', {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') onProgress(m.progress)
    },
  })
  const words = (result.data.words || []).map(w => ({
    text: clean(w.text),
    x: w.bbox.x0,
    y: w.bbox.y0,
    x2: w.bbox.x1,
    y2: w.bbox.y1,
    cx: (w.bbox.x0 + w.bbox.x1) / 2,
    cy: (w.bbox.y0 + w.bbox.y1) / 2,
    w: w.bbox.x1 - w.bbox.x0,
    h: w.bbox.y1 - w.bbox.y0,
  })).filter(w => w.text.length > 0)
  return { words, fullText: clean(result.data.text) }
}

/* ── 空间聚类: 把相近 y 坐标的 word 合并成行 ── */
function clusterIntoLines(words, tolerance = 8) {
  if (words.length === 0) return []
  const sorted = [...words].sort((a, b) => a.cy - b.cy)
  const lines = []
  let currentLine = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].cy - currentLine[0].cy) <= tolerance) {
      currentLine.push(sorted[i])
    } else {
      lines.push(currentLine.sort((a, b) => a.x - b.x))
      currentLine = [sorted[i]]
    }
  }
  if (currentLine.length > 0) lines.push(currentLine.sort((a, b) => a.x - b.x))
  return lines
}

/* ── 从行文本中提取结构化信息 ── */
function extractFromLines(lines) {
  const info = {
    boxNumber: '',
    boxName: '',
    drawingTitle: '',
    incomingCable: '',
    mainCircuit: { cable: '', breaker: '', label: '' },
    backupCircuit: { cable: '', breaker: '', label: '' },
    powerParams: {},
    mainBreaker: '',
    branches: [],
  }

  // 电缆型号正则
  const CABLE_RE = /(?:WDZ[A-Z]*|YJV|VV|NH-YJV|ZR-?[A-Z]*|BV)[-一][A-Z]*[-一]?YJY?[-一]\d+[x]\d+(?:\+\d+[x]\d+)*(?:[-一][A-Z]+)?/i
  const CABLE_RE2 = /WDZ[A-Z]*[-一][A-Z0-9]*[-一][A-Z]*[-一]\d+[x]\d+(?:\+\d+[x]\d+)*/i

  // 断路器/开关正则
  const BREAKER_RE = /(?:MCB|MCCB|ATSE|NSX|NM|RCBO|ELCB)[/／\s]?\s*[A-Z0-9/]*(?:\s*\d+\s*[A-Z])?/i
  const SWITCH_RE = /(?:ATSE|ATS)\s*\d+\s*A/i

  for (const line of lines) {
    const lineText = line.map(w => w.text).join(' ')
    const lineY = line[0].cy

    // 1. 箱号: +B1-XXXX
    if (!info.boxNumber) {
      const boxMatch = lineText.match(/\+?\s*[BbFf]\s*\d\s*[-一]\s*[A-Za-z]{2,8}\d*/)
      if (boxMatch) {
        info.boxNumber = boxMatch[0].replace(/\s+/g, '').replace(/一/g, '-')
        if (!info.boxNumber.startsWith('+')) info.boxNumber = '+' + info.boxNumber
      }
    }

    // 2. 图纸标题
    if (!info.drawingTitle) {
      const titleMatch = lineText.match(/([\u4e00-\u9fa5]*(?:配电|系统|原理)[\u4e00-\u9fa5]*图)/)
      if (titleMatch) info.drawingTitle = titleMatch[1]
    }

    // 3. 箱名称
    if (!info.boxName) {
      const nameMatch = lineText.match(/([\u4e00-\u9fa5]*(?:住宅|商业|工业|办公|学校|医院|生活|消防|应急|动力|照明|空调|水泵|排水|排污|通风|潜污)[\u4e00-\u9fa5]*(?:配电箱|控制箱|配电柜))/)
      if (nameMatch) info.boxName = nameMatch[1]
    }

    // 4. 电缆规格
    const cableMatch = lineText.match(CABLE_RE) || lineText.match(CABLE_RE2)
    if (cableMatch) {
      const cable = cableMatch[0].replace(/一/g, '-').replace(/[×✕╳]/g, 'x')
      // 判断是主回路还是备用回路的电缆
      if (lineText.match(/主用|主回路|主[线缆]/)) {
        info.mainCircuit.cable = cable
      } else if (lineText.match(/备用|备[线缆]/)) {
        info.backupCircuit.cable = cable
      } else if (!info.incomingCable) {
        // 第一个出现的电缆作为进线电缆
        info.incomingCable = cable
      } else if (!info.mainCircuit.cable) {
        info.mainCircuit.cable = cable
      } else if (!info.backupCircuit.cable) {
        info.backupCircuit.cable = cable
      }
    }

    // 5. 主开关
    const switchMatch = lineText.match(SWITCH_RE) || lineText.match(BREAKER_RE)
    if (switchMatch) {
      const sw = switchMatch[0].trim()
      if (lineText.match(/主开关|进线开关|总开关/)) {
        info.mainBreaker = sw
      } else if (!info.mainBreaker) {
        info.mainBreaker = sw
      }
    }

    // 6. 电气参数
    const pnMatch = lineText.match(/[Pp]\s*n\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
    const pcMatch = lineText.match(/[Pp]\s*c\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
    const cosMatch = lineText.match(/cos\s*[φΦ]\s*[=＝]\s*([\d.]+)/)
    const icMatch = lineText.match(/[Ii]\s*c\s*[=＝]\s*([\d.]+)\s*A/)
    const kdMatch = lineText.match(/[Kk]\s*d\s*[=＝]\s*([\d.]+)/)
    if (pnMatch) info.powerParams['Pn'] = pnMatch[1] + ' kW'
    if (pcMatch) info.powerParams['Pc'] = pcMatch[1] + ' kW'
    if (cosMatch) info.powerParams['cosφ'] = cosMatch[1]
    if (icMatch) info.powerParams['Ic'] = icMatch[1] + ' A'
    if (kdMatch) info.powerParams['Kd'] = kdMatch[1]

    // 7. 回路编号
    if (lineText.match(/主用回路编号|主用回路/)) {
      info.mainCircuit.label = lineText.replace(/主用回路编号?[:：\s]*/g, '').trim()
    }
    if (lineText.match(/备用回路编号|备用回路/)) {
      info.backupCircuit.label = lineText.replace(/备用回路编号?[:：\s]*/g, '').trim()
    }

    // 8. 支路信息: WL1~WL9
    const wlMatch = lineText.match(/WL\s*(\d+)/i)
    if (wlMatch) {
      const branch = {
        id: 'WL' + wlMatch[1],
        name: '',
        breaker: '',
        cable: '',
        power: '',
        y: lineY,
        x: line[0].x,
      }

      // 名称: WL后面的中文描述
      const nameMatch = lineText.match(/WL\s*\d+\s*[:：\s]*(.+)/i)
      if (nameMatch) {
        let name = nameMatch[1].trim()
        // 从名称中提取功率
        const powerMatch = name.match(/([\d.]+)\s*[kK]\s*[wW]/)
        if (powerMatch) {
          branch.power = powerMatch[0]
          name = name.replace(powerMatch[0], '').trim()
        }
        // 从名称中提取电缆
        const branchCable = name.match(CABLE_RE) || name.match(CABLE_RE2)
        if (branchCable) {
          branch.cable = branchCable[0].replace(/一/g, '-').replace(/[×✕╳]/g, 'x')
          name = name.replace(branchCable[0], '').trim()
        }
        branch.name = name.replace(/[,，\s]+$/, '')
      }

      // 从同行提取断路器
      const brMatch = lineText.match(BREAKER_RE)
      if (brMatch) branch.breaker = brMatch[0].trim()

      // 从同行提取电缆（如果名称中没有）
      if (!branch.cable) {
        const cMatch = lineText.match(CABLE_RE) || lineText.match(CABLE_RE2)
        if (cMatch) branch.cable = cMatch[0].replace(/一/g, '-').replace(/[×✕╳]/g, 'x')
      }

      info.branches.push(branch)
    }
  }

  // 如果没有从行中提取到支路，尝试从全文提取
  if (info.branches.length === 0) {
    const fullText = lines.flat().map(w => w.text).join(' ')
    const wlPattern = /WL\s*(\d+)\s*[:：\s]*(?:([^\n]*?)(?=(?:WL\s*\d+)|$))?/gi
    let m
    while ((m = wlPattern.exec(fullText)) !== null) {
      const branch = {
        id: 'WL' + m[1],
        name: clean(m[2] || ''),
        breaker: '',
        cable: '',
        power: '',
      }
      const powerMatch = branch.name.match(/([\d.]+)\s*[kK]\s*[wW]/)
      if (powerMatch) {
        branch.power = powerMatch[0]
        branch.name = branch.name.replace(powerMatch[0], '').trim()
      }
      const cableMatch = branch.name.match(CABLE_RE) || branch.name.match(CABLE_RE2)
      if (cableMatch) {
        branch.cable = cableMatch[0].replace(/一/g, '-').replace(/[×✕╳]/g, 'x')
        branch.name = branch.name.replace(cableMatch[0], '').trim()
      }
      info.branches.push(branch)
    }
  }

  // 进线根数从电缆规格推算
  let incomingWires = ''
  if (info.incomingCable) {
    const specMatch = info.incomingCable.match(/(\d+)[x]\d+(?:\+(\d+)[x]\d+)?/)
    if (specMatch) {
      incomingWires = (parseInt(specMatch[1]) + (specMatch[2] ? parseInt(specMatch[2]) : 0)) + '根'
    }
  }

  return { ...info, incomingWires }
}

/* ── 从全文补充提取 ── */
function supplementFromFullText(info, fullText) {
  if (!info.boxNumber) {
    const m = fullText.match(/\+?\s*[BbFf]\s*\d\s*[-一]\s*[A-Za-z]{2,8}\d*/)
    if (m) {
      info.boxNumber = m[0].replace(/\s+/g, '').replace(/一/g, '-')
      if (!info.boxNumber.startsWith('+')) info.boxNumber = '+' + info.boxNumber
    }
  }
  if (!info.drawingTitle) {
    const m = fullText.match(/([\u4e00-\u9fa5]*(?:配电|系统|原理)[\u4e00-\u9fa5]*图)/)
    if (m) info.drawingTitle = m[1]
  }
  if (!info.boxName) {
    const m = fullText.match(/([\u4e00-\u9fa5]*(?:住宅|生活|消防|动力|照明|水泵|排水|排污|通风|潜污|商业|工业)[\u4e00-\u9fa5]*(?:配电箱|控制箱|配电柜))/)
    if (m) info.boxName = m[1]
  }
  if (!info.incomingCable) {
    const CABLE_RE = /(?:WDZ[A-Z]*|YJV|VV|NH-YJV|ZR-?[A-Z]*|BV)[-一][A-Z]*[-一]?YJY?[-一]\d+[x]\d+(?:\+\d+[x]\d+)*(?:[-一][A-Z]+)?/i
    const m = fullText.match(CABLE_RE)
    if (m) info.incomingCable = m[0].replace(/一/g, '-').replace(/[×✕╳]/g, 'x')
  }
  if (!info.powerParams || Object.keys(info.powerParams).length === 0) {
    const pn = fullText.match(/[Pp]\s*n\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
    const pc = fullText.match(/[Pp]\s*c\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
    const cos = fullText.match(/cos\s*[φΦ]\s*[=＝]\s*([\d.]+)/)
    const ic = fullText.match(/[Ii]\s*c\s*[=＝]\s*([\d.]+)\s*A/)
    if (pn) info.powerParams['Pn'] = pn[1] + ' kW'
    if (pc) info.powerParams['Pc'] = pc[1] + ' kW'
    if (cos) info.powerParams['cosφ'] = cos[1]
    if (ic) info.powerParams['Ic'] = ic[1] + ' A'
  }
  if (!info.mainBreaker) {
    const m = fullText.match(/(?:ATSE|ATS)\s*\d+\s*A/i) || fullText.match(/(?:MCB|MCCB|NSX)[/／\s]?[A-Z0-9/]*/i)
    if (m) info.mainBreaker = m[0].trim()
  }
  // 名称 fallback
  if (!info.boxName && info.drawingTitle) {
    info.boxName = info.drawingTitle.replace(/系统图|配电图|原理图/, '') + '配电箱'
  }
  if (!info.boxName && info.boxNumber) {
    info.boxName = info.boxNumber + ' 配电箱'
  }
}

/* ── 构建层级树 ── */
function buildTree(info, fileName) {
  const box = {
    id: info.boxNumber || fileName.replace(/\.[^.]+$/, ''),
    name: info.boxName || '配电箱',
    type: (info.boxName || '').includes('总配') ? '一级箱' :
          (info.boxName || '').includes('控制') ? '控制箱' : '二级箱',
    location: '',
    circuits: info.branches.length,
    sourceFile: fileName,
    children: [],
    details: {
      drawingTitle: info.drawingTitle,
      incomingCable: info.incomingCable,
      incomingWires: info.incomingWires,
      mainBreaker: info.mainBreaker,
      powerParams: info.powerParams,
      mainCircuit: info.mainCircuit,
      backupCircuit: info.backupCircuit,
    },
    rawOcrText: '',
  }

  // 主回路节点
  if (info.mainCircuit.cable || info.mainCircuit.label || info.branches.length > 0) {
    const mainNode = {
      id: box.id + '-M',
      name: '主回路' + (info.mainCircuit.label ? ' (' + info.mainCircuit.label + ')' : ''),
      type: '二级箱',
      location: '',
      circuits: 0,
      sourceFile: fileName,
      children: [],
      circuitDetail: {
        cable: info.mainCircuit.cable,
        breaker: info.mainCircuit.breaker,
        label: info.mainCircuit.label,
      },
    }

    // 支路挂在主回路下
    for (const b of info.branches) {
      mainNode.children.push({
        id: box.id + '-' + b.id,
        name: b.name || b.id,
        type: '控制箱',
        location: '',
        circuits: 0,
        sourceFile: fileName,
        children: [],
        branchDetail: {
          breaker: b.breaker,
          cable: b.cable,
          power: b.power,
        },
      })
      mainNode.circuits++
    }

    box.children.push(mainNode)
  }

  // 备用回路节点
  if (info.backupCircuit.cable || info.backupCircuit.label) {
    box.children.push({
      id: box.id + '-B',
      name: '备用回路' + (info.backupCircuit.label ? ' (' + info.backupCircuit.label + ')' : ''),
      type: '二级箱',
      location: '',
      circuits: 0,
      sourceFile: fileName,
      children: [],
      circuitDetail: {
        cable: info.backupCircuit.cable,
        breaker: info.backupCircuit.breaker,
        label: info.backupCircuit.label,
      },
    })
  }

  return box
}

/* ── Main entry ── */
export async function recognizeFromPDF(file, onProgress) {
  if (onProgress) onProgress('rendering', 1, 1)
  const { canvas } = await renderPage(file, 1, 3)

  if (onProgress) onProgress('ocr', 1, 1)
  const { words, fullText } = await ocrWithPositions(canvas, (p) => {
    if (onProgress) onProgress('ocr-progress', 1, 1, p)
  })

  if (onProgress) onProgress('parsing', 1, 1)

  // 空间聚类成行
  const lines = clusterIntoLines(words)

  // 从行中提取信息
  const info = extractFromLines(lines)

  // 从全文补充缺失字段
  supplementFromFullText(info, fullText)

  // 保存原文
  info.rawOcrText = fullText

  // 构建层级树
  const box = buildTree(info, file.name)
  box.rawOcrText = fullText

  return [box]
}
