# 图标选择功能技术规范

**文档版本**: 1.1
**创建日期**: 2025-01-13
**最后更新**: 2025-01-13
**状态**: 待实现

---

## 1. 功能概述

为图标工作台添加图标选择功能，允许用户从检测到的图标网格中选择性地导出部分图标，而不是导出所有图标。

### 核心价值
- 用户可以精确控制哪些图标被导出
- 支持批量操作提高效率
- 清晰的视觉反馈和状态管理

---

## 2. 数据模型变更

### 2.1 BoundingBox 接口扩展

**文件**: `src/stores/workbench-store.ts`

```typescript
export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: string;
  selected: boolean;  // 新增：图标是否被选中
}
```

### 2.2 Store 新增方法

**文件**: `src/stores/workbench-store.ts`

```typescript
export interface WorkbenchState {
  // 现有字段...

  // 选择操作
  toggleIconSelection: (id: string) => void;
  selectAllIcons: () => void;
  deselectAllIcons: () => void;

  // 导出控制
  getSelectedIconCount: () => number;
  hasSelectedIcons: () => boolean;
}
```

**实现细节**:
- `toggleIconSelection`: 切换指定图标的选中状态
- `selectAllIcons`: 将所有边界框的 `selected` 设置为 `true`
- `deselectAllIcons`: 将所有边界框的 `selected` 设置为 `false`
- `getSelectedIconCount`: 返回选中图标的数量
- `hasSelectedIcons`: 返回是否有至少一个图标被选中

---

## 3. UI/UX 设计规范

### 3.1 左侧资源面板（AssetsPanel）

**文件**: `src/components/workbench/AssetsPanel.tsx`

#### 布局结构
```
┌─────────────────────────┐
│ 资源面板                │
├─────────────────────────┤
│ 源图片                  │
│ [上传区域]              │
├─────────────────────────┤
│ 图标列表                │
│ ┌───┬───┬───┐          │
│ │ 1 │ 2 │ 3 │  2-3列固定  │
│ ├───┼───┼───┤  布局       │
│ │ 4 │ 5 │ 6 │  动态调整   │
│ └───┴───┴───┘  卡片大小   │
│                         │
│ [全选] [取消全选]       │
│ 已选择 3/16 个图标       │
└─────────────────────────┘
```

#### 3.1.1 图标卡片设计

**新组件**: `src/components/workbench/IconGridCard.tsx`

```typescript
interface IconGridCardProps {
  box: BoundingBox;
  index: number;
  onToggle: (id: string) => void;  // 切换选中状态
}
```

**交互行为**:
- 点击卡片只切换选中状态，**不**改变画布预览
- 用户需要单独点击画布边界框来查看预览

**视觉规范**:

1. **卡片状态**
   - 未选中: 灰色边框 (`border-border`)
   - 选中: 蓝色边框 + 蓝色背景 (`border-primary bg-accent`)
   - Hover: 提升 0.5px + 阴影效果

2. **选中指示器**
   - 右上角圆形复选框（5x5）
   - 选中时显示蓝色背景 + 白色对勾图标
   - 未选中时半透明，hover时完全显示

3. **卡片内容**
   - 图标预览图（`object-contain`，`image-rendering: pixelated`）
   - 标签预览（如果已设置标签，在左上角小字显示）
   - 尺寸信息（底部小字显示，如"64x64"）

4. **动态网格大小**
   - 图标数量 ≤ 9: 卡片较大（约 120px）
   - 图标数量 10-25: 卡片中等（约 100px）
   - 图标数量 > 25: 卡片较小（约 80px）

#### 3.1.2 批量操作按钮

**位置**: 图标网格下方

```tsx
<div className="flex gap-2 mt-4">
  <Button onClick={selectAllIcons} size="sm">
    全选
  </Button>
  <Button onClick={deselectAllIcons} size="sm" variant="outline">
    取消全选
  </Button>
</div>
```

#### 3.1.3 选择统计信息

**位置**: 批量操作按钮下方

```tsx
<div className="mt-3 text-center">
  <p className="text-sm text-muted-foreground">
    已选择 {selectedCount}/{totalCount} 个图标
  </p>
  {selectedCount > 0 && (
    <p className="text-xs text-primary mt-1">
      ({Math.round((selectedCount / totalCount) * 100)}%)
    </p>
  )}
</div>
```

---

### 3.2 画布区域（BoundingBoxEditor）

**文件**: `src/components/workbench/BoundingBoxEditor.tsx`

#### 边界框视觉区分

**选中状态样式**:
- 边框颜色: 主题色（蓝色，`rgba(59, 130, 246, 0.8)`）
- 边框样式: 实线（`stroke-dasharray="0"`）
- 阴影效果: 添加柔和阴影

**未选中状态样式**:
- 边框颜色: 灰色（`rgba(156, 163, 175, 0.6)`）
- 边框样式: 虚线（`stroke-dasharray="5,5"`）
- 无阴影效果

**交互行为**:
- 点击边界框只切换预览，**不改变选中状态**
- 选中状态的改变只能通过左侧面板

---

### 3.3 右侧预览面板（IconPreviewPanel）

**文件**: `src/components/workbench/IconPreviewPanel.tsx`

#### 预览面板头部新增

```tsx
<div className="flex items-center justify-between">
  <div className="flex-1 min-w-0">
    <p className="text-body-sm font-medium">
      {label || selectedBoundingBox.id}
    </p>
    <p className="text-body-sm text-muted-foreground">
      {selectedBoundingBox.width} × {selectedBoundingBox.height}px
    </p>
  </div>
  {/* 新增：选中状态指示 */}
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground">
      {selectedBoundingBox.selected ? '已选中' : '未选中'}
    </span>
    <div className={cn(
      "w-3 h-3 rounded-full",
      selectedBoundingBox.selected ? "bg-primary" : "bg-muted"
    )} />
  </div>
</div>
```

---

### 3.4 顶部栏（TopBar）

**文件**: `src/components/workbench/TopBar.tsx`

#### 导出按钮逻辑

```tsx
const canExport = hasSelectedIcons();

<Button
  onClick={handleExport}
  disabled={!canExport || isProcessing}
>
  {canExport
    ? `导出 SVG (${getSelectedIconCount()}个)`
    : '请选择图标'
  }
</Button>
```

**禁用状态提示**:
- 当 `!canExport` 时显示 tooltip: "请至少选择 1 个图标"

---

## 4. 导出流程

### 4.1 导出过滤

**文件**: `src/lib/icon-processor.ts`

修改 `exportIconsAsZip` 函数签名和实现：

```typescript
export interface ExportResult {
  blob: Blob;
  successCount: number;
  skippedCount: number;
}

export async function exportIconsAsZip(
  boxes: BoundingBox[],
  vectorizedIcons: Map<string, VectorizationResult>,
  iconLabels: Map<string, string>
): Promise<ExportResult> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // 只导出选中的图标
  const selectedBoxes = boxes.filter(box => box.selected);

  if (selectedBoxes.length === 0) {
    throw new Error('未选择任何图标');
  }

  let successCount = 0;
  let skippedCount = 0;

  for (const box of selectedBoxes) {
    try {
      let result = vectorizedIcons.get(box.id);

      if (!result && box.imageData) {
        result = await vectorizeIcon(box.imageData);
      }

      if (result) {
        // 使用标签作为文件名，未标签的使用ID
        const fileName = (iconLabels.get(box.id) || box.id) + '.svg';
        zip.file(fileName, result.svg);
        successCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`图标 ${box.id} 矢量化失败:`, error);
      skippedCount++;
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });

  return { blob, successCount, skippedCount };
}
```

### 4.2 导出进度显示

**文件**: `src/components/workbench/TopBar.tsx`

```tsx
const handleExport = async () => {
  if (!canExport) return;

  const selectedCount = getSelectedIconCount();

  toast({
    title: '开始导出',
    description: `正在导出 ${selectedCount} 个图标...`,
  });

  try {
    setProcessing(true, 'exporting', 0);

    const { blob, successCount, skippedCount } = await exportIconsAsZip(
      boundingBoxes.filter(b => b.selected),
      vectorizedIcons,
      iconLabels
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
    }
  } catch (error) {
    toast({
      title: '导出失败',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setProcessing(false, 'exporting', 100);
  }
};
```

### 4.3 导出锁定

**导出进行中**:
- 禁用所有选择操作按钮
- 禁用网格设置修改
- 禁用边界框编辑
- 显示进度提示："正在导出，请稍候..."

---

## 5. 初始状态与默认行为

### 5.1 显式选择模式

**规则**:
- 新上传图片时，所有图标 `selected = false`
- 用户必须主动选择图标才能导出
- 导出按钮默认禁用，显示"请选择图标"

### 5.2 网格重置行为

**触发场景**: 用户修改网格设置（如 4x4 → 5x5）

**处理逻辑**:
```typescript
const handleGridSizeChange = (rows: number, cols: number) => {
  setGridSize(rows, cols);
  // 清空所有选中状态
  deselectAllIcons();
  // 重新检测边界框
};
```

---

## 6. 性能优化策略

### 6.1 选择操作优化

**场景**: 用户快速点击多个图标进行选择/取消

**方案**: **状态立即更新**

**实现**:
```typescript
toggleIconSelection: (id: string) => set((state) => ({
  boundingBoxes: state.boundingBoxes.map((box) =>
    box.id === id ? { ...box, selected: !box.selected } : box
  ),
}))
```

**说明**:
- 选中状态的改变不涉及图像处理，可以直接更新
- 不需要重新生成 imageData（imageData 只在边界框位置/尺寸改变时更新）
- Zustand 的状态更新已经是优化过的，性能足够好

### 6.2 动态网格实现

**方案**: 根据图标数量动态调整卡片大小

**实现**:
```tsx
const iconCount = boundingBoxes.length;
const gridCols = iconCount <= 9 ? 2 : iconCount <= 25 ? 3 : 4;
const cardSize = iconCount <= 9 ? 120 : iconCount <= 25 ? 100 : 80;

<div
  className="grid gap-2"
  style={{
    gridTemplateColumns: `repeat(${gridCols}, ${cardSize}px)`,
  }}
>
  {boundingBoxes.map((box, index) => (
    <IconGridCard
      key={box.id}
      box={box}
      index={index}
      onToggle={toggleIconSelection}
    />
  ))}
</div>
```

### 6.3 大量图标处理

**场景**: 8x8 网格 = 64 个图标

**优化方案**:
1. **虚拟滚动**: 只渲染可见区域的图标卡片
2. **懒加载**: 图标预览图按需加载
3. **分页显示**: 超过 32 个图标时分页

**推荐**: 对于 MVP 阶段，使用**动态网格大小**方案（已选择）

---

## 7. 标签与选择的关系

### 7.1 独立操作

**规则**:
- 设置标签**不会**自动选中图标
- 选中图标**不会**自动设置标签
- 两者完全独立，互不影响

**示例场景**:
1. 用户可以给图标命名但不导出（选中=false，有标签）
2. 用户可以导出图标但不命名（选中=true，无标签）

---

## 8. 边界情况处理

### 8.1 未选择任何图标

**导出按钮**:
- 禁用状态
- Tooltip 提示: "请至少选择 1 个图标"

**批量操作**:
- "取消全选"按钮禁用（已经没有选中的）

### 8.2 矢量化失败

**处理策略**: 跳过并警告

**实现**:
```typescript
try {
  // 矢量化...
  successCount++;
} catch (error) {
  console.error(`图标 ${box.id} 失败:`, error);
  skippedCount++;
}

// 最后显示警告
if (skippedCount > 0) {
  toast({
    title: '部分图标导出失败',
    description: `${skippedCount} 个图标跳过，${successCount} 个成功`,
    variant: 'destructive',
  });
}
```

### 8.3 刷新页面

**行为**: 仅内存存储

**实现**:
- 不使用 `localStorage` 持久化
- 刷新后所有状态重置
- 用户提供"保存配置"的扩展功能（未来）

---

## 9. 响应式设计

### 9.1 小屏幕适配（平板/手机）

**左侧面板**: 抽屉式

**导入组件**:
```tsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
```

**实现**:
```tsx
// 小屏幕上隐藏面板，用汉堡菜单打开
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-80">
    <AssetsPanel />
  </SheetContent>
</Sheet>
```

**图标网格**:
- 保持 2 列布局
- 卡片大小适配屏幕宽度（使用 `w-full` 和百分比）

---

## 10. 实现优先级

### Phase 1: 核心功能（MVP）
- [x] 数据模型：添加 `selected` 字段
- [x] Store 方法：选择/全选/取消全选
- [x] 左侧面板：图标网格卡片
- [x] 画布：边界框视觉区分
- [x] 导出：过滤选中的图标
- [x] 导出按钮：禁用逻辑

### Phase 2: 增强 UX
- [ ] 选择统计信息
- [ ] 导出进度提示
- [ ] 错误处理（矢量化失败）
- [ ] 性能优化（防抖）

### Phase 3: 高级功能
- [ ] 区域选择（如"选择前3行"）
- [ ] 状态持久化
- [ ] 撤销/重做支持

---

## 11. 技术注意事项

### 11.1 类型安全

确保所有新函数都有完整的 TypeScript 类型定义：

```typescript
toggleIconSelection: (id: string) => void;
selectAllIcons: () => void;
deselectAllIcons: () => void;
getSelectedIconCount: () => number;
hasSelectedIcons: () => boolean;
```

### 11.2 状态同步

关键：确保画布和左侧面板的状态同步

```typescript
// 点击边界框（画布）
const handleBoxClick = (box: BoundingBox) => {
  // 只切换预览，不改变选中状态
  onBoxSelect(box.id);
};

// 点击卡片（左侧面板）
const handleCardClick = (box: BoundingBox) => {
  // 只切换选中状态，不切换预览
  toggleIconSelection(box.id);
};
```

**说明**:
- 画布和左侧面板的操作是分离的
- 画布用于预览和编辑边界框
- 左侧面板用于选择要导出的图标
- 两个区域可以独立操作，互不影响

### 11.3 性能监控

使用 React DevTools Profiler 监控：
- 图标卡片渲染性能
- 批量选择操作的响应时间
- 导出操作的内存使用

---

## 12. 测试清单

### 功能测试
- [ ] 单击图标卡片可以选中/取消
- [ ] 全选按钮选中所有图标
- [ ] 取消全选按钮取消所有图标
- [ ] 选中统计正确显示
- [ ] 导出按钮在没有选中时禁用
- [ ] 导出只包含选中的图标
- [ ] 修改网格设置清空选中状态

### 视觉测试
- [ ] 选中的边界框显示蓝色实线
- [ ] 未选中的边界框显示灰色虚线
- [ ] 图标卡片选中状态清晰可辨
- [ ] Hover 效果流畅

### 性能测试
- [ ] 64 个图标快速选择无卡顿
- [ ] 导出 32 个图标在合理时间内完成
- [ ] 页面刷新后状态正确重置

### 边界情况
- [ ] 未选择任何图标导出被禁用
- [ ] 部分图标矢量化失败时正确跳过
- [ ] 标签和选中状态独立工作

---

## 13. 参考资源

### 参考实现
- `src/reference/enter_AIIcon/src/components/workbench/IconPreviewCard.tsx`
- `src/reference/enter_AIIcon/src/stores/workbench-store.ts`

### 设计系统
- Shadcn/ui 组件库
- Tailwind CSS 工具类
- 项目设计令牌（`src/index.css`）

---

## 14. 变更日志

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2025-01-13 | 1.0 | 初始版本，完成需求访谈和规范定义 |
| 2025-01-13 | 1.1 | 审阅后修正：1) 明确卡片点击行为（仅切换选中） 2) 导出函数返回详细统计 3) 补充动态网格实现 4) 补充 Sheet 组件导入 5) 删除混淆的 imageData 说明 |

---

## 附录：用户访谈关键决策

### 决策记录

1. **选择模式**: 显式选择模式（默认全部未选中）
2. **初始状态**: 新上传图片时所有图标未选中
3. **批量操作**: 全选 + 取消全选
4. **视觉区分**: 蓝色实线（选中）vs 灰色虚线（未选中）
5. **画布交互**: 点击只切换预览，不改变选中状态
6. **卡片交互**: 点击卡片只切换选中状态，不切换预览（分离操作）
7. **导出反馈**: 详细统计 "已选择 X/共 Y 个图标"
8. **导出返回值**: 返回详细统计 {blob, successCount, skippedCount}
9. **网格布局**: 2-3 列固定，卡片大小动态调整
10. **卡片信息**: 标签预览 + 尺寸信息
11. **导出命名**: 标签优先，无标签使用 ID
12. **重置行为**: 修改网格设置时清空选择
13. **性能优化**: 状态立即更新，无需防抖
14. **状态持久化**: 仅内存，不使用 localStorage
15. **错误处理**: 跳过失败的图标并警告
16. **导出锁定**: 导出时完全锁定所有操作
17. **标签独立**: 标签和选中状态完全独立
18. **删除边界框**: 暂时不考虑此功能
19. **撤销重做**: 现阶段不考虑
20. **左侧布局**: 上下结构（上传区 + 图标列表）
21. **响应式**: 抽屉式侧边栏
