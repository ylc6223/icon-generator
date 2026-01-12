import { Settings, Download, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkbenchStore } from '@/stores/workbench-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportIconsAsZip } from '@/lib/icon-processor';
import { useToast } from '@/hooks/use-toast';

export function TopBar() {
  const { detectedIcons, status, vectorizationPreset, reset } = useWorkbenchStore();
  const { toast } = useToast();
  
  const selectedCount = detectedIcons.filter(icon => icon.selected).length;
  const canExport = status === 'ready' && selectedCount > 0;

  const handleExport = async () => {
    if (!canExport) return;
    
    try {
      const blob = await exportIconsAsZip(detectedIcons, vectorizationPreset);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icons.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: `${selectedCount} icons exported as SVG files.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting icons.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="h-topbar flex items-center justify-between px-4 bg-background border-b border-border shadow-soft-sm">
      {/* Left: Logo & Product Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
          <Grid3X3 className="w-4 h-4 text-primary" />
        </div>
        <span className="text-body-lg text-foreground font-medium">Icon Workbench</span>
      </div>

      {/* Center: Project Name (optional) */}
      <div className="hidden md:flex items-center">
        <span className="text-body-sm text-muted-foreground">
          {status === 'idle' ? 'No project' : 'AI Icon Batch'}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="gap-2"
          size="sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export SVG</span>
          {selectedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground/20 rounded">
              {selectedCount}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={reset}>
              Reset Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
