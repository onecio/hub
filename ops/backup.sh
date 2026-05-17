#!/bin/sh
# Backup periódico do banco de dados SQLite
# Fase 2: implementação completa com sqlite3 .backup, compressão e criptografia age/gpg
set -eu

DB_PATH="${DB_PATH:-/data/hub.db}"
BACKUP_DIR="${BACKUP_PATH:-/backups}"
INTERVAL_H="${BACKUP_INTERVAL_HOURS:-6}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

log() {
  printf '[backup] %s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

log "Serviço inicializado"
log "DB: $DB_PATH | destino: $BACKUP_DIR | intervalo: ${INTERVAL_H}h | retenção: ${RETENTION_DAYS}d"
log "ATENÇÃO: implementação completa pendente para Fase 2"
log "Fase 2 adicionará: sqlite3 online backup, gzip, criptografia AES-256 (age/gpg), rotação automática"

while true; do
  log "Aguardando próximo ciclo (${INTERVAL_H}h)..."
  sleep "$(( INTERVAL_H * 3600 ))"
  log "Ciclo de backup — não implementado (Fase 2)"
done
