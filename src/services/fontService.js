const { loadFont } = require('jimp');
const fonts = require('jimp/fonts');

/**
 * Get nearest font size for a given pixel size
 * @param {number} requestedSize - Requested font size
 * @param {Object} fontSizeMap - Font size mapping object
 * @returns {number} Nearest available font size
 */
const getNearestFontSize = (requestedSize, fontSizeMap) => {
  const sizes = Object.keys(fontSizeMap).map(Number).sort((a, b) => a - b);

  // Find exact match
  if (fontSizeMap[requestedSize]) {
    return requestedSize;
  }

  // Find nearest size
  return sizes.reduce((prev, curr) =>
    Math.abs(curr - requestedSize) < Math.abs(prev - requestedSize) ? curr : prev
  );
};

/**
 * Initialize font cache
 * @param {number} maxSize - Maximum cache size
 * @returns {Map} Font cache map
 */
const createFontCache = (maxSize = 100) => {
  return new Map();
};

/**
 * Manage font cache size
 * @param {Map} cache - Font cache
 * @param {number} maxSize - Maximum cache size
 */
const manageCacheSize = (cache, maxSize) => {
  if (cache.size >= maxSize) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
};

/**
 * Load fallback font
 * @param {Map} fontCache - Font cache
 * @returns {Promise<Object|null>} Fallback font or null if loading fails
 */
const loadFallbackFont = async (fontCache) => {
  if (!fontCache.has('SANS_16_BLACK')) {
    try {
      const fallbackFont = await loadFont(fonts.SANS_16_BLACK);
      fontCache.set('SANS_16_BLACK', fallbackFont);
    } catch (fallbackError) {
      console.error('Error loading fallback font:', fallbackError);
      return null;
    }
  }
  return fontCache.get('SANS_16_BLACK');
};

/**
 * Select font by specific pixel size or auto-size based on dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number|null} fontSize - Specific font size or null for auto
 * @param {Object} config - Configuration object
 * @param {Map} fontCache - Font cache
 * @param {Object} fontSizeMap - Font size mapping
 * @param {number} maxCacheSize - Maximum cache size
 * @returns {Promise<Object>} Font object
 */
const selectFont = async (
  width, height, fontSize, config, fontCache, fontSizeMap, maxCacheSize
) => {
  let fontKey;

  if (fontSize) {
    // Use specific font size
    const validatedSize = Math.max(config.minFontSize, Math.min(config.maxFontSize, fontSize));
    const nearestSize = getNearestFontSize(validatedSize, fontSizeMap);
    fontKey = fontSizeMap[nearestSize];
  } else {
    // Auto-select based on image dimensions (original logic)
    const area = width * height;
    if (area > 800000) fontKey = 'SANS_128_BLACK';
    else if (area > 200000) fontKey = 'SANS_64_BLACK';
    else if (area > 50000) fontKey = 'SANS_32_BLACK';
    else if (area > 10000) fontKey = 'SANS_16_BLACK';
    else fontKey = 'SANS_8_BLACK';
  }

  // Check cache first
  if (fontCache.has(fontKey)) {
    return fontCache.get(fontKey);
  }

  try {
    const font = await loadFont(fonts[fontKey]);

    // Cache the font (limit cache size)
    manageCacheSize(fontCache, maxCacheSize);
    fontCache.set(fontKey, font);

    return font;
  } catch (error) {
    console.error('Error loading font:', error);
    // Fallback to a basic font if loading fails
    return await loadFallbackFont(fontCache);
  }
};

module.exports = {
  getNearestFontSize,
  createFontCache,
  manageCacheSize,
  loadFallbackFont,
  selectFont
};