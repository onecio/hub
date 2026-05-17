# API Reference — HUB Institucional CADE

> Especificação OpenAPI 3.1 completa gerada na Fase 3 (auth) e Fase 4 (recursos).
> Este documento é um placeholder — será substituído pelo Swagger UI gerado automaticamente.

## Base URL

```
https://hub.cade.gov.br/api/v1
```

## Autenticação

- **Cookie de sessão** (web): `__Host-session` + `__Host-refresh`
- **Bearer JWT** (integrações server-to-server): `Authorization: Bearer <token>`

## Endpoints previstos

| Método | Rota | Descrição | Fase |
|--------|------|-----------|------|
| GET    | /health | Liveness check | 1 ✓ |
| GET    | /health/ready | Readiness check | 1 ✓ |
| POST   | /api/v1/auth/login | Login com senha | 3 |
| POST   | /api/v1/auth/mfa/verify | Verificação TOTP | 3 |
| POST   | /api/v1/auth/logout | Logout + revogação | 3 |
| GET    | /api/v1/resources | Listar recursos | 4 |
| POST   | /api/v1/resources | Criar recurso (admin) | 4 |
| GET    | /api/v1/categories | Listar categorias | 4 |
| GET    | /api/v1/monitoring/status | Status geral | 6 |
| POST   | /api/v1/incidents | Reportar incidente SI | 9 |
| GET    | /metrics | Métricas Prometheus (autenticado) | 3 |
