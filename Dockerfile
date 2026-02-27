# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/Frontend

# Copy frontend files
COPY Frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY Frontend/src ./src
COPY Frontend/public ./public
COPY Frontend/Images ./Images
COPY Frontend/*.html ./
COPY Frontend/*.config.js ./
COPY Frontend/tsconfig*.json ./
COPY Frontend/postcss.config.js ./
COPY Frontend/tailwind.config.js ./
COPY Frontend/eslint.config.js ./
COPY Frontend/vite.config.ts ./
COPY Frontend/index.html ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/Backend

# Copy backend files
COPY Backend/package*.json ./
COPY Backend/tsconfig.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source
COPY Backend/src ./src

# Build backend
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine

WORKDIR /app

# Copy built backend from backend-builder
COPY --from=backend-builder /app/Backend/dist ./dist
COPY --from=backend-builder /app/Backend/node_modules ./node_modules
COPY Backend/package.json ./

# Copy built frontend from frontend-builder to be served as static files
COPY --from=frontend-builder /app/Frontend/dist ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "dist/index.js"]
