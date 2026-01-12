import {
  TopBar,
  AssetsPanel,
  CanvasArea,
  PropertiesPanel,
  StatusBar,
} from '@/components/workbench';
import { useKeyboardShortcuts } from '@/hooks';

const Index = () => {
  // 启用全局键盘快捷键
  useKeyboardShortcuts();

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Assets */}
        <div className="hidden lg:block">
          <AssetsPanel />
        </div>

        {/* Main Canvas */}
        <CanvasArea />

        {/* Right Panel - Properties */}
        <div className="hidden xl:block">
          <PropertiesPanel />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default Index;
