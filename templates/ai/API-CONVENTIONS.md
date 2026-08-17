# API Conventions

Base: `standard/04-API.md` do EOS. Aqui ficam apenas as particularidades
deste projeto.

## Base URL e versão

```
produção: https://____/v1
staging:  https://____/v1
```

## Convenção de nomes de campo

- [ ] `snake_case`
- [ ] `camelCase`

## Envelope

Sucesso (coleção):
```json
{ "data": [], "meta": { "page": 1, "per_page": 20, "total": 0, "total_pages": 0 } }
```

Sucesso (item):
```json
{ "data": {} }
```

Erro:
```json
{ "error": { "code": "", "message": "", "request_id": "" } }
```

## Catálogo de códigos de erro

| `code` | Status | Mensagem ao usuário | Onde ocorre |
| --- | --- | --- | --- |
| `VALIDATION_ERROR` | 422 | "Verifique os campos destacados." | qualquer |
| `UNAUTHENTICATED` | 401 | "Sua sessão expirou. Entre novamente." | qualquer |
| `FORBIDDEN` | 403 | "Você não tem permissão para esta ação." | qualquer |
| `NOT_FOUND` | 404 | "Registro não encontrado." | qualquer |
| `RATE_LIMITED` | 429 | "Muitas tentativas. Aguarde um momento." | qualquer |
| `INTERNAL_ERROR` | 500 | "Não foi possível concluir a operação." | qualquer |

Códigos específicos de domínio:

| `code` | Status | Mensagem | Módulo |
| --- | --- | --- | --- |
| | | | |

## Paginação, filtro e ordenação

```
?page=1&per_page=20&sort=-created_at&search=&<filtro>=
```

`per_page` máximo: **100**

## Autenticação

| Cliente | Mecanismo |
| --- | --- |
| Navegador | cookie httpOnly + refresh rotativo |
| Integração | `Authorization: Bearer <token>` |

## Rate limits

| Escopo | Limite |
| --- | --- |
| Global por IP | |
| Login | |
| Recuperação de senha | |

## Idempotência

Endpoints que exigem `Idempotency-Key`:

| Endpoint | Janela |
| --- | --- |
| | |

## Webhooks

| Evento | Payload | Assinatura |
| --- | --- | --- |
| | | HMAC-SHA256 |
