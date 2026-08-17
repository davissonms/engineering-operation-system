# 17 — Documentação e Contexto

Prefixo de requisitos: `DOC`

Documentação aqui tem uma função nova: além de servir a humanos, ela é **a
memória persistente que a IA consulta antes de escrever código**. Contexto que só
existe no histórico de uma conversa não existe.

---

## Os três níveis de contexto

```
NÍVEL 1 — GLOBAL          Engineering-Operating-System/
                          Vale para todos os projetos. Este repositório.

NÍVEL 2 — PROJETO         <projeto>/.ai/
                          Stack, arquitetura, regras de negócio, decisões.

NÍVEL 3 — FEATURE         <projeto>/.ai/FEATURES/
                          Contrato da funcionalidade em desenvolvimento.
```

## `.ai/` — o contexto do projeto

```
.ai/
├── PROJECT-CONTEXT.md     o que é, para quem, perfis EOS, versão do padrão, SLOs
├── TECH-STACK.md          tecnologias, versões, comandos de dev/test/build
├── ARCHITECTURE.md        camadas, módulos, fronteiras, fluxo de dados
├── DATABASE.md            entidades, relações, estratégias de exclusão
├── API-CONVENTIONS.md     contratos, códigos de erro, paginação, versionamento
├── DESIGN-SYSTEM.md       tokens, componentes, regras visuais
├── COMPONENTS.md          inventário de componentes com uso e props principais
├── UX-PATTERNS.md         padrões de interação, vocabulário, arquétipos de tela
├── BUSINESS-RULES.md      regras de domínio, papéis e permissões
├── SECURITY-RULES.md      particularidades de segurança deste sistema
├── DECISIONS/             ADR-001.md, ADR-002.md, ...
├── FEATURES/              contratos de funcionalidade
└── CHANGELOG-CONTEXT.md   histórico de mudanças de contexto relevantes
```

Regra de ouro: **se a próxima sessão (humana ou de IA) precisaria saber disso
para não fazer diferente, escreva.**

## ADR — Architecture Decision Record

Toda decisão estrutural vira registro numerado e imutável. Decisão revista não é
apagada — ganha status `Superseded` e aponta para a nova.

```
ADR-014

Título:       Padrão de tabelas administrativas
Status:       Accepted
Data:         2026-08-17

Contexto:
  Cada tela administrativa vinha implementando sua própria tabela, com
  ordenação, paginação e seleção reescritas de formas diferentes.

Decisão:
  Toda tabela administrativa usa o componente DataTable.

Consequências:
  + Consistência visual e de comportamento
  + Correções de acessibilidade se propagam a todas as telas
  − Casos muito atípicos precisarão estender o DataTable

Exceção:
  Somente com justificativa documentada em novo ADR.
```

O que merece ADR: escolha de tecnologia, mudança de arquitetura, padrão que passa
a ser obrigatório, exceção ao EOS, decisão de segurança relevante, escolha entre
alternativas com trade-off real.

O que **não** merece: nome de variável, escolha de biblioteca trivial e
substituível, detalhe de implementação local.

## README do projeto

Precisa responder, em ordem, para quem chega hoje:

1. O que é este sistema, em duas frases
2. Como rodar localmente (do zero, em menos de 15 minutos)
3. Como rodar os testes
4. Como fazer deploy
5. Onde está a documentação de contexto (`.ai/`)
6. Quem é o responsável

README que não permite rodar o projeto é enfeite.

## Manutenção

Documentação desatualizada é pior que ausente — ela mente com autoridade.

- Atualização de contexto é **parte da entrega**, não tarefa futura.
- PR que muda arquitetura, contrato ou componente sem atualizar `.ai/` é
  incompleto.
- Quando código e documento divergem: código vence para **fato**, documento vence
  para **intenção**. E a divergência é corrigida, não ignorada.
- Documente o **porquê**. O "o quê" está no código; o "por que assim" só está na
  cabeça de quem decidiu — até virar arquivo.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| DOC-001 | Diretório `.ai/` presente e populado | BASE | Arquivos principais existem | Sim |
| DOC-002 | `PROJECT-CONTEXT.md` com perfis e versão do EOS | BASE | Perfis declarados | Sim |
| DOC-003 | `TECH-STACK.md` com versões e comandos | BASE | Reflete o projeto real | Não |
| DOC-004 | `ARCHITECTURE.md` reflete a estrutura real | BASE | Árvore e camadas descritas | Não |
| DOC-005 | `DESIGN-SYSTEM.md` com tokens e componentes | BASE | Atualizado a cada componente novo | Não |
| DOC-006 | `COMPONENTS.md` como inventário consultável | BASE | Todos os componentes de `ui/` listados | Não |
| DOC-007 | `BUSINESS-RULES.md` com regras e permissões | BASE | Matriz de papéis presente | Não |
| DOC-008 | `API-CONVENTIONS.md` com contratos e códigos de erro | BASE | Catálogo completo | Não |
| DOC-009 | ADRs numerados para decisões estruturais | BASE | `DECISIONS/` com registros | Não |
| DOC-010 | ADR revisto marcado como `Superseded`, nunca apagado | BASE | Histórico preservado | Não |
| DOC-011 | Toda exceção ao EOS registrada em ADR | BASE | Rastreável | Não |
| DOC-012 | README permite rodar o projeto do zero | BASE | Novo dev sobe em < 15 min | Não |
| DOC-013 | README documenta testes e deploy | BASE | Comandos presentes | Não |
| DOC-014 | Contexto atualizado na mesma entrega que o código | BASE | Verificado em code review | Não |
| DOC-015 | OpenAPI publicada e atualizada | BASE | Gerada do código | Sim |
| DOC-016 | Variáveis de ambiente documentadas | BASE | `.env.example` completo | Sim |
| DOC-017 | Runbooks de operação para incidentes comuns | SAAS | Passos, dono e escalonamento | Não |
| DOC-018 | Feature Contract para funcionalidade relevante | BASE | `FEATURES/` com o contrato | Não |
| DOC-019 | Divergência entre doc e código corrigida ao ser notada | BASE | Sem doc sabidamente falso | Não |
| DOC-020 | Documentação em português | BASE | Padrão do time | Não |
| DOC-021 | Convenção repetida vira regra de hook | REC | `.ai/guard-rules.json` cobre o que se explica mais de uma vez | Sim |
