# 🚀 GitHub 部署指南

## 步骤一：准备 Git 仓库

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 首次提交
git commit -m "🎉 feat: 初始化智能压缩工具图片压缩工具

- ✅ 完整的Web界面和后端API
- ✅ 支持自定义宽高压缩
- ✅ 完美支持动画图片(GIF/WebP)
- ✅ 智能文件名处理
- ✅ 批量处理功能
- ✅ 基于IPX+Sharp技术栈
- ✅ 响应式设计，支持深色模式
- ✅ Docker和Vercel部署支持

Signed-off-by: Your Name <your-email@example.com>"

# 4. 连接远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/seanx18/compressImg.git

# 5. 推送代码
git branch -M main
git push -u origin main
```

## 步骤二：启用 GitHub Pages

### 方式一：自动部署（推荐）

1. 进入仓库 → Settings → Pages
2. Source 选择：`GitHub Actions`
3. 推送代码会自动触发部署工作流

### 方式二：手动部署

1. Source 选择：`Deploy from a branch`
2. Branch 选择：`main` / (root)
3. 保存设置

## 步骤三：访问你的应用

部署完成后，访问地址：

```
https://your-username.github.io/compressImg
```

## 步骤四：自定义域名（可选）

1. 在 Pages 设置中添加自定义域名
2. 配置 DNS 记录指向 GitHub Pages
3. 启用 HTTPS

## 更新部署

每次推送代码到 main 分支都会自动重新部署：

```bash
git add .
git commit -m "feat: 添加新功能"
git push origin main
```
