#!/bin/bash

for vol in pgdata backend-data; do
  echo "$vol"

  docker volume inspect $vol --format '{{ .Mountpoint }}'

  docker run --rm -v $vol:/data alpine du -sh /data

  docker ps -a --filter volume=$vol --format "  - {{.Names}}"

  echo ""
done