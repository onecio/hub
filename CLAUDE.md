# Projeto: HUB Institucional CADE

## Especificação técnica completa
Leia OBRIGATORIAMENTE `docs/SPEC.md` antes de qualquer ação. Ela contém o contrato técnico e funcional do produto.

## Princípios invioláveis
1. Security by Design — todo controle da seção 3 do SPEC é obrigatório
2. Nenhuma dependência sem auditoria (CVEs, manutenção, licença)
3. Validação server-side em toda rota
4. Prepared statements exclusivamente — proibido concatenar SQL
5. Sem `unsafe-inline`/`unsafe-eval` no CSP
6. Sem `innerHTML` no frontend — use textContent/DOM API
7. Argon2id para senhas, MFA TOTP para admin/privileged
8. Audit log com hash chain em toda mutação sensível

## Stack fixa
- Backend: Node.js 20 LTS + Fastify + better-sqlite3
- Frontend: HTML/CSS/JS vanilla (ES6+ modules) + Vite para build
- Reverse proxy: Caddy 2
- Containerização: Docker Compose v2

## Convenções
- Commits semânticos (Conventional Commits) em português
- ESLint + Prettier obrigatórios
- Testes obrigatórios para auth, RBAC, audit, monitoring
- Documentação atualizada a cada módulo entregue

## Ordem de implementação (não pular fases)
1. Scaffold + Docker Compose + Caddyfile
2. DB connection + migrations 001_init
3. Auth + RBAC + MFA + middlewares de segurança
4. Catálogo de recursos + frontend principal
5. Painel administrativo
6. Engine de monitoramento
7. Suíte de ferramentas
8. Área restrita privilegiada
9. Hub de SI
10. Testes + documentação final