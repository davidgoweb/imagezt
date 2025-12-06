/**
 * Validate image dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} minDimension - Minimum allowed dimension
 * @param {number} maxDimension - Maximum allowed dimension
 * @returns {Object} Validation result with isValid and message
 */
const validateDimensions = (width, height, minDimension, maxDimension) => {
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return {
      isValid: false,
      message: 'Invalid dimensions format. Use WxH with positive numbers, e.g., 800x600'
    };
  }

  if (width > maxDimension || height > maxDimension) {
    return {
      isValid: false,
      message: `Image dimensions exceed maximum allowed size of ${maxDimension}x${maxDimension}`
    };
  }

  if (width < minDimension || height < minDimension) {
    return {
      isValid: false,
      message: `Image dimensions below minimum allowed size of ${minDimension}x${minDimension}`
    };
  }

  return { isValid: true };
};

/**
 * Validate font size
 * @param {number|null} fontSize - Font size to validate
 * @param {number} minSize - Minimum allowed font size
 * @param {number} maxSize - Maximum allowed font size
 * @returns {Object} Validation result with isValid and message
 */
const validateFontSize = (fontSize, minSize, maxSize) => {
  if (fontSize && (isNaN(fontSize) || fontSize < minSize || fontSize > maxSize)) {
    return {
      isValid: false,
      message: `Invalid font size. Must be between ${minSize} and ${maxSize} pixels`
    };
  }

  return { isValid: true };
};

/**
 * Validate text wrap width
 * @param {number} textWrapWidth - Text wrap width percentage
 * @param {number} minWidth - Minimum allowed wrap width
 * @param {number} maxWidth - Maximum allowed wrap width
 * @returns {Object} Validation result with isValid and message
 */
const validateTextWrapWidth = (textWrapWidth, minWidth, maxWidth) => {
  if (isNaN(textWrapWidth) || textWrapWidth < minWidth || textWrapWidth > maxWidth) {
    return {
      isValid: false,
      message: `Invalid text wrap width. Must be between ${minWidth} and ${maxWidth} percent`
    };
  }

  return { isValid: true };
};

/**
 * Parse dimensions from string format (e.g., "800x600")
 * @param {string} dims - Dimensions string
 * @returns {Object|null} Parsed dimensions or null if invalid
 */
const parseDimensions = (dims) => {
  const parts = dims.split('x');
  if (parts.length !== 2) return null;
  
  const width = parseInt(parts[0]);
  const height = parseInt(parts[1]);
  
  if (isNaN(width) || isNaN(height)) return null;
  
  return { width, height };
};

module.exports = {
  validateDimensions,
  validateFontSize,
  validateTextWrapWidth,
  parseDimensions
};