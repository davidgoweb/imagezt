const {
  hexToJimpInt,
  isValidHexColor,
  validateDimensions,
  validateFontSize,
  validateTextWrapWidth,
  parseDimensions,
  buildCacheControl,
  generateImageCacheKey,
  generateETag
} = require('../utils');

const {
  selectFont,
  processText,
  generateImage,
  createImageCache,
  getCachedImage,
  cacheImage,
  isImageCached
} = require('../services');

/**
 * Create and initialize caches
 * @param {number} maxCacheSize - Maximum cache size
 * @returns {Object} Object containing image and font caches
 */
const initializeCaches = (maxCacheSize) => {
  return {
    imageCache: createImageCache(maxCacheSize),
    fontCache: require('../services/fontService').createFontCache(maxCacheSize)
  };
};

/**
 * Handle image generation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} config - Application configuration
 * @param {Object} caches - Cache objects
 * @param {Object} fontSizeMap - Font size mapping
 */
const handleImageRequest = async (req, res, config, caches, fontSizeMap) => {
  const { dims, bgColor, fgColor } = req.params;
  
  // Properly decode URL-encoded text
  let text = req.query.text || dims; // Use dims as default text
  if (req.query.text && typeof req.query.text === 'string') {
    text = decodeURIComponent(req.query.text);
  }
  
  const parsedDims = parseDimensions(dims);
  if (!parsedDims) {
    return res.status(400).send('Invalid dimensions format. Use WxH with positive numbers, e.g., 800x600');
  }

  const { width, height } = parsedDims;
  
  // Parse font and text wrapping parameters
  const fontSize = req.query.fontSize ? parseInt(req.query.fontSize) : null;
  const textWrap = req.query.textWrap !== undefined ? req.query.textWrap === 'true' : config.defaultTextWrap;
  const textWrapWidth = req.query.textWrapWidth ? parseInt(req.query.textWrapWidth) : config.defaultTextWrapWidth;
  
  if (config.debug) {
    console.log('Request params:', {
      dims,
      bgColor,
      fgColor,
      originalText: req.query.text,
      decodedText: text,
      fontSize,
      textWrap,
      textWrapWidth,
      query: req.query,
      parsedTextWrapWidth: textWrapWidth
    });
  }

  // Validate dimensions
  const dimValidation = validateDimensions(width, height, config.minImageDimension, config.maxImageDimension);
  if (!dimValidation.isValid) {
    return res.status(400).send(dimValidation.message);
  }

  // Validate color formats
  if (!isValidHexColor(bgColor)) {
    return res.status(400).send('Invalid background color format. Use 6-digit hex, e.g., ffffff');
  }

  if (!isValidHexColor(fgColor)) {
    return res.status(400).send('Invalid foreground color format. Use 6-digit hex, e.g., 000000');
  }

  // Validate font size
  const fontSizeValidation = validateFontSize(fontSize, config.minFontSize, config.maxFontSize);
  if (!fontSizeValidation.isValid) {
    return res.status(400).send(fontSizeValidation.message);
  }

  // Validate text wrap width
  const textWrapValidation = validateTextWrapWidth(textWrapWidth, config.minTextWrapWidth, config.maxTextWrapWidth);
  if (!textWrapValidation.isValid) {
    return res.status(400).send(textWrapValidation.message);
  }

  // Create cache key
  const cacheKey = generateImageCacheKey(
    width, height, bgColor, fgColor, text, fontSize, 
    textWrap, textWrapWidth, config.imageFormat, config.imageQuality
  );

  // Check cache first
  if (isImageCached(caches.imageCache, cacheKey)) {
    const cachedData = getCachedImage(caches.imageCache, cacheKey);
    res.setHeader('Content-Type', cachedData.mimeType);
    res.setHeader('Cache-Control', buildCacheControl(config));

    if (config.etagEnabled) {
      res.setHeader('ETag', cachedData.etag);
    }

    if (config.contentDisposition) {
      res.setHeader('Content-Disposition', `${config.contentDisposition}; filename="placeholder-${width}x${height}.${config.imageFormat}"`);
    }

    return res.send(cachedData.buffer);
  }

  try {
    const bgHex = hexToJimpInt(bgColor);
    const fgHex = hexToJimpInt(fgColor);

    // Select appropriate font
    const font = await selectFont(
      width, height, fontSize, config, caches.fontCache, fontSizeMap, config.maxCacheSize
    );

    // Process text for rendering
    const textData = processText(text, font, width, height, textWrap, textWrapWidth);

    // Generate image
    const { buffer, mimeType } = await generateImage(
      width, height, bgHex, fgHex, font, textData, config
    );

    const etag = generateETag(cacheKey, config.etagEnabled);

    // Cache the generated image
    cacheImage(caches.imageCache, cacheKey, { buffer, mimeType, etag }, config.maxCacheSize);

    // Set headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', buildCacheControl(config));

    if (etag) {
      res.setHeader('ETag', etag);
    }

    if (config.contentDisposition) {
      res.setHeader('Content-Disposition', `${config.contentDisposition}; filename="placeholder-${width}x${height}.${config.imageFormat}"`);
    }

    res.send(buffer);

  } catch (error) {
    console.error('Image generation failed:', error);

    if (config.verboseErrors) {
      res.status(500).send(`Error generating image: ${error.message}`);
    } else {
      res.status(500).send('Error generating image');
    }
  }
};

/**
 * Create API route handler
 * @param {Object} config - Application configuration
 * @param {Object} caches - Cache objects
 * @param {Object} fontSizeMap - Font size mapping
 * @returns {Function} Express route handler
 */
const createApiRoute = (config, caches, fontSizeMap) => {
  return (req, res) => {
    handleImageRequest(req, res, config, caches, fontSizeMap);
  };
};

module.exports = {
  initializeCaches,
  createApiRoute
};