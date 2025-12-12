#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const sourceImage = path.join(publicDir, 'unnamed.jpg');

// Ensure output directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateAssets() {
  try {
    console.log('生成 PWA 资源...');

    // 检查源图像是否存在
    if (!fs.existsSync(sourceImage)) {
      console.error(`错误：找不到源图像 ${sourceImage}`);
      console.log('将创建简单的占位符图像...');
      
      // 创建一个简单的 SVG 作为占位符
      const svgIcon = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fdfbf7;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" fill="#fdfbf7"/>
        <circle cx="256" cy="256" r="180" fill="url(#grad)"/>
        <text x="256" y="280" font-size="120" font-family="serif" text-anchor="middle" fill="#2d2d2d" font-weight="300">E</text>
      </svg>`;
      
      const svgBuffer = Buffer.from(svgIcon);
      
      // 从 SVG 生成 PNG 图标
      for (const size of [192, 512]) {
        await sharp(svgBuffer, { density: 300 })
          .resize(size, size, { fit: 'cover' })
          .png()
          .toFile(path.join(publicDir, `icon-${size}.png`));
        console.log(`✓ 生成 icon-${size}.png`);
        
        // 生成 maskable 版本
        const bg = await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 253, g: 251, b: 247, alpha: 1 }
          }
        })
          .composite([{
            input: await sharp(svgBuffer, { density: 300 })
              .resize(Math.floor(size * 0.8), Math.floor(size * 0.8))
              .png()
              .toBuffer(),
            top: Math.floor(size * 0.1),
            left: Math.floor(size * 0.1)
          }])
          .png()
          .toFile(path.join(publicDir, `icon-${size}-maskable.png`));
        console.log(`✓ 生成 icon-${size}-maskable.png`);
      }
    } else {
      // 从现有图像生成图标
      const baseImage = sharp(sourceImage);
      
      // 生成 192x192 图标
      await baseImage
        .clone()
        .resize(192, 192, { fit: 'cover' })
        .png()
        .toFile(path.join(publicDir, 'icon-192.png'));
      console.log('✓ 生成 icon-192.png');
      
      // 生成 512x512 图标
      await baseImage
        .clone()
        .resize(512, 512, { fit: 'cover' })
        .png()
        .toFile(path.join(publicDir, 'icon-512.png'));
      console.log('✓ 生成 icon-512.png');
      
      // 生成 maskable 版本（添加背景）
      const bg192 = await sharp({
        create: {
          width: 192,
          height: 192,
          channels: 4,
          background: { r: 253, g: 251, b: 247, alpha: 1 }
        }
      })
        .composite([{
          input: await baseImage.clone().resize(154, 154).png().toBuffer(),
          top: 19,
          left: 19
        }])
        .png()
        .toFile(path.join(publicDir, 'icon-192-maskable.png'));
      console.log('✓ 生成 icon-192-maskable.png');
      
      const bg512 = await sharp({
        create: {
          width: 512,
          height: 512,
          channels: 4,
          background: { r: 253, g: 251, b: 247, alpha: 1 }
        }
      })
        .composite([{
          input: await baseImage.clone().resize(410, 410).png().toBuffer(),
          top: 51,
          left: 51
        }])
        .png()
        .toFile(path.join(publicDir, 'icon-512-maskable.png'));
      console.log('✓ 生成 icon-512-maskable.png');
    }

    // 创建 apple-touch-icon
    const appleIcon = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="180" fill="#fdfbf7" rx="40"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fdfbf7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r="60" fill="url(#grad)"/>
      <text x="90" y="110" font-size="70" font-family="serif" text-anchor="middle" fill="#2d2d2d" font-weight="300">E</text>
    </svg>`;

    await sharp(Buffer.from(appleIcon), { density: 300 })
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ 生成 apple-touch-icon.png');

    console.log('\n✅ PWA 资源生成成功！');
  } catch (error) {
    console.error('生成资源时出错:', error);
    process.exit(1);
  }
}

generateAssets();
