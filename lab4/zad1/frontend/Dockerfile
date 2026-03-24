FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY index.html ./
COPY public ./public
COPY src ./src
COPY vite.config.js ./

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/cache.conf /etc/nginx/conf.d/cache.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN mkdir -p /tmp/nginx_cache && chmod -R 777 /tmp/nginx_cache

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]