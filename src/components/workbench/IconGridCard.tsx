import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoundingBox } from '@/stores/workbench-store';

interface IconGridCardProps {
  box: BoundingBox;
  index: number;
  onToggle: (id: string) => void;
}

export function IconGridCard({ box, index, onToggle }: IconGridCardProps) {
  return (
    <div
      onClick={() => onToggle(box.id)}
      className={cn(
        'relative aspect-square rounded-lg border p-2 cursor-pointer transition-all duration-200 ease-out group',
        'hover:shadow-soft-md hover:-translate-y-0.5',
        box.selected
          ? 'border-primary border-2 bg-accent'
          : 'border-border bg-surface hover:border-border-strong'
      )}
    >
      {/* Icon Preview */}
      <div className="w-full h-full flex items-center justify-center">
        {box.imageData ? (
          <img
            src={box.imageData}
            alt={`Icon ${index + 1}`}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-full h-full bg-muted rounded animate-pulse" />
        )}
      </div>

      {/* Selection Checkbox */}
      <div
        className={cn(
          'absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center transition-all',
          box.selected
            ? 'bg-primary'
            : 'bg-background/95 border border-border opacity-0 group-hover:opacity-100'
        )}
      >
        {box.selected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      {/* Size Info */}
      <div className="absolute bottom-1 left-1 right-1">
        <p className="text-body-sm text-muted-foreground truncate text-center">
          {box.width}×{box.height}
        </p>
      </div>
    </div>
  );
}
