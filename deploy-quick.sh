#!/bin/bash

echo "🚀 智能压缩工具图片压缩工具 - 快速部署脚本"
echo "=================================================="

# 检查Git是否已初始化
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加文件
echo "📁 添加文件到Git..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "feat: 智能压缩工具图片压缩工具完整版

✨ 功能特性:
- 支持 JPG/PNG/WebP/GIF/BMP/TIFF 格式
- 自定义尺寸和质量压缩
- 动画图片支持（GIF → WebP）
- 批量处理和实时预览
- 现代化Web界面

🛠️ 技术栈:
- 前端: HTML5 + CSS3 + Vanilla JS
- 后端: Node.js + Express + Sharp
- 图片处理: IPX + Sharp
- 部署: Vercel + Netlify 双支持"

echo ""
echo "✅ Git准备完成！"
echo ""
echo "🌟 下一步操作："
echo "1. 在GitHub创建新仓库: compressImg"
echo "2. 执行以下命令连接GitHub:"
echo ""
echo "   git remote add origin https://github.com/你的用户名/compressImg.git"
echo "   git push -u origin main"
echo ""
echo "3. 选择部署平台："
echo "   🥇 Vercel (推荐): https://vercel.com"
echo "   🥈 Netlify (备选): https://netlify.com"
echo ""
echo "🎉 3-5分钟后您的工具就能在线运行了！"
