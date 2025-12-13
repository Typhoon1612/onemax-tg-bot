# Dockerfile for onemax-tg-bot
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (use package-lock for reproducible builds)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Environment
ENV NODE_ENV=production

# Expose server port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
