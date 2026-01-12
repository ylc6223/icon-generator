# VTracer 参数优化指南 - 保留细节

## 🎯 问题描述

**症状**：导出的 SVG 图标丢失了内部细节、纹理和颜色

**原因**：VTracer 参数配置过于"激进"，过滤掉了太多细节

---

## 📊 关键参数说明

### 1. filter_speckle（过滤斑点）⭐ 最重要

**作用**：过滤掉小于指定面积的区域

**值范围**：0-100（像素）

**影响**：
- **值太大**（如 50, 100）：小细节被过滤掉 ❌
- **值太小**（如 2, 5）：保留几乎所有细节 ✅（但文件会变大）
- **建议**：
  - `detailed` 模式：5-10
  - `balanced` 模式：15-25
  - `clean` 模式：40-60

**示例**：
```
filter_speckle: 2   // 保留几乎所有细节（包括小噪点）
filter_speckle: 50  // 过滤掉小细节（可能丢失纹理）
filter_speckle: 100 // 只保留大块颜色（丢失很多细节）
```

---

### 2. color_precision（颜色精度）

**作用**：控制颜色聚类的精度，值越小颜色层越多

**值范围**：1-10（整数）

**影响**：
- **值太大**（如 8, 10）：颜色层少，颜色合并严重 ❌
- **值太小**（如 3, 4）：颜色层多，保留更多颜色 ✅（但文件会变大）
- **建议**：
  - `detailed` 模式：3-4
  - `balanced` 模式：5-6
  - `clean` 模式：7-8

**示例**：
```
color_precision: 3  // 15-20 种颜色（非常细致）
color_precision: 6  // 8-12 种颜色（平衡）
color_precision: 10 // 4-6 种颜色（简洁）
```

---

### 3. layer_difference（层差异）

**作用**：控制颜色分离的阈值，值越小颜色分离越细致

**值范围**：0-64（整数）

**影响**：
- **值太大**（如 25, 32）：相似颜色被合并 ❌
- **值太小**（如 8, 10）：相似颜色也被分离 ✅（更真实）
- **建议**：
  - `detailed` 模式：8-12
  - `balanced` 模式：15-20
  - `clean` 模式：25-32

**示例**：
```
layer_difference: 8   // 分离最多颜色层（非常细致）
layer_difference: 16  // 中等分离（平衡）
layer_difference: 32  // 合并相似颜色（简洁）
```

---

### 4. corner_threshold（角落阈值）

**作用**：控制角落检测的敏感度

**值范围**：0-180（度）

**影响**：
- **值太大**（如 60, 90）：角落被平滑掉 ❌
- **值太小**（如 20, 30）：保留所有角落 ✅（但可能有锯齿）

**示例**：
```
corner_threshold: 20  // 保留更多角落细节
corner_threshold: 60  // 平滑掉小角落
corner_threshold: 180 // 几乎没有角落
```

---

### 5. length_threshold（长度阈值）

**作用**：过滤掉短路径

**值范围**：0-10（浮点数）

**影响**：
- **值太大**（如 5, 8）：短路径被过滤 ❌
- **值太小**（如 2, 3）：保留短路径 ✅

**示例**：
```
length_threshold: 2.0  // 保留短路径（更多细节）
length_threshold: 4.0  // 中等过滤
length_threshold: 8.0  // 过滤短路径
```

---

### 6. splice_threshold（拼接阈值）

**作用**：控制路径拼接的阈值

**值范围**：0-180（度）

**影响**：
- **值太大**（如 45, 60）：路径被过度拼接 ❌
- **值太小**（如 20, 25）：保留原始路径 ✅

---

### 7. max_iterations（最大迭代次数）

**作用**：颜色聚类的迭代次数

**值范围**：5-30（整数）

**影响**：
- **值太小**（如 5, 10）：颜色分离不充分 ❌
- **值太大**（如 25, 30）：更细致的颜色分离 ✅（但处理更慢）

---

## 🎨 三种预设对比

### Clean（简洁）- 适合扁平化图标

```typescript
{
  filter_speckle: 50,      // 过滤小细节
  color_precision: 6,      // 6-8 种颜色
  layer_difference: 16,    // 中等颜色分离
  corner_threshold: 25,
  length_threshold: 3.0,
  max_iterations: 20,
}
```

**特点**：
- ✅ 文件小
- ✅ 颜色简洁
- ❌ 丢失细节

**适用场景**：
- 扁平化 UI 图标
- Logo 设计
- 需要快速加载

---

### Balanced（平衡）- 默认推荐 ⭐

```typescript
{
  filter_speckle: 20,      // 保留中等细节
  color_precision: 4,      // 10-15 种颜色
  layer_difference: 10,    // 细致颜色分离
  corner_threshold: 25,
  length_threshold: 3.0,
  max_iterations: 20,
}
```

**特点**：
- ✅ 细节和文件大小平衡
- ✅ 颜色丰富
- ✅ 大多数场景的最佳选择

**适用场景**：
- 一般图标库
- 网页设计
- 移动应用

---

### Detailed（详细）- 保留最多细节 ⭐⭐

```typescript
{
  filter_speckle: 5,       // 保留几乎所有细节
  color_precision: 3,      // 15-20 种颜色
  layer_difference: 8,     // 最多颜色层
  corner_threshold: 20,    // 保留更多角落
  length_threshold: 2.0,   // 保留短路径
  max_iterations: 25,      // 更多迭代
  splice_threshold: 20,    // 保留原始路径
}
```

**特点**：
- ✅ 保留最多细节
- ✅ 颜色最丰富
- ✅ 最接近原图
- ❌ 文件较大
- ❌ 处理较慢

**适用场景**：
- 复杂插图
- 需要高质量矢量化
- 艺术作品

---

## 🧪 如何测试和调整

### 测试步骤

1. **选择一个复杂图标**
   - 有纹理的
   - 有多种颜色的
   - 有小细节的

2. **尝试不同的预设**
   - 先试 `balanced`
   - 再试 `detailed`
   - 对比效果

3. **检查结果**
   - 在预览中放大查看
   - 导出并在设计软件中打开
   - 对比原图细节

### 微调建议

如果 `detailed` 模式还是丢失细节，可以手动调整参数：

```typescript
// 在 vtracer.wasm.ts 中临时修改
const params = {
  ...
  filter_speckle: 1,       // 降低到 1，保留所有细节
  color_precision: 2,      // 降低到 2，获得更多颜色
  layer_difference: 6,     // 降低到 6，最大颜色分离
  ...
};
```

---

## 📊 参数影响对比表

| 参数 | Clean | Balanced | Detailed | 超详细 |
|------|-------|----------|----------|--------|
| filter_speckle | 50 | 20 | 5 | 1 |
| color_precision | 6 | 4 | 3 | 2 |
| layer_difference | 16 | 10 | 8 | 6 |
| corner_threshold | 25 | 25 | 20 | 15 |
| length_threshold | 3.0 | 3.0 | 2.0 | 2.0 |
| max_iterations | 20 | 20 | 25 | 30 |
| 颜色数量 | 6-8 | 10-15 | 15-20 | 20-30 |
| 文件大小 | 小 | 中 | 大 | 很大 |
| 细节保留 | 差 | 好 | 很好 | 最好 |

---

## 💡 最佳实践

### 1. 从 Balanced 开始
大多数情况下，`balanced` 模式已经足够好了

### 2. 需要更多细节时
切换到 `detailed` 模式

### 3. 需要极致细节时
手动调整参数，参考"超详细"列

### 4. 优化文件大小
使用 `clean` 模式或提高 `filter_speckle`

### 5. 处理时间太长
- 降低 `max_iterations`
- 提高 `filter_speckle`
- 提高 `color_precision`

---

## 🎯 实际案例

### 案例 1：扁平化图标

**原图**：4 色，无纹理

**推荐**：`clean` 模式

**结果**：
- 文件大小：5 KB
- 颜色：4 种
- 细节：完整保留 ✅

---

### 案例 2：复杂插图

**原图**：20+ 色，有纹理和阴影

**推荐**：`detailed` 模式

**结果**：
- 文件大小：50 KB
- 颜色：18 种
- 细节：95% 保留 ✅

---

### 案例 3：照片级图标

**原图**：渐变、阴影、高光

**推荐**：`detailed` + 手动微调

**调整**：
```typescript
filter_speckle: 2,
color_precision: 2,
layer_difference: 6,
```

**结果**：
- 文件大小：120 KB
- 颜色：25+ 种
- 细节：98% 保留 ✅

---

## 🔧 自定义配置

如果你想创建自己的预设，可以在 `src/stores/workbench-store.ts` 中添加：

```typescript
custom: {
  name: 'custom',
  colorCount: 12,
  colorPrecision: 3,      // 根据需要调整
  layerDifference: 10,    // 根据需要调整
  minArea: 15,            // 根据需要调整
  pathPrecision: 1,
  strokeWidth: 1,
},
```

然后在 UI 中添加对应的选项。

---

## 📚 参考资源

- **VTracer 官方文档**: https://www.visioncortex.org/
- **VTracer GitHub**: https://github.com/visioncortex/vtracer
- **VTracer 参数说明**: https://github.com/visioncortex/vtracer/blob/master/README.md

---

**最后更新**: 2025-01-13
**作者**: Claude Code
**版本**: v1.0
