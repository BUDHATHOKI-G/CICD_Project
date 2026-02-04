# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev for TypeScript)
COPY package*.json ./
RUN npm install

# Copy source and tsconfig
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "dist/server.js"]
