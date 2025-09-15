const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://l2.ai-capstone.store:8081',
      changeOrigin: true,
    })
  );

  app.use(
    '/explorer',
    createProxyMiddleware({
      target: 'http://l4.ai-capstone.store:8081',
      changeOrigin: true,
    })
  );
};
