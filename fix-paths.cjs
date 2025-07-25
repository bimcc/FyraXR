// 修复构建后的路径问题
const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复路径问题...');

// 读取构建后的HTML文件
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('📄 读取文件:', htmlPath);

// 替换script标签中的绝对路径为相对路径
htmlContent = htmlContent.replace(
  /src="\/FyraXR\/assets\//g, 
  'src="./assets/'
);

console.log('🔄 替换路径引用');

// 写回文件
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ 路径修复完成!');

// 检查Service Worker文件是否存在
const swPath = path.join(__dirname, 'dist', 'sw.js');
if (!fs.existsSync(swPath)) {
  console.log('⚠️ Service Worker文件不存在，从public复制');
  const publicSwPath = path.join(__dirname, 'public', 'sw.js');
  if (fs.existsSync(publicSwPath)) {
    fs.copyFileSync(publicSwPath, swPath);
    console.log('✅ Service Worker文件已复制');
  }
}

// 检查manifest.json是否存在
const manifestPath = path.join(__dirname, 'dist', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log('⚠️ manifest.json文件不存在，从public复制');
  const publicManifestPath = path.join(__dirname, 'public', 'manifest.json');
  if (fs.existsSync(publicManifestPath)) {
    fs.copyFileSync(publicManifestPath, manifestPath);
    console.log('✅ manifest.json文件已复制');
  }
}

// 检查图标目录
const iconDir = path.join(__dirname, 'dist', 'icon');
if (!fs.existsSync(iconDir)) {
  console.log('⚠️ 图标目录不存在，创建并复制图标');
  fs.mkdirSync(iconDir, { recursive: true });
  
  const publicIconPath = path.join(__dirname, 'public', 'icon', 'icon.png');
  if (fs.existsSync(publicIconPath)) {
    fs.copyFileSync(publicIconPath, path.join(iconDir, 'icon.png'));
    console.log('✅ 图标文件已复制');
  }
}

console.log('🎉 所有修复完成!'); 