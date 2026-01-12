import { Sliders } from 'lucide-react';
import { Label } from '@/components/ui/label';
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
            <Label className="text-body-sm text-muted-foreground">
              {t('propertiesPanel.gridLayout')}
            </Label>
            <Select
              value={`${gridRows}x${gridCols}`}
              onValueChange={(value) => {
                const [rows, cols] = value.split('x').map(Number);
                setGridSize(rows, cols);
              }}
              disabled={isProcessing}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('propertiesPanel.gridSize')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3x3">3 x 3 (9 icons)</SelectItem>
                <SelectItem value="4x4">4 x 4 (16 icons)</SelectItem>
                <SelectItem value="5x5">5 x 5 (25 icons)</SelectItem>
                <SelectItem value="6x6">6 x 6 (36 icons)</SelectItem>
                <SelectItem value="8x8">8 x 8 (64 icons)</SelectItem>
              </SelectContent>
            </Select>
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
                  <SelectItem key={preset.name} value={preset.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{preset.displayName}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              当前：{vTracerPresets.find(p => p.name === vTracerPresetName)?.displayName}
              {vTracerPresetName === 'ultra' && ' - 文件较大但细节最全'}
              {vTracerPresetName === 'minimal' && ' - 文件最小但细节较少'}
              {vTracerPresetName === 'detailed' && ' - 推荐使用'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
