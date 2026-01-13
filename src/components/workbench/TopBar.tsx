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
    setStatus
  } = useWorkbenchStore();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const canExport = boundingBoxes.length > 0 && !isProcessing;
  const canVectorize = boundingBoxes.length > 0 && !isProcessing;

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

    try {
      const blob = await exportIconsAsZip(
        boundingBoxes,
        vectorizedIcons,
        iconLabels
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icons.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t('toasts.exportSuccess'),
        description: t('toasts.exportSuccessDesc', { count: boundingBoxes.length }),
      });
    } catch (error) {
      toast({
        title: t('toasts.exportFailed'),
        description: t('toasts.exportFailedDesc'),
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

      {/* Center: Project Name (optional) */}
      <div className="hidden md:flex items-center">
        <span className="text-body-sm text-muted-foreground">
          {boundingBoxes.length === 0 ? t('topBar.noProject') : `${boundingBoxes.length} ${t('canvasArea.iconsDetected')}`}
        </span>
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
          <span className="hidden sm:inline">{t('topBar.vectorize') || '矢量化'}</span>
          {isProcessing && (
            <div className="ml-1 w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </Button>

        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{t('topBar.export')}</span>
          {boundingBoxes.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground/20 rounded">
              {boundingBoxes.length}
            </span>
          )}
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
