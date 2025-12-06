require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { DEFAULT_CONFIG } = require('./constants');

// Create logs directory if file logging is enabled
if (process.env.LOG_FILE_ENABLED === 'true') {
  const logDir = path.dirname(process.env.LOG_FILE_PATH || './logs/app.log');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Extract configuration from environment variables with defaults
const getConfig = () => {
  return {
    // Server Configuration
    port: process.env.PORT || DEFAULT_CONFIG.PORT,
    host: process.env.HOST || DEFAULT_CONFIG.HOST,
    nodeEnv: process.env.NODE_ENV || DEFAULT_CONFIG.NODE_ENV,
    
    // Cache Configuration
    maxCacheSize: parseInt(process.env.MAX_CACHE_SIZE) || DEFAULT_CONFIG.MAX_CACHE_SIZE,
    cacheMaxAge: process.env.CACHE_MAX_AGE || DEFAULT_CONFIG.CACHE_MAX_AGE,
    cachePublic: process.env.CACHE_PUBLIC !== 'false',
    cacheImmutable: process.env.CACHE_IMMUTABLE !== 'false',
    etagEnabled: process.env.ETAG_ENABLED !== 'false',
    
    // Image Configuration
    imageFormat: process.env.IMAGE_FORMAT || DEFAULT_CONFIG.IMAGE_FORMAT,
    imageQuality: parseInt(process.env.IMAGE_QUALITY) || DEFAULT_CONFIG.IMAGE_QUALITY,
    jpegProgressive: process.env.JPEG_PROGRESSIVE !== 'false',
    pngCompressionLevel: parseInt(process.env.PNG_COMPRESSION_LEVEL) || DEFAULT_CONFIG.PNG_COMPRESSION_LEVEL,
    maxImageDimension: parseInt(process.env.MAX_IMAGE_DIMENSION) || DEFAULT_CONFIG.MAX_IMAGE_DIMENSION,
    minImageDimension: parseInt(process.env.MIN_IMAGE_DIMENSION) || DEFAULT_CONFIG.MIN_IMAGE_DIMENSION,
    
    // Font Configuration
    defaultFontColor: process.env.DEFAULT_FONT_COLOR || DEFAULT_CONFIG.DEFAULT_FONT_COLOR,
    defaultBackgroundColor: process.env.DEFAULT_BACKGROUND_COLOR || DEFAULT_CONFIG.DEFAULT_BACKGROUND_COLOR,
    defaultFontSize: parseInt(process.env.DEFAULT_FONT_SIZE) || DEFAULT_CONFIG.DEFAULT_FONT_SIZE,
    minFontSize: parseInt(process.env.MIN_FONT_SIZE) || DEFAULT_CONFIG.MIN_FONT_SIZE,
    maxFontSize: parseInt(process.env.MAX_FONT_SIZE) || DEFAULT_CONFIG.MAX_FONT_SIZE,
    fontSizeAutoFallback: process.env.FONT_SIZE_AUTO_FALLBACK !== 'false',
    
    // Text Wrapping Configuration
    defaultTextWrap: process.env.DEFAULT_TEXT_WRAP === 'true',
    defaultTextWrapWidth: parseInt(process.env.DEFAULT_TEXT_WRAP_WIDTH) || DEFAULT_CONFIG.DEFAULT_TEXT_WRAP_WIDTH,
    minTextWrapWidth: parseInt(process.env.MIN_TEXT_WRAP_WIDTH) || DEFAULT_CONFIG.MIN_TEXT_WRAP_WIDTH,
    maxTextWrapWidth: parseInt(process.env.MAX_TEXT_WRAP_WIDTH) || DEFAULT_CONFIG.MAX_TEXT_WRAP_WIDTH,
    
    // Request Configuration
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || DEFAULT_CONFIG.REQUEST_TIMEOUT,
    
    // Logging Configuration
    logLevel: process.env.LOG_LEVEL || DEFAULT_CONFIG.LOG_LEVEL,
    logFormat: process.env.LOG_FORMAT || DEFAULT_CONFIG.LOG_FORMAT,
    logFileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    logFilePath: process.env.LOG_FILE_PATH || './logs/app.log',
    
    // CORS Configuration
    corsEnabled: process.env.CORS_ENABLED === 'true',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    
    // Rate Limiting Configuration
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED === 'true',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || DEFAULT_CONFIG.RATE_LIMIT_WINDOW,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || DEFAULT_CONFIG.RATE_LIMIT_MAX,
    
    // Health Check Configuration
    healthCheckEnabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
    
    // Content Disposition
    contentDisposition: process.env.CONTENT_DISPOSITION || null,
    
    // Error Handling
    verboseErrors: process.env.VERBOSE_ERRORS === 'true',
    debug: process.env.DEBUG === 'true'
  };
};

module.exports = {
  getConfig
};