/**
 * OCR 识别服务 - 从 PDF 图纸中提取配电箱信息
 *
 * 流程: PDF → 高分辨率图像(3x) → Tesseract.js OCR → 电气图纸纠错 → 5类信息解析
 *
 * 识别内容:
 *   1. 图号名称、箱号
 *   2. 进线电缆规格、进线根数
 *   3. 主用回路编号、备用回路编号
 *   4. 主开关型号、电气参数
 *   5. 支路信息（电缆规格、名称、参数）
 */
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

/* ── Configure PDF.js ── */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

/* ── 电气图纸 OCR 纠错映射 ── */
const ELECTRICAL_CORRECTIONS = {
  // OCR 常见误识别 → 正确值
  'ACLP': 'ATLP',    // T 常被误识别为 C
  'ATLPD': 'ATLP',   // 尾部 D 是多余的
  '一ATLP': '-ATLP', // 中文一 常被误识别为 -
  '一BZ一': '-BZ-',
  '一YJY一': '-YJY-',
  '一YJV一': '-YJV-',
  'WDZB一': 'WDZB-',
  '×': 'x',          // 统一乘号
  '✕': 'x',
  '╳': 'x',
  '＋': '+',
  '＝': '=',
  '：': ':',
  '（': '(',
  '）': ')',
}

/* ── 文本清理和纠错 ── */
function cleanText(raw) {
  let text = raw
  // 应用电气图纸专用纠错
  for (const [wrong, correct] of Object.entries(ELECTRICAL_CORRECTIONS)) {
    text = text.split(wrong).join(correct)
  }
  // 清理多余空格
  text = text.replace(/[ \t]+/g, ' ')
  return text
}

/* ── Render PDF page to canvas at high resolution ── */
async function renderPage(file, pageNum, scale = 3) {
  const buf = await file.arrayBuffer()
  const data = new Uint8Array(buf)
  const doc = await pdfjsLib.getDocument({ data }).promise
  const page = await doc.getPage(pageNum)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvasContext: ctx, viewport }).promise

  const numPages = doc.numPages
  doc.destroy()
  return { canvas, numPages }
}

/* ── Run Tesseract OCR ── */
async function ocrCanvas(canvas, onProgress) {
  const result = await Tesseract.recognize(canvas, 'chi_sim+eng', {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(m.progress)
      }
    },
  })
  return result.data.text
}

/* ── 解析全部 5 类配电箱信息 ── */
function parseAllFields(text, fileName) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const full = lines.join('\n')
  const result = {
    // 1. 图号名称、箱号
    drawingTitle: '',
    boxNumber: '',
    boxName: '',
    // 2. 进线电缆规格、进线根数
    cableSpec: '',
    incomingWires: '',
    // 3. 主用回路编号、备用回路编号
    mainCircuit: '',
    backupCircuit: '',
    // 4. 主开关型号、电气参数
    mainBreaker: '',
    powerParams: {},
    // 5. 支路信息
    branches: [],
    // 原文
    rawText: text,
  }

  /* ── 1. 图号名称 ── */
  // 图纸标题通常在底部，格式: "XXX配电系统图" 或 "XXX系统图"
  const titlePatterns = [
    /([\u4e00-\u9fa5]+配电系统图)/,
    /([\u4e00-\u9fa5]+系统图)/,
    /([\u4e00-\u9fa5]+配电图)/,
    /([\u4e00-\u9fa5]+原理图)/,
    /图名[:：\s]*([^\n]+)/,
    /图纸名称[:：\s]*([^\n]+)/,
  ]
  for (const pat of titlePatterns) {
    const m = full.match(pat)
    if (m) { result.drawingTitle = m[1].trim(); break }
  }

  /* ── 1. 箱号 ── */
  // 箱号格式: +B1-XXXX, +B2-XXXX, +F1-XXXX 等
  // OCR 可能产出: B1-ATLP, +B1一ATLP, +B1 ATLP 等
  const boxNumPatterns = [
    /\+\s*[BbFf]\s*\d\s*[-一\s]\s*[A-Za-z]{2,8}\d*/g,
    /箱号[:：\s]*([^\s,，\n]+)/,
  ]
  for (const pat of boxNumPatterns) {
    const matches = full.match(pat)
    if (matches) {
      // 取第一个匹配，清理格式
      let num = matches[0]
        .replace(/\s+/g, '')
        .replace(/一/g, '-')
      if (!num.startsWith('+')) num = '+' + num
      result.boxNumber = num
      break
    }
  }
  if (!result.boxNumber) {
    // Fallback: 从文件名推断
    result.boxNumber = fileName.replace(/\.[^.]+$/, '').toUpperCase()
  }

  /* ── 1. 箱名称 ── */
  const namePatterns = [
    /([\u4e00-\u9fa5]*(?:住宅|商业|工业|办公|学校|医院)[\u4e00-\u9fa5]*配电箱)/,
    /([\u4e00-\u9fa5]*(?:生活|消防|应急|动力|照明|空调|水泵|排水|排污|通风)[\u4e00-\u9fa5]*配电箱)/,
    /([\u4e00-\u9fa5]*控制箱)/,
    /([\u4e00-\u9fa5]*配电箱)/,
    /名称[:：\s]*([^\n,，]+)/,
  ]
  for (const pat of namePatterns) {
    const m = full.match(pat)
    if (m) { result.boxName = m[1].trim(); break }
  }
  if (!result.boxName) {
    // 从图纸标题推断
    if (result.drawingTitle) {
      result.boxName = result.drawingTitle.replace(/系统图|配电图|原理图/, '') + '配电箱'
    } else {
      result.boxName = result.boxNumber + ' 配电箱'
    }
  }

  /* ── 2. 进线电缆规格 ── */
  // 电缆型号: WDZB-BZ-YJY-4x70+1x35-CT, YJV-5x10, NH-YJV-3x4 等
  const cablePatterns = [
    /(WDZ[A-Z]*[-一][A-Z]*[-一]YJY[-一]\d+[x×✕]\d+(?:\+\d+[x×✕]\d+)*(?:[-一][A-Z]+)?)/gi,
    /(WDZ[A-Z]*[-一]YJY[-一]\d+[x×✕]\d+(?:\+\d+[x×✕]\d+)*(?:[-一][A-Z]+)?)/gi,
    /(YJV[-一]\d+[x×✕]\d+(?:\+\d+[x×✕]\d+)*(?:[-一][A-Z]+)?)/gi,
    /(NH[-一]YJV[-一]\d+[x×✕]\d+(?:\+\d+[x×✕]\d+)*)/gi,
    /(ZR[-一][A-Z]*[-一]YJY[-一]\d+[x×✕]\d+(?:\+\d+[x×✕]\d+)*)/gi,
    /(VV[-一]\d+[x×✕]\d+(?:\+\d+[x×✕]\d+)*)/gi,
    /(BV[-一]\d+[x×✕]\d+(?:\+\d+[x×✕]\d+)*)/gi,
  ]
  for (const pat of cablePatterns) {
    const m = full.match(pat)
    if (m) {
      result.cableSpec = m[0]
        .replace(/一/g, '-')
        .replace(/[×✕╳]/g, 'x')
        .replace(/＋/g, '+')
      break
    }
  }

  /* ── 2. 进线根数 ── */
  const wireCountPatterns = [
    /进线[:：\s]*(\d+)\s*根/,
    /(\d+)\s*根\s*进线/,
  ]
  for (const pat of wireCountPatterns) {
    const m = full.match(pat)
    if (m) { result.incomingWires = m[1] + '根'; break }
  }
  if (!result.incomingWires && result.cableSpec) {
    // 从电缆规格推算: 4x70+1x35 = 5根, 5x10 = 5根
    const specMatch = result.cableSpec.match(/(\d+)[x]\d+(?:\+(\d+)[x]\d+)?/)
    if (specMatch) {
      const count = parseInt(specMatch[1]) + (specMatch[2] ? parseInt(specMatch[2]) : 0)
      result.incomingWires = count + '根'
    }
  }

  /* ── 3. 主用回路编号 ── */
  const mainCircuitPatterns = [
    /主用回路编号[:：\s]*([^\n,，]+)/,
    /主用[:：\s]*([^\n,，]*回路[^\n,，]*)/,
    /主回路[:：\s]*([^\n,，]+)/,
  ]
  for (const pat of mainCircuitPatterns) {
    const m = full.match(pat)
    if (m) { result.mainCircuit = m[1].trim(); break }
  }

  /* ── 3. 备用回路编号 ── */
  const backupCircuitPatterns = [
    /备用回路编号[:：\s]*([^\n,，]+)/,
    /备用[:：\s]*([^\n,，]*回路[^\n,，]*)/,
  ]
  for (const pat of backupCircuitPatterns) {
    const m = full.match(pat)
    if (m) { result.backupCircuit = m[1].trim(); break }
  }

  /* ── 4. 主开关型号 ── */
  const breakerPatterns = [
    /(ATSE\s*\d+\s*A)/i,
    /(ATS\s*\d+\s*A)/i,
    /(MCCB[/／][A-Za-z0-9/]+)/i,
    /(NSX\s*\d+[A-Za-z]*)/i,
    /(NM\s*\d+[A-Za-z]*)/i,
    /主开关[:：\s]*([^\n,，]+)/,
    /进线开关[:：\s]*([^\n,，]+)/,
  ]
  for (const pat of breakerPatterns) {
    const m = full.match(pat)
    if (m) { result.mainBreaker = m[1].trim(); break }
  }

  /* ── 4. 电气参数 ── */
  const pnMatch = full.match(/[Pp]\s*n\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
  const pcMatch = full.match(/[Pp]\s*c\s*[=＝]\s*([\d.]+)\s*[kK]\s*[wW]/)
  const cosMatch = full.match(/cos\s*[φΦ]\s*[=＝]\s*([\d.]+)/)
  const icMatch = full.match(/[Ii]\s*c\s*[=＝]\s*([\d.]+)\s*A/)
  const kdMatch = full.match(/[Kk]\s*d\s*[=＝]\s*([\d.]+)/)
  if (pnMatch) result.powerParams['Pn'] = pnMatch[1] + ' kW'
  if (pcMatch) result.powerParams['Pc'] = pcMatch[1] + ' kW'
  if (cosMatch) result.powerParams['cosφ'] = cosMatch[1]
  if (icMatch) result.powerParams['Ic'] = icMatch[1] + ' A'
  if (kdMatch) result.powerParams['Kd'] = kdMatch[1]

  /* ── 5. 支路信息 ── */
  // WL1: 名称 → 功率/设备
  const wlPattern = /WL\s*(\d+)\s*[:：\s]+([^\n]+)/gi
  let wlMatch
  while ((wlMatch = wlPattern.exec(full)) !== null) {
    const name = wlMatch[2].trim()
    // 尝试从名称中提取功率
    const powerMatch = name.match(/([\d.]+)\s*[kK]\s*[wW]/)
    result.branches.push({
      id: 'WL' + wlMatch[1],
      name: name.replace(/\s*\d+(\.\d+)?\s*kW\s*/i, '').trim() || name,
      power: powerMatch ? powerMatch[0] : '',
      cableSpec: '',
    })
  }

  // 尝试匹配支路电缆规格
  for (const branch of result.branches) {
    const branchCablePatterns = [
      new RegExp(branch.id + '[^\\n]*?(' + cablePatterns.map(p => p.source).join('|') + ')', 'i'),
    ]
    for (const pat of branchCablePatterns) {
      const m = full.match(pat)
      if (m) {
        branch.cableSpec = m[1].replace(/一/g, '-').replace(/[×✕╳]/g, 'x')
        break
      }
    }
  }

  // 如果没找到 WL 编号，尝试从子箱号推断
  if (result.branches.length === 0) {
    const subBoxPattern = /\+?[BbFf]\d[-一][A-Za-z]+[-一]W\d+/g
    const subMatches = full.match(subBoxPattern)
    if (subMatches) {
      for (const sub of subMatches) {
        result.branches.push({
          id: sub.replace(/\s+/g, ''),
          name: sub,
          power: '',
          cableSpec: '',
        })
      }
    }
  }

  return result
}

/* ── Build tree structure ── */
function buildBoxTree(info, fileName) {
  const box = {
    id: info.boxNumber,
    name: info.boxName,
    type: info.boxName.includes('总配') || info.boxName.includes('一级') ? '一级箱' :
          info.boxName.includes('控制') ? '控制箱' : '二级箱',
    location: '',
    circuits: info.branches.length || 1,
    sourceFile: fileName,
    children: [],
    details: {
      drawingTitle: info.drawingTitle,
      cableSpec: info.cableSpec,
      incomingWires: info.incomingWires,
      mainCircuit: info.mainCircuit,
      backupCircuit: info.backupCircuit,
      mainBreaker: info.mainBreaker,
      powerParams: info.powerParams,
      branches: info.branches,
    },
    rawOcrText: info.rawText,
  }

  for (const branch of info.branches) {
    box.children.push({
      id: info.boxNumber + '-' + branch.id,
      name: branch.name || branch.id,
      type: '控制箱',
      location: '',
      circuits: 0,
      sourceFile: fileName,
      children: [],
      branchDetail: {
        power: branch.power,
        cableSpec: branch.cableSpec,
      },
    })
  }

  return box
}

/* ── Main entry ── */
export async function recognizeFromPDF(file, onProgress) {
  const boxes = []
  const { canvas, numPages } = await renderPage(file, 1, 3)

  // OCR
  if (onProgress) onProgress('ocr', 1, numPages)
  const rawText = await ocrCanvas(canvas, (p) => {
    if (onProgress) onProgress('ocr-progress', 1, numPages, p)
  })

  // Clean and correct
  if (onProgress) onProgress('parsing', 1, numPages)
  const cleaned = cleanText(rawText)
  const info = parseAllFields(cleaned, file.name)
  const box = buildBoxTree(info, file.name)
  boxes.push(box)

  return boxes
}
