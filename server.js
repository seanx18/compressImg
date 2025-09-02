// 🚀 智能图片压缩工具 - 后端服务

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { createIPX } = require('ipx');
const sharp = require('sharp');

const app = express();
const port = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.', { index: 'index.html' }));

// 文件上传配置
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片文件格式'));
    }
  },
});

// 图片压缩核心类
class ImageCompressor {
  constructor() {
    // 初始化IPX实例
    this.ipx = createIPX({});
  }

  /**
   * 压缩图片的主要方法
   */
  async compressImage(buffer, settings) {
    try {
      const {
        width,
        height,
        quality = 85,
        format = 'webp',
        isAnimated = false,
        keepRatio = true,
        outputName,
      } = settings;

      console.log('🔄 开始压缩图片...', {
        originalSize: buffer.length,
        settings: { width, height, quality, format, isAnimated },
      });

      // 检查是否为动画图片
      const shouldPreserveAnimation = isAnimated && (format === 'webp' || format === 'gif' || format === 'auto');

      let processedBuffer;

      if (shouldPreserveAnimation) {
        // 处理动画图片
        processedBuffer = await this.processAnimatedImage(buffer, settings);
      } else {
        // 处理静态图片
        processedBuffer = await this.processStaticImage(buffer, settings);
      }

      const compressionRatio = (((buffer.length - processedBuffer.length) / buffer.length) * 100).toFixed(1);

      console.log('✅ 压缩完成', {
        originalSize: buffer.length,
        compressedSize: processedBuffer.length,
        compressionRatio: compressionRatio + '%',
      });

      return {
        buffer: processedBuffer,
        originalSize: buffer.length,
        compressedSize: processedBuffer.length,
        compressionRatio: parseFloat(compressionRatio),
        outputName,
      };
    } catch (error) {
      console.error('❌ 压缩失败:', error);
      throw error;
    }
  }

  /**
   * 处理静态图片
   */
  async processStaticImage(buffer, settings) {
    const { width, height, quality = 85, format = 'webp', keepRatio = true } = settings;

    let sharpInstance = sharp(buffer);

    // 获取图片元数据
    const metadata = await sharpInstance.metadata();
    console.log('📏 图片信息:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
    });

    // 调整尺寸
    if (width || height) {
      const resizeOptions = {
        fit: keepRatio ? 'inside' : 'fill',
        withoutEnlargement: true,
      };

      if (width && height) {
        sharpInstance = sharpInstance.resize(width, height, resizeOptions);
      } else if (width) {
        sharpInstance = sharpInstance.resize(width, null, resizeOptions);
      } else if (height) {
        sharpInstance = sharpInstance.resize(null, height, resizeOptions);
      }
    }

    // 设置输出格式和质量
    const outputFormat = format === 'auto' ? this.detectBestFormat(metadata.format) : format;

    switch (outputFormat) {
      case 'webp':
        sharpInstance = sharpInstance.webp({
          quality,
          effort: 6, // 更好的压缩效果
          smartSubsample: true,
        });
        break;

      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({
          quality,
          progressive: true,
          optimiseScans: true,
        });
        break;

      case 'png':
        sharpInstance = sharpInstance.png({
          quality,
          compressionLevel: 9,
          progressive: true,
          palette: quality < 90, // 低质量时使用调色板
        });
        break;

      default:
        // 保持原格式
        break;
    }

    return await sharpInstance.toBuffer();
  }

  /**
   * 处理动画图片
   */
  async processAnimatedImage(buffer, settings) {
    const { width, height, quality = 85, format = 'webp', keepRatio = true } = settings;

    console.log('🎬 处理动画图片...');

    try {
      // 对于动画GIF转WebP
      if (format === 'webp' || format === 'auto') {
        let sharpInstance = sharp(buffer, { animated: true });

        // 调整尺寸
        if (width || height) {
          const resizeOptions = {
            fit: keepRatio ? 'inside' : 'fill',
            withoutEnlargement: true,
          };

          if (width && height) {
            sharpInstance = sharpInstance.resize(width, height, resizeOptions);
          } else if (width) {
            sharpInstance = sharpInstance.resize(width, null, resizeOptions);
          } else if (height) {
            sharpInstance = sharpInstance.resize(null, height, resizeOptions);
          }
        }

        // 转换为动画WebP
        sharpInstance = sharpInstance.webp({
          quality: Math.min(quality, 80), // 动画质量稍微降低以减少文件大小
          effort: 4, // 平衡压缩效果和速度
          smartSubsample: true,
        });

        return await sharpInstance.toBuffer();
      }

      // 如果要保持GIF格式或其他情况，进行基本压缩
      return await this.processStaticImage(buffer, {
        ...settings,
        format: 'gif',
      });
    } catch (error) {
      console.warn('⚠️ 动画处理失败，回退到静态处理:', error.message);
      // 回退到静态图片处理
      return await this.processStaticImage(buffer, settings);
    }
  }

  /**
   * 自动检测最佳输出格式
   */
  detectBestFormat(originalFormat) {
    switch (originalFormat) {
      case 'png':
        return 'webp'; // PNG转WebP效果最好
      case 'jpg':
      case 'jpeg':
        return 'webp'; // JPEG转WebP也有不错效果
      case 'gif':
        return 'webp'; // GIF转WebP可以大幅减小文件
      case 'webp':
        return 'webp'; // WebP保持WebP
      default:
        return 'webp'; // 默认使用WebP
    }
  }

  /**
   * 检测是否为动画图片
   */
  async isAnimatedImage(buffer, filename) {
    try {
      // 检查文件扩展名
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.gif') {
        return true;
      }

      // 检查WebP是否为动画
      if (ext === '.webp') {
        const metadata = await sharp(buffer).metadata();
        return metadata.pages && metadata.pages > 1;
      }

      return false;
    } catch (error) {
      console.warn('检测动画失败:', error.message);
      return false;
    }
  }
}

// 创建压缩器实例
const compressor = new ImageCompressor();

// API路由

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      formats: ['webp', 'jpg', 'png', 'gif'],
      animated: true,
      maxFileSize: '50MB',
      batchProcessing: true,
    },
  });
});

/**
 * 图片压缩接口
 */
app.post('/api/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: '没有上传文件',
        code: 'NO_FILE',
      });
    }

    // 解析设置
    let settings = {};
    if (req.body.settings) {
      try {
        settings = JSON.parse(req.body.settings);
      } catch (error) {
        console.warn('设置解析失败，使用默认设置:', error.message);
      }
    }

    // 检测是否为动画图片
    const isAnimated = await compressor.isAnimatedImage(req.file.buffer, req.file.originalname);

    // 合并设置
    const finalSettings = {
      width: settings.width ? parseInt(settings.width) : null,
      height: settings.height ? parseInt(settings.height) : null,
      quality: settings.quality ? parseInt(settings.quality) : 85,
      format: settings.format || 'webp',
      isAnimated: settings.preserveAnimation && isAnimated,
      keepRatio: settings.keepRatio !== false,
      outputName: settings.outputName || `compressed_${Date.now()}.webp`,
    };

    console.log('📤 开始处理文件:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      settings: finalSettings,
    });

    // 压缩图片
    const result = await compressor.compressImage(req.file.buffer, finalSettings);

    // 设置响应头
    res.set({
      'Content-Type': `image/${finalSettings.format === 'jpg' ? 'jpeg' : finalSettings.format}`,
      'Content-Length': result.compressedSize,
      'Content-Disposition': `attachment; filename="${result.outputName}"`,
      'X-Original-Size': result.originalSize,
      'X-Compressed-Size': result.compressedSize,
      'X-Compression-Ratio': result.compressionRatio,
    });

    // 返回压缩后的图片
    res.send(result.buffer);
  } catch (error) {
    console.error('❌ 压缩API错误:', error);

    res.status(500).json({
      error: '图片压缩失败',
      message: error.message,
      code: 'COMPRESSION_FAILED',
    });
  }
});

/**
 * 批量压缩接口
 */
app.post('/api/compress/batch', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: '没有上传文件',
        code: 'NO_FILES',
      });
    }

    console.log(`📤 开始批量处理 ${req.files.length} 个文件`);

    const results = [];
    let settings = {};

    if (req.body.settings) {
      try {
        settings = JSON.parse(req.body.settings);
      } catch (error) {
        console.warn('设置解析失败，使用默认设置');
      }
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        // 检测动画
        const isAnimated = await compressor.isAnimatedImage(file.buffer, file.originalname);

        const fileSettings = {
          ...settings,
          isAnimated: settings.preserveAnimation && isAnimated,
          outputName: settings.keepOriginalName
            ? file.originalname.replace(/\.[^/.]+$/, `.${settings.format || 'webp'}`)
            : `compressed_${i + 1}_${Date.now()}.${settings.format || 'webp'}`,
        };

        const result = await compressor.compressImage(file.buffer, fileSettings);

        results.push({
          originalName: file.originalname,
          outputName: result.outputName,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          success: true,
        });
      } catch (error) {
        console.error(`文件 ${file.originalname} 处理失败:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false,
        });
      }
    }

    // 统计结果
    const successCount = results.filter((r) => r.success).length;
    const totalOriginalSize = results.reduce((sum, r) => sum + (r.originalSize || 0), 0);
    const totalCompressedSize = results.reduce((sum, r) => sum + (r.compressedSize || 0), 0);
    const overallRatio =
      totalOriginalSize > 0 ? (((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      summary: {
        total: req.files.length,
        successful: successCount,
        failed: req.files.length - successCount,
        totalOriginalSize,
        totalCompressedSize,
        overallCompressionRatio: parseFloat(overallRatio),
        spaceSaved: totalOriginalSize - totalCompressedSize,
      },
      results,
    });
  } catch (error) {
    console.error('❌ 批量压缩API错误:', error);

    res.status(500).json({
      error: '批量压缩失败',
      message: error.message,
      code: 'BATCH_COMPRESSION_FAILED',
    });
  }
});

/**
 * 获取支持的格式信息
 */
app.get('/api/formats', (req, res) => {
  res.json({
    input: {
      formats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp', 'tiff'],
      maxSize: '50MB',
      animated: ['gif', 'webp'],
    },
    output: {
      formats: ['webp', 'jpg', 'png', 'gif'],
      quality: { min: 10, max: 100, default: 85 },
      features: {
        resize: true,
        keepRatio: true,
        animation: true,
        progressive: true,
      },
    },
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('❌ 服务器错误:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: '文件太大',
        message: '单个文件大小不能超过 50MB',
        code: 'FILE_TOO_LARGE',
      });
    }

    return res.status(400).json({
      error: '文件上传错误',
      message: error.message,
      code: error.code,
    });
  }

  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试',
    code: 'INTERNAL_ERROR',
  });
});

// 404处理
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: 'API接口不存在',
      path: req.path,
      code: 'NOT_FOUND',
    });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`
🚀 智能图片压缩工具已启动！

📱 本地访问: http://localhost:${port}
🔗 网络访问: http://0.0.0.0:${port}

🎯 功能特性:
  ✅ 支持格式: JPG, PNG, WebP, GIF, BMP, TIFF
  ✅ 自定义尺寸和质量
  ✅ 动画图片支持
  ✅ 批量处理
  ✅ 实时预览

⚡ API端点:
  GET  /api/health     - 健康检查
  POST /api/compress   - 单文件压缩
  POST /api/compress/batch - 批量压缩
  GET  /api/formats    - 支持格式

🎉 准备就绪，开始压缩图片吧！
    `);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 正在关闭服务器...');
  process.exit(0);
});

module.exports = app;
