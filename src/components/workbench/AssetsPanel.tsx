import { FolderOpen } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { useTranslation } from 'react-i18next';

export function AssetsPanel() {
  const { originalImage } = useWorkbenchStore();
  const { t } = useTranslation();

  return (
    <aside className="w-left-panel h-full flex flex-col border-r border-border bg-background">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <FolderOpen className="w-4 h-4 text-muted-foreground" />
        <span className="text-body-sm font-medium text-foreground">{t('assetsPanel.title')}</span>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Upload Section */}
          <div className="space-y-2">
            <label className="text-body-sm text-muted-foreground">
              {t('assetsPanel.sourceImage')}
            </label>
            <UploadZone compact={!!originalImage} />
          </div>

          {/* Info Section - Only show when image is uploaded */}
          {originalImage && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="space-y-1">
                <label className="text-body-sm text-muted-foreground">
                  {t('assetsPanel.backgroundMode')}
                </label>
                <p className="text-body-sm text-foreground">
                  {t('assetsPanel.autoDetected')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
