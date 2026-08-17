# Database

## Entidades

### <tabela>

| Coluna | Tipo | Nulo | Notas |
| --- | --- | :-: | --- |
| id | uuid | ✗ | PK |
| tenant_id | uuid | ✗ | FK, indexado |
| created_at | timestamptz | ✗ | |
| updated_at | timestamptz | ✗ | |
| deleted_at | timestamptz | ✓ | soft delete |

Índices:
- `idx_<tabela>_<coluna>`
- `uq_<tabela>_<colunas>` (parcial: `WHERE deleted_at IS NULL`)

## Relações

```
<diagrama de relações>
```

## Estratégia de exclusão por entidade

| Entidade | Estratégia | Motivo |
| --- | --- | --- |
| | soft / hard / arquivamento | |

## Convenções

- Tabelas: `snake_case`, plural
- FK: `<entidade>_id`
- Dinheiro: `numeric(15,2)`
- Datas: `timestamptz` em UTC

## Migrations

Comandos em `.ai/TECH-STACK.md`.

| Migration destrutiva | Data | Backup verificado | Plano de reversão |
| --- | --- | --- | --- |
| | | | |

## Consultas críticas de performance

| Consulta | Índice usado | p95 alvo |
| --- | --- | --- |
| | | |
