const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://voting.jw-capstone.store',
      changeOrigin: true,
    })
  );

  app.use(
    '/explorer',
    createProxyMiddleware({
      target: 'https://voting.jw-capstone.store',
      changeOrigin: true,
    })
  );
};