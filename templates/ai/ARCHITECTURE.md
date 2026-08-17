# Architecture

> Como este projeto está organizado. Se o código divergir daqui, o código vence
> para fato e este documento é corrigido.

## Visão geral

```
<diagrama: frontend → API → serviços → banco / filas / integrações>
```

## Estrutura de diretórios

### Backend

```
src/
├── modules/
│   └── <domínio>/
│       ├── *.controller.ts
│       ├── *.service.ts
│       ├── *.repository.ts
│       ├── dto/
│       └── entities/
├── shared/
├── config/
└── infrastructure/
```

### Frontend

```
src/
├── app/
├── components/ui/        design system
├── components/<domínio>/
├── features/
├── lib/
├── hooks/
└── types/
```

## Módulos

| Módulo | Responsabilidade | Depende de |
| --- | --- | --- |
| auth | | |
| users | | |
| | | |

## Regras de dependência

- `controller → service → repository`
- Service não conhece HTTP
- Repository não contém regra de negócio
- Módulo só acessa a interface pública de outro módulo
- `shared/` não importa de `modules/`

## Fluxo de uma requisição

```
Requisição
  → autenticação
  → autorização (papel)
  → validação de entrada
  → carregamento do recurso
  → autorização (ownership/tenant)
  → regra de negócio
  → persistência (transação)
  → auditoria
  → efeitos assíncronos
  → resposta padronizada
```

## Fronteiras e integrações

| Integração | Onde vive | Timeout | Falha tolerável |
| --- | --- | --- | --- |
| | `infrastructure/` | | |

## Processamento assíncrono

| Job | Gatilho | Idempotente? | Retry |
| --- | --- | --- | --- |
| | | | |
