/**
 * Create favicon route handler
 * @returns {Function} Express route handler
 */
const createFaviconRoute = () => {
  return (req, res) => {
    res.status(204).end(); // No content
  };
};

/**
 * Create root route handler
 * @param {Object} config - Application configuration
 * @returns {Function} Express route handler
 */
const createRootRoute = (config) => {
  return (req, res) => {
    res.status(200).json({
      service: 'ImageZT',
      version: '1.0.0',
      description: 'Placeholder image generation service',
      usage: '/:width/:height/:bgColor/:fgColor?text=custom&fontSize=16&textWrap=true&textWrapWidth=80',
      examples: [
        '/800x600/ffffff/000000?text=Hello',
        '/400x300/ff0000/00ff00?text=Custom&fontSize=32',
        '/600x400/cccccc/333333?text=Long text that wraps&textWrap=true',
        '/500x300/000000/ffffff?text=Wrapped text&fontSize=24&textWrap=true&textWrapWidth=70'
      ],
      parameters: {
        text: 'Custom text to display (defaults to dimensions)',
        fontSize: `Font size in pixels (${config.minFontSize}-${config.maxFontSize}, defaults to auto)`,
        textWrap: 'Enable text wrapping (true/false, defaults to ' + config.defaultTextWrap + ')',
        textWrapWidth: `Text wrap width percentage (${config.minTextWrapWidth}-${config.maxTextWrapWidth}, defaults to ${config.defaultTextWrapWidth})`
      }
    });
  };
};

module.exports = {
  createFaviconRoute,
  createRootRoute
};