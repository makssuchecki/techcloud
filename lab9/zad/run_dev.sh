#!/bin/bash

docker rm -f backend-dev 2>/dev/null || true

docker run -it \
  --name backend-dev \
  --network product-net \
  -e DB_HOST=postgres \
  -e DB_USER=admin \
  -e DB_PASSWORD=admin \
  -e DB_NAME=products \
  -e REDIS_HOST=redis \
  -v $(pwd)/backend:/app \
  -w /app \
  -p 3001:3000 \
  node:20-alpine \
  sh -c "npm install && npx nodemon --legacy-watch server.js"