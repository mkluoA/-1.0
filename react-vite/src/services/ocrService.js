/**
 * OCR 识别服务 - 从 PDF 图纸中提取配电箱信息
 *
 * 流程: PDF → 高分辨率图像 → Tesseract OCR → 文本解析 → 结构化数据
 */
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

/* ── Configure PDF.js ── */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

/* ── Render PDF page to canvas image ── */
async function pdfPageToImage(file, pageNum = 1, scale = 2.5) {
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

  doc.destroy()
  return canvas
}

/* ── Run Tesseract OCR on a canvas ── */
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

/* ── Parse OCR text to extract distribution box info ── */
function parseBoxInfo(text, fileName) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const fullText = lines.join(' ')

  // Box number: patterns like +B1-ATLP, +B1-ad3, +B1-ACLP1
  // OCR may produce variations: B1-ATLP, +B1一ATLP, etc.
  const boxNumPatterns = [
    /\+?[Bb]1[-一][A-Za-z]{2,8}\d*/g,
    /箱号[:：\s]*([^\s,，]+)/,
  ]
  let boxNumber = ''
  for (const pat of boxNumPatterns) {
    const m = fullText.match(pat)
    if (m) {
      boxNumber = m[0].replace(/^[：:\s]+/, '').trim()
      // Normalize: ensure + prefix
      if (!boxNumber.startsWith('+')) boxNumber = '+' + boxNumber
      break
    }
  }
  if (!boxNumber) {
    boxNumber = fileName.replace(/\.[^.]+$/, '').toUpperCase()
  }

  // Box name: Chinese text describing the box type
  const namePatterns = [
    /([^\s]*配电箱[^\s]*)/,
    /([^\s]*控制箱[^\s]*)/,
    /([^\s]*照明箱[^\s]*)/,
    /([^\s]*动力箱[^\s]*)/,
    /名称[:：\s]*([^\n,，]+)/,
  ]
  let boxName = ''
  for (const pat of namePatterns) {
    const m = fullText.match(pat)
    if (m) {
      boxName = m[1].trim()
      break
    }
  }
  if (!boxName) boxName = boxNumber + ' 配电箱'

  // Incoming cable spec: WDZB-YJY-4x70+1x35, YJV-5x10, etc.
  const cablePatterns = [
    /(WDZ[A-Z]*[-一][A-Z]*[-一]YJY[-一][\dx+×]+(?:\+\d+x\d+)?(?:[-一][A-Z]+)?)/gi,
    /(YJV[-一][\dx+×]+(?:\+\d+x\d+)?(?:[-一][A-Z]+)?)/gi,
    /(VV[-一][\dx+×]+(?:\+\d+x\d+)?(?:[-一][A-Z]+)?)/gi,
    /(NH[-一]YJV[-一][\dx+×]+(?:\+\d+x\d+)?)/gi,
    /(ZR[-一][A-Z]*[-一]YJY[-一][\dx+×]+(?:\+\d+x\d+)?)/gi,
  ]
  let cableSpec = ''
  for (const pat of cablePatterns) {
    const m = fullText.match(pat)
    if (m) {
      cableSpec = m[0].replace(/[-一]/g, '-')
      break
    }
  }

  // Incoming line count: look for patterns like "进线 X 根" or count from cable spec
  let incomingWires = ''
  const wireCountMatch = fullText.match(/进线[:：\s]*(\d+)\s*根/)
  if (wireCountMatch) {
    incomingWires = wireCountMatch[1] + '根'
  } else if (cableSpec) {
    // Parse from cable spec: 4x70+1x35 = 5 wires, 5x10 = 5 wires
    const specMatch = cableSpec.match(/(\d+)[x×]\d+(?:\+(\d+)[x×]\d+)?/)
    if (specMatch) {
      const count = parseInt(specMatch[1]) + (specMatch[2] ? parseInt(specMatch[2]) : 0)
      incomingWires = count + '根'
    }
  }

  // Main circuit number (主用回路编号)
  let mainCircuit = ''
  const mainCircuitPatterns = [
    /主用回路编号[:：\s]*([^\n,，]+)/,
    /主用[:：\s]*([^\n,，]*回路[^\n,，]*)/,
  ]
  for (const pat of mainCircuitPatterns) {
    const m = fullText.match(pat)
    if (m) {
      mainCircuit = m[1].trim()
      break
    }
  }

  // Backup circuit number (备用回路编号)
  let backupCircuit = ''
  const backupCircuitPatterns = [
    /备用回路编号[:：\s]*([^\n,，]+)/,
    /备用[:：\s]*([^\n,，]*回路[^\n,，]*)/,
  ]
  for (const pat of backupCircuitPatterns) {
    const m = fullText.match(pat)
    if (m) {
      backupCircuit = m[1].trim()
      break
    }
  }

  // Power parameters
  let powerParams = {}
  const pnMatch = fullText.match(/[Pp]n\s*[=＝]\s*([\d.]+)\s*[kK][wW]/)
  const pcMatch = fullText.match(/[Pp]c\s*[=＝]\s*([\d.]+)\s*[kK][wW]/)
  const cosMatch = fullText.match(/cos\s*[φΦ]\s*[=＝]\s*([\d.]+)/)
  const icMatch = fullText.match(/[Ii]c\s*[=＝]\s*([\d.]+)\s*A/)
  if (pnMatch) powerParams.Pn = pnMatch[1] + ' kW'
  if (pcMatch) powerParams.Pc = pcMatch[1] + ' kW'
  if (cosMatch) powerParams['cosφ'] = cosMatch[1]
  if (icMatch) powerParams.Ic = icMatch[1] + ' A'

  // Branch circuits: WL1, WL2, etc.
  const branches = []
  const wlPattern = /WL\s*(\d+)\s*[:：]\s*([^\n]+)/gi
  let wlMatch
  while ((wlMatch = wlPattern.exec(fullText)) !== null) {
    branches.push({
      id: 'WL' + wlMatch[1],
      name: wlMatch[2].trim(),
    })
  }

  // Circuit breaker specs
  let mainBreaker = ''
  const breakerPatterns = [
    /(ATSE\s*[\d]+\s*A)/i,
    /(MCCB[/／][^\s]+)/i,
    /主开关[:：\s]*([^\n,，]+)/,
  ]
  for (const pat of breakerPatterns) {
    const m = fullText.match(pat)
    if (m) {
      mainBreaker = m[1].trim()
      break
    }
  }

  return {
    boxNumber,
    boxName,
    incomingWires,
    cableSpec,
    mainCircuit,
    backupCircuit,
    powerParams,
    mainBreaker,
    branches,
    rawText: text,
  }
}

/* ── Build tree structure from box info ── */
function buildBoxTree(info, fileName) {
  const box = {
    id: info.boxNumber,
    name: info.boxName,
    type: info.boxName.includes('一级') || info.boxName.includes('总配') ? '一级箱' :
          info.boxName.includes('二级') ? '二级箱' :
          info.boxName.includes('控制') ? '控制箱' : '二级箱',
    location: '',
    circuits: info.branches.length || 1,
    sourceFile: fileName,
    children: [],
    details: {
      incomingWires: info.incomingWires,
      cableSpec: info.cableSpec,
      mainCircuit: info.mainCircuit,
      backupCircuit: info.backupCircuit,
      powerParams: info.powerParams,
      mainBreaker: info.mainBreaker,
    },
  }

  // Add branch circuits as children
  for (const branch of info.branches) {
    box.children.push({
      id: info.boxNumber + '-' + branch.id,
      name: branch.name,
      type: '控制箱',
      location: '',
      circuits: 0,
      sourceFile: fileName,
      children: [],
    })
  }

  return box
}

/* ── Main entry: recognize boxes from a PDF file ── */
export async function recognizeFromPDF(file, onProgress) {
  const boxes = []

  // Step 1: Render each page to image
  const buf = await file.arrayBuffer()
  const data = new Uint8Array(buf)
  const doc = await pdfjsLib.getDocument({ data }).promise
  const numPages = doc.numPages

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress('rendering', i, numPages)

    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 2.5 })

    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise

    // Step 2: OCR
    if (onProgress) onProgress('ocr', i, numPages)
    const text = await ocrCanvas(canvas, (p) => {
      if (onProgress) onProgress('ocr-progress', i, numPages, p)
    })

    // Step 3: Parse
    if (onProgress) onProgress('parsing', i, numPages)
    const info = parseBoxInfo(text, file.name)
    const box = buildBoxTree(info, file.name)
    boxes.push(box)
  }

  doc.destroy()
  return boxes
}
