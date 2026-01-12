# 技术规范文档
## Icon Extractor - 技术实现规范

**版本:** 1.0
**日期:** 2025-01-12
**状态:** 设计阶段

---

## 1. 技术栈概览

### 1.1 前端框架
- **框架:** React 19 + TypeScript
- **构建工具:** Vite
- **包管理:** pnpm
- **状态管理:** Zustand
- **路由:** React Router v7

### 1.2 UI组件库
- **基础:** shadcn/ui (Radix UI + Tailwind CSS v4)
- **样式:** Tailwind CSS v4
- **主题:** next-themes (支持明暗模式切换)
- **动画:** motion/react

### 1.3 核心算法
- **矢量化:** VTracer (WebAssembly) - 支持彩色矢量化
- **图像处理:** Canvas API + Web Workers (4个并发)
- **ZIP生成:** JSZip
- **图片存储:** Canvas引用（按需提取数据）

### 1.4 开发工具
- **代码规范:** ESLint + TypeScript ESLint
- **格式化:** Prettier
- **类型检查:** TypeScript strict mode
- **测试:** Vitest + React Testing Library
- **测试范围:** 仅核心算法（矢量化、网格检测、质量检测）

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                    UI层 (React)                  │
├─────────────────────────────────────────────────┤
│                  状态层 (Zustand)                 │
├─────────────────────────────────────────────────┤
│              业务逻辑层 (Hooks/Services)          │
├─────────────────────────────────────────────────┤
│        核心算法层 (WebAssembly + Web Workers)     │
└─────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
src/
├── components/          # UI组件
│   ├── workbench/      # 工作台组件
│   │   ├── TopBar.tsx
│   │   ├── CanvasArea.tsx
│   │   ├── BoundingBoxEditor.tsx
│   │   ├── IconList.tsx
│   │   ├── PreviewPanel.tsx
│   │   └── ExportPanel.tsx
│   └── ui/             # shadcn/ui组件
├── lib/                # 核心库
│   ├── vectorization/  # 矢量化模块
│   │   ├── potrace.wasm.ts  # WebAssembly接口
│   │   ├── presets.ts       # 矢量化预设
│   │   └── quality.ts       # 质量检测
│   ├── image/           # 图像处理
│   │   ├── grid-detector.ts  # 网格检测
│   │   ├── cropper.ts        # 裁剪工具
│   │   └── processor.ts      # 图像处理器
│   ├── export/          # 导出模块
│   │   └── zipper.ts        # ZIP生成器
│   └── utils.ts         # 工具函数
├── hooks/              # 自定义Hooks
│   ├── useImageUpload.ts
│   ├── useBoundingBox.ts
│   ├── useVectorization.ts
│   └── useQualityCheck.ts
├── stores/             # Zustand状态管理
│   └── workbench-store.ts
├── types/              # TypeScript类型
│   └── index.ts
└── App.tsx
```

---

## 3. 核心模块设计

### 3.1 网格检测模块

**文件:** `src/lib/image/grid-detector.ts`

**职责:**
- 根据用户输入的行列数切分图片
- 计算每个边界框的坐标
- 支持手动调整边界

**接口:**
```typescript
interface GridDetectorOptions {
  rows: number;
  cols: number;
  padding?: number;
}

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: string;
}

class GridDetector {
  detect(imageData: string, options: GridDetectorOptions): Promise<BoundingBox[]>
  adjustBox(box: BoundingBox, adjustments: Partial<BoundingBox>): BoundingBox
  cropImage(box: BoundingBox): string
}
```

**实现要点:**
- 使用Canvas API切分图片
- 每个图标转换为base64存储
- 支持撤销/重做（保存历史记录）

### 3.2 矢量化模块

**文件:** `src/lib/vectorization/vtracer.wasm.ts`

**职责:**
- 使用VTracer算法将位图转换为SVG路径（支持彩色）
- 支持不同质量预设
- WebWorker中运行避免阻塞UI

**接口:**
```typescript
interface VectorizationPreset {
  name: 'clean' | 'balanced' | 'detailed';
  colorCount: number;
  minArea: number;
  strokeWidth: number;
}

interface VectorizationResult {
  svg: string;
  pathCount: number;
  fileSize: number;
  warnings: string[];
}

class Vectorizer {
  vectorize(imageData: string, preset: VectorizationPreset): Promise<VectorizationResult>
  batchVectorize(images: string[], preset: VectorizationPreset): Promise<VectorizationResult[]>
  checkQuality(result: VectorizationResult): string[]
}
```

**实现要点:**
- 使用VTracer编译的WebAssembly模块
- 在WebWorker中运行以避免阻塞主线程
- **固定4个并发WebWorker**（平衡性能和资源占用）
- 实现进度回调
- 支持彩色矢量化（AI图标通常是彩色的）

**WebAssembly集成:**
```typescript
// vtracer.wasm.ts
import vtracer from './vtracer.wasm';

export async function initVTracer() {
  await WebAssembly.instantiate(vtracer);
}

export function traceBitmap(bitmap: ImageData, options: VTracerOptions): string {
  // 调用VTracer WebAssembly函数
  return vtracer.trace(bitmap, options);
}
```

### 3.3 质量检测模块

**文件:** `src/lib/vectorization/quality.ts`

**职责:**
- 检测矢量化结果的质量问题
- 生成警告信息

**检测规则（宽松标准 - 适合AI图标）:**
1. **路径复杂度:** 路径节点数 > 500
2. **文件大小:** SVG > 50KB（可能过大）
3. **颜色数量:** > 10种颜色（可能需要优化）
4. **路径数量:** 只有1条路径时警告

**阈值选择理由:**
- AI生成的图标通常细节丰富，需要宽松标准避免误报
- 500个节点对于复杂图标是合理的
- 50KB对于彩色SVG是可接受的大小

**实现:**
```typescript
interface QualityIssue {
  severity: 'warning' | 'error';
  message: string;
  suggestion: string;
}

class QualityChecker {
  check(svg: string, imageSize: number): QualityIssue[]
  calculateComplexity(svg: string): number
  estimateFilesize(svg: string): number
}
```

### 3.4 边界编辑器

**文件:** `src/components/workbench/BoundingBoxEditor.tsx`

**功能:**
- 在Canvas上绘制所有边界框
- 支持拖拽调整大小和位置
- 显示选中状态的视觉反馈

**实现要点:**
```typescript
interface BoundingBoxEditorProps {
  image: string;
  boxes: BoundingBox[];
  selectedBox: string | null;
  onBoxChange: (id: string, changes: Partial<BoundingBox>) => void;
  onBoxSelect: (id: string) => void;
}

// 使用Canvas API绘制
// 监听鼠标/触摸事件
// 计算拖拽偏移量
```

**交互逻辑:**
1. 点击选中边界框
2. 拖拽角落/边调整大小
3. 拖拽边界框内部移动位置
4. Delete键删除边界框
5. Esc键取消选择

### 3.5 预览面板

**文件:** `src/components/workbench/PreviewPanel.tsx`

**功能:**
- 并排显示原图和SVG
- 支持缩放查看
- 显示质量信息

**实现要点:**
```typescript
interface PreviewPanelProps {
  originalImage: string;
  svg: string;
  qualityIssues: QualityIssue[];
}

// 使用SplitPane组件分割视图
// CSS transform实现缩放
// 计算并显示SVG统计信息
```

---

## 4. 数据流设计

### 4.1 状态管理 (Zustand)

**文件:** `src/stores/workbench-store.ts`

**状态管理策略:**
- **不持久化:** 所有状态只在内存中，刷新页面后丢失
- **撤销范围:** 仅边界框历史（5步）
- **撤销实现:** 只保存边界框的历史记录，其他操作不支持撤销

```typescript
interface WorkbenchState {
  // 上传的图片
  originalImage: string | null; // Canvas引用，按需提取数据
  imageInfo: { width: number; height: number } | null;

  // 网格设置
  gridRows: number;
  gridCols: number;

  // 边界框
  boundingBoxes: BoundingBox[];
  selectedBox: string | null;
  boxHistory: BoundingBox[][]; // 撤销/重做，最多5步历史

  // 矢量化结果
  vectorizedIcons: Map<string, VectorizationResult>;
  selectedPreset: VectorizationPreset;

  // 图标标签
  iconLabels: Map<string, string>;

  // UI状态
  isProcessing: boolean;
  processingProgress: number;
  processingStage: 'detecting' | 'vectorizing' | 'exporting'; // 分步进度显示

  // Actions
  uploadImage: (image: string) => void;
  detectGrid: (rows: number, cols: number) => Promise<void>;
  updateBox: (id: string, changes: Partial<BoundingBox>) => void;
  selectBox: (id: string) => void;
  vectorizeAll: () => Promise<void>;
  setLabel: (id: string, label: string) => void;
  exportIcons: () => Promise<Blob>;
  undo: () => void; // 仅撤销边界框操作
  redo: () => void; // 仅重做边界框操作
}
```

### 4.2 数据流图

```
用户上传图片
    ↓
保存到 originalImage
    ↓
用户输入行列数
    ↓
GridDetector.detect()
    ↓
生成 boundingBoxes[]
    ↓
渲染到 CanvasEditor
    ↓
用户拖拽调整
    ↓
更新 boundingBoxes[]
    ↓
用户点击"矢量化"
    ↓
Vectorizer.vectorizeAll() (WebWorker)
    ↓
生成 vectorizedIcons (Map)
    ↓
质量检测 QualityChecker.check()
    ↓
显示警告（如有）
    ↓
用户输入标签
    ↓
保存到 iconLabels
    ↓
用户点击"导出"
    ↓
Zipper.generateZIP()
    ↓
下载文件
```

---

## 5. 性能优化策略

### 5.1 图像处理优化
- **懒加载:** 只在需要时才从Canvas引用读取图片数据
- **缩略图缓存:** 为每个图标生成缩略图缓存
- **WebWorker:** 所有计算密集型任务在Worker中运行
- **分块处理:** 超过100个图标时分批处理
- **Canvas优化:** MVP阶段不进行特殊优化，保持简单实现

### 5.2 渲染优化
- **虚拟滚动:** 图标列表使用虚拟滚动
- **React.memo:** 所有组件使用memo避免不必要的重渲染
- **useCallback/useMemo:** 缓存回调函数和计算结果

### 5.3 WebWorker池
**并发策略:** 固定4个Worker，平衡性能和资源占用

```typescript
class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{task: Task, resolve: Function}> = [];

  constructor() {
    // 固定创建4个Worker
    const WORKER_COUNT = 4;
    for (let i = 0; i < WORKER_COUNT; i++) {
      this.workers.push(new Worker('/workers/vectorizer.js'));
    }
  }

  async execute(task: Task): Promise<Result> {
    // 实现任务队列和Worker调度
    // 确保最多4个任务并发执行
  }
}
```

**并发数选择理由:**
- 4个Worker适合大多数设备（从2核到16核CPU）
- 避免低端设备（如4核CPU）因过多并发而卡顿
- 对于AI图标通常不超过64个，4个Worker已经足够快

---

## 6. 安全性考虑

### 6.1 输入验证
- 限制上传文件大小（最大10MB）
- 限制图片尺寸（最大4096x4096）
- 限制网格范围（2-16行/列）
- 验证文件类型：**PNG、JPG、WebP**（不支持BMP、GIF等）
- 标签验证：
  - 字符限制：1-50字符
  - 非法字符：不允许 / \ : * ? " < > |
  - 重复检查：不允许相同标签
  - 连续空格：自动压缩为单个空格

### 6.2 XSS防护
- **不进行SVG清理:** SVG是应用自生成的，不是用户输入，无XSS风险
- 不直接渲染用户输入的HTML
- 所有用户输入都进行适当的转义

### 6.3 内存管理
- 及时释放Image对象和Canvas
- 限制同时处理的图片数量
- 使用WeakMap存储临时数据

---

## 7. 浏览器兼容性

### 7.1 设备支持策略
**桌面优先:** 仅优化桌面体验（>=1024px宽度）
- 平板和手机显示提示："为了最佳体验，请在桌面设备上使用"
- 响应式断点：min-width: 1024px
- 避免移动端适配工作，聚焦桌面用户体验

**理由:**
- 图标编辑需要精确操作，不适合移动端
- 目标用户（设计师）主要使用桌面设备
- 减少开发和测试成本

### 7.2 特性检测
```typescript
// WebAssembly支持
const supportsWasm = () => WebAssembly !== undefined;

// WebWorker支持
const supportsWorker = () => typeof Worker !== 'undefined';

// Canvas API支持
const supportsCanvas = () => {
  const canvas = document.createElement('canvas');
  return canvas.getContext('2d') !== null;
};

export function checkBrowserSupport() {
  return {
    wasm: supportsWasm(),
    worker: supportsWorker(),
    canvas: supportsCanvas()
  };
}
```

### 7.2 优雅降级
- WebAssembly不支持时，使用JavaScript备用实现
- WebWorker不支持时，在主线程运行（显示loading提示）
- Canvas不支持时，显示错误消息

---

## 8. API设计

### 8.1 内部API

#### GridDetector
```typescript
class GridDetector {
  /**
   * 检测图片中的图标网格
   * @param imageData base64编码的图片
   * @param options 网格选项
   * @returns 检测到的边界框数组
   */
  detect(imageData: string, options: GridDetectorOptions): Promise<BoundingBox[]>

  /**
   * 调整边界框
   */
  adjustBox(box: BoundingBox, adjustments: Partial<BoundingBox>): BoundingBox
}
```

#### Vectorizer
```typescript
class Vectorizer {
  /**
   * 矢量化单个图标
   * @param imageData 图标的base64数据
   * @param preset 矢量化预设
   * @param onProgress 进度回调
   */
  vectorize(
    imageData: string,
    preset: VectorizationPreset,
    onProgress?: (progress: number) => void
  ): Promise<VectorizationResult>

  /**
   * 批量矢量化
   */
  batchVectorize(
    images: string[],
    preset: VectorizationPreset
  ): Promise<VectorizationResult[]>
}
```

#### QualityChecker
```typescript
class QualityChecker {
  /**
   * 检查SVG质量
   * @returns 质量问题数组，空数组表示无问题
   */
  check(svg: string): QualityIssue[]
}
```

---

## 9. 部署

### 9.1 构建配置
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'wasm': ['@/lib/vectorization/potrace'],
          'ui': ['@/components/ui']
        }
      }
    }
  }
});
```

### 9.2 静态托管
- 使用Vercel/Netlify等平台部署
- 配置SPA路由
- 启用CDN加速

---

## 10. 监控与日志

### 10.1 错误跟踪
- **不使用外部监控服务:** 不集成Sentry等工具，保护用户隐私
- 使用浏览器console输出错误信息
- 用户可自行查看控制台或反馈错误

### 10.2 性能监控
```typescript
// 使用Performance API记录性能指标（仅在开发环境）
if (import.meta.env.DEV) {
  performance.mark('vectorization-start');
  await vectorizer.vectorize(image);
  performance.mark('vectorization-end');
  performance.measure('vectorization', 'vectorization-start', 'vectorization-end');
}
```

### 10.3 使用统计
- **不收集用户数据:** 完全本地运行，不上传任何统计信息
- 隐私是核心价值

---

## 11. 未来扩展点

### 11.1 插件系统
- 支持自定义矢量化算法
- 支持自定义导出格式
- 支持自定义质量检测规则

### 11.2 云端同步（可选）
- 保存项目到云端
- 跨设备访问
- 协作功能

### 11.3 API服务（可选）
- RESTful API提供矢量化服务
- 批量处理API
- Webhook集成

---

**文档变更历史:**
- 2025-01-12: 初始版本创建
