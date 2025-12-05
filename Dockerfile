# Use Node.js 18 LTS as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create logs directory if needed
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000


# Start the application
CMD ["npm", "start"]
