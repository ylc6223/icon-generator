# Changelog

All notable changes to the Icon Extractor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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
- **[0.1.0]**: 已发布的版本
- **[0.2.0-alpha]**: 内部测试版本（如适用）
