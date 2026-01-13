import { Sliders, Grid3x3 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { IconPreviewPanel } from './IconPreviewPanel';
import { Separator } from '@/components/ui/separator';
import { setVTracerPreset } from '@/lib/vectorization/vtracer.wasm';
import { getAvailablePresets } from '@/lib/vtracer-presets';

export function PropertiesPanel() {
  const {
    originalImage,
    vTracerPresetName,
    setVTracerPresetName,
    gridRows,
    gridCols,
    setGridSize,
    isProcessing,
  } = useWorkbenchStore();
  const { t } = useTranslation();

  // VTracer 预设列表
  const vTracerPresets = getAvailablePresets();

  // 处理 VTracer 预设切换
  const handleVTracerPresetChange = (presetName: string) => {
    setVTracerPresetName(presetName);
    setVTracerPreset(presetName);
  };

  if (!originalImage) {
    return (
      <aside className="w-right-panel h-full flex flex-col border-l border-border bg-background">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Sliders className="w-4 h-4 text-muted-foreground" />
          <span className="text-body-sm font-medium text-foreground">{t('propertiesPanel.title')}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-body-sm text-muted-foreground text-center">
            {t('propertiesPanel.uploadToSeeProperties')}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-right-panel h-full flex flex-col border-l border-border bg-background">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Sliders className="w-4 h-4 text-muted-foreground" />
        <span className="text-body-sm font-medium text-foreground">{t('propertiesPanel.title')}</span>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {/* 预览面板 */}
        <div className="p-4">
          <IconPreviewPanel />
        </div>

        <Separator />

        {/* 设置面板 */}
        <div className="p-4 space-y-6">
          {/* Grid Settings */}
          <div className="space-y-3">
            <Label className="text-body-sm text-muted-foreground flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              {t('propertiesPanel.gridLayout')}
            </Label>

            {/* 当前设置显示 */}
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">当前网格</span>
                <span className="text-headline-sm font-semibold text-primary">
                  {gridRows} × {gridCols}
                </span>
              </div>
              <div className="text-body-sm text-muted-foreground mt-1">
                共 {gridRows * gridCols} 个图标
              </div>
            </div>

            {/* 网格选择 */}
            <div className="space-y-2">
              <Select
                value={`${gridRows}x${gridCols}`}
                onValueChange={(value) => {
                  const [rows, cols] = value.split('x').map(Number);
                  setGridSize(rows, cols);
                }}
                disabled={isProcessing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择网格大小" />
                </SelectTrigger>
                <SelectContent>
                  {/* 快速选择（正方形） */}
                  {[2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <SelectItem key={size} value={`${size}x${size}`}>
                      {size} × {size}
                    </SelectItem>
                  ))}
                  {/* 自定义网格（非正方形） */}
                  <SelectItem value="2x3">2 × 3 (6 icons)</SelectItem>
                  <SelectItem value="2x4">2 × 4 (8 icons)</SelectItem>
                  <SelectItem value="3x4">3 × 4 (12 icons)</SelectItem>
                  <SelectItem value="4x5">4 × 5 (20 icons)</SelectItem>
                  <SelectItem value="4x6">4 × 6 (24 icons)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* VTracer 预设 */}
          <div className="space-y-3">
            <Label className="text-body-sm text-muted-foreground">
              矢量化质量
            </Label>
            <Select
              value={vTracerPresetName}
              onValueChange={handleVTracerPresetChange}
              disabled={isProcessing}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择质量级别" />
              </SelectTrigger>
              <SelectContent>
                {vTracerPresets.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name} textValue={preset.displayName}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{preset.displayName}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </aside>
  );
}
