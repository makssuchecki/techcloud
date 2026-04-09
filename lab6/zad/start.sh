docker network create product-net || true

docker volume create pgdata
docker volume create backend-data

docker run -d \
  --name postgres \
  --network product-net \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=products \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15
  
docker run -d \
  --name redis \
  --network product-net \
  --tmpfs /data \
  -p 6379:6379 \
  redis:7

docker run -d \
  --name backend \
  --network product-net \
  -e DB_HOST=postgres \
  -e DB_USER=admin \
  -e DB_PASSWORD=admin \
  -e DB_NAME=products \
  -e REDIS_HOST=redis \
  -v backend-data:/app/data \
  --tmpfs /tmp \
  -p 3000:3000 \
  backend:v2

docker run -d \
  --name nginx \
  --network product-net \
  -p 80:80 \
  -v $(pwd)/frontend:/usr/share/nginx/html \
  nginx:alpine