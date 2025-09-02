# 🖼️ 智能图片压缩工具

基于 IPX + Sharp 的 Web 图片压缩工具，提供与 nuxt-img 相同的压缩效果，支持自定义尺寸和动画图片处理。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-brightgreen.svg)
![Express](https://img.shields.io/badge/express-4.18.2-lightgrey.svg)
![Sharp](https://img.shields.io/badge/sharp-0.33.1-orange.svg)

## ✨ 核心特性

- 🎯 **与 nuxt-img 相同的压缩算法**：使用 IPX + Sharp 技术栈
- 🎬 **完美支持动画**：GIF 和动画 WebP 无损转换
- 📏 **自定义尺寸**：支持宽高设置，保持比例可选
- 🎨 **多种输出格式**：WebP、JPEG、PNG、GIF
- 📱 **现代化界面**：响应式设计，支持深色模式
- 🚀 **批量处理**：支持多文件同时压缩
- 📊 **详细统计**：压缩率、节省空间、处理时间
- ⚡ **实时预览**：拖拽上传，即时预览效果
- 💾 **保持文件名**：可选择保持原始文件名
- 🎛️ **质量调节**：10-100% 质量范围可调

## 🌐 在线演示

- **Vercel**: [https://compress-img-xi.vercel.app](https://compress-img-xi.vercel.app)

## 🚀 快速开始

### 方式一：本地运行

```bash
# 1. 克隆项目
git clone https://github.com/seanx18/compressImg.git
cd compressImg

# 2. 安装依赖
npm install

# 3. 启动服务
npm start

# 4. 打开浏览器访问
open http://localhost:3000
```

### 方式二：开发模式

```bash
# 启用热重载
npm run dev
```

## 📦 安装要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **系统要求**:
  - Linux: libc6-dev, libvips-dev
  - macOS: 自动安装
  - Windows: 自动安装

### Linux 系统准备

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential libvips-dev

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install vips-devel
```

## 🎯 使用指南

### 1. 基础压缩

1. **上传图片**: 点击或拖拽图片到上传区域
2. **调整设置**:
   - 📏 尺寸：设置目标宽度和高度
   - 🎯 质量：调节压缩质量 (10-100%)
   - 📋 格式：选择输出格式
   - 🎬 动画：是否保持动画效果
3. **开始压缩**: 点击"开始压缩"按钮
4. **下载结果**: 单个下载或批量打包下载

### 2. 高级功能

#### 自定义尺寸

```
✅ 指定宽度：图片按比例缩放到指定宽度
✅ 指定高度：图片按比例缩放到指定高度
✅ 指定宽高：精确控制输出尺寸
✅ 保持比例：避免图片变形
```

#### 格式转换

```
WebP (推荐) - 最佳压缩率，现代浏览器支持
JPEG        - 最佳兼容性，适合照片
PNG         - 支持透明度，适合图标
自动选择     - 系统智能选择最佳格式
```

#### 动画处理

```
GIF → WebP: 显著减小文件大小 (50-70% 压缩率)
动画WebP优化: 进一步优化已有动画WebP
静态转换: 可选择将动画转为静态图片
```

### 3. 快捷键

- **Ctrl/Cmd + O**: 选择文件
- **Ctrl/Cmd + Enter**: 开始压缩
- **拖拽上传**: 直接拖拽图片到页面

## 🔧 配置说明

### 环境变量

```bash
# .env 文件
PORT=3000                    # 服务器端口
NODE_ENV=production          # 环境模式
MAX_FILE_SIZE=52428800       # 最大文件大小 (50MB)
UPLOAD_LIMIT=50              # 最大上传数量
QUALITY_MIN=10               # 最小质量
QUALITY_MAX=100              # 最大质量
QUALITY_DEFAULT=85           # 默认质量
```

### 自定义设置

修改 `server.js` 中的配置：

```javascript
// 文件大小限制
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// 默认压缩设置
const defaultSettings = {
  quality: 85,
  format: 'webp',
  keepRatio: true,
  preserveAnimation: true,
};
```

## 📊 性能基准

### 压缩效果对比

| 原始格式 | 原始大小 | 压缩格式 | 压缩后大小 | 压缩率 | 质量损失 |
| -------- | -------- | -------- | ---------- | ------ | -------- |
| PNG      | 2.5 MB   | WebP     | 0.8 MB     | 68%    | 几乎无   |
| JPEG     | 1.8 MB   | WebP     | 1.2 MB     | 33%    | 很少     |
| GIF      | 5.2 MB   | WebP     | 1.6 MB     | 69%    | 无       |
| WebP     | 2.1 MB   | WebP优化 | 1.7 MB     | 19%    | 无       |

### 处理速度

| 操作类型 | 文件大小 | 处理时间 | 说明      |
| -------- | -------- | -------- | --------- |
| 静态压缩 | < 1MB    | 0.2-0.5s | 快速处理  |
| 静态压缩 | 1-5MB    | 0.5-2s   | 标准处理  |
| 动画压缩 | < 2MB    | 1-3s     | GIF转WebP |
| 批量处理 | 10文件   | 3-8s     | 并发处理  |

## 🚢 部署指南

### Vercel 一键部署

本项目已针对 Vercel 平台进行完整优化：

```bash
# 方式一：使用 Vercel CLI
npm i -g vercel
vercel login
vercel --prod

# 方式二：网页部署
# 1. 访问 https://vercel.com
# 2. 导入 GitHub 仓库
# 3. 一键部署
```

**特性支持**：
- ✅ Serverless Functions
- ✅ 自动HTTPS和CDN
- ✅ 100GB免费流量
- ✅ Node.js + Sharp 完美支持

详细部署指南请查看 [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)

## 🛠️ API 文档

### 单文件压缩

```bash
POST /api/compress
Content-Type: multipart/form-data

Parameters:
- file: 图片文件
- settings: JSON字符串
  {
    "width": 800,           // 可选
    "height": 600,          // 可选
    "quality": 85,          // 10-100
    "format": "webp",       // webp|jpg|png|gif|auto
    "preserveAnimation": true,
    "keepOriginalName": true,
    "keepRatio": true
  }

Response:
- 压缩后的图片二进制数据
- Headers:
  - X-Original-Size: 原始大小
  - X-Compressed-Size: 压缩后大小
  - X-Compression-Ratio: 压缩率
```

### 批量压缩

```bash
POST /api/compress/batch
Content-Type: multipart/form-data

Parameters:
- files[]: 多个图片文件
- settings: 压缩设置JSON

Response:
{
  "success": true,
  "summary": {
    "total": 5,
    "successful": 4,
    "failed": 1,
    "overallCompressionRatio": 65.2,
    "spaceSaved": 15728640
  },
  "results": [...]
}
```

### 健康检查

```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "version": "1.0.0",
  "features": {
    "formats": ["webp", "jpg", "png", "gif"],
    "animated": true,
    "maxFileSize": "50MB",
    "batchProcessing": true
  }
}
```

## 🔍 故障排除

### 常见问题

1. **Sharp 安装失败**

   ```bash
   # 清除缓存重新安装
   npm cache clean --force
   npm uninstall sharp
   npm install sharp

   # Linux 系统缺少依赖
   sudo apt-get install libvips-dev
   ```

2. **内存不足错误**

   ```bash
   # 增加 Node.js 内存限制
   node --max-old-space-size=8192 server.js

   # 或在 package.json 中设置
   "start": "node --max-old-space-size=8192 server.js"
   ```

3. **文件上传失败**

   - 检查文件大小是否超过 50MB
   - 确认文件格式是否支持
   - 检查网络连接状态

4. **动画处理失败**

   ```bash
   # 确保 Sharp 支持动画
   npm install sharp@latest

   # 强制重建二进制文件
   npm rebuild sharp
   ```

### 性能优化

1. **服务器优化**

   ```javascript
   // 启用 gzip 压缩
   app.use(compression());

   // 增加并发处理数
   const cluster = require('cluster');
   const numCPUs = require('os').cpus().length;
   ```

2. **内存优化**

   ```javascript
   // 限制并发上传
   const semaphore = require('semaphore')(5);

   // 及时释放内存
   sharpInstance = null;
   buffer = null;
   ```

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 开发环境设置

```bash
# 1. Fork 项目
# 2. 克隆你的 fork
git clone https://github.com/seanx18/compressImg.git

# 3. 创建新分支
git checkout -b feature/amazing-feature

# 4. 安装依赖
npm install

# 5. 开始开发
npm run dev
```

### 提交规范

```bash
# 格式: type(scope): description

git commit -m "feat(compress): 添加动画WebP支持"
git commit -m "fix(ui): 修复响应式布局问题"
git commit -m "docs(readme): 更新部署指南"
```

### 发布流程

1. 更新版本号: `npm version patch/minor/major`
2. 推送标签: `git push --tags`
3. 创建 Release
4. 自动部署

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- [Sharp](https://sharp.pixelplumbing.com/) - 高性能图片处理库
- [IPX](https://github.com/nuxt/image) - Nuxt Image 的核心引擎
- [Express.js](https://expressjs.com/) - Web 应用框架
- [Multer](https://github.com/expressjs/multer) - 文件上传中间件

## 📞 联系我们

- 项目主页: [GitHub](https://github.com/seanx18/compressImg)
- 问题反馈: [Issues](https://github.com/seanx18/compressImg/issues)
- 功能建议: [Discussions](https://github.com/seanx18/compressImg/discussions)
- 邮箱: your-email@example.com

---

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by 智能压缩工具 Team
