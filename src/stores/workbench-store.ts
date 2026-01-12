import { create } from 'zustand';

export interface DetectedIcon {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  svgData?: string;
  imageData?: string;
  label?: string; // 图标标签
}

// 边界框历史记录类型
export type BoxHistory = DetectedIcon[];

export interface WorkbenchState {
  // Upload state
  uploadedImage: string | null;
  imageFile: File | null;
  imageInfo: {
    width: number;
    height: number;
    name: string;
  } | null;

  // Processing state
  status: 'idle' | 'uploading' | 'detecting' | 'processing' | 'ready';
  detectedIcons: DetectedIcon[];

  // View state
  viewMode: 'original' | 'grid';

  // Settings
  vectorizationPreset: 'balanced' | 'clean' | 'precise';
  gridSize: { rows: number; cols: number };

  // Bounding Box Editing
  selectedBoxId: string | null; // 当前选中的边界框ID
  boxHistory: {
    past: BoxHistory[];
    future: BoxHistory[];
  }; // 撤销/重做历史

  // Actions
  setUploadedImage: (image: string | null, file: File | null, info: { width: number; height: number; name: string } | null) => void;
  setStatus: (status: WorkbenchState['status']) => void;
  setDetectedIcons: (icons: DetectedIcon[]) => void;
  toggleIconSelection: (id: string) => void;
  selectAllIcons: () => void;
  deselectAllIcons: () => void;
  setViewMode: (mode: 'original' | 'grid') => void;
  setVectorizationPreset: (preset: 'balanced' | 'clean' | 'precise') => void;
  setGridSize: (rows: number, cols: number) => void;
  reset: () => void;

  // Bounding Box Actions
  selectBox: (id: string | null) => void;
  updateBox: (id: string, changes: Partial<Pick<DetectedIcon, 'x' | 'y' | 'width' | 'height'>>) => void;
  deleteBox: (id: string) => void;
  setBoxLabel: (id: string, label: string) => void;
  undo: () => void;
  redo: () => void;
  saveBoxHistory: () => void; // 保存当前状态到历史
}

const initialState = {
  uploadedImage: null,
  imageFile: null,
  imageInfo: null,
  status: 'idle' as const,
  detectedIcons: [],
  viewMode: 'original' as const,
  vectorizationPreset: 'balanced' as const,
  gridSize: { rows: 4, cols: 4 },
  selectedBoxId: null as string | null,
  boxHistory: {
    past: [] as BoxHistory[],
    future: [] as BoxHistory[],
  },
};

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  ...initialState,
  
  setUploadedImage: (image, file, info) => set({ 
    uploadedImage: image, 
    imageFile: file, 
    imageInfo: info,
    status: image ? 'detecting' : 'idle'
  }),
  
  setStatus: (status) => set({ status }),
  
  setDetectedIcons: (icons) => set({ detectedIcons: icons }),
  
  toggleIconSelection: (id) => set((state) => ({
    detectedIcons: state.detectedIcons.map((icon) =>
      icon.id === id ? { ...icon, selected: !icon.selected } : icon
    ),
  })),
  
  selectAllIcons: () => set((state) => ({
    detectedIcons: state.detectedIcons.map((icon) => ({ ...icon, selected: true })),
  })),
  
  deselectAllIcons: () => set((state) => ({
    detectedIcons: state.detectedIcons.map((icon) => ({ ...icon, selected: false })),
  })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setVectorizationPreset: (preset) => set({ vectorizationPreset: preset }),
  
  setGridSize: (rows, cols) => set({ gridSize: { rows, cols } }),
  
  reset: () => set(initialState),

  // Bounding Box Actions
  selectBox: (id) => set({ selectedBoxId: id }),

  updateBox: (id, changes) => set((state) => ({
    detectedIcons: state.detectedIcons.map((icon) =>
      icon.id === id ? { ...icon, ...changes } : icon
    ),
  })),

  deleteBox: (id) => set((state) => ({
    detectedIcons: state.detectedIcons.filter((icon) => icon.id !== id),
    selectedBoxId: state.selectedBoxId === id ? null : state.selectedBoxId,
  })),

  setBoxLabel: (id, label) => set((state) => ({
    detectedIcons: state.detectedIcons.map((icon) =>
      icon.id === id ? { ...icon, label } : icon
    ),
  })),

  saveBoxHistory: () => set((state) => {
    // 只保留最近5步历史
    const past = [...state.boxHistory.past, [...state.detectedIcons]];
    const limitedPast = past.slice(-5);

    return {
      boxHistory: {
        past: limitedPast,
        future: [], // 清空 redo 历史
      },
    };
  }),

  undo: () => set((state) => {
    const { past, future } = state.boxHistory;

    if (past.length === 0) return state;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    return {
      detectedIcons: previous,
      boxHistory: {
        past: newPast,
        future: [...state.boxHistory.future, [...state.detectedIcons]],
      },
    };
  }),

  redo: () => set((state) => {
    const { past, future } = state.boxHistory;

    if (future.length === 0) return state;

    const next = future[future.length - 1];
    const newFuture = future.slice(0, future.length - 1);

    return {
      detectedIcons: next,
      boxHistory: {
        past: [...state.boxHistory.past, [...state.detectedIcons]],
        future: newFuture,
      },
    };
  }),
}));
