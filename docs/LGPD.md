# LGPD — Registro de Operações de Tratamento (ROPA)

> Documento vivo — atualizado conforme implementação dos módulos de dados.

## Controlador

**CADE — Conselho Administrativo de Defesa Econômica**  
DPO: *a ser designado* — contato: privacidade@cade.gov.br

## Base legal

Art. 7º, III da Lei 13.709/2018 — execução de políticas públicas.

## Operações de tratamento previstas

| Operação | Dados | Finalidade | Retenção |
|----------|-------|-----------|----------|
| Autenticação | e-mail, hash de senha, IP, user-agent | Controle de acesso | 5 anos (audit) |
| Histórico de acesso | resource_id, timestamp, IP hash | UX / analytics interno | 90 dias, anonimizado |
| Reporte de incidentes | Opcional: nome, e-mail, evidências | Gestão de SI | 5 anos |
| Logs de auditoria | actor_id, IP, ação | Conformidade, PPSI | 5 anos |

## Direitos dos titulares

Portal de exercício de direitos (Fase 3+): acesso, correção, anonimização, eliminação, portabilidade.

## Anonimização

IPs anonimizados via HMAC com salt rotativo após 90 dias (logs de acesso).

## DPIA

Avaliação de Impacto à Proteção de Dados para Área Restrita: a ser elaborada na Fase 8.
