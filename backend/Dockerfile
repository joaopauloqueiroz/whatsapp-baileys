# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install ALL dependencies (including devDependencies) for build
RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist

# Create directories for sessions and logs
RUN mkdir -p auth_sessions logs

# Expose the API port (will be 3010 in production)
EXPOSE 3010

# Start in production mode
CMD ["node", "dist/main"]
