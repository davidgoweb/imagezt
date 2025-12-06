const cors = require('cors');

/**
 * Create CORS middleware based on configuration
 * @param {Object} config - CORS configuration
 * @returns {Function|undefined} CORS middleware or undefined if disabled
 */
const createCorsMiddleware = (config) => {
  if (!config.corsEnabled) {
    return undefined;
  }

  return cors({
    origin: config.corsOrigin || '*'
  });
};

module.exports = {
  createCorsMiddleware
};