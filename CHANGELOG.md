# Changelog — Engineering Operating System

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · SemVer.

- **MAJOR** — requisito `BASE` adicionado ou endurecido (quebra projetos existentes)
- **MINOR** — novo requisito `REC`/`SAAS`/`FIN`, ou nova seção
- **PATCH** — correção de texto, exemplo ou critério sem mudar a exigência

## [1.0.0] — 2026-08-17

### Adicionado

- 19 documentos normativos em `standard/` com 397 requisitos verificáveis
- `protocol/AI-DEVELOPMENT-PROTOCOL.md` — como a IA trabalha dentro do padrão
- `protocol/HIERARQUIA-DE-AUTORIDADE.md` — resolução de conflitos entre regras
- Templates de Feature Contract e ADR
- Template de contexto `.ai/` para projetos
- `bin/eos-catalog.mjs` — geração do catálogo a partir dos documentos
- Perfis de conformidade: `BASE`, `SAAS`, `FIN`, `REC`
- Stack de referência: Next.js + NestJS + PostgreSQL + Prisma

### Integração global com Claude Code

- `~/.claude/CLAUDE.md` — regras carregadas em todo projeto
- Skills `eos`, `eos-init`, `eos-dod`, `eos-check`
- Hook `eos-guard.js` — bloqueio de violações de nível 0
