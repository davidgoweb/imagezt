/**
 * Create request timeout middleware
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Function} Express middleware
 */
const createTimeoutMiddleware = (timeout) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      if (!res.headersSent) {
        res.status(408).send('Request timeout');
      }
    });
    next();
  };
};

module.exports = {
  createTimeoutMiddleware
};