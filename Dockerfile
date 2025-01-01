# Use Node.js LTS with multi-platform support
FROM --platform=$BUILDPLATFORM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies with proper caching
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache \
    libc6-compat \
    build-base

# Set production environment
ENV NODE_ENV=production \
    PORT=4000

# Install pnpm with caching
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN pnpm build

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Start application
CMD ["pnpm", "start"]