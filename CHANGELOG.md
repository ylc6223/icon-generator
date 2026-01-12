# Changelog

All notable changes to the Icon Extractor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **边界框编辑器** (BoundingBoxEditor 组件)
  - 支持在 Canvas 上拖拽移动边界框
  - 支持8个控制点调整大小（4个角 + 4条边）
  - 选中状态高亮显示
  - 实时预览更新
  - 显示图标ID/标签标签
- **撤销/重做功能** (仅边界框操作)
  - 支持最多5步历史记录
  - 键盘快捷键：Ctrl+Z (撤销), Ctrl+Shift+Z (重做)
- **键盘快捷键支持**
  - Delete: 删除选中的边界框
  - Esc: 取消选择
- **状态管理扩展**
  - 添加 selectedBoxId 状态
  - 添加 boxHistory 状态（past/future）
  - 添加边界框操作 actions (selectBox, updateBox, deleteBox, setBoxLabel)
  - 添加历史管理 actions (saveBoxHistory, undo, redo)
- **DetectedIcon 接口扩展**
  - 添加 label 字段用于图标标签

### Changed
- OriginalView 组件集成 BoundingBoxEditor
- CanvasArea 组件添加撤销/重做快捷键监听
- workbench-store 扩展边界框编辑功能

### Fixed
- 修复边界框位置计算逻辑

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
