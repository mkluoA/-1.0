import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CADViewer from '@/components/CADViewer'
import { recognizeFromPDF } from '@/services/ocrService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Upload, FileText, ChevronRight, ChevronDown,
  Search, Download, Plus, FolderOpen, Trash2,
  CheckCircle2, AlertCircle, MoreHorizontal, X,
  Settings, Bell, Layers, Eye, ArrowLeft, Home,
  Box, CircuitBoard, FileImage, File, ZoomIn, ZoomOut
} from 'lucide-react'

/* ─── helpers ─── */
const ACCEPTED_TYPES = '.pdf,.png,.jpg,.jpeg,.bmp,.tif,.tiff'

function getFileCategory(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'bmp', 'tif', 'tiff'].includes(ext)) return 'image'
  return 'other'
}

function categoryIcon(cat) {
  switch (cat) {
    case 'pdf': return FileText
    case 'image': return FileImage
    default: return File
  }
}

function categoryColor(cat) {
  switch (cat) {
    case 'pdf': return 'text-red-600 bg-red-50'
    case 'image': return 'text-emerald-600 bg-emerald-50'
    default: return 'text-muted-foreground bg-muted'
  }
}

function fmtSize(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

const typeColors = {
  '一级箱': 'bg-blue-100 text-blue-700 border-blue-200',
  '二级箱': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '三级箱': 'bg-amber-100 text-amber-700 border-amber-200',
  '控制箱': 'bg-purple-100 text-purple-700 border-purple-200',
}

/* ─── generate mock recognition result from file name ─── */
function fakeRecognize(fileName) {
  const base = fileName.replace(/\.[^.]+$/, '')
  const boxes = []
  const r = (n) => Math.floor(Math.random() * n) + 1
  const l1Id = `AL-${String(r(9)).padStart(2, '0')}`
  const l1 = {
    id: l1Id, name: `${base} 总配电箱`, type: '一级箱',
    location: '配电间', circuits: r(8) + 4, sourceFile: fileName,
    children: [],
  }
  const l2Count = r(3) + 1
  for (let i = 0; i < l2Count; i++) {
    const l2Id = `${l1Id}-${String(i + 1).padStart(2, '0')}`
    const l2 = {
      id: l2Id, name: `${i + 1}F ${['照明', '动力', '应急'][i % 3]}配电箱`,
      type: '二级箱', location: `${i + 1}层电气井`, circuits: r(6) + 2,
      sourceFile: fileName, children: [],
    }
    const l3Count = r(2)
    for (let j = 0; j < l3Count; j++) {
      const l3Id = `${l2Id}-${String(j + 1).padStart(2, '0')}`
      l2.children.push({
        id: l3Id, name: `${i + 1}F-${j + 1} ${['照明', '插座', '空调'][j % 3]}控制箱`,
        type: j === 0 ? '三级箱' : '控制箱', location: `${i + 1}层`, circuits: r(4) + 1,
        sourceFile: fileName, children: [],
      })
    }
    l1.children.push(l2)
  }
  boxes.push(l1)
  return boxes
}

/* ─── File Viewer Component ─── */
function FileViewer({ file, onClose, ...qoderProps }) {
  const [zoom, setZoom] = useState(1)
  const urlRef = useRef(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    urlRef.current = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const cat = getFileCategory(file.name)
  const url = urlRef.current

  return (
    <div className={["fixed inset-0 z-50 bg-black/70 flex flex-col", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {/* Header */}
      <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0" data-qoder-id="qel-h-14-689ad945" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-14-689ad945&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;h-14&quot;,&quot;loc&quot;:{&quot;line&quot;:107,&quot;column&quot;:7}}">
        <div className="flex items-center gap-3" data-qoder-id="qel-flex-d8cf7d6b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-d8cf7d6b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:9}}">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} data-qoder-id="qel-h-8-46d605f5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-8-46d605f5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;h-8&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:11}}">
            <X className="w-4 h-4"  data-qoder-id="qel-w-4-393cbc73" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-393cbc73&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:13}}"/>
          </Button>
          <span className="text-sm font-medium truncate max-w-xs" data-qoder-id="qel-text-sm-4e670864" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-4e670864&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:11}}">{file.name}</span>
          <Badge variant="secondary" className="text-xs" data-qoder-id="qel-text-xs-3ab01e69" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-3ab01e69&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:113,&quot;column&quot;:11}}">{fmtSize(file.size)}</Badge>
        </div>
        <div className="flex items-center gap-2" data-qoder-id="qel-flex-d1cf7266" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-d1cf7266&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:115,&quot;column&quot;:9}}">
          {cat === 'image' && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} data-qoder-id="qel-h-8-49d60aae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-8-49d60aae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;h-8&quot;,&quot;loc&quot;:{&quot;line&quot;:118,&quot;column&quot;:15}}">
                <ZoomOut className="w-4 h-4"  data-qoder-id="qel-w-4-eb9aeb5a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-eb9aeb5a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:119,&quot;column&quot;:17}}"/>
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center" data-qoder-id="qel-text-xs-69b26b2b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-69b26b2b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:121,&quot;column&quot;:15}}">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(4, z + 0.25))} data-qoder-id="qel-h-8-c7df12ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-8-c7df12ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;h-8&quot;,&quot;loc&quot;:{&quot;line&quot;:122,&quot;column&quot;:15}}">
                <ZoomIn className="w-4 h-4"  data-qoder-id="qel-w-4-d1162004" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-d1162004&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:123,&quot;column&quot;:17}}"/>
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} data-qoder-id="qel-button-e1b08b05" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-e1b08b05&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:11}}">关闭</Button>
        </div>
      </div>

      {/* Content */}
      {cat === 'pdf' ? (
        <div className="flex-1 flex flex-col overflow-hidden" data-qoder-id="qel-cad-container" data-qoder-source="{&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;cad-container&quot;}">
          <CADViewer file={file}  data-qoder-id="qel-cadviewer-496f30eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-cadviewer-496f30eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;cadviewer&quot;,&quot;loc&quot;:{&quot;line&quot;:135,&quot;column&quot;:11}}"/>
        </div>
      ) : (
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-neutral-100" data-qoder-id="qel-flex-1-5518b8aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-5518b8aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:7}}">
        {cat === 'image' && url && (
          <img
            src={url}
            alt={file.name}
            className="max-w-none shadow-lg"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.15s' }}
           data-qoder-id="qel-max-w-none-0b61757d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-none-0b61757d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;max-w-none&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:11}}"/>
        )}
        {cat === 'other' && (
          <div className="bg-white rounded-xl p-12 text-center max-w-md shadow-lg" data-qoder-id="qel-bg-white-9bed4d38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-white-9bed4d38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;bg-white&quot;,&quot;loc&quot;:{&quot;line&quot;:151,&quot;column&quot;:11}}">
            <File className="w-16 h-16 text-muted-foreground mx-auto mb-4"  data-qoder-id="qel-w-16-bd2d8686" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-16-bd2d8686&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;w-16&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:13}}"/>
            <h3 className="text-lg font-semibold mb-2" data-qoder-id="qel-text-lg-e5fd167e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-e5fd167e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:13}}">不支持预览此文件格式</h3>
            <p className="text-sm text-muted-foreground" data-qoder-id="qel-text-sm-a6d4cba1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-a6d4cba1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;FileViewer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:13}}">{file.name}</p>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

/* ─── Upload Area ─── */
function UploadArea({ onFilesAdded, ...qoderProps }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handle = (fileList) => {
    if (!fileList || fileList.length === 0) return
    onFilesAdded(Array.from(fileList))
  }

  return (
    <div className={["flex-1 flex flex-col items-center justify-center p-8", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <input
        ref={inputRef} type="file" multiple accept={ACCEPTED_TYPES} className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = '' }}
       data-qoder-id="qel-hidden-0a6bc396" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hidden-0a6bc396&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;hidden&quot;,&quot;loc&quot;:{&quot;line&quot;:180,&quot;column&quot;:7}}"/>
      <div
        className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handle(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
       data-qoder-id="qel-div-e1a5faa5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-e1a5faa5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:184,&quot;column&quot;:7}}">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4"  data-qoder-id="qel-w-12-9fb1a37b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-12-9fb1a37b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;w-12&quot;,&quot;loc&quot;:{&quot;line&quot;:193,&quot;column&quot;:9}}"/>
        <h3 className="text-lg font-semibold mb-2" data-qoder-id="qel-text-lg-a51e5d52" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-a51e5d52&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:194,&quot;column&quot;:9}}">上传配电箱图纸</h3>
        <p className="text-sm text-muted-foreground mb-4" data-qoder-id="qel-text-sm-1102edef" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-1102edef&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:195,&quot;column&quot;:9}}">拖拽文件到此处，或点击选择文件</p>
        <div className="flex items-center justify-center gap-3 mb-4" data-qoder-id="qel-flex-d87493a4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-d87493a4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:196,&quot;column&quot;:9}}">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-50 text-red-700" data-qoder-id="qel-inline-flex-180b8b90" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-inline-flex-180b8b90&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;inline-flex&quot;,&quot;loc&quot;:{&quot;line&quot;:200,&quot;column&quot;:11}}">
            <FileText className="w-3 h-3"  data-qoder-id="qel-w-3-3c9b1e9a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-3c9b1e9a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;w-3&quot;,&quot;loc&quot;:{&quot;line&quot;:201,&quot;column&quot;:13}}"/>PDF 图纸
          </span>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700" data-qoder-id="qel-inline-flex-260ba19a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-inline-flex-260ba19a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;inline-flex&quot;,&quot;loc&quot;:{&quot;line&quot;:203,&quot;column&quot;:11}}">
            <FileImage className="w-3 h-3"  data-qoder-id="qel-w-3-2411f036" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-2411f036&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;w-3&quot;,&quot;loc&quot;:{&quot;line&quot;:204,&quot;column&quot;:13}}"/>图片
          </span>
        </div>
        <Button onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} data-qoder-id="qel-button-b64e5678" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-b64e5678&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:207,&quot;column&quot;:9}}">
          <Upload className="w-4 h-4 mr-2"  data-qoder-id="qel-w-4-3053c404" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-3053c404&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:208,&quot;column&quot;:11}}"/>选择文件
        </Button>
        <p className="text-xs text-muted-foreground mt-3" data-qoder-id="qel-text-xs-bd4bbd33" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-bd4bbd33&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;UploadArea&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:210,&quot;column&quot;:9}}">单个文件不超过 50MB，项目总计不超过 500MB</p>
      </div>
    </div>
  )
}

/* ─── Processing View ─── */
function ProcessingView({ files, onDone, ...qoderProps }) {
  const [items, setItems] = useState(() =>
    files.map((f, i) => ({
      id: i, name: f.name, size: f.size, category: getFileCategory(f.name),
      progress: 0, status: 'uploading', aiStep: '',
    }))
  )
  const doneRef = useRef(false)
  const resultsRef = useRef([])

  useEffect(() => {
    let cancelled = false

    const processAll = async () => {
      for (let idx = 0; idx < files.length; idx++) {
        if (cancelled) return
        const file = files[idx]
        const cat = getFileCategory(file.name)

        setItems(prev => prev.map((x, j) => j === idx ? { ...x, status: 'ai', aiStep: '渲染图纸...' } : x))

        try {
          if (cat === 'pdf') {
            const boxes = await recognizeFromPDF(file, (stage, page, total, p) => {
              if (cancelled) return
              const stepMap = {
                'rendering': `渲染第 ${page}/${total} 页...`,
                'ocr': `OCR 识别第 ${page}/${total} 页...`,
                'ocr-progress': `识别中 ${Math.round((p || 0) * 100)}%...`,
                'parsing': `解析配电箱信息...`,
              }
              const step = stepMap[stage] || '处理中...'
              const progress = stage === 'ocr-progress' ? Math.round((p || 0) * 100) : undefined
              setItems(prev => prev.map((x, j) =>
                j === idx ? { ...x, aiStep: step, status: 'ai', progress: progress ?? x.progress } : x
              ))
            })
            if (!cancelled) {
              resultsRef.current = [...resultsRef.current, ...boxes]
              setItems(prev => prev.map((x, j) =>
                j === idx ? { ...x, status: 'done', aiStep: '识别完成', progress: 100 } : x
              ))
            }
          } else {
            // Non-PDF files: skip OCR, use filename-based placeholder
            if (!cancelled) {
              setItems(prev => prev.map((x, j) =>
                j === idx ? { ...x, status: 'done', aiStep: '该格式暂需手动录入', progress: 100 } : x
              ))
            }
          }
        } catch (err) {
          console.error('OCR error for', file.name, err)
          if (!cancelled) {
            setItems(prev => prev.map((x, j) =>
              j === idx ? { ...x, status: 'done', aiStep: '识别失败：' + (err.message || '未知错误'), progress: 100 } : x
            ))
          }
        }
      }

      if (!cancelled) {
        setItems(prev => prev.map(x => ({ ...x, status: 'done', progress: 100 })))
      }
    }

    processAll()

    return () => { cancelled = true }
  }, []) // eslint-disable-line

  const allDone = items.every(x => x.status === 'done')

  useEffect(() => {
    if (allDone && !doneRef.current) {
      doneRef.current = true
      const t = setTimeout(() => onDone(resultsRef.current), 500)
      return () => clearTimeout(t)
    }
  }, [allDone, onDone])

  return (
    <div className={["flex-1 flex flex-col items-center p-8 overflow-auto", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="w-full max-w-2xl" data-qoder-id="qel-w-full-21685d82" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-full-21685d82&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;w-full&quot;,&quot;loc&quot;:{&quot;line&quot;:270,&quot;column&quot;:7}}">
        <h3 className="text-base font-semibold mb-1" data-qoder-id="qel-text-base-a134bd4b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-base-a134bd4b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;text-base&quot;,&quot;loc&quot;:{&quot;line&quot;:271,&quot;column&quot;:9}}">正在处理文件</h3>
        <p className="text-sm text-muted-foreground mb-6" data-qoder-id="qel-text-sm-0c0b31f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-0c0b31f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:272,&quot;column&quot;:9}}">AI 正在解析和识别上传的图纸，请稍候...</p>
        <div className="space-y-3" data-qoder-id="qel-space-y-3-540ffa7e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-3-540ffa7e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;space-y-3&quot;,&quot;loc&quot;:{&quot;line&quot;:273,&quot;column&quot;:9}}">
          {items.map(item => {
            const Icon = categoryIcon(item.category)
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-white" data-qoder-id="qel-flex-b338e7f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-b338e7f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:277,&quot;column&quot;:15}}">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${categoryColor(item.category)}`} data-qoder-id="qel-div-498980e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-498980e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:278,&quot;column&quot;:17}}">
                  <Icon className="w-4 h-4"  data-qoder-id="qel-w-4-fdcf179c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-fdcf179c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:279,&quot;column&quot;:19}}"/>
                </div>
                <div className="flex-1 min-w-0" data-qoder-id="qel-flex-1-882a46fc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-882a46fc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:281,&quot;column&quot;:17}}">
                  <div className="flex items-center gap-2" data-qoder-id="qel-flex-bf3b396b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-bf3b396b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:282,&quot;column&quot;:19}}">
                    <span className="text-sm font-medium truncate" data-qoder-id="qel-text-sm-4a5c41f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-4a5c41f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:283,&quot;column&quot;:21}}">{item.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0" data-qoder-id="qel-text-xs-be8d1076" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-be8d1076&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:284,&quot;column&quot;:21}}">{fmtSize(item.size)}</span>
                  </div>
                  <div className="mt-1" data-qoder-id="qel-mt-1-cf096fd2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-1-cf096fd2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;mt-1&quot;,&quot;loc&quot;:{&quot;line&quot;:286,&quot;column&quot;:19}}">
                    {item.status === 'uploading' && (
                      <div className="flex items-center gap-2" data-qoder-id="qel-flex-c33b3fb7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-c33b3fb7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:288,&quot;column&quot;:23}}">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden" data-qoder-id="qel-flex-1-862a43d6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-862a43d6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:289,&quot;column&quot;:25}}">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.progress}%` }}  data-qoder-id="qel-h-full-c844c8ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-full-c844c8ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;h-full&quot;,&quot;loc&quot;:{&quot;line&quot;:290,&quot;column&quot;:27}}"/>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0" data-qoder-id="qel-text-xs-cb8d24ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-cb8d24ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:292,&quot;column&quot;:25}}">{Math.round(item.progress)}%</span>
                      </div>
                    )}
                    {item.status === 'ai' && (
                      <div className="flex items-center gap-1.5" data-qoder-id="qel-flex-473e4e1a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-473e4e1a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:296,&quot;column&quot;:23}}">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"  data-qoder-id="qel-w-1-5-10e735d8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-1-5-10e735d8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;w-1-5&quot;,&quot;loc&quot;:{&quot;line&quot;:297,&quot;column&quot;:25}}"/>
                        <span className="text-xs text-amber-700" data-qoder-id="qel-text-xs-3a8a0213" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-3a8a0213&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:298,&quot;column&quot;:25}}">{item.aiStep || '准备识别...'}</span>
                      </div>
                    )}
                    {item.status === 'done' && (
                      <div className="flex items-center gap-1.5" data-qoder-id="qel-flex-463e4c87" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-463e4c87&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:302,&quot;column&quot;:23}}">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600"  data-qoder-id="qel-w-3-5-a2e8bf2f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-a2e8bf2f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:303,&quot;column&quot;:25}}"/>
                        <span className="text-xs text-green-700" data-qoder-id="qel-text-xs-3f8a09f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-3f8a09f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;ProcessingView&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:304,&quot;column&quot;:25}}">识别完成</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Tree Node ─── */
function TreeNode({ box, level = 0, selectedId, onSelect, ...qoderProps }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = box.children?.length > 0
  const isSelected = selectedId === box.id

  return (
    <div style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(box)}
       data-qoder-id="qel-div-38a43c33" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-38a43c33&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:326,&quot;column&quot;:7}}">
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground" data-qoder-id="qel-w-4-6fa94406" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-6fa94406&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:334,&quot;column&quot;:11}}">
            {expanded ? <ChevronDown className="w-3.5 h-3.5"  data-qoder-id="qel-w-3-5-be7eff9d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-be7eff9d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:336,&quot;column&quot;:25}}"/> : <ChevronRight className="w-3.5 h-3.5"  data-qoder-id="qel-w-3-5-b2aaf8e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-b2aaf8e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:336,&quot;column&quot;:67}}"/>}
          </button>
        ) : <span className="w-4"  data-qoder-id="qel-w-4-8d101c38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-8d101c38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:338,&quot;column&quot;:13}}"/>}
        <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium border ${typeColors[box.type] || ''}`} data-qoder-id="qel-span-9dae618d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-9dae618d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:339,&quot;column&quot;:9}}">
          {box.id}
        </span>
        <span className="text-sm truncate flex-1" data-qoder-id="qel-text-sm-555fb434" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-555fb434&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:342,&quot;column&quot;:9}}">{box.name}</span>
        <span className="text-xs text-muted-foreground shrink-0" data-qoder-id="qel-text-xs-5e620102" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-5e620102&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:343,&quot;column&quot;:9}}">{box.location}</span>
      </div>
      {hasChildren && expanded && box.children.map(child => (
        <TreeNode key={child.id} box={child} level={level + 1} selectedId={selectedId} onSelect={onSelect}  data-qoder-id="qel-treenode-616cee88" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-616cee88&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:346,&quot;column&quot;:9}}"/>
      ))}
    </div>
  )
}

/* ─── Box Detail ─── */
function BoxDetail({ box, files, onViewFile, ...qoderProps }) {
  if (!box) return (
    <div className={["flex-1 flex items-center justify-center text-muted-foreground", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="text-center" data-qoder-id="qel-text-center-9c7fabce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-9c7fabce&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:356,&quot;column&quot;:7}}">
        <Box className="w-12 h-12 mx-auto mb-3 opacity-30"  data-qoder-id="qel-w-12-b6e8541f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-12-b6e8541f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-12&quot;,&quot;loc&quot;:{&quot;line&quot;:357,&quot;column&quot;:9}}"/>
        <p className="text-sm" data-qoder-id="qel-text-sm-ba3115d6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-ba3115d6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:358,&quot;column&quot;:9}}">选择一个配电箱查看详情</p>
      </div>
    </div>
  )

  const sourceFile = files.find(f => f.name === box.sourceFile)

  return (
    <div className="p-5 overflow-auto" data-component="box-detail" data-qoder-id="qel-box-detail-1d817f3c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-box-detail-1d817f3c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;box-detail&quot;,&quot;loc&quot;:{&quot;line&quot;:366,&quot;column&quot;:5}}">
      <div className="flex items-start justify-between mb-6" data-qoder-id="qel-flex-b3df1bb1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-b3df1bb1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:367,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-9707f0a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-9707f0a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:368,&quot;column&quot;:9}}">
          <div className="flex items-center gap-2 mb-1" data-qoder-id="qel-flex-b1df188b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-b1df188b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:369,&quot;column&quot;:11}}">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[box.type]?.split(' ').slice(0, 2).join(' ') || ''}`} data-qoder-id="qel-span-3ceb9648" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-3ceb9648&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:370,&quot;column&quot;:13}}">
              {box.type}
            </span>
            <span className="text-xs text-muted-foreground font-mono" data-qoder-id="qel-text-xs-b194e796" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-b194e796&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:373,&quot;column&quot;:13}}">{box.id}</span>
          </div>
          <h2 className="text-xl font-semibold" data-qoder-id="qel-text-xl-affb6e96" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xl-affb6e96&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xl&quot;,&quot;loc&quot;:{&quot;line&quot;:375,&quot;column&quot;:11}}">{box.name}</h2>
          <p className="text-sm text-muted-foreground mt-1" data-qoder-id="qel-text-sm-3429871f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-3429871f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:376,&quot;column&quot;:11}}">安装部位：{box.location}</p>
        </div>
        {sourceFile && (
          <Button variant="outline" size="sm" onClick={() => onViewFile(sourceFile)} data-qoder-id="qel-button-bd87632c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-bd87632c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:379,&quot;column&quot;:11}}">
            <Eye className="w-4 h-4 mr-1.5"  data-qoder-id="qel-w-4-36968eac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-36968eac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:380,&quot;column&quot;:13}}"/>查看图纸
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6" data-qoder-id="qel-grid-41b4f612" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-41b4f612&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:385,&quot;column&quot;:7}}">
        <Card className="p-3" data-qoder-id="qel-p-3-ceaf33c4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3-ceaf33c4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-3&quot;,&quot;loc&quot;:{&quot;line&quot;:386,&quot;column&quot;:9}}">
          <div className="text-2xl font-bold" data-qoder-id="qel-text-2xl-dd221f98" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-2xl-dd221f98&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-2xl&quot;,&quot;loc&quot;:{&quot;line&quot;:387,&quot;column&quot;:11}}">{box.circuits}</div>
          <div className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-0fa27db8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-0fa27db8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:388,&quot;column&quot;:11}}">回路数量</div>
        </Card>
        <Card className="p-3" data-qoder-id="qel-p-3-cbaf2f0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3-cbaf2f0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-3&quot;,&quot;loc&quot;:{&quot;line&quot;:390,&quot;column&quot;:9}}">
          <div className="text-2xl font-bold" data-qoder-id="qel-text-2xl-e4222a9d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-2xl-e4222a9d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-2xl&quot;,&quot;loc&quot;:{&quot;line&quot;:391,&quot;column&quot;:11}}">{box.children?.length || 0}</div>
          <div className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-14a28597" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-14a28597&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:392,&quot;column&quot;:11}}">下级配电箱</div>
        </Card>
        <Card className="p-3" data-qoder-id="qel-p-3-ccaf309e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3-ccaf309e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-3&quot;,&quot;loc&quot;:{&quot;line&quot;:394,&quot;column&quot;:9}}">
          <div className="text-2xl font-bold" data-qoder-id="qel-text-2xl-d7221626" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-2xl-d7221626&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-2xl&quot;,&quot;loc&quot;:{&quot;line&quot;:395,&quot;column&quot;:11}}">{box.sourceFile ? 1 : 0}</div>
          <div className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-09a27446" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-09a27446&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:396,&quot;column&quot;:11}}">来源图纸</div>
        </Card>
      </div>

      {sourceFile && (
        <Card className="p-4 bg-blue-50/50 border-blue-200 mb-4" data-qoder-id="qel-p-4-4bdf6290" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-4-4bdf6290&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-4&quot;,&quot;loc&quot;:{&quot;line&quot;:401,&quot;column&quot;:9}}">
          <div className="flex items-center gap-2 mb-1" data-qoder-id="qel-flex-c9e6e90a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-c9e6e90a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:402,&quot;column&quot;:11}}">
            <FileText className="w-4 h-4 text-blue-600"  data-qoder-id="qel-w-4-d75d2c14" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-d75d2c14&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:403,&quot;column&quot;:13}}"/>
            <span className="text-sm font-medium text-blue-800" data-qoder-id="qel-text-sm-6480ab8c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-6480ab8c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:404,&quot;column&quot;:13}}">来源文件</span>
          </div>
          <p className="text-xs text-blue-700 mb-2" data-qoder-id="qel-text-xs-a03488d0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-a03488d0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:406,&quot;column&quot;:11}}">{sourceFile.name}</p>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onViewFile(sourceFile)} data-qoder-id="qel-h-7-c9257554" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-7-c9257554&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;h-7&quot;,&quot;loc&quot;:{&quot;line&quot;:407,&quot;column&quot;:11}}">
            <Eye className="w-3.5 h-3.5 mr-1"  data-qoder-id="qel-w-3-5-907efbc7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-907efbc7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:408,&quot;column&quot;:13}}"/>打开查看
          </Button>
        </Card>
      )}

                  {/* OCR Details - 三层结构化 */}
      {box.parsed && (() => {
        const p = box.parsed
        const fmtCable = (c) => c ? (c.型号 + (c.芯数截面 ? '-' + c.芯数截面 : '') + (c.敷设方式 ? '-' + c.敷设方式 : '')) : '-'
        return (
        <div className="space-y-3 mb-4" data-qoder-id="qel-space-y-3-a84204cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-3-a84204cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;space-y-3&quot;,&quot;loc&quot;:{&quot;line&quot;:435,&quot;column&quot;:9}}">

          {/* 1. 箱体信息 */}
          <Card className="p-4 bg-amber-50/50 border-amber-200" data-qoder-id="qel-p-4-4ddf65b6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-4-4ddf65b6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-4&quot;,&quot;loc&quot;:{&quot;line&quot;:438,&quot;column&quot;:11}}">
            <div className="flex items-center gap-2 mb-2" data-qoder-id="qel-flex-c7e6e5e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-c7e6e5e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:439,&quot;column&quot;:13}}">
              <CircuitBoard className="w-4 h-4 text-amber-600"  data-qoder-id="qel-w-4-1a84d7f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-1a84d7f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:440,&quot;column&quot;:15}}"/>
              <span className="text-sm font-medium text-amber-800" data-qoder-id="qel-text-sm-6280a866" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-6280a866&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:441,&quot;column&quot;:15}}">箱体信息</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs" data-qoder-id="qel-grid-8ac56324" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-8ac56324&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:443,&quot;column&quot;:13}}">
              <div data-qoder-id="qel-div-a73584b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-a73584b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:444,&quot;column&quot;:15}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-03bfd28e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-03bfd28e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:444,&quot;column&quot;:20}}">箱号：</span><span className="font-mono font-medium text-amber-900" data-qoder-id="qel-font-mono-0c5e7473" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-0c5e7473&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:444,&quot;column&quot;:70}}">{p.箱体信息.箱号 || box.id}</span></div>
              <div data-qoder-id="qel-div-bc33672a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-bc33672a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:445,&quot;column&quot;:15}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-00c20c6c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-00c20c6c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:445,&quot;column&quot;:20}}">名称：</span><span className="font-medium text-amber-900" data-qoder-id="qel-font-medium-39fe51b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-medium-39fe51b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-medium&quot;,&quot;loc&quot;:{&quot;line&quot;:445,&quot;column&quot;:70}}">{p.箱体信息.箱名称 || box.name}</span></div>
              {p.箱体信息.图号名称 && <div className="col-span-2" data-qoder-id="qel-col-span-2-e6c3cd58" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-col-span-2-e6c3cd58&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;col-span-2&quot;,&quot;loc&quot;:{&quot;line&quot;:446,&quot;column&quot;:31}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-fdc207b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-fdc207b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:446,&quot;column&quot;:59}}">图号名称：</span><span className="text-amber-900" data-qoder-id="qel-text-amber-900-11aad3b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-amber-900-11aad3b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-amber-900&quot;,&quot;loc&quot;:{&quot;line&quot;:446,&quot;column&quot;:111}}">{p.箱体信息.图号名称}</span></div>}
              {p.箱体信息.安装方式 && <div data-qoder-id="qel-div-b6335db8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b6335db8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:447,&quot;column&quot;:31}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-fec20946" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-fec20946&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:447,&quot;column&quot;:36}}">安装方式：</span><span className="text-amber-900" data-qoder-id="qel-text-amber-900-16aadb91" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-amber-900-16aadb91&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-amber-900&quot;,&quot;loc&quot;:{&quot;line&quot;:447,&quot;column&quot;:88}}">{p.箱体信息.安装方式}</span></div>}
              {p.箱体信息.防护等级 && <div data-qoder-id="qel-div-b5335c25" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b5335c25&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:448,&quot;column&quot;:31}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-8fba9ec4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-8fba9ec4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:448,&quot;column&quot;:36}}">防护等级：</span><span className="font-mono text-amber-900" data-qoder-id="qel-font-mono-2063111d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-2063111d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:448,&quot;column&quot;:88}}">{p.箱体信息.防护等级}</span></div>}
              {p.箱体信息.数量 && <div data-qoder-id="qel-div-b4311bfb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b4311bfb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:449,&quot;column&quot;:29}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-92baa37d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-92baa37d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:449,&quot;column&quot;:34}}">数量：</span><span className="text-amber-900" data-qoder-id="qel-text-amber-900-90adda36" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-amber-900-90adda36&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-amber-900&quot;,&quot;loc&quot;:{&quot;line&quot;:449,&quot;column&quot;:84}}">{p.箱体信息.数量}</span></div>}
              {p.箱体信息.备注 && <div data-qoder-id="qel-div-b93123da" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-b93123da&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:450,&quot;column&quot;:29}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-8dba9b9e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-8dba9b9e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:450,&quot;column&quot;:34}}">备注：</span><span className="text-amber-900" data-qoder-id="qel-text-amber-900-8fadd8a3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-amber-900-8fadd8a3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-amber-900&quot;,&quot;loc&quot;:{&quot;line&quot;:450,&quot;column&quot;:84}}">{p.箱体信息.备注}</span></div>}
            </div>
          </Card>

          {/* 2. 进线信息 */}
          <Card className="p-4 bg-blue-50/50 border-blue-200" data-qoder-id="qel-p-4-5fe3ff3a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-4-5fe3ff3a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-4&quot;,&quot;loc&quot;:{&quot;line&quot;:455,&quot;column&quot;:11}}">
            <div className="flex items-center gap-2 mb-2" data-qoder-id="qel-flex-3dec1cd4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-3dec1cd4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:456,&quot;column&quot;:13}}">
              <CircuitBoard className="w-4 h-4 text-blue-600"  data-qoder-id="qel-w-4-3082bbfd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-3082bbfd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:457,&quot;column&quot;:15}}"/>
              <span className="text-sm font-medium text-blue-800" data-qoder-id="qel-text-sm-ee83c361" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-ee83c361&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:458,&quot;column&quot;:15}}">进线信息</span>
            </div>
            <div className="text-xs space-y-2" data-qoder-id="qel-text-xs-2fe5b7c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-2fe5b7c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:460,&quot;column&quot;:13}}">
              {/* 负荷参数 */}
              {Object.keys(p.进线信息.负荷参数).length > 0 && (
                <div data-qoder-id="qel-div-332e1251" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-332e1251&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:463,&quot;column&quot;:17}}">
                  <span className="text-muted-foreground font-medium" data-qoder-id="qel-text-muted-foreground-91bce081" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-91bce081&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:464,&quot;column&quot;:19}}">负荷参数：</span>
                  {Object.entries(p.进线信息.负荷参数).map(([k, v]) => (
                    <span key={k} className="font-mono text-blue-900 ml-2" data-qoder-id="qel-font-mono-8865f36c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-8865f36c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:466,&quot;column&quot;:21}}">{k}={v}</span>
                  ))}
                </div>
              )}
              {/* 主开关 */}
              {p.进线信息.主开关.型号 && (
                <div data-qoder-id="qel-div-362e170a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-362e170a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:472,&quot;column&quot;:17}}">
                  <span className="text-muted-foreground font-medium" data-qoder-id="qel-text-muted-foreground-8ebcdbc8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-8ebcdbc8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:473,&quot;column&quot;:19}}">主开关：</span>
                  <span className="font-mono text-blue-900" data-qoder-id="qel-font-mono-8d65fb4b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-8d65fb4b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:474,&quot;column&quot;:19}}">{p.进线信息.主开关.型号}</span>
                  {p.进线信息.主开关.特性 && <span className="text-blue-700 ml-2" data-qoder-id="qel-text-blue-700-db815e65" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-blue-700-db815e65&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-blue-700&quot;,&quot;loc&quot;:{&quot;line&quot;:475,&quot;column&quot;:37}}">({p.进线信息.主开关.特性})</span>}
                </div>
              )}
              {/* 主用/备用回路 */}
              <div className="grid grid-cols-2 gap-x-4" data-qoder-id="qel-grid-10bba8ba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-10bba8ba&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:479,&quot;column&quot;:15}}">
                <div className="border border-blue-200 rounded p-2 bg-white" data-qoder-id="qel-border-922df963" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-922df963&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;border&quot;,&quot;loc&quot;:{&quot;line&quot;:480,&quot;column&quot;:17}}">
                  <div className="font-medium text-blue-800 mb-1" data-qoder-id="qel-font-medium-a877979d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-medium-a877979d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-medium&quot;,&quot;loc&quot;:{&quot;line&quot;:481,&quot;column&quot;:19}}">主用回路</div>
                  {p.进线信息.主用回路.回路编号 && <div data-qoder-id="qel-div-3b3f680a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-3b3f680a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:482,&quot;column&quot;:40}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-ffb53ee6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-ffb53ee6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:482,&quot;column&quot;:45}}">编号：</span><span className="font-mono text-blue-900" data-qoder-id="qel-font-mono-88683203" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-88683203&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:482,&quot;column&quot;:95}}">{p.进线信息.主用回路.回路编号}</span></div>}
                  {p.进线信息.主用回路.电缆规格 && <div data-qoder-id="qel-div-383f6351" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-383f6351&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:483,&quot;column&quot;:40}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-feb53d53" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-feb53d53&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:483,&quot;column&quot;:45}}">电缆：</span><span className="font-mono text-blue-900" data-qoder-id="qel-font-mono-93684354" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-93684354&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:483,&quot;column&quot;:95}}">{fmtCable(p.进线信息.主用回路.电缆规格)}</span></div>}
                </div>
                <div className="border border-orange-200 rounded p-2 bg-white" data-qoder-id="qel-border-9a2e05fb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-9a2e05fb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;border&quot;,&quot;loc&quot;:{&quot;line&quot;:485,&quot;column&quot;:17}}">
                  <div className="font-medium text-orange-800 mb-1" data-qoder-id="qel-font-medium-a0754c6e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-medium-a0754c6e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-medium&quot;,&quot;loc&quot;:{&quot;line&quot;:486,&quot;column&quot;:19}}">备用回路</div>
                  {p.进线信息.备用回路.回路编号 && <div data-qoder-id="qel-div-353d2001" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-353d2001&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:487,&quot;column&quot;:40}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-8bb859e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-8bb859e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:487,&quot;column&quot;:45}}">编号：</span><span className="font-mono text-orange-900" data-qoder-id="qel-font-mono-8e6a7a0c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-8e6a7a0c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:487,&quot;column&quot;:95}}">{p.进线信息.备用回路.回路编号}</span></div>}
                  {p.进线信息.备用回路.电缆规格 && <div data-qoder-id="qel-div-383d24ba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-383d24ba&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:488,&quot;column&quot;:40}}"><span className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-8cb85b74" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-8cb85b74&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:488,&quot;column&quot;:45}}">电缆：</span><span className="font-mono text-orange-900" data-qoder-id="qel-font-mono-8b6a7553" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-8b6a7553&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:488,&quot;column&quot;:95}}">{fmtCable(p.进线信息.备用回路.电缆规格)}</span></div>}
                </div>
              </div>
              {/* 监控回路 */}
              {p.进线信息.监控回路_非负荷 && (
                <div className="border border-yellow-200 rounded p-2 bg-yellow-50/50" data-qoder-id="qel-border-9830416c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-9830416c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;border&quot;,&quot;loc&quot;:{&quot;line&quot;:493,&quot;column&quot;:17}}">
                  <span className="text-muted-foreground font-medium" data-qoder-id="qel-text-muted-foreground-81b84a23" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-81b84a23&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:494,&quot;column&quot;:19}}">监控回路（非负荷）：</span>
                  <span className="font-mono text-yellow-900" data-qoder-id="qel-font-mono-986a89ca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-mono-986a89ca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-mono&quot;,&quot;loc&quot;:{&quot;line&quot;:495,&quot;column&quot;:19}}">{p.进线信息.监控回路_非负荷.电缆}</span>
                  <span className="text-yellow-800 ml-2" data-qoder-id="qel-text-yellow-800-78328caa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-yellow-800-78328caa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-yellow-800&quot;,&quot;loc&quot;:{&quot;line&quot;:496,&quot;column&quot;:19}}">{p.进线信息.监控回路_非负荷.用途}</span>
                </div>
              )}
            </div>
          </Card>

          {/* 3. 支路信息 */}
          <Card className="p-4 bg-emerald-50/50 border-emerald-200" data-qoder-id="qel-p-4-d0edab79" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-4-d0edab79&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-4&quot;,&quot;loc&quot;:{&quot;line&quot;:503,&quot;column&quot;:11}}">
            <div className="flex items-center gap-2 mb-2" data-qoder-id="qel-flex-c0e25db1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-c0e25db1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:504,&quot;column&quot;:13}}">
              <CircuitBoard className="w-4 h-4 text-emerald-600"  data-qoder-id="qel-w-4-95768f09" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-95768f09&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:505,&quot;column&quot;:15}}"/>
              <span className="text-sm font-medium text-emerald-800" data-qoder-id="qel-text-sm-5f7c267f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-5f7c267f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:506,&quot;column&quot;:15}}">支路信息</span>
            </div>
            <div className="space-y-3 text-xs" data-qoder-id="qel-space-y-3-b0511bed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-3-b0511bed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;space-y-3&quot;,&quot;loc&quot;:{&quot;line&quot;:508,&quot;column&quot;:13}}">
              {/* MCCB 送下级箱 */}
              {p.支路信息.主回路下级_送下级箱_MCCB.length > 0 && (
                <div data-qoder-id="qel-div-283accf3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-283accf3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:511,&quot;column&quot;:17}}">
                  <div className="font-medium text-emerald-700 mb-1" data-qoder-id="qel-font-medium-9372f960" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-medium-9372f960&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-medium&quot;,&quot;loc&quot;:{&quot;line&quot;:512,&quot;column&quot;:19}}">MCCB 回路（送下级配电箱）</div>
                  <div className="overflow-x-auto" data-qoder-id="qel-overflow-x-auto-41b4d113" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-overflow-x-auto-41b4d113&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;overflow-x-auto&quot;,&quot;loc&quot;:{&quot;line&quot;:513,&quot;column&quot;:19}}">
                    <table className="w-full text-[10px]" data-qoder-id="qel-w-full-78cdfb1f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-full-78cdfb1f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-full&quot;,&quot;loc&quot;:{&quot;line&quot;:514,&quot;column&quot;:21}}">
                      <thead data-qoder-id="qel-thead-97398924" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-97398924&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:515,&quot;column&quot;:23}}">
                        <tr className="border-b border-emerald-200 text-muted-foreground" data-qoder-id="qel-border-b-1b20cda0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-b-1b20cda0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;border-b&quot;,&quot;loc&quot;:{&quot;line&quot;:516,&quot;column&quot;:25}}">
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-ad173af5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-ad173af5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:517,&quot;column&quot;:27}}">回路编号</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-ac173962" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-ac173962&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:518,&quot;column&quot;:27}}">末端箱号</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-a7173183" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-a7173183&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:519,&quot;column&quot;:27}}">开关规格</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-a6172ff0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-a6172ff0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:520,&quot;column&quot;:27}}">额定电流</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-a91734a9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-a91734a9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:521,&quot;column&quot;:27}}">电能表</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-a8173316" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-a8173316&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:522,&quot;column&quot;:27}}">电缆规格</th>
                          <th className="text-left py-1" data-qoder-id="qel-text-left-b3174467" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-b3174467&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:523,&quot;column&quot;:27}}">功率</th>
                        </tr>
                      </thead>
                      <tbody data-qoder-id="qel-tbody-2ae20b73" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-2ae20b73&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:526,&quot;column&quot;:23}}">
                        {p.支路信息.主回路下级_送下级箱_MCCB.map((b, i) => (
                          <tr key={i} className="border-b border-emerald-50" data-qoder-id="qel-border-b-320fa8b4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-b-320fa8b4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;border-b&quot;,&quot;loc&quot;:{&quot;line&quot;:528,&quot;column&quot;:27}}">
                            <td className="py-0.5 pr-2 font-mono text-emerald-900" data-qoder-id="qel-py-0-5-b3195c38" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-b3195c38&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:529,&quot;column&quot;:29}}">{b.回路编号 || '-'}</td>
                            <td className="py-0.5 pr-2 font-mono text-emerald-900" data-qoder-id="qel-py-0-5-b61960f1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-b61960f1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:530,&quot;column&quot;:29}}">{b.末端箱号 || '-'}</td>
                            <td className="py-0.5 pr-2 font-mono" data-qoder-id="qel-py-0-5-b5195f5e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-b5195f5e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:531,&quot;column&quot;:29}}">{b.开关规格 || '-'}</td>
                            <td className="py-0.5 pr-2 font-mono" data-qoder-id="qel-py-0-5-b8196417" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-b8196417&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:532,&quot;column&quot;:29}}">{b.开关额定电流 || '-'}</td>
                            <td className="py-0.5 pr-2 font-mono" data-qoder-id="qel-py-0-5-b7196284" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-b7196284&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:533,&quot;column&quot;:29}}">{b.电能表 || '-'}</td>
                            <td className="py-0.5 pr-2 font-mono" data-qoder-id="qel-py-0-5-ba19673d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-ba19673d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:534,&quot;column&quot;:29}}">{fmtCable(b.电缆规格)}</td>
                            <td className="py-0.5 font-mono" data-qoder-id="qel-py-0-5-b91965aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-b91965aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:535,&quot;column&quot;:29}}">{b.末端功率 || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* MCB 末端设备 */}
              {p.支路信息.末端设备支路_MCB.length > 0 && (
                <div data-qoder-id="qel-div-aa2201b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-aa2201b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:545,&quot;column&quot;:17}}">
                  <div className="font-medium text-emerald-700 mb-1" data-qoder-id="qel-font-medium-155a2e20" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-medium-155a2e20&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;font-medium&quot;,&quot;loc&quot;:{&quot;line&quot;:546,&quot;column&quot;:19}}">MCB 支路（末端设备）</div>
                  <div className="overflow-x-auto" data-qoder-id="qel-overflow-x-auto-bfcb5dbc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-overflow-x-auto-bfcb5dbc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;overflow-x-auto&quot;,&quot;loc&quot;:{&quot;line&quot;:547,&quot;column&quot;:19}}">
                    <table className="w-full text-[10px]" data-qoder-id="qel-w-full-e8dff490" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-full-e8dff490&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-full&quot;,&quot;loc&quot;:{&quot;line&quot;:548,&quot;column&quot;:21}}">
                      <thead data-qoder-id="qel-thead-994896d4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-994896d4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:549,&quot;column&quot;:23}}">
                        <tr className="border-b border-emerald-200 text-muted-foreground" data-qoder-id="qel-border-b-3511ec04" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-b-3511ec04&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;border-b&quot;,&quot;loc&quot;:{&quot;line&quot;:550,&quot;column&quot;:25}}">
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-3b1c97ad" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-3b1c97ad&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:551,&quot;column&quot;:27}}">编号</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-3a1c961a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-3a1c961a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:552,&quot;column&quot;:27}}">开关</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-391c9487" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-391c9487&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:553,&quot;column&quot;:27}}">漏保</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-381c92f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-381c92f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:554,&quot;column&quot;:27}}">相线</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-2f1c84c9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-2f1c84c9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:555,&quot;column&quot;:27}}">电缆规格</th>
                          <th className="text-left py-1 pr-2" data-qoder-id="qel-text-left-2e1c8336" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-2e1c8336&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:556,&quot;column&quot;:27}}">末端名称</th>
                          <th className="text-left py-1" data-qoder-id="qel-text-left-fe091391" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-left-fe091391&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-left&quot;,&quot;loc&quot;:{&quot;line&quot;:557,&quot;column&quot;:27}}">备注</th>
                        </tr>
                      </thead>
                      <tbody data-qoder-id="qel-tbody-1c78f0d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-1c78f0d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:560,&quot;column&quot;:23}}">
                        {p.支路信息.末端设备支路_MCB.map((b, i) => (
                          <tr key={i} className="border-b border-emerald-50" data-qoder-id="qel-border-b-fcd76057" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-b-fcd76057&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;border-b&quot;,&quot;loc&quot;:{&quot;line&quot;:562,&quot;column&quot;:27}}">
                            <td className="py-0.5 pr-2 font-mono text-emerald-900" data-qoder-id="qel-py-0-5-21c430eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-21c430eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:563,&quot;column&quot;:29}}">{b.回路编号}</td>
                            <td className="py-0.5 pr-2 font-mono" data-qoder-id="qel-py-0-5-26c438ca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-26c438ca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:564,&quot;column&quot;:29}}">{b.开关规格 || '-'}</td>
                            <td className="py-0.5 pr-2" data-qoder-id="qel-py-0-5-27c43a5d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-27c43a5d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:565,&quot;column&quot;:29}}">{b.带漏保 ? <span className="text-red-600 font-medium" data-qoder-id="qel-text-red-600-93efdeaa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-red-600-93efdeaa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-red-600&quot;,&quot;loc&quot;:{&quot;line&quot;:565,&quot;column&quot;:66}}">{b.漏保规格}</span> : '-'}</td>
                            <td className="py-0.5 pr-2 font-mono" data-qoder-id="qel-py-0-5-25c43737" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-25c43737&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:566,&quot;column&quot;:29}}">{b.相线 || '-'}</td>
                            <td className="py-0.5 pr-2 font-mono" data-qoder-id="qel-py-0-5-1ac425e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-1ac425e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:567,&quot;column&quot;:29}}">{fmtCable(b.电缆规格)}</td>
                            <td className="py-0.5 pr-2 text-emerald-900" data-qoder-id="qel-py-0-5-1bc42779" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-1bc42779&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:568,&quot;column&quot;:29}}">{b.末端名称 || '-'}{b.末端箱号 ? ' ' + b.末端箱号 : ''}</td>
                            <td className="py-0.5 text-emerald-800" data-qoder-id="qel-py-0-5-a8c74407" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-py-0-5-a8c74407&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;py-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:569,&quot;column&quot;:29}}">{b.末端功率 || b.末端类型 === '备用回路' ? '备用' : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* 接地方式 */}
              {p.接地方式 && (
                <div className="text-muted-foreground" data-qoder-id="qel-text-muted-foreground-17b8abc2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-17b8abc2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:579,&quot;column&quot;:17}}">接地：{p.接地方式}</div>
              )}
            </div>
          </Card>

          {/* Raw OCR Text */}
          {p.rawOcrText && (
            <details className="text-xs" data-qoder-id="qel-text-xs-e628707c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-e628707c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:586,&quot;column&quot;:13}}">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-1" data-qoder-id="qel-cursor-pointer-33429a00" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-cursor-pointer-33429a00&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;cursor-pointer&quot;,&quot;loc&quot;:{&quot;line&quot;:587,&quot;column&quot;:15}}">查看 OCR 原始文本（用于人工复核）</summary>
              <pre className="mt-2 p-3 bg-neutral-50 border border-neutral-200 rounded text-[10px] leading-relaxed max-h-60 overflow-auto whitespace-pre-wrap font-mono text-neutral-600" data-qoder-id="qel-mt-2-07d9c7e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-2-07d9c7e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;mt-2&quot;,&quot;loc&quot;:{&quot;line&quot;:588,&quot;column&quot;:15}}">{p.rawOcrText}</pre>
            </details>
          )}
        </div>
        )
      })()}

      <Card className="p-4 bg-green-50/50 border-green-200" data-qoder-id="qel-p-4-a7e05707" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-4-a7e05707&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;p-4&quot;,&quot;loc&quot;:{&quot;line&quot;:595,&quot;column&quot;:7}}">
        <div className="flex items-center gap-2 mb-2" data-qoder-id="qel-flex-6e35a673" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-6e35a673&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:596,&quot;column&quot;:9}}">
          <CheckCircle2 className="w-4 h-4 text-green-600"  data-qoder-id="qel-w-4-56178efc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-56178efc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:597,&quot;column&quot;:11}}"/>
          <span className="text-sm font-medium text-green-800" data-qoder-id="qel-text-sm-29bd1df5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-29bd1df5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:598,&quot;column&quot;:11}}">AI 识别结果</span>
        </div>
        <p className="text-xs text-green-700" data-qoder-id="qel-text-xs-f3e5becf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-f3e5becf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;BoxDetail&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:600,&quot;column&quot;:9}}">
          以上信息由 AI 通过 OCR 从图纸中自动提取，按箱体/进线/支路三层结构化解析。请展开"OCR 原始文本"对照图纸人工复核。
        </p>
      </Card>
    </div>
  )
}

/* ─── Main Dashboard Page ─── */
export default function DashboardPage(qoderProps) {
  const navigate = useNavigate()

  // Project state
  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)

  // View: 'projects' | 'upload' | 'processing' | 'results'
  const [view, setView] = useState('projects')

  // Per-project data
  const [projectFiles, setProjectFiles] = useState({}) // { projectId: File[] }
  const [projectBoxes, setProjectBoxes] = useState({}) // { projectId: Box[] }

  // UI state
  const [selectedBox, setSelectedBox] = useState(null)
  const [viewingFile, setViewingFile] = useState(null)
  const [processingFiles, setProcessingFiles] = useState([])
  const [searchText, setSearchText] = useState('')

  const activeProject = projects.find(p => p.id === activeProjectId)
  const currentFiles = projectFiles[activeProjectId] || []
  const currentBoxes = projectBoxes[activeProjectId] || []

  // Filter boxes by search
  const filterBoxes = useCallback((boxes, text) => {
    if (!text) return boxes
    const q = text.toLowerCase()
    return boxes.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    )
  }, [])

  const filteredBoxes = filterBoxes(currentBoxes, searchText)

  // Count boxes by type
  const countByType = useCallback((boxes) => {
    const c = { '一级箱': 0, '二级箱': 0, '三级箱': 0, '控制箱': 0 }
    const walk = (arr) => arr.forEach(b => { c[b.type] = (c[b.type] || 0) + 1; if (b.children) walk(b.children) })
    walk(boxes)
    return c
  }, [])

  /* Actions */
  const createProject = () => {
    const id = 'p-' + Date.now()
    const name = `新项目 ${projects.length + 1}`
    setProjects(prev => [...prev, { id, name, createdAt: new Date().toLocaleDateString('zh-CN') }])
    setActiveProjectId(id)
    setView('upload')
    setSelectedBox(null)
  }

  const openProject = (id) => {
    setActiveProjectId(id)
    setSelectedBox(null)
    const boxes = projectBoxes[id] || []
    setView(boxes.length > 0 ? 'results' : 'upload')
  }

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setProjectFiles(prev => { const n = { ...prev }; delete n[id]; return n })
    setProjectBoxes(prev => { const n = { ...prev }; delete n[id]; return n })
    if (activeProjectId === id) {
      setActiveProjectId(null)
      setView('projects')
      setSelectedBox(null)
    }
  }

  const handleFilesAdded = (files) => {
    setProcessingFiles(files)
    setView('processing')
  }

  const handleProcessingDone = useCallback((ocrResults) => {
    // Use real OCR results if available, otherwise fall back to fake recognition
    const newBoxes = ocrResults && ocrResults.length > 0
      ? ocrResults
      : processingFiles.flatMap(f => fakeRecognize(f.name))
    setProjectFiles(prev => ({
      ...prev,
      [activeProjectId]: [...(prev[activeProjectId] || []), ...processingFiles],
    }))
    setProjectBoxes(prev => ({
      ...prev,
      [activeProjectId]: [...(prev[activeProjectId] || []), ...newBoxes],
    }))
    setView('results')
    setProcessingFiles([])
  }, [processingFiles, activeProjectId])

  const goBack = () => {
    switch (view) {
      case 'upload':
      case 'results':
        setView('projects')
        setActiveProjectId(null)
        setSelectedBox(null)
        break
      case 'processing':
        // can't go back during processing
        break
      default:
        setView('projects')
        break
    }
  }

  const goHome = () => navigate('/')

  const handleViewFile = (file) => setViewingFile(file)
  const closeViewer = () => setViewingFile(null)

  // Count stats
  const typeCounts = countByType(currentBoxes)

  return (
    <div className={["h-screen flex flex-col bg-white", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]} data-component="dashboard-page">

      {/* ─── Top bar ─── */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-white shrink-0" data-qoder-id="qel-h-14-cc86b7d9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-14-cc86b7d9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;h-14&quot;,&quot;loc&quot;:{&quot;line&quot;:548,&quot;column&quot;:7}}">
        <div className="flex items-center gap-3" data-qoder-id="qel-flex-0a317535" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-0a317535&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:549,&quot;column&quot;:9}}">
          <button className="flex items-center gap-2 cursor-pointer" onClick={goHome} data-qoder-id="qel-flex-b92e7391" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-b92e7391&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:550,&quot;column&quot;:11}}">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center" data-qoder-id="qel-w-7-53ae9a21" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-7-53ae9a21&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-7&quot;,&quot;loc&quot;:{&quot;line&quot;:551,&quot;column&quot;:13}}">
              <Layers className="w-4 h-4 text-white"  data-qoder-id="qel-w-4-d879a44c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-d879a44c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:552,&quot;column&quot;:15}}"/>
            </div>
            <span className="text-base font-semibold" data-qoder-id="qel-text-base-1b06fde4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-base-1b06fde4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-base&quot;,&quot;loc&quot;:{&quot;line&quot;:554,&quot;column&quot;:13}}">电箱通</span>
          </button>

          {activeProject && (
            <>
              <div className="h-5 w-px bg-border mx-1"  data-qoder-id="qel-h-5-f4126397" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-5-f4126397&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;h-5&quot;,&quot;loc&quot;:{&quot;line&quot;:559,&quot;column&quot;:15}}"/>
              <nav className="flex items-center gap-1 text-sm text-muted-foreground" data-qoder-id="qel-flex-608bb820" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-608bb820&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:560,&quot;column&quot;:15}}">
                <button className="hover:text-foreground transition-colors" onClick={() => { setView('projects'); setActiveProjectId(null); setSelectedBox(null) }} data-qoder-id="qel-hover-text-foreground-e17fa1bf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hover-text-foreground-e17fa1bf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;hover-text-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:561,&quot;column&quot;:17}}">
                  项目
                </button>
                <ChevronRight className="w-3.5 h-3.5"  data-qoder-id="qel-w-3-5-b23879ca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-b23879ca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:564,&quot;column&quot;:17}}"/>
                <span className="text-foreground font-medium" data-qoder-id="qel-text-foreground-949c87ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-foreground-949c87ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:565,&quot;column&quot;:17}}">{activeProject.name}</span>
              </nav>
            </>
          )}
        </div>

        <div className="flex items-center gap-2" data-qoder-id="qel-flex-0833b0a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-0833b0a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:571,&quot;column&quot;:9}}">
          {view !== 'projects' && view !== 'processing' && (
            <Button variant="ghost" size="sm" onClick={goBack} data-qoder-id="qel-button-8968baed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-8968baed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:573,&quot;column&quot;:13}}">
              <ArrowLeft className="w-4 h-4 mr-1"  data-qoder-id="qel-w-4-b7975e6c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-b7975e6c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:574,&quot;column&quot;:15}}"/>返回项目列表
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goHome} title="返回主页" data-qoder-id="qel-h-8-69148bc4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-8-69148bc4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;h-8&quot;,&quot;loc&quot;:{&quot;line&quot;:577,&quot;column&quot;:11}}">
            <Home className="w-4 h-4"  data-qoder-id="qel-w-4-4d2cd26f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-4d2cd26f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:578,&quot;column&quot;:13}}"/>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" data-qoder-id="qel-h-8-5f147c06" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-8-5f147c06&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;h-8&quot;,&quot;loc&quot;:{&quot;line&quot;:580,&quot;column&quot;:11}}"><Bell className="w-4 h-4"  data-qoder-id="qel-w-4-58f04010" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-58f04010&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:580,&quot;column&quot;:67}}"/></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" data-qoder-id="qel-h-8-631243bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-8-631243bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;h-8&quot;,&quot;loc&quot;:{&quot;line&quot;:581,&quot;column&quot;:11}}"><Settings className="w-4 h-4"  data-qoder-id="qel-w-4-e38aa036" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-e38aa036&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:581,&quot;column&quot;:67}}"/></Button>
          {view === 'results' && (
            <Button size="sm" onClick={() => setView('upload')} data-qoder-id="qel-button-8b6afcaa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-8b6afcaa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:583,&quot;column&quot;:13}}">
              <Upload className="w-4 h-4 mr-1.5"  data-qoder-id="qel-w-4-617fefc8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-617fefc8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:584,&quot;column&quot;:15}}"/>上传图纸
            </Button>
          )}
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="flex-1 flex overflow-hidden" data-qoder-id="qel-flex-1-a49214de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-a49214de&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:591,&quot;column&quot;:7}}">

        {/* ─── Sidebar ─── */}
        <div className="w-60 bg-white border-r border-border flex flex-col h-full shrink-0" data-qoder-id="qel-w-60-bc462bb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-60-bc462bb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-60&quot;,&quot;loc&quot;:{&quot;line&quot;:594,&quot;column&quot;:9}}">
          <div className="p-3" data-qoder-id="qel-p-3-f6ebb97d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3-f6ebb97d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;p-3&quot;,&quot;loc&quot;:{&quot;line&quot;:595,&quot;column&quot;:11}}">
            <Button className="w-full justify-start gap-2" size="sm" onClick={createProject} data-qoder-id="qel-w-full-c4cf50fe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-full-c4cf50fe&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-full&quot;,&quot;loc&quot;:{&quot;line&quot;:596,&quot;column&quot;:13}}">
              <Plus className="w-4 h-4"  data-qoder-id="qel-w-4-71bc889e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-71bc889e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:597,&quot;column&quot;:15}}"/>新建项目
            </Button>
          </div>

          <div className="px-3 flex-1 overflow-auto" data-qoder-id="qel-px-3-21f51a3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-px-3-21f51a3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;px-3&quot;,&quot;loc&quot;:{&quot;line&quot;:601,&quot;column&quot;:11}}">
            <div className="text-xs font-medium text-muted-foreground px-2 mb-2" data-qoder-id="qel-text-xs-a2744adb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-a2744adb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:602,&quot;column&quot;:13}}">我的项目</div>
            {projects.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-4 text-center" data-qoder-id="qel-text-xs-bf729309" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-bf729309&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:604,&quot;column&quot;:15}}">暂无项目，点击上方按钮新建</p>
            )}
            <div className="space-y-0.5" data-qoder-id="qel-space-y-0-5-389c695d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-0-5-389c695d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;space-y-0-5&quot;,&quot;loc&quot;:{&quot;line&quot;:606,&quot;column&quot;:13}}">
              {projects.map(project => (
                <div key={project.id} className="group flex items-center gap-2" data-qoder-id="qel-group-6ec20f74" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-group-6ec20f74&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;group&quot;,&quot;loc&quot;:{&quot;line&quot;:608,&quot;column&quot;:17}}">
                  <div
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors flex-1 min-w-0 ${
                      activeProjectId === project.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => openProject(project.id)}
                   data-qoder-id="qel-div-7914db9f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7914db9f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:609,&quot;column&quot;:19}}">
                    <FolderOpen className="w-4 h-4 shrink-0"  data-qoder-id="qel-w-4-404189a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-404189a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:617,&quot;column&quot;:21}}"/>
                    <span className="truncate" data-qoder-id="qel-truncate-7341cf0f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-truncate-7341cf0f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;truncate&quot;,&quot;loc&quot;:{&quot;line&quot;:618,&quot;column&quot;:21}}">{project.name}</span>
                    <span className="ml-auto text-xs opacity-60" data-qoder-id="qel-ml-auto-8d67b231" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-ml-auto-8d67b231&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;ml-auto&quot;,&quot;loc&quot;:{&quot;line&quot;:619,&quot;column&quot;:21}}">
                      {(projectBoxes[project.id] || []).length || ''}
                    </span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity p-1"
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id) }}
                    title="删除项目"
                   data-qoder-id="qel-opacity-0-b1c69cbd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-opacity-0-b1c69cbd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;opacity-0&quot;,&quot;loc&quot;:{&quot;line&quot;:623,&quot;column&quot;:19}}">
                    <Trash2 className="w-3.5 h-3.5"  data-qoder-id="qel-w-3-5-d6d007f4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-d6d007f4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:628,&quot;column&quot;:21}}"/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-border" data-qoder-id="qel-p-3-f4fac0e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3-f4fac0e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;p-3&quot;,&quot;loc&quot;:{&quot;line&quot;:635,&quot;column&quot;:11}}">
            <div className="flex items-center gap-2 px-2 py-1.5" data-qoder-id="qel-flex-9c3b5567" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-9c3b5567&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:636,&quot;column&quot;:13}}">
              <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center text-xs font-medium" data-qoder-id="qel-w-7-bea4b536" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-7-bea4b536&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-7&quot;,&quot;loc&quot;:{&quot;line&quot;:637,&quot;column&quot;:15}}">U</div>
              <div className="flex-1 min-w-0" data-qoder-id="qel-flex-1-218cc977" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-218cc977&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:638,&quot;column&quot;:15}}">
                <div className="text-sm font-medium truncate" data-qoder-id="qel-text-sm-c5ff58c7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-c5ff58c7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:639,&quot;column&quot;:17}}">用户</div>
                <div className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-a9769477" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-a9769477&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:640,&quot;column&quot;:17}}">免费版</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main content ─── */}
        {view === 'projects' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8" data-qoder-id="qel-flex-1-228ccb0a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-228ccb0a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:648,&quot;column&quot;:11}}">
            {projects.length === 0 ? (
              <div className="text-center max-w-md" data-qoder-id="qel-text-center-9c3ee6d9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-9c3ee6d9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:650,&quot;column&quot;:15}}">
                <Layers className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6"  data-qoder-id="qel-w-16-b7a5e087" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-16-b7a5e087&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-16&quot;,&quot;loc&quot;:{&quot;line&quot;:651,&quot;column&quot;:17}}"/>
                <h2 className="text-2xl font-semibold mb-2" data-qoder-id="qel-text-2xl-fc5ea5f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-2xl-fc5ea5f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-2xl&quot;,&quot;loc&quot;:{&quot;line&quot;:652,&quot;column&quot;:17}}">欢迎使用电箱通</h2>
                <p className="text-muted-foreground mb-8" data-qoder-id="qel-text-muted-foreground-7b8e557c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-foreground-7b8e557c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-muted-foreground&quot;,&quot;loc&quot;:{&quot;line&quot;:653,&quot;column&quot;:17}}">
                  上传 CAD 图纸或 PDF 文件，AI 自动识别配电箱层级结构，告别手工梳理。
                </p>
                <Button size="lg" onClick={createProject} data-qoder-id="qel-button-8a5e2f24" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-8a5e2f24&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:656,&quot;column&quot;:17}}">
                  <Plus className="w-4 h-4 mr-2"  data-qoder-id="qel-w-4-ffc423ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-ffc423ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:657,&quot;column&quot;:19}}"/>新建第一个项目
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-2xl" data-qoder-id="qel-w-full-fba7e424" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-full-fba7e424&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-full&quot;,&quot;loc&quot;:{&quot;line&quot;:661,&quot;column&quot;:15}}">
                <h2 className="text-xl font-semibold mb-6" data-qoder-id="qel-text-xl-467d3df7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xl-467d3df7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xl&quot;,&quot;loc&quot;:{&quot;line&quot;:662,&quot;column&quot;:17}}">我的项目</h2>
                <div className="grid grid-cols-2 gap-4" data-qoder-id="qel-grid-23d9845f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-23d9845f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:663,&quot;column&quot;:17}}">
                  {projects.map(p => {
                    const boxes = projectBoxes[p.id] || []
                    const counts = countByType(boxes)
                    return (
                      <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openProject(p.id)} data-qoder-id="qel-cursor-pointer-ce566947" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-cursor-pointer-ce566947&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;cursor-pointer&quot;,&quot;loc&quot;:{&quot;line&quot;:668,&quot;column&quot;:23}}">
                        <div className="p-4" data-qoder-id="qel-p-4-ec3530bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-4-ec3530bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;p-4&quot;,&quot;loc&quot;:{&quot;line&quot;:669,&quot;column&quot;:25}}">
                          <div className="flex items-center gap-2 mb-3" data-qoder-id="qel-flex-0d3e45e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-0d3e45e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:670,&quot;column&quot;:27}}">
                            <FolderOpen className="w-5 h-5 text-primary"  data-qoder-id="qel-w-5-7189b09e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-5-7189b09e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-5&quot;,&quot;loc&quot;:{&quot;line&quot;:671,&quot;column&quot;:29}}"/>
                            <h3 className="font-semibold truncate" data-qoder-id="qel-font-semibold-cfbf4e86" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-font-semibold-cfbf4e86&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;font-semibold&quot;,&quot;loc&quot;:{&quot;line&quot;:672,&quot;column&quot;:29}}">{p.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3" data-qoder-id="qel-text-xs-4d6b23ce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-4d6b23ce&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:674,&quot;column&quot;:27}}">创建于 {p.createdAt}</p>
                          {boxes.length > 0 ? (
                            <div className="flex gap-2 text-xs" data-qoder-id="qel-flex-0b408152" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-0b408152&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:676,&quot;column&quot;:29}}">
                              {counts['一级箱'] > 0 && <Badge variant="secondary" className="bg-blue-50 text-blue-700" data-qoder-id="qel-bg-blue-50-498ae204" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-blue-50-498ae204&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;bg-blue-50&quot;,&quot;loc&quot;:{&quot;line&quot;:677,&quot;column&quot;:53}}">一级 {counts['一级箱']}</Badge>}
                              {counts['二级箱'] > 0 && <Badge variant="secondary" className="bg-emerald-50 text-emerald-700" data-qoder-id="qel-bg-emerald-50-e9c32407" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-emerald-50-e9c32407&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;bg-emerald-50&quot;,&quot;loc&quot;:{&quot;line&quot;:678,&quot;column&quot;:53}}">二级 {counts['二级箱']}</Badge>}
                              {counts['三级箱'] > 0 && <Badge variant="secondary" className="bg-amber-50 text-amber-700" data-qoder-id="qel-bg-amber-50-94373617" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-amber-50-94373617&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;bg-amber-50&quot;,&quot;loc&quot;:{&quot;line&quot;:679,&quot;column&quot;:53}}">三级 {counts['三级箱']}</Badge>}
                              {counts['控制箱'] > 0 && <Badge variant="secondary" className="bg-purple-50 text-purple-700" data-qoder-id="qel-bg-purple-50-eeaa452f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-purple-50-eeaa452f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;bg-purple-50&quot;,&quot;loc&quot;:{&quot;line&quot;:680,&quot;column&quot;:53}}">控制 {counts['控制箱']}</Badge>}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-436b1410" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-436b1410&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:683,&quot;column&quot;:29}}">暂无识别数据</p>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                  <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/40 transition-colors" onClick={createProject} data-qoder-id="qel-border-2-28bf966a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-2-28bf966a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;border-2&quot;,&quot;loc&quot;:{&quot;line&quot;:689,&quot;column&quot;:19}}">
                    <Plus className="w-8 h-8 text-muted-foreground/40 mb-2"  data-qoder-id="qel-w-8-1a9ee4c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-8-1a9ee4c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-8&quot;,&quot;loc&quot;:{&quot;line&quot;:690,&quot;column&quot;:21}}"/>
                    <span className="text-sm text-muted-foreground" data-qoder-id="qel-text-sm-5de66613" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-5de66613&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:691,&quot;column&quot;:21}}">新建项目</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'upload' && <UploadArea onFilesAdded={handleFilesAdded}  data-qoder-id="qel-uploadarea-a432eaee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-uploadarea-a432eaee&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;uploadarea&quot;,&quot;loc&quot;:{&quot;line&quot;:699,&quot;column&quot;:31}}"/>}

        {view === 'processing' && (
          <ProcessingView files={processingFiles} onDone={handleProcessingDone}  data-qoder-id="qel-processingview-554cb0b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-processingview-554cb0b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;processingview&quot;,&quot;loc&quot;:{&quot;line&quot;:702,&quot;column&quot;:11}}"/>
        )}

        {view === 'results' && (
          <div className="flex-1 flex overflow-hidden" data-qoder-id="qel-flex-1-23a8a31a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-23a8a31a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:706,&quot;column&quot;:11}}">
            {/* Left: tree */}
            <div className="w-80 border-r border-border flex flex-col bg-white shrink-0" data-qoder-id="qel-w-80-013e7a78" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-80-013e7a78&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-80&quot;,&quot;loc&quot;:{&quot;line&quot;:708,&quot;column&quot;:13}}">
              <div className="h-12 border-b border-border flex items-center justify-between px-4" data-qoder-id="qel-h-12-cbea7ac9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-12-cbea7ac9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;h-12&quot;,&quot;loc&quot;:{&quot;line&quot;:709,&quot;column&quot;:15}}">
                <div className="flex items-center gap-2" data-qoder-id="qel-flex-1742d2cd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1742d2cd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:710,&quot;column&quot;:17}}">
                  <h3 className="text-sm font-semibold" data-qoder-id="qel-text-sm-a7befa09" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-a7befa09&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:711,&quot;column&quot;:19}}">配电箱层级</h3>
                  <Badge variant="secondary" className="text-xs" data-qoder-id="qel-text-xs-c8b5cbd7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-c8b5cbd7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:712,&quot;column&quot;:19}}">{activeProject?.name}</Badge>
                </div>
              </div>

              <div className="p-3 border-b border-border" data-qoder-id="qel-p-3-ebdc9da2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3-ebdc9da2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;p-3&quot;,&quot;loc&quot;:{&quot;line&quot;:716,&quot;column&quot;:15}}">
                <div className="relative" data-qoder-id="qel-relative-aa4534c9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-relative-aa4534c9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;relative&quot;,&quot;loc&quot;:{&quot;line&quot;:717,&quot;column&quot;:17}}">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"  data-qoder-id="qel-absolute-ffc6c5ba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-absolute-ffc6c5ba&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;absolute&quot;,&quot;loc&quot;:{&quot;line&quot;:718,&quot;column&quot;:19}}"/>
                  <input
                    type="text" placeholder="搜索配电箱..." value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                   data-qoder-id="qel-w-full-487906d7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-full-487906d7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-full&quot;,&quot;loc&quot;:{&quot;line&quot;:719,&quot;column&quot;:19}}"/>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-2" data-qoder-id="qel-flex-1-21aade8b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-21aade8b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:727,&quot;column&quot;:15}}">
                {filteredBoxes.length > 0 ? (
                  filteredBoxes.map(box => (
                    <TreeNode key={box.id} box={box} selectedId={selectedBox?.id} onSelect={setSelectedBox}  data-qoder-id="qel-treenode-803a2aa6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-803a2aa6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:730,&quot;column&quot;:21}}"/>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8" data-qoder-id="qel-text-xs-c165ca3c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-c165ca3c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:733,&quot;column&quot;:19}}">
                    {searchText ? '没有匹配的配电箱' : '暂无数据'}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="border-t border-border p-3" data-qoder-id="qel-border-t-7382149c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-border-t-7382149c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;border-t&quot;,&quot;loc&quot;:{&quot;line&quot;:740,&quot;column&quot;:15}}">
                <div className="grid grid-cols-4 gap-2 text-center" data-qoder-id="qel-grid-27f9de56" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-27f9de56&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:741,&quot;column&quot;:17}}">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div key={type} data-qoder-id="qel-div-8935487a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8935487a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:743,&quot;column&quot;:21}}">
                      <div className={`text-lg font-bold ${type === '一级箱' ? 'text-blue-600' : type === '二级箱' ? 'text-emerald-600' : type === '三级箱' ? 'text-amber-600' : 'text-purple-600'}`} data-qoder-id="qel-div-c9228925" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-c9228925&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:744,&quot;column&quot;:23}}">
                        {count}
                      </div>
                      <div className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-f5324b3a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-f5324b3a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:747,&quot;column&quot;:23}}">{type.replace('箱', '')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: detail + file list */}
            <div className="flex-1 bg-white overflow-auto flex flex-col" data-qoder-id="qel-flex-1-32fd01c1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-32fd01c1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:755,&quot;column&quot;:13}}">
              <BoxDetail box={selectedBox} files={currentFiles} onViewFile={handleViewFile}  data-qoder-id="qel-boxdetail-2c14dff0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-boxdetail-2c14dff0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;boxdetail&quot;,&quot;loc&quot;:{&quot;line&quot;:756,&quot;column&quot;:15}}"/>

              {currentFiles.length > 0 && (
                <div className="px-5 pb-5 border-t border-border pt-4" data-qoder-id="qel-px-5-ac46cdd8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-px-5-ac46cdd8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;px-5&quot;,&quot;loc&quot;:{&quot;line&quot;:759,&quot;column&quot;:17}}">
                  <h3 className="text-sm font-semibold mb-3" data-qoder-id="qel-text-sm-67f68a37" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-67f68a37&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:760,&quot;column&quot;:19}}">已上传图纸 ({currentFiles.length})</h3>
                  <div className="space-y-1.5" data-qoder-id="qel-space-y-1-5-4d1943a8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-1-5-4d1943a8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;space-y-1-5&quot;,&quot;loc&quot;:{&quot;line&quot;:761,&quot;column&quot;:19}}">
                    {currentFiles.map((f, i) => {
                      const Icon = categoryIcon(getFileCategory(f.name))
                      return (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleViewFile(f)} data-qoder-id="qel-flex-5cf52894" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-5cf52894&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:765,&quot;column&quot;:25}}">
                          <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${categoryColor(getFileCategory(f.name))}`} data-qoder-id="qel-div-d12295bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d12295bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:767,&quot;column&quot;:27}}">
                            <Icon className="w-3.5 h-3.5"  data-qoder-id="qel-w-3-5-81b938b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-81b938b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:768,&quot;column&quot;:29}}"/>
                          </div>
                          <span className="text-sm truncate flex-1" data-qoder-id="qel-text-sm-23abd740" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-23abd740&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:770,&quot;column&quot;:27}}">{f.name}</span>
                          <span className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-17aee1d2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-17aee1d2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:771,&quot;column&quot;:27}}">{fmtSize(f.size)}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); handleViewFile(f) }} data-qoder-id="qel-h-7-19d91850" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-7-19d91850&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;h-7&quot;,&quot;loc&quot;:{&quot;line&quot;:772,&quot;column&quot;:27}}">
                            <Eye className="w-3.5 h-3.5"  data-qoder-id="qel-w-3-5-b169e03f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-b169e03f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:773,&quot;column&quot;:29}}"/>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── File Viewer Overlay ─── */}
      {viewingFile && <FileViewer file={viewingFile} onClose={closeViewer}  data-qoder-id="qel-fileviewer-014b1284" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fileviewer-014b1284&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/DashboardPage.jsx&quot;,&quot;componentName&quot;:&quot;DashboardPage&quot;,&quot;elementRole&quot;:&quot;fileviewer&quot;,&quot;loc&quot;:{&quot;line&quot;:787,&quot;column&quot;:23}}"/>}
    </div>
  )
}
