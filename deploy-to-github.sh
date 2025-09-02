#!/bin/bash

# 🚀 SeaArt 图片压缩工具 - GitHub 部署脚本

echo "🚀 SeaArt 图片压缩工具 - GitHub 部署"
echo "=================================="

# 检查是否在正确的目录
if [[ ! -f "package.json" ]] || [[ ! -f "server.js" ]]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 获取用户输入
echo ""
echo "📝 请提供 GitHub 仓库信息："
read -p "GitHub 用户名: " GITHUB_USERNAME
read -p "仓库名称 (建议: seaart-image-compressor): " REPO_NAME
read -p "你的名字: " USER_NAME
read -p "你的邮箱: " USER_EMAIL

# 设置默认值
REPO_NAME=${REPO_NAME:-seaart-image-compressor}

echo ""
echo "📋 配置信息确认："
echo "   GitHub 用户名: $GITHUB_USERNAME"
echo "   仓库名称: $REPO_NAME"
echo "   提交者: $USER_NAME <$USER_EMAIL>"
echo ""

read -p "确认信息无误？(y/N): " CONFIRM
if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ 部署取消"
    exit 1
fi

echo ""
echo "🔧 开始部署流程..."

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

# 配置 Git 用户信息
git config --global user.name "$USER_NAME"
git config --global user.email "$USER_EMAIL"

# 初始化 Git 仓库
if [[ ! -d ".git" ]]; then
    echo "📦 初始化 Git 仓库..."
    git init
    echo "✅ Git 仓库初始化完成"
else
    echo "✅ Git 仓库已存在"
fi

# 创建 .gitignore（如果不存在）
if [[ ! -f ".gitignore" ]]; then
    echo "📝 创建 .gitignore 文件..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*

# Environment variables
.env
.env.local
.env.production

# Runtime files
*.pid
*.log
tmp/
uploads/

# Editor files
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Build output
dist/
build/

# Vercel
.vercel
EOF
    echo "✅ .gitignore 文件创建完成"
fi

# 创建 LICENSE 文件
if [[ ! -f "LICENSE" ]]; then
    echo "📄 创建 MIT License 文件..."
    CURRENT_YEAR=$(date +%Y)
    cat > LICENSE << EOF
MIT License

Copyright (c) $CURRENT_YEAR $USER_NAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
    echo "✅ MIT License 文件创建完成"
fi

# 更新 README.md 中的链接
echo "🔗 更新文档链接..."
sed -i.bak "s/your-username/$GITHUB_USERNAME/g" README.md 2>/dev/null || sed -i "s/your-username/$GITHUB_USERNAME/g" README.md
sed -i.bak "s/seaart-image-compressor/$REPO_NAME/g" README.md 2>/dev/null || sed -i "s/seaart-image-compressor/$REPO_NAME/g" README.md
rm -f README.md.bak 2>/dev/null

# 添加所有文件
echo "📁 添加项目文件..."
git add .

# 创建初始提交
echo "💾 创建初始提交..."
git commit -m "🎉 feat: 初始化SeaArt图片压缩工具

✨ 核心功能:
- 🖼️ 基于IPX+Sharp技术栈，与nuxt-img相同压缩效果
- 🎬 完美支持动画图片(GIF转WebP，压缩率50-70%)
- 📐 自定义宽高压缩，支持保持宽高比
- 📝 智能文件名处理(保持原名/自定义输出)
- 🚀 批量处理和实时预览
- 📱 现代化响应式界面，支持深色模式
- 🐳 Docker和Vercel部署支持

🛠️ 技术特色:
- Express.js后端API
- 拖拽上传和进度显示
- 详细压缩统计和性能优化
- 企业级错误处理和安全防护

📦 部署方式:
- GitHub Pages自动部署
- Vercel一键部署
- Docker容器化部署

Signed-off-by: $USER_NAME <$USER_EMAIL>"

# 设置远程仓库
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "🔗 连接远程仓库: $REPO_URL"

if git remote get-url origin &>/dev/null; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

# 设置主分支
git branch -M main

# 推送代码
echo "📤 推送代码到 GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📋 接下来的步骤："
    echo "1. 访问你的 GitHub 仓库："
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "2. 启用 GitHub Pages："
    echo "   - 进入仓库 Settings → Pages"
    echo "   - Source 选择 'GitHub Actions'"
    echo "   - 系统会自动部署"
    echo ""
    echo "3. 部署完成后访问："
    echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME"
    echo ""
    echo "4. 可选：部署到 Vercel"
    echo "   - 安装：npm i -g vercel"
    echo "   - 部署：vercel --prod"
    echo ""
    echo "🎊 恭喜！你的图片压缩工具已成功部署到 GitHub！"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "1. GitHub 仓库是否已创建"
    echo "2. 网络连接是否正常"
    echo "3. Git 认证是否配置正确"
    echo ""
    echo "💡 手动推送命令："
    echo "   git push -u origin main"
fi
