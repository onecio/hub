# Arquitetura do HUB Institucional CADE

> Documento vivo — atualizado a cada módulo entregue conforme SPEC §20.

## Visão geral

Plataforma web corporativa com arquitetura em camadas, containerizada com Docker Compose:

```
Internet → Caddy (TLS 1.3, headers de segurança)
              ├── /api/*    → Backend (Fastify, Node.js 20)
              │                   └── SQLite 3 (WAL, FK ON)
              └── /*        → Frontend (nginx, assets Vite)
```

Rede `edge`: Caddy ↔ Backend ↔ Frontend  
Rede `internal` (sem acesso à internet): Backend ↔ monitor-worker ↔ backup

## Stack

| Camada        | Tecnologia               |
|---------------|--------------------------|
| Reverse proxy | Caddy 2 Alpine           |
| Backend       | Node.js 20 + Fastify 4   |
| Banco         | SQLite 3 (WAL mode)      |
| Frontend      | Vanilla JS ESM + Vite 5  |
| Container     | Docker Compose v2        |

## Fases de implementação

- [x] **Fase 1** — Scaffold, Docker, ESLint/Prettier, design tokens
- [ ] **Fase 2** — DB connection + migrations 001_init
- [ ] **Fase 3** — Auth + RBAC + MFA + middlewares de segurança
- [ ] **Fase 4** — Catálogo de recursos + frontend principal
- [ ] **Fase 5** — Painel administrativo
- [ ] **Fase 6** — Engine de monitoramento
- [ ] **Fase 7** — Suíte de ferramentas
- [ ] **Fase 8** — Área restrita privilegiada
- [ ] **Fase 9** — Hub de SI
- [ ] **Fase 10** — Testes + documentação final

## Decisões arquiteturais

- **SQLite sobre PostgreSQL**: superfície de ataque menor, zero dependência externa de DB, WAL oferece concorrência adequada para o volume esperado.
- **Fastify sobre Express**: validação de schema nativa, serialização JSON otimizada, melhor throughput para APIs tipadas.
- **Distroless para backend**: ausência de shell elimina vetor de ataque pós-exploração; sem pacotes desnecessários.
- **Caddy sobre Nginx/Apache**: TLS automático Let's Encrypt, configuração declarativa, HTTP/3 nativo.
