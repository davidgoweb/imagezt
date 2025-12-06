const { initializeCaches, createApiRoute } = require('./api');
const { createHealthRoute } = require('./health');
const { createFaviconRoute, createRootRoute } = require('./static');

/**
 * Setup all application routes
 * @param {Object} app - Express application
 * @param {Object} config - Application configuration
 * @param {Object} fontSizeMap - Font size mapping
 * @returns {Object} Object containing caches for use in other parts of the application
 */
const setupRoutes = (app, config, fontSizeMap) => {
  // Initialize caches
  const caches = initializeCaches(config.maxCacheSize);

  // Setup static routes
  app.get('/favicon.ico', createFaviconRoute());
  app.get('/', createRootRoute(config));

  // Setup health check route if enabled
  if (config.healthCheckEnabled) {
    app.get(config.healthCheckPath, createHealthRoute(config));
  }

  // Setup main API route
  app.get('/:dims/:bgColor/:fgColor', createApiRoute(config, caches, fontSizeMap));

  return caches;
};

module.exports = {
  setupRoutes,
  // Export individual route creators for testing or custom setups
  initializeCaches,
  createApiRoute,
  createHealthRoute,
  createFaviconRoute,
  createRootRoute
};