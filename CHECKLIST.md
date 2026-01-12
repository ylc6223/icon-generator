# Icon Extractor - 开发检查清单

> 本文档记录开发进度，每次完成一个小阶段的功能后及时更新

## 📅 开发周期：2026-01-12 开始

---

## ✅ Phase 0: 基础设施（已完成）

### Week 1: 项目初始化
- [x] 创建 Vite + React + TypeScript 项目
- [x] 配置 Tailwind CSS 和 shadcn/ui
- [x] 配置 ESLint 和 Prettier
- [x] 创建 Git 仓库
- [x] 配置 Zustand 状态管理
- [x] 配置 React Router v7

### Week 2: 基础UI组件
- [x] 实现三栏布局组件（Index.tsx）
- [x] 创建 TopBar 导航栏
- [x] 创建 AssetsPanel（图标列表）
- [x] 创建 CanvasArea（主画布区域）
- [x] 创建 PropertiesPanel（属性面板）
- [x] 创建 StatusBar（状态栏）
- [x] 实现 UploadZone（上传区域）

### 核心功能基础
- [x] 图像上传功能
- [x] 网格检测算法实现（detectIconsInImage）
- [x] 基础矢量化算法（imageToSvg - potrace）
- [x] ZIP 导出功能（exportIconsAsZip）

---

## 🚧 Phase 1: 核心功能增强（进行中）

### Week 3: 边界框编辑器
- [ ] BoundingBoxEditor 组件（集成到 CanvasArea）
  - [ ] 在 Canvas 上绘制所有边界框
  - [ ] 实现选中状态高亮
  - [ ] 实现拖拽调整大小（4个角 + 4条边）
  - [ ] 实现拖拽移动位置
  - [ ] 实时预览更新
  - [ ] 删除边界框功能（Delete 键）
  - [ ] 键盘快捷键（Esc 取消选择）

- [ ] 边界框状态管理
  - [ ] 扩展 workbench-store 支持边界框编辑
  - [ ] 实现撤销/重做（仅边界框，最多5步）
  - [ ] 保存边界框历史记录

### Week 4: 图标标签系统
- [ ] 图标标签功能
  - [ ] 在 IconPreviewCard 中添加标签输入框
  - [ ] 批量命名功能（icon-1, icon-2...）
  - [ ] 标签验证
    - [ ] 字符限制：1-50字符
    - [ ] 非法字符检查：不允许 / \ : * ? " < > |
    - [ ] 重复标签检查
    - [ ] 连续空格压缩

- [ ] 标签状态管理
  - [ ] 扩展 DetectedIcon 接口添加 label 字段
  - [ ] 添加 setIconLabel action
  - [ ] 批量重命名功能

### Week 5: 质量检测系统
- [ ] QualityChecker 模块（src/lib/vectorization/quality.ts）
  - [ ] 检测路径复杂度（节点数 > 500）
  - [ ] 检测文件大小（SVG > 50KB）
  - [ ] 检测颜色数量（> 10种）
  - [ ] 检测路径数量（只有1条路径时警告）
  - [ ] 生成警告信息

- [ ] UI 显示警告
  - [ ] 在 IconPreviewCard 上显示警告图标
  - [ ] 点击查看具体问题
  - [ ] 质量信息统计面板

### Week 6: WebWorker 并发处理
- [ ] WebWorker 集成
  - [ ] 创建 vectorizer worker（src/workers/vectorizer.ts）
  - [ ] 实现 WorkerPool 类（固定4个Worker）
  - [ ] 任务队列管理
  - [ ] 进度回调实现

- [ ] 性能优化
  - [ ] 批量矢量化使用 WebWorker
  - [ ] 分块处理（>100个图标）
  - [ ] 懒加载 SVG 预览

---

## 📋 Phase 2: UI/UX 优化（计划中）

### Week 7: 预览功能增强
- [ ] 预览面板增强
  - [ ] 原图和SVG并排显示
  - [ ] 缩放功能（2x, 4x, 8x）
  - [ ] 文件大小和节点数统计
  - [ ] 懒加载 SVG

### Week 8: 交互优化
- [ ] 键盘快捷键
  - [ ] Ctrl+Z: 撤销
  - [ ] Ctrl+Y: 重做
  - [ ] Delete: 删除选中边界框
  - [ ] Esc: 取消选择
  - [ ] Shift+点击: 批量选择

- [ ] 进度显示
  - [ ] 分步进度提示（"检测中 3/16"）
  - [ ] 百分比进度条
  - [ ] 处理阶段标识（detecting, vectorizing, exporting）

### Week 9: UI/UX 完善
- [ ] 动画效果（motion/react）
- [ ] 改进颜色方案
- [ ] 优化暗黑模式
- [ ] 添加引导提示（首次使用）
- [ ] 改进错误提示
- [ ] 桌面设备优化（移动端显示提示）

---

## 🧪 Phase 3: 测试与发布（计划中）

### Week 10-11: 测试
- [ ] 编写测试计划
- [ ] 手动测试所有功能
- [ ] 边界情况测试
- [ ] 兼容性测试（桌面浏览器）
- [ ] 性能测试（大图片、大量图标）
- [ ] Bug 修复

### Week 12: 发布准备
- [ ] 用户使用指南
- [ ] 更新 README
- [ ] 配置生产环境构建
- [ ] 部署到 Vercel/Netlify
- [ ] 正式发布

---

## 📊 进度统计

- **总任务数**: 76
- **已完成**: 19 (25%)
- **进行中**: 0
- **待完成**: 57

---

## 🎯 下一步行动

**当前重点** (Week 3): 边界框编辑器
1. 创建 BoundingBoxEditor 组件
2. 实现拖拽调整功能
3. 实现撤销/重做

---

## 📝 更新日志

| 日期 | 完成任务 | 负责人 |
|------|---------|--------|
| 2026-01-12 | 基础设施搭建完成，Phase 0 100% 完成 | Claude |
| | | |
| | | |
