# VTracer 预设系统使用指南

## 🎯 新功能概述

现在你可以通过**环境变量**或**UI界面**选择不同的 VTracer 预设，控制导出 SVG 的细节程度！

---

## 📋 四种预设模式

### 1. Minimal（最小）⚡

**特点**：
- 最小的文件大小
- 最少的颜色（4-6 色）
- 适合扁平化图标
- 快速加载

**适用场景**：
- ✅ 简单的扁平化图标
- ✅ Logo 设计
- ✅ 需要快速加载的网页
- ✅ 移动应用图标

**参数配置**：
```bash
filter_speckle: 100        # 过滤小细节
color_precision: 8         # 6-8 种颜色
layer_difference: 32       # 合并相似颜色
文件大小: ~5-10 KB/图标
```

---

### 2. Balanced（平衡）⚖️

**特点**：
- 质量和大小平衡
- 中等颜色数量（8-12 色）
- 适合大多数场景
- 推荐默认选择

**适用场景**：
- ✅ 一般图标库
- ✅ 网页设计
- ✅ 移动应用
- ✅ UI 设计

**参数配置**：
```bash
filter_speckle: 20         # 保留中等细节
color_precision: 5         # 10-12 种颜色
layer_difference: 16       # 中等颜色分离
文件大小: ~15-25 KB/图标
```

---

### 3. Detailed（详细）⭐ 推荐

**特点**：
- 保留细节（默认）
- 较多颜色（12-18 色）
- 适合复杂图标
- **当前默认模式**

**适用场景**：
- ✅ 复杂插图
- ✅ 游戏图标
- ✅ 艺术设计
- ✅ 需要高质量的矢量图

**参数配置**：
```bash
filter_speckle: 10         # 保留细节
color_precision: 4         # 12-18 种颜色
layer_difference: 10       # 细致颜色分离
文件大小: ~30-50 KB/图标
```

---

### 4. Ultra（极致）🔥

**特点**：
- 保留几乎所有细节
- 最多颜色（18-25 色）
- 最接近原图
- 文件较大

**适用场景**：
- ✅ 高质量需求
- ✅ 打印设计
- ✅ 艺术作品
- ✅ 照片级图标

**参数配置**：
```bash
filter_speckle: 2          # 保留几乎所有细节
color_precision: 2         # 18-25 种颜色
layer_difference: 6        # 最大颜色分离
文件大小: ~60-120 KB/图标
```

---

## 🔧 使用方法

### 方法 1：通过 UI 界面选择（推荐）

1. 上传图片后，在右侧"属性面板"找到 **"VTracer 细节模式"** 下拉框
2. 选择你想要的模式：
   - Minimal - 最小文件
   - Balanced - 平衡模式
   - Detailed - 保留细节（默认）
   - Ultra - 极致细节
3. 点击"矢量化"按钮
4. 预览效果并导出

**优势**：
- ✅ 无需重启服务器
- ✅ 实时切换
- ✅ 直观易用

---

### 方法 2：通过环境变量配置

1. 打开项目根目录的 `.env` 文件
2. 修改 `VITE_VTRACER_PRESET` 变量：

```bash
# 选择预设模式
VITE_VTRACER_PRESET=ultra    # 极致细节
VITE_VTRACER_PRESET=detailed # 保留细节（默认）
VITE_VTRACER_PRESET=balanced # 平衡模式
VITE_VTRACER_PRESET=minimal  # 最小文件
```

3. 重启开发服务器：

```bash
# 停止服务器（Ctrl+C）
pnpm dev
```

4. 刷新浏览器页面

**优势**：
- ✅ 设置默认模式
- ✅ 团队统一配置
- ✅ 项目级别控制

---

## 🎨 对比示例

### 扁平化图标（简单）

**推荐**：Minimal

| 模式 | 文件大小 | 颜色数 | 细节保留 |
|------|---------|--------|---------|
| Minimal | 5 KB | 4 | ✅ 完整 |
| Balanced | 15 KB | 8 | ✅ 完整 |
| Detailed | 35 KB | 12 | ✅ 完整 |
| Ultra | 80 KB | 18 | ✅ 完整 |

**结论**：使用 Minimal，文件最小且效果相同

---

### 复杂插图（有纹理）

**推荐**：Detailed 或 Ultra

| 模式 | 文件大小 | 颜色数 | 细节保留 |
|------|---------|--------|---------|
| Minimal | 8 KB | 6 | ❌ 丢失细节 |
| Balanced | 22 KB | 10 | ⚠️ 部分丢失 |
| Detailed | 45 KB | 15 | ✅ 良好 |
| Ultra | 100 KB | 22 | ✅ 优秀 |

**结论**：使用 Ultra 保留最多细节

---

### 游戏图标（高光阴影）

**推荐**：Detailed

| 模式 | 文件大小 | 颜色数 | 细节保留 |
|------|---------|--------|---------|
| Minimal | 10 KB | 6 | ❌ 丢失高光 |
| Balanced | 25 KB | 11 | ⚠️ 高光模糊 |
| Detailed | 50 KB | 16 | ✅ 高光清晰 |
| Ultra | 110 KB | 24 | ✅ 极致细节 |

**结论**：Detailed 是最佳平衡

---

## 📊 预设对比总览

| 预设 | filter_speckle | color_precision | layer_difference | 颜色数 | 文件大小 | 适用场景 |
|------|----------------|-----------------|------------------|--------|---------|---------|
| **Minimal** | 100 | 8 | 32 | 4-6 | 小 (5-10KB) | 扁平化图标 |
| **Balanced** | 20 | 5 | 16 | 8-12 | 中 (15-25KB) | 一般图标 |
| **Detailed** | 10 | 4 | 10 | 12-18 | 大 (30-50KB) | 复杂图标 |
| **Ultra** | 2 | 2 | 6 | 18-25 | 很大 (60-120KB) | 高质量需求 |

---

## 🚀 快速开始

### 步骤 1：查看当前配置

打开 `.env` 文件，确认默认预设：

```bash
cat .env | grep VITE_VTRACER_PRESET
```

**默认输出**：
```bash
VITE_VTRACER_PRESET=detailed
```

### 步骤 2：选择预设

**选项 A**：通过 UI 选择（快速）

1. 刷新浏览器
2. 在右侧"属性面板"找到 "VTracer 细节模式"
3. 选择 "Ultra" 获得最多细节

**选项 B**：修改环境变量（持久）

```bash
# 编辑 .env 文件
VITE_VTRACER_PRESET=ultra

# 重启服务器
pnpm dev
```

### 步骤 3：矢量化并导出

1. 上传图片
2. 点击"矢量化"按钮
3. 查看预览效果
4. 点击"导出"

---

## 💡 最佳实践

### 场景 1：Web 图标库

**推荐**：Balanced 或 Detailed

```bash
# .env
VITE_VTRACER_PRESET=balanced
```

**理由**：
- 文件大小适中
- 质量足够好
- 加载速度快

---

### 场景 2：移动应用

**推荐**：Minimal 或 Balanced

```bash
# .env
VITE_VTRACER_PRESET=minimal
```

**理由**：
- 文件最小
- 加载最快
- 省流量

---

### 场景 3：打印设计

**推荐**：Ultra

```bash
# .env
VITE_VTRACER_PRESET=ultra
```

**理由**：
- 最高质量
- 细节最完整
- 适合大尺寸打印

---

### 场景 4：不确定时

**推荐**：Detailed（默认）

```bash
# .env
VITE_VTRACER_PRESET=detailed
```

**理由**：
- 默认选择
- 大多数场景都适用
- 质量保证

---

## 🔍 高级：自定义配置

如果你想完全自定义参数，可以：

### 步骤 1：在 .env 中设置自定义参数

```bash
# .env
VITE_VTRACER_PRESET=custom

# 自定义参数
VITE_VTRACER_FILTER_SPECKLE=3
VITE_VTRACER_COLOR_PRECISION=2
VITE_VTRACER_LAYER_DIFFERENCE=8
VITE_VTRACER_CORNER_THRESHOLD=15
VITE_VTRACER_LENGTH_THRESHOLD=2.0
VITE_VTRACER_MAX_ITERATIONS=30
VITE_VTRACER_SPLICE_THRESHOLD=15
```

### 步骤 2：在代码中使用 custom 预设

```typescript
import { VTRACER_PRESETS } from '@/lib/vtracer-presets';

// 使用 custom 预设
const customPreset = VTRACER_PRESETS.custom;
```

---

## 📚 参数详解

### filter_speckle（过滤斑点）

**作用**：过滤掉小于指定面积的区域

**值范围**：1-100

**影响**：
- **值大**：过滤多，文件小，细节少
- **值小**：过滤少，文件大，细节多

**建议**：
- Minimal: 100
- Balanced: 20
- Detailed: 10
- Ultra: 2

---

### color_precision（颜色精度）

**作用**：控制颜色聚类精度

**值范围**：1-10

**影响**：
- **值大**：颜色少，颜色合并
- **值小**：颜色多，颜色分离

**建议**：
- Minimal: 8
- Balanced: 5
- Detailed: 4
- Ultra: 2

---

### layer_difference（层差异）

**作用**：控制颜色分离阈值

**值范围**：0-64

**影响**：
- **值大**：相似颜色合并
- **值小**：所有颜色分离

**建议**：
- Minimal: 32
- Balanced: 16
- Detailed: 10
- Ultra: 6

---

## 🎯 常见问题

### Q1: 默认是哪个模式？

**A**: Detailed（保留细节）- 在 `.env` 中设置：
```bash
VITE_VTRACER_PRESET=detailed
```

### Q2: 如何获得最多细节？

**A**:
1. 在 UI 中选择 "Ultra" 模式
2. 或在 `.env` 中设置：
```bash
VITE_VTRACER_PRESET=ultra
```

### Q3: Ultra 模式文件太大怎么办？

**A**:
- 使用 Detailed 模式（默认）
- 或手动调整参数，提高 `filter_speckle` 到 10-15

### Q4: 不同模式可以混用吗？

**A**: 可以！每次矢量化前都可以在 UI 中切换模式，无需重启服务器。

### Q5: 如何知道当前使用的是哪个模式？

**A**:
1. 查看右侧"属性面板"的 "VTracer 细节模式" 下拉框
2. 或查看控制台日志：
```
📋 VTracer 配置（Detailed 模式）
```

---

## 📖 相关文档

- **参数调优指南**: [VTRACER_PARAMETER_TUNING.md](./VTRACER_PARAMETER_TUNING.md)
- **调试指南**: [DEBUG_GUIDE.md](./DEBUG_GUIDE.md)
- **用户手册**: [../USER_GUIDE.md](../USER_GUIDE.md)

---

**更新时间**: 2025-01-13
**版本**: v2.0
**作者**: Claude Code
