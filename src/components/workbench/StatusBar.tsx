import { Shield } from 'lucide-react';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function StatusBar() {
  const {
    boundingBoxes,
    selectedBox,
    isProcessing,
    processingStage,
    processingProgress
  } = useWorkbenchStore();
  const { t } = useTranslation();

  // 根据处理状态显示状态文本
  const getStatusText = () => {
    if (isProcessing) {
      if (processingStage === 'detecting') return t('statusBar.detecting');
      if (processingStage === 'vectorizing') return t('statusBar.vectorizing');
      if (processingStage === 'exporting') return t('statusBar.exporting');
      return t('statusBar.processing');
    }
    if (boundingBoxes.length > 0) return t('statusBar.ready');
    return t('statusBar.idle');
  };

  // 获取状态指示器颜色
  const getStatusColor = () => {
    if (isProcessing) return 'bg-primary animate-pulse';
    if (boundingBoxes.length > 0) return 'bg-green-500';
    return 'bg-muted-foreground';
  };

  return (
    <footer className="h-statusbar flex items-center justify-between px-4 bg-background border-t border-border text-body-sm">
      {/* Left: Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            getStatusColor()
          )} />
          <span className="text-muted-foreground">{getStatusText()}</span>
          {isProcessing && processingProgress > 0 && (
            <span className="text-muted-foreground">
              ({processingProgress}%)
            </span>
          )}
        </div>

        {boundingBoxes.length > 0 && (
          <span className="text-muted-foreground">
            {selectedBox
              ? t('statusBar.oneSelected', { total: boundingBoxes.length })
              : t('statusBar.iconsDetected', { count: boundingBoxes.length })
            }
          </span>
        )}
      </div>

      {/* Right: Privacy notice */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>{t('statusBar.localProcessing')}</span>
      </div>
    </footer>
  );
}
