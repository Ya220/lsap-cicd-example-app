# Use official Node LTS slim image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files first to leverage layer caching
COPY package*.json ./

# Install production dependencies (falls back to npm install if no lockfile)
RUN if [ -f package-lock.json ]; then npm ci --production; else npm install --production; fi

# Copy application source
COPY . .

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

# Start the app using the npm `start` script (runs `node server.js`)
CMD ["npm", "start"]
