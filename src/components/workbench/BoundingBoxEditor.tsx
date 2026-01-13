import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWorkbenchStore, BoundingBox } from '@/stores/workbench-store';
import { IconContextMenu } from './IconContextMenu';

interface BoundingBoxEditorProps {
  imageWidth: number;
  imageHeight: number;
  boundingBoxes: BoundingBox[];
  selectedBox: string | null;
  onBoxSelect: (id: string | null) => void;
  onBoxUpdate: (id: string, changes: Partial<Pick<BoundingBox, 'x' | 'y' | 'width' | 'height'>>) => void;
  onBoxDelete: (id: string) => void;
  onSaveHistory: () => void;
}

type DragMode = 'none' | 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'resize-t' | 'resize-b' | 'resize-l' | 'resize-r';

export function BoundingBoxEditor({
  imageWidth,
  imageHeight,
  boundingBoxes,
  selectedBox,
  onBoxSelect,
  onBoxUpdate,
  onBoxDelete,
  onSaveHistory,
}: BoundingBoxEditorProps) {
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialBox, setInitialBox] = useState<BoundingBox | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 标签编辑状态
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [labelError, setLabelError] = useState('');

  // 从 store 获取标签相关函数
  const { iconLabels, setIconLabel, removeIconLabel } = useWorkbenchStore();

  // 验证标签
  const validateLabel = useCallback((label: string, excludeId?: string): string => {
    // 长度验证
    if (label.length < 1) {
      return '标签不能为空';
    }
    if (label.length > 50) {
      return '标签长度不能超过50个字符';
    }

    // 特殊字符验证
    const illegalChars = /[\/\\:*?"<>|]/;
    if (illegalChars.test(label)) {
      return '标签不能包含以下字符: / \\ : * ? " < > |';
    }

    // 重复标签检查
    const existingLabels = Array.from(iconLabels.entries())
      .filter(([id]) => id !== excludeId)
      .map(([, label]) => label);

    if (existingLabels.includes(label)) {
      return '标签已存在';
    }

    return '';
  }, [iconLabels]);

  // 开始编辑标签
  const startEditingLabel = useCallback((boxId: string) => {
    const currentLabel = iconLabels.get(boxId) || '';
    setEditingLabel(boxId);
    setLabelInput(currentLabel);
    setLabelError('');
  }, [iconLabels]);

  // 输入框自动聚焦和全选文本
  useEffect(() => {
    if (!editingLabel) return;

    // 使用 requestAnimationFrame 确保输入框已渲染
    requestAnimationFrame(() => {
      const input = document.querySelector(
        `input[data-input-box-id="${editingLabel}"]`
      ) as HTMLInputElement;

      if (input) {
        input.focus();
        input.select(); // 全选文本
      }
    });
  }, [editingLabel]);

  // 保存标签
  const saveLabel = useCallback((boxId: string) => {
    const error = validateLabel(labelInput, boxId);
    if (error) {
      setLabelError(error);
      return;
    }

    if (labelInput.trim()) {
      setIconLabel(boxId, labelInput.trim());
    } else {
      removeIconLabel(boxId);
    }

    setEditingLabel(null);
    setLabelInput('');
    setLabelError('');
  }, [labelInput, validateLabel, setIconLabel, removeIconLabel]);

  // 取消编辑标签
  const cancelEditingLabel = useCallback(() => {
    setEditingLabel(null);
    setLabelInput('');
    setLabelError('');
  }, []);

  // 处理标签输入的键盘事件
  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent, boxId: string) => {
    if (e.key === 'Enter') {
      saveLabel(boxId);
    } else if (e.key === 'Escape') {
      cancelEditingLabel();
    }
  }, [saveLabel, cancelEditingLabel]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在有选中图标时响应快捷键（ESC 除外）
      if (!selectedBox && e.key !== 'Escape') return;

      // 输入框打开时，禁用所有全局快捷键（ESC 除外）
      if (editingLabel) {
        if (e.key === 'Escape') {
          cancelEditingLabel();
        }
        return;
      }

      // ESC 键：取消选择或取消编辑
      if (e.key === 'Escape') {
        onBoxSelect(null);
        return;
      }

      // F2 键或 Ctrl+R：重命名
      if (e.key === 'F2' || (e.key === 'r' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        onSaveHistory();
        startEditingLabel(selectedBox);
        return;
      }

      // Delete 键：删除选中图标
      if (e.key === 'Delete') {
        e.preventDefault();
        onSaveHistory();
        onBoxDelete(selectedBox);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBox, editingLabel, onBoxSelect, onBoxDelete, onSaveHistory, startEditingLabel, cancelEditingLabel]);

  // 计算鼠标位置相对于容器的坐标
  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [imageWidth, imageHeight]);

  // 判断拖拽模式
  const getDragMode = useCallback((box: BoundingBox, mouseX: number, mouseY: number): DragMode => {
    // 控制点实际尺寸和偏移
    // 控制点使用 w-2 h-2 (8px) 和 -top-1/-left-1/-right-1/-bottom-1 (-4px 偏移)
    // 所以控制点中心在边界框边缘外部 4px 处，控制点半径为 4px
    const handleRadius = 4; // 控制点半径 (8px / 2)
    const handleOffset = 4; // 控制点中心到边框的距离 (-top-1/-left-1 = -4px)
    const hitArea = 8; // 扩大点击区域到 8px，提升操作体验

    // 检查是否在角落控制点（控制点在边界框角落外部）
    // 左上角：box.x - handleOffset, box.y - handleOffset
    if (Math.abs(mouseX - (box.x - handleOffset)) <= hitArea &&
        Math.abs(mouseY - (box.y - handleOffset)) <= hitArea) {
      return 'resize-tl';
    }
    // 右上角：box.x + box.width + handleOffset, box.y - handleOffset
    if (Math.abs(mouseX - (box.x + box.width + handleOffset)) <= hitArea &&
        Math.abs(mouseY - (box.y - handleOffset)) <= hitArea) {
      return 'resize-tr';
    }
    // 左下角：box.x - handleOffset, box.y + box.height + handleOffset
    if (Math.abs(mouseX - (box.x - handleOffset)) <= hitArea &&
        Math.abs(mouseY - (box.y + box.height + handleOffset)) <= hitArea) {
      return 'resize-bl';
    }
    // 右下角：box.x + box.width + handleOffset, box.y + box.height + handleOffset
    if (Math.abs(mouseX - (box.x + box.width + handleOffset)) <= hitArea &&
        Math.abs(mouseY - (box.y + box.height + handleOffset)) <= hitArea) {
      return 'resize-br';
    }

    // 检查是否在边控制点（控制点在边界框边缘外部，位于边中心）
    // 顶部边控制点：水平居中，顶部偏移 -handleOffset
    if (Math.abs(mouseX - (box.x + box.width / 2)) <= hitArea &&
        Math.abs(mouseY - (box.y - handleOffset)) <= hitArea) {
      return 'resize-t';
    }
    // 底部边控制点：水平居中，底部偏移 +handleOffset
    if (Math.abs(mouseX - (box.x + box.width / 2)) <= hitArea &&
        Math.abs(mouseY - (box.y + box.height + handleOffset)) <= hitArea) {
      return 'resize-b';
    }
    // 左边控制点：垂直居中，左侧偏移 -handleOffset
    if (Math.abs(mouseX - (box.x - handleOffset)) <= hitArea &&
        Math.abs(mouseY - (box.y + box.height / 2)) <= hitArea) {
      return 'resize-l';
    }
    // 右边控制点：垂直居中，右侧偏移 +handleOffset
    if (Math.abs(mouseX - (box.x + box.width + handleOffset)) <= hitArea &&
        Math.abs(mouseY - (box.y + box.height / 2)) <= hitArea) {
      return 'resize-r';
    }

    // 检查是否在边界框内部（整个边界框区域都是 move）
    if (mouseX >= box.x && mouseX <= box.x + box.width &&
        mouseY >= box.y && mouseY <= box.y + box.height) {
      return 'move';
    }

    return 'none';
  }, []);

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent, box: BoundingBox) => {
    e.stopPropagation();

    // 只有选中的边界框才能拖动或调整大小
    const isSelected = box.id === selectedBox;

    const pos = getRelativePosition(e.clientX, e.clientY);
    const mode = getDragMode(box, pos.x, pos.y);

    if (isSelected && mode !== 'none') {
      // 在开始拖拽前保存历史
      if (mode === 'move' || mode.startsWith('resize')) {
        onSaveHistory();
      }

      setDragMode(mode);
      setDragStart(pos);
      setInitialBox(box);
      onBoxSelect(box.id);
    } else if (!isSelected) {
      // 未选中的框只允许选中,不允许拖拽
      onBoxSelect(box.id);
    }
  }, [getRelativePosition, getDragMode, onBoxSelect, onSaveHistory, selectedBox]);

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragMode === 'none' || !initialBox) return;

      const pos = getRelativePosition(e.clientX, e.clientY);
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      let changes: Partial<Pick<BoundingBox, 'x' | 'y' | 'width' | 'height'>> = {};

      switch (dragMode) {
        case 'move':
          changes.x = initialBox.x + dx;
          changes.y = initialBox.y + dy;
          break;
        case 'resize-tl':
          changes.x = initialBox.x + dx;
          changes.y = initialBox.y + dy;
          changes.width = initialBox.width - dx;
          changes.height = initialBox.height - dy;
          break;
        case 'resize-tr':
          changes.y = initialBox.y + dy;
          changes.width = initialBox.width + dx;
          changes.height = initialBox.height - dy;
          break;
        case 'resize-bl':
          changes.x = initialBox.x + dx;
          changes.width = initialBox.width - dx;
          changes.height = initialBox.height + dy;
          break;
        case 'resize-br':
          changes.width = initialBox.width + dx;
          changes.height = initialBox.height + dy;
          break;
        case 'resize-t':
          changes.y = initialBox.y + dy;
          changes.height = initialBox.height - dy;
          break;
        case 'resize-b':
          changes.height = initialBox.height + dy;
          break;
        case 'resize-l':
          changes.x = initialBox.x + dx;
          changes.width = initialBox.width - dx;
          break;
        case 'resize-r':
          changes.width = initialBox.width + dx;
          break;
      }

      // 确保宽高最小为10px
      if (changes.width !== undefined && changes.width < 10) changes.width = 10;
      if (changes.height !== undefined && changes.height < 10) changes.height = 10;

      // 边界限制：确保边界框在图片范围内
      let newX = changes.x !== undefined ? changes.x : initialBox.x;
      let newY = changes.y !== undefined ? changes.y : initialBox.y;
      let newWidth = changes.width !== undefined ? changes.width : initialBox.width;
      let newHeight = changes.height !== undefined ? changes.height : initialBox.height;

      // 限制边界框不能超出图片范围
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + newWidth > imageWidth) {
        // 如果宽度超出，优先保持右边界，同时保证最小宽度
        newWidth = Math.max(10, imageWidth - newX);
        // 如果还是不够，调整x位置
        if (newWidth === 10 && newX > imageWidth - 10) {
          newX = imageWidth - 10;
        }
      }
      if (newY + newHeight > imageHeight) {
        // 如果高度超出，优先保持下边界，同时保证最小高度
        newHeight = Math.max(10, imageHeight - newY);
        // 如果还是不够，调整y位置
        if (newHeight === 10 && newY > imageHeight - 10) {
          newY = imageHeight - 10;
        }
      }

      // 应用限制后的值
      changes.x = newX;
      changes.y = newY;
      changes.width = newWidth;
      changes.height = newHeight;

      onBoxUpdate(initialBox.id, changes);
    };

    const handleMouseUp = () => {
      setDragMode('none');
      setInitialBox(null);
    };

    if (dragMode !== 'none') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragMode, initialBox, dragStart, getRelativePosition, onBoxUpdate]);

  // 获取鼠标样式
  const getCursorStyle = useCallback((box: BoundingBox) => {
    if (selectedBox !== box.id) return 'pointer';

    // 这里需要根据当前鼠标位置返回正确的样式
    // 由于React无法直接获取鼠标位置，我们在CSS中处理
    return 'move';
  }, [selectedBox]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {boundingBoxes.map((box) => {
        const isSelected = box.id === selectedBox;

        // 计算百分比位置
        const left = (box.x / imageWidth) * 100;
        const top = (box.y / imageHeight) * 100;
        const width = (box.width / imageWidth) * 100;
        const height = (box.height / imageHeight) * 100;

        return (
          <IconContextMenu
            key={box.id}
            onRename={() => {
              onSaveHistory();
              startEditingLabel(box.id);
            }}
            onDelete={() => {
              onSaveHistory();
              onBoxDelete(box.id);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: isSelected ? 1.02 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              onMouseDown={(e) => handleMouseDown(e, box)}
              className={cn(
                'absolute border-2 transition-colors duration-150 group',
                isSelected
                  ? 'border-primary bg-primary/5 z-10'
                  : 'border-muted-foreground/50 bg-muted-foreground/5 hover:border-primary/70'
              )}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                cursor: getCursorStyle(box),
              }}
            >
            {/* 选中时显示控制点 */}
            {isSelected && (
              <>
                {/* 四个角的控制点 */}
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 -left-1 cursor-nw-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 -right-1 cursor-ne-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 -left-1 cursor-sw-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 -right-1 cursor-se-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />

                {/* 四条边的控制点 */}
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 left-1/2 -translate-x-1/2 cursor-n-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 left-1/2 -translate-x-1/2 cursor-s-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -left-1 top-1/2 -translate-y-1/2 cursor-w-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-primary border border-white rounded-full -right-1 top-1/2 -translate-y-1/2 cursor-e-resize"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                />
              </>
            )}

            {/* 图标标签 */}
            {editingLabel === box.id ? (
              <div
                className="absolute -top-14 left-0 z-20"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="bg-background border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => handleLabelKeyDown(e, box.id)}
                    className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="输入标签..."
                    autoFocus
                    data-input-box-id={box.id}
                  />
                  {labelError && (
                    <div className="flex items-center gap-1 text-destructive text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{labelError}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => saveLabel(box.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      保存
                    </button>
                    <button
                      onClick={cancelEditingLabel}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'absolute -top-5 left-0 px-1.5 py-0.5 text-xs font-medium rounded flex items-center gap-1',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                )}
              >
                {iconLabels.get(box.id) || box.id}
              </div>
            )}
          </motion.div>
          </IconContextMenu>
        );
      })}
    </div>
  );
}
