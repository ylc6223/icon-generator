import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DetectedIcon } from '@/stores/workbench-store';

interface IconPreviewCardProps {
  icon: DetectedIcon;
  onToggle: (id: string) => void;
  index: number;
}

export function IconPreviewCard({ icon, onToggle, index }: IconPreviewCardProps) {
  return (
    <div
      onClick={() => onToggle(icon.id)}
      className={cn(
        'relative aspect-square rounded-lg border p-2 cursor-pointer transition-all duration-120 ease-out group',
        'hover:shadow-soft-md hover:-translate-y-0.5',
        icon.selected
          ? 'border-primary border-2 bg-accent'
          : 'border-border bg-surface hover:border-border-strong'
      )}
    >
      {/* Icon Preview */}
      <div className="w-full h-full flex items-center justify-center">
        {icon.imageData ? (
          <img
            src={icon.imageData}
            alt={`Icon ${index + 1}`}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-full h-full bg-muted rounded animate-pulse-subtle" />
        )}
      </div>

      {/* Selection Checkbox */}
      <div
        className={cn(
          'absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center transition-all',
          icon.selected
            ? 'bg-primary'
            : 'bg-background/95 border border-border opacity-0 group-hover:opacity-100'
        )}
      >
        {icon.selected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      {/* Label */}
      <div className="absolute bottom-1 left-1 right-1">
        <p className="text-body-sm text-muted-foreground truncate text-center">
          {index + 1}
        </p>
      </div>
    </div>
  );
}
