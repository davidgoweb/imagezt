const express = require('express');
const { setupMiddleware } = require('../middleware');
const { setupRoutes } = require('../routes');
const { setupGracefulShutdown, setupErrorHandlers, configureServer } = require('./gracefulShutdown');

/**
 * Initialize and configure Express application
 * @param {Object} config - Application configuration
 * @param {Object} fontSizeMap - Font size mapping
 * @returns {Object} Object containing app and server instances
 */
const initializeServer = (config, fontSizeMap) => {
  // Create Express app
  const app = express();

  // Performance optimizations
  app.set('etag', false); // We handle ETags manually
  app.set('x-powered-by', false); // Remove X-Powered-By header

  // Setup middleware
  setupMiddleware(app, config);

  // Setup routes
  const caches = setupRoutes(app, config, fontSizeMap);

  // Start server
  const server = app.listen(config.port, config.host, () => {
    console.log(`ImageZT placeholder service running on http://${config.host}:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);

    if (config.debug) {
      console.log('Configuration:', {
        port: config.port,
        host: config.host,
        imageFormat: config.imageFormat,
        imageQuality: config.imageQuality,
        cacheMaxAge: config.cacheMaxAge,
        maxImageDimension: config.maxImageDimension,
        corsEnabled: config.corsEnabled,
        rateLimitEnabled: config.rateLimitEnabled,
        healthCheckEnabled: config.healthCheckEnabled,
        maxCacheSize: config.maxCacheSize,
        // Font settings
        defaultFontSize: config.defaultFontSize,
        minFontSize: config.minFontSize,
        maxFontSize: config.maxFontSize,
        fontSizeAutoFallback: config.fontSizeAutoFallback,
        // Text wrapping settings
        defaultTextWrap: config.defaultTextWrap,
        defaultTextWrapWidth: config.defaultTextWrapWidth,
        minTextWrapWidth: config.minTextWrapWidth,
        maxTextWrapWidth: config.maxTextWrapWidth
      });
    }
  });

  // Configure server settings
  configureServer(server);

  // Setup error handlers
  setupErrorHandlers(server, config.port);

  // Setup graceful shutdown
  setupGracefulShutdown(server);

  return {
    app,
    server,
    caches
  };
};

module.exports = {
  initializeServer
};