# 电箱通 — 设计说明

## 产品定位

电箱通是一款 AI 驱动的配电箱图纸识别与管理工具，面向建筑工程行业的预算员、电气工程师、分包单位和配电箱厂家。核心能力是将 CAD 图纸（DWG/DXF）和 PDF 中的配电箱信息自动提取为结构化数据，替代人工梳理。

## 设计原则

**效率优先** — 从上传图纸到获取结构化数据，操作步骤控制在三步以内。
**专业可信** — 界面风格贴近工程行业工具习惯，信息密度高，操作路径短。
**图纸为本** — 图纸预览是核心交互，所有结构化数据都可追溯到原始图纸位置。

## 页面结构

### 落地页 (LandingPage) — 路由 `/`

面向新用户的营销页面，包含以下板块：

| 板块 | 功能 |
|------|------|
| Navbar | 固定顶部导航，品牌标识 + 锚点链接 + 登录/试用按钮 |
| HeroSection | 核心卖点展示：标题、描述、CTA 按钮、信任指标、产品界面预览 |
| FeaturesSection | 6 张功能卡片：智能识别、层级构建、元器件提取、数据导出、安全、效率 |
| UsersSection | 4 类目标用户画像：预算员、电气工程师、分包单位、厂家 |
| WorkflowSection | 4 步使用流程：上传 → 识别 → 生成 → 导出 |
| CTASection | 底部行动号召 |
| Footer | 产品链接、支持、关于 |

### 工作台 (DashboardPage) — 路由 `/dashboard`

产品核心工作界面，采用左侧边栏 + 右侧主内容区布局：

| 区域 | 内容 |
|------|------|
| 顶部栏 (56px) | 品牌标识、面包屑导航、操作按钮（返回、上传、通知、设置） |
| 侧边栏 (240px) | 新建项目按钮、项目列表、项目内文件列表 |
| 主内容区 | 根据状态切换：项目列表 / 上传区 / 处理进度 / 识别结果 |

识别结果视图采用三栏结构：配电箱树形列表 → 配电箱详情面板 → 图纸预览/文件查看器。

## 设计系统

### 种子令牌 (Seed Tokens)

所有视觉属性从以下 6 个种子令牌派生：

| 令牌 | 默认值 (Light) | 说明 |
|------|---------------|------|
| `--seed-bg` | `#ffffff` | 页面/卡片背景 |
| `--seed-fg` | `#0a0a0a` | 主要文字颜色 |
| `--seed-primary` | `#2563eb` | 品牌主色（按钮、链接、高亮） |
| `--seed-surface` | `#f1f5f9` | 次要表面（卡片底色、分割区域） |
| `--seed-radius` | `8px` | 基础圆角，各组件按比例缩放 |
| `--seed-font-size` | `16px` | 基础字号 |

### 派生令牌

```
颜色系统：
  --color-background      = --seed-bg
  --color-foreground      = --seed-fg
  --color-primary         = --seed-primary
  --color-secondary       = --seed-surface
  --color-muted           = --seed-surface
  --color-muted-foreground = #64748b
  --color-border          = #e2e8f0
  --color-destructive     = #ef4444
  --color-ring            = --seed-primary

圆角系统：
  --radius-sm  = --seed-radius × 0.5    (4px)
  --radius-md  = --seed-radius          (8px)
  --radius-lg  = --seed-radius × 1.5    (12px)
  --radius-xl  = --seed-radius × 2      (16px)

字体：
  --font-sans = Inter, SF Pro Display, system-ui, sans-serif
```

### 外观预设

| 预设 | --seed-bg | --seed-fg | --seed-primary | --seed-surface |
|------|-----------|-----------|----------------|----------------|
| Light | `#ffffff` | `#0a0a0a` | `#2563eb` | `#f1f5f9` |
| Dark | `#0a0a0a` | `#fafafa` | `#3b82f6` | `#1e293b` |
| Engineering Blue | `#f8fafc` | `#0f172a` | `#1d4ed8` | `#e2e8f0` |

## 组件库

### Button (`ui/button.jsx`)

基于 `class-variance-authority` 实现多变体：

| 变体 | 用途 |
|------|------|
| default | 主操作按钮，使用 `--color-primary` |
| destructive | 危险操作（删除），红色 |
| outline | 次要操作，带边框 |
| ghost | 最弱操作（工具栏图标） |
| link | 文字链接样式 |

尺寸：`default` (h-10)、`sm` (h-9)、`lg` (h-11)、`icon` (h-10 w-10)

### Card (`ui/card.jsx`)

容器组件，使用 `--color-card` 背景和 `--color-border` 边框。包含 CardHeader、CardTitle、CardDescription、CardContent、CardFooter 子组件。

### Badge (`ui/badge.jsx`)

标签组件，用于状态标记和分类标签。变体：default、secondary、destructive、outline。

## CAD 图纸查看器 (CADViewer)

### 渲染模式

| 模式 | 背景 | 线条颜色 | 文字颜色 | 适用场景 |
|------|------|---------|---------|---------|
| 彩色（默认） | `#1a1a1a` | AutoCAD ACI 亮色 | `#ffffff` | 模拟 CAD 模型空间 |
| 黑白 | `#ffffff` | `#1a1a1a` | `#1a1a1a` | 模拟 PDF 出图 |

### 图层颜色 (ACI 标准亮色)

白 `#ffffff`、黄 `#ffff00`、青 `#00ffff`、红 `#ff0000`、绿 `#00ff00`、品红 `#ff00ff`、皇家蓝 `#4169e1`、橙 `#ff8c00`、深青 `#00ced1`、黄绿 `#adff2f`、粉红 `#ff69b4`、天蓝 `#87ceeb`、金 `#ffd700`、梅 `#dda0dd`、淡绿 `#98fb98`

### 支持的实体类型

LINE、CIRCLE、ARC、ELLIPSE、LWPOLYLINE、POLYLINE、SPLINE、TEXT、MTEXT、ATTDEF、ATTRIB、INSERT、SOLID、3DFACE、DIMENSION

### 交互

- **缩放**：滚轮缩放（跟随光标位置），1.2x/次，范围 5%–500000%
- **平移**：鼠标拖拽
- **快捷键**：T 或空格 → 适应视图
- **工具栏**：黑白/彩色切换、放大、缩小、重置视图、缩放百分比显示

## 数据模型

### 配电箱层级

```
一级箱 → 二级箱 → 三级箱 → 控制箱
```

每级配电箱包含：ID、名称、类型、位置、规格参数、关联文件、子级配电箱列表。

### 文件类型支持

CAD 图纸（.dwg, .dxf）、PDF 文档、图片（.png, .jpg, .bmp, .tif）

## 技术栈

React 19 + Vite 8 + Tailwind CSS v4 + React Router 7 + Lucide React + class-variance-authority + dxf-parser + dwgdxf (WASM)
