# 15 — DevOps e CI/CD

Prefixo de requisitos: `OPS`

Aqui o padrão deixa de ser documento e vira **gate automático**. Isso é muito
mais poderoso do que entregar uma lista de regras e torcer para que seja seguida.

---

## Pipeline

```
git push
   ↓
lint ──────────────► ❌ bloqueia
   ↓
type check ────────► ❌ bloqueia
   ↓
testes unitários ──► ❌ bloqueia
   ↓
scan de segredos ──► ❌ bloqueia
   ↓
SAST ──────────────► ❌ bloqueia (crítico/alto)
   ↓
audit de deps ─────► ❌ bloqueia (crítico/alto)
   ↓
build ─────────────► ❌ bloqueia
   ↓
testes de integração ► ❌ bloqueia
   ↓
code review aprovado
   ↓
merge → STAGING (deploy automático)
   ↓
testes E2E em staging
   ↓
homologação humana
   ↓
PRODUÇÃO (deploy manual ou automático com aprovação)
   ↓
smoke test pós-deploy ► ❌ rollback automático
```

Regra: **nenhum passo é pulável por conveniência.** Se um check está atrapalhando
sempre, ou o check está errado (corrija o check) ou o código está errado
(corrija o código). O que não se faz é desligar.

## Git

- Branch principal protegida: sem push direto, sem force push.
- Trabalho em branch: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`.
- Commits no padrão Conventional Commits.
- PR pequeno e com propósito único. PR de 3 mil linhas não é revisado, é aprovado.
- PR descreve: o que muda, por quê, como testar, e riscos.
- Todo PR exige aprovação de outra pessoa (ou revisão explícita quando o time é
  de um — e aí o code review automatizado é ainda mais importante).

## Ambientes

Três, no mínimo, com paridade real:

```
DEV        local, dados fictícios
STAGING    espelho de produção, dados anonimizados
PRODUÇÃO   dados reais
```

- Nunca dado real de cliente em dev ou staging sem anonimização.
- Mesma imagem/artefato promovida entre ambientes — só a configuração muda.
- Migration roda automaticamente no deploy, na ordem, com trava contra execução
  concorrente.

## Deploy

- Deploy é automatizado e reproduzível. Nada de `scp` e `pm2 restart` na mão.
- Zero downtime (rolling ou blue-green).
- Rollback definido e **testado**, com prazo alvo abaixo de 10 minutos.
- Deploy em sexta à tarde só com motivo — não por proibição folclórica, mas
  porque quem responde ao incidente precisa estar disponível.
- Toda versão em produção é rastreável até um commit específico.
- Feature grande atrás de feature flag, para desacoplar deploy de liberação.

## Configuração e segredos

- Config por ambiente, fora da imagem.
- Segredos em cofre gerenciado, injetados em runtime.
- Nenhum `.env` de produção no repositório ou no chat.
- Mudança de variável de ambiente é registrada.

## Containers

- Multi-stage build; imagem final enxuta.
- Executa como usuário não-root.
- Versão de base fixada (sem `:latest` em produção).
- Healthcheck definido.
- Imagem escaneada por vulnerabilidade no CI.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| OPS-001 | Repositório Git com branch principal protegida | BASE | Sem push direto ou force | Sim |
| OPS-002 | Conventional Commits | BASE | Validado por hook/CI | Sim |
| OPS-003 | Pipeline de CI executando em todo PR | BASE | Workflow configurado | Sim |
| OPS-004 | Lint bloqueante no CI | BASE | Falha impede merge | Sim |
| OPS-005 | Type check bloqueante no CI | BASE | Falha impede merge | Sim |
| OPS-006 | Testes bloqueantes no CI | BASE | Falha impede merge | Sim |
| OPS-007 | Scan de segredos no CI | BASE | Gitleaks obrigatório | Sim |
| OPS-008 | SAST no CI com bloqueio de crítico/alto | BASE | Semgrep/CodeQL | Sim |
| OPS-009 | Auditoria de dependências no CI | BASE | Bloqueia crítico/alto | Sim |
| OPS-010 | Build validado no CI antes do merge | BASE | Artefato gerado com sucesso | Sim |
| OPS-011 | Ambientes dev, staging e produção separados | BASE | Três ambientes ativos | Não |
| OPS-012 | Staging com paridade de configuração com produção | BASE | Mesma imagem, config diferente | Não |
| OPS-013 | Dados reais nunca em dev/staging sem anonimização | BASE | Processo de anonimização | Não |
| OPS-014 | Deploy automatizado e reproduzível | BASE | Sem passo manual não documentado | Sim |
| OPS-015 | Migrations executadas automaticamente no deploy | BASE | Com trava de concorrência | Sim |
| OPS-016 | Deploy sem downtime | BASE | Rolling ou blue-green | Não |
| OPS-017 | Rollback documentado e testado | BASE | Ensaio registrado, alvo < 10 min | Não |
| OPS-018 | Smoke test pós-deploy | BASE | Falha dispara rollback | Sim |
| OPS-019 | Versão em produção rastreável até o commit | BASE | Endpoint/label de versão | Sim |
| OPS-020 | Segredos fora da imagem e do repositório | BASE | Injetados em runtime | Sim |
| OPS-021 | Container roda como usuário não-root | BASE | Dockerfile com `USER` | Sim |
| OPS-022 | Imagem base com versão fixada | BASE | Sem `:latest` | Sim |
| OPS-023 | Scan de vulnerabilidade da imagem | REC | Trivy/Grype no CI | Sim |
| OPS-024 | PR com descrição de mudança, teste e risco | BASE | Template de PR | Sim |
| OPS-025 | Code review obrigatório antes do merge | BASE | Aprovação exigida | Sim |
| OPS-026 | Feature flag para liberação desacoplada | REC | Mecanismo disponível | Não |
| OPS-027 | Ambiente reproduzível com um comando | BASE | `docker compose up` funciona | Sim |
