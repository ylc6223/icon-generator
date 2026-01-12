# Changelog

All notable changes to the Icon Extractor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **测试与发布准备** (Week 9)
  - 测试计划文档（docs/TEST_PLAN.md）
    - 功能测试用例（7 个主要功能模块）
    - 性能测试方案（大图片、大批量图标）
    - 兼容性测试（浏览器、响应式）
    - 边界情况测试（异常输入、并发操作）
    - 安全性测试（文件安全、数据隐私）
    - 用户体验测试
    - Bug 记录模板和测试报告模板
  - 用户使用指南（docs/USER_GUIDE.md）
    - 快速开始（5 分钟入门指南）
    - 界面介绍（布局和面板说明）
    - 详细功能说明（7 个核心功能）
    - 常见问题（7 个 FAQ）
    - 技巧与最佳实践
    - 故障排除（5 类问题解决方案）
    - 键盘快捷键参考
    - 隐私与安全说明
- **交互优化功能** (Week 8)
  - 全局键盘快捷键系统（useKeyboardShortcuts Hook）
    - Ctrl+Z / Cmd+Z: 撤销边界框操作
    - Ctrl+Y / Cmd+Shift+Z: 重做
    - Delete / Backspace: 删除选中边界框
    - Esc: 取消选择
  - 进度显示增强
    - 添加 Progress 进度条组件
    - 显示处理百分比和阶段
    - Loader2 旋转加载动画
    - 优化状态指示器
  - 动画效果系统（framer-motion）
    - 创建动画组件库
    - 边界框选择缩放动画
    - 控制点悬停放大动画
    - 弹性动画参数优化
- **预览面板增强** (IconPreviewPanel)
  - 创建独立的预览面板组件
  - 原图和SVG并排对比显示
  - 4级缩放功能（1x, 2x, 4x, 8x）
  - 文件大小和节点数统计显示
  - 懒加载SVG优化性能
  - 质量警告可视化展示
  - 集成到PropertiesPanel顶部
- **国际化支持增强**
  - 添加预览面板中英文翻译
  - 更新属性面板翻译（添加detailed预设）
- **WebWorker 并发处理系统**
  - 创建 vectorizer WebWorker (src/workers/vectorizer.ts)
  - 实现 WorkerPool 类（固定4个Worker并发）
  - 实现任务队列管理系统
  - 添加进度回调机制
  - VTracer WASM 在 Worker 中的完整集成
  - Worker 环境支持（OffscreenCanvas）
- **性能优化**
  - 批量矢量化使用 WebWorker（4个并发）
  - 分块处理（>100个图标，每批100个）
  - 懒加载 SVG 预览
- **Vite Worker 配置**
  - 添加 worker.format 配置
  - worker.plugins 集成 wasm 和 topLevelAwait
- **图标标签编辑功能** (BoundingBoxEditor 集成)
  - 点击标签打开编辑弹窗
  - 实时标签验证（1-50字符限制）
  - 非法字符检查（不允许 / \ : * ? " < > |）
  - 重复标签检查
  - 键盘快捷键：Enter 保存，Esc 取消
- **VTracer WASM 集成**
  - 安装并配置 vectortracer npm 包
  - 创建 vtracer.wasm.ts 封装模块
  - 实现预设到 VTracer 参数的转换
  - 添加降级机制（VTracer 失败时使用 potrace）
  - 支持主线程和 Worker 环境（自动检测）
- **质量检测模块** (src/lib/vectorization/quality.ts)
  - QualityChecker 类支持全面的质量检查
  - 检测路径复杂度（节点数 > 500）
  - 检测文件大小（SVG > 50KB）
  - 检测颜色数量（> 10种）
  - 检测路径数量（只有1条路径时警告）
  - 检测 SVG 有效性
  - 检测 viewBox 属性
  - 生成质量分数（0-100）和改进建议
- **WASM 支持配置**
  - 添加 vite-plugin-wasm 插件
  - 添加 vite-plugin-top-level-await 插件
  - 更新 vite.config.ts 支持 WebAssembly

### Changed
- **全局键盘快捷键**
  - 在 Index.tsx 中集成 useKeyboardShortcuts Hook
  - 自动检测输入框并跳过快捷键
  - 处理中禁用快捷键
- **StatusBar 增强**
  - 添加 Loader2 旋转加载图标
  - 添加 Progress 进度条
  - 显示处理百分比
  - 优化状态指示器样式
- **BoundingBoxEditor 动画**
  - 使用 motion.div 替代 div
  - 添加缩放动画（选中时 1.02x）
  - 控制点弹性动画（spring 配置）
  - 悬停放大效果（scale: 1.25）
- **PropertiesPanel 重构**
  - 顶部添加 IconPreviewPanel 预览区域
  - 预览面板和设置面板用 Separator 分隔
  - 设置部分可滚动查看
- **vtracer.wasm.ts 增强**
  - 添加 isWorkerContext() 检测运行环境
  - 添加 createCanvas() 支持主线程和 Worker
  - OffscreenCanvas 用于 Worker 环境
  - 普通Canvas 用于主线程环境
- **icon-processor.ts 更新**
  - batchVectorize 使用 WorkerPool
  - 实现分块处理逻辑（CHUNK_SIZE = 100）
  - 保持 VTracer WASM 作为首选算法
  - 保留 potrace 作为备用算法
- **预览面板增强** (IconPreviewPanel)
  - 创建独立的预览面板组件
  - 原图和SVG并排对比显示
  - 4级缩放功能（1x, 2x, 4x, 8x）
  - 文件大小和节点数统计显示
  - 懒加载SVG优化性能
  - 质量警告可视化展示
  - 集成到PropertiesPanel顶部
- **国际化支持增强**
  - 添加预览面板中英文翻译
  - 更新属性面板翻译（添加detailed预设）
- **WebWorker 并发处理系统**
  - 创建 vectorizer WebWorker (src/workers/vectorizer.ts)
  - 实现 WorkerPool 类（固定4个Worker并发）
  - 实现任务队列管理系统
  - 添加进度回调机制
  - VTracer WASM 在 Worker 中的完整集成
  - Worker 环境支持（OffscreenCanvas）
- **性能优化**
  - 批量矢量化使用 WebWorker（4个并发）
  - 分块处理（>100个图标，每批100个）
  - 懒加载 SVG 预览
- **Vite Worker 配置**
  - 添加 worker.format 配置
  - worker.plugins 集成 wasm 和 topLevelAwait
- **图标标签编辑功能** (BoundingBoxEditor 集成)
  - 点击标签打开编辑弹窗
  - 实时标签验证（1-50字符限制）
  - 非法字符检查（不允许 / \ : * ? " < > |）
  - 重复标签检查
  - 键盘快捷键：Enter 保存，Esc 取消
- **VTracer WASM 集成**
  - 安装并配置 vectortracer npm 包
  - 创建 vtracer.wasm.ts 封装模块
  - 实现预设到 VTracer 参数的转换
  - 添加降级机制（VTracer 失败时使用 potrace）
  - 支持主线程和 Worker 环境（自动检测）
- **质量检测模块** (src/lib/vectorization/quality.ts)
  - QualityChecker 类支持全面的质量检查
  - 检测路径复杂度（节点数 > 500）
  - 检测文件大小（SVG > 50KB）
  - 检测颜色数量（> 10种）
  - 检测路径数量（只有1条路径时警告）
  - 检测 SVG 有效性
  - 检测 viewBox 属性
  - 生成质量分数（0-100）和改进建议
- **WASM 支持配置**
  - 添加 vite-plugin-wasm 插件
  - 添加 vite-plugin-top-level-await 插件
  - 更新 vite.config.ts 支持 WebAssembly

### Changed
- **PropertiesPanel 重构**
  - 顶部添加 IconPreviewPanel 预览区域
  - 预览面板和设置面板用 Separator 分隔
  - 设置部分可滚动查看
- **vtracer.wasm.ts 增强**
  - 添加 isWorkerContext() 检测运行环境
  - 添加 createCanvas() 支持主线程和 Worker
  - OffscreenCanvas 用于 Worker 环境
  - 普通Canvas 用于主线程环境
- **icon-processor.ts 更新**
  - batchVectorize 使用 WorkerPool
  - 实现分块处理逻辑（CHUNK_SIZE = 100）
  - 保持 VTracer WASM 作为首选算法
  - 保留 potrace 作为备用算法
- **状态结构重构**（按照技术文档规范）
  - DetectedIcon → BoundingBox 接口重命名
  - uploadedImage → originalImage 状态重命名
  - detectedIcons → boundingBoxes 状态重命名
  - selectedBoxId → selectedBox 状态重命名
  - gridSize → gridRows/gridCols 分离
  - 添加 VectorizationResult 接口
  - 添加 VectorizationPreset 接口
  - 添加 vectorizedIcons Map
  - 添加 iconLabels Map
  - 添加 isProcessing, processingProgress, processingStage 状态
- **BoundingBoxEditor 增强**
  - 显示用户自定义标签（优先于 ID）
  - 添加标签编辑弹窗 UI
  - 集成 store 的 iconLabels Map
  - 添加标签验证和错误提示

### Removed
- IconPreviewCard 组件（不再需要）
- GridView 组件（简化 UI）

### Fixed
- 修复 VTracer WASM 在 Vite Worker 中的构建问题
- 修复 Worker 环境中 Canvas 创建问题（使用 OffscreenCanvas）
- 修复标签验证逻辑（正确处理空标签和重复标签）

---

## [0.2.0] - 2026-01-12

### Added
- 项目初始化，基于 Vite + React + TypeScript
- 集成 shadcn/ui 组件库
- 配置 Zustand 状态管理
- 实现三栏工作台布局（TopBar, AssetsPanel, CanvasArea, PropertiesPanel, StatusBar）
- 实现图像上传功能（UploadZone 组件）
- 实现网格检测算法（detectIconsInImage）
- 实现基础矢量化算法（imageToSvg - potrace）
- 实现 ZIP 导出功能（exportIconsAsZip）
- 实现图标选择/取消选择功能
- 实现网格设置（行列数输入）
- 实现视图模式切换（原图/网格）
- 实现矢量化预设选择（balanced, clean, precise）

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## [0.1.0] - 2026-01-12

### Added
- 初始版本发布
- 基础项目架构搭建
- 核心 UI 组件实现
- 基础图标处理功能

---

## 版本说明

- **[Unreleased]**: 正在开发中的功能
- **[0.2.0]**: 边界框编辑器版本
- **[0.1.0]**: 初始版本
