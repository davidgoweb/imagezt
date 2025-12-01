# ImageZT

A Node.js web service that generates placeholder images with custom dimensions, colors, and text. Similar to services like placehold.it, but self-hosted.

## Features

- Generate placeholder images with custom dimensions
- Customize background and foreground colors
- Add custom text (defaults to dimensions)
- Automatic font sizing based on image dimensions
- Proper color rendering for text
- Caching headers for improved performance

## Installation

1. Clone the repository:
```bash
git clone https://github.com/davidgoweb/imagezt.git
cd imagezt
```

2. Install dependencies:
```bash
npm install
```

## Usage

Start the server:
```bash
npm start
```

The server will start on port 3000 by default.

## API Endpoints

### Basic Usage

```
GET /:dims/:bgColor/:fgColor
```

Parameters:
- `dims`: Image dimensions in format `WxH` (e.g., `800x600`)
- `bgColor`: Background color as 6-digit hex (without #) (e.g., `ffffff`)
- `fgColor`: Foreground/text color as 6-digit hex (without #) (e.g., `000000`)

### Optional Query Parameters

- `text`: Custom text to display on the image (defaults to dimensions)

### Examples

- Basic placeholder: `http://localhost:3000/800x600/ffffff/000000`
  - Creates an 800x600 image with white background and black text showing "800x600"

- Custom text: `http://localhost:3000/400x300/ff0000/00ff00?text=Hello`
  - Creates a 400x300 image with red background and green text showing "Hello"

- Small image: `http://localhost:3000/100x100/cccccc/333333`
  - Creates a 100x100 square with gray background and dark gray text

## Error Handling

The service returns appropriate HTTP status codes for errors:
- `400`: Invalid dimensions or color formats
- `500`: Server errors during image generation

## Dependencies

- [Express](https://expressjs.com/) - Web framework
- [Jimp](https://github.com/oliver-moran/jimp) - Image processing library

## License

Apache License 2.0 - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request