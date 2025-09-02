// Netlify Functions版本
const serverless = require('serverless-http');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 文件上传配置
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'netlify',
    features: {
      formats: ['webp', 'jpg', 'png', 'gif'],
      animated: true,
      maxFileSize: '50MB',
      batchProcessing: true,
    },
  });
});

// 图片压缩API
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
        console.warn('设置解析失败，使用默认设置');
      }
    }

    const { width, height, quality = 85, format = 'webp', keepRatio = true } = settings;

    let sharpInstance = sharp(req.file.buffer);

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

    // 设置输出格式
    switch (format) {
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
        });
        break;
    }

    const processedBuffer = await sharpInstance.toBuffer();
    const compressionRatio = (
      ((req.file.buffer.length - processedBuffer.length) / req.file.buffer.length) *
      100
    ).toFixed(1);

    // 设置响应头
    res.set({
      'Content-Type': `image/${format === 'jpg' ? 'jpeg' : format}`,
      'Content-Length': processedBuffer.length,
      'Content-Disposition': `attachment; filename="compressed.${format}"`,
      'X-Original-Size': req.file.buffer.length,
      'X-Compressed-Size': processedBuffer.length,
      'X-Compression-Ratio': compressionRatio,
    });

    res.send(processedBuffer);
  } catch (error) {
    console.error('压缩API错误:', error);
    res.status(500).json({
      error: '图片压缩失败',
      message: error.message,
      code: 'COMPRESSION_FAILED',
    });
  }
});

module.exports.handler = serverless(app);
