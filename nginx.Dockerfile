# Stage 1 — Build React
FROM node:20-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ .
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Stage 2 — nginx serves static files + proxies /api/ to backend
FROM nginx:1.27-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 5000
