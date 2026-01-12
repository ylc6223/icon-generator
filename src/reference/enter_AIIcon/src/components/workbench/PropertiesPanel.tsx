import { Sliders, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function PropertiesPanel() {
  const {
    uploadedImage,
    vectorizationPreset,
    setVectorizationPreset,
    gridSize,
    setGridSize,
    detectedIcons,
    selectAllIcons,
    deselectAllIcons,
    status,
  } = useWorkbenchStore();

  const selectedCount = detectedIcons.filter(i => i.selected).length;
  const allSelected = selectedCount === detectedIcons.length;

  if (!uploadedImage) {
    return (
      <aside className="w-right-panel h-full flex flex-col border-l border-border bg-background">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Sliders className="w-4 h-4 text-muted-foreground" />
          <span className="text-body-sm font-medium text-foreground">Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-body-sm text-muted-foreground text-center">
            Upload an image to see properties
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
        <span className="text-body-sm font-medium text-foreground">Properties</span>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {/* Grid Settings */}
        <div className="space-y-3">
          <Label className="text-body-sm text-muted-foreground">
            Grid Layout
          </Label>
          <Select 
            value={`${gridSize.rows}x${gridSize.cols}`}
            onValueChange={(value) => {
              const [rows, cols] = value.split('x').map(Number);
              setGridSize(rows, cols);
            }}
            disabled={status === 'processing'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grid size" />
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

        {/* Vectorization Preset */}
        <div className="space-y-3">
          <Label className="text-body-sm text-muted-foreground">
            Vectorization Quality
          </Label>
          <div className="space-y-2">
            {(['balanced', 'clean', 'precise'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setVectorizationPreset(preset)}
                disabled={status === 'processing'}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                  vectorizationPreset === preset
                    ? 'border-primary bg-accent'
                    : 'border-border bg-surface hover:border-border-strong'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0',
                  vectorizationPreset === preset
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40'
                )}>
                  {vectorizationPreset === preset && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-body-sm font-medium text-foreground capitalize">
                    {preset}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    {preset === 'balanced' && 'Good balance of quality and file size'}
                    {preset === 'clean' && 'Smoother paths, simplified shapes'}
                    {preset === 'precise' && 'Maximum detail preservation'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selection Actions */}
        {detectedIcons.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-body-sm text-muted-foreground">
              Selection
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllIcons}
                disabled={allSelected}
                className="flex-1 gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAllIcons}
                disabled={selectedCount === 0}
                className="flex-1 gap-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                None
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
