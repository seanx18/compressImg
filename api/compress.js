// 🚀 图片压缩 API - Vercel Serverless Function

const multer = require('multer');
const cors = require('cors');
const path = require('path');
const sharp = require('sharp');

// CORS 配置
const corsOptions = {
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
};

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
          effort: 6,
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
          palette: quality < 90,
        });
        break;

      default:
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
      if (format === 'webp' || format === 'auto') {
        let sharpInstance = sharp(buffer, { animated: true });

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

        sharpInstance = sharpInstance.webp({
          quality: Math.min(quality, 80),
          effort: 4,
          smartSubsample: true,
        });

        return await sharpInstance.toBuffer();
      }

      return await this.processStaticImage(buffer, {
        ...settings,
        format: 'gif',
      });
    } catch (error) {
      console.warn('⚠️ 动画处理失败，回退到静态处理:', error.message);
      return await this.processStaticImage(buffer, settings);
    }
  }

  /**
   * 自动检测最佳输出格式
   */
  detectBestFormat(originalFormat) {
    switch (originalFormat) {
      case 'png':
        return 'webp';
      case 'jpg':
      case 'jpeg':
        return 'webp';
      case 'gif':
        return 'webp';
      case 'webp':
        return 'webp';
      default:
        return 'webp';
    }
  }

  /**
   * 检测是否为动画图片
   */
  async isAnimatedImage(buffer, filename) {
    try {
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.gif') {
        return true;
      }

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

// Serverless Function 处理器
export default async function handler(req, res) {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: '方法不允许',
      message: '只支持 POST 请求',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    // 使用 multer 处理文件上传
    const uploadMiddleware = upload.single('file');
    
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

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
    res.setHeader('Content-Type', `image/${finalSettings.format === 'jpg' ? 'jpeg' : finalSettings.format}`);
    res.setHeader('Content-Length', result.compressedSize);
    res.setHeader('Content-Disposition', `attachment; filename="${result.outputName}"`);
    res.setHeader('X-Original-Size', result.originalSize);
    res.setHeader('X-Compressed-Size', result.compressedSize);
    res.setHeader('X-Compression-Ratio', result.compressionRatio);

    // 返回压缩后的图片
    return res.send(result.buffer);
  } catch (error) {
    console.error('❌ 压缩API错误:', error);

    return res.status(500).json({
      error: '图片压缩失败',
      message: error.message,
      code: 'COMPRESSION_FAILED',
    });
  }
}
