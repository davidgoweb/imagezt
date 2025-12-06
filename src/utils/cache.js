/**
 * Build cache control header based on configuration
 * @param {Object} config - Cache configuration
 * @returns {string} Cache control header value
 */
const buildCacheControl = (config) => {
  let cacheControl = '';
  if (config.cachePublic) {
    cacheControl += 'public, ';
  } else {
    cacheControl += 'private, ';
  }
  cacheControl += `max-age=${config.cacheMaxAge}`;
  if (config.cacheImmutable) {
    cacheControl += ', immutable';
  }
  return cacheControl;
};

/**
 * Generate cache key for image requests
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} bgColor - Background color
 * @param {string} fgColor - Foreground color
 * @param {string} text - Text content
 * @param {number|null} fontSize - Font size
 * @param {boolean} textWrap - Text wrapping enabled
 * @param {number} textWrapWidth - Text wrap width percentage
 * @param {string} imageFormat - Image format
 * @param {number} imageQuality - Image quality
 * @returns {string} Cache key
 */
const generateImageCacheKey = (
  width, height, bgColor, fgColor, text, fontSize, 
  textWrap, textWrapWidth, imageFormat, imageQuality
) => {
  return `${width}x${height}-${bgColor}-${fgColor}-${text}-${fontSize || 'auto'}-${textWrap}-${textWrapWidth}-${imageFormat}-${imageQuality}`;
};

/**
 * Generate ETag for cache entry
 * @param {string} cacheKey - Cache key
 * @returns {string|null} ETag value or null if disabled
 */
const generateETag = (cacheKey, etagEnabled) => {
  return etagEnabled ? `"${Buffer.from(cacheKey).toString('base64')}"` : null;
};

module.exports = {
  buildCacheControl,
  generateImageCacheKey,
  generateETag
};