// Load environment variables
require('dotenv').config();

const express = require('express');
const { Jimp, loadFont, cssColorToHex, intToRGBA } = require('jimp');
const fonts = require('jimp/fonts');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

// In-memory cache for generated images and fonts
const imageCache = new Map();
const fontCache = new Map();
const MAX_CACHE_SIZE = parseInt(process.env.MAX_CACHE_SIZE) || 100;

// Performance optimizations
app.set('etag', false); // We handle ETags manually
app.set('x-powered-by', false); // Remove X-Powered-By header

// Server Configuration
const PORT = process.env.PORT || 5930;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create logs directory if file logging is enabled
if (process.env.LOG_FILE_ENABLED === 'true') {
  const logDir = path.dirname(process.env.LOG_FILE_PATH || './logs/app.log');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Middleware configuration
if (process.env.CORS_ENABLED === 'true') {
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
  }));
}

if (process.env.RATE_LIMIT_ENABLED === 'true') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);
}

// Logging configuration
const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'combined';

if (NODE_ENV === 'development' || logLevel === 'debug') {
  app.use(morgan(logFormat));
}

if (process.env.LOG_FILE_ENABLED === 'true') {
  const logStream = fs.createWriteStream(process.env.LOG_FILE_PATH || './logs/app.log', { flags: 'a' });
  app.use(morgan(logFormat, { stream: logStream }));
}

// Request timeout
app.use((req, res, next) => {
  const timeout = parseInt(process.env.REQUEST_TIMEOUT) || 30000;
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).send('Request timeout');
    }
  });
  next();
});

// Configuration from environment variables
const config = {
  cacheMaxAge: process.env.CACHE_MAX_AGE || 31536000,
  cachePublic: process.env.CACHE_PUBLIC !== 'false',
  cacheImmutable: process.env.CACHE_IMMUTABLE !== 'false',
  etagEnabled: process.env.ETAG_ENABLED !== 'false',
  imageFormat: process.env.IMAGE_FORMAT || 'png',
  imageQuality: parseInt(process.env.IMAGE_QUALITY) || 90,
  jpegProgressive: process.env.JPEG_PROGRESSIVE !== 'false',
  pngCompressionLevel: parseInt(process.env.PNG_COMPRESSION_LEVEL) || 6,
  maxImageDimension: parseInt(process.env.MAX_IMAGE_DIMENSION) || 5000,
  minImageDimension: parseInt(process.env.MIN_IMAGE_DIMENSION) || 1,
  defaultFontColor: process.env.DEFAULT_FONT_COLOR || '000000',
  defaultBackgroundColor: process.env.DEFAULT_BACKGROUND_COLOR || 'ffffff',
  verboseErrors: process.env.VERBOSE_ERRORS === 'true',
  debug: process.env.DEBUG === 'true'
};

// Utility function to convert hex color from URL (e.g., 'ffffff') to Jimp's 32-bit int
const hexToJimpInt = (hex) => cssColorToHex(`#${hex.slice(0, 6)}FF`);

// Validate hex color format
const isValidHexColor = (hex) => {
  return /^[0-9A-Fa-f]{6}$/.test(hex);
};

// Select appropriate font size based on image dimensions with caching
const selectFont = async (width, height) => {
  const area = width * height;
  let fontKey;
  
  if (area > 800000) fontKey = 'SANS_128_BLACK';
  else if (area > 200000) fontKey = 'SANS_64_BLACK';
  else if (area > 50000) fontKey = 'SANS_32_BLACK';
  else if (area > 10000) fontKey = 'SANS_16_BLACK';
  else fontKey = 'SANS_8_BLACK';
  
  // Check cache first
  if (fontCache.has(fontKey)) {
    return fontCache.get(fontKey);
  }
  
  try {
    const font = await loadFont(fonts[fontKey]);
    
    // Cache the font (limit cache size)
    if (fontCache.size >= MAX_CACHE_SIZE) {
      const firstKey = fontCache.keys().next().value;
      fontCache.delete(firstKey);
    }
    fontCache.set(fontKey, font);
    
    return font;
  } catch (error) {
    console.error('Error loading font:', error);
    // Fallback to a basic font if loading fails
    if (!fontCache.has('SANS_16_BLACK')) {
      try {
        const fallbackFont = await loadFont(fonts.SANS_16_BLACK);
        fontCache.set('SANS_16_BLACK', fallbackFont);
      } catch (fallbackError) {
        console.error('Error loading fallback font:', fallbackError);
      }
    }
    return fontCache.get('SANS_16_BLACK');
  }
};

// Build cache control header based on configuration
const buildCacheControl = () => {
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

// Simple favicon endpoint to prevent 404s
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Simple root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'ImageZT',
    version: '1.0.0',
    description: 'Placeholder image generation service',
    usage: '/:width/:height/:bgColor/:fgColor?text=custom',
    example: '/800x600/ffffff/000000?text=Hello'
  });
});

// Health check endpoint
if (process.env.HEALTH_CHECK_ENABLED !== 'false') {
  const healthPath = process.env.HEALTH_CHECK_PATH || '/health';
  app.get(healthPath, (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV
    });
  });
}

app.get('/:dims/:bgColor/:fgColor', async (req, res) => {
    const { dims, bgColor, fgColor } = req.params;
    const text = req.query.text || dims; // Use dims as default text
    const [widthStr, heightStr] = dims.split('x');

    const width = parseInt(widthStr);
    const height = parseInt(heightStr);
    
    // Validate dimensions with environment variables
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).send('Invalid dimensions format. Use WxH with positive numbers, e.g., 800x600');
    }

    if (width > config.maxImageDimension || height > config.maxImageDimension) {
        return res.status(400).send(`Image dimensions exceed maximum allowed size of ${config.maxImageDimension}x${config.maxImageDimension}`);
    }

    if (width < config.minImageDimension || height < config.minImageDimension) {
        return res.status(400).send(`Image dimensions below minimum allowed size of ${config.minImageDimension}x${config.minImageDimension}`);
    }

    // Validate color formats
    if (!isValidHexColor(bgColor)) {
        return res.status(400).send('Invalid background color format. Use 6-digit hex, e.g., ffffff');
    }
    
    if (!isValidHexColor(fgColor)) {
        return res.status(400).send('Invalid foreground color format. Use 6-digit hex, e.g., 000000');
    }

    // Create cache key
    const cacheKey = `${width}x${height}-${bgColor}-${fgColor}-${text}-${config.imageFormat}-${config.imageQuality}`;
    
    // Check cache first
    if (imageCache.has(cacheKey)) {
        const cachedData = imageCache.get(cacheKey);
        res.setHeader('Content-Type', cachedData.mimeType);
        res.setHeader('Cache-Control', buildCacheControl());
        
        if (config.etagEnabled) {
            res.setHeader('ETag', cachedData.etag);
        }
        
        if (process.env.CONTENT_DISPOSITION) {
            res.setHeader('Content-Disposition', `${process.env.CONTENT_DISPOSITION}; filename="placeholder-${width}x${height}.${config.imageFormat}"`);
        }
        
        return res.send(cachedData.buffer);
    }

    try {
        const bgHex = hexToJimpInt(bgColor);
        const fgHex = hexToJimpInt(fgColor);
        
        // 1. Create a new image canvas
        const image = new Jimp({ width, height, color: bgHex });

        // 2. Select appropriate font based on image dimensions (cached)
        const font = await selectFont(width, height);
        
        // 3. Draw the text, centered
        image.print({
            font: font,
            x: 20,
            y: height / 3,
            text: text
        });

        // 4. Apply color to the text by recoloring the image
        image.color([
            { apply: 'red', params: [intToRGBA(fgHex).r] },
            { apply: 'green', params: [intToRGBA(fgHex).g] },
            { apply: 'blue', params: [intToRGBA(fgHex).b] }
        ]);

        // 5. Generate buffer with configurable format and quality
        let mimeType;
        let bufferOptions = {};
        
        if (config.imageFormat === 'jpeg') {
            mimeType = 'image/jpeg';
            bufferOptions = {
                quality: config.imageQuality,
                progressive: config.jpegProgressive
            };
        } else if (config.imageFormat === 'bmp') {
            mimeType = 'image/bmp';
        } else {
            mimeType = 'image/png';
            // Use lower compression for faster generation
            bufferOptions = {
                compressionLevel: Math.min(config.pngCompressionLevel, 3)
            };
        }

        const buffer = await image.getBuffer(mimeType, bufferOptions);
        const etag = config.etagEnabled ? `"${Buffer.from(cacheKey).toString('base64')}"` : null;
        
        // Cache the generated image (limit cache size)
        if (imageCache.size >= MAX_CACHE_SIZE) {
            const firstKey = imageCache.keys().next().value;
            imageCache.delete(firstKey);
        }
        
        imageCache.set(cacheKey, {
            buffer,
            mimeType,
            etag
        });
        
        // Set headers based on environment configuration
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', buildCacheControl());
        
        if (etag) {
            res.setHeader('ETag', etag);
        }
        
        if (process.env.CONTENT_DISPOSITION) {
            res.setHeader('Content-Disposition', `${process.env.CONTENT_DISPOSITION}; filename="placeholder-${width}x${height}.${config.imageFormat}"`);
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
});

const server = app.listen(PORT, HOST, () => {
    console.log(`ImageZT placeholder service running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    
    if (config.debug) {
        console.log('Configuration:', {
            port: PORT,
            host: HOST,
            imageFormat: config.imageFormat,
            imageQuality: config.imageQuality,
            cacheMaxAge: config.cacheMaxAge,
            maxImageDimension: config.maxImageDimension,
            corsEnabled: process.env.CORS_ENABLED === 'true',
            rateLimitEnabled: process.env.RATE_LIMIT_ENABLED === 'true',
            healthCheckEnabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
            maxCacheSize: MAX_CACHE_SIZE
        });
    }
});

// Enable keep-alive for better performance
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});