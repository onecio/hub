#!/bin/sh
# Restauração do banco de dados SQLite a partir de backup
# Fase 2: implementação completa
set -eu

log() {
  printf '[restore] %s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

log "ERRO: restauração automática não implementada (Fase 2)"
log "Para restaurar manualmente:"
log "  1. Pare os containers: docker compose stop backend monitor-worker"
log "  2. Copie o backup para o volume: docker compose cp <backup>.db.gz backend:/app/data/"
log "  3. Descompacte: gzip -d <backup>.db.gz"
log "  4. Restaure: sqlite3 hub.db '.restore <backup>.db'"
log "  5. Reinicie: docker compose start backend monitor-worker"
exit 1
