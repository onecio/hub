# Segurança do HUB Institucional CADE

> Documento vivo — atualizado a cada módulo de segurança entregue.

## Threat Model STRIDE

| Ameaça          | Componente       | Controle implementado                                        |
|-----------------|------------------|--------------------------------------------------------------|
| **S**poofing    | Auth             | Argon2id + MFA TOTP + sessões com revogação server-side      |
| **T**ampering   | API / DB         | Prepared statements, Zod schema validation, audit log imutável|
| **R**epudiation | Audit log        | Hash chain encadeado (SHA-256), timestamps UTC               |
| **I**nformation | Headers / TLS    | TLS 1.3, HSTS preload, CSP sem unsafe-inline                 |
| **D**enial      | API              | Rate limiting por IP e usuário, resource limits Docker       |
| **E**levation   | RBAC             | Papéis hierárquicos, verificação server-side em toda rota    |

## Controles por camada

### Rede / TLS
- TLS 1.3 obrigatório via Caddy (Let's Encrypt automático / ICP-Brasil em produção)
- HSTS: `max-age=63072000; includeSubDomains; preload`
- HTTP/3 habilitado (QUIC)

### Cabeçalhos HTTP (todos implementados no Caddyfile)
- `Content-Security-Policy` sem `unsafe-inline` / `unsafe-eval` (nonce dinâmico via backend na Fase 3)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Cross-Origin-{Opener,Resource,Embedder}-Policy: same-origin / require-corp`

### Autenticação (Fase 3)
- Argon2id (m=64MB, t=3, p=4) para senhas
- MFA TOTP RFC 6238 obrigatório para `admin` e `privileged`
- JWT access (15min) + refresh rotacionado (`__Host-refresh`, SameSite=Strict)
- Política de senhas: mínimo 14 chars, HaveIBeenPwned k-anonymity

### RBAC (Fase 3)
- Papéis: `viewer` < `editor` < `admin` < `privileged` < `superadmin`
- Verificação server-side em toda rota — nunca confiar no cliente

### Containers
- Imagem backend distroless (sem shell, sem pacotes extras)
- `no-new-privileges`, `cap_drop: ALL`, `read_only: true`
- Rede `internal` sem acesso à internet para workers

## OWASP Top 10 2021 — Status de cobertura

| Risco | Status Fase 1 | Planejado |
|-------|---------------|-----------|
| A01 — Broken Access Control    | Estrutura criada | Fase 3 (RBAC) |
| A02 — Cryptographic Failures   | TLS/Caddy ✓      | Fase 3 (Argon2id, AES-256-GCM) |
| A03 — Injection                | Estrutura criada | Fase 2 (prepared statements), Fase 3 (Zod) |
| A04 — Insecure Design          | Threat model ✓   | Em curso |
| A05 — Security Misconfiguration| Headers ✓, distroless ✓ | CI scan (Fase 10) |
| A06 — Vulnerable Components    | npm audit ✓      | Dependabot (Fase 10) |
| A07 — Authentication Failures  | Estrutura criada | Fase 3 |
| A08 — Software & Data Integrity| lockfile ✓       | SRI (Fase 5) |
| A09 — Logging & Monitoring     | Estrutura criada | Fase 3 (audit log chain) |
| A10 — SSRF                     | Estrutura criada | Fase 7 (allowlist) |
