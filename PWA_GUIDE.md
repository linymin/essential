# PWA 配置指南

本项目已配置为渐进式 Web 应用 (PWA)。以下是配置细节和使用说明。

## 已安装的 PWA 功能

### 1. vite-plugin-pwa 插件
- **自动更新**: Service Worker 会自动更新
- **离线支持**: 应用在离线时仍可正常运行
- **安装提示**: 用户可以将应用安装到主屏幕

### 2. Service Worker 配置
- **缓存策略**: 
  - Google Fonts: 365 天缓存
  - Tailwind CDN: 30 天缓存
  - 本地资源: 自动缓存
- **自动预缓存**: 所有 HTML、CSS、JS 和图片资源

### 3. Web App Manifest
位置: `vite.config.ts` 中的 `manifest` 字段

配置包括：
- 应用名称: "Essence - Less is More"
- 短名称: "Essence"
- 描述: 应用功能描述
- 主题颜色: #fdfbf7（浅色）
- 背景颜色: #fdfbf7
- 显示模式: standalone（全屏应用体验）

### 4. 应用图标
在 `public/` 目录下已生成以下图标：

| 文件 | 尺寸 | 用途 |
|------|------|------|
| `icon-192.png` | 192x192 | 任意设备 |
| `icon-512.png` | 512x512 | 启动屏幕 |
| `icon-192-maskable.png` | 192x192 | 自适应图标 |
| `icon-512-maskable.png` | 512x512 | 自适应图标 |
| `apple-touch-icon.png` | 180x180 | iOS 设备 |

### 5. HTML 元信息
已在 `index.html` 中添加：
- `meta name="theme-color"` - 主题颜色
- `meta name="apple-mobile-web-app-capable"` - iOS 支持
- `meta name="apple-mobile-web-app-status-bar-style"` - 状态栏样式
- `meta name="apple-mobile-web-app-title"` - iOS 应用标题
- `link rel="manifest"` - manifest 文件链接
- `link rel="apple-touch-icon"` - iOS 主屏幕图标

## 构建和部署

### 本地开发
```bash
npm install
npm run dev
```

### 生成 PWA 资源
如需重新生成 PWA 图标（例如替换 public/unnamed.jpg）：
```bash
npm run generate-pwa-assets
```

### 生产构建
```bash
npm run build
```

生成的文件在 `dist/` 目录下，包括：
- `manifest.webmanifest` - Web App Manifest
- `sw.js` - Service Worker 文件
- `workbox-*.js` - Workbox 缓存库

### 预览生产构建
```bash
npm run preview
```

## 支持的平台

### Android
- Chrome、Edge、Samsung 浏览器等基于 Chromium 的浏览器
- 用户可通过"安装应用"选项将应用添加到主屏幕

### iOS
- Safari 浏览器
- 通过"分享" > "添加到主屏幕"安装
- 显示为全屏应用，支持离线访问

### 桌面
- Chrome、Edge、Firefox 等现代浏览器
- 可安装为桌面应用

## 验证 PWA

### Chrome/Edge
1. 打开应用
2. 按 F12 打开开发者工具
3. 转到 "Application" 标签
4. 检查 "Manifest" 部分验证配置
5. 检查 "Service Workers" 验证 Service Worker 状态

### 测试离线功能
1. 在开发者工具中选中 Service Worker
2. 勾选 "Offline" 复选框
3. 刷新页面，应用应该仍然可以运行

## 自定义配置

如需修改 PWA 配置，编辑 `vite.config.ts` 中的 `VitePWA` 选项：

```typescript
VitePWA({
  registerType: 'autoUpdate',  // 或 'prompt' 提示用户更新
  manifest: {
    name: '应用名称',
    // ... 其他配置
  },
  workbox: {
    // 缓存策略配置
  }
})
```

## 常见问题

### 图标显示不正确？
- 确保已运行 `npm run generate-pwa-assets`
- 清除浏览器缓存
- 重新构建项目

### Service Worker 不更新？
- 清除浏览器缓存
- 在开发者工具中卸载 Service Worker
- 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）

### 应用无法离线访问？
- 确保已在在线状态下首次访问应用
- Service Worker 需要时间来缓存资源
- 检查开发者工具中的缓存存储

## 更多信息

- [vite-plugin-pwa 文档](https://vite-plugin-pwa.netlify.app/)
- [Web.dev PWA 指南](https://web.dev/progressive-web-apps/)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
