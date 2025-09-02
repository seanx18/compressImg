// 简单的测试端点
module.exports = (req, res) => {
  res.json({
    message: 'Vercel API 工作正常！',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
