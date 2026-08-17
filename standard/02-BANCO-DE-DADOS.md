# 02 — Banco de Dados

Prefixo de requisitos: `DB`

Default: **PostgreSQL + Prisma**. Outro banco exige ADR.

---

## Toda tabela tem esqueleto mínimo

```
id              identificador único (UUID v7 ou bigint identity)
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL
deleted_at      timestamptz NULL        quando há exclusão lógica
```

E em sistemas multi-tenant, sempre:

```
tenant_id / agency_id    NOT NULL + FK + índice + participação em todo índice único
```

Exemplo correto:

```
users
  id                uuid          PK
  tenant_id         uuid          FK → tenants(id), NOT NULL
  name              text          NOT NULL
  email             citext        NOT NULL
  password_hash     text          NOT NULL
  email_verified_at timestamptz   NULL
  status            text          NOT NULL DEFAULT 'active'
  created_at        timestamptz   NOT NULL DEFAULT now()
  updated_at        timestamptz   NOT NULL
  deleted_at        timestamptz   NULL

  UNIQUE (tenant_id, email) WHERE deleted_at IS NULL
```

Errado — e é o que acontece quando não há padrão:

```
users
  id, nome, email, senha
```

Sem timestamp, sem tenant, sem constraint, sem estratégia de exclusão, com o
campo chamado `senha` guardando... provavelmente a senha.

## Convenções

| Item | Convenção |
| --- | --- |
| Tabela | `snake_case`, plural — `quote_items` |
| Coluna | `snake_case` — `email_verified_at` |
| Chave estrangeira | `<entidade_singular>_id` — `customer_id` |
| Índice | `idx_<tabela>_<colunas>` |
| Constraint única | `uq_<tabela>_<colunas>` |
| Enum | valor em `UPPER_SNAKE` ou `lower_snake`, consistente no projeto |
| Booleano | prefixo `is_` / `has_` — `is_active` |
| Dinheiro | `numeric(15,2)` ou inteiro em centavos. **Nunca** `float`/`double` |
| Data/hora | `timestamptz`, sempre UTC no banco |

## Integridade não é opcional

- Toda relação tem **foreign key real**, com `ON DELETE` explícito (`RESTRICT`
  por padrão; `CASCADE` só quando o filho não existe sem o pai).
- Regra que pode ser constraint **deve** ser constraint (`NOT NULL`, `UNIQUE`,
  `CHECK`). Validar só na aplicação deixa o banco aceitar lixo por outra porta.
- Operação que altera mais de uma tabela roda em **transação**.
- Índice em toda FK e em toda coluna usada em filtro, ordenação ou join frequente.

## Migrations

- Toda mudança de schema é uma migration versionada e commitada. **Nunca** altere
  banco por painel, cliente gráfico ou SQL avulso em produção.
- Migration é revisada como código.
- Migration destrutiva (drop de coluna/tabela, mudança de tipo com perda) exige:
  backup verificado + plano de reversão + janela combinada.
- Renomear coluna em produção usa expand/contract: adiciona nova → escreve nas
  duas → migra dados → passa a ler a nova → remove a antiga. Nunca em um passo.
- Migration de schema e migration de dados são arquivos separados.

## Exclusão

Escolha por entidade e documente:

| Estratégia | Quando |
| --- | --- |
| Hard delete | Dado sem valor histórico e sem referência (ex: rascunho) |
| Soft delete (`deleted_at`) | Dado referenciado por outros, ou com valor de auditoria |
| Arquivamento | Volume alto com necessidade de consulta rara |

Com soft delete: **toda** consulta padrão filtra `deleted_at IS NULL`, e o índice
único precisa ser parcial (senão o e-mail excluído bloqueia o recadastro).

## Performance

- Sem `SELECT *` em código de aplicação.
- Sem N+1: use join, `include` ou dataloader. Listagem que faz uma query por
  linha é bug de performance, não detalhe.
- Toda listagem é paginada no banco (`LIMIT`/`OFFSET` ou cursor). Sem exceção.
- Query nova em tabela grande passa por `EXPLAIN ANALYZE` antes de ir a produção.

## Dados sensíveis

- Senha: só hash (Argon2id ou bcrypt cost ≥ 12). Nunca reversível.
- Documento, cartão, token de terceiro: criptografado em repouso.
- Nunca logar valor de coluna sensível — nem em log de query.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| DB-001 | Toda mudança de schema via migration versionada | BASE | Migrations no repositório; schema reproduzível do zero | Sim |
| DB-002 | Toda tabela tem PK única e estável | BASE | Sem tabela sem PK | Sim |
| DB-003 | Toda tabela tem `created_at` e `updated_at` | BASE | Verificado por inspeção de schema | Sim |
| DB-004 | Toda relação tem FK real com `ON DELETE` explícito | BASE | Sem FK implícita apenas na aplicação | Sim |
| DB-005 | Índice em toda FK e em colunas de filtro frequente | BASE | Índices presentes; listagens sem seq scan em tabela grande | Parcial |
| DB-006 | Senha armazenada apenas como hash forte | BASE | Argon2id ou bcrypt cost ≥ 12 | Sim |
| DB-007 | Valores monetários sem ponto flutuante | BASE | `numeric` ou inteiro em centavos | Sim |
| DB-008 | Datas em `timestamptz` armazenadas em UTC | BASE | Sem coluna de data sem timezone | Sim |
| DB-009 | Operação multi-tabela em transação | BASE | Services relevantes usam transação | Não |
| DB-010 | Estratégia de exclusão definida por entidade | BASE | Documentado em `.ai/DATABASE.md` | Não |
| DB-011 | Soft delete filtrado por padrão em toda consulta | BASE | Middleware/escopo global, não filtro manual | Sim |
| DB-012 | Índice único compatível com soft delete | BASE | Índice parcial `WHERE deleted_at IS NULL` | Sim |
| DB-013 | Toda listagem paginada no banco | BASE | Nenhum endpoint retorna coleção sem limite | Sim |
| DB-014 | Sem `SELECT *` em código de aplicação | BASE | Verificado por lint/review | Parcial |
| DB-015 | Sem consultas N+1 em listagens | BASE | Contagem de queries verificada em teste de integração | Parcial |
| DB-016 | Migration destrutiva com backup e plano de reversão | BASE | Registrado no PR | Não |
| DB-017 | Nenhuma alteração manual de schema em produção | BASE | Schema de produção igual ao gerado pelas migrations | Sim |
| DB-018 | Convenção de nomes única no projeto | BASE | `snake_case`, plural, FK `<entidade>_id` | Parcial |
| DB-019 | Seed de desenvolvimento reproduzível | REC | Comando único popula ambiente de dev | Sim |
| DB-020 | `tenant_id` obrigatório e indexado em tabelas de tenant | SAAS | NOT NULL + FK + presente nos índices únicos | Sim |
| DB-021 | Isolamento de tenant garantido em camada única | SAAS | Filtro aplicado no repositório/middleware | Sim |
| DB-022 | Dados pessoais sensíveis criptografados em repouso | FIN | Documento/cartão/token cifrados | Não |
| DB-023 | Histórico imutável de transações financeiras | FIN | Registro financeiro nunca sofre update destrutivo | Não |
| DB-024 | Schema documentado em `.ai/DATABASE.md` | BASE | Entidades, relações e estratégias descritas | Não |
