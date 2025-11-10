# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init and wget for healthcheck
RUN apk add --no-cache dumb-init wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy package files
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

# Switch to non-root user
USER nestjs

# Expose ports
EXPOSE 3001 3002

# Start application with dumb-init
CMD ["dumb-init", "node", "dist/main"]