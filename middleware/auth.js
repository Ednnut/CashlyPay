const colors = require('colors/safe');

let warningLogged = false;

const getTokenFromRequest = (req) => {
  const authHeader = req.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  const apiKeyHeader = req.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader.trim();
  }

  return null;
};

const requireAuth = (req, res, next) => {
  const configuredToken = process.env.ADMIN_API_TOKEN;

  if (!configuredToken) {
    if (process.env.NODE_ENV !== 'production' && !warningLogged) {
      // eslint-disable-next-line no-console
      console.warn(
        colors.bold.yellow(
          'ADMIN_API_TOKEN is not configured. Authentication middleware is allowing all requests.'
        )
      );
      warningLogged = true;
    }

    return next();
  }

  const token = getTokenFromRequest(req);
  if (token && token === configuredToken) {
    return next();
  }

  return res.status(401).json({
    message: 'Unauthorized: valid bearer token required.',
  });
};

module.exports = requireAuth;
