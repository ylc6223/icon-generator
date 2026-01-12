import { useEffect } from 'react';
import { useWorkbenchStore } from '@/stores/workbench-store';

/**
 * 全局键盘快捷键 Hook
 * 处理撤销、重做、删除等快捷键操作
 */
export function useKeyboardShortcuts() {
  const {
    selectedBox,
    undo,
    redo,
    deleteBox,
    boxHistory,
    selectBox,
    isProcessing,
  } = useWorkbenchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在处理中，禁用快捷键
      if (isProcessing) return;

      // 如果用户在输入框中，不触发快捷键
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+Z 或 Cmd+Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (boxHistory.length > 0) {
          undo();
        }
        return;
      }

      // Ctrl+Y 或 Ctrl+Shift+Z 或 Cmd+Shift+Z: 重做
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete 或 Backspace: 删除选中边界框
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedBox
      ) {
        e.preventDefault();
        deleteBox(selectedBox);
        selectBox(null);
        return;
      }

      // Escape: 取消选择
      if (e.key === 'Escape' && selectedBox) {
        e.preventDefault();
        selectBox(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedBox,
    undo,
    redo,
    deleteBox,
    selectBox,
    boxHistory,
    isProcessing,
  ]);
}
