# ============================================================
# Dockerfile — Kiryana Store Backend
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "src/server.js"]
