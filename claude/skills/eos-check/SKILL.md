---
name: eos-check
description: >-
  Audita um projeto inteiro contra os 397 requisitos do EOS e produz um relatório
  de conformidade com score por área, lacunas classificadas por severidade e plano
  de correção priorizado. Use quando o usuário pedir auditoria de conformidade,
  quiser saber o quanto um projeto segue o padrão EOS, ou ao assumir um
  sistema existente.
---

# EOS Check — Auditoria de conformidade

Catálogo: `__EOS_HOME__/requirements/CATALOGO.md`
Documentos-fonte: `__EOS_HOME__/standard/*.md`

## 1. Escopo

Leia `.ai/PROJECT-CONTEXT.md` para os perfis declarados. Audite apenas os
requisitos dos perfis aplicáveis + `REC` como informativo.

Sem `.ai/` → audite como `BASE` e registre `DOC-001` como lacuna.

## 2. Coletar evidência

Auditoria é sobre **evidência**, não impressão. Verifique no código.

```bash
# Estrutura e stack
ls -R src/ 2>/dev/null | head -60
cat package.json

# Segurança — segredos
grep -rniE "(password|secret|token|api_?key|private_key)\s*[:=]\s*['\"][^'\"]{8,}" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.env*" . | head -20
ls .env 2>/dev/null && git check-ignore .env || echo "⚠️ .env pode estar versionado"

# Autorização
grep -rn "role\s*===\|role ==" src/ | head -20        # verificação por papel espalhada
grep -rln "@UseGuards\|authorize\|requirePermission" src/ | wc -l

# Banco
ls prisma/migrations/ 2>/dev/null | wc -l
grep -rn "SELECT \*" src/ | head -10
grep -rn "findMany" src/ | grep -v "take\|skip\|cursor" | head -20   # sem paginação

# Erros e logs
grep -rn "catch\s*(\s*\w*\s*)\s*{\s*}" src/ | head -10              # catch vazio
grep -rn "console\.log" src/ | head -20

# Frontend
grep -rln "isLoading\|Skeleton" src/ | wc -l
grep -rn "<table" src/ --include="*.tsx" | head -10                  # fora do DataTable
grep -rniE "#[0-9a-f]{6}|\[[0-9]+px\]" src/ --include="*.tsx" | head -20  # valores fora dos tokens
grep -rn "alert(\|confirm(" src/ | head -10
grep -rn "dangerouslySetInnerHTML" src/ | head -10

# Tipagem
grep -rn ": any\|@ts-ignore\|eslint-disable" src/ | head -20
grep -n '"strict"' tsconfig.json

# Testes e CI
ls src/**/*.spec.* src/**/*.test.* __tests__ e2e 2>/dev/null | wc -l
ls .github/workflows/ 2>/dev/null

# Qualidade
npm run lint 2>&1 | tail -20
npm run typecheck 2>&1 | tail -20
npm test 2>&1 | tail -30
```

Adapte os comandos à stack real do projeto. Ausência de resultado em um `grep`
não é prova de conformidade — confirme lendo o código nos pontos críticos
(autenticação, autorização, endpoints de listagem, formulários).

## 3. Classificar cada lacuna

| Severidade | Critério |
| --- | --- |
| 🔴 **Crítica** | Requisito `BASE` de segurança/autorização/dados. Bloqueia produção |
| 🟠 **Alta** | Requisito `BASE` de qualidade. Corrigir no ciclo atual |
| 🟡 **Média** | Requisito do perfil declarado, sem risco imediato |
| 🔵 **Baixa** | `REC` ou melhoria |

Requisitos que sempre merecem verificação manual, porque `grep` não resolve:
`AUTZ-004` (ownership/IDOR), `AUTZ-007` (isolamento de tenant),
`AUTH-011` (enumeração de usuário), `OBS-011` (cobertura de auditoria),
`DS-009` (componentes duplicados), `FE-004` (empty inicial vs. de busca).

## 4. Relatório

```markdown
# Auditoria EOS — <projeto>
Padrão v1.0.0 · Perfis: BASE, SAAS · Data: <data>

## Score

| Área | Conformes | Total | % |
| --- | ---: | ---: | ---: |
| Arquitetura      | 9  | 12 | 75% |
| Banco de dados   | 18 | 22 | 82% |
| Backend          |    |    |     |
| API              |    |    |     |
| Frontend         |    |    |     |
| Design System    |    |    |     |
| Autenticação     |    |    |     |
| Autorização      |    |    |     |
| Segurança        |    |    |     |
| Observabilidade  |    |    |     |
| UX               |    |    |     |
| Acessibilidade   |    |    |     |
| Performance      |    |    |     |
| Testes           |    |    |     |
| DevOps           |    |    |     |
| Infraestrutura   |    |    |     |
| Documentação     |    |    |     |
| **Total**        |    |    |     |

## 🔴 Críticas — bloqueiam produção

### AUTZ-004 — Ownership não verificado
**Onde:** `src/modules/quotes/quotes.controller.ts:42`
**Evidência:** `findUnique({ where: { id } })` sem escopo de tenant
**Impacto:** qualquer usuário autenticado lê cotação de qualquer agência (IDOR)
**Correção:** filtrar por `tenantId` da sessão; retornar 404 fora do escopo
**Esforço:** 4h

## 🟠 Altas
...

## 🟡 Médias
...

## Plano de correção

| # | Requisito | Severidade | Esforço | Ordem |
| --- | --- | --- | --- | --- |
| 1 | AUTZ-004 | 🔴 | 4h | imediato |
```

## 5. Regras do relatório

- Toda lacuna traz **arquivo:linha** e evidência. Sem evidência, é suspeita — e
  deve ser marcada como "requer verificação manual".
- Não infle o score. Requisito não verificado não conta como conforme; conta como
  "não verificado" e aparece no relatório.
- Não corrija nada durante a auditoria. Auditar e corrigir são passos separados —
  ofereça a correção depois, priorizada.
- Ao final, ofereça: corrigir as críticas, gerar issues, ou aprofundar uma área.
