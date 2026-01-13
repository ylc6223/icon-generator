# VTracer WASM 集成指南

## 当前状态

✅ 已克隆 vtracer 仓库到 `tmp/vtracer`
⏳ 正在安装 wasm-pack...
⏳ 等待构建 WASM...

## VTracer 彩色矢量化功能

VTracer 支持两种矢量化模式：

### 1. 二值图像矢量化 (Binary)
- 仅处理黑白图像
- 生成单色 SVG
- 当前 `vectortracer` npm 包仅支持此模式

### 2. 彩色图像矢量化 (Color) ✨
- 支持全彩色图像
- 生成多层彩色 SVG
- 保持原始颜色信息
- **这是我们需要的！**

## 构建步骤

```bash
# 1. 安装 wasm-pack (已完成)
cargo install wasm-pack

# 2. 克隆仓库 (已完成)
git clone https://github.com/visioncortex/vtracer.git tmp/vtracer

# 3. 构建 WASM (在 webapp 目录)
cd tmp/vtracer/webapp
wasm-pack build --target web

# 4. 复制到项目
mkdir -p public/wasm
cp pkg/vtracer_bg.wasm public/wasm/
cp pkg/vtracer_bg.js public/wasm/
cp pkg/vtracer.js public/wasm/
cp pkg/vtracer.d.ts public/wasm/
```

## API 使用

```typescript
// 加载 vtracer WASM 模块
import init, { image_to_svg } from './wasm/vtracer.js';

// 初始化 WASM
await init();

// 转换图像为彩色 SVG
const svg = image_to_svg(
  imageData,  // ImageData 对象
  {
    // 彩色模式参数
    color_count: 16,        // 颜色数量
    min_area: 16,           // 最小区域
    blur_radius: 0,         // 模糊半径
    stroke_width: 0,        // 描边宽度

    // 其他参数
    simplify_threshold: 2.0,  // 简化阈值
    splice_threshold: 20,     // 拼接阈值
    corner_threshold: 0.5,    // 角点阈值
  }
);
```

## 与当前代码的对比

### 当前 (vectortracer npm 包)
```typescript
import { BinaryImageConverter } from "vectortracer"
// ❌ 仅支持二值图像
// ❌ 只能生成黑色 SVG
```

### 新方案 (官方 vtracer WASM)
```typescript
import { image_to_svg } from './wasm/vtracer.js'
// ✅ 支持彩色图像
// ✅ 保持原始颜色
// ✅ 更好的质量
```

## 预期效果

- **之前**: 导出的图标全是黑色的 ❌
- **之后**: 导出的图标保持原始颜色 ✨

## 参考资料

- [VTracer GitHub](https://github.com/visioncortex/vtracer)
- [VTracer 在线 Demo](https://www.visioncortex.org/vtracer/)
- [文档](https://www.visioncortex.org/vtracer-docs/)
