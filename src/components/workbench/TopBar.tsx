import { Settings, Download, Grid3X3, Languages, Wand2 } from 'lucide-react';
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
import { exportIconsAsZip, batchVectorize } from '@/lib/icon-processor';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/theme-toggle';

export function TopBar() {
  const {
    boundingBoxes,
    selectedBox,
    vectorizedIcons,
    iconLabels,
    isProcessing,
    reset,
    setVectorizedIcons,
    setScanning,
    setStatus,
    setProcessing,
    hasSelectedIcons,
    getSelectedIconCount,
  } = useWorkbenchStore();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const canExport = hasSelectedIcons() && !isProcessing;
  const canVectorize = boundingBoxes.length > 0 && !isProcessing;
  const selectedCount = getSelectedIconCount();

  // 批量矢量化所有图标
  const handleVectorize = async () => {
    if (!canVectorize) return;

    console.log('🎯 开始矢量化...');
    console.log('图标数量:', boundingBoxes.length);

    try {
      setStatus('processing');

      // 启动扫描动画
      setScanning(true);

      const images = boundingBoxes.map(box => box.imageData);

      console.log('准备处理', images.length, '个图标');

      const results = await batchVectorize(images, (current, total) => {
        console.log(`矢量化进度: ${current}/${total}`);
      });

      console.log('✅ 矢量化完成！结果数量:', results.length);
      console.log('第一个结果预览:', results[0]);

      // 保存结果到 store
      const resultMap = new Map<string, import('@/stores/workbench-store').VectorizationResult>();
      boundingBoxes.forEach((box, index) => {
        resultMap.set(box.id, results[index]);
      });
      setVectorizedIcons(resultMap);

      console.log('✅ 结果已保存到 store，Map 大小:', resultMap.size);

      setStatus('ready');
      toast({
        title: t('toasts.vectorizeSuccess'),
        description: t('toasts.vectorizeSuccessDesc', { count: boundingBoxes.length }),
      });

      // 扫描动画会在 2.5 秒后自动关闭（由 ScanningAnimation 组件处理）
    } catch (error) {
      console.error('❌ 矢量化失败:', error);
      setStatus('idle');
      setScanning(false); // 出错时立即关闭动画
      toast({
        title: t('toasts.vectorizeFailed'),
        description: error instanceof Error ? error.message : t('toasts.vectorizeFailedDesc'),
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    if (!canExport) return;

    const selectedCount = getSelectedIconCount();

    toast({
      title: '开始导出',
      description: `正在导出 ${selectedCount} 个图标...`,
    });

    try {
      // 设置处理状态
      setStatus('processing');

      // 只导出选中的图标
      const { blob, successCount, skippedCount } = await exportIconsAsZip(
        boundingBoxes.filter(b => b.selected),
        vectorizedIcons,
        iconLabels,
        (current, total) => {
          // 更新进度
          const progress = Math.round((current / total) * 100);
          setProcessing(true, 'exporting', progress);
          console.log(`导出进度: ${current}/${total} (${progress}%)`);
        }
      );

      // 下载文件
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icons.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 恢复状态
      setStatus('ready');

      // 详细成功提示
      if (skippedCount > 0) {
        toast({
          title: '部分图标导出失败',
          description: `成功导出 ${successCount} 个图标，跳过 ${skippedCount} 个`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '导出成功',
          description: `已导出 ${successCount} 个图标到 icons.zip`,
          variant: 'default',
        });

        // 导出成功后清理工作区
        setTimeout(() => {
          reset();
        }, 1500); // 延迟1.5秒，让用户看到成功提示
      }
    } catch (error) {
      setStatus('idle');
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <header className="h-topbar flex items-center justify-between px-4 bg-background border-b border-border shadow-soft-sm">
      {/* Left: Logo & Product Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
          <Grid3X3 className="w-4 h-4 text-primary" />
        </div>
        <span className="text-body-lg text-foreground font-medium">{t('appName')}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* 矢量化按钮 */}
        <Button
          onClick={handleVectorize}
          disabled={!canVectorize}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Wand2 className="w-4 h-4" />
          <span className="hidden sm:inline">{t('topBar.vectorize')}</span>
          {isProcessing && (
            <div className="ml-1 w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </Button>

        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
          title={!hasSelectedIcons() ? "请至少选择 1 个图标" : `导出 ${selectedCount} 个图标`}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">
            {canExport ? `导出 SVG (${selectedCount}个)` : t('topBar.export')}
          </span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t('topBar.settings')}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Language Selection */}
            <DropdownMenuItem onClick={() => changeLanguage('zh')} className="gap-2">
              <Languages className="w-4 h-4" />
              <span>中文</span>
              {i18n.language === 'zh' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('en')} className="gap-2">
              <Languages className="w-4 h-4" />
              <span>English</span>
              {i18n.language === 'en' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={reset}>
              {t('topBar.resetWorkspace')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
