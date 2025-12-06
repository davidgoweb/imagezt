const { measureText } = require('jimp');

/**
 * Helper function to measure text width using Jimp
 * @param {Object} font - Font object
 * @param {string} text - Text to measure
 * @returns {number} Text width in pixels
 */
const measureTextWidth = (font, text) => {
  // Fallback: estimate width based on character count and font size
  const charWidth = font.height || 16; // Use font height as rough estimate
  return measureText(font, text);
};

/**
 * Wrap text at word boundaries to fit within specified width
 * @param {string} text - Text to wrap
 * @param {Object} font - Font object
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {Array<string>} Array of text lines
 */
const wrapText = (text, font, maxWidth) => {
  if (!text) return [];

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureTextWidth(font, testLine);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word is too long, add it anyway
        lines.push(word);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Calculate text positioning for wrapped text
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Array<string>} lines - Array of text lines
 * @param {Object} font - Font object
 * @param {number} textWrapWidth - Text wrap width percentage (not used in calculation)
 * @returns {Array<Object>} Array of position objects with x, y, and text properties
 */
const calculateTextPosition = (width, height, lines, font, textWrapWidth) => {
  const fontHeight = font.height || 16; // Fallback height if not available
  const lineHeight = Math.floor(fontHeight * 1.2); // 1.2x line spacing
  const totalTextHeight = lines.length * lineHeight;
  const startY = Math.max(0, (height - totalTextHeight) / 2);

  const positions = [];
  for (let i = 0; i < lines.length; i++) {
    const lineWidth = measureTextWidth(font, lines[i]);
    const x = Math.max(0, (width - lineWidth) / 2);
    const y = Math.max(0, startY + (i * lineHeight)); // Ensure y is not negative
    positions.push({ x, y, text: lines[i] });
  }

  return positions;
};

/**
 * Calculate position for single line text
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to position
 * @param {Object} font - Font object
 * @returns {Object} Position object with x and y properties
 */
const calculateSingleLinePosition = (width, height, text, font) => {
  const textWidth = measureText(font, text);
  const textHeight = font.height || 16;

  const x = Math.max(0, (width - textWidth) / 2);
  const y = Math.max(0, (height - textHeight) / 2);

  return { x, y };
};

/**
 * Process text for rendering - either wrapped or single line
 * @param {string} text - Text to process
 * @param {Object} font - Font object
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {boolean} textWrap - Whether to wrap text
 * @param {number} textWrapWidth - Text wrap width percentage
 * @returns {Object} Processed text data with positions and metadata
 */
const processText = (text, font, width, height, textWrap, textWrapWidth) => {
  if (textWrap) {
    const maxWidth = Math.floor((width * textWrapWidth) / 100);
    const lines = wrapText(text, font, maxWidth);
    const positions = calculateTextPosition(width, height, lines, font, textWrapWidth);
    
    return {
      isWrapped: true,
      lines,
      positions
    };
  } else {
    const position = calculateSingleLinePosition(width, height, text, font);
    
    return {
      isWrapped: false,
      text,
      position
    };
  }
};

module.exports = {
  measureTextWidth,
  wrapText,
  calculateTextPosition,
  calculateSingleLinePosition,
  processText
};