import type { LucideProps } from 'lucide-react';
import { Edit, Trash2 } from 'lucide-react';

/**
 * 菜单操作类型
 */
export type MenuAction =
  | { type: 'rename' }
  | { type: 'delete' }
  | { type: 'custom'; handler: () => void };

/**
 * 菜单项配置接口
 */
export interface MenuItemConfig {
  // 基本属性
  id: string;                           // 唯一标识
  label: string;                        // 显示文本
  icon: React.ComponentType<LucideProps> | null;  // 图标组件
  action: MenuAction;                   // 操作类型

  // 可选属性
  shortcut?: string;                    // 快捷键提示
  disabled?: boolean;                   // 是否禁用
  separator?: boolean;                  // 后面是否显示分隔符
  group?: string;                       // 分组标识
}

/**
 * 右键菜单配置
 *
 * 快捷键显示说明：
 * - `F2 / ⌘R`：F2 和 Ctrl+R（Mac 显示为 ⌘R）
 * - `Del`：Delete 键的简写
 */
export const CONTEXT_MENU_ITEMS: MenuItemConfig[] = [
  {
    id: 'rename',
    label: '重命名',
    icon: Edit,
    action: { type: 'rename' },
    shortcut: 'F2 / ⌘R',
    group: 'edit',
  },
  {
    id: 'separator-1',
    label: '',
    icon: null,
    action: { type: 'custom', handler: () => {} },
    separator: true,
  },
  {
    id: 'delete',
    label: '删除',
    icon: Trash2,
    action: { type: 'delete' },
    shortcut: 'Del',
    group: 'actions',
  },
];

/**
 * 获取快捷键显示文本（根据平台自适应）
 *
 * @param baseShortcut - 基础快捷键字符串
 * @returns 平台适配后的快捷键显示文本
 */
export function getShortcutDisplay(baseShortcut: string): string {
  if (baseShortcut === 'F2 / ⌘R') {
    return navigator.platform.includes('Mac')
      ? 'F2 / ⌘R'
      : 'F2 / Ctrl+R';
  }
  return baseShortcut;
}
