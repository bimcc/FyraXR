# FyraXR - 3D Tiles WebXR AR Viewer

基于NASA-AMMOS/3DTilesRendererJS的WebXR增强现实应用，实现3D Tiles模型与真实世界的叠合显示。

## 功能特性

- 🌍 **3D Tiles加载**: 基于NASA-AMMOS/3DTilesRendererJS加载和渲染3D Tiles数据
- 🥽 **WebXR AR支持**: 支持沉浸式AR体验，适配平板设备
- 📐 **位置标定**: 提供精确的AR位置标定和对齐功能
- 🎛️ **实时调整**: 支持实时调整模型透明度、缩放和位置
- 💾 **标定保存**: 自动保存和加载标定数据
- 📱 **移动优化**: 针对平板设备优化的触控界面

## 技术栈

- **Three.js**: 3D图形渲染引擎
- **3d-tiles-renderer**: NASA开源的3D Tiles渲染器
- **WebXR**: 浏览器原生AR/VR API
- **Vite**: 现代化构建工具

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 使用说明

### 1. 准备3D Tiles数据

将您的3D Tiles数据放置在 `public/assets/` 目录下，并在 `src/main.js` 中更新tileset URL。

### 2. 启动AR会话

1. 在支持WebXR的设备上打开应用
2. 点击"启动AR"按钮
3. 授权相机权限
4. 开始AR体验

### 3. 位置标定

1. 在AR模式下点击"位置标定"按钮
2. 使用标定面板调整模型位置和旋转
3. 点击"应用标定"确认调整
4. 点击"保存标定"保存设置

### 4. 实时调整

- **透明度**: 调整模型透明度以便观察真实世界
- **缩放**: 调整模型大小以匹配真实比例
- **重置位置**: 恢复到初始位置

## 设备要求

- 支持WebXR的现代浏览器（Chrome 79+, Edge 79+等）
- 具备ARCore（Android）或ARKit（iOS）支持的设备
- HTTPS环境（WebXR安全要求）

## 项目结构