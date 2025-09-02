// 🚀 健康检查 API - Vercel Serverless Function

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
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: '智能图片压缩 API 服务正常运行',
    features: {
      formats: ['webp', 'jpg', 'png', 'gif'],
      animated: true,
      maxFileSize: '50MB',
      batchProcessing: true,
    },
  });
}
