import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { useTranslation } from 'react-i18next';

interface UploadZoneProps {
  compact?: boolean;
}

export function UploadZone({ compact = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { setOriginalImage, originalImage, imageInfo } = useWorkbenchStore();
  const { t } = useTranslation();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalImage(result, {
          width: img.width,
          height: img.height,
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [setOriginalImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFile(file);
      }
    };
    input.click();
  }, [handleFile]);

  // Show uploaded image preview in compact mode
  if (compact && originalImage) {
    return (
      <div className="space-y-3">
        <div
          className="relative rounded-lg border border-border-strong overflow-hidden cursor-pointer group"
          onClick={handleClick}
        >
          <img
            src={originalImage}
            alt={t('uploadZone.uploadedMatrix')}
            className="w-full h-auto max-h-40 object-contain bg-canvas"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-body-sm text-foreground bg-background/90 px-2 py-1 rounded transition-opacity">
              {t('uploadZone.replace')}
            </span>
          </div>
        </div>
        {imageInfo && (
          <div className="text-body-sm text-muted-foreground">
            {imageInfo.width} x {imageInfo.height}px
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-150 cursor-pointer',
        compact ? 'p-4 min-h-[120px]' : 'p-8 min-h-[200px]',
        isDragging
          ? 'border-primary bg-accent border-solid'
          : 'border-border bg-surface-subtle hover:border-border-strong hover:bg-muted/50'
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-full bg-muted mb-3',
        compact ? 'w-10 h-10' : 'w-12 h-12'
      )}>
        {isDragging ? (
          <ImageIcon className={cn('text-primary', compact ? 'w-5 h-5' : 'w-6 h-6')} />
        ) : (
          <Upload className={cn('text-muted-foreground', compact ? 'w-5 h-5' : 'w-6 h-6')} />
        )}
      </div>

      <p className={cn(
        'text-center',
        compact ? 'text-body-sm' : 'text-body-lg',
        isDragging ? 'text-primary' : 'text-muted-foreground'
      )}>
        {isDragging ? t('uploadZone.dropToUpload') : t('uploadZone.dropImageOrClick')}
      </p>

      {!compact && (
        <p className="text-body-sm text-muted-foreground mt-1">
          {t('uploadZone.supportedFormats')}
        </p>
      )}
    </div>
  );
}
