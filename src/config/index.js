const { getConfig } = require('./env');
const { FONT_SIZE_MAP } = require('./constants');

// Get the configuration object
const config = getConfig();

// Export configuration and constants
module.exports = {
  config,
  FONT_SIZE_MAP
};