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

// Server Configuration
const PORT = process.env.PORT || 3000;
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

// Select appropriate font size based on image dimensions
const selectFont = async (width, height) => {
  const area = width * height;
  if (area > 800000) return await loadFont(fonts.SANS_128_BLACK);
  if (area > 200000) return await loadFont(fonts.SANS_64_BLACK);
  if (area > 50000) return await loadFont(fonts.SANS_32_BLACK);
  if (area > 10000) return await loadFont(fonts.SANS_16_BLACK);
  return await loadFont(fonts.SANS_8_BLACK);
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

    try {
        const bgHex = hexToJimpInt(bgColor);
        const fgHex = hexToJimpInt(fgColor);
        
        // 1. Create a new image canvas
        const image = new Jimp({ width, height, color: bgHex });

        // 2. Select appropriate font based on image dimensions
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
            bufferOptions = {
                compressionLevel: config.pngCompressionLevel
            };
        }

        const buffer = await image.getBuffer(mimeType, bufferOptions);
        
        // Set headers based on environment configuration
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', buildCacheControl());
        
        if (config.etagEnabled) {
            res.setHeader('ETag', `"${Buffer.from(`${width}x${height}-${bgColor}-${fgColor}-${text}`).toString('base64')}"`);
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

app.listen(PORT, HOST, () => {
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
            healthCheckEnabled: process.env.HEALTH_CHECK_ENABLED !== 'false'
        });
    }
});