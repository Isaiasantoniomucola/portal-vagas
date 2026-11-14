#!/usr/bin/env bash
# Cópia de segurança diária da base de dados e dos currículos.
# Cron (todos os dias às 03:00):  0 3 * * * /caminho/portal-vagas/scripts/backup.sh >> /var/log/vagas-backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a
DESTINO="${BACKUP_DIR:-$HOME/backups-vagas}"
DATA=$(date +%F_%H%M)
mkdir -p "$DESTINO"

docker compose exec -T db mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines portal_vagas | gzip > "$DESTINO/db_$DATA.sql.gz"
docker compose exec -T api tar -C /app -czf - uploads > "$DESTINO/uploads_$DATA.tar.gz"

# mantém os últimos 14 dias
find "$DESTINO" -type f -mtime +14 -delete
echo "Backup concluído: $DESTINO ($DATA)"
