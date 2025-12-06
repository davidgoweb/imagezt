/**
 * Initialize image cache
 * @param {number} maxSize - Maximum cache size
 * @returns {Map} Image cache map
 */
const createImageCache = (maxSize = 100) => {
  return new Map();
};

/**
 * Manage cache size by removing oldest entries
 * @param {Map} cache - Cache map
 * @param {number} maxSize - Maximum cache size
 */
const manageCacheSize = (cache, maxSize) => {
  if (cache.size >= maxSize) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
};

/**
 * Get cached image data
 * @param {Map} cache - Image cache
 * @param {string} cacheKey - Cache key
 * @returns {Object|null} Cached data or null if not found
 */
const getCachedImage = (cache, cacheKey) => {
  return cache.get(cacheKey) || null;
};

/**
 * Cache image data
 * @param {Map} cache - Image cache
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Data to cache (buffer, mimeType, etag)
 * @param {number} maxSize - Maximum cache size
 */
const cacheImage = (cache, cacheKey, data, maxSize) => {
  manageCacheSize(cache, maxSize);
  cache.set(cacheKey, data);
};

/**
 * Check if image exists in cache
 * @param {Map} cache - Image cache
 * @param {string} cacheKey - Cache key
 * @returns {boolean} True if cached
 */
const isImageCached = (cache, cacheKey) => {
  return cache.has(cacheKey);
};

/**
 * Clear all cached images
 * @param {Map} cache - Image cache
 */
const clearImageCache = (cache) => {
  cache.clear();
};

/**
 * Get cache statistics
 * @param {Map} cache - Image cache
 * @returns {Object} Cache statistics
 */
const getCacheStats = (cache) => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

module.exports = {
  createImageCache,
  manageCacheSize,
  getCachedImage,
  cacheImage,
  isImageCached,
  clearImageCache,
  getCacheStats
};