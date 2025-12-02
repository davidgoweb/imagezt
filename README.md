# ImageZT

A Node.js web service that generates placeholder images with custom dimensions, colors, and text. Similar to services like placehold.it, but self-hosted.

## Features

- Generate placeholder images with custom dimensions
- Customize background and foreground colors
- Add custom text (defaults to dimensions)
- Automatic font sizing based on image dimensions
- Proper color rendering for text
- Configurable caching headers for improved performance
- Environment-based configuration system
- Support for multiple image formats (PNG, JPEG, BMP)
- Configurable image quality settings
- Health check endpoint for monitoring
- Request validation and rate limiting

## Table of Contents

- [Installation](#installation)
- [Docker Usage](#docker-usage)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Advanced Configuration](#advanced-configuration)
- [Dependencies](#dependencies)
- [License](#license)
- [Contributing](#contributing)

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

## Docker Usage

### Using Docker Compose (Recommended)

For development:
```bash
docker-compose up -d
```

For production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Using Docker Directly

Build the image:
```bash
docker build -t imagezt .
```

Run the container:
```bash
docker run -p 3000:3000 --name imagezt imagezt
```

### Using the Pre-built Image from GHCR

Pull the image:
```bash
docker pull ghcr.io/davidgoweb/imagezt:latest
```

Run the container:
```bash
docker run -p 3000:3000 --name imagezt ghcr.io/davidgoweb/imagezt:latest
```

### Environment Variables with Docker

You can pass environment variables to Docker:

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ENABLED=true \
  -e RATE_LIMIT_ENABLED=true \
  --name imagezt \
  imagezt
```

Or use an environment file:
```bash
docker run -p 3000:3000 \
  --env-file .env \
  --name imagezt \
  imagezt
```

## Usage

Start the server:
```bash
npm start
```

The server will start on port 3000 by default. All configuration can be customized through environment variables.

### Environment Configuration

Copy `.env.example` to `.env` and customize the settings:

```bash
cp .env.example .env
```

Key environment variables:
- `PORT`: Server port (default: 3000)
- `IMAGE_FORMAT`: Output format - png, jpeg, or bmp (default: png)
- `IMAGE_QUALITY`: Image quality for JPEG (1-100, default: 90)
- `CACHE_MAX_AGE`: Cache duration in seconds (default: 31536000)
- `MAX_IMAGE_DIMENSION`: Maximum allowed width/height (default: 5000)

For a complete list of environment variables, see [env-config.md](env-config.md).

### Health Check

The service includes a health check endpoint:
```bash
curl http://localhost:3000/health
```

### Environment Check Scripts

Check your current environment configuration:
```bash
npm run env:check
```

Test environment variable loading:
```bash
npm run test:env
```

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

## Error Handling

The service returns appropriate HTTP status codes for errors:
- `400`: Invalid dimensions or color formats, or dimensions exceed limits
- `408`: Request timeout
- `429`: Too many requests (if rate limiting is enabled)
- `500`: Server errors during image generation

## Advanced Configuration

### Security Features
- CORS support (configurable via `CORS_ENABLED`)
- Rate limiting (configurable via `RATE_LIMIT_ENABLED`)
- Request timeout protection

### Performance Features
- Configurable caching headers with ETag support
- Image dimension limits to prevent resource exhaustion
- Multiple image format support with quality settings

### Monitoring
- Health check endpoint for load balancers
- Configurable logging with file output support
- Debug mode for development

## Dependencies

- [Express](https://expressjs.com/) - Web framework
- [Jimp](https://github.com/oliver-moran/jimp) - Image processing library
- [dotenv](https://github.com/motdotla/dotenv) - Environment variable loading
- [cors](https://github.com/expressjs/cors) - CORS middleware
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit) - Rate limiting
- [morgan](https://github.com/expressjs/morgan) - HTTP request logger

## License

Apache License 2.0 - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request