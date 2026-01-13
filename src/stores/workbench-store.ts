import { create } from 'zustand';

// 边界框接口
export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: string;
}

// 矢量化结果接口
export interface VectorizationResult {
  svg: string;
  pathCount: number;
  fileSize: number;
  warnings: string[];
}

export interface WorkbenchState {
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
  vTracerPresetName: string; // VTracer 预设名称：minimal | balanced | detailed | ultra

  // 图标标签
  iconLabels: Map<string, string>;

  // 网格检测结果
  detectedGrid: { rows: number; cols: number; confidence: number } | null;
  showGridSuggestion: boolean;

  // UI状态
  status: 'idle' | 'uploading' | 'detecting' | 'processing' | 'ready';
  isProcessing: boolean;
  isScanning: boolean; // 扫描动画状态
  processingProgress: number;
  processingStage: 'detecting' | 'vectorizing' | 'exporting'; // 分步进度显示

  // Actions
  setOriginalImage: (image: string | null, info: { width: number; height: number } | null) => void;
  setGridSize: (rows: number, cols: number) => void;
  setBoundingBoxes: (boxes: BoundingBox[]) => void;

  // 边界框操作
  selectBox: (id: string | null) => void;
  updateBox: (id: string, changes: Partial<Pick<BoundingBox, 'x' | 'y' | 'width' | 'height'>>) => void;
  deleteBox: (id: string) => void;
  saveBoxHistory: () => void;
  undo: () => void;
  redo: () => void;

  // 矢量化操作
  vectorizeIcon: (id: string, result: VectorizationResult) => void;
  setVectorizedIcons: (icons: Map<string, VectorizationResult>) => void;
  setVTracerPresetName: (presetName: string) => void; // 设置 VTracer 预设
  setStatus: (status: WorkbenchState['status']) => void;

  // 标签操作
  setIconLabel: (id: string, label: string) => void;
  removeIconLabel: (id: string) => void;

  // 网格检测
  setDetectedGrid: (grid: { rows: number; cols: number; confidence: number } | null) => void;
  setShowGridSuggestion: (show: boolean) => void;

  // 处理状态
  setProcessing: (isProcessing: boolean, stage: WorkbenchState['processingStage'], progress: number) => void;
  setScanning: (isScanning: boolean) => void;

  // 重置
  reset: () => void;
}

const initialState = {
  originalImage: null as string | null,
  imageInfo: null as { width: number; height: number } | null,
  gridRows: 4,
  gridCols: 4,
  boundingBoxes: [] as BoundingBox[],
  selectedBox: null as string | null,
  boxHistory: [] as BoundingBox[][],
  vectorizedIcons: new Map<string, VectorizationResult>(),
  vTracerPresetName: 'detailed', // 默认使用 detailed 模式
  iconLabels: new Map<string, string>(),
  detectedGrid: null as { rows: number; cols: number; confidence: number } | null,
  showGridSuggestion: false,
  status: 'idle' as const,
  isProcessing: false,
  isScanning: false,
  processingProgress: 0,
  processingStage: 'detecting' as const,
};

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  ...initialState,

  setOriginalImage: (image, info) => set({
    originalImage: image,
    imageInfo: info,
  }),

  setGridSize: (rows, cols) => set({ gridRows: rows, gridCols: cols }),

  setBoundingBoxes: (boxes) => set({ boundingBoxes: boxes }),

  // 边界框操作
  selectBox: (id) => set({ selectedBox: id }),

  updateBox: (id, changes) => set((state) => ({
    boundingBoxes: state.boundingBoxes.map((box) =>
      box.id === id ? { ...box, ...changes } : box
    ),
  })),

  deleteBox: (id) => set((state) => ({
    boundingBoxes: state.boundingBoxes.filter((box) => box.id !== id),
    selectedBox: state.selectedBox === id ? null : state.selectedBox,
  })),

  saveBoxHistory: () => set((state) => {
    // 只保留最近5步历史
    const history = [...state.boxHistory, [...state.boundingBoxes]];
    const limitedHistory = history.slice(-5);

    return {
      boxHistory: limitedHistory,
    };
  }),

  undo: () => set((state) => {
    if (state.boxHistory.length === 0) return state;

    const previous = state.boxHistory[state.boxHistory.length - 1];
    const newHistory = state.boxHistory.slice(0, state.boxHistory.length - 1);

    return {
      boundingBoxes: previous,
      boxHistory: newHistory,
    };
  }),

  redo: () => set((state) => {
    // Redo 需要额外的 future 栈来保存
    // 这里简化实现，如果需要完整功能可以扩展
    return state;
  }),

  // 矢量化操作
  vectorizeIcon: (id, result) => set((state) => {
    const newMap = new Map(state.vectorizedIcons);
    newMap.set(id, result);
    return { vectorizedIcons: newMap };
  }),

  setVectorizedIcons: (icons) => set({ vectorizedIcons: icons }),

  setVTracerPresetName: (presetName) => set({
    vTracerPresetName: presetName,
  }),

  setStatus: (status) => set({ status }),

  // 标签操作
  setIconLabel: (id, label) => set((state) => {
    const newMap = new Map(state.iconLabels);
    newMap.set(id, label);
    return { iconLabels: newMap };
  }),

  removeIconLabel: (id) => set((state) => {
    const newMap = new Map(state.iconLabels);
    newMap.delete(id);
    return { iconLabels: newMap };
  }),

  // 网格检测
  setDetectedGrid: (grid) => set({ detectedGrid: grid }),
  setShowGridSuggestion: (show) => set({ showGridSuggestion: show }),

  // 处理状态
  setProcessing: (isProcessing, stage, progress) => set({
    isProcessing,
    processingStage: stage,
    processingProgress: progress,
  }),

  setScanning: (isScanning) => set({ isScanning }),

  // 重置
  reset: () => set(initialState),
}));
