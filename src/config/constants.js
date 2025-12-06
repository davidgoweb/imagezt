// Map pixel sizes to Jimp font constants
const FONT_SIZE_MAP = {
  8: 'SANS_8_BLACK',
  16: 'SANS_16_BLACK',
  32: 'SANS_32_BLACK',
  64: 'SANS_64_BLACK',
  128: 'SANS_128_BLACK'
};

// Default configuration values
const DEFAULT_CONFIG = {
  // Server settings
  PORT: 5930,
  HOST: 'localhost',
  NODE_ENV: 'development',
  
  // Cache settings
  MAX_CACHE_SIZE: 100,
  CACHE_MAX_AGE: 31536000,
  CACHE_PUBLIC: true,
  CACHE_IMMUTABLE: true,
  ETAG_ENABLED: true,
  
  // Image settings
  IMAGE_FORMAT: 'png',
  IMAGE_QUALITY: 90,
  JPEG_PROGRESSIVE: true,
  PNG_COMPRESSION_LEVEL: 6,
  MAX_IMAGE_DIMENSION: 5000,
  MIN_IMAGE_DIMENSION: 1,
  
  // Font settings
  DEFAULT_FONT_COLOR: '000000',
  DEFAULT_BACKGROUND_COLOR: 'ffffff',
  DEFAULT_FONT_SIZE: 16,
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 128,
  FONT_SIZE_AUTO_FALLBACK: true,
  
  // Text wrapping settings
  DEFAULT_TEXT_WRAP: false,
  DEFAULT_TEXT_WRAP_WIDTH: 80,
  MIN_TEXT_WRAP_WIDTH: 50,
  MAX_TEXT_WRAP_WIDTH: 95,
  
  // Request settings
  REQUEST_TIMEOUT: 30000,
  
  // Logging settings
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'combined',
  
  // Rate limiting settings
  RATE_LIMIT_WINDOW: 900000,
  RATE_LIMIT_MAX: 100
};

module.exports = {
  FONT_SIZE_MAP,
  DEFAULT_CONFIG
};