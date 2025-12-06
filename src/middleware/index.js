const { createCorsMiddleware } = require('./cors');
const { createRateLimitMiddleware } = require('./rateLimit');
const { setupLogging } = require('./logging');
const { createTimeoutMiddleware } = require('./timeout');

/**
 * Setup all middleware for the application
 * @param {Object} app - Express application
 * @param {Object} config - Application configuration
 */
const setupMiddleware = (app, config) => {
  // Setup logging first
  setupLogging(app, config);

  // Setup CORS if enabled
  const corsMiddleware = createCorsMiddleware(config);
  if (corsMiddleware) {
    app.use(corsMiddleware);
  }

  // Setup rate limiting if enabled
  const rateLimitMiddleware = createRateLimitMiddleware(config);
  if (rateLimitMiddleware) {
    app.use(rateLimitMiddleware);
  }

  // Setup request timeout
  const timeoutMiddleware = createTimeoutMiddleware(config.requestTimeout);
  app.use(timeoutMiddleware);
};

module.exports = {
  setupMiddleware,
  // Export individual middleware creators for testing or custom setups
  createCorsMiddleware,
  createRateLimitMiddleware,
  setupLogging,
  createTimeoutMiddleware
};