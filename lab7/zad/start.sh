#!/bin/bash

docker rm -f nginx backend_1 backend_2 worker redis postgres 2>/dev/null || true
docker network rm proxy-net app-net db-net 2>/dev/null || true


docker network create \
  --subnet 172.20.0.0/24 \
  --gateway 172.20.0.1 \
  proxy-net

docker network create \
  --subnet 172.21.0.0/24 \
  --gateway 172.21.0.1 \
  app-net

docker network create \
  --subnet 172.22.0.0/24 \
  --gateway 172.22.0.1 \
  db-net


docker run -d \
  --name postgres \
  --network db-net \
  --ip 172.22.0.10 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=products \
  postgres

docker run -d \
  --name redis \
  --network app-net \
  --ip 172.21.0.10 \
  redis

sleep 8

docker run -d \
  --name backend_1 \
  --network proxy-net \
  --ip 172.20.0.10 \
  --mac-address 02:42:ac:14:00:0a \
  -e INSTANCE_ID=backend_1 \
  -e DB_HOST=postgres \
  -e DB_USER=admin \
  -e DB_PASSWORD=admin \
  -e DB_NAME=products \
  -e REDIS_HOST=redis \
  backend-image

docker network connect app-net backend_1 --ip 172.21.0.11
docker network connect db-net backend_1 --ip 172.22.0.11


docker run -d \
  --name backend_2 \
  --network proxy-net \
  --ip 172.20.0.11 \
  -e INSTANCE_ID=backend_2 \
  -e DB_HOST=postgres \
  -e DB_USER=admin \
  -e DB_PASSWORD=admin \
  -e DB_NAME=products \
  -e REDIS_HOST=redis \
  backend-image

docker network connect app-net backend_2 --ip 172.21.0.12
docker network connect db-net backend_2 --ip 172.22.0.12


docker run -d \
  --name worker \
  --network app-net \
  --ip 172.21.0.20 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  backend-image node worker.js

docker network connect db-net worker --ip 172.22.0.20


docker run -d \
  --name nginx \
  --network proxy-net \
  -p 80:80 \
  -v $(pwd)/nginx/default.conf:/etc/nginx/conf.d/default.conf \
  nginx