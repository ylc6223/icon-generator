import { ReactNode, useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { CONTEXT_MENU_ITEMS, getShortcutDisplay } from './menuConfig';

interface IconContextMenuProps {
  children: ReactNode;
  onRename: () => void;
  onDelete: () => void;
}

/**
 * 图标右键菜单组件
 *
 * 提供图标编辑操作的上下文菜单，包括重命名和删除功能。
 * 菜单在边界框上右键点击时触发。
 *
 * @param children - 需要包裹的边界框内容
 * @param onRename - 重命名回调
 * @param onDelete - 删除回调
 */
export function IconContextMenu({
  children,
  onRename,
  onDelete,
}: IconContextMenuProps) {
  /**
   * 处理菜单项操作
   */
  const handleAction = useCallback(
    (actionType: string) => {
      switch (actionType) {
        case 'rename':
          onRename();
          break;
        case 'delete':
          onDelete();
          break;
      }
    },
    [onRename, onDelete]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 animate-context-menu-in data-[state=closed]:animate-context-menu-out">
        {CONTEXT_MENU_ITEMS.map((item) => {
          // 处理分隔符
          if (item.separator) {
            return <ContextMenuSeparator key={item.id} />;
          }

          // 渲染菜单项
          const Icon = item.icon;

          return (
            <ContextMenuItem
              key={item.id}
              onClick={() => handleAction(item.action.type)}
              disabled={item.disabled}
            >
              {Icon && <Icon className="w-4 h-4 mr-2" />}
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {getShortcutDisplay(item.shortcut)}
                </span>
              )}
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}
