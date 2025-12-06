/**
 * Setup graceful shutdown handlers
 * @param {Object} server - HTTP server instance
 */
const setupGracefulShutdown = (server) => {
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  // Handle SIGTERM
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => shutdown('SIGINT'));
};

/**
 * Setup server error handlers
 * @param {Object} server - HTTP server instance
 * @param {number} port - Port number
 */
const setupErrorHandlers = (server, port) => {
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please use a different port.`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });
};

/**
 * Configure server performance settings
 * @param {Object} server - HTTP server instance
 */
const configureServer = (server) => {
  // Enable keep-alive for better performance
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
};

module.exports = {
  setupGracefulShutdown,
  setupErrorHandlers,
  configureServer
};