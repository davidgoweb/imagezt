const express = require('express');
const { Jimp, loadFont, cssColorToHex, intToRGBA } = require('jimp');
const fonts = require('jimp/fonts');
const app = express();
const PORT = 3000;

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

app.get('/:dims/:bgColor/:fgColor', async (req, res) => {
    const { dims, bgColor, fgColor } = req.params;
    const text = req.query.text || dims; // Use dims as default text
    const [widthStr, heightStr] = dims.split('x');

    const width = parseInt(widthStr);
    const height = parseInt(heightStr);
    
    // Validate dimensions
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).send('Invalid dimensions format. Use WxH with positive numbers, e.g., 800x600');
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

        // 5. Send the buffer
        const buffer = await image.getBuffer('image/png');
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for performance
        res.send(buffer);

    } catch (error) {
        console.error('Image generation failed:', error);
        res.status(500).send('Error generating image');
    }
});

app.listen(PORT, () => {
    console.log(`Jimp placeholder service running on http://localhost:${PORT}`);
});