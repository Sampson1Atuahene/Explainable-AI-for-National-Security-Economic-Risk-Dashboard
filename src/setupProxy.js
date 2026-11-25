const { createProxyMiddleware } = require('http-proxy-middleware');

function removeForwardedCredentials(proxyRequest) {
  proxyRequest.removeHeader('cookie');
  proxyRequest.removeHeader('authorization');
}

module.exports = function setupProxy(app) {
  app.use(
    '/api/worldbank',
    createProxyMiddleware({
      target: 'https://api.worldbank.org',
      changeOrigin: true,
      pathRewrite: { '^/api/worldbank': '' },
      on: { proxyReq: removeForwardedCredentials },
    }),
  );
  app.use(
    '/api/fx',
    createProxyMiddleware({
      target: 'https://api.frankfurter.dev',
      changeOrigin: true,
      pathRewrite: { '^/api/fx': '' },
      on: { proxyReq: removeForwardedCredentials },
    }),
  );
};
