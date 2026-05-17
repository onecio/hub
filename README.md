# HUB Institucional CADE

Plataforma web corporativa unificada para servidores públicos federais do CADE — Conselho Administrativo de Defesa Econômica.

Consolida sistemas institucionais, ferramentas operacionais, monitoramento de disponibilidade, painel de segurança da informação e área restrita privilegiada em um único ponto de acesso.

**Security by Design · Privacy by Default · Zero Trust · WCAG 2.1 AA · LGPD**

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Reverse proxy | Caddy 2 (TLS automático, HTTP/3) |
| Backend | Node.js 20 LTS + Fastify 4 |
| Banco de dados | SQLite 3 (WAL) via better-sqlite3 |
| Frontend | HTML/CSS/JS vanilla ES6+ + Vite 5 |
| Containerização | Docker Compose v2 |

---

## Boot rápido

### Pré-requisitos

- Docker Engine 24+ e Docker Compose v2
- `openssl` disponível no terminal

### 1. Clonar e configurar

```bash
git clone <repo> hub-institucional
cd hub-institucional
cp .env.example .env
```

Edite o `.env` e substitua todos os valores `CHANGE_ME` por segredos gerados:

```bash
openssl rand -hex 32   # use para JWT_SECRET, JWT_REFRESH_SECRET,
                       # SESSION_SECRET, CSRF_SECRET, ENCRYPTION_KEY,
                       # BACKUP_ENCRYPTION_KEY, METRICS_TOKEN, WEBHOOK_SECRET
```

### 2. Configurar domínio

**Produção**: defina `DOMAIN=hub.cade.gov.br` no `.env`. O Caddy obtém TLS via Let's Encrypt automaticamente.

**Desenvolvimento local**: defina `DOMAIN=localhost` e adicione `local_certs` no bloco global do `Caddyfile`:
```
{
    local_certs
    ...
}
```

### 3. Build e start

```bash
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

### 4. Verificar

```bash
docker compose ps                         # todos os serviços devem estar "healthy"
curl -k https://localhost/health          # {"status":"ok",...}
```

---

## Desenvolvimento

### Backend

```bash
cd backend
npm install
cp ../.env.example ../.env   # ajustar DB_PATH para caminho local
npm run dev                  # node --watch (hot reload nativo)
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Vite dev server em http://localhost:5173
```

> O Vite proxeia `/api/*` e `/health` para `http://localhost:3000` automaticamente.

### Lint e formatação

```bash
# Backend
cd backend && npm run lint && npm run format:check

# Frontend
cd frontend && npm run lint && npm run format:check
```

### Testes

```bash
cd backend && npm test            # vitest (Fase 3+: cobertura mínima 80% em módulos críticos)
cd backend && npm run test:coverage
```

---

## Estrutura de diretórios

```
hub-institucional/
├── Caddyfile               # Reverse proxy, TLS, headers de segurança
├── docker-compose.yml      # Orquestração de desenvolvimento
├── docker-compose.prod.yml # Override de produção
├── .env.example            # Template de variáveis de ambiente
├── backend/
│   ├── Dockerfile          # Multi-stage: node:20-bookworm-slim → distroless
│   ├── src/
│   │   ├── server.js       # Bootstrap Fastify
│   │   ├── healthcheck.js  # Probe Node.js (sem wget/curl no distroless)
│   │   ├── config/         # Validação de env com Zod
│   │   ├── db/             # Conexão SQLite + migrations
│   │   ├── modules/        # Módulos de domínio (auth, resources, monitoring...)
│   │   ├── middlewares/    # auth, rbac, csrf, rateLimit, auditLogger
│   │   └── workers/        # monitorWorker, backupWorker
│   └── tests/
├── frontend/
│   ├── Dockerfile          # Multi-stage: node:20-alpine → nginx:1.27-alpine
│   ├── vite.config.js      # Build Vite (nota: na raiz do pacote, não em src/)
│   ├── nginx.conf          # Servidor estático com tmpfs para read-only container
│   ├── public/             # HTML de entrada + assets estáticos
│   └── src/
│       ├── css/main.css    # Design system (tokens CSS, reset, utilidades)
│       └── js/             # app.js, api.js, modules/, components/
├── ops/                    # Scripts de backup, restore e healthcheck
└── docs/                   # ARCHITECTURE, SECURITY, API, LGPD, DEPLOY
```

---

## Fases de implementação

| # | Módulo | Status |
|---|--------|--------|
| 1 | Scaffold + Docker + ESLint/Prettier + design tokens | ✅ Completo |
| 2 | DB connection + migrations 001_init | Pendente |
| 3 | Auth + RBAC + MFA + middlewares de segurança | Pendente |
| 4 | Catálogo de recursos + frontend principal | Pendente |
| 5 | Painel administrativo | Pendente |
| 6 | Engine de monitoramento | Pendente |
| 7 | Suíte de ferramentas | Pendente |
| 8 | Área restrita privilegiada | Pendente |
| 9 | Hub de Segurança da Informação | Pendente |
| 10 | Testes + documentação final | Pendente |

---

## Conformidade

- **LGPD** (Lei 13.709/2018) — ver `docs/LGPD.md`
- **PPSI** (MGI/SGD) — Framework de Privacidade e Segurança da Informação
- **ePING** — padrões de interoperabilidade do Governo Federal
- **e-MAG 3.1** — acessibilidade (WCAG 2.1 AA)
- **OWASP Top 10 2021** — ver `docs/SECURITY.md`

---

## Licença

Uso interno CADE. Distribuição restrita.
