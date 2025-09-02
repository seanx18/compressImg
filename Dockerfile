# SeaArt 图片压缩工具 Docker 配置

# 使用官方 Node.js 18 Alpine 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3 \
    make \
    g++ \
    libc6-compat

# 复制包管理文件
COPY package*.json ./

# 安装 Node.js 依赖
RUN npm ci --only=production --no-audit --no-fund

# 复制应用源代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 创建必要的目录并设置权限
RUN mkdir -p /app/tmp && \
    chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["node", "server.js"]
