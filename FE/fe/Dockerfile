# ===== BUILD FE =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===== SERVE WITH NGINX (HTTPS) =====
FROM nginx:alpine

# Nginx config (HTTPS)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static files
COPY --from=build /app/dist /usr/share/nginx/html

# SSL certs (mount từ docker-compose)
RUN mkdir -p /etc/nginx/certs

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
