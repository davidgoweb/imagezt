const { cssColorToHex } = require('jimp');

/**
 * Convert hex color from URL (e.g., 'ffffff') to Jimp's 32-bit int
 * @param {string} hex - 6-digit hex color string
 * @returns {number} Jimp color integer
 */
const hexToJimpInt = (hex) => cssColorToHex(`#${hex.slice(0, 6)}FF`);

/**
 * Validate hex color format
 * @param {string} hex - Color string to validate
 * @returns {boolean} True if valid 6-digit hex color
 */
const isValidHexColor = (hex) => {
  return /^[0-9A-Fa-f]{6}$/.test(hex);
};

module.exports = {
  hexToJimpInt,
  isValidHexColor
};