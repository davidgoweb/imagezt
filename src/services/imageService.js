const { Jimp, intToRGBA } = require('jimp');

/**
 * Generate image buffer with specified parameters
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} bgHex - Background color in Jimp format
 * @param {number} fgHex - Foreground color in Jimp format
 * @param {Object} font - Font object
 * @param {Object} textData - Processed text data from textService
 * @param {Object} config - Image configuration
 * @returns {Promise<Object>} Object containing buffer and mimeType
 */
const generateImage = async (
  width, height, bgHex, fgHex, font, textData, config
) => {
  // 1. Create the background image
  const image = new Jimp({ width, height, color: bgHex });

  // 2. Create a transparent layer for text
  const textImage = new Jimp({ width, height, color: 0x00000000 });

  // 3. Draw text onto the text layer
  if (textData.isWrapped) {
    // Draw each line of text
    for (let i = 0; i < textData.positions.length; i++) {
      const position = textData.positions[i];

      // Ensure all values are valid numbers
      const x = Math.max(0, Math.floor(position.x || 0));
      const y = Math.max(0, Math.floor(position.y || 0));

      textImage.print({
        font: font,
        x: x,
        y: y,
        text: position.text
      });
    }
  } else {
    // Draw single line text, centered
    const x = Math.max(0, Math.floor(textData.position.x || 0));
    const y = Math.max(0, Math.floor(textData.position.y || 0));

    textImage.print({
      font: font,
      x: x,
      y: y,
      text: textData.text
    });
  }

  // 4. Apply color to the text layer
  const fgRgba = intToRGBA(fgHex);
  textImage.color([
    { apply: 'red', params: [fgRgba.r] },
    { apply: 'green', params: [fgRgba.g] },
    { apply: 'blue', params: [fgRgba.b] }
  ]);

  // 5. Composite the text layer onto the background
  image.composite(textImage, 0, 0);

  // 6. Generate buffer with configurable format and quality
  const { buffer, mimeType } = await generateImageBuffer(image, config);

  return { buffer, mimeType };
};

/**
 * Generate image buffer with specified format and quality
 * @param {Object} image - Jimp image object
 * @param {Object} config - Image configuration
 * @returns {Promise<Object>} Object containing buffer and mimeType
 */
const generateImageBuffer = async (image, config) => {
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

  return { buffer, mimeType };
};

/**
 * Create a simple placeholder image (no text)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} color - Background color in Jimp format
 * @param {Object} config - Image configuration
 * @returns {Promise<Object>} Object containing buffer and mimeType
 */
const createPlaceholderImage = async (width, height, color, config) => {
  const image = new Jimp({ width, height, color });
  return await generateImageBuffer(image, config);
};

module.exports = {
  generateImage,
  generateImageBuffer,
  createPlaceholderImage
};