# 🚀 PWA 快速开始指南

你的项目已成功改造为 PWA 应用！

## 快速命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 重新生成 PWA 图标（如果替换了 public/unnamed.jpg）
npm run generate-pwa-assets
```

## 访问应用

开发环境：http://localhost:3000

## 验证 PWA 功能

### 1. 安装应用
- **Android**: Chrome 地址栏会显示"安装"按钮
- **iOS**: Safari 中点击"分享" > "添加到主屏幕"
- **桌面**: 浏览器菜单中有"安装应用"选项

### 2. 测试离线功能
1. 打开应用
2. 按 F12 打开开发者工具
3. 转到 Application 标签
4. 找到 Service Workers，勾选 Offline
5. 刷新页面，应用应该仍然工作

### 3. 检查 Service Worker
- Application 标签 → Service Workers
- 查看 sw.js 状态（应该是 "running"）

## 📊 生成的资源概览

```
public/
├── unnamed.jpg                    # 原始图片（用于生成图标）
├── icon-192.png                   # Android 图标
├── icon-512.png                   # 启动屏幕图标
├── icon-192-maskable.png          # Android 自适应图标
├── icon-512-maskable.png          # Android 自适应图标
└── apple-touch-icon.png           # iOS 图标
```

## 📝 配置文件

- `vite.config.ts` - PWA 插件配置和缓存策略
- `index.html` - PWA meta 标签和 manifest 链接
- `package.json` - PWA 相关脚本和依赖

## 📚 详细文档

- `PWA_GUIDE.md` - 完整的 PWA 配置和使用指南
- `PWA_SETUP_SUMMARY.md` - PWA 改造的完整清单

## ✨ 主要特性

✅ **离线支持** - 应用可在没有网络时运行  
✅ **自动更新** - 新版本自动在后台更新  
✅ **可安装** - 像原生应用一样安装到设备  
✅ **智能缓存** - Google Fonts 和 CDN 资源优化缓存  
✅ **响应式图标** - Android 自适应图标  
✅ **iOS 友好** - 完整的 Apple 支持  

## 🎨 自定义应用

### 更改应用名称
编辑 `vite.config.ts` 中的：
```typescript
manifest: {
  name: '你的应用名称',
  short_name: '短名称',
  // ...
}
```

### 更换图标
1. 将新图片放在 `public/unnamed.jpg`
2. 运行 `npm run generate-pwa-assets`
3. 重新构建 `npm run build`

### 修改主题颜色
编辑 `vite.config.ts` 中的：
```typescript
theme_color: '#你的颜色',
background_color: '#你的颜色'
```
同时更新 `index.html` 中的 `theme-color` meta 标签。

## 🔗 有用的链接

- [vite-plugin-pwa 文档](https://vite-plugin-pwa.netlify.app/)
- [Web.dev PWA 指南](https://web.dev/progressive-web-apps/)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

**准备就绪！** 现在你有一个完整的 PWA 应用，可以离线运行并安装到设备上。
