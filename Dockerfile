# Multi-stage build: build with Node, serve with Nginx

# 1) Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# Use full build (type-check) on Node 20; switch to build:fast to skip type check
RUN npm run build

# 2) Runtime stage
FROM nginx:1.27-alpine AS runtime

# Default API upstream for /api proxy (override at runtime with -e API_URL=...)
ENV API_URL=http://localhost:8080

# Copy Nginx template that gets env-substituted on container start
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# The official nginx entrypoint will envsubst templates under /etc/nginx/templates
# and start nginx.
CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]

