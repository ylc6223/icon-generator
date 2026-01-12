import { Shield } from 'lucide-react';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { cn } from '@/lib/utils';

export function StatusBar() {
  const { status, detectedIcons } = useWorkbenchStore();

  const statusText = {
    idle: 'Ready',
    uploading: 'Uploading...',
    detecting: 'Detecting icons...',
    processing: 'Processing...',
    ready: 'Ready',
  }[status];

  const selectedCount = detectedIcons.filter(i => i.selected).length;

  return (
    <footer className="h-statusbar flex items-center justify-between px-4 bg-background border-t border-border text-body-sm">
      {/* Left: Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            status === 'ready' ? 'bg-green-500' :
            status === 'idle' ? 'bg-muted-foreground' :
            'bg-primary animate-pulse'
          )} />
          <span className="text-muted-foreground">{statusText}</span>
        </div>

        {detectedIcons.length > 0 && (
          <span className="text-muted-foreground">
            {selectedCount} of {detectedIcons.length} icons selected
          </span>
        )}
      </div>

      {/* Right: Privacy notice */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>All processing happens locally</span>
      </div>
    </footer>
  );
}
