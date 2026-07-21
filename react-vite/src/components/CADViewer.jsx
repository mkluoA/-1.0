import { useState, useRef, useEffect, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

/* ── Configure PDF.js worker (CDN, well-tested for v4) ── */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

/* ── helpers ── */
function fmtPct(z) {
  if (z < 10) return z.toFixed(1) + '%'
  return Math.round(z) + '%'
}

/* ── Main Component ── */
export default function CADViewer({ file, className, style, ...qoderProps }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const pdfDocRef = useRef(null)
  const renderTaskRef = useRef(null)
  const rafRef = useRef(null)

  /* state */
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoomPct, setZoomPct] = useState(100)
  const [isMono, setIsMono] = useState(false)
  const [rotation, setRotation] = useState(0)

  /* refs for interaction (avoid re-renders on every mouse move) */
  const scaleRef = useRef(1)       // user zoom multiplier (1 = fit)
  const baseScaleRef = useRef(1)   // scale to fit page in container
  const panRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef(null)     // { sx, sy, px, py }

  /* ── Load PDF ── */
  useEffect(() => {
    if (!file) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const buf = await file.arrayBuffer()
        const data = new Uint8Array(buf)
        const loadingTask = pdfjsLib.getDocument({ data })
        const doc = await loadingTask.promise
        if (cancelled) { doc.destroy(); return }
        pdfDocRef.current = doc
        setTotalPages(doc.numPages)
        setPageNum(1)
        setRotation(0)
        scaleRef.current = 1
        baseScaleRef.current = 1
        panRef.current = { x: 0, y: 0 }
        setZoomPct(100)
        setLoading(false)
      } catch (e) {
        console.error('PDF load error:', e)
        if (!cancelled) {
          setError('无法加载 PDF 文件：' + (e?.message || e?.name || '未知错误'))
          setLoading(false)
        }
      }
    }
    load()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel() } catch { /* ignore */ }
      }
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy()
        pdfDocRef.current = null
      }
    }
  }, [file])

  /* ── Compute base scale (fit page to container) ── */
  const computeBaseScale = useCallback((page, rot) => {
    const container = containerRef.current
    if (!container || !page) return 1
    const viewport = page.getViewport({ scale: 1, rotation: rot })
    const cw = container.clientWidth - 40  // padding
    const ch = container.clientHeight - 40
    return Math.min(cw / viewport.width, ch / viewport.height)
  }, [])

  /* ── Render current page ── */
  const draw = useCallback(async () => {
    const doc = pdfDocRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!doc || !canvas || !container) return

    const ctx = canvas.getContext('2d')
    const pgNum = pageNum
    const rot = rotation

    /* Cancel previous render */
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel() } catch { /* ignore */ }
      renderTaskRef.current = null
    }

    try {
      const page = await doc.getPage(pgNum)

      /* Compute base scale */
      const bs = computeBaseScale(page, rot)
      baseScaleRef.current = bs

      const totalScale = bs * scaleRef.current
      const viewport = page.getViewport({ scale: totalScale, rotation: rot })

      const dpr = window.devicePixelRatio || 1
      const w = Math.floor(viewport.width)
      const h = Math.floor(viewport.height)

      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      /* Background */
      if (isMono) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.fillStyle = '#2a2a2a'
        ctx.fillRect(0, 0, w, h)
      }

      /* For dark mode, render PDF onto a white sub-canvas then composite */
      if (!isMono) {
        const offscreen = document.createElement('canvas')
        offscreen.width = canvas.width
        offscreen.height = canvas.height
        const offCtx = offscreen.getContext('2d')
        offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
        offCtx.fillStyle = '#ffffff'
        offCtx.fillRect(0, 0, w, h)

        const task = page.render({
          canvasContext: offCtx,
          viewport,
        })
        renderTaskRef.current = task
        await task.promise
        renderTaskRef.current = null

        /* Draw the offscreen canvas onto the main canvas */
        ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height, 0, 0, w, h)
      } else {
        /* Light mode: render directly */
        const task = page.render({
          canvasContext: ctx,
          viewport,
        })
        renderTaskRef.current = task
        await task.promise
        renderTaskRef.current = null
      }
    } catch (e) {
      if (e.name !== 'RenderingCancelledException') {
        console.error('Render error:', e)
      }
    }
  }, [pageNum, rotation, isMono, computeBaseScale])

  /* ── Schedule redraw (debounced via rAF) ── */
  const scheduleRedraw = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  /* ── Redraw when dependencies change ── */
  useEffect(() => {
    if (!loading && !error) {
      scheduleRedraw()
    }
  }, [loading, error, pageNum, rotation, isMono, scheduleRedraw])

  /* ── ResizeObserver ── */
  useEffect(() => {
    const container = containerRef.current
    if (!container || loading) return
    const ro = new ResizeObserver(() => {
      scheduleRedraw()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [loading, scheduleRedraw])

  /* ── Wheel: zoom ── */
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1 / 1.2 : 1.2
    const oldScale = scaleRef.current
    const newScale = Math.max(0.05, Math.min(50, oldScale * factor))
    scaleRef.current = newScale
    setZoomPct(newScale * 100)

    /* Zoom toward cursor */
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const ratio = newScale / oldScale
      panRef.current = {
        x: panRef.current.x - cx * (ratio - 1),
        y: panRef.current.y - cy * (ratio - 1),
      }
      canvas.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px)`
    }

    scheduleRedraw()
  }, [scheduleRedraw])

  /* ── Mouse drag: pan ── */
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    dragRef.current = {
      sx: e.clientX, sy: e.clientY,
      px: panRef.current.x, py: panRef.current.y,
    }
    e.preventDefault()
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const canvas = canvasRef.current
    panRef.current = {
      x: dragRef.current.px + (e.clientX - dragRef.current.sx),
      y: dragRef.current.py + (e.clientY - dragRef.current.sy),
    }
    if (canvas) {
      canvas.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px)`
    }
  }, [])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  /* ── Fit to view ── */
  const fitToView = useCallback(() => {
    scaleRef.current = 1
    panRef.current = { x: 0, y: 0 }
    setZoomPct(100)
    const canvas = canvasRef.current
    if (canvas) canvas.style.transform = 'translate(0px, 0px)'
    scheduleRedraw()
  }, [scheduleRedraw])

  /* ── Zoom controls ── */
  const zoomBy = useCallback((factor) => {
    const newScale = Math.max(0.05, Math.min(50, scaleRef.current * factor))
    scaleRef.current = newScale
    setZoomPct(newScale * 100)
    scheduleRedraw()
  }, [scheduleRedraw])

  /* ── Page navigation ── */
  const goToPage = useCallback((n) => {
    const clamped = Math.max(1, Math.min(totalPages, n))
    if (clamped !== pageNum) {
      setPageNum(clamped)
      /* Reset pan/zoom on page change */
      scaleRef.current = 1
      panRef.current = { x: 0, y: 0 }
      setZoomPct(100)
    }
  }, [totalPages, pageNum])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if (!pdfDocRef.current) return
      if (e.key === 't' || e.key === 'T' || e.key === ' ') {
        e.preventDefault()
        fitToView()
      }
      if (e.key === 'ArrowLeft' && totalPages > 1) {
        goToPage(pageNum - 1)
      }
      if (e.key === 'ArrowRight' && totalPages > 1) {
        goToPage(pageNum + 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fitToView, goToPage, pageNum, totalPages])

  /* ── Download ── */
  const handleDownload = useCallback(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name || 'drawing.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }, [file])

  /* ── Rotate ── */
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
    /* Reset pan on rotate */
    panRef.current = { x: 0, y: 0 }
    const canvas = canvasRef.current
    if (canvas) canvas.style.transform = 'translate(0px, 0px)'
  }, [])

  /* ── Error state ── */
  if (error) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-neutral-900 ${className || ''}`} style={style} {...qoderProps} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
        <div className="text-center" data-qoder-id="qel-text-center-8fe03e77" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-8fe03e77&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:323,&quot;column&quot;:9}}">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-qoder-id="qel-w-12-1d4b39c3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-12-1d4b39c3&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;w-12&quot;,&quot;loc&quot;:{&quot;line&quot;:324,&quot;column&quot;:11}}">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"  data-qoder-id="qel-path-d780ba87" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-d780ba87&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:325,&quot;column&quot;:13}}"/>
          </svg>
          <p className="text-neutral-400 text-sm" data-qoder-id="qel-text-neutral-400-7e30dfc4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-neutral-400-7e30dfc4&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-neutral-400&quot;,&quot;loc&quot;:{&quot;line&quot;:327,&quot;column&quot;:11}}">{error}</p>
        </div>
      </div>
    )
  }

  const mono = isMono

  return (
    <div
      className={`flex-1 flex flex-col ${mono ? 'bg-neutral-50' : 'bg-neutral-900'} ${className || ''}`}
      style={style}
      {...qoderProps}
     data-qoder-id="qel-div-9632850b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9632850b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:336,&quot;column&quot;:5}}">
      {/* ── Toolbar ── */}
      <div className={`flex items-center gap-3 px-3 py-1.5 text-xs border-b shrink-0 ${
        mono ? 'bg-white text-neutral-600 border-neutral-200' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
      }`} data-qoder-id="qel-div-95328378" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-95328378&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:342,&quot;column&quot;:7}}">
        <span className="font-medium truncate max-w-[180px]" data-qoder-id="qel-font-medium-9db0aa68" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-medium-9db0aa68&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;font-medium&quot;,&quot;loc&quot;:{&quot;line&quot;:345,&quot;column&quot;:9}}">{file?.name || 'PDF'}</span>
        <span className="opacity-60" data-qoder-id="qel-opacity-60-61763914" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-opacity-60-61763914&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;opacity-60&quot;,&quot;loc&quot;:{&quot;line&quot;:346,&quot;column&quot;:9}}">|</span>

        {/* Page navigation */}
        {totalPages > 1 && (
          <>
            <button
              onClick={() => goToPage(pageNum - 1)}
              disabled={pageNum <= 1}
              className={`px-1.5 py-0.5 rounded transition-colors disabled:opacity-30 ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`}
             data-qoder-id="qel-button-0b1becc6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-0b1becc6&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:351,&quot;column&quot;:13}}">◀</button>
            <span data-qoder-id="qel-span-737d1f0d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-737d1f0d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:356,&quot;column&quot;:13}}">{pageNum} / {totalPages}</span>
            <button
              onClick={() => goToPage(pageNum + 1)}
              disabled={pageNum >= totalPages}
              className={`px-1.5 py-0.5 rounded transition-colors disabled:opacity-30 ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`}
             data-qoder-id="qel-button-091be9a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-091be9a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:357,&quot;column&quot;:13}}">▶</button>
            <span className="opacity-60" data-qoder-id="qel-opacity-60-2407c05d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-opacity-60-2407c05d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;opacity-60&quot;,&quot;loc&quot;:{&quot;line&quot;:362,&quot;column&quot;:13}}">|</span>
          </>
        )}

        <button onClick={fitToView} className={`px-1.5 py-0.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`} data-qoder-id="qel-button-0f1bf312" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-0f1bf312&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:366,&quot;column&quot;:9}}">适应</button>
        <button onClick={() => zoomBy(1.2)} className={`px-1.5 py-0.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`} data-qoder-id="qel-button-101bf4a5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-101bf4a5&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:367,&quot;column&quot;:9}}">放大</button>
        <button onClick={() => zoomBy(1 / 1.2)} className={`px-1.5 py-0.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`} data-qoder-id="qel-button-0d1befec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-0d1befec&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:368,&quot;column&quot;:9}}">缩小</button>
        <span data-qoder-id="qel-span-6d7d159b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-6d7d159b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:369,&quot;column&quot;:9}}">{fmtPct(zoomPct)}</span>

        <span className="opacity-60" data-qoder-id="qel-opacity-60-1907af0c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-opacity-60-1907af0c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;opacity-60&quot;,&quot;loc&quot;:{&quot;line&quot;:371,&quot;column&quot;:9}}">|</span>
        <button onClick={handleRotate} className={`px-1.5 py-0.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`} data-qoder-id="qel-button-141bfaf1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-141bfaf1&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:372,&quot;column&quot;:9}}">旋转</button>
        <button onClick={() => setIsMono(!mono)} className={`px-1.5 py-0.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`} data-qoder-id="qel-button-a5190d9d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-a5190d9d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:373,&quot;column&quot;:9}}">
          {mono ? '深色' : '浅色'}
        </button>
        <button onClick={handleDownload} className={`px-1.5 py-0.5 rounded transition-colors ${mono ? 'hover:bg-neutral-100' : 'hover:bg-neutral-700'}`} data-qoder-id="qel-button-a4190c0a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-a4190c0a&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:376,&quot;column&quot;:9}}">下载</button>

        <div className="flex-1"  data-qoder-id="qel-flex-1-0ff639b1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-0ff639b1&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:378,&quot;column&quot;:9}}"/>
        <span className="opacity-40 text-[10px]" data-qoder-id="qel-opacity-40-729d0cfc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-opacity-40-729d0cfc&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;opacity-40&quot;,&quot;loc&quot;:{&quot;line&quot;:379,&quot;column&quot;:9}}">PDF.js · 滚轮缩放 · 拖拽平移{totalPages > 1 ? ' · ←→翻页' : ''}</span>
      </div>

      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden flex items-center justify-center ${
          mono ? 'bg-neutral-100' : 'bg-neutral-900'
        }`}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: dragRef.current ? 'grabbing' : 'grab' }}
       data-qoder-id="qel-div-20916cd9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-20916cd9&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:383,&quot;column&quot;:7}}">
        {loading ? (
          <div className="text-center" data-qoder-id="qel-text-center-c00201e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-c00201e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:396,&quot;column&quot;:11}}">
            <div className={`w-8 h-8 border-2 border-neutral-600 border-t-neutral-300 rounded-full animate-spin mx-auto mb-3`}  data-qoder-id="qel-div-1e9169b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1e9169b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:397,&quot;column&quot;:13}}"/>
            <p className="text-neutral-500 text-sm" data-qoder-id="qel-text-neutral-500-cf2e962b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-neutral-500-cf2e962b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;text-neutral-500&quot;,&quot;loc&quot;:{&quot;line&quot;:398,&quot;column&quot;:13}}">正在加载 PDF…</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-lg"
            style={{
              transform: `translate(${panRef.current.x}px, ${panRef.current.y}px)`,
              transition: dragRef.current ? 'none' : 'transform 0.1s',
            }}
           data-qoder-id="qel-shadow-lg-16e1462d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-shadow-lg-16e1462d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/CADViewer.jsx&quot;,&quot;componentName&quot;:&quot;CADViewer&quot;,&quot;elementRole&quot;:&quot;shadow-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:401,&quot;column&quot;:11}}"/>
        )}
      </div>
    </div>
  )
}
