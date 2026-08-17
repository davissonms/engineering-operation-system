---
name: eos
description: >-
  Carrega o protocolo completo do Engineering Operating System (EOS) — como
  consultar o padrão antes de implementar, quando reutilizar, quando criar,
  quando parar e pedir decisão humana, e quando atualizar o contexto do projeto.
  Use quando o usuário pedir para seguir o padrão, mencionar EOS, engineering
  standard, ou ao iniciar uma funcionalidade relevante em qualquer projeto sob
  o padrão.
---

# EOS — Protocolo de Desenvolvimento

Padrão: `__EOS_HOME__/` (EOS v1.0.0)

## Passo 1 — Orientar

Leia, nesta ordem, o que existir:

```
.ai/PROJECT-CONTEXT.md    perfis (BASE/SAAS/FIN), versão do padrão, SLOs
.ai/TECH-STACK.md         tecnologias e comandos
.ai/ARCHITECTURE.md       camadas e fronteiras
.ai/DESIGN-SYSTEM.md      tokens e componentes
.ai/COMPONENTS.md         inventário
.ai/BUSINESS-RULES.md     regras e permissões
.ai/API-CONVENTIONS.md    contratos e códigos de erro
.ai/DECISIONS/            ADRs, principalmente exceções ao padrão
```

Sem `.ai/`: rode `/eos-init` ou avise que o projeto não está sob o padrão.

Depois leia o protocolo integral:
`__EOS_HOME__/protocol/AI-DEVELOPMENT-PROTOCOL.md`

## Passo 2 — Procurar antes de criar

Busque por **função**, não por nome. Não achar `formatCurrency` não significa que
não exista — procure `toBRL`, `money`, `formatPrice`.

```
Existe idêntico?          → use
Existe quase igual?       → estenda por prop/variante/composição
Existe padrão análogo?    → siga a mesma forma
Nada parecido?            → crie, documente e registre em .ai/
```

Nunca crie a segunda variação de um componente existente por diferença visual.

## Passo 3 — Contratar o escopo

Feature relevante → escreva o Feature Contract antes de implementar:
`protocol/FEATURE-CONTRACT.template.md` → `.ai/FEATURES/<slug>.md`

Ele força a lista que costuma faltar: permissões, auditoria, estados de tela,
erros, validações, testes, critério de aceite.

Tarefa pequena (um campo, um bug) → siga direto.

## Passo 4 — Verificar conflito

Consulte `protocol/HIERARQUIA-DE-AUTORIDADE.md`. Se o pedido contraria o padrão:

```
⚠️ CONFLITO COM O PADRÃO

Pedido:      <o que foi pedido>
Contraria:   <ID> (<perfil>) — <requisito>
Fonte:       standard/<arquivo>.md
Nível:       <n> vs <n>

Opções:
A) <alternativa dentro do padrão>  ← recomendado
B) Registrar exceção em ADR
C) Promover a mudança ao padrão global

Como você quer seguir?
```

Requisito de segurança/lei (nível 0) **não admite exceção local**.

## Passo 5 — Implementar

Ordem de uma feature vertical:

```
1. Migration        7. Cliente/serviço no frontend
2. Domínio/service  8. Tela: loading → empty → error → success
3. Autorização      9. Formulário: erro por campo, anti-duplo-envio
4. Endpoint         10. Responsividade e acessibilidade
5. Erros            11. Testes: unit → integração → E2E
6. Auditoria/logs   12. Documentação + .ai/
```

Consulte o documento da área quando a decisão for específica:

| Assunto | Documento |
| --- | --- |
| Estrutura, módulos, camadas | `standard/01-ARQUITETURA.md` |
| Schema, migration, índices | `standard/02-BANCO-DE-DADOS.md` |
| Service, validação, fila, config | `standard/03-BACKEND.md` |
| Contrato, status, paginação | `standard/04-API.md` |
| Estados, formulários, cache | `standard/05-FRONTEND.md` |
| Tokens, componentes, arquétipos | `standard/06-DESIGN-SYSTEM.md` |
| Login, senha, sessão, MFA | `standard/07-AUTENTICACAO.md` |
| Papéis, permissões, tenant, IDOR | `standard/08-AUTORIZACAO.md` |
| Injeção, segredos, LGPD, upload | `standard/09-SEGURANCA.md` |
| Logs, auditoria, erros, alertas | `standard/10-OBSERVABILIDADE.md` |
| Confirmações, feedback, mensagens | `standard/11-UX.md` |
| Teclado, foco, contraste, ARIA | `standard/12-ACESSIBILIDADE.md` |
| SLOs, N+1, cache, bundle | `standard/13-PERFORMANCE.md` |
| Pirâmide, cobertura, flakiness | `standard/14-TESTES.md` |
| Pipeline, deploy, rollback, git | `standard/15-DEVOPS.md` |
| Backup, DR, TLS, acessos | `standard/16-INFRAESTRUTURA.md` |
| `.ai/`, ADR, README | `standard/17-DOCUMENTACAO.md` |

Catálogo completo de requisitos: `requirements/CATALOGO.md`

## Passo 6 — Auditar

Rode `/eos-dod` antes de declarar pronto. Reporte com ✅ / ⚠️ / ❌ e liste as
pendências. Nunca "pronto" com item obrigatório aberto.

## Passo 7 — Registrar

Na mesma entrega:

| Aconteceu | Atualize |
| --- | --- |
| Componente reutilizável | `.ai/DESIGN-SYSTEM.md` + `.ai/COMPONENTS.md` |
| Padrão de UX novo | `.ai/UX-PATTERNS.md` |
| Decisão estrutural ou exceção | `.ai/DECISIONS/ADR-NNN.md` |
| Entidade criada/alterada | `.ai/DATABASE.md` |
| Contrato de API | `.ai/API-CONVENTIONS.md` |
| Regra de negócio descoberta | `.ai/BUSINESS-RULES.md` |

Critério: **se a próxima sessão precisaria saber para não fazer diferente,
escreva.**

Decisão que deveria valer para todos os projetos → diga que é candidata a subir
para o EOS. Não promova sozinho.

## Antipadrões

`UserService2` · `catch {}` vazio · inventar regra de negócio · assumir schema
sem ler · refatorar meio sistema num bugfix · teste que sempre passa ·
`@ts-ignore` sem motivo · sumir com a pendência no relatório final.
