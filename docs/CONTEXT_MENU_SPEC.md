# 右键菜单技术规范

## 📋 目录

- [概述](#概述)
- [功能需求](#功能需求)
- [UI/UX 设计](#uiux-设计)
- [技术架构](#技术架构)
- [数据结构](#数据结构)
- [实现细节](#实现细节)
- [扩展指南](#扩展指南)
- [测试要点](#测试要点)

---

## 概述

为画布区域的图标边界框添加自定义右键菜单功能，统一图标操作入口，提升应用的专业性和易用性。

### 设计目标

1. **统一交互入口**：将图标编辑操作集中在右键菜单中
2. **提升用户体验**：提供符合用户习惯的上下文菜单交互
3. **保持可扩展性**：为未来添加更多菜单项预留空间
4. **集成现有系统**：与撤销/重做系统无缝集成

---

## 功能需求

### 核心功能

#### 1. 菜单触发

- **触发条件**：只在边界框（图标区域）上右键时触发
- **触发行为**：
  - 自动选中右键点击的图标
  - 关闭之前打开的菜单（全局唯一菜单）
  - 在鼠标指针位置显示菜单

#### 2. 菜单关闭

菜单在以下情况下关闭：
- 点击菜单外部区域
- 点击任何菜单项
- 按下 `ESC` 键

#### 3. 初始菜单项

| 操作 | 图标 | 快捷键 | 描述 |
|------|------|--------|------|
| **重命名** | `Edit` | `F2` / `Ctrl+R` | 编辑图标标签 |
| **删除** | `Trash2` | `Delete` | 移除图标边界框（支持撤销） |

**快捷键说明**：
- `F2`: 传统重命名快捷键（Windows/Linux）
- `Ctrl+R`: 跨平台一致的重命名快捷键
- `Delete`: 删除当前选中图标

### 交互行为

#### 选中状态管理

- 右键点击未选中的图标 → 自动选中该图标并显示菜单
- 右键点击已选中的图标 → 直接显示菜单

#### 操作流程

**重命名流程**：
1. 用户右键点击图标 → 选择"重命名"（或按 F2 / Ctrl+R）
2. 菜单关闭，焦点返回到边界框
3. 在边界框上方显示输入框并自动聚焦
4. 用户输入新名称：
   - 按Enter或点击"保存" → 保存标签，关闭输入框
   - 按ESC或点击"取消" → 放弃修改，关闭输入框
   - 清空文本并保存 → 删除标签，恢复显示默认ID
5. 操作保存到撤销历史
6. 输入框打开期间，全局快捷键（Delete、F2、Ctrl+R）被禁用

**删除流程**：
1. 用户右键点击图标 → 选择"删除"（或按 Delete 键）
2. 菜单关闭，图标边界框立即移除
3. 操作保存到撤销历史
4. 用户可按 Ctrl+Z 撤销删除操作

---

## UI/UX 设计

### 视觉设计

#### 菜单样式

```
┌─────────────────────────┐
│ 📝 重命名    Ctrl+R    │ ← 图标 + 文字 + 快捷键
├─────────────────────────┤ ← 分隔符
│ 🗑️ 删除       Del     │
└─────────────────────────┘
```

**关键特性**：
- 每个菜单项左侧显示操作图标（来自 `lucide-react`）
- 菜单项右侧显示快捷键提示（灰色小字）
- 分组之间使用分隔符（`ContextMenuSeparator`）
- 悬停高亮当前菜单项
- 标准型视觉密度（舒适的 padding）

#### 动画效果

- **打开动画**：淡入（fade-in），150ms
- **关闭动画**：淡出（fade-out），100ms
- 使用 framer-motion 或 CSS transitions

#### 定位规则

- 菜单位置：鼠标指针位置
- 智能边界检测（如果超出屏幕右侧，菜单向左偏移）
- 最小间距：距离屏幕边缘 8px

### 键盘导航

支持完整的键盘导航：

| 按键 | 功能 |
|------|------|
| `↑` / `↓` | 在菜单项之间导航 |
| `Enter` | 执行当前选中的菜单项 |
| `ESC` | 关闭菜单，焦点返回到边界框 |
| `F2` | 快速重命名当前选中图标 |
| `Ctrl+R` | 快速重命名当前选中图标（跨平台） |
| `Delete` | 快速删除当前选中图标 |

**快捷键禁用规则**：
- 输入框打开时，全局快捷键（Delete、F2、Ctrl+R）被禁用
- 菜单打开时，快捷键仍然有效（可快速操作）

### 可访问性

- 完整的键盘导航支持
- ARIA 标签和角色属性（ContextMenu 内置支持）
- 焦点管理：
  - 菜单打开时焦点进入菜单
  - 菜单关闭后焦点返回到边界框
  - 输入框自动聚焦（选择"重命名"后）

---

## 技术架构

### 技术栈选择

#### 使用 ContextMenu 组件

**选择理由**：
- Radix UI 专门为右键菜单设计的 `ContextMenu` 组件
- 更符合右键菜单的交互模式
- 内置防止默认右键菜单功能
- 支持键盘导航和可访问性

**核心组件**：
```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
```

> **注意**：如果项目中没有 `ContextMenu` 组件，需要从 shadcn/ui 添加：
> ```bash
> npx shadcn@latest add context-menu
> ```

### 组件结构

```
BoundingBoxEditor (现有组件)
  └── ContextMenu (新增组件)
        ├── ContextMenu
        │     ├── ContextMenuTrigger (边界框本身)
        │     └── ContextMenuContent
        │           ├── MenuGroup: 编辑操作
        │           │     ├── RenameMenuItem (Ctrl+R)
        │           │     └── DeleteMenuItem (Delete)
        │           ├── ContextMenuSeparator
        │           └── MenuGroup: 其他操作（预留扩展）
        └── LabelInputDialog (重命名输入框，复用现有)
```

### 文件组织

```
src/components/workbench/
  ├── BoundingBoxEditor.tsx (修改)
  ├── IconContextMenu.tsx (新增)
  └── menuConfig.ts (新增 - 菜单配置)
```

---

## 数据结构

### 菜单项配置

```typescript
interface MenuItemConfig {
  // 基本属性
  id: string;                    // 唯一标识
  label: string;                 // 显示文本
  icon: LucideIcon;              // 图标组件
  action: MenuAction;            // 操作类型

  // 可选属性
  shortcut?: string;             // 快捷键提示
  disabled?: boolean;            // 是否禁用
  separator?: boolean;           // 后面是否显示分隔符
  group?: string;                // 分组标识
}

type MenuAction =
  | { type: 'rename' }
  | { type: 'delete' }
  | { type: 'custom'; handler: () => void };
```

### 菜单配置示例

```typescript
import { Edit, Trash2 } from 'lucide-react';

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
```

**快捷键显示说明**：
- `F2 / ⌘R`：F2 和 Ctrl+R（Mac 显示为 ⌘R）
- `Del`：Delete 键的简写

### 组件状态

```typescript
interface ContextMenuState {
  isOpen: boolean;               // 菜单是否打开
  position: { x: number; y: number } | null;  // 菜单位置
  targetBoxId: string | null;    // 目标边界框 ID
}
```

---

## 实现细节

### 1. BoundingBoxEditor 修改

#### 移除直接标签编辑

**之前**：
```tsx
<div onClick={() => startEditingLabel(box.id)}>
  {iconLabels.get(box.id) || box.id}
</div>
```

**之后**：
```tsx
<div>
  {iconLabels.get(box.id) || box.id}
  {/* 移除 onClick，不再支持直接点击编辑 */}
</div>
```

#### 添加右键菜单触发

```tsx
import { ContextMenuTrigger } from '@/components/ui/context-menu';

// 在边界框上添加 ContextMenuTrigger
<motion.div
  key={box.id}
  className={cn(
    'absolute border-2 transition-colors duration-150 group',
    // ... 其他类名
  )}
>
  <ContextMenuTrigger>
    {/* 边界框内容 */}
  </ContextMenuTrigger>

  {/* 嵌入 ContextMenu */}
  <IconContextMenu
    boxId={box.id}
    onRename={() => {
      onSaveHistory();
      startEditingLabel(box.id);
    }}
    onDelete={() => {
      onSaveHistory();
      onBoxDelete(box.id);
    }}
  />
</motion.div>
```

#### 处理编辑状态冲突

```tsx
// 修改现有的右键菜单禁用逻辑
const handleContextMenu = useCallback((e: React.MouseEvent) => {
  // 如果正在编辑标签，阻止右键菜单
  if (editingLabel) {
    e.preventDefault();
    return;
  }

  // ... 原有逻辑
}, [editingLabel]);
```

### 2. IconContextMenu 组件

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Edit, Trash2 } from 'lucide-react';
import { CONTEXT_MENU_ITEMS } from './menuConfig';

interface IconContextMenuProps {
  boxId: string;
  onRename: () => void;
  onDelete: () => void;
}

export function IconContextMenu({
  boxId,
  onRename,
  onDelete,
}: IconContextMenuProps) {
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
      <ContextMenuContent className="w-48">
        {CONTEXT_MENU_ITEMS.map((item, index) => {
          if (item.separator) {
            return <ContextMenuSeparator key={index} />;
          }

          const Icon = item.icon;

          return (
            <ContextMenuItem
              key={item.id}
              onClick={() => handleAction(item.action.type)}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.shortcut}
                </span>
              )}
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

**关键点**：
- `ContextMenu` 自动处理右键菜单的触发和定位
- `ContextMenuTrigger` 包裹边界框内容
- 不需要手动 `preventDefault`，ContextMenu 内置处理

### 3. 菜单操作处理

```tsx
// 在 BoundingBoxEditor 或 CanvasArea 中
const handleMenuAction = useCallback(
  (action: MenuAction, boxId: string) => {
    switch (action.type) {
      case 'rename':
        // 保存历史（用于撤销）
        onSaveHistory();
        // 打开重命名输入框（会自动聚焦）
        startEditingLabel(boxId);
        break;

      case 'delete':
        // 保存历史（用于撤销）
        onSaveHistory();
        // 删除边界框
        onBoxDelete(boxId);
        break;

      case 'custom':
        // 执行自定义操作
        action.handler();
        break;
    }
  },
  [onSaveHistory, startEditingLabel, onBoxDelete]
);
```

### 4. 全局键盘快捷键

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // 只在有选中图标时响应
    if (!selectedBox) return;

    // 输入框打开时，禁用全局快捷键
    if (editingLabel) return;

    // 重命名快捷键
    if (e.key === 'F2' || (e.key === 'r' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      handleMenuAction({ type: 'rename' }, selectedBox);
    }

    // 删除快捷键
    if (e.key === 'Delete') {
      e.preventDefault();
      handleMenuAction({ type: 'delete' }, selectedBox);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedBox, editingLabel, handleMenuAction]);
```

### 5. 边界智能检测

**说明**：使用 `ContextMenu` 组件时，Radix UI 会自动处理边界检测和智能定位，无需手动实现。菜单会自动：

- 避免超出屏幕右侧
- 避免超出屏幕底部
- 在空间不足时自动调整方向

---

## 关键实现要点

### 1. 编辑状态冲突处理

当用户正在编辑标签时（输入框打开），需要阻止右键菜单：

```tsx
const handleContextMenu = useCallback((e: React.MouseEvent) => {
  // 如果正在编辑标签，阻止右键菜单
  if (editingLabel) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
}, [editingLabel]);
```

### 2. 输入框自动聚焦

选择"重命名"后，输入框应该自动获得焦点：

```tsx
const startEditingLabel = useCallback((boxId: string) => {
  const currentLabel = iconLabels.get(boxId) || '';
  setEditingLabel(boxId);
  setLabelInput(currentLabel);
  setLabelError('');

  // 自动聚焦到输入框（通过 useEffect 实现）
  requestAnimationFrame(() => {
    const input = document.querySelector(`[data-input-box-id="${boxId}"]`) as HTMLInputElement;
    input?.focus();
    input?.select();
  });
}, [iconLabels]);
```

### 3. 全局快捷键禁用

输入框打开时，禁用 Delete、F2、Ctrl+R 快捷键：

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // 只在有选中图标时响应
    if (!selectedBox) return;

    // 输入框打开时，禁用全局快捷键
    if (editingLabel) return;

    // ... 快捷键处理
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedBox, editingLabel, handleMenuAction]);
```

### 4. 空标签处理

当用户清空标签文本时，删除标签：

```tsx
const saveLabel = useCallback((boxId: string) => {
  const error = validateLabel(labelInput, boxId);
  if (error) {
    setLabelError(error);
    return;
  }

  if (labelInput.trim()) {
    // 保存标签
    setIconLabel(boxId, labelInput.trim());
  } else {
    // 清空标签 → 删除标签
    removeIconLabel(boxId);
  }

  setEditingLabel(null);
}, [labelInput, validateLabel, setIconLabel, removeIconLabel]);
```

### 5. 焦点管理

确保菜单关闭后焦点返回到边界框：

```tsx
// IconContextMenu 组件中
<ContextMenuItem
  onClick={() => {
    handleAction(item.action.type);
    // ContextMenu 会自动处理焦点返回
  }}
>
```

### 6. 快捷键平台适配

检测用户平台并显示正确的快捷键提示：

```tsx
const getShortcutDisplay = (baseShortcut: string): string => {
  if (baseShortcut === 'F2 / ⌘R') {
    return navigator.platform.includes('Mac') ? 'F2 / ⌘R' : 'F2 / Ctrl+R';
  }
  return baseShortcut;
};
```

---

## 扩展指南

### 添加新菜单项

#### 步骤 1：更新配置

```typescript
// menuConfig.ts
export const CONTEXT_MENU_ITEMS: MenuItemConfig[] = [
  // ... 现有项
  {
    id: 'preview',
    label: '预览',
    icon: Eye,
    action: { type: 'custom', handler: () => showPreview() },
    shortcut: 'P',
    group: 'view',
  },
];
```

#### 步骤 2：添加操作处理

```tsx
// 在 handleMenuAction 中添加新的 case
const handleMenuAction = useCallback(
  (action: MenuAction, boxId: string) => {
    switch (action.type) {
      // ... 现有 case
      case 'custom':
        action.handler();
        break;
    }
  },
  [/* 依赖项 */]
);
```

### 添加菜单分组

```typescript
interface MenuGroup {
  id: string;
  label?: string;  // 可选的分组标题
  items: MenuItemConfig[];
}

export const CONTEXT_MENU_GROUPS: MenuGroup[] = [
  {
    id: 'edit',
    label: '编辑',
    items: [
      { id: 'rename', label: '重命名', icon: Edit, ... },
      { id: 'duplicate', label: '复制', icon: Copy, ... },
    ],
  },
  {
    id: 'actions',
    label: '操作',
    items: [
      { id: 'delete', label: '删除', icon: Trash2, ... },
    ],
  },
];
```

### 条件显示菜单项

```typescript
// 动态过滤菜单项
const getAvailableMenuItems = (
  boxId: string,
  config: MenuItemConfig[]
): MenuItemConfig[] => {
  return config.filter((item) => {
    // 示例：已删除的图标不显示删除选项
    if (item.id === 'delete' && isBoxDeleted(boxId)) {
      return false;
    }

    // 示例：只有已矢量化的图标显示导出选项
    if (item.id === 'export' && !isVectorized(boxId)) {
      return false;
    }

    return true;
  });
};
```

---

## 测试要点

### 功能测试

- [ ] 右键点击边界框能正确打开菜单
- [ ] 右键点击空白区域不打开菜单
- [ ] 菜单位置正确（鼠标指针位置）
- [ ] 菜单在屏幕边缘时正确调整位置
- [ ] 点击菜单项执行对应操作
- [ ] 点击菜单外部关闭菜单
- [ ] 按 ESC 关闭菜单
- [ ] 全局只显示一个菜单（打开新菜单时关闭旧菜单）

### 交互测试

- [ ] 右键未选中的图标 → 自动选中并打开菜单
- [ ] 右键已选中的图标 → 直接打开菜单
- [ ] 重命名操作集成到撤销历史
- [ ] 删除操作集成到撤销历史
- [ ] 快捷键（F2、Delete、Enter）正确工作
- [ ] 输入框显示在边界框上方

### 键盘导航测试

- [ ] 上下箭头在菜单项间导航
- [ ] Enter 执行选中项
- [ ] ESC 关闭菜单
- [ ] 菜单打开时按其他键不触发全局快捷键

### 可访问性测试

- [ ] 完整的键盘导航支持
- [ ] 屏幕阅读器正确读出菜单项
- [ ] 焦点管理正确
- [ ] ARIA 标签正确

### 边界情况测试

- [ ] 多次快速右键不同图标
- [ ] 右键时图标正在被拖拽
- [ ] 右键时正在编辑标签
- [ ] 删除最后一个边界框
- [ ] 所有图标都被删除后右键

### 性能测试

- [ ] 菜单打开响应时间 < 100ms
- [ ] 菜单关闭动画流畅（60fps）
- [ ] 大量边界框时菜单性能不受影响

---

## 实施计划

### Phase 1: 核心功能（必须）

1. ✅ 从 shadcn/ui 添加 `ContextMenu` 组件
   ```bash
   npx shadcn@latest add context-menu
   ```
2. ✅ 创建 `IconContextMenu.tsx` 组件
3. ✅ 创建 `menuConfig.ts` 配置文件
4. ✅ 修改 `BoundingBoxEditor.tsx`：
   - 移除直接点击标签编辑功能
   - 添加 ContextMenuTrigger
   - 嵌入 IconContextMenu 组件
   - 处理编辑状态冲突（输入框打开时阻止右键菜单）
5. ✅ 实现重命名和删除操作
6. ✅ 集成撤销/重做系统
7. ✅ 实现全局快捷键（F2、Ctrl+R、Delete）

### Phase 2: 增强功能（重要）

1. ⬜ 输入框自动聚焦和全选文本
2. ⬜ 快捷键平台适配（Mac 显示 ⌘，Windows/Linux 显示 Ctrl）
3. ⬜ 空标签处理（清空时删除标签）
4. ⬜ 菜单动画优化（150ms 淡入淡出）
5. ⬜ 焦点管理优化

### Phase 3: 优化功能（可选）

1. ⬜ 添加更多菜单项（复制、预览、导出等）
2. ⬜ 实现菜单分组
3. ⬜ 添加菜单项禁用逻辑（条件显示）
4. ⬜ 移动端支持（长按触发右键菜单）
5. ⬜ 添加操作确认提示（Toast）

---

## Review 总结

### 关键决策点

基于需求访谈，确定了以下关键技术决策：

1. **组件选择**：使用 Radix UI 的 `ContextMenu` 组件而非 `DropdownMenu`
   - 更符合右键菜单的交互模式
   - 内置防止默认右键菜单功能
   - 自动处理定位和边界检测

2. **快捷键策略**：
   - `F2`：Windows/Linux 传统重命名快捷键
   - `Ctrl+R`：跨平台一致的重命名快捷键
   - `Delete`：删除图标
   - 输入框打开时禁用所有快捷键

3. **编辑状态管理**：
   - 完全移除直接点击标签编辑功能
   - 输入框打开时阻止右键菜单
   - 空标签文本 → 删除标签

4. **焦点管理**：
   - 选择"重命名"后输入框自动聚焦
   - 菜单关闭后焦点返回到边界框
   - ContextMenu 自动处理焦点返回

5. **删除操作**：
   - 直接删除（无确认对话框）
   - 依赖撤销功能（Ctrl+Z）

### 实现复杂度评估

- **技术难度**：中等（使用现成组件降低难度）
- **开发时间**：2-3 天（Phase 1）
- **潜在风险**：
  - ContextMenu 组件可能需要额外安装
  - 输入框自动聚焦可能需要 requestAnimationFrame
  - 快捷键冲突处理需要仔细测试

### 建议优先级

**立即实施**（Phase 1）：
- 核心右键菜单功能
- 重命名和删除操作
- 撤销/重做集成
- 全局快捷键

**后续优化**（Phase 2）：
- 自动聚焦和快捷键优化
- 平台适配
- 用户体验细节

**未来扩展**（Phase 3）：
- 更多菜单项
- 高级交互功能

---

## 相关文件

- `src/components/ui/context-menu/` - ContextMenu 组件（需要添加）
- `src/components/workbench/BoundingBoxEditor.tsx` - 主要修改
- `src/components/workbench/IconContextMenu.tsx` - 新建
- `src/components/workbench/menuConfig.ts` - 新建
- `docs/CONTEXT_MENU_SPEC.md` - 本文档

---

**最后更新**: 2026-01-13 (经过详细Review)
**版本**: 2.0
**作者**: Claude Code
