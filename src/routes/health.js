/**
 * Create health check route handler
 * @param {Object} config - Application configuration
 * @returns {Function} Express route handler
 */
const createHealthRoute = (config) => {
  return (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv
    });
  };
};

module.exports = {
  createHealthRoute
};