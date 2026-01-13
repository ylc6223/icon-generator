import { FolderOpen } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { IconGridCard } from './IconGridCard';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function AssetsPanel() {
  const {
    originalImage,
    boundingBoxes,
    toggleIconSelection,
    selectAllIcons,
    deselectAllIcons,
    getSelectedIconCount,
  } = useWorkbenchStore();
  const { t } = useTranslation();

  const iconCount = boundingBoxes.length;
  const selectedCount = getSelectedIconCount();

  return (
    <aside className="w-left-panel h-full flex flex-col border-r border-border bg-background">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <FolderOpen className="w-4 h-4 text-muted-foreground" />
        <span className="text-body-sm font-medium text-foreground">{t('assetsPanel.title')}</span>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Upload Section */}
          <div className="space-y-2">
            <label className="text-body-sm text-muted-foreground">
              {t('assetsPanel.sourceImage')}
            </label>
            <UploadZone compact={!!originalImage} />
          </div>

          {/* Icon Grid - Only show when image is uploaded */}
          {originalImage && boundingBoxes.length > 0 && (
            <div className="space-y-4">
              {/* Batch Actions */}
              <div className="flex gap-2">
                <Button onClick={selectAllIcons} size="sm" variant="default">
                  全选
                </Button>
                <Button onClick={deselectAllIcons} size="sm" variant="outline">
                  取消全选
                </Button>
              </div>

              {/* Selection Stats */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  已选择 {selectedCount}/{iconCount} 个图标
                </p>
                {selectedCount > 0 && (
                  <p className="text-xs text-primary mt-1">
                    ({Math.round((selectedCount / iconCount) * 100)}%)
                  </p>
                )}
              </div>

              {/* Icon Grid - 固定4列布局 */}
              <div className="grid grid-cols-4 gap-2">
                {boundingBoxes.map((box, index) => (
                  <IconGridCard
                    key={box.id}
                    box={box}
                    index={index}
                    onToggle={toggleIconSelection}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
