# PROMPT DE ENGENHARIA — Plataforma HUB Corporativa Institucional

> Prompt mestre para construção de plataforma corporativa unificada de acesso, ferramentas, monitoramento e governança de segurança para instituição pública federal. Otimizado para uso em ambientes de desenvolvimento assistido por IA (Claude Code, Cursor, Kimi Code CLI, Copilot Workspace).

---

## 1. CONTEXTO E MISSÃO

Construir uma plataforma web corporativa de alto padrão visual e operacional, denominada **HUB Institucional**, destinada a servidores públicos federais (caso de referência: CADE — Conselho Administrativo de Defesa Econômica). A plataforma deve consolidar, em um único ponto de acesso:

1. Catálogo curado de **sistemas e recursos institucionais** (SEI, Intranet, Microsoft 365, Google Workspace, BI, Wiki, Normas, sistemas internos).
2. **Portais externos críticos** (gov.br, ANPD, MGI/SGD/PPSI, Centro de Excelência em Privacidade e Segurança, Diário Oficial, bancos da folha de pagamento).
3. **Suíte de ferramentas operacionais** integradas (PDF, encurtador de links, gerador de e-mail HTML, QR Code, geradores e validadores).
4. **Página de monitoramento e disponibilidade** de serviços internos e externos com métricas em tempo real (uptime, latência, degradação).
5. **Hub de Segurança da Informação e Privacidade** com conteúdo de conscientização, canal de reporte de incidentes e referências normativas (LGPD, PPSI, ISO 27001, ePING).
6. **Área administrativa** completa para gestão de recursos.
7. **Área restrita privilegiada** com MFA para acesso a painéis sensíveis (BI, SIEM, indicadores de segurança).

Princípios orientadores: **Security by Design**, **Privacy by Default**, **Zero Trust**, **Acessibilidade (WCAG 2.1 AA, e-MAG)**, **Conformidade com LGPD e PPSI**, **Modularidade**, **Observabilidade**, **Performance**.

---

## 2. ARQUITETURA E STACK TECNOLÓGICA

### 2.1 Stack Recomendada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Backend | Node.js 20 LTS + **Fastify** (ou Python 3.12 + FastAPI como alternativa) | Performance, ecossistema maduro, baixa latência, schema validation nativo |
| ORM/Query | **Better-sqlite3** (síncrono, WAL) ou **Prisma** | Performance superior em SQLite, prepared statements automáticos |
| Banco de Dados | **SQLite 3.45+** com modo WAL e `PRAGMA foreign_keys=ON` | Simplicidade, durabilidade, baixa superfície de ataque |
| Frontend | HTML5 + CSS3 (Custom Properties) + JavaScript ES6+ vanilla (módulos ESM) | Zero dependências, manutenibilidade, performance, conformidade com README |
| Build/Bundle | **Vite** apenas para minificação e bundling final | Build determinístico, sourcemaps controlados |
| Reverse Proxy | **Caddy 2** (TLS automático) ou Nginx com Let's Encrypt | TLS 1.3, HTTP/3, headers de segurança centralizados |
| Containerização | **Docker** + **Docker Compose v2** | Imutabilidade, isolamento, portabilidade |
| Workers/Jobs | **BullMQ** (Redis) ou node-cron embutido | Checks de monitoramento, rotinas de backup |
| Cache/Fila | Redis 7 (somente se necessário para fila de monitoring) | Persistência opcional para jobs |
| Logging | **Pino** (JSON estruturado) + rotação via logrotate | Logs auditáveis, ingestão em SIEM |
| Métricas | Endpoint `/metrics` Prometheus + Grafana opcional | Observabilidade padrão de mercado |

### 2.2 Estrutura de Diretórios

```
hub-institucional/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── Caddyfile
├── backend/
│   ├── src/
│   │   ├── server.js                  # Bootstrap Fastify
│   │   ├── config/                    # Carregamento e validação de env
│   │   ├── db/
│   │   │   ├── connection.js          # better-sqlite3 + PRAGMAs
│   │   │   ├── migrations/            # SQL versionadas (001_init.sql, ...)
│   │   │   └── seeds/
│   │   ├── modules/                   # Módulos de domínio (independentes)
│   │   │   ├── auth/                  # SSO mock, sessão, MFA TOTP
│   │   │   ├── users/                 # CRUD usuários + RBAC
│   │   │   ├── resources/             # Recursos institucionais
│   │   │   ├── categories/
│   │   │   ├── favorites/
│   │   │   ├── history/
│   │   │   ├── monitoring/            # Targets + workers de check
│   │   │   ├── tools/                 # Ferramentas (PDF, shortlink, email)
│   │   │   ├── shortlinks/
│   │   │   ├── incidents/             # Reporte de incidentes de SI
│   │   │   ├── audit/                 # Audit log imutável
│   │   │   ├── admin/
│   │   │   └── restricted/            # Painéis privilegiados
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── rbac.js
│   │   │   ├── rateLimit.js
│   │   │   ├── csrf.js
│   │   │   ├── securityHeaders.js
│   │   │   └── auditLogger.js
│   │   ├── plugins/
│   │   ├── schemas/                   # Zod/Ajv para validação
│   │   ├── utils/
│   │   └── workers/
│   │       ├── monitorWorker.js
│   │       └── backupWorker.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── index.html                 # Página principal (HUB)
│   │   ├── admin.html                 # Painel administrativo
│   │   ├── restrito.html              # Área privilegiada (MFA)
│   │   ├── login.html
│   │   ├── monitoramento.html
│   │   ├── ferramentas/
│   │   │   ├── pdf.html
│   │   │   ├── encurtador.html
│   │   │   ├── email-html.html
│   │   │   ├── qrcode.html
│   │   │   └── ...
│   │   ├── seguranca/
│   │   │   ├── conscientizacao.html
│   │   │   ├── reportar-incidente.html
│   │   │   └── normas.html
│   │   └── assets/
│   │       ├── icons/                 # SVGs corporativos
│   │       └── fonts/                 # Inter + DM Sans (self-hosted)
│   ├── src/
│   │   ├── css/main.css               # Design system completo
│   │   ├── js/
│   │   │   ├── app.js                 # Bootstrap
│   │   │   ├── api.js                 # Wrapper fetch com CSRF
│   │   │   ├── modules/               # Espelha backend
│   │   │   └── components/            # Web Components reutilizáveis
│   │   └── vite.config.js
│   └── Dockerfile
├── ops/
│   ├── backup.sh
│   ├── restore.sh
│   └── healthcheck.sh
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── API.md (OpenAPI 3.1)
│   ├── LGPD.md
│   └── DEPLOY.md
└── README.md
```

---

## 3. SEGURANÇA — REQUISITOS NÃO NEGOCIÁVEIS

### 3.1 Hardening de Aplicação

- **Headers HTTP obrigatórios** (aplicar em todas as respostas via middleware):
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'nonce-{random}'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- **CSP com nonce dinâmico** por requisição. Proibir `unsafe-inline` e `unsafe-eval`.
- **CSRF**: token sincronizado em cookie `__Host-csrf` + header `X-CSRF-Token` para mutações.
- **Cookies de sessão**: `__Host-session`, `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`.
- **Rate limiting** por IP e por usuário:
  - Login: 5 tentativas/15min, bloqueio progressivo exponencial.
  - APIs gerais: 100 req/min.
  - Ferramentas pesadas (PDF, conversões): 10 req/min.
- **CORS**: lista branca restrita aos domínios institucionais.
- **Input validation**: todo payload validado contra schema (Zod/Ajv) antes de processamento.
- **Output encoding**: contextual (HTML, atributo, JS, URL) — proibir `innerHTML` no frontend; usar `textContent` ou DOM API. Sanitização de Markdown via DOMPurify quando inevitável.
- **SQL Injection**: exclusivamente prepared statements parametrizados. Proibir concatenação de SQL.
- **SSRF**: encurtador de links e fetcher de previews com **allowlist** de protocolos (`https://` apenas), bloqueio de IPs privados/loopback/link-local/metadata cloud (169.254.169.254, ::1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7).
- **Upload de arquivos** (ferramenta de PDF):
  - Tamanho máximo 25 MB.
  - Validação por magic bytes (não por extensão ou MIME do cliente).
  - Processamento em sandbox (container efêmero ou worker isolado).
  - Limpeza de metadados.
  - Quarentena temporária e exclusão automática em 1h.
- **Secrets**: nunca em código. Carregamento via `.env` montado como Docker secret. Rotação documentada.

### 3.2 Autenticação e Autorização

- **Hash de senhas**: Argon2id (m=64MB, t=3, p=4). Nunca MD5/SHA1/bcrypt < 12 rounds.
- **MFA obrigatório** para perfis `admin` e `privileged`: TOTP (RFC 6238) com janela de ±1, backup codes criptografados.
- **SSO institucional** (mock inicial, mas com adapter pattern para integração futura):
  - LDAP/Active Directory.
  - OAuth 2.0 / OIDC com **gov.br** (provedor de identidade do governo federal).
  - SAML 2.0.
- **Sessões**: JWT curtas (15min) + refresh token rotacionado em cookie `__Host-refresh`. Lista de revogação no SQLite.
- **RBAC**: papéis hierárquicos (`viewer`, `editor`, `admin`, `privileged`, `superadmin`) + permissões granulares por recurso/ação.
- **ABAC** complementar para área restrita (atributos: lotação, cargo, projeto).
- **Just-in-time access**: solicitação temporária a recursos sensíveis com aprovação registrada em audit log.
- **Política de senhas**: mínimo 14 caracteres, verificação contra base **HaveIBeenPwned k-anonymity API**, proibição de senhas comuns.
- **Logout**: invalidação imediata de sessão server-side, revogação de refresh token.

### 3.3 Auditoria e Logs

- **Audit log imutável** em tabela `audit_log` com hash encadeado (cada registro contém SHA-256 do registro anterior — blockchain-like append-only).
- Eventos auditados: login (sucesso/falha), logout, MFA, criação/alteração/exclusão de recursos, acesso a área restrita, exportações, mudanças de permissão, alterações de configuração.
- Campos: timestamp ISO 8601 UTC, actor_id, actor_ip, user_agent, action, target_type, target_id, payload_hash, previous_hash, current_hash, success.
- Logs estruturados em JSON (Pino) com correlação por `request_id` (UUID v4).
- Exportação periódica para SIEM via syslog RFC 5424 ou webhook assinado (HMAC-SHA256).
- Retenção: 5 anos (alinhada à LGPD e ePING).

### 3.4 Criptografia

- **TLS 1.3** obrigatório (TLS 1.2 apenas como fallback). Ciphers AEAD apenas.
- Certificados via Let's Encrypt (Caddy automático) ou ICP-Brasil em produção.
- Dados sensíveis em repouso: criptografia AES-256-GCM com chave derivada via HKDF a partir de master key em variável de ambiente.
- Backups do SQLite criptografados com `age` ou `gpg` antes de armazenamento externo.

### 3.5 Vulnerabilidades a Mitigar Explicitamente

Cobertura mínima do **OWASP Top 10 2021** e **OWASP API Top 10**:

| Risco | Mitigação Implementada |
|---|---|
| A01 — Broken Access Control | RBAC + ABAC, verificação server-side em toda rota, testes automatizados |
| A02 — Cryptographic Failures | TLS 1.3, Argon2id, AES-256-GCM, sem dados sensíveis em logs |
| A03 — Injection | Prepared statements, validação Zod, output encoding |
| A04 — Insecure Design | Threat modeling (STRIDE) documentado, princípio do menor privilégio |
| A05 — Security Misconfiguration | Imagens Docker distroless, headers, scan automatizado |
| A06 — Vulnerable Components | `npm audit` em CI, Dependabot, Trivy scan |
| A07 — Authentication Failures | MFA, lockout, política de senhas, sessões seguras |
| A08 — Software & Data Integrity | SRI, lockfiles versionados, assinatura de releases |
| A09 — Logging & Monitoring Failures | Audit log encadeado, SIEM integration |
| A10 — SSRF | Allowlist, bloqueio de IPs internos |

---

## 4. MODELO DE DADOS (SQLite)

Schema mínimo. Todas as tabelas com `id` UUID v7 ou ULID, `created_at`, `updated_at`, `deleted_at` (soft delete).

```sql
-- Usuários e RBAC
users (id, email, name, registration, password_hash, mfa_secret_enc, mfa_enabled,
       status, last_login_at, failed_attempts, locked_until, created_at, updated_at);
roles (id, name, description);
permissions (id, code, description);
role_permissions (role_id, permission_id);
user_roles (user_id, role_id, granted_by, granted_at, expires_at);

-- Catálogo de recursos
categories (id, slug, name, icon, color, order_index, active);
resources (id, name, slug, description, url, category_id, icon_svg, order_index,
           status, is_new, is_external, requires_auth, visibility, created_by, ...);

-- Engajamento do usuário
favorites (user_id, resource_id, created_at);
access_history (id, user_id, resource_id, accessed_at, ip, user_agent);
user_preferences (user_id, layout_json, theme, created_at, updated_at);

-- Monitoramento
monitoring_targets (id, name, url, type, expected_status, timeout_ms, interval_seconds,
                    category, criticality, active);
monitoring_checks (id, target_id, checked_at, status, latency_ms, status_code,
                   error_message, region);
monitoring_incidents (id, target_id, started_at, ended_at, severity, description,
                      resolved_by);

-- Encurtador
short_links (id, slug, target_url, created_by, expires_at, max_clicks, click_count,
             password_hash, active, created_at);
short_link_clicks (id, short_link_id, clicked_at, ip_hash, user_agent_hash, referer_host);

-- Ferramentas (auditoria de uso)
tool_usage (id, tool_code, user_id, parameters_hash, result_size, duration_ms, created_at);

-- Incidentes de SI
incidents (id, reporter_id, anonymous, category, severity, title, description,
           evidence_files_json, status, assigned_to, created_at, ...);

-- Auditoria imutável (hash chain)
audit_log (id, sequence, timestamp, actor_id, actor_ip, action, target_type, target_id,
           payload_json, previous_hash, current_hash, success);

-- Sessões e tokens
sessions (id, user_id, refresh_token_hash, ip, user_agent, expires_at, revoked_at);

-- Configurações
settings (key, value, type, updated_by, updated_at);
```

Migrations versionadas em SQL puro (`001_init.sql`, `002_monitoring.sql`, ...) executadas no boot por script idempotente.

---

## 5. DOCKER COMPOSE

### 5.1 Serviços

```yaml
version: "3.9"

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks: [edge]
    depends_on: [backend]

  backend:
    build: ./backend
    restart: unless-stopped
    env_file: .env
    volumes:
      - db_data:/app/data
      - uploads_tmp:/app/tmp
    networks: [edge, internal]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
    security_opt: [no-new-privileges:true]
    cap_drop: [ALL]
    read_only: true
    tmpfs: [/tmp]

  frontend:
    build: ./frontend
    restart: unless-stopped
    networks: [edge]

  monitor-worker:
    build: ./backend
    command: node src/workers/monitorWorker.js
    restart: unless-stopped
    env_file: .env
    volumes: [db_data:/app/data]
    networks: [internal]

  backup:
    image: alpine:3.19
    restart: unless-stopped
    volumes:
      - db_data:/data:ro
      - backups:/backups
    command: /scripts/backup.sh
    networks: [internal]

volumes:
  db_data:
  uploads_tmp:
  caddy_data:
  caddy_config:
  backups:

networks:
  edge:
  internal:
    internal: true
```

### 5.2 Hardening Docker

- Imagens base **distroless** ou Alpine atualizada; **scan Trivy** obrigatório em CI.
- `USER` não-root em todos os Dockerfiles (UID 10001).
- Capabilities removidas (`cap_drop: ALL`), `no-new-privileges`, `read_only: true` + `tmpfs` para escrita transitória.
- Healthchecks em todos os serviços.
- Recursos limitados (`deploy.resources.limits`).
- Rede `internal` sem acesso à internet para workers que não precisam.
- Secrets via `docker secret` em swarm ou `.env` com permissão 0600.

---

## 6. DESIGN SYSTEM

### 6.1 Princípios Visuais

Estética **corporativa premium**, inspirada em produtos como Linear, Vercel Dashboard, Stripe e portais governamentais modernos (gov.br design system). **Dark mode primário**, light mode opcional. Sofisticação por **contenção, contraste sutil, hierarquia tipográfica e micro-interações**.

### 6.2 Tokens (CSS Custom Properties)

Manter paleta do README e estender:

```css
:root {
  /* Backgrounds */
  --bg-primary: #0B0F19;
  --bg-secondary: #0F1525;
  --bg-tertiary: rgba(255,255,255,0.028);
  --bg-elevated: rgba(255,255,255,0.045);

  /* Texto */
  --text-primary: #F0F1F5;
  --text-secondary: rgba(240,241,245,0.62);
  --text-tertiary: rgba(240,241,245,0.38);

  /* Acentos */
  --accent: #3B6BFF;
  --accent-hover: #5B82FF;
  --accent-soft: rgba(59,107,255,0.12);

  /* Estados */
  --success: #10B981;
  --warning: #D97706;
  --danger: #DC2626;
  --info: #0EA5E9;

  /* Bordas */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.1);
  --border-strong: rgba(255,255,255,0.18);

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.24);
  --shadow-glow: 0 0 0 1px rgba(59,107,255,0.4), 0 8px 32px rgba(59,107,255,0.18);

  /* Tipografia */
  --font-ui: 'Inter', -apple-system, system-ui, sans-serif;
  --font-display: 'DM Sans', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Raios */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* Espaçamento (escala 4px) */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

  /* Transições */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 120ms;
  --duration-normal: 220ms;
  --duration-slow: 360ms;
}
```

### 6.3 Componentes (Web Components reutilizáveis)

- `<hub-card>`, `<hub-button>`, `<hub-modal>`, `<hub-toast>`, `<hub-badge>`, `<hub-input>`, `<hub-select>`, `<hub-tab-bar>`, `<hub-skeleton>`, `<hub-status-dot>`, `<hub-tooltip>`, `<hub-dropdown>`, `<hub-data-table>`, `<hub-chart>` (baseado em ECharts ou Chart.js), `<hub-icon>`.
- Ícones SVG line-art stroke 1.5px, 24×24px viewBox, monocromáticos com `currentColor`.
- Tipografia self-hosted (Inter + DM Sans em WOFF2) com `font-display: swap`.
- Micro-interações: hover com elevação sutil (`translateY(-1px)`), focus rings em `--accent`, transições com `cubic-bezier`.
- Skeleton loading em todas as listagens.
- Estados vazios ilustrados (não usar imagens externas — SVG inline).

### 6.4 Acessibilidade

- Conformidade **WCAG 2.1 nível AA** e **e-MAG 3.1**.
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- Navegação completa por teclado, foco visível, skip links.
- Atributos ARIA corretos, landmarks semânticas.
- Suporte a `prefers-reduced-motion`, `prefers-color-scheme`.
- Testes com axe-core em CI.

---

## 7. PÁGINA PRINCIPAL (HUB)

### 7.1 Layout

1. **Header fixo**: logo institucional, busca global (atalho `Ctrl/Cmd + K` via command palette estilo Linear), notificações, avatar do usuário.
2. **Hero compacto**: saudação contextual ("Bom dia, Maria"), busca expandida quando vazia, atalhos rápidos.
3. **Seção Favoritos** (aparece dinamicamente quando há itens).
4. **Acessados Recentemente** (carrossel horizontal, últimos 10).
5. **Tabs de Categorias**: Todos, Segurança, Produtividade, Dados, Infraestrutura, Comunicação, Jurídico, RH, Financeiro, Ferramentas, Governo.
6. **Grade de Recursos** (cards ~280px).
7. **Footer institucional**: links de conformidade, LGPD, acessibilidade, versão, status geral do sistema.

### 7.2 Recursos do Catálogo (sugestão de seed inicial)

**Institucionais (CADE):**
- SEI (Sistema Eletrônico de Informações)
- Intranet CADE
- Wiki CADE
- Portal de Normas CADE
- BI CADE (acesso público)
- Sistema de Ponto Eletrônico
- Sistema de Diárias e Passagens (SCDP)
- SouGov
- Portal do Servidor

**Produtividade:**
- Microsoft 365 (Outlook, Teams, OneDrive, SharePoint)
- Google Workspace (se aplicável)
- Confluence / Notion institucional

**Governo Federal:**
- gov.br
- Diário Oficial da União (DOU)
- Portal de Serviços (servicos.gov.br)
- Portal da Transparência
- ComprasNet / Compras.gov.br
- SIASG
- SIAPE
- SIORG

**Bancos (Folha de Pagamento):**
- Banco do Brasil
- Caixa Econômica Federal
- Bradesco
- Itaú
- Santander

**Segurança e Privacidade (referências institucionais):**
- ANPD — Autoridade Nacional de Proteção de Dados (https://www.gov.br/anpd)
- Centro de Excelência em Privacidade e Segurança — gov.br
- PPSI — MGI/SGD (Programa de Privacidade e Segurança da Informação)
- CTIR Gov (https://www.gov.br/ctir)
- GSI/PR — Gabinete de Segurança Institucional

---

## 8. SUÍTE DE FERRAMENTAS INTEGRADAS

Cada ferramenta em rota dedicada `/ferramentas/{slug}`, processamento server-side em workers isolados, com rate limiting agressivo e audit log de uso.

### 8.1 Ferramentas de Documento

- **PDF Toolkit**: merge, split, compress, rotate, watermark, OCR (Tesseract), conversão PDF↔imagem, extração de texto/tabelas, assinatura visual, remoção de metadados, validação de assinatura ICP-Brasil.
- **Conversor de Documentos**: DOCX↔PDF, DOCX↔Markdown, HTML↔PDF.
- **Comparador de Documentos** (diff visual).
- **Editor Markdown** com preview ao vivo e exportação.

### 8.2 Ferramentas de Comunicação

- **Gerador de E-mail HTML responsivo** com templates corporativos (comunicado, convocação, ofício, newsletter), preview em múltiplos clientes, validação inline, sanitização.
- **Gerador de QR Code** (URL, vCard, WiFi, texto).
- **Encurtador de Links institucional** (`/l/{slug}`):
  - Domínio próprio.
  - Allowlist de domínios destino (gov.br, sites institucionais, allowlist configurável pelo admin).
  - Expiração configurável, limite de cliques, senha opcional.
  - Bloqueio de SSRF e URLs maliciosas (integração com Google Safe Browsing API ou base local).
  - Estatísticas anônimas (hash de IP).

### 8.3 Ferramentas de Texto e Dados

- **Conversores**: base64, URL encode, JWT decoder (apenas decode, sem validação de assinaturas terceiras), hash (SHA-256, SHA-512), case converter.
- **Geradores**: senhas seguras (configurable entropy), UUID, lorem ipsum institucional.
- **Validadores**: CPF, CNPJ, e-mail, IBAN, CEP (consulta ViaCEP via proxy).
- **JSON/XML/YAML formatter** com validação.
- **Diff textual** lado a lado.

### 8.4 Ferramentas Jurídicas/Administrativas

- **Calculadora de prazos processuais e administrativos** (dias úteis, com feriados nacionais e ponto facultativo via API).
- **Calculadora de juros e correção monetária** (IPCA, SELIC, IGP-M via Banco Central API).
- **Consulta de processos** (integração SEI quando disponível).

### 8.5 Ferramentas de Mercado de Carbono e ESG (diferencial)

- **Calculadora de Pegada de Carbono Institucional** (Escopo 1, 2, 3 — GHG Protocol).
- **Conversor de unidades de emissão** (tCO₂e).
- **Painel de indicadores ESG** institucionais.

---

## 9. PÁGINA DE MONITORAMENTO E DISPONIBILIDADE

### 9.1 Funcionalidades

- **Status geral consolidado** no topo: Operacional / Degradado / Parcial / Indisponível.
- **Cards por serviço** com indicador (verde/amarelo/laranja/vermelho), uptime 30/90 dias, latência média, último incidente.
- **Gráfico histórico** de uptime (90 dias, estilo barras) e latência (linha).
- **Categorias**: Sistemas Internos, Microsoft 365, Google, gov.br, Bancos, Outros.
- **Timeline de incidentes** com filtros.
- **Página pública sem autenticação** (status público) + visão detalhada autenticada.
- **Assinatura de alertas** (e-mail, webhook).

### 9.2 Engine de Checks

- Worker dedicado executa checks por intervalo configurável (30s a 5min).
- Tipos de check: HTTP(S) status, latência, TLS expiry, DNS, conteúdo (regex), porta TCP.
- Detecção de degradação: latência > p95 histórico × 2 por 3 checks consecutivos.
- Persistência em `monitoring_checks` com agregação para evitar explosão de dados (downsampling após 7 dias).
- Alvos sugeridos (seed):
  - SEI, Intranet, BI CADE
  - login.microsoftonline.com, outlook.office.com
  - accounts.google.com
  - gov.br, sso.acesso.gov.br
  - bb.com.br, caixa.gov.br
  - dados.gov.br, transparencia.gov.br

---

## 10. HUB DE SEGURANÇA DA INFORMAÇÃO

### 10.1 Conscientização

- Página `/seguranca/conscientizacao` com:
  - Cards temáticos (phishing, senhas, MFA, engenharia social, BYOD, classificação da informação, LGPD).
  - Microlearning interativo (quizzes).
  - Boletins de alerta (CTIR Gov, CERT.br).
  - Mural de campanhas (Outubro Cibernético, etc.).
  - Indicador de progresso individual do usuário.

### 10.2 Reporte de Incidentes

- Página `/seguranca/reportar` com formulário estruturado:
  - Categoria (phishing, malware, acesso indevido, vazamento, indisponibilidade, social engineering, outro).
  - Severidade percebida.
  - Descrição livre, anexos opcionais (com limites).
  - Modo anônimo opcional.
  - Confirmação com número de protocolo.
- Backend gera ticket, notifica equipe de SI (e-mail/webhook), registra em `incidents` e audit log.
- Painel de gestão de incidentes na área administrativa.

### 10.3 Normas e Referências

- Política de Segurança da Informação institucional (PDF + visualização).
- Termo de Responsabilidade.
- Links externos curados:
  - https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/centro-de-excelencia-em-privacidade-e-seguranca
  - https://www.gov.br/anpd
  - https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi
  - CTIR Gov, CERT.br, NIST CSF, ISO 27001/27002, LGPD (Lei 13.709/2018).

---

## 11. PAINEL ADMINISTRATIVO

Rota `/admin` (autenticação obrigatória + papel `admin` + MFA).

### 11.1 Funcionalidades

- **Dashboard**: KPIs (recursos ativos, usuários ativos 30 dias, ferramentas mais usadas, incidentes abertos, uptime médio).
- **Gestão de Recursos**: CRUD completo, drag & drop de ordem, ativação/desativação, agendamento de publicação, badge "Novo" automático por 14 dias.
- **Gestão de Categorias**: CRUD, ícones, cores.
- **Gestão de Usuários e Papéis**: convite, ativação, atribuição de papéis, MFA enforcement, reset de senha (gera link com TTL).
- **Gestão de Monitoramento**: cadastro de targets, configuração de checks, criticidade.
- **Gestão de Encurtador**: lista de links, métricas, bloqueio.
- **Gestão de Incidentes**: triagem, atribuição, status, comunicação.
- **Audit Log Viewer**: filtros, exportação CSV/JSON, verificação de integridade do hash chain.
- **Configurações**: SMTP, integrações, branding (logo, cores institucionais), políticas (timeout de sessão, complexidade de senha).
- **Backup/Restore**: download manual de snapshot, log de backups automáticos.

---

## 12. ÁREA RESTRITA PRIVILEGIADA

Rota `/restrito` (autenticação + papel `privileged` ou `superadmin` + **MFA obrigatório** + verificação adicional de IP/dispositivo).

### 12.1 Funcionalidades

- **Painel BI Sensível**: indicadores financeiros, RH, processos sigilosos (apenas para usuários com clearance).
- **Indicadores de Segurança Cibernética**:
  - Tentativas de login bloqueadas (7d, 30d).
  - Top usuários por falhas de autenticação.
  - Alertas de SIEM integrados (via webhook).
  - Status de patches e CVEs críticas.
  - Mapa de incidentes ativos.
- **Visualizador de Audit Log com filtros forenses**.
- **Acesso a documentos confidenciais** (classificação reservada/secreta) com:
  - Watermark dinâmico (nome + matrícula + timestamp) renderizado server-side.
  - Bloqueio de download para documentos classificados.
  - Registro detalhado de acesso.
- **Console de Just-in-Time Access**: aprovação de solicitações temporárias.
- **Kill switch**: desativação emergencial de recursos ou contas.

---

## 13. API E INTEGRAÇÕES

- **REST API** documentada em **OpenAPI 3.1** (Swagger UI restrito ao admin).
- Versionamento via path (`/api/v1/...`).
- Autenticação via cookie de sessão (web) ou Bearer JWT (integrações server-to-server).
- **Webhooks** com assinatura HMAC-SHA256 para eventos críticos (incidente criado, recurso alterado, alerta de monitoramento).
- **Adapters** para integração futura:
  - LDAP/AD.
  - gov.br OIDC.
  - SIEM (Splunk, Wazuh, Elastic) via syslog/webhook.
  - SMTP para notificações.
  - Provedores de SMS (opcional, para MFA fallback).

---

## 14. OBSERVABILIDADE

- **Logs**: Pino JSON estruturado, correlation ID por request, sem dados pessoais.
- **Métricas**: endpoint `/metrics` Prometheus (autenticado) com counters de requests, latência (histograma), erros, jobs de monitoramento.
- **Tracing** opcional via OpenTelemetry.
- **Healthchecks**: `/health` (liveness) e `/health/ready` (readiness, verifica DB).
- **Alertas**: configuração em arquivo declarativo para envio a webhook (Slack/Teams/e-mail) em caso de degradação.

---

## 15. CONFORMIDADE REGULATÓRIA

### 15.1 LGPD (Lei 13.709/2018)

- **ROPA** (Registro das Operações de Tratamento) documentado em `docs/LGPD.md`.
- **Base legal**: execução de políticas públicas (Art. 7º, III).
- **Direitos do titular**: portal de exercício (acesso, correção, anonimização, eliminação, portabilidade).
- **Aviso de privacidade** visível em rodapé e no primeiro acesso.
- **DPIA** para área restrita.
- **Anonimização** de IPs em logs após 90 dias (hash com salt rotativo).
- **DPO contact** no rodapé.

### 15.2 PPSI (MGI/SGD)

- Implementação dos controles do **Framework de Privacidade e Segurança da Informação** do Governo Federal.
- Auto-avaliação documentada.

### 15.3 ePING e e-MAG

- **ePING**: padrões de interoperabilidade do governo (formatos abertos, REST, JSON, OpenAPI).
- **e-MAG 3.1**: acessibilidade.
- **Identidade Visual do Governo Federal**: respeitar quando aplicável (logo, cores institucionais).

### 15.4 Outros Alinhamentos

- **ISO/IEC 27001 e 27002**: controles de segurança da informação.
- **NIST CSF**: framework de cibersegurança.
- **CIS Controls v8**.

---

## 16. PERFORMANCE

- **Lighthouse**: alvo ≥ 95 em Performance, Accessibility, Best Practices, SEO.
- **Core Web Vitals**:
  - LCP < 1.5s
  - INP < 200ms
  - CLS < 0.05
- **Bundle JS** crítico < 50 KB gzipped.
- **CSS** crítico inline < 14 KB.
- **Fontes** self-hosted WOFF2 com `font-display: swap` e preload.
- **Lazy loading** de imagens e rotas.
- **Cache** HTTP agressivo para assets estáticos (immutable, 1 ano) com hash no nome.
- **Service Worker** opcional para offline-first em página principal (sem dados sensíveis).

---

## 17. TESTES E QUALIDADE

- **Unit tests**: Vitest/Jest, cobertura mínima 80% em módulos críticos (auth, RBAC, audit).
- **Integration tests**: rotas REST, fluxos de banco.
- **E2E tests**: Playwright cobrindo fluxos críticos (login, MFA, CRUD recursos, ferramenta de PDF, reporte de incidente).
- **Testes de segurança**:
  - SAST: Semgrep, ESLint security plugins.
  - DAST: OWASP ZAP em pipeline.
  - Dependency scan: `npm audit`, Snyk, Trivy.
  - Container scan: Trivy/Grype.
- **Testes de carga**: k6 ou Artillery (alvo: 500 usuários concorrentes, p95 < 300ms).
- **Lint e formatação**: ESLint, Prettier, EditorConfig, commit hooks (Husky + lint-staged).
- **CI/CD**: GitHub Actions / GitLab CI com gates de qualidade obrigatórios.

---

## 18. DEPLOY E OPERAÇÃO

### 18.1 Procedimento

```bash
# Clonar e configurar
git clone <repo>
cd hub-institucional
cp .env.example .env
# Editar .env com secrets gerados (openssl rand -hex 32)

# Build e start
docker compose build --no-cache
docker compose up -d

# Migrações executam automaticamente no boot do backend
# Acesso: https://hub.cade.gov.br
```

### 18.2 Backup

- Snapshot automático do SQLite (com `.backup`) a cada 6h.
- Retenção: 7 diários, 4 semanais, 12 mensais.
- Criptografia AES-256 antes de envio para storage externo (S3 compatível ou local).
- Teste de restore mensal documentado.

### 18.3 RTO/RPO

- **RTO**: < 1 hora.
- **RPO**: < 6 horas.

---

## 19. CRITÉRIOS DE ACEITE

1. Aplicação roda com `docker compose up -d` sem erros.
2. Página principal carrega em < 1.5s em rede 4G simulada.
3. Lighthouse ≥ 95 nas quatro categorias.
4. Zero vulnerabilidades **High/Critical** em scan Trivy/Snyk/ZAP.
5. CSP sem `unsafe-inline`/`unsafe-eval` e funcional.
6. MFA operacional para admin e área restrita.
7. Audit log com hash chain verificável.
8. Backup automático e restore testado.
9. WCAG 2.1 AA validado por axe-core.
10. Documentação completa (ARCHITECTURE, SECURITY, API, DEPLOY, LGPD).
11. Testes E2E passando em CI.
12. Suporte mínimo a 500 usuários concorrentes (k6).

---

## 20. INSTRUÇÕES FINAIS À FERRAMENTA DE IA

- Implemente **incrementalmente** seguindo a ordem: (1) scaffold + Docker, (2) DB + migrations, (3) auth + RBAC + MFA, (4) middlewares de segurança, (5) catálogo de recursos + frontend principal, (6) admin, (7) monitoramento, (8) ferramentas, (9) área restrita, (10) hub de SI, (11) testes, (12) documentação.
- Após cada módulo, gere **commit semântico** com descrição clara e atualize a documentação.
- Justifique decisões arquiteturais não triviais em comentários no código.
- **Não introduza dependências externas sem necessidade**. Cada dependência adicionada deve ser auditada (manutenção ativa, sem CVEs abertas, licença permissiva).
- Preserve o design system do README e estenda-o com coerência.
- Considere extensibilidade: nova categoria, novo recurso, nova ferramenta, novo target de monitoramento devem ser adicionáveis **sem alterações de código** (apenas via painel admin ou seeds).
- Documente em `SECURITY.md` o **threat model STRIDE** completo e os controles aplicados.
- Entregue o produto pronto para auditoria externa de segurança.

---

**Fim do prompt.** Use este documento como contrato técnico e funcional para a construção da Plataforma HUB Institucional.
