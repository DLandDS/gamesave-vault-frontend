# Multi-stage Dockerfile for Svelte with Bun runtime

# Build stage
FROM oven/bun:1.3 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies using bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1.3-slim AS production

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Create non-root user for security
RUN addgroup --system --gid 1001 svelteapp && \
    adduser --system --uid 1001 svelteapp

# Change ownership of the app directory to the svelteapp user
RUN chown -R svelteapp:svelteapp /app
USER svelteapp

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application using bun
CMD ["bun", "run", "./build/index.js"]
