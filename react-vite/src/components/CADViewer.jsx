import { useState, useRef, useEffect, useCallback } from 'react'
import DxfParser from 'dxf-parser'
import { convertDwgToDxf, CDN_WASM_BASE } from 'dwgdxf'

/* ─── colour palette for layers (AutoCAD ACI bright colours for dark bg) ─── */
const LAYER_COLORS = [
  '#ffffff', // white (ACI 7)
  '#ffff00', // yellow (ACI 2)
  '#00ffff', // cyan (ACI 4)
  '#ff0000', // red (ACI 1)
  '#00ff00', // green (ACI 3)
  '#ff00ff', // magenta (ACI 6)
  '#4169e1', // royal blue (ACI 5 alt)
  '#ff8c00', // dark orange
  '#00ced1', // dark turquoise
  '#adff2f', // green yellow
  '#ff69b4', // hot pink
  '#87ceeb', // sky blue
  '#ffd700', // gold
  '#dda0dd', // plum
  '#98fb98', // pale green
]

function colorForLayer(name, layerMap) {
  if (!layerMap[name]) {
    const idx = Object.keys(layerMap).length % LAYER_COLORS.length
    layerMap[name] = LAYER_COLORS[idx]
  }
  return layerMap[name]
}

/* ─── collect all entities (expand block INSERTs) ─── */
function collectEntities(dxf) {
  const entities = []
  const blocks = dxf.blocks || {}

  if (dxf.entities) {
    for (const ent of dxf.entities) {
      if (ent.type === 'INSERT' && blocks[ent.name]) {
        const block = blocks[ent.name]
        const pos = ent.position || { x: 0, y: 0 }
        const sx = ent.xScale || 1
        const sy = ent.yScale || sx
        const rot = (ent.rotation || 0) * Math.PI / 180
        const cosR = Math.cos(rot)
        const sinR = Math.sin(rot)
        for (const bEnt of (block.entities || [])) {
          const transformed = JSON.parse(JSON.stringify(bEnt))
          transformed.layer = transformed.layer || ent.layer || '0'
          transformEntity(transformed, pos, sx, sy, cosR, sinR)
          entities.push(transformed)
        }
        // Also expand attribute values attached to this INSERT instance
        if (ent.attribs && ent.attribs.length > 0) {
          for (const attr of ent.attribs) {
            const transformed = JSON.parse(JSON.stringify(attr))
            transformed.type = transformed.type || 'ATTRIB'
            transformed.layer = transformed.layer || ent.layer || '0'
            transformEntity(transformed, pos, sx, sy, cosR, sinR)
            entities.push(transformed)
          }
        }
      }
      entities.push(ent)
    }
  }
  return entities
}

function transformEntity(ent, offset, sx, sy, cosR = 1, sinR = 0) {
  const tx = (x, y) => {
    const lx = x * sx, ly = y * sy
    return { x: lx * cosR - ly * sinR + offset.x, y: lx * sinR + ly * cosR + offset.y }
  }
  if (ent.center) { const p = tx(ent.center.x, ent.center.y); ent.center.x = p.x; ent.center.y = p.y }
  if (ent.vertices) { ent.vertices = ent.vertices.map(v => { const p = tx(v.x, v.y); return { ...v, x: p.x, y: p.y } }) }
  if (ent.controlPoints) { ent.controlPoints = ent.controlPoints.map(v => { const p = tx(v.x, v.y); return { ...v, x: p.x, y: p.y } }) }
  if (ent.fitPoints) { ent.fitPoints = ent.fitPoints.map(v => { const p = tx(v.x, v.y); return { ...v, x: p.x, y: p.y } }) }
  if (ent.position) { const p = tx(ent.position.x, ent.position.y); ent.position.x = p.x; ent.position.y = p.y }
  if (ent.startPoint) { const p = tx(ent.startPoint.x, ent.startPoint.y); ent.startPoint.x = p.x; ent.startPoint.y = p.y }
  if (ent.endPoint) { const p = tx(ent.endPoint.x, ent.endPoint.y); ent.endPoint.x = p.x; ent.endPoint.y = p.y }
  if (ent.points) { ent.points = ent.points.map(v => { const p = tx(v.x || 0, v.y || 0); return { ...v, x: p.x, y: p.y } }) }
}

/* ─── get bounding box from DXF header (reliable) or entities ─── */
function getBBox(dxf, entities) {
  // Prefer DXF header extents ($EXTMIN / $EXTMAX)
  const header = dxf.header || {}
  const extMin = header.$EXTMIN
  const extMax = header.$EXTMAX

  if (extMin && extMax && isFinite(extMin.x) && isFinite(extMin.y) && isFinite(extMax.x) && isFinite(extMax.y)) {
    const pad = Math.max((extMax.x - extMin.x) * 0.03, (extMax.y - extMin.y) * 0.03, 10)
    return {
      minX: extMin.x - pad, maxX: extMax.x + pad,
      minY: extMin.y - pad, maxY: extMax.y + pad,
    }
  }

  // Fallback: compute from entities with percentile filtering
  const allX = [], allY = []
  for (const e of entities) {
    const pts = []
    if (e.center) pts.push(e.center)
    if (e.vertices) pts.push(...e.vertices)
    if (e.controlPoints) pts.push(...e.controlPoints)
    if (e.fitPoints) pts.push(...e.fitPoints)
    if (e.position) pts.push(e.position)
    if (e.startPoint) pts.push(e.startPoint)
    if (e.endPoint) pts.push(e.endPoint)
    if (e.points) pts.push(...e.points)
    for (const p of pts) {
      if (isFinite(p.x)) allX.push(p.x)
      if (isFinite(p.y)) allY.push(p.y)
    }
  }
  if (allX.length === 0) return { minX: -100, maxX: 100, minY: -100, maxY: 100 }

  allX.sort((a, b) => a - b)
  allY.sort((a, b) => a - b)
  const lo = arr => arr[Math.floor(arr.length * 0.02)]
  const hi = arr => arr[Math.min(arr.length - 1, Math.ceil(arr.length * 0.98) - 1)]
  const minX = lo(allX), maxX = hi(allX)
  const minY = lo(allY), maxY = hi(allY)
  const pad = Math.max((maxX - minX) * 0.03, (maxY - minY) * 0.03, 10)
  return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad }
}

/* ─── strip MTEXT / ATTDEF formatting codes ─── */
function stripFormatting(text) {
  if (!text) return ''
  return text
    .replace(/\\[PHFAWCLQOST][^;]*;?/g, '')  // \P, \H..., \F..., etc.
    .replace(/\\f[^;]*;?/g, '')                 // \f font reset
    .replace(/\\[pP][+-]?[0-9.,]+/g, '')       // paragraph formatting
    .replace(/\\[{}]/g, '')                      // escaped braces
    .replace(/[{}]/g, '')                        // literal braces
    .replace(/%%[uUoOdDcCpP]/g, '')             // %%u %%o %%d %%c %%p
    .replace(/\s+/g, ' ')                       // collapse whitespace
    .trim()
}

/* ─── draw a single entity on Canvas 2D ─── */
function drawEntity(ctx, entity, color, lineWidth, effectiveScale, isMono) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth

  switch (entity.type) {
    case 'LINE': {
      const v = entity.vertices || []
      if (v.length < 2) return
      ctx.beginPath()
      ctx.moveTo(v[0].x, -v[0].y)
      ctx.lineTo(v[1].x, -v[1].y)
      ctx.stroke()
      return
    }
    case 'CIRCLE': {
      const c = entity.center || {}
      const r = entity.radius || 0
      if (!r) return
      ctx.beginPath()
      ctx.arc(c.x, -c.y, r, 0, Math.PI * 2)
      ctx.stroke()
      return
    }
    case 'ARC': {
      const c = entity.center || {}
      const r = entity.radius || 0
      if (!r) return
      const sa = -(entity.endAngle || 360) * Math.PI / 180
      const ea = -(entity.startAngle || 0) * Math.PI / 180
      ctx.beginPath()
      ctx.arc(c.x, -c.y, r, sa, ea, false)
      ctx.stroke()
      return
    }
    case 'ELLIPSE': {
      const c = entity.center || {}
      const ep = entity.endPoint || {}
      const rx = Math.sqrt(ep.x * ep.x + ep.y * ep.y)
      if (!rx) return
      const ry = rx * (entity.axisRatio || 1)
      const angle = Math.atan2(ep.y, ep.x)
      const startParam = entity.startParam || 0
      const endParam = entity.endParam || Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(c.x, -c.y, rx, ry, -angle, -endParam, -startParam)
      ctx.stroke()
      return
    }
    case 'LWPOLYLINE':
    case 'POLYLINE': {
      const verts = entity.vertices || []
      if (verts.length < 2) return
      ctx.beginPath()
      ctx.moveTo(verts[0].x, -verts[0].y)
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i].x, -verts[i].y)
      }
      if (entity.shape || entity.closed) ctx.closePath()
      ctx.stroke()
      return
    }
    case 'SPLINE': {
      const pts = entity.controlPoints || entity.fitPoints || []
      if (pts.length < 2) return
      ctx.beginPath()
      ctx.moveTo(pts[0].x, -pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, -pts[i].y)
      }
      ctx.stroke()
      return
    }
    case 'TEXT':
    case 'MTEXT': {
      const pos = entity.position || entity.startPoint || {}
      const text = stripFormatting(entity.text || entity.string || '')
      if (!text) return
      // Use original CAD text height directly — scales naturally with zoom
      const fontSize = entity.textHeight || entity.height || 1
      ctx.save()
      ctx.translate(pos.x, -pos.y)
      ctx.scale(1, -1) // flip text upright
      ctx.font = `${fontSize}px sans-serif`
      // White text on dark bg (CAD style), entity color on white bg (mono)
      ctx.fillStyle = isMono ? color : '#ffffff'
      ctx.fillText(text, 0, 0)
      ctx.restore()
      return
    }
    case 'ATTDEF':
    case 'ATTRIB': {
      // ATTDEF: attribute definitions in title blocks (drawing name, number, etc.)
      // ATTRIB: attribute values on block inserts
      const pos = entity.position || entity.startPoint || {}
      // Prefer the actual text value; fall back to tag or prompt
      const text = stripFormatting(entity.text || entity.string || entity.tag || entity.prompt || '')
      if (!text) return
      const fontSize = entity.textHeight || entity.height || 1
      ctx.save()
      ctx.translate(pos.x, -pos.y)
      ctx.scale(1, -1)
      ctx.font = `${fontSize}px sans-serif`
      ctx.fillStyle = isMono ? color : '#ffffff'
      ctx.fillText(text, 0, 0)
      ctx.restore()
      return
    }
    case 'INSERT': {
      // Block contents are already expanded via collectEntities.
      // No marker needed — PDF output doesn't show insertion points.
      return
    }
    case 'SOLID':
    case '3DFACE': {
      const pts = entity.points || entity.vertices || []
      if (pts.length < 3) return
      ctx.beginPath()
      ctx.moveTo(pts[0].x, -(pts[0].y || 0))
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, -(pts[i].y || 0))
      }
      ctx.closePath()
      ctx.globalAlpha = 0.1
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.stroke()
      return
    }
    case 'DIMENSION': {
      const defPts = entity.anchorPoint ? [entity.anchorPoint] : []
      if (entity.middleOfText) defPts.push(entity.middleOfText)
      if (defPts.length < 2) return
      ctx.setLineDash([lineWidth * 4, lineWidth * 2])
      ctx.beginPath()
      ctx.moveTo(defPts[0].x, -defPts[0].y)
      ctx.lineTo(defPts[1].x, -defPts[1].y)
      ctx.stroke()
      ctx.setLineDash([])
      return
    }
  }
}

/* ═══ CAD Viewer Component (Canvas 2D) ═══ */
export default function CADViewer({ file, ...qoderProps }) {
  const canvasRef = useRef(null)
  const dataRef = useRef(null) // { entities, layerMap, bbox, layers }
  const viewRef = useRef({ panX: 0, panY: 0, zoom: 1 })
  const dragRef = useRef(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [layers, setLayers] = useState([])
  const [zoom, setZoom] = useState(1)
  const [mono, setMono] = useState(false) // colored mode by default (matches CAD model space)
  const monoRef = useRef(false)

  const isDwg = file.name.toLowerCase().endsWith('.dwg')

  /* Parse and prepare data */
  useEffect(() => {
    let cancelled = false

    async function parse() {
      setLoading(true)
      setError(null)

      try {
        let dxfText

        if (isDwg) {
          const dwgBuf = await file.arrayBuffer()
          const dxfBytes = await convertDwgToDxf(new Uint8Array(dwgBuf), { wasmBase: CDN_WASM_BASE })
          dxfText = new TextDecoder('utf-8').decode(dxfBytes)
        } else {
          dxfText = await file.text()
        }

        const parser = new DxfParser()
        const dxf = parser.parseSync(dxfText)
        if (cancelled) return

        const layerMap = {}
        if (dxf.tables?.layer?.layers) {
          Object.keys(dxf.tables.layer.layers).forEach(name => colorForLayer(name, layerMap))
        }

        const entities = collectEntities(dxf)
        const bbox = getBBox(dxf, entities)

        let rendered = 0
        for (const ent of entities) {
          if (['LINE', 'CIRCLE', 'ARC', 'ELLIPSE', 'LWPOLYLINE', 'POLYLINE', 'SPLINE', 'TEXT', 'MTEXT', 'ATTDEF', 'ATTRIB', 'INSERT', 'SOLID', '3DFACE', 'DIMENSION'].includes(ent.type)) {
            rendered++
          }
        }

        dataRef.current = { entities, layerMap, bbox, layerList: Object.keys(layerMap) }
        setStats({ total: entities.length, rendered })
        setLayers(Object.keys(layerMap).map(name => ({ name, color: layerMap[name] })))

        // Reset view to fit
        viewRef.current = { panX: 0, panY: 0, zoom: 1 }
        setZoom(1)
        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          console.error('CAD parse error:', err)
          setError(isDwg ? 'DWG_CONVERT_FAIL' : 'PARSE_FAIL')
          setLoading(false)
        }
      }
    }

    parse()
    return () => { cancelled = true }
  }, [file, isDwg])

  /* Draw on canvas whenever view changes or data is ready */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !dataRef.current) return

    const { entities, layerMap, bbox } = dataRef.current
    const { panX, panY, zoom: z } = viewRef.current
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    canvas.width = w * dpr
    canvas.height = h * dpr

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Clear — dark background like AutoCAD model space, white in mono mode
    const isMono = monoRef.current
    ctx.fillStyle = isMono ? '#ffffff' : '#1a1a1a'
    ctx.fillRect(0, 0, w, h)

    // Compute transform: CAD → screen
    const bboxW = bbox.maxX - bbox.minX
    const bboxH = bbox.maxY - bbox.minY
    if (bboxW <= 0 || bboxH <= 0) return

    const fitScale = Math.min(w / bboxW, h / bboxH)
    const scale = fitScale * z

    // Center the drawing
    const offsetX = (w - bboxW * scale) / 2
    const offsetY = (h - bboxH * scale) / 2

    ctx.save()
    ctx.translate(offsetX + panX, offsetY + panY)
    ctx.scale(scale, scale)
    ctx.translate(-bbox.minX, bbox.maxY)
    ctx.scale(1, -1) // flip Y

    // Adaptive line width in CAD units
    const lw = Math.max(bboxW, bboxH) * 0.0006 / z

    // Draw all entities
    for (const ent of entities) {
      let color
      if (isMono) {
        color = '#1a1a1a'
      } else {
        color = colorForLayer(ent.layer || '0', layerMap)
      }
      drawEntity(ctx, ent, color, lw, scale, isMono)
    }

    ctx.restore()
  }, [])

  /* Redraw when data, view, or color mode changes */
  useEffect(() => {
    monoRef.current = mono
    if (!loading && !error) {
      draw()
    }
  }, [loading, error, zoom, draw, mono])

  /* Resize observer */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return

    const ro = new ResizeObserver(() => {
      if (dataRef.current) draw()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [draw])

  /* Fit-to-view helper */
  const fitToView = useCallback(() => {
    viewRef.current = { panX: 0, panY: 0, zoom: 1 }
    setZoom(1)
  }, [])

  /* Pan & Zoom handlers */
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    if (!dataRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    const { bbox } = dataRef.current
    const bboxW = bbox.maxX - bbox.minX
    const bboxH = bbox.maxY - bbox.minY
    if (bboxW <= 0 || bboxH <= 0) return

    // Mouse position relative to canvas
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // Current view state
    const oldZoom = viewRef.current.zoom
    const oldPanX = viewRef.current.panX
    const oldPanY = viewRef.current.panY

    const oldFitScale = Math.min(w / bboxW, h / bboxH)
    const oldScale = oldFitScale * oldZoom
    const oldOffsetX = (w - bboxW * oldScale) / 2
    const oldOffsetY = (h - bboxH * oldScale) / 2

    // World coord under cursor BEFORE zoom
    const worldX = (mx - oldOffsetX - oldPanX) / oldScale + bbox.minX
    const worldY = bbox.maxY - (my - oldOffsetY - oldPanY) / oldScale

    // New zoom (faster: 1.2x per tick)
    const delta = e.deltaY > 0 ? 1 / 1.2 : 1.2
    const newZoom = Math.max(0.05, Math.min(5000, oldZoom * delta))

    const newScale = oldFitScale * newZoom
    const newOffsetX = (w - bboxW * newScale) / 2
    const newOffsetY = (h - bboxH * newScale) / 2

    // Adjust pan so worldX,worldY stays under cursor
    const newPanX = mx - newOffsetX - (worldX - bbox.minX) * newScale
    const newPanY = my - newOffsetY - (bbox.maxY - worldY) * newScale

    viewRef.current = { panX: newPanX, panY: newPanY, zoom: newZoom }
    setZoom(newZoom)
  }, [])

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: viewRef.current.panX, startPanY: viewRef.current.panY }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    viewRef.current.panX = dragRef.current.startPanX + (e.clientX - dragRef.current.startX)
    viewRef.current.panY = dragRef.current.startPanY + (e.clientY - dragRef.current.startY)
    draw()
  }, [draw])

  const handleMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const resetView = () => { fitToView() }
  const zoomIn = () => { const z = Math.min(5000, viewRef.current.zoom * 1.5); viewRef.current.zoom = z; setZoom(z) }
  const zoomOut = () => { const z = Math.max(0.05, viewRef.current.zoom / 1.5); viewRef.current.zoom = z; setZoom(z) }

  /* Keyboard shortcuts: T or Space = fit to view */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 't' || e.key === 'T' || e.key === ' ') {
        e.preventDefault()
        fitToView()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fitToView])

  /* Loading state */
  if (loading) {
    return (
      <div className={["flex-1 flex items-center justify-center bg-neutral-50", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
        <div className="text-center" data-qoder-id="qel-text-center-8fe03e77" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-8fe03e77&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:421,&quot;column&quot;:9}}">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"  data-qoder-id="qel-w-8-f564fe9f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-8-f564fe9f&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;w-8&quot;,&quot;loc&quot;:{&quot;line&quot;:422,&quot;column&quot;:11}}"/>
          <p className="text-sm text-muted-foreground" data-qoder-id="qel-text-sm-b22f7593" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-b22f7593&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:423,&quot;column&quot;:11}}">{isDwg ? '正在加载 WASM 引擎并转换 DWG 文件...' : '正在解析 CAD 文件...'}</p>
        </div>
      </div>
    )
  }

  /* DWG convert failure */
  if (error === 'DWG_CONVERT_FAIL') {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50 p-8" data-qoder-id="qel-flex-1-df43f3ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-df43f3ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:432,&quot;column&quot;:7}}">
        <div className="bg-white rounded-xl p-8 text-center max-w-md shadow-lg" data-qoder-id="qel-bg-white-b07ddf6b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-white-b07ddf6b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;bg-white&quot;,&quot;loc&quot;:{&quot;line&quot;:433,&quot;column&quot;:9}}">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4" data-qoder-id="qel-w-16-3e25d55c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-16-3e25d55c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;w-16&quot;,&quot;loc&quot;:{&quot;line&quot;:434,&quot;column&quot;:11}}">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600" data-qoder-id="qel-text-amber-600-ddfa68a7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-amber-600-ddfa68a7&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-amber-600&quot;,&quot;loc&quot;:{&quot;line&quot;:435,&quot;column&quot;:13}}">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"  data-qoder-id="qel-path-ca80a610" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-ca80a610&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:436,&quot;column&quot;:15}}"/>
              <line x1="12" y1="9" x2="12" y2="13"  data-qoder-id="qel-line-93688762" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-93688762&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:437,&quot;column&quot;:15}}"/><line x1="12" y1="17" x2="12.01" y2="17"  data-qoder-id="qel-line-946888f5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-946888f5&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:437,&quot;column&quot;:54}}"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" data-qoder-id="qel-text-lg-8c87df58" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-8c87df58&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:440,&quot;column&quot;:11}}">DWG 转换失败</h3>
          <p className="text-sm text-muted-foreground mb-4" data-qoder-id="qel-text-sm-b8bdd5ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-b8bdd5ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:441,&quot;column&quot;:11}}">
            WASM 引擎无法转换此 DWG 文件，可能是版本不兼容或文件已损坏。
            请尝试在 CAD 软件中另存为 DXF 格式后重新上传。
          </p>
        </div>
      </div>
    )
  }

  /* Parse failure */
  if (error === 'PARSE_FAIL') {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50 p-8" data-qoder-id="qel-flex-1-7fee9b3c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-7fee9b3c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:453,&quot;column&quot;:7}}">
        <div className="bg-white rounded-xl p-8 text-center max-w-md shadow-lg" data-qoder-id="qel-bg-white-34336ced" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-white-34336ced&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;bg-white&quot;,&quot;loc&quot;:{&quot;line&quot;:454,&quot;column&quot;:9}}">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4" data-qoder-id="qel-w-16-af899600" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-16-af899600&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;w-16&quot;,&quot;loc&quot;:{&quot;line&quot;:455,&quot;column&quot;:11}}">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600" data-qoder-id="qel-text-red-600-8b59a595" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-red-600-8b59a595&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-red-600&quot;,&quot;loc&quot;:{&quot;line&quot;:456,&quot;column&quot;:13}}">
              <circle cx="12" cy="12" r="10"  data-qoder-id="qel-circle-0e905826" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-0e905826&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:457,&quot;column&quot;:15}}"/><line x1="15" y1="9" x2="9" y2="15"  data-qoder-id="qel-line-9c68958d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-9c68958d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:457,&quot;column&quot;:48}}"/><line x1="9" y1="9" x2="15" y2="15"  data-qoder-id="qel-line-8d663f59" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-8d663f59&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:457,&quot;column&quot;:86}}"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" data-qoder-id="qel-text-lg-878598e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-878598e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:460,&quot;column&quot;:11}}">文件解析失败</h3>
          <p className="text-sm text-muted-foreground" data-qoder-id="qel-text-sm-29c54395" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-29c54395&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:461,&quot;column&quot;:11}}">
            无法解析该 CAD 文件，可能文件格式不标准或已损坏。请确认文件为有效的 DXF 格式后重试。
          </p>
        </div>
      </div>
    )
  }

  /* Success – Canvas viewer */
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${mono ? 'bg-neutral-100' : 'bg-neutral-900'}`} data-qoder-id="qel-flex-1-0ef6381e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-0ef6381e&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:471,&quot;column&quot;:5}}">
      {/* Toolbar */}
      <div className={`h-10 border-b flex items-center justify-between px-3 shrink-0 ${mono ? 'bg-white border-neutral-200' : 'bg-neutral-800 border-neutral-700'}`} data-qoder-id="qel-h-10-c436ff76" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-10-c436ff76&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;h-10&quot;,&quot;loc&quot;:{&quot;line&quot;:473,&quot;column&quot;:7}}">
        <div className={`flex items-center gap-2 text-xs ${mono ? 'text-neutral-500' : 'text-gray-400'}`} data-qoder-id="qel-flex-636da746" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-636da746&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:474,&quot;column&quot;:9}}">
          {stats && (
            <>
              <span data-qoder-id="qel-span-6e7ad897" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-6e7ad897&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:477,&quot;column&quot;:15}}">实体: {stats.total}</span>
              <span className="text-border" data-qoder-id="qel-text-border-3aab32b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-border-3aab32b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-border&quot;,&quot;loc&quot;:{&quot;line&quot;:478,&quot;column&quot;:15}}">|</span>
              <span data-qoder-id="qel-span-647ac8d9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-647ac8d9&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:479,&quot;column&quot;:15}}">已渲染: {stats.rendered}</span>
              {layers.length > 0 && (
                <>
                  <span className="text-border" data-qoder-id="qel-text-border-3cab35d8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-border-3cab35d8&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-border&quot;,&quot;loc&quot;:{&quot;line&quot;:482,&quot;column&quot;:19}}">|</span>
                  <span data-qoder-id="qel-span-66788d68" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-66788d68&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:483,&quot;column&quot;:19}}">图层: {layers.length}</span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1" data-qoder-id="qel-flex-636b68af" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-636b68af&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:489,&quot;column&quot;:9}}">
          <button onClick={() => setMono(!mono)} className={`px-2 py-1 rounded text-xs transition-colors ${mono ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-600 text-white hover:bg-neutral-500'}`} title={mono ? '切换到彩色模式' : '切换到黑白模式'} data-qoder-id="qel-button-a116c8ba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-a116c8ba&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:589,&quot;column&quot;:11}}">
            {mono ? '黑白' : '彩色'}
          </button>
          <span className={`mx-0.5 ${mono ? 'text-neutral-300' : 'text-neutral-600'}`} data-qoder-id="qel-text-border-4ea91397" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-border-4ea91397&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-border&quot;,&quot;loc&quot;:{&quot;line&quot;:592,&quot;column&quot;:11}}">|</span>
          <button onClick={zoomIn} className={`p-1.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100 text-neutral-600' : 'hover:bg-neutral-700 text-gray-300'}`} title="放大" data-qoder-id="qel-p-1-5-53aa7c0c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-1-5-53aa7c0c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;p-1-5&quot;,&quot;loc&quot;:{&quot;line&quot;:490,&quot;column&quot;:11}}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-qoder-id="qel-svg-7251491f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-7251491f&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:610,&quot;column&quot;:13}}"><circle cx="11" cy="11" r="8" data-qoder-id="qel-circle-088bd186" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-088bd186&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:610,&quot;column&quot;:111}}"/><line x1="21" y1="21" x2="16.65" y2="16.65" data-qoder-id="qel-line-8e640255" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-8e640255&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:610,&quot;column&quot;:142}}"/><line x1="11" y1="8" x2="11" y2="14" data-qoder-id="qel-line-8f6403e8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-8f6403e8&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:610,&quot;column&quot;:187}}"/><line x1="8" y1="11" x2="14" y2="11" data-qoder-id="qel-line-9064057b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-9064057b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:610,&quot;column&quot;:225}}"/></svg>
          </button>
          <button onClick={zoomOut} className={`p-1.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100 text-neutral-600' : 'hover:bg-neutral-700 text-gray-300'}`} title="缩小" data-qoder-id="qel-p-1-5-5daa8bca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-1-5-5daa8bca&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;p-1-5&quot;,&quot;loc&quot;:{&quot;line&quot;:493,&quot;column&quot;:11}}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-qoder-id="qel-svg-7662988c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-7662988c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:613,&quot;column&quot;:13}}"><circle cx="11" cy="11" r="8" data-qoder-id="qel-circle-06898fc9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-06898fc9&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:613,&quot;column&quot;:111}}"/><line x1="21" y1="21" x2="16.65" y2="16.65" data-qoder-id="qel-line-927551c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-927551c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:613,&quot;column&quot;:142}}"/><line x1="8" y1="11" x2="14" y2="11" data-qoder-id="qel-line-8d7549e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-line-8d7549e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;line&quot;,&quot;loc&quot;:{&quot;line&quot;:613,&quot;column&quot;:187}}"/></svg>
          </button>
          <span className={`text-xs w-12 text-center ${mono ? 'text-neutral-500' : 'text-gray-400'}`} data-qoder-id="qel-text-xs-26337825" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-26337825&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:496,&quot;column&quot;:11}}">{Math.round(zoom * 100)}%</span>
          <button onClick={resetView} className={`p-1.5 rounded transition-colors text-xs ${mono ? 'hover:bg-neutral-100 text-neutral-600' : 'hover:bg-neutral-700 text-gray-300'}`} title="重置视图" data-qoder-id="qel-p-1-5-e3b21a81" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-1-5-e3b21a81&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;p-1-5&quot;,&quot;loc&quot;:{&quot;line&quot;:497,&quot;column&quot;:11}}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-qoder-id="qel-svg-74629566" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-svg-74629566&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;svg&quot;,&quot;loc&quot;:{&quot;line&quot;:617,&quot;column&quot;:13}}"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" data-qoder-id="qel-path-fea5faad" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-fea5faad&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:617,&quot;column&quot;:111}}"/><path d="M3 3v5h5" data-qoder-id="qel-path-fda5f91a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-fda5f91a&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:617,&quot;column&quot;:169}}"/></svg>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
       data-qoder-id="qel-flex-1-11faba05" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-11faba05&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:504,&quot;column&quot;:7}}">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
         data-qoder-id="qel-canvas-cb1c707c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-canvas-cb1c707c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;canvas&quot;,&quot;loc&quot;:{&quot;line&quot;:512,&quot;column&quot;:9}}"/>
      </div>

      {/* Layer legend (only in color mode) */}
      {layers.length > 0 && !mono && (
        <div className="bg-neutral-800 border-t border-neutral-700 px-3 py-2 max-h-24 overflow-auto shrink-0" data-qoder-id="qel-bg-white-3728e44a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-white-3728e44a&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;bg-white&quot;,&quot;loc&quot;:{&quot;line&quot;:520,&quot;column&quot;:9}}">
          <div className="flex flex-wrap gap-x-3 gap-y-1" data-qoder-id="qel-flex-f766417d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-f766417d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:521,&quot;column&quot;:11}}">
            {layers.map(l => (
              <div key={l.name} className="flex items-center gap-1 text-xs" data-qoder-id="qel-flex-f4663cc4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-f4663cc4&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:523,&quot;column&quot;:15}}">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }}  data-qoder-id="qel-w-2-5-3517aba5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-2-5-3517aba5&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;w-2-5&quot;,&quot;loc&quot;:{&quot;line&quot;:524,&quot;column&quot;:17}}"/>
                <span className="text-gray-400 truncate max-w-24" data-qoder-id="qel-text-muted-foreground-15ac685f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-15ac685f&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:525,&quot;column&quot;:17}}">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
