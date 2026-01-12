import { Shield, Loader2 } from 'lucide-react';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';

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
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <div className={cn(
              'w-2 h-2 rounded-full',
              getStatusColor()
            )} />
          )}
          <span className="text-muted-foreground">{getStatusText()}</span>
          {isProcessing && processingProgress > 0 && (
            <span className="text-primary font-medium">
              {processingProgress}%
            </span>
          )}
        </div>

        {/* 进度条 */}
        {isProcessing && (
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Progress value={processingProgress} className="h-1.5" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {processingProgress}%
            </span>
          </div>
        )}

        {boundingBoxes.length > 0 && !isProcessing && (
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
