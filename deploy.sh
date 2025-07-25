#!/usr/bin/env bash

# 确保脚本在错误时退出
set -e

# 构建项目
echo "📦 构建项目..."
npm run build

# 确保创建了.github目录
mkdir -p .github

# 创建一个临时目录用于部署
echo "📂 准备部署文件..."
TEMP_DIR="temp_deploy"
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# 复制dist目录的内容到临时目录
cp -r dist/* $TEMP_DIR/

# 检查gh-pages分支是否存在
if git rev-parse --verify gh-pages >/dev/null 2>&1; then
  echo "📄 切换到现有的gh-pages分支..."
  git checkout gh-pages
else
  echo "🌱 创建新的gh-pages分支..."
  git checkout --orphan gh-pages
  git rm -rf .
  echo "# FyraXR GitHub Pages" > README.md
  git add README.md
  git commit -m "Initial gh-pages commit"
fi

# 清理当前分支上的文件（保留.git目录和README.md）
find . -maxdepth 1 ! -name '.git' ! -name 'README.md' ! -name $TEMP_DIR -exec rm -rf {} \; 2>/dev/null || true

# 复制临时目录中的文件到当前目录
cp -r $TEMP_DIR/* .
rm -rf $TEMP_DIR

# 添加所有文件到git
echo "📝 提交更改..."
git add .

# 提交更改
git commit -m "更新GitHub Pages部署 $(date)"

# 推送到远程
echo "🚀 推送到GitHub..."
git push origin gh-pages

# 切回主分支
git checkout main

echo "✅ 部署完成! 网站已发布到GitHub Pages"
echo "🌐 访问网址: https://bimcc.github.io/FyraXR/" 