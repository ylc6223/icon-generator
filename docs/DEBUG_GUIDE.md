# VTracer 调试指南

## 环境变量配置

### VITE_ENABLE_FALLBACK_VECTORIZER

**默认值**: `false` (关闭)

**说明**:
- 控制 VTracer WASM 失败时是否使用备用算法
- **重要**: 备用算法只支持**黑白**矢量化，不支持彩色
- 建议保持默认值 `false`，这样可以立即发现问题
- 如果设置为 `true`，VTracer 失败时会自动降级到黑白算法

**如何启用**:
```bash
# 方法 1: 创建 .env.local 文件
echo "VITE_ENABLE_FALLBACK_VECTORIZER=true" > .env.local

# 方法 2: 命令行临时启用
VITE_ENABLE_FALLBACK_VECTORIZER=true pnpm dev
```

**警告信息**:
```
⚠️ 备用算法已启用，降级到备用矢量化算法
```

---

## 问题描述

用户报告：
1. 点击"矢量化"按钮后，矢量化结果显示为空
2. 导出的图标仍然是黑白的

## 可能的原因

1. **VTracer WASM 初始化失败**
   - WASM 文件路径错误
   - WASM 文件加载失败
   - 初始化过程中抛出异常

2. **矢量化过程中出错**
   - Canvas/SVG 容器未找到
   - 图像加载失败
   - VTracer ColorImageConverter 创建失败
   - tick 循环处理出错

3. **ColorImageConverter 构造错误**（已修复）
   - 使用了错误的构造函数 `new ColorImageConverter()`
   - 应该使用静态方法 `ColorImageConverter.new_with_string()`

4. **Store 状态未正确更新**
   - 结果未正确保存到 Map
   - selectedBox ID 不匹配

## 已添加的调试日志

### 1. App.tsx 初始化日志

```
✅ VTracer 彩色矢量化已就绪
❌ VTracer 初始化失败: [错误信息]
```

### 2. icon-processor.ts 初始化日志

```
🔧 开始初始化 VTracer WASM...
✅ VTracer WASM 初始化成功
❌ VTracer WASM 初始化失败: [错误信息]
```

### 3. vtracer.wasm.ts 初始化日志

```
🔧 开始初始化 VTracer WASM...
📦 创建隐藏容器...
✅ 隐藏容器已创建
📦 加载 WASM 文件...
✅ WASM URL: [URL]
📦 导入 vtracer_webapp.js...
✅ vtracer_webapp.js 已加载
📦 初始化 WASM 模块...
✅ WASM 模块初始化成功
✅ VTracer WASM 模块加载成功（支持彩色矢量化）
```

### 4. TopBar 批量矢量化日志

```
🎯 开始矢量化...
图标数量: 16
使用的预设: { name: 'balanced', ... }
准备处理 16 个图标
矢量化进度: 1/16
矢量化进度: 2/16
...
✅ 矢量化完成！结果数量: 16
第一个结果预览: { svg: '...', pathCount: 10, fileSize: 1234, warnings: [] }
✅ 结果已保存到 store，Map 大小: 16
```

### 5. imageToSvg 矢量化日志

```
🎨 开始矢量化图像...
🔧 开始初始化 VTracer WASM...
✅ VTracer WASM 初始化成功
✅ VTracer 已就绪，开始矢量化...
🎯 VTracer: 开始矢量化...
✅ VTracer 环境检查通过
📤 开始加载图像...
✅ 图像加载成功，尺寸: 248 x 264
✅ VTracer 容器已找到
✅ Canvas 尺寸设置为: 248 x 264
✅ 图像已绘制到 Canvas
✅ SVG 容器已清空
🔧 VTracer 参数: {"canvas_id":"vtracer-canvas","svg_id":"vtracer-svg",...}
✅ ColorImageConverter 已创建
🚀 开始 VTracer tick 循环...
⏳ VTracer 处理中... (10 ticks)
⏳ VTracer 处理中... (20 ticks)
...
✅ VTracer 处理完成，总 ticks: 45
✅ SVG 序列化完成，长度: 1234
✅ VTracer 矢量化成功
✅ 矢量化完成，SVG 长度: 1234
```

## 如何调试

### 步骤 1：打开浏览器控制台

1. 按 `F12` 或 `Cmd+Option+I` (Mac) 打开开发者工具
2. 切换到 "Console" 标签
3. 清空控制台（点击 🚫 图标）

### 步骤 2：刷新页面

1. 刷新页面（`Cmd+R` 或 `F5`）
2. 观察控制台输出

### 步骤 3：检查初始化日志

**预期看到**：
```
🔧 开始初始化 VTracer WASM...
📦 创建隐藏容器...
✅ 隐藏容器已创建
📦 加载 WASM 文件...
✅ WASM URL: http://localhost:8080/src/lib/vectorization/wasm/vtracer_webapp_bg.wasm
📦 导入 vtracer_webapp.js...
✅ vtracer_webapp.js 已加载
📦 初始化 WASM 模块...
✅ WASM 模块初始化成功
✅ VTracer WASM 模块加载成功（支持彩色矢量化）
✅ VTracer 彩色矢量化已就绪
```

**如果看到错误**：
```
❌ VTracer WASM 初始化失败: [错误信息]
```

可能的原因：
- WASM 文件路径错误
- WASM 文件加载失败（404）
- CORS 问题
- 内存不足

### 步骤 4：上传图片并点击矢量化

1. 上传一张彩色图标网格
2. 等待自动检测完成
3. 点击顶部"矢量化"按钮（魔法棒图标）
4. 观察控制台输出

**预期看到**：
```
🎯 开始矢量化...
图标数量: 16
使用的预设: { name: 'balanced', ... }
准备处理 16 个图标
🎨 开始矢量化图像...
⏭️ VTracer 已经初始化，跳过
✅ VTracer 已就绪，开始矢量化...
🎯 VTracer: 开始矢量化...
✅ VTracer 环境检查通过
📤 开始加载图像...
✅ 图像加载成功，尺寸: 248 x 264
✅ VTracer 容器已找到
✅ Canvas 尺寸设置为: 248 x 264
✅ 图像已绘制到 Canvas
✅ SVG 容器已清空
🔧 VTracer 参数: {...}
✅ ColorImageConverter 已创建
🚀 开始 VTracer tick 循环...
⏳ VTracer 处理中... (10 ticks)
...
✅ VTracer 处理完成，总 ticks: 45
✅ SVG 序列化完成，长度: 1234
✅ VTracer 矢量化成功
✅ 矢量化完成，SVG 长度: 1234
矢量化进度: 1/16
...
✅ 矢量化完成！结果数量: 16
第一个结果预览: { svg: '<svg>...</svg>', pathCount: 10, fileSize: 1234, warnings: [] }
✅ 结果已保存到 store，Map 大小: 16
```

**如果看到错误**：
```
❌ VTracer 矢量化失败: [错误信息]
或
❌ VTracer 处理错误: [错误信息]
```

### 步骤 5：检查结果

1. 在网格中选择一个图标
2. 查看右侧"属性面板"的"矢量化结果"区域
3. 应该看到彩色的 SVG 预览

**预期结果**：
- 原图：彩色位图
- 矢量化结果：彩色 SVG（颜色与原图一致）
- 文件信息：显示文件大小和路径数量

**如果看到空白或错误**：
- 检查控制台是否有错误
- 截图错误信息
- 检查 SVG 内容（在控制台的日志中）

## 常见错误及解决方案

### 错误 1：null pointer passed to rust（已修复 ✅）

**症状**：
```
❌ VTracer 处理错误: Error: null pointer passed to rust
    at vtracer_webapp.wasm.colorimageconverter_init
    at ColorImageConverter.init
```

**原因**：使用了错误的构造函数

**解决方案**：
- ✅ **已修复**：使用 `ColorImageConverter.new_with_string(params)` 而不是 `new ColorImageConverter(params)`
- 刷新页面即可（如果已更新代码）

### 错误 2：WASM 文件加载失败 (404)

**症状**：
```
❌ VTracer WASM 初始化失败: Failed to fetch
```

**原因**：WASM 文件路径错误

**解决方案**：
1. 检查 `src/lib/vectorization/wasm/` 目录是否存在
2. 检查文件名是否正确：
   - `vtracer_webapp_bg.wasm` (280K)
   - `vtracer_webapp.js` (19K)
   - `vtracer_webapp.d.ts` (2.6K)
3. 检查 vite.config.ts 配置

### 错误 3：VTracer 容器未找到

**症状**：
```
❌ VTracer 容器未找到
```

**原因**：隐藏容器未创建

**解决方案**：
1. 检查 `createHiddenContainer()` 是否被调用
2. 检查 DOM 中是否有 `vtracer-hidden-container` 元素
3. 打开 Elements 标签，搜索 `vtracer-hidden-container`

### 错误 3：Canvas 2D 上下文获取失败

**症状**：
```
❌ 无法获取 Canvas 2D 上下文
```

**原因**：Canvas 元素不支持 2D 上下文

**解决方案**：
1. 检查浏览器是否支持 Canvas 2D
2. 尝试在其他浏览器中测试

### 错误 4：图像加载失败

**症状**：
```
❌ 图像加载失败
```

**原因**：ImageData 格式错误或损坏

**解决方案**：
1. 检查上传的图片格式（支持 PNG、JPG、WEBP）
2. 检查 boundingBoxes 的 imageData 字段
3. 尝试重新上传图片

### 错误 5：VTracer tick 处理错误

**症状**：
```
❌ VTracer tick 处理错误: [错误信息]
```

**原因**：VTracer WASM 内部错误

**解决方案**：
1. 检查 VTracer 参数是否正确
2. 尝试不同的预设（clean、balanced、detailed）
3. 检查图像尺寸是否过大

### 错误 6：矢量化结果为空

**症状**：
```
✅ 矢量化完成！结果数量: 16
第一个结果预览: { svg: '', pathCount: 0, fileSize: 0, warnings: ['矢量化失败: ...'] }
```

**原因**：矢量化过程中出错

**解决方案**：
1. 检查 warnings 字段的错误信息
2. 查看完整的错误堆栈
3. 尝试单个图标测试

## 验证修复

### 测试 1：检查 VTracer 初始化

1. 刷新页面
2. 打开控制台
3. 应该看到：`✅ VTracer 彩色矢量化已就绪`

### 测试 2：检查矢量化结果

1. 上传 4x4 彩色图标网格
2. 点击"矢量化"按钮
3. 选择一个图标
4. 检查右侧"矢量化结果"区域
5. 应该看到彩色 SVG 预览

### 测试 3：检查导出

1. 点击"导出"按钮
2. 下载 ZIP 文件
3. 解压并打开 SVG 文件
4. 检查是否有颜色（`fill="#RRGGBB"`）

## 日志过滤

如果日志太多，可以在控制台过滤：

```
# 只显示 VTracer 相关日志
VTracer

# 只显示错误
❌

# 只显示成功信息
✅
```

## 获取帮助

如果问题仍未解决：

1. **截图**：
   - 控制台输出
   - 矢量化结果区域
   - 导出的 SVG 文件内容

2. **收集信息**：
   - 浏览器版本
   - 操作系统
   - 错误堆栈
   - 完整的控制台日志

3. **检查文件**：
   - WASM 文件是否存在
   - 文件大小是否正确
   - 文件权限是否正确

---

**最后更新**：2025-01-13
**相关文档**：
- [BUG_FIX_SUMMARY.md](./BUG_FIX_SUMMARY.md)
- [USER_GUIDE.md](../USER_GUIDE.md)
- [COLOR_EXPORT_GUIDE.md](./COLOR_EXPORT_GUIDE.md)
