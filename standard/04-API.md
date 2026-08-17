# 04 — API

Prefixo de requisitos: `API`

Estilo: **REST + JSON**, documentado em **OpenAPI 3.1**.

---

## URL e versionamento

```
https://api.exemplo.com.br/v1/customers
https://api.exemplo.com.br/v1/customers/{id}
https://api.exemplo.com.br/v1/customers/{id}/quotes
```

- Recurso no plural, `kebab-case`. Nunca verbo na URL (`/createCustomer` ✗).
- Versão no caminho: `/v1`. Quebra de contrato exige nova versão.
- Ação que não é CRUD vira subrecurso explícito:
  `POST /v1/quotes/{id}/approve`.
- Aninhamento máximo de dois níveis. Além disso, use filtro.

## Métodos e status

| Método | Uso | Sucesso |
| --- | --- | --- |
| `GET` | Ler. Nunca altera estado | 200 |
| `POST` | Criar / executar ação | 201 (criou) · 200 (ação) · 202 (assíncrono) |
| `PATCH` | Atualização parcial | 200 |
| `PUT` | Substituição completa | 200 |
| `DELETE` | Excluir | 204 |

| Status | Significado |
| --- | --- |
| 400 | Requisição malformada |
| 401 | Não autenticado |
| 403 | Autenticado, sem permissão |
| 404 | Não existe — **ou existe e não é seu** |
| 409 | Conflito de estado |
| 422 | Validação de negócio falhou |
| 429 | Limite de requisições excedido |
| 500 | Erro interno |
| 503 | Indisponível / dependência fora |

`404` para recurso de outro tenant é intencional: `403` confirma a existência.

## Contrato de resposta

Coleção:

```json
{
  "data": [
    { "id": "01J...", "name": "João Almeida", "status": "ACTIVE" }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

Recurso único:

```json
{ "data": { "id": "01J...", "name": "João Almeida" } }
```

Erro:

```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Cliente não encontrado.",
    "request_id": "req_01J8XK2M9P"
  }
}
```

Erro de validação:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Verifique os campos destacados.",
    "request_id": "req_01J8XK2M9P",
    "details": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "E-mail inválido." },
      { "field": "cpf",   "code": "REQUIRED",       "message": "Informe o CPF." }
    ]
  }
}
```

Regras do contrato:

- `code` é estável e em `UPPER_SNAKE`. O frontend decide pelo `code`, nunca pela
  `message`.
- `message` é para o usuário final, em português.
- `details` só existe em erro de validação, sempre por campo.
- Campos em `snake_case` **ou** `camelCase` — escolha um por projeto e registre.
- Datas em ISO 8601 com timezone: `2026-08-17T13:42:00Z`.
- Dinheiro como string decimal ou inteiro em centavos, com a moeda explícita.
  Nunca float.
- Nunca retorne `password_hash`, token, campo interno ou coluna de outro tenant.

## Listagem — parâmetros padronizados

```
GET /v1/customers
  ?page=1
  &per_page=20
  &sort=-created_at          - para descendente
  &search=joão
  &status=ACTIVE
  &created_from=2026-01-01
  &created_to=2026-08-17
```

- `per_page` tem teto (padrão 20, máximo 100). Cliente não define carga do banco.
- Filtro por campo desconhecido é erro 400, não silêncio.
- Listagens grandes usam cursor (`?cursor=...`) em vez de offset.

## Autenticação e segurança de transporte

- Sempre HTTPS. HTTP redireciona ou recusa.
- `Authorization: Bearer <token>` para API; cookie `httpOnly` + `Secure` +
  `SameSite` para sessão de navegador.
- CORS com origem explícita. `*` é proibido em API autenticada.
- Rate limit por IP e por usuário, com `429` + `Retry-After`.

## Idempotência

`POST` que cria recurso com efeito externo (pagamento, emissão, envio) aceita
`Idempotency-Key`. Mesma chave dentro da janela retorna o **resultado original**,
não um novo recurso nem um erro.

## Documentação

- OpenAPI 3.1 gerado a partir do código (decorators/schema), não escrito à mão —
  documentação manual desatualiza em duas semanas.
- Todo endpoint documenta: parâmetros, corpo, respostas de sucesso, respostas de
  erro possíveis, permissão exigida.
- Spec versionada no repositório para permitir diff de contrato no PR.

## Depreciação

```
Anunciar → header Deprecation + Sunset → período mínimo de 90 dias → remover
```

Nunca remover ou mudar semântica de campo em versão vigente.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| API-001 | Versionamento no caminho (`/v1`) | BASE | Todas as rotas versionadas | Sim |
| API-002 | Recursos no plural, sem verbo na URL | BASE | Verificado em review/spec | Parcial |
| API-003 | Métodos HTTP com semântica correta | BASE | `GET` não altera estado | Sim |
| API-004 | Status codes conforme tabela do padrão | BASE | Testes de integração cobrem os casos | Sim |
| API-005 | Envelope de sucesso padronizado (`data`/`meta`) | BASE | Todas as respostas seguem o formato | Sim |
| API-006 | Envelope de erro padronizado com `code` e `request_id` | BASE | Todas as respostas de erro seguem o formato | Sim |
| API-007 | Erro de validação detalhado por campo | BASE | `details[]` com `field` e `code` | Sim |
| API-008 | Catálogo de códigos de erro documentado | BASE | `.ai/API-CONVENTIONS.md` lista os códigos | Não |
| API-009 | Paginação obrigatória em toda listagem | BASE | Nenhum endpoint retorna coleção ilimitada | Sim |
| API-010 | `per_page` com teto imposto pelo servidor | BASE | Valor acima do máximo é limitado ou rejeitado | Sim |
| API-011 | Filtro, busca e ordenação padronizados | BASE | Mesma sintaxe em todos os recursos | Parcial |
| API-012 | Parâmetro desconhecido rejeitado | BASE | Retorna 400 | Sim |
| API-013 | HTTPS obrigatório | BASE | HTTP não serve conteúdo autenticado | Sim |
| API-014 | CORS com origens explícitas | BASE | Sem `*` em rota autenticada | Sim |
| API-015 | Rate limit com `429` e `Retry-After` | BASE | Configurado por IP e por usuário | Sim |
| API-016 | Datas em ISO 8601 com timezone | BASE | Sem formato local na API | Sim |
| API-017 | Valores monetários sem float, com moeda explícita | BASE | Verificado no contrato | Sim |
| API-018 | Nenhum campo sensível ou interno na resposta | BASE | Serialização por DTO explícito, não pelo model | Sim |
| API-019 | OpenAPI 3.1 gerado do código e versionado | BASE | Spec atualizada no repositório | Sim |
| API-020 | Permissão exigida documentada por endpoint | SAAS | Consta na spec | Não |
| API-021 | `Idempotency-Key` em operação com efeito externo | FIN | Reuso retorna o resultado original | Sim |
| API-022 | Depreciação anunciada com header e prazo mínimo | REC | `Deprecation`/`Sunset` presentes | Sim |
| API-023 | Webhooks emitidos com assinatura e retry | SAAS | HMAC + política de reentrega documentada | Sim |
| API-024 | Mudança de contrato detectada no PR | REC | Diff de OpenAPI no CI | Sim |
