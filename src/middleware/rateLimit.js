const rateLimit = require('express-rate-limit');

/**
 * Create rate limiting middleware based on configuration
 * @param {Object} config - Rate limiting configuration
 * @returns {Function|undefined} Rate limiting middleware or undefined if disabled
 */
const createRateLimitMiddleware = (config) => {
  if (!config.rateLimitEnabled) {
    return undefined;
  }

  return rateLimit({
    windowMs: config.rateLimitWindow,
    max: config.rateLimitMax,
    message: 'Too many requests from this IP, please try again later.'
  });
};

module.exports = {
  createRateLimitMiddleware
};