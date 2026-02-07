# Multi-stage Dockerfile for NestJS application
# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies) needed for build
# Use npm ci with --legacy-peer-deps to handle peer dependency conflicts
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps --prefer-offline --no-audit --progress=false; else npm install --legacy-peer-deps --prefer-offline --no-audit --progress=false; fi

# Copy source
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files and install only production dependencies
COPY package.json package-lock.json ./
RUN if [ -f package-lock.json ]; then npm ci --only=production --legacy-peer-deps --prefer-offline --no-audit --progress=false; else npm install --only=production --legacy-peer-deps --prefer-offline --no-audit --progress=false; fi

# Copy build output from builder
COPY --from=builder /usr/src/app/dist ./dist

# Use non-root user
USER appuser

ENV NODE_ENV=development

# Expose the port (matches your app config default 3000)
EXPOSE 3005

# Default command
CMD ["node", "dist/main.js"]
