#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pg_backup_$TIMESTAMP.tar"

docker run --rm \
  -v pgdata:/volume \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/$BACKUP_FILE -C /volume .

echo "Backup zapisany jako $BACKUP_FILE"