import { useEffect, useCallback, useState } from 'react';
import { Upload, Grid, Image as ImageIcon, Layers } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { IconPreviewCard } from './IconPreviewCard';
import { BoundingBoxEditor } from './BoundingBoxEditor';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { detectIconsInImage } from '@/lib/icon-processor';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

export function CanvasArea() {
  const {
    uploadedImage,
    status,
    detectedIcons,
    viewMode,
    gridSize,
    imageInfo,
    selectedBoxId,
    setStatus,
    setDetectedIcons,
    toggleIconSelection,
    setViewMode,
    selectBox,
    updateBox,
    deleteBox,
    undo,
    redo,
    saveBoxHistory,
  } = useWorkbenchStore();
  const { t } = useTranslation();

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

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
    if (!uploadedImage) return;

    setStatus('processing');

    try {
      const icons = await detectIconsInImage(uploadedImage, gridSize.rows, gridSize.cols);
      setDetectedIcons(icons);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to process image:', error);
      setStatus('idle');
    }
  }, [uploadedImage, gridSize, setStatus, setDetectedIcons]);

  // Process image when uploaded
  useEffect(() => {
    if (uploadedImage && status === 'detecting') {
      processImage();
    }
  }, [uploadedImage, status, processImage]);

  // Empty state
  if (!uploadedImage) {
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
  if (status === 'detecting' || status === 'processing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 animate-pulse">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <p className="text-body-lg text-foreground">
            {status === 'detecting' ? t('canvasArea.detectingIcons') : t('canvasArea.processing')}
          </p>
        </div>
      </div>
    );
  }

  // Ready state with results
  return (
    <div className="flex-1 flex flex-col bg-canvas overflow-hidden">
      {/* View Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'original' | 'grid')}>
          <TabsList className="h-8">
            <TabsTrigger value="original" className="text-body-sm gap-1.5 px-3 h-7">
              <ImageIcon className="w-3.5 h-3.5" />
              {t('canvasArea.originalView')}
            </TabsTrigger>
            <TabsTrigger value="grid" className="text-body-sm gap-1.5 px-3 h-7">
              <Grid className="w-3.5 h-3.5" />
              {t('canvasArea.gridView')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-body-sm text-muted-foreground">
          {detectedIcons.filter(i => i.selected).length} / {detectedIcons.length} {t('canvasArea.selected')}
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'original' ? (
          <OriginalView
            uploadedImage={uploadedImage}
            detectedIcons={detectedIcons}
            selectedBoxId={selectedBoxId}
            imageInfo={imageInfo}
            onToggleIcon={toggleIconSelection}
            onBoxSelect={selectBox}
            onBoxUpdate={updateBox}
            onBoxDelete={deleteBox}
          />
        ) : (
          <GridView
            detectedIcons={detectedIcons}
            onToggleIcon={toggleIconSelection}
          />
        )}
      </div>
    </div>
  );
}

interface OriginalViewProps {
  uploadedImage: string;
  detectedIcons: import('@/stores/workbench-store').DetectedIcon[];
  selectedBoxId: string | null;
  imageInfo: { width: number; height: number; name: string } | null;
  onToggleIcon: (id: string) => void;
  onBoxSelect: (id: string | null) => void;
  onBoxUpdate: (id: string, changes: Partial<Pick<import('@/stores/workbench-store').DetectedIcon, 'x' | 'y' | 'width' | 'height'>>) => void;
  onBoxDelete: (id: string) => void;
}

function OriginalView({
  uploadedImage,
  detectedIcons,
  selectedBoxId,
  imageInfo,
  onToggleIcon,
  onBoxSelect,
  onBoxUpdate,
  onBoxDelete,
}: OriginalViewProps) {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="relative inline-block rounded-lg overflow-hidden shadow-soft-lg bg-background">
        <img
          src={uploadedImage}
          alt="Original matrix"
          className="max-w-full max-h-[calc(100vh-280px)] object-contain"
        />

        {/* Bounding Box Editor */}
        {imageInfo && (
          <BoundingBoxEditor
            imageWidth={imageInfo.width}
            imageHeight={imageInfo.height}
            detectedIcons={detectedIcons}
            selectedBoxId={selectedBoxId}
            onBoxSelect={onBoxSelect}
            onBoxUpdate={onBoxUpdate}
            onBoxDelete={onBoxDelete}
            onSaveHistory={saveBoxHistory}
          />
        )}
      </div>
    </div>
  );
}

interface GridViewProps {
  detectedIcons: import('@/stores/workbench-store').DetectedIcon[];
  onToggleIcon: (id: string) => void;
}

function GridView({ detectedIcons, onToggleIcon }: GridViewProps) {
  return (
    <div className="grid gap-4" style={{
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {detectedIcons.map((icon, index) => (
        <IconPreviewCard
          key={icon.id}
          icon={icon}
          onToggle={onToggleIcon}
          index={index}
        />
      ))}
    </div>
  );
}
