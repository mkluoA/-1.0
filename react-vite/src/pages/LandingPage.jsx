import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Zap, FileSearch, Network, Users, Building2, Calculator,
  Upload, FileText, TreePine, ArrowRight, CheckCircle2,
  Layers, BarChart3, Shield, ChevronRight
} from 'lucide-react'

function Navbar(qoderProps) {
  const navigate = useNavigate()
  return (
    <nav className={["fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between" data-qoder-id="qel-max-w-7xl-5c0f92c8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-7xl-5c0f92c8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;max-w-7xl&quot;,&quot;loc&quot;:{&quot;line&quot;:12,&quot;column&quot;:7}}">
        <div className="flex items-center gap-2" data-qoder-id="qel-flex-a114478e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-a114478e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:13,&quot;column&quot;:9}}">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" data-qoder-id="qel-w-8-baa807f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-8-baa807f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;w-8&quot;,&quot;loc&quot;:{&quot;line&quot;:14,&quot;column&quot;:11}}">
            <Layers className="w-5 h-5 text-white"  data-qoder-id="qel-w-5-9c56035f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-5-9c56035f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;w-5&quot;,&quot;loc&quot;:{&quot;line&quot;:15,&quot;column&quot;:13}}"/>
          </div>
          <span className="text-lg font-semibold text-foreground" data-qoder-id="qel-text-lg-23678390" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-23678390&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:17,&quot;column&quot;:11}}">电箱通</span>
        </div>
        <div className="hidden md:flex items-center gap-8" data-qoder-id="qel-hidden-e1bc5b8d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hidden-e1bc5b8d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;hidden&quot;,&quot;loc&quot;:{&quot;line&quot;:19,&quot;column&quot;:9}}">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-112a9fc6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-112a9fc6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:20,&quot;column&quot;:11}}">功能特性</a>
          <a href="#users" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-122aa159" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-122aa159&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:21,&quot;column&quot;:11}}">适用场景</a>
          <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-f22f86d3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-f22f86d3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:22,&quot;column&quot;:11}}">使用流程</a>
        </div>
        <div className="flex items-center gap-3" data-qoder-id="qel-flex-c5e7981b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-c5e7981b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:24,&quot;column&quot;:9}}">
          <Button variant="ghost" size="sm" data-qoder-id="qel-button-6a2c3f02" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-6a2c3f02&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:25,&quot;column&quot;:11}}">登录</Button>
          <Button size="sm" onClick={() => navigate('/dashboard')} data-qoder-id="qel-button-6b2c4095" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-6b2c4095&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Navbar&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:26,&quot;column&quot;:11}}">免费试用</Button>
        </div>
      </div>
    </nav>
  )
}

function HeroSection(qoderProps) {
  const navigate = useNavigate()
  return (
    <section className={["pt-32 pb-20 px-6", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="max-w-4xl mx-auto text-center" data-qoder-id="qel-max-w-4xl-c7becc7a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-4xl-c7becc7a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;max-w-4xl&quot;,&quot;loc&quot;:{&quot;line&quot;:36,&quot;column&quot;:7}}">
        <Badge variant="secondary" className="mb-6 px-4 py-1.5" data-qoder-id="qel-mb-6-ba569308" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mb-6-ba569308&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;mb-6&quot;,&quot;loc&quot;:{&quot;line&quot;:37,&quot;column&quot;:9}}">
          <Zap className="w-3.5 h-3.5 mr-1.5 text-primary"  data-qoder-id="qel-w-3-5-74155bb0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-5-74155bb0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;w-3-5&quot;,&quot;loc&quot;:{&quot;line&quot;:38,&quot;column&quot;:11}}"/>
          AI 驱动的智能配电箱梳理工具
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6" data-qoder-id="qel-text-5xl-093d4e05" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-5xl-093d4e05&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;text-5xl&quot;,&quot;loc&quot;:{&quot;line&quot;:41,&quot;column&quot;:9}}">
          配电箱图纸识别，
          <br  data-qoder-id="qel-br-647718c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-br-647718c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;br&quot;,&quot;loc&quot;:{&quot;line&quot;:43,&quot;column&quot;:11}}"/>
          <span className="text-primary" data-qoder-id="qel-text-primary-255495da" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-primary-255495da&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;text-primary&quot;,&quot;loc&quot;:{&quot;line&quot;:44,&quot;column&quot;:11}}">从此告别手工梳理</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10" data-qoder-id="qel-text-xl-8fb3623f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xl-8fb3623f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;text-xl&quot;,&quot;loc&quot;:{&quot;line&quot;:46,&quot;column&quot;:9}}">
          上传 CAD 图纸或 PDF 文件，AI 自动识别一级箱、二级箱、三级箱的编号、名称和部位，
          生成清晰的层级结构树，让工程算量、施工管理和厂家组价效率提升 10 倍。
        </p>
        <div className="flex items-center justify-center gap-4" data-qoder-id="qel-flex-354f7c86" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-354f7c86&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:9}}">
          <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/dashboard')} data-qoder-id="qel-h-12-0a88eccb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-12-0a88eccb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;h-12&quot;,&quot;loc&quot;:{&quot;line&quot;:51,&quot;column&quot;:11}}">
            开始免费试用
            <ArrowRight className="ml-2 w-4 h-4"  data-qoder-id="qel-ml-2-094e00b1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-ml-2-094e00b1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;ml-2&quot;,&quot;loc&quot;:{&quot;line&quot;:53,&quot;column&quot;:13}}"/>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base" data-qoder-id="qel-h-12-1088f63d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-12-1088f63d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;h-12&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:11}}">
            观看演示视频
          </Button>
        </div>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground" data-qoder-id="qel-mt-12-dcd51880" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-12-dcd51880&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;mt-12&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:9}}">
          <div className="flex items-center gap-1.5" data-qoder-id="qel-flex-3a4f8465" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-3a4f8465&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:11}}">
            <CheckCircle2 className="w-4 h-4 text-green-500"  data-qoder-id="qel-w-4-5b88bd8c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-5b88bd8c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:13}}"/>
            无需安装，在线使用
          </div>
          <div className="flex items-center gap-1.5" data-qoder-id="qel-flex-3c4f878b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-3c4f878b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:64,&quot;column&quot;:11}}">
            <CheckCircle2 className="w-4 h-4 text-green-500"  data-qoder-id="qel-w-4-e98bdbad" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-e98bdbad&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:65,&quot;column&quot;:13}}"/>
            支持 CAD/PDF 格式
          </div>
          <div className="flex items-center gap-1.5" data-qoder-id="qel-flex-3851bfd6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-3851bfd6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:68,&quot;column&quot;:11}}">
            <CheckCircle2 className="w-4 h-4 text-green-500"  data-qoder-id="qel-w-4-e78bd887" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-e78bd887&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:69,&quot;column&quot;:13}}"/>
            数据本地化处理
          </div>
        </div>
      </div>

      {/* Hero visual - mockup of the app interface */}
      <div className="max-w-5xl mx-auto mt-16" data-qoder-id="qel-max-w-5xl-57c15587" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-5xl-57c15587&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;max-w-5xl&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:7}}">
        <div className="rounded-xl border border-border bg-white shadow-2xl shadow-black/5 overflow-hidden" data-qoder-id="qel-rounded-xl-0b612b60" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rounded-xl-0b612b60&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;rounded-xl&quot;,&quot;loc&quot;:{&quot;line&quot;:77,&quot;column&quot;:9}}">
          <div className="h-10 bg-muted border-b border-border flex items-center px-4 gap-2" data-qoder-id="qel-h-10-05987d51" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-10-05987d51&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;h-10&quot;,&quot;loc&quot;:{&quot;line&quot;:78,&quot;column&quot;:11}}">
            <div className="w-3 h-3 rounded-full bg-red-400"  data-qoder-id="qel-w-3-1ab95f6b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-1ab95f6b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;w-3&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:13}}"/>
            <div className="w-3 h-3 rounded-full bg-yellow-400"  data-qoder-id="qel-w-3-19b95dd8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-19b95dd8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;w-3&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:13}}"/>
            <div className="w-3 h-3 rounded-full bg-green-400"  data-qoder-id="qel-w-3-18b95c45" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-3-18b95c45&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;w-3&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:13}}"/>
            <div className="flex-1 mx-4" data-qoder-id="qel-flex-1-3ca652d0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-1-3ca652d0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;flex-1&quot;,&quot;loc&quot;:{&quot;line&quot;:82,&quot;column&quot;:13}}">
              <div className="bg-white rounded-md h-6 max-w-xs mx-auto border border-border flex items-center px-3" data-qoder-id="qel-bg-white-7344ade6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-white-7344ade6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;bg-white&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:15}}">
                <span className="text-xs text-muted-foreground" data-qoder-id="qel-text-xs-9096874a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-9096874a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:17}}">app.diantong.com/dashboard</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-[320px]" data-qoder-id="qel-p-6-75e02a7e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-6-75e02a7e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;p-6&quot;,&quot;loc&quot;:{&quot;line&quot;:88,&quot;column&quot;:11}}">
            <div className="grid grid-cols-12 gap-4" data-qoder-id="qel-grid-cd4173c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-cd4173c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:89,&quot;column&quot;:13}}">
              {/* Sidebar mockup */}
              <div className="col-span-3 bg-white rounded-lg border border-border p-4" data-qoder-id="qel-col-span-3-a9cff824" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-col-span-3-a9cff824&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;col-span-3&quot;,&quot;loc&quot;:{&quot;line&quot;:91,&quot;column&quot;:15}}">
                <div className="text-xs font-medium text-muted-foreground mb-3" data-qoder-id="qel-text-xs-35624517" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-35624517&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:92,&quot;column&quot;:17}}">项目列表</div>
                <div className="space-y-2" data-qoder-id="qel-space-y-2-2adbe592" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-2-2adbe592&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;space-y-2&quot;,&quot;loc&quot;:{&quot;line&quot;:93,&quot;column&quot;:17}}">
                  {['万达广场二期', '城南花园住宅区', '科技园 A 栋'].map((name, i) => (
                    <div key={i} className={`px-3 py-2 rounded-md text-sm ${i === 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'} cursor-pointer transition-colors`} data-qoder-id="qel-div-0fe9e195" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0fe9e195&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:95,&quot;column&quot;:21}}">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
              {/* Main content mockup */}
              <div className="col-span-9 bg-white rounded-lg border border-border p-5" data-qoder-id="qel-col-span-9-17260092" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-col-span-9-17260092&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;col-span-9&quot;,&quot;loc&quot;:{&quot;line&quot;:102,&quot;column&quot;:15}}">
                <div className="flex items-center justify-between mb-4" data-qoder-id="qel-flex-405e9861" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-405e9861&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:103,&quot;column&quot;:17}}">
                  <div className="text-sm font-medium" data-qoder-id="qel-text-sm-8bff6ce2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-8bff6ce2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:104,&quot;column&quot;:19}}">配电箱层级结构</div>
                  <Badge variant="secondary" className="text-xs" data-qoder-id="qel-text-xs-0c8d7e6e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-0c8d7e6e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:105,&quot;column&quot;:19}}">万达广场二期</Badge>
                </div>
                <div className="space-y-1.5" data-qoder-id="qel-space-y-1-5-f921a1e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-1-5-f921a1e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;space-y-1-5&quot;,&quot;loc&quot;:{&quot;line&quot;:107,&quot;column&quot;:17}}">
                  <TreeNode name="AL-1" label="总配电箱" sublabel="地下室配电间" level={0} color="blue"  data-qoder-id="qel-treenode-07e3d8ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-07e3d8ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:19}}"/>
                  <TreeNode name="AP-1-1" label="一层照明配电箱" sublabel="一层电气井" level={1} color="emerald"  data-qoder-id="qel-treenode-06e3d759" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-06e3d759&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:19}}"/>
                  <TreeNode name="AP-1-2" label="一层动力配电箱" sublabel="一层电气井" level={1} color="emerald"  data-qoder-id="qel-treenode-05e3d5c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-05e3d5c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:19}}"/>
                  <TreeNode name="AL-2-1" label="二层照明配电箱" sublabel="二层电气井" level={1} color="emerald"  data-qoder-id="qel-treenode-04e3d433" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-04e3d433&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:19}}"/>
                  <TreeNode name="AP-2-1" label="二层动力配电箱" sublabel="二层电气井" level={1} color="emerald"  data-qoder-id="qel-treenode-03e3d2a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-03e3d2a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:19}}"/>
                  <TreeNode name="AL-3-1" label="三层配电箱" sublabel="三层电气井" level={1} color="amber"  data-qoder-id="qel-treenode-12e3ea3d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-treenode-12e3ea3d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;HeroSection&quot;,&quot;elementRole&quot;:&quot;treenode&quot;,&quot;loc&quot;:{&quot;line&quot;:113,&quot;column&quot;:19}}"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TreeNode({ name, label, sublabel, level, color, ...qoderProps }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  }
  return (
    <div className={["flex items-center gap-2", qoderProps?.className].filter(Boolean).join(" ")} style={{ ...({ paddingLeft: `${level * 24}px` }), ...(qoderProps?.style) }} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {level > 0 && <div className="w-4 h-px bg-border"  data-qoder-id="qel-w-4-10fc0ab8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-10fc0ab8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:21}}"/>}
      <div className={`px-2.5 py-1 rounded border text-xs font-mono font-medium ${colors[color]}`} data-qoder-id="qel-div-09ce2002" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-09ce2002&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:7}}">
        {name}
      </div>
      <span className="text-sm text-foreground" data-qoder-id="qel-text-sm-984ac9eb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-984ac9eb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:7}}">{label}</span>
      <span className="text-xs text-muted-foreground ml-auto" data-qoder-id="qel-text-xs-cd3d79af" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-cd3d79af&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;TreeNode&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:7}}">{sublabel}</span>
    </div>
  )
}

function FeaturesSection(qoderProps) {
  const features = [
    {
      icon: FileSearch,
      title: '智能图纸识别',
      description: '基于深度学习的 CAD/PDF 解析引擎，自动提取配电箱编号、名称、回路信息和安装部位，识别准确率超过 95%。',
    },
    {
      icon: Network,
      title: '层级关系自动构建',
      description: '智能推断一级箱→二级箱→三级箱→控制箱的拓扑关系，自动生成树状层级结构图，告别手工连线。',
    },
    {
      icon: Layers,
      title: '元器件清单提取',
      description: '自动识别箱内元器件（断路器、接触器、热继电器等），生成 BOM 清单，方便厂家直接组价。',
    },
    {
      icon: BarChart3,
      title: '数据统计与导出',
      description: '一键导出 Excel/PDF 格式的配电箱汇总表、元器件清单和层级关系图，无缝对接预算和施工流程。',
    },
    {
      icon: Shield,
      title: '数据安全可靠',
      description: '文件处理在本地完成，不上传云端。支持离线使用，工程图纸安全有保障。',
    },
    {
      icon: Zap,
      title: '效率提升 10 倍',
      description: '传统手工梳理一个项目需要 2-3 天，使用电箱通仅需 10 分钟，让工程师专注高价值工作。',
    },
  ]

  return (
    <section id="features" className={["py-24 px-6 bg-muted/30", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="max-w-7xl mx-auto" data-qoder-id="qel-max-w-7xl-1615af91" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-7xl-1615af91&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;max-w-7xl&quot;,&quot;loc&quot;:{&quot;line&quot;:178,&quot;column&quot;:7}}">
        <div className="text-center mb-16" data-qoder-id="qel-text-center-cd02e7d3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-cd02e7d3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:179,&quot;column&quot;:9}}">
          <Badge variant="secondary" className="mb-4" data-qoder-id="qel-mb-4-d011b0bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mb-4-d011b0bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;mb-4&quot;,&quot;loc&quot;:{&quot;line&quot;:180,&quot;column&quot;:11}}">核心功能</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-qoder-id="qel-text-3xl-b327103e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-3xl-b327103e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;text-3xl&quot;,&quot;loc&quot;:{&quot;line&quot;:181,&quot;column&quot;:11}}">
            从图纸到数据，一步到位
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-qoder-id="qel-text-lg-6fa7b6d3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-6fa7b6d3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:184,&quot;column&quot;:11}}">
            AI 驱动的配电箱信息提取与结构化引擎，覆盖从图纸识别到数据输出的完整链路
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-qoder-id="qel-grid-d8b5479d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-d8b5479d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:188,&quot;column&quot;:9}}">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
             data-qoder-id="qel-bg-white-ea76641f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-white-ea76641f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;bg-white&quot;,&quot;loc&quot;:{&quot;line&quot;:190,&quot;column&quot;:13}}">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4" data-qoder-id="qel-w-10-dbb780a8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-10-dbb780a8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;w-10&quot;,&quot;loc&quot;:{&quot;line&quot;:194,&quot;column&quot;:15}}">
                <feature.icon className="w-5 h-5 text-primary"  data-qoder-id="qel-w-5-fc488cf5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-5-fc488cf5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;w-5&quot;,&quot;loc&quot;:{&quot;line&quot;:195,&quot;column&quot;:17}}"/>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2" data-qoder-id="qel-text-lg-022f8e58" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-022f8e58&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:197,&quot;column&quot;:15}}">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" data-qoder-id="qel-text-sm-7974b0dd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-7974b0dd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;FeaturesSection&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:198,&quot;column&quot;:15}}">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UsersSection(qoderProps) {
  const users = [
    {
      icon: Calculator,
      role: '预算员 / 造价员',
      pain: '手工数箱子、对回路，容易遗漏出错',
      gain: '自动统计配电箱数量和回路信息，算量效率提升 10 倍',
      color: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Users,
      role: '电气工程师 / 施工管理',
      pain: '图纸层级关系混乱，现场施工交底困难',
      gain: '清晰的层级树状图，施工交底一目了然',
      color: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Building2,
      role: '分包单位',
      pain: '需要反复翻阅图纸确认施工范围和内容',
      gain: '结构化数据直接指导施工，减少沟通成本',
      color: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      icon: Building2,
      role: '配电箱厂家',
      pain: '组价时需要手工梳理箱内元器件清单',
      gain: '自动提取 BOM 清单，直接用于报价和生产',
      color: 'bg-purple-50 border-purple-100',
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <section id="users" className={["py-24 px-6", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="max-w-7xl mx-auto" data-qoder-id="qel-max-w-7xl-2f1ccf87" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-7xl-2f1ccf87&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;max-w-7xl&quot;,&quot;loc&quot;:{&quot;line&quot;:245,&quot;column&quot;:7}}">
        <div className="text-center mb-16" data-qoder-id="qel-text-center-f9de5119" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-f9de5119&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:246,&quot;column&quot;:9}}">
          <Badge variant="secondary" className="mb-4" data-qoder-id="qel-mb-4-1a848dc7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mb-4-1a848dc7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;mb-4&quot;,&quot;loc&quot;:{&quot;line&quot;:247,&quot;column&quot;:11}}">适用场景</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-qoder-id="qel-text-3xl-e6b33035" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-3xl-e6b33035&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-3xl&quot;,&quot;loc&quot;:{&quot;line&quot;:248,&quot;column&quot;:11}}">
            为工程人而生
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-qoder-id="qel-text-lg-4a5f56cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-4a5f56cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:251,&quot;column&quot;:11}}">
            无论是算量、施工管理还是厂家组价，电箱通都能帮你大幅提效
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6" data-qoder-id="qel-grid-9e894103" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-9e894103&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:255,&quot;column&quot;:9}}">
          {users.map((user, i) => (
            <div key={i} className={`rounded-xl border p-6 ${user.color}`} data-qoder-id="qel-div-6c24a12b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-6c24a12b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:257,&quot;column&quot;:13}}">
              <user.icon className={`w-8 h-8 mb-4 ${user.iconColor}`}  data-qoder-id="qel-user-icon-0fcab27d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-user-icon-0fcab27d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;user-icon&quot;,&quot;loc&quot;:{&quot;line&quot;:258,&quot;column&quot;:15}}"/>
              <h3 className="text-lg font-semibold text-foreground mb-3" data-qoder-id="qel-text-lg-6c266b37" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-6c266b37&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:259,&quot;column&quot;:15}}">{user.role}</h3>
              <div className="space-y-2" data-qoder-id="qel-space-y-2-43e143e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-2-43e143e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;space-y-2&quot;,&quot;loc&quot;:{&quot;line&quot;:260,&quot;column&quot;:15}}">
                <div className="flex items-start gap-2" data-qoder-id="qel-flex-12decc6d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-12decc6d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:261,&quot;column&quot;:17}}">
                  <span className="text-xs text-destructive font-medium mt-0.5 shrink-0" data-qoder-id="qel-text-xs-138da6a3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-138da6a3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:262,&quot;column&quot;:19}}">痛点</span>
                  <span className="text-sm text-muted-foreground" data-qoder-id="qel-text-sm-cda0c05f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-cda0c05f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:263,&quot;column&quot;:19}}">{user.pain}</span>
                </div>
                <div className="flex items-start gap-2" data-qoder-id="qel-flex-11e10971" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-11e10971&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:265,&quot;column&quot;:17}}">
                  <span className="text-xs text-green-600 font-medium mt-0.5 shrink-0" data-qoder-id="qel-text-xs-968aa345" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-xs-968aa345&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-xs&quot;,&quot;loc&quot;:{&quot;line&quot;:266,&quot;column&quot;:19}}">解决</span>
                  <span className="text-sm text-foreground" data-qoder-id="qel-text-sm-58a3d9c7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-58a3d9c7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;UsersSection&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:267,&quot;column&quot;:19}}">{user.gain}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkflowSection(qoderProps) {
  const steps = [
    {
      step: '01',
      icon: Upload,
      title: '上传图纸',
      description: '支持 CAD（.dwg/.dxf）和 PDF 格式，支持批量上传整个项目的多张图纸。',
    },
    {
      step: '02',
      icon: FileText,
      title: 'AI 智能识别',
      description: 'AI 引擎自动解析图纸内容，提取配电箱编号、名称、回路和安装部位信息。',
    },
    {
      step: '03',
      icon: TreePine,
      title: '层级结构生成',
      description: '自动推断配电箱之间的层级关系，生成一级箱→二级箱→三级箱的树状结构图。',
    },
    {
      step: '04',
      icon: BarChart3,
      title: '数据导出应用',
      description: '在线校验和修正识别结果，一键导出 Excel 汇总表、BOM 清单和层级关系图。',
    },
  ]

  return (
    <section id="workflow" className={["py-24 px-6 bg-muted/30", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="max-w-5xl mx-auto" data-qoder-id="qel-max-w-5xl-b1434419" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-5xl-b1434419&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;max-w-5xl&quot;,&quot;loc&quot;:{&quot;line&quot;:308,&quot;column&quot;:7}}">
        <div className="text-center mb-16" data-qoder-id="qel-text-center-6358b4b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-center-6358b4b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;text-center&quot;,&quot;loc&quot;:{&quot;line&quot;:309,&quot;column&quot;:9}}">
          <Badge variant="secondary" className="mb-4" data-qoder-id="qel-mb-4-6413c7d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mb-4-6413c7d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;mb-4&quot;,&quot;loc&quot;:{&quot;line&quot;:310,&quot;column&quot;:11}}">使用流程</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-qoder-id="qel-text-3xl-b6b526a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-3xl-b6b526a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;text-3xl&quot;,&quot;loc&quot;:{&quot;line&quot;:311,&quot;column&quot;:11}}">
            四步完成配电箱梳理
          </h2>
          <p className="text-lg text-muted-foreground" data-qoder-id="qel-text-lg-23a9d711" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-lg-23a9d711&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;text-lg&quot;,&quot;loc&quot;:{&quot;line&quot;:314,&quot;column&quot;:11}}">
            从上传图纸到导出数据，全程仅需 10 分钟
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8" data-qoder-id="qel-grid-c9cecf46" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-c9cecf46&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:318,&quot;column&quot;:9}}">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center" data-qoder-id="qel-relative-db65b5bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-relative-db65b5bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;relative&quot;,&quot;loc&quot;:{&quot;line&quot;:320,&quot;column&quot;:13}}">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" data-qoder-id="qel-hidden-24357e64" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hidden-24357e64&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;hidden&quot;,&quot;loc&quot;:{&quot;line&quot;:322,&quot;column&quot;:17}}">
                  <ChevronRight className="w-4 h-4 text-muted-foreground absolute -right-2 -top-2"  data-qoder-id="qel-w-4-454e1af7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-454e1af7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:323,&quot;column&quot;:19}}"/>
                </div>
              )}
              <div className="w-16 h-16 bg-white rounded-xl border border-border shadow-sm flex items-center justify-center mx-auto mb-4 relative" data-qoder-id="qel-w-16-b2fca435" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-16-b2fca435&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;w-16&quot;,&quot;loc&quot;:{&quot;line&quot;:326,&quot;column&quot;:15}}">
                <step.icon className="w-7 h-7 text-primary"  data-qoder-id="qel-w-7-884f9370" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-7-884f9370&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;w-7&quot;,&quot;loc&quot;:{&quot;line&quot;:327,&quot;column&quot;:17}}"/>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center" data-qoder-id="qel-absolute-496da5ea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-absolute-496da5ea&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;absolute&quot;,&quot;loc&quot;:{&quot;line&quot;:328,&quot;column&quot;:17}}">
                  {step.step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2" data-qoder-id="qel-text-base-db27603e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-base-db27603e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;text-base&quot;,&quot;loc&quot;:{&quot;line&quot;:332,&quot;column&quot;:15}}">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" data-qoder-id="qel-text-sm-2ef1f93f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2ef1f93f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;WorkflowSection&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:333,&quot;column&quot;:15}}">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection(qoderProps) {
  const navigate = useNavigate()
  return (
    <section className={["py-24 px-6", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="max-w-3xl mx-auto" data-qoder-id="qel-max-w-3xl-e4e97b55" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-3xl-e4e97b55&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;max-w-3xl&quot;,&quot;loc&quot;:{&quot;line&quot;:345,&quot;column&quot;:7}}">
        <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-12 text-center text-white" data-qoder-id="qel-bg-gradient-to-br-91f7df32" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-bg-gradient-to-br-91f7df32&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;bg-gradient-to-br&quot;,&quot;loc&quot;:{&quot;line&quot;:346,&quot;column&quot;:9}}">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-qoder-id="qel-text-3xl-1b56f97c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-3xl-1b56f97c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;text-3xl&quot;,&quot;loc&quot;:{&quot;line&quot;:347,&quot;column&quot;:11}}">
            准备好告别手工梳理了吗？
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto" data-qoder-id="qel-text-blue-100-8c47bbb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-blue-100-8c47bbb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;text-blue-100&quot;,&quot;loc&quot;:{&quot;line&quot;:350,&quot;column&quot;:11}}">
            立即注册，上传你的第一份图纸，体验 AI 驱动的配电箱智能梳理。
            新用户可免费试用 3 个项目。
          </p>
          <div className="flex items-center justify-center gap-4" data-qoder-id="qel-flex-7649e2c1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-7649e2c1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:354,&quot;column&quot;:11}}">
            <Button size="lg" className="h-12 px-8 bg-white text-primary hover:bg-blue-50 text-base font-semibold" onClick={() => navigate('/dashboard')} data-qoder-id="qel-h-12-99e3fcc2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-12-99e3fcc2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;h-12&quot;,&quot;loc&quot;:{&quot;line&quot;:355,&quot;column&quot;:13}}">
              免费开始使用
              <ArrowRight className="ml-2 w-4 h-4"  data-qoder-id="qel-ml-2-6004f264" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-ml-2-6004f264&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;ml-2&quot;,&quot;loc&quot;:{&quot;line&quot;:357,&quot;column&quot;:15}}"/>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 border-white/30 text-white hover:bg-white/10 text-base" data-qoder-id="qel-h-12-97e3f99c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h-12-97e3f99c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;CTASection&quot;,&quot;elementRole&quot;:&quot;h-12&quot;,&quot;loc&quot;:{&quot;line&quot;:359,&quot;column&quot;:13}}">
              联系销售
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer(qoderProps) {
  return (
    <footer className={["border-t border-border py-12 px-6", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="max-w-7xl mx-auto" data-qoder-id="qel-max-w-7xl-f69a4805" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-max-w-7xl-f69a4805&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;max-w-7xl&quot;,&quot;loc&quot;:{&quot;line&quot;:372,&quot;column&quot;:7}}">
        <div className="grid md:grid-cols-4 gap-8" data-qoder-id="qel-grid-ff76c54a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-grid-ff76c54a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;grid&quot;,&quot;loc&quot;:{&quot;line&quot;:373,&quot;column&quot;:9}}">
          <div data-qoder-id="qel-div-d847cd0b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d847cd0b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:374,&quot;column&quot;:11}}">
            <div className="flex items-center gap-2 mb-4" data-qoder-id="qel-flex-0b5c9c42" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-flex-0b5c9c42&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;flex&quot;,&quot;loc&quot;:{&quot;line&quot;:375,&quot;column&quot;:13}}">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center" data-qoder-id="qel-w-7-54c560bf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-7-54c560bf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;w-7&quot;,&quot;loc&quot;:{&quot;line&quot;:376,&quot;column&quot;:15}}">
                <Layers className="w-4 h-4 text-white"  data-qoder-id="qel-w-4-9416390c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-w-4-9416390c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;w-4&quot;,&quot;loc&quot;:{&quot;line&quot;:377,&quot;column&quot;:17}}"/>
              </div>
              <span className="text-base font-semibold" data-qoder-id="qel-text-base-a2e3c2a8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-base-a2e3c2a8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-base&quot;,&quot;loc&quot;:{&quot;line&quot;:379,&quot;column&quot;:15}}">电箱通</span>
            </div>
            <p className="text-sm text-muted-foreground" data-qoder-id="qel-text-sm-2d2208ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2d2208ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:381,&quot;column&quot;:13}}">
              AI 驱动的配电箱智能梳理工具，让工程人从重复劳动中解放。
            </p>
          </div>
          <div data-qoder-id="qel-div-de47d67d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-de47d67d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:385,&quot;column&quot;:11}}">
            <h4 className="text-sm font-semibold mb-3" data-qoder-id="qel-text-sm-458af1b0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-458af1b0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:386,&quot;column&quot;:13}}">产品</h4>
            <div className="space-y-2" data-qoder-id="qel-space-y-2-5fbf8c7b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-2-5fbf8c7b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;space-y-2&quot;,&quot;loc&quot;:{&quot;line&quot;:387,&quot;column&quot;:13}}">
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-2d450ff1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2d450ff1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:388,&quot;column&quot;:15}}">功能介绍</div>
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-2a4749cf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2a4749cf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:389,&quot;column&quot;:15}}">价格方案</div>
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-2947483c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2947483c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:390,&quot;column&quot;:15}}">更新日志</div>
            </div>
          </div>
          <div data-qoder-id="qel-div-d04581dc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-d04581dc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:393,&quot;column&quot;:11}}">
            <h4 className="text-sm font-semibold mb-3" data-qoder-id="qel-text-sm-4988b965" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-4988b965&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:394,&quot;column&quot;:13}}">支持</h4>
            <div className="space-y-2" data-qoder-id="qel-space-y-2-edbc9a6e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-2-edbc9a6e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;space-y-2&quot;,&quot;loc&quot;:{&quot;line&quot;:395,&quot;column&quot;:13}}">
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-254741f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-254741f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:396,&quot;column&quot;:15}}">帮助中心</div>
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-284746a9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-284746a9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:397,&quot;column&quot;:15}}">使用教程</div>
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-27474516" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-27474516&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:398,&quot;column&quot;:15}}">联系我们</div>
            </div>
          </div>
          <div data-qoder-id="qel-div-da45919a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-da45919a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:401,&quot;column&quot;:11}}">
            <h4 className="text-sm font-semibold mb-3" data-qoder-id="qel-text-sm-4f88c2d7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-4f88c2d7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:402,&quot;column&quot;:13}}">关于</h4>
            <div className="space-y-2" data-qoder-id="qel-space-y-2-63c40ff5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-space-y-2-63c40ff5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;space-y-2&quot;,&quot;loc&quot;:{&quot;line&quot;:403,&quot;column&quot;:13}}">
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-2135f283" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2135f283&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:404,&quot;column&quot;:15}}">关于我们</div>
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-2235f416" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2235f416&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:405,&quot;column&quot;:15}}">隐私政策</div>
              <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-qoder-id="qel-text-sm-2335f5a9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-sm-2335f5a9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;text-sm&quot;,&quot;loc&quot;:{&quot;line&quot;:406,&quot;column&quot;:15}}">服务条款</div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground" data-qoder-id="qel-mt-10-0d08ff27" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-10-0d08ff27&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;Footer&quot;,&quot;elementRole&quot;:&quot;mt-10&quot;,&quot;loc&quot;:{&quot;line&quot;:410,&quot;column&quot;:9}}">
          © 2026 电箱通. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage(qoderProps) {
  return (
    <div className={["min-h-screen bg-white", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <Navbar  data-qoder-id="qel-navbar-67ee704a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-navbar-67ee704a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;navbar&quot;,&quot;loc&quot;:{&quot;line&quot;:421,&quot;column&quot;:7}}"/>
      <main data-component="landing-main" data-qoder-id="qel-landing-main-edb16ce1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-landing-main-edb16ce1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;landing-main&quot;,&quot;loc&quot;:{&quot;line&quot;:422,&quot;column&quot;:7}}">
      <HeroSection  data-qoder-id="qel-herosection-9307c41d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-herosection-9307c41d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;herosection&quot;,&quot;loc&quot;:{&quot;line&quot;:422,&quot;column&quot;:7}}"/>
      <FeaturesSection  data-qoder-id="qel-featuressection-5e438698" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-featuressection-5e438698&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;featuressection&quot;,&quot;loc&quot;:{&quot;line&quot;:423,&quot;column&quot;:7}}"/>
      <UsersSection  data-qoder-id="qel-userssection-0acd6999" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-userssection-0acd6999&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;userssection&quot;,&quot;loc&quot;:{&quot;line&quot;:424,&quot;column&quot;:7}}"/>
      <WorkflowSection  data-qoder-id="qel-workflowsection-8de4c1f1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-workflowsection-8de4c1f1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;workflowsection&quot;,&quot;loc&quot;:{&quot;line&quot;:425,&quot;column&quot;:7}}"/>
      <CTASection  data-qoder-id="qel-ctasection-931aa11c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-ctasection-931aa11c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;ctasection&quot;,&quot;loc&quot;:{&quot;line&quot;:426,&quot;column&quot;:7}}"/>
      </main>
      <Footer  data-qoder-id="qel-footer-81df5401" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-footer-81df5401&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/LandingPage.jsx&quot;,&quot;componentName&quot;:&quot;LandingPage&quot;,&quot;elementRole&quot;:&quot;footer&quot;,&quot;loc&quot;:{&quot;line&quot;:427,&quot;column&quot;:7}}"/>
    </div>
  )
}
