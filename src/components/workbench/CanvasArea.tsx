import { useEffect, useCallback } from 'react';
import { Upload, Grid, Image as ImageIcon, Layers } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { BoundingBoxEditor } from './BoundingBoxEditor';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { detectIconsInImage } from '@/lib/icon-processor';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

export function CanvasArea() {
  const {
    originalImage,
    imageInfo,
    boundingBoxes,
    selectedBox,
    gridRows,
    gridCols,
    isProcessing,
    processingStage,
    setBoundingBoxes,
    selectBox,
    updateBox,
    deleteBox,
    undo,
    redo,
    saveBoxHistory,
    setProcessing,
  } = useWorkbenchStore();
  const { t } = useTranslation();

  // 处理撤销/重做快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const processImage = useCallback(async () => {
    if (!originalImage || !imageInfo) return;

    setProcessing(true, 'detecting', 0);

    try {
      const boxes = await detectIconsInImage(originalImage, gridRows, gridCols);
      setBoundingBoxes(boxes);
      setProcessing(false, 'detecting', 100);
    } catch (error) {
      console.error('Failed to process image:', error);
      setProcessing(false, 'detecting', 0);
    }
  }, [originalImage, gridRows, gridCols, imageInfo, setBoundingBoxes, setProcessing]);

  // Process image when uploaded
  useEffect(() => {
    if (originalImage && imageInfo && boundingBoxes.length === 0) {
      processImage();
    }
  }, [originalImage, imageInfo, boundingBoxes.length, processImage]);

  // Empty state
  if (!originalImage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-canvas p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-headline-sm text-foreground mb-2">
              {t('canvasArea.dropYourImage')}
            </h2>
            <p className="text-body-lg text-muted-foreground">
              {t('canvasArea.uploadToStart')}
            </p>
          </div>
          <UploadZone />
        </div>

        {/* Grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 animate-pulse">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <p className="text-body-lg text-foreground">
            {processingStage === 'detecting' ? t('canvasArea.detectingIcons') : t('canvasArea.processing')}
          </p>
        </div>
      </div>
    );
  }

  // Ready state with results
  return (
    <div className="flex-1 flex flex-col bg-canvas overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="text-body-sm text-muted-foreground">
          {boundingBoxes.length} {t('canvasArea.iconsDetected')}
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-auto p-6">
        <OriginalView
          originalImage={originalImage}
          boundingBoxes={boundingBoxes}
          selectedBox={selectedBox}
          imageInfo={imageInfo}
          onBoxSelect={selectBox}
          onBoxUpdate={updateBox}
          onBoxDelete={deleteBox}
          onSaveHistory={saveBoxHistory}
        />
      </div>
    </div>
  );
}

interface OriginalViewProps {
  originalImage: string;
  boundingBoxes: import('@/stores/workbench-store').BoundingBox[];
  selectedBox: string | null;
  imageInfo: { width: number; height: number } | null;
  onBoxSelect: (id: string | null) => void;
  onBoxUpdate: (id: string, changes: Partial<Pick<import('@/stores/workbench-store').BoundingBox, 'x' | 'y' | 'width' | 'height'>>) => void;
  onBoxDelete: (id: string) => void;
  onSaveHistory: () => void;
}

function OriginalView({
  originalImage,
  boundingBoxes,
  selectedBox,
  imageInfo,
  onBoxSelect,
  onBoxUpdate,
  onBoxDelete,
  onSaveHistory,
}: OriginalViewProps) {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="relative inline-block rounded-lg overflow-hidden shadow-soft-lg bg-background">
        <img
          src={originalImage}
          alt="Original matrix"
          className="max-w-full max-h-[calc(100vh-280px)] object-contain"
        />

        {/* Bounding Box Editor */}
        {imageInfo && (
          <BoundingBoxEditor
            imageWidth={imageInfo.width}
            imageHeight={imageInfo.height}
            boundingBoxes={boundingBoxes}
            selectedBox={selectedBox}
            onBoxSelect={onBoxSelect}
            onBoxUpdate={onBoxUpdate}
            onBoxDelete={onBoxDelete}
            onSaveHistory={onSaveHistory}
          />
        )}
      </div>
    </div>
  );
}
