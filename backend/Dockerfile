# FROM node:20-alpine
# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# EXPOSE 5000
# CMD ["npm", "start"]
FROM node:20-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

RUN npm install --only=production

# Copy source + tsconfig
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript INSIDE container
RUN npm run build

# Verify build output (debug safety)
RUN ls -la dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
