import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useWorkbenchStore, BoundingBox } from '@/stores/workbench-store';

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

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedBox) {
        onBoxDelete(selectedBox);
      } else if (e.key === 'Escape') {
        onBoxSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBox, onBoxSelect, onBoxDelete]);

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
    const handleSize = 10; // 控制点大小
    const cornerThreshold = handleSize * 1.5;

    // 检查是否在角落控制点
    if (Math.abs(mouseX - box.x) < cornerThreshold && Math.abs(mouseY - box.y) < cornerThreshold) {
      return 'resize-tl';
    }
    if (Math.abs(mouseX - (box.x + box.width)) < cornerThreshold && Math.abs(mouseY - box.y) < cornerThreshold) {
      return 'resize-tr';
    }
    if (Math.abs(mouseX - box.x) < cornerThreshold && Math.abs(mouseY - (box.y + box.height)) < cornerThreshold) {
      return 'resize-bl';
    }
    if (Math.abs(mouseX - (box.x + box.width)) < cornerThreshold && Math.abs(mouseY - (box.y + box.height)) < cornerThreshold) {
      return 'resize-br';
    }

    // 检查是否在边控制点
    if (Math.abs(mouseY - box.y) < handleSize && mouseX > box.x && mouseX < box.x + box.width) {
      return 'resize-t';
    }
    if (Math.abs(mouseY - (box.y + box.height)) < handleSize && mouseX > box.x && mouseX < box.x + box.width) {
      return 'resize-b';
    }
    if (Math.abs(mouseX - box.x) < handleSize && mouseY > box.y && mouseY < box.y + box.height) {
      return 'resize-l';
    }
    if (Math.abs(mouseX - (box.x + box.width)) < handleSize && mouseY > box.y && mouseY < box.y + box.height) {
      return 'resize-r';
    }

    // 检查是否在边界框内部
    if (mouseX > box.x && mouseX < box.x + box.width && mouseY > box.y && mouseY < box.y + box.height) {
      return 'move';
    }

    return 'none';
  }, []);

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent, box: BoundingBox) => {
    e.stopPropagation();

    const pos = getRelativePosition(e.clientX, e.clientY);
    const mode = getDragMode(box, pos.x, pos.y);

    if (mode !== 'none') {
      // 在开始拖拽前保存历史
      if (mode === 'move' || mode.startsWith('resize')) {
        onSaveHistory();
      }

      setDragMode(mode);
      setDragStart(pos);
      setInitialBox(box);
      onBoxSelect(box.id);
    }
  }, [getRelativePosition, getDragMode, onBoxSelect, onSaveHistory]);

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
          <div
            key={box.id}
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
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 -left-1 cursor-nw-resize hover:scale-125 transition-transform" />
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 -right-1 cursor-ne-resize hover:scale-125 transition-transform" />
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 -left-1 cursor-sw-resize hover:scale-125 transition-transform" />
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 -right-1 cursor-se-resize hover:scale-125 transition-transform" />

                {/* 四条边的控制点 */}
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 left-1/2 -translate-x-1/2 cursor-n-resize hover:scale-125 transition-transform" />
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 left-1/2 -translate-x-1/2 cursor-s-resize hover:scale-125 transition-transform" />
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -left-1 top-1/2 -translate-y-1/2 cursor-w-resize hover:scale-125 transition-transform" />
                <div className="absolute w-2 h-2 bg-primary border border-white rounded-full -right-1 top-1/2 -translate-y-1/2 cursor-e-resize hover:scale-125 transition-transform" />
              </>
            )}

            {/* 图标ID标签 */}
            <div className={cn(
              'absolute -top-5 left-0 px-1.5 py-0.5 text-xs font-medium rounded',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'
            )}>
              {box.id}
            </div>
          </div>
        );
      })}
    </div>
  );
}
