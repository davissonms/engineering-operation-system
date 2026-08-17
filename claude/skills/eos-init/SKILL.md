---
name: eos-init
description: >-
  Inicializa o contexto EOS (.ai/) em um projeto novo ou existente — cria
  PROJECT-CONTEXT, TECH-STACK, ARCHITECTURE, DESIGN-SYSTEM, COMPONENTS,
  BUSINESS-RULES, API-CONVENTIONS, UX-PATTERNS, SECURITY-RULES, DATABASE,
  DECISIONS e FEATURES, preenchidos a partir do que já existe no repositório.
  Use quando o usuário criar um projeto novo, pedir para colocar um projeto sob
  o padrão EOS, ou quando o .ai/ não existir.
---

# EOS Init — Bootstrap do contexto do projeto

Padrão: `__EOS_HOME__/`

## 1. Verificar estado

```bash
ls -la .ai/ 2>/dev/null
```

- `.ai/` já existe e está populado → **não sobrescreva**. Ofereça auditar
  (`/eos-check`) ou atualizar arquivos específicos que estejam defasados.
- `.ai/` ausente ou vazio → siga.

## 2. Descobrir o projeto antes de perguntar

Não pergunte o que dá para ler. Investigue primeiro:

```bash
cat package.json 2>/dev/null
ls -la
cat README.md 2>/dev/null | head -40
ls prisma/ src/ app/ 2>/dev/null
git log --oneline -10 2>/dev/null
```

Levante: stack e versões, scripts disponíveis, estrutura de diretórios,
componentes existentes em `components/ui/`, entidades do schema, rotas.

Projeto vazio (repositório novo) → parta dos defaults do EOS.

## 3. Perguntar apenas o que não dá para inferir

Use `AskUserQuestion`, no máximo 4 perguntas:

1. **Perfis de conformidade** — `BASE` sempre; `SAAS` se multiusuário/multi-tenant;
   `FIN` se toca dinheiro, pagamento ou emissão. (múltipla escolha)
2. **O que é o sistema e para quem** — se o README não responder.
3. **Papéis de usuário** — quais existem e o que cada um faz.
4. **Multi-tenant** — sim/não, e qual a coluna de tenant.

Nunca invente regra de negócio para preencher. Campo desconhecido fica em branco
com marcador, não com chute.

## 4. Copiar e preencher

```bash
mkdir -p .ai/DECISIONS .ai/FEATURES
cp -n __EOS_HOME__/templates/ai/*.md .ai/
cp -n __EOS_HOME__/templates/ai/DECISIONS/README.md .ai/DECISIONS/
cp -n __EOS_HOME__/templates/ai/FEATURES/README.md .ai/FEATURES/
```

Depois **preencha** cada arquivo com o que foi descoberto no passo 2 e respondido
no passo 3. Um `.ai/` só com template vazio não serve para nada — o valor está no
preenchimento.

Prioridade de preenchimento:
1. `PROJECT-CONTEXT.md` — perfis, descrição, papéis, multi-tenant, SLOs
2. `TECH-STACK.md` — versões e comandos reais do `package.json`
3. `ARCHITECTURE.md` — árvore real de diretórios e módulos existentes
4. `DESIGN-SYSTEM.md` + `COMPONENTS.md` — inventário de `components/ui/`
5. `DATABASE.md` — entidades reais do schema
6. Os demais — estrutura pronta, preenchimento conforme o projeto evolui

## 5. CLAUDE.md do projeto

Se não existir, crie um enxuto — o global já carrega o padrão:

```markdown
# <Nome do projeto>

Este projeto segue o **EOS v1.0.0**
(`__EOS_HOME__/`).

Perfis de conformidade: `BASE`, `SAAS`

**Antes de implementar, leia `.ai/`.** Consulte a skill `eos` para o protocolo
completo e `/eos-dod` antes de declarar qualquer coisa pronta.

## Comandos
<comandos reais do projeto>

## Particularidades
<o que foge do padrão neste projeto — cada item com ADR em .ai/DECISIONS/>
```

## 6. Projeto existente — apontar as lacunas

Se o projeto já tem código, rode uma varredura rápida dos requisitos `BASE` mais
críticos e reporte, sem corrigir nada ainda:

```
Lacunas identificadas em relação ao EOS:

❌ AUTH-007  Recuperação de senha não implementada
❌ AUTZ-004  Endpoints sem verificação de ownership
⚠️  OBS-009  Auditoria parcial (só em users)
⚠️  DS-004   3 tabelas escritas fora do DataTable

Rode /eos-check para a auditoria completa dos 397 requisitos.
```

## 7. Fechar

Diga o que foi criado, o que ficou por preencher e qual o próximo passo. Nunca
declare o contexto "completo" quando metade dos arquivos está em branco.
