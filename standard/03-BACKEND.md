# 03 — Backend

Prefixo de requisitos: `BE`

Default: **NestJS + TypeScript**. Node LTS. TypeScript em modo `strict`.

---

## Anatomia de um caso de uso

Todo endpoint segue a mesma sequência. Se um passo não se aplica, é decisão
consciente — não esquecimento.

```
1. Autenticar          quem é?
2. Autorizar           pode executar esta ação?
3. Validar entrada     schema, tipos, limites
4. Carregar recurso    existe? pertence a este usuário/tenant?
5. Autorizar recurso   pode executar sobre ESTE registro?
6. Regra de negócio    invariantes do domínio
7. Persistir           em transação quando toca mais de uma tabela
8. Auditar             quem, o quê, antes → depois
9. Efeitos colaterais  e-mail, fila, webhook — fora da transação
10. Responder          contrato padronizado
```

Os passos 2 e 5 são diferentes e ambos obrigatórios. "É admin" não responde
"pode ver a cotação #123 de outra agência".

## Validação de entrada

- Validação por **schema declarativo** (Zod, class-validator), na borda.
- Whitelist: campo não declarado é rejeitado ou removido, nunca repassado.
- Tipos coeridos explicitamente. `"12"` não vira `12` por acidente.
- Limites explícitos: tamanho de string, faixa numérica, tamanho de array,
  tamanho de payload, tipo e tamanho de arquivo.
- Validação de entrada é **sempre** no servidor, mesmo que o frontend já valide.

## Erros

Existe uma hierarquia de erros de domínio, e ela não conhece HTTP:

```
AppError (base)
├── ValidationError      → 422
├── UnauthorizedError    → 401
├── ForbiddenError       → 403
├── NotFoundError        → 404
├── ConflictError        → 409
├── RateLimitError       → 429
└── ExternalServiceError → 502/503
```

Um único filtro global converte erro de domínio em resposta HTTP. Regras:

- Nenhum `catch` silencioso. Se capturou, ou trata, ou registra e propaga.
- Erro inesperado vira 500 genérico para o usuário e log completo internamente.
- Toda resposta de erro carrega um `request_id` correlacionável com o log.
- Mensagem para o usuário em português, sem jargão e sem detalhe interno.

## Serviços e regras de negócio

- Service é testável sem HTTP e sem banco real (dependências injetadas).
- Invariante do domínio mora no domínio, não no controller nem no frontend.
- Função com mais de um motivo para mudar deve ser dividida.
- Sem lógica de negócio dentro de query SQL crua, exceto por performance
  justificada e comentada.

## Operações assíncronas

- Trabalho lento (e-mail, PDF, integração externa, importação) sai da requisição
  e vai para fila (BullMQ/Redis).
- Todo job tem: retry com backoff, limite de tentativas, dead-letter e log.
- Job precisa ser **idempotente** — ele vai rodar duas vezes algum dia.
- Nada de `setTimeout` como agendador de produção.

## Integrações externas

- Todo cliente HTTP externo tem timeout explícito. Sem exceção.
- Retry com backoff exponencial apenas em erro transitório e método idempotente.
- Falha de terceiro não derruba a requisição inteira quando há degradação
  possível — mas nunca é engolida em silêncio.
- Chave e segredo vêm de variável de ambiente, nunca do código.
- Webhook recebido é verificado por assinatura e protegido contra replay.

## Configuração

- Toda configuração vem de variável de ambiente, validada no boot por schema.
- App com config inválida **não sobe** — falha alto e cedo, com mensagem clara.
- `.env.example` sempre atualizado, com todas as chaves e sem valores reais.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| BE-001 | TypeScript em modo strict | BASE | `strict: true`, build sem erro | Sim |
| BE-002 | Toda entrada validada por schema no servidor | BASE | Nenhum handler lê body sem validação | Sim |
| BE-003 | Whitelist de campos na entrada | BASE | Campo não declarado é rejeitado/removido | Sim |
| BE-004 | Limites explícitos de tamanho e faixa | BASE | Strings, arrays, payload e upload com limite | Parcial |
| BE-005 | Hierarquia de erros de domínio independente de HTTP | BASE | Classes de erro sem dependência de framework web | Sim |
| BE-006 | Filtro global converte erro em resposta padronizada | BASE | Toda rota responde no contrato de erro | Sim |
| BE-007 | Nenhum `catch` vazio ou silencioso | BASE | Verificado por lint e review | Sim |
| BE-008 | Erro interno nunca vaza detalhe técnico ao usuário | BASE | Sem stack trace, SQL ou caminho de arquivo na resposta | Sim |
| BE-009 | Toda resposta de erro tem `request_id` correlacionável | BASE | ID presente na resposta e no log | Sim |
| BE-010 | Regra de negócio isolada em service testável | BASE | Teste unitário de service sem HTTP/banco real | Sim |
| BE-011 | Trabalho lento executado em fila | BASE | Nenhuma requisição HTTP síncrona acima do SLO por I/O externo | Não |
| BE-012 | Job com retry, limite, dead-letter e log | BASE | Configuração presente na fila | Sim |
| BE-013 | Job idempotente | BASE | Reexecução não duplica efeito | Não |
| BE-014 | Timeout explícito em toda chamada externa | BASE | Nenhum cliente HTTP com timeout infinito | Sim |
| BE-015 | Configuração via env validada no boot | BASE | App falha ao subir com env inválida | Sim |
| BE-016 | `.env.example` completo e sem segredos | BASE | Todas as chaves presentes, valores neutros | Sim |
| BE-017 | Nenhum segredo no código ou no repositório | BASE | Scan de segredos limpo | Sim |
| BE-018 | Graceful shutdown implementado | BASE | SIGTERM finaliza requisições e jobs em andamento | Sim |
| BE-019 | Healthcheck `/health` e readiness `/ready` | BASE | Endpoints respondem estado real de dependências | Sim |
| BE-020 | Webhook de terceiro validado por assinatura | SAAS | Assinatura verificada e replay bloqueado | Sim |
| BE-021 | Retry apenas em operação idempotente | BASE | Sem retry cego em POST não idempotente | Não |
| BE-022 | Operações financeiras com idempotency key | FIN | Chave obrigatória e reuso retorna resultado original | Sim |
| BE-023 | Uploads validados por tipo real, tamanho e destino isolado | BASE | Sem execução, sem path traversal, fora do webroot | Sim |
| BE-024 | Nenhum `any`/`ts-ignore` sem justificativa comentada | BASE | Ocorrências revisadas em code review | Parcial |
