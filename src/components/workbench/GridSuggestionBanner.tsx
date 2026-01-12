import { AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { cn } from '@/lib/utils';

export function GridSuggestionBanner() {
  const { detectedGrid, showGridSuggestion, setShowGridSuggestion } = useWorkbenchStore();

  if (!showGridSuggestion || !detectedGrid) {
    return null;
  }

  const confidencePercent = Math.round(detectedGrid.confidence * 100);
  const confidenceColor = confidencePercent >= 80 ? 'text-green-600' : 'text-yellow-600';

  return (
    <div className="mx-6 mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <AlertCircle className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-foreground mb-1">
          检测到 <span className="font-semibold text-primary">{detectedGrid.rows}×{detectedGrid.cols}</span> 的图标网格
          <span className={cn('ml-2', confidenceColor)}>
            ({confidencePercent}% 置信度)
          </span>
        </p>
        <p className="text-body-sm text-muted-foreground">
          已自动应用检测到的网格布局。您可以在右侧属性面板中手动调整。
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 h-8 w-8"
        onClick={() => setShowGridSuggestion(false)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
