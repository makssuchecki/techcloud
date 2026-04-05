FROM node:20-alpine AS deps

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS test

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=tests

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm test

FROM node:20-alpine AS production

WORKDIR /app

ARG BUILD_DATE
ARG VERSION
ARG NODE_ENV=production

ENV NODE_ENV=$NODE_ENV

LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.title="product-dashboard-backend"

COPY --from=deps /app/node_modules ./node_modules
COPY server.js ./server.js
COPY package*.json ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health >/dev/null || exit 1

CMD ["npm", "start"]