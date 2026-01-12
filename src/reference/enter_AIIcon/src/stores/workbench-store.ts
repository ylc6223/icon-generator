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
}

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
}));
