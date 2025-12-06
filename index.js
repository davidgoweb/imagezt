// Import configuration
const { config, FONT_SIZE_MAP } = require('./src/config');

// Import server initialization
const { initializeServer } = require('./src/server');

// Initialize and start the server
const { app, server, caches } = initializeServer(config, FONT_SIZE_MAP);

// Export for testing or external use
module.exports = {
  app,
  server,
  config,
  caches,
  FONT_SIZE_MAP
};