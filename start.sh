#!/bin/bash

# 🚀 智能图片压缩工具启动脚本

echo "🖼️  智能图片压缩工具"
echo "========================="

# 检查 Node.js 版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 版本过低，请升级到 16+"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# 检查系统依赖 (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 检查 Linux 系统依赖..."

    if ! dpkg -l | grep -q libvips; then
        echo "⚠️  未找到 libvips-dev，尝试安装..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y libvips-dev build-essential
        elif command -v yum &> /dev/null; then
            sudo yum groupinstall "Development Tools" && sudo yum install vips-devel
        else
            echo "❌ 无法自动安装依赖，请手动安装 libvips-dev"
            exit 1
        fi
    fi
fi

# 安装 npm 依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install

    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 依赖已安装"
fi

# 创建必要的目录
mkdir -p tmp
echo "✅ 创建临时目录"

# 设置环境变量
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3000}

echo ""
echo "🎯 配置信息:"
echo "   环境: $NODE_ENV"
echo "   端口: $PORT"
echo "   目录: $(pwd)"

echo ""
echo "🚀 启动服务器..."

# 启动应用
if [ "$NODE_ENV" = "development" ]; then
    # 开发模式
    if command -v nodemon &> /dev/null; then
        nodemon server.js
    else
        echo "💡 提示: 安装 nodemon 可启用热重载"
        echo "   npm install -g nodemon"
        node server.js
    fi
else
    # 生产模式
    node server.js
fi
