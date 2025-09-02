// 🚀 支持格式信息 API - Vercel Serverless Function

export default function handler(req, res) {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: '方法不允许',
      message: '只支持 GET 请求',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  return res.json({
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
}
