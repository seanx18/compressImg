# 🚀 智能压缩工具图片压缩工具 - 在线部署指南

> **重要说明**: GitHub Pages 不支持 Node.js 后端，请使用 Vercel 或 Netlify

## ⚠️ GitHub Pages 限制说明

| 功能需求        | GitHub Pages    | Vercel/Netlify  |
| --------------- | --------------- | --------------- |
| 静态HTML/CSS/JS | ✅ 支持         | ✅ 支持         |
| Node.js 服务器  | ❌ **不支持**   | ✅ **完美支持** |
| npm 依赖安装    | ❌ **不支持**   | ✅ **自动安装** |
| Sharp 图片处理  | ❌ **无法运行** | ✅ **原生支持** |
| Express API     | ❌ **不支持**   | ✅ **完美支持** |

**结论**: 我们的图片压缩工具需要后端API处理，GitHub Pages 无法满足需求。

---

## 🎯 推荐部署方案

### 🥇 方案1：Vercel部署 (最佳选择)

#### 特色优势

- ⚡ **一键部署**: 零配置，3分钟上线
- 🌐 **自动HTTPS**: 免费SSL证书
- 🚀 **全球CDN**: 访问速度极快
- 📊 **100GB免费流量**: 个人使用足够
- 🔧 **自动构建**: Git推送自动部署

#### 部署步骤

1. **准备GitHub仓库**

   ```bash
   # 运行快速部署脚本
   ./deploy-quick.sh

   # 手动执行（如果脚本失败）
   git add .
   git commit -m "feat: 智能压缩工具图片压缩工具"
   git remote add origin https://github.com/你的用户名/compressImg.git
   git push -u origin main
   ```

2. **Vercel一键部署**

   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub登录
   - 点击 "New Project"
   - 选择 `compressImg` 仓库
   - 保持默认设置（我们已配置好 `vercel.json`）
   - 点击 "Deploy"

3. **等待部署完成**
   - 3-5分钟后获得 `https://xxx.vercel.app` 地址
   - 自动配置HTTPS和CDN

#### 预配置文件

- ✅ `vercel.json` - Vercel部署配置
- ✅ `server.js` - Express服务器
- ✅ `package.json` - Node.js依赖

---

### 🥈 方案2：Netlify部署 (备选)

#### 特色优势

- 🎯 **Functions支持**: Serverless架构
- 🔄 **自动部署**: Git推送自动构建
- 💾 **100GB免费流量**: 充足的配额
- 🛠️ **丰富插件**: 扩展功能强大

#### 部署步骤

1. **安装额外依赖**

   ```bash
   npm install serverless-http
   ```

2. **上传代码到GitHub** (同Vercel步骤1)

3. **Netlify部署**
   - 访问 [netlify.com](https://netlify.com)
   - 点击 "New site from Git"
   - 选择GitHub仓库
   - 构建设置自动检测
   - 点击 "Deploy site"

#### 预配置文件

- ✅ `netlify.toml` - Netlify配置
- ✅ `.netlify/functions/server.js` - Serverless函数
- ✅ `serverless-http` - 函数适配器

---

### 🔄 方案3：Railway部署 (高级)

适合需要数据库的场景：

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 部署到Railway
railway login
railway init
railway up
```

---

## 📊 方案对比总结

| 特性            | Vercel     | Netlify      | GitHub Pages    |
| --------------- | ---------- | ------------ | --------------- |
| **Node.js支持** | ✅ 完美    | ✅ Functions | ❌ 不支持       |
| **部署难度**    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐     | ⭐⭐⭐ (仅静态) |
| **免费配额**    | 100GB      | 100GB        | 1GB             |
| **构建时间**    | 2-3分钟    | 3-5分钟      | 1分钟 (静态)    |
| **HTTPS**       | ✅ 自动    | ✅ 自动      | ✅ 自动         |
| **自定义域名**  | ✅ 支持    | ✅ 支持      | ✅ 支持         |
| **图片处理**    | ✅ 完美    | ✅ 支持      | ❌ 无法运行     |

## 🎉 推荐选择

**🏆 强烈推荐 Vercel**：

- 配置最简单（零配置）
- 性能最优秀
- 对Node.js支持最好
- 我们已经预配置完毕

## 🆘 常见问题

### Q: GitHub Pages 能运行吗？

**A**: ❌ 不能。GitHub Pages只支持静态文件，不能运行Node.js服务器和Sharp图片处理。

### Q: 部署后图片压缩不工作？

**A**: 检查以下几点：

1. 确认使用Vercel/Netlify，而非GitHub Pages
2. 检查Sharp依赖是否正确安装
3. 查看部署日志中的错误信息

### Q: 免费流量够用吗？

**A**: ✅ 够用。100GB流量可以处理约10万张小图片。

### Q: 可以绑定自定义域名吗？

**A**: ✅ 可以。Vercel和Netlify都支持免费绑定自定义域名。

---

## 🚀 立即开始部署

1. **运行快速部署脚本**：

   ```bash
   ./deploy-quick.sh
   ```

2. **选择部署平台**：

   - 🥇 [Vercel](https://vercel.com) (推荐)
   - 🥈 [Netlify](https://netlify.com) (备选)

3. **3-5分钟后享受在线图片压缩工具！**

---

_📝 注意：本指南确保您的工具能在线正常运行，避免GitHub Pages的限制问题。_
