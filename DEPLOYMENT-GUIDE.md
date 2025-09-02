# 🚀 智能图片压缩工具 - Vercel 部署指南

本项目专为 Vercel 平台优化，支持 Node.js 后端和 Serverless Functions。

## 🎯 Vercel 部署方案

### ✨ 特色优势

- ⚡ **一键部署**: 零配置，3分钟上线
- 🌐 **自动HTTPS**: 免费SSL证书
- 🚀 **全球CDN**: 访问速度极快
- 📊 **100GB免费流量**: 个人使用足够
- 🔧 **自动构建**: Git推送自动部署
- 🖼️ **完美支持**: Node.js + Sharp 图片处理

### 📋 部署步骤

#### 1. 准备GitHub仓库

```bash
# 提交代码到GitHub
git add .
git commit -m "feat: 智能图片压缩工具"
git push origin main
```

#### 2. Vercel一键部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub登录
3. 点击 "New Project"
4. 选择 `compressImg` 仓库
5. 保持默认设置（我们已配置好 `vercel.json`）
6. 点击 "Deploy"

#### 3. 等待部署完成

- 3-5分钟后获得 `https://xxx.vercel.app` 地址
- 自动配置HTTPS和CDN
- 支持完整的图片压缩功能

### 📁 预配置文件

项目已包含所有必需的配置文件：

- ✅ `vercel.json` - Vercel部署配置
- ✅ `api/` - Serverless Functions
- ✅ `package.json` - Node.js依赖和构建脚本
- ✅ `public/` - 静态资源目录

### 🔧 技术架构

```
├── api/                    # Vercel Serverless Functions
│   ├── index.js           # 主API路由
│   ├── compress.js        # 图片压缩接口
│   ├── health.js          # 健康检查
│   └── formats.js         # 支持格式查询
├── public/                # 静态资源（构建生成）
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── vercel.json            # Vercel配置
```

### 🆘 常见问题

#### Q: 部署后图片压缩不工作？

**A**: 检查以下几点：

1. 确认API端点正常响应（访问 `/api/health`）
2. 检查浏览器控制台是否有错误
3. 查看Vercel部署日志中的错误信息

#### Q: 免费流量够用吗？

**A**: ✅ 够用。Vercel免费计划提供100GB流量，可以处理约10万张小图片。

#### Q: 可以绑定自定义域名吗？

**A**: ✅ 可以。Vercel支持免费绑定自定义域名，并自动配置SSL证书。

#### Q: 支持哪些图片格式？

**A**: 支持输入格式：JPG, PNG, WebP, GIF, BMP, TIFF
输出格式：WebP, JPG, PNG, GIF（保持动画）

### 🚀 立即开始部署

1. **Fork 或 Clone 项目**
2. **推送到你的 GitHub 仓库**
3. **在 [Vercel](https://vercel.com) 上导入项目**
4. **3-5分钟后享受在线图片压缩工具！**

---

_📝 注意：本项目已针对Vercel平台进行完整优化，确保所有功能正常运行。_