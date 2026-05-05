#!/bin/bash

BACKUP_FILE=$1

docker run --rm \
  -v pgdata:/volume \
  -v $(pwd):/backup \
  alpine \
  sh -c "rm -rf /volume/* && tar xzf /backup/$BACKUP_FILE -C /volume"

docker start postgres 2>/dev/null || true
docker restart postgres

until docker exec postgres pg_isready >/dev/null 2>&1; do
  sleep 2
done

docker exec postgres pg_isready