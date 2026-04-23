const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    const isDocker = process.env.REACT_APP_IN_DOCKER === 'true';
    const target = isDocker
        ? (process.env.REACT_APP_PROXY_TARGET_DOCKER || 'http://localhost:5099')
        : (process.env.REACT_APP_PROXY_TARGET_LOCAL || 'http://localhost:5099');
    const mode = isDocker ? 'DOCKER_CONTAINER' : 'LOCAL_DEVELOPMENT';

    app.use('/api', createProxyMiddleware({
        target,
        changeOrigin: true,
        family: 4,
        pathRewrite: { '^/api': '/api' },
        onError: (err, req, res) => {
            console.error(`Proxy error [${mode}]:`, err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Proxy Connection Error',
                message: `Cannot connect to backend at ${target}`,
                mode,
                suggestion: isDocker
                    ? 'Make sure Docker backend is running'
                    : 'Make sure local backend is running on port 5099'
            }));
        }
    }));
};