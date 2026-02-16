# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies) for build
RUN npm ci

COPY . .

# Generate Prisma Client for build-time types
RUN npx prisma generate

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Generate Prisma Client for production runtime
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist

# Create directories for sessions and logs
RUN mkdir -p auth_sessions logs

# Expose the API port
EXPOSE 3010

# Start in production mode
CMD ["node", "dist/main"]
