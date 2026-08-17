# 01 — Arquitetura

Prefixo de requisitos: `ARC`

---

## Regra estrutural

Todo sistema é organizado por **módulo de domínio**, não por tipo de arquivo.
Um módulo contém tudo que a sua funcionalidade precisa; o que é compartilhado
por três ou mais módulos sobe para `shared/`.

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── permissions/
│   ├── customers/
│   └── quotes/
│       ├── quotes.controller.ts     entrada (HTTP)
│       ├── quotes.service.ts        regra de negócio
│       ├── quotes.repository.ts     acesso a dados
│       ├── dto/                     contratos de entrada/saída
│       ├── entities/                modelo de domínio
│       └── quotes.spec.ts
│
├── shared/
│   ├── database/
│   ├── errors/
│   ├── logger/
│   ├── validators/
│   ├── auth/          guards, decorators
│   └── utils/
│
├── config/            leitura e validação de env
└── infrastructure/    e-mail, storage, filas, integrações externas
```

O objetivo não é obrigar esta árvore exata em todo projeto. É garantir que
**qualquer pessoa que entre no projeto saiba onde cada coisa deve estar** — e
que a IA não invente uma segunda organização no meio do caminho.

## Direção das dependências

```
controller  →  service  →  repository  →  banco
     ↓            ↓
    dto        entities
```

- Regra de negócio **nunca** conhece HTTP (`req`, `res`, status code).
- Repositório **nunca** contém regra de negócio.
- Controller **nunca** acessa banco diretamente.
- Módulo **nunca** importa arquivo interno de outro módulo — só sua interface pública.
- `shared/` **nunca** importa de `modules/`.

Se uma dessas setas se inverte, o sistema começa a virar bola de barro. É motivo
de recusa em code review, não de "depois a gente arruma".

## Frontend (Next.js App Router)

```
src/
├── app/                    rotas
│   ├── (auth)/             login, cadastro, recuperação
│   ├── (dashboard)/        área autenticada
│   └── api/                somente BFF/webhooks
├── components/
│   ├── ui/                 design system — primitivos
│   ├── layout/             shell, sidebar, header
│   └── <domínio>/          componentes de domínio
├── features/               lógica por domínio (hooks, serviços, tipos)
├── lib/                    cliente HTTP, formatadores, helpers
├── hooks/
└── types/
```

- `components/ui/` é o design system. Só é alterado com intenção deliberada.
- Componente de domínio nunca vira primitivo sem passar pelo design system.
- Chamada de API só sai de `features/` ou `lib/`, nunca de dentro de um JSX.

## Fronteiras de módulo

Um módulo se comunica com outro por:

1. chamada explícita ao service público do outro módulo, ou
2. evento de domínio.

Nunca por acesso direto à tabela do outro módulo. Se `quotes` precisa do nome do
cliente, ele pede a `customers` — não faz `SELECT` em `customers`.

## Quando dividir em serviços separados

Não divida por padrão. Monolito modular bem organizado é a escolha default e
suporta a maior parte dos sistemas de porte pequeno e médio. Só separe quando
houver motivo real (escala independente, isolamento de falha, time separado,
ciclo de deploy diferente) — e com ADR.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| ARC-001 | Código organizado por módulo de domínio | BASE | Existe `modules/` (ou equivalente) com pastas por domínio | Não |
| ARC-002 | Regra de negócio isolada da camada HTTP | BASE | Nenhum service importa tipos de request/response HTTP | Sim |
| ARC-003 | Acesso a dados isolado em repositório/ORM | BASE | Nenhum controller executa query | Sim |
| ARC-004 | Módulo não importa interno de outro módulo | BASE | Lint de fronteira configurado e passando | Sim |
| ARC-005 | `shared/` não depende de `modules/` | BASE | Verificado por lint de import | Sim |
| ARC-006 | Design system isolado em `components/ui/` | BASE | Diretório existe e é a origem dos primitivos | Não |
| ARC-007 | Configuração lida e validada em um único ponto | BASE | Módulo de config valida env no boot e falha rápido | Sim |
| ARC-008 | Integrações externas isoladas em `infrastructure/` | BASE | Nenhum service chama SDK externo diretamente | Não |
| ARC-009 | Divisão em múltiplos serviços exige ADR | BASE | ADR existente quando há mais de um deployable | Não |
| ARC-010 | Estrutura documentada em `.ai/ARCHITECTURE.md` | BASE | Arquivo existe e reflete a árvore real | Não |
| ARC-011 | Comunicação entre módulos por service público ou evento | BASE | Nenhuma query cruzando fronteira de domínio | Não |
| ARC-012 | Multi-tenant isolado em camada única | SAAS | Filtro de tenant aplicado no repositório, não caso a caso | Sim |
