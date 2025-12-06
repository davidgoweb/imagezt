const morgan = require('morgan');
const fs = require('fs');

/**
 * Create console logging middleware based on configuration
 * @param {Object} config - Logging configuration
 * @returns {Function|undefined} Morgan middleware or undefined if disabled
 */
const createConsoleLoggingMiddleware = (config) => {
  // Enable console logging in development or debug mode
  if (config.nodeEnv === 'development' || config.logLevel === 'debug') {
    return morgan(config.logFormat);
  }
  
  return undefined;
};

/**
 * Create file logging middleware based on configuration
 * @param {Object} config - Logging configuration
 * @returns {Function|undefined} Morgan middleware or undefined if disabled
 */
const createFileLoggingMiddleware = (config) => {
  if (!config.logFileEnabled) {
    return undefined;
  }

  const logStream = fs.createWriteStream(config.logFilePath, { flags: 'a' });
  return morgan(config.logFormat, { stream: logStream });
};

/**
 * Setup all logging middleware
 * @param {Object} app - Express application
 * @param {Object} config - Logging configuration
 */
const setupLogging = (app, config) => {
  const consoleMiddleware = createConsoleLoggingMiddleware(config);
  if (consoleMiddleware) {
    app.use(consoleMiddleware);
  }

  const fileMiddleware = createFileLoggingMiddleware(config);
  if (fileMiddleware) {
    app.use(fileMiddleware);
  }
};

module.exports = {
  createConsoleLoggingMiddleware,
  createFileLoggingMiddleware,
  setupLogging
};