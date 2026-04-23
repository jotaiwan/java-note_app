# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# Build production bundle (no dev proxy needed; nginx handles routing)
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 5000
