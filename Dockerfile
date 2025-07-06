# Multi-stage Dockerfile for Formula Compiler Frontend
# Stage 1: Build the frontend with Node.js
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and build assets
COPY src/ ./src/
COPY tooling/ ./tooling/
COPY examples/ ./examples/
COPY docs/ ./docs/
COPY web/ ./web/
COPY scripts/ ./scripts/

# Run the frontend build script
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy the built frontend files from the builder stage
COPY --from=builder /app/web/public/ /usr/share/nginx/html/

# Create a simple nginx configuration
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    \n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    location ~* \.js$ {\n\
        root /usr/share/nginx/html;\n\
        add_header Content-Type application/javascript;\n\
    }\n\
    \n\
    location /health {\n\
        access_log off;\n\
        add_header Content-Type application/json;\n\
        return 200 "{\"status\":\"healthy\",\"service\":\"formula-compiler-frontend\"}";\n\
    }\n\
    \n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json;\n\
}\n' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 