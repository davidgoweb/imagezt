const {
  getNearestFontSize,
  createFontCache,
  manageCacheSize,
  loadFallbackFont,
  selectFont
} = require('./fontService');

const {
  measureTextWidth,
  wrapText,
  calculateTextPosition,
  calculateSingleLinePosition,
  processText
} = require('./textService');

const {
  createImageCache,
  manageCacheSize: manageImageCacheSize,
  getCachedImage,
  cacheImage,
  isImageCached,
  clearImageCache,
  getCacheStats
} = require('./cacheService');

const {
  generateImage,
  generateImageBuffer,
  createPlaceholderImage
} = require('./imageService');

module.exports = {
  // Font service
  getNearestFontSize,
  createFontCache,
  manageCacheSize,
  loadFallbackFont,
  selectFont,
  
  // Text service
  measureTextWidth,
  wrapText,
  calculateTextPosition,
  calculateSingleLinePosition,
  processText,
  
  // Cache service
  createImageCache,
  manageImageCacheSize,
  getCachedImage,
  cacheImage,
  isImageCached,
  clearImageCache,
  getCacheStats,
  
  // Image service
  generateImage,
  generateImageBuffer,
  createPlaceholderImage
};