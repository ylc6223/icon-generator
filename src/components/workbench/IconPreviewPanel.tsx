import { useState, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, FileImage, FileCode, AlertCircle } from 'lucide-react';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

type ZoomLevel = 1 | 2 | 4 | 8;

/**
 * 图标预览面板
 * 显示原图和SVG的对比，支持缩放和查看文件信息
 */
export function IconPreviewPanel() {
  const { t } = useTranslation();
  const { selectedBox, boundingBoxes, vectorizedIcons, iconLabels } = useWorkbenchStore();
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [svgLoaded, setSvgLoaded] = useState(false);

  // 获取当前选中的图标
  const selectedBoundingBox = useMemo(
    () => boundingBoxes.find(box => box.id === selectedBox),
    [boundingBoxes, selectedBox]
  );

  // 获取当前选中的矢量化结果
  const vectorizationResult = useMemo(
    () => (selectedBox ? vectorizedIcons.get(selectedBox) : undefined),
    [selectedBox, vectorizedIcons]
  );

  // 获取当前标签
  const label = useMemo(
    () => (selectedBox ? iconLabels.get(selectedBox) : undefined),
    [selectedBox, iconLabels]
  );

  // 当选中图标改变时，重置缩放和加载状态
  useEffect(() => {
    setZoom(1);
    setSvgLoaded(false);
  }, [selectedBox]);

  // 懒加载 SVG
  useEffect(() => {
    if (vectorizationResult?.svg && !svgLoaded) {
      // 延迟加载 SVG，避免阻塞渲染
      const timer = setTimeout(() => {
        setSvgLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [vectorizationResult?.svg, svgLoaded]);

  // 缩放级别选项
  const zoomLevels: ZoomLevel[] = [1, 2, 4, 8];

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 如果没有选中图标，显示提示
  if (!selectedBoundingBox) {
    return (
      <div className="space-y-4">
        <div className="text-center p-8 border border-dashed border-border rounded-lg">
          <FileImage className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-body-sm text-muted-foreground">
            {t('previewPanel.selectToPreview')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 图标信息头部 */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-medium text-foreground truncate">
            {label || selectedBoundingBox.id}
          </p>
          <p className="text-body-sm text-muted-foreground">
            {selectedBoundingBox.width} × {selectedBoundingBox.height}px
          </p>
        </div>
        {/* 新增：选中状态指示 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {selectedBoundingBox.selected ? '已选中' : '未选中'}
          </span>
          <div className={cn(
            "w-3 h-3 rounded-full",
            selectedBoundingBox.selected ? "bg-primary" : "bg-muted"
          )} />
        </div>
      </div>

      {/* 缩放控制 */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const currentIndex = zoomLevels.indexOf(zoom);
            if (currentIndex > 0) {
              setZoom(zoomLevels[currentIndex - 1]);
            }
          }}
          disabled={zoom === 1}
          className="h-7 px-2"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>

        <div className="flex items-center gap-1">
          {zoomLevels.map((level) => (
            <button
              key={level}
              onClick={() => setZoom(level)}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                zoom === level
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
              )}
            >
              {level}x
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const currentIndex = zoomLevels.indexOf(zoom);
            if (currentIndex < zoomLevels.length - 1) {
              setZoom(zoomLevels[currentIndex + 1]);
            }
          }}
          disabled={zoom === 8}
          className="h-7 px-2"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* 对比视图 */}
      <ScrollArea className="h-[400px] border border-border rounded-lg">
        <div className="p-4 space-y-4">
          {/* 原图 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <FileImage className="w-3.5 h-3.5" />
              <span className="font-medium">{t('previewPanel.originalImage')}</span>
            </div>
            <div
              className={cn(
                'flex items-center justify-center bg-surface-subtle rounded-lg overflow-hidden',
                zoom > 1 && 'overflow-auto'
              )}
              style={{
                height: zoom > 1 ? `${150 * zoom}px` : '150px',
              }}
            >
              <img
                src={selectedBoundingBox.imageData}
                alt={t('previewPanel.originalImage')}
                className={cn(
                  'object-contain transition-transform',
                  zoom > 1 && 'scale-[0.5]'
                )}
                style={{
                  transform: zoom > 1 ? `scale(${zoom * 0.5})` : undefined,
                }}
              />
            </div>
          </div>

          {/* SVG 预览 */}
          {vectorizationResult?.svg && svgLoaded ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <FileCode className="w-3.5 h-3.5" />
                <span className="font-medium">{t('previewPanel.vectorized')}</span>
              </div>
              <div
                className={cn(
                  'flex items-center justify-center bg-surface-subtle rounded-lg overflow-hidden',
                  zoom > 1 && 'overflow-auto'
                )}
                style={{
                  height: zoom > 1 ? `${150 * zoom}px` : '150px',
                }}
              >
                <div
                  className={cn(
                    'transition-transform',
                    zoom > 1 && 'scale-[0.5]'
                  )}
                  style={{
                    transform: zoom > 1 ? `scale(${zoom * 0.5})` : undefined,
                  }}
                  dangerouslySetInnerHTML={{ __html: vectorizationResult.svg }}
                />
              </div>

              {/* 文件信息 */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-surface rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t('previewPanel.fileSize')}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatFileSize(vectorizationResult.fileSize)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t('previewPanel.pathCount')}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {vectorizationResult.pathCount}
                  </p>
                </div>
              </div>

              {/* 质量警告 */}
              {vectorizationResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                        {t('previewPanel.qualityWarnings')}
                      </p>
                      <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
                        {vectorizationResult.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : vectorizationResult?.svg && !svgLoaded ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <FileCode className="w-3.5 h-3.5" />
                <span className="font-medium">{t('previewPanel.vectorized')}</span>
              </div>
              <div className="flex items-center justify-center h-[150px] bg-surface-subtle rounded-lg">
                <div className="text-center space-y-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="text-xs text-muted-foreground">
                    {t('previewPanel.loadingSvg')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <FileCode className="w-3.5 h-3.5" />
                <span className="font-medium">{t('previewPanel.vectorized')}</span>
              </div>
              <div className="flex items-center justify-center h-[150px] bg-surface-subtle rounded-lg">
                <p className="text-body-sm text-muted-foreground text-center px-4">
                  {t('previewPanel.notVectorized')}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
