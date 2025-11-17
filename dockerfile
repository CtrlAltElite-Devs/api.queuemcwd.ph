# ==============================
# 1️⃣ Build Stage
# ==============================
FROM node:24-bullseye-slim AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies (including dev for build tools)
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ==============================
# 2️⃣ Production dependencies pruning stage
# ==============================
FROM node:24-bullseye-slim AS prod-deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-optional

# Prune unnecessary files
RUN find node_modules -type d -name "test" -o -name "__tests__" -exec rm -rf {} + \
    && find node_modules -type f -name "*.md" -delete \
    && find node_modules -type f -name "*.markdown" -delete \
    && find node_modules -type d -name "example*" -exec rm -rf {} + \
    && npm cache clean --force

# ==============================
# 3️⃣ Runtime Stage (distroless)
# ==============================
FROM node:24-bullseye-slim

WORKDIR /app

# Copy pruned production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built dist folder
COPY --from=builder /app/dist ./dist

# Copy wait-for script into container
COPY wait-for.sh /usr/src/app/wait-for.sh
RUN chmod +x /usr/src/app/wait-for.sh

COPY start.sh /usr/src/app/start.sh
RUN chmod +x /usr/src/app/start.sh

# Entry point
CMD ["/usr/src/app/wait-for.sh", "mysql:3306", "--", "node", "dist/src/main.js"]
