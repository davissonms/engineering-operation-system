# Tech Stack

> Fonte da verdade sobre tecnologias e comandos. A IA não deve adivinhar nada
> que esteja aqui.

## Frontend

| Item | Escolha | Versão |
| --- | --- | --- |
| Framework | Next.js (App Router) | |
| Linguagem | TypeScript (strict) | |
| Estilo | Tailwind CSS | |
| Componentes | shadcn/ui | |
| Estado de servidor | React Query | |
| Formulários | React Hook Form + Zod | |
| Ícones | lucide-react | |
| Testes | Vitest + Testing Library | |

## Backend

| Item | Escolha | Versão |
| --- | --- | --- |
| Runtime | Node.js LTS | |
| Framework | NestJS | |
| Linguagem | TypeScript (strict) | |
| Validação | Zod / class-validator | |
| ORM | Prisma | |
| Filas | BullMQ | |
| Testes | Jest + Supertest | |

## Dados e infra

| Item | Escolha |
| --- | --- |
| Banco | PostgreSQL |
| Cache | Redis |
| Arquivos | |
| E-mail | |
| Erros | Sentry |
| Container | Docker + docker compose |
| CI/CD | GitHub Actions |
| Hospedagem | |

## Comandos

```bash
# subir ambiente completo
docker compose up -d

# desenvolvimento
npm run dev

# testes
npm test
npm run test:e2e

# qualidade
npm run lint
npm run typecheck

# banco
npx prisma migrate dev
npx prisma migrate deploy
npm run seed

# build
npm run build
```

## Bibliotecas com uso restrito

| Biblioteca | Regra |
| --- | --- |
| | |

## Decisões de stack

Escolhas fora do caminho happy do EOS estão registradas em `.ai/DECISIONS/`.

| ADR | Decisão |
| --- | --- |
| | |
