# Changelog

All notable changes to the Icon Extractor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
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
- **icon-processor.ts 更新**
  - 使用 VTracer WASM 作为首选矢量化算法
  - 保留 potrace 作为备用算法
  - 更新函数签名使用新接口
  - 添加 vectorizeIcon 和 batchVectorize 函数
- **BoundingBoxEditor 增强**
  - 显示用户自定义标签（优先于 ID）
  - 添加标签编辑弹窗 UI
  - 集成 store 的 iconLabels Map
  - 添加标签验证和错误提示

### Removed
- IconPreviewCard 组件（不再需要）
- GridView 组件（简化 UI）

### Fixed
- 修复 VTracer WASM 在 Vite 中的构建问题
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
