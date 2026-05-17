# Deploy — HUB Institucional CADE

## Pré-requisitos

- Docker Engine 24+ e Docker Compose v2
- Domínio com DNS apontando para o servidor (`DOMAIN=hub.cade.gov.br`)
- Portas 80 e 443 abertas no firewall

## Boot rápido (desenvolvimento)

```bash
git clone <repo> hub-institucional
cd hub-institucional
cp .env.example .env

# Gerar segredos (executar uma vez por variável CHANGE_ME)
openssl rand -hex 32  # copiar para JWT_SECRET, SESSION_SECRET, ENCRYPTION_KEY, etc.

# Para desenvolvimento local: editar DOMAIN=localhost no .env
# e adicionar "local_certs" no Caddyfile (ver README)

docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

## Ambiente de produção

```bash
# Usar docker-compose.prod.yml como override
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Verificação pós-deploy

```bash
# Saúde dos serviços
docker compose ps
docker compose exec -it backend node src/healthcheck.js

# Logs de segurança
docker compose logs caddy | grep -v "200 GET"
```

## Atualização

```bash
git pull
docker compose build --no-cache
docker compose up -d --no-deps backend frontend
# Migrações executam automaticamente no boot do backend (Fase 2+)
```

## Variáveis de ambiente críticas

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `JWT_SECRET` | Assinar access tokens | Sim |
| `JWT_REFRESH_SECRET` | Assinar refresh tokens (diferente do anterior) | Sim |
| `ENCRYPTION_KEY` | Chave AES-256-GCM para dados em repouso | Sim |
| `DOMAIN` | Domínio público (Caddy obtém TLS automaticamente) | Sim |
| `ADMIN_EMAIL` | Email para notificações Let's Encrypt | Sim |

## Backup e restore

Ver `ops/backup.sh` e `ops/restore.sh`.  
Implementação completa na Fase 2.
