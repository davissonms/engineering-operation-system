# 10 — Observabilidade: Logs, Auditoria e Erros

Prefixo de requisitos: `OBS`

Três coisas diferentes, frequentemente confundidas:

| | Para quê | Público | Retenção |
| --- | --- | --- | --- |
| **Log** | Diagnosticar o sistema | Engenharia | 30–90 dias |
| **Auditoria** | Provar quem fez o quê | Negócio, compliance, jurídico | 1–5 anos |
| **Métrica** | Saber se está saudável | Operação | 1 ano agregado |

Auditoria **não** é log com nível `info`. É um registro de negócio, em tabela,
imutável e consultável pela interface.

---

## Logs

Formato: **JSON estruturado**, uma linha por evento. Nunca `console.log` com
string concatenada.

```json
{
  "timestamp": "2026-08-17T13:42:07.412Z",
  "level": "error",
  "message": "Falha ao processar pagamento",
  "request_id": "req_01J8XK2M9P",
  "user_id": "usr_01J7...",
  "tenant_id": "agc_01J2...",
  "module": "payments",
  "operation": "charge",
  "duration_ms": 3187,
  "error": { "type": "ExternalServiceError", "code": "GATEWAY_TIMEOUT" }
}
```

Níveis:

| Nível | Quando |
| --- | --- |
| `error` | Falhou e alguém precisa olhar |
| `warn` | Anômalo mas tratado (retry, fallback, limite atingido) |
| `info` | Evento de negócio relevante (login, criação, integração) |
| `debug` | Diagnóstico — desligado em produção |

Regras:

- Todo log de requisição carrega `request_id`, propagado ponta a ponta e
  devolvido ao cliente na resposta de erro.
- **Nunca** logar: senha, token, cartão, CPF, chave de API, corpo completo de
  requisição com dado pessoal. O logger tem redação automática por chave.
- Log de erro carrega stack trace e contexto suficiente para reproduzir.
- Log não substitui métrica. Não conte coisas contando linhas de log.

## Auditoria

Toda operação que altera dado relevante de negócio gera registro:

```
audit_logs
  id
  tenant_id
  actor_id            quem fez (ou 'system' para automação)
  actor_type          user | system | integration
  action              CREATE | UPDATE | DELETE | APPROVE | EXPORT | LOGIN ...
  entity              'issuance'
  entity_id           '93821'
  changes             { "price": { "from": "2300.00", "to": "2650.00" } }
  reason              justificativa, quando exigida
  ip
  user_agent
  created_at
```

E o resultado é responder, na interface, sem abrir o banco:

```
Quem alterou o preço dessa emissão?

Davisson
  ↓ alterou a emissão #93821
  ↓ R$ 2.300,00 → R$ 2.650,00
  ↓ 17/08/2026 10:42
  ↓ IP 189.xxx.xxx.xxx
```

Regras:

- Auditoria é **append-only**. Sem update, sem delete.
- O que auditar: criação, alteração e exclusão de entidade de negócio, mudanças
  de permissão e papel, login/logout/falha de login, exportação de dados, acesso
  a dado sensível, aprovação e cancelamento, alteração de configuração.
- `changes` guarda antes e depois — só dos campos alterados, com dado sensível
  mascarado.
- Falha ao gravar auditoria de operação crítica **cancela a operação**. Se não
  dá para provar, não aconteceu.
- Auditoria é consultável na interface por quem tem permissão, com filtro por
  usuário, entidade, ação e período.

## Erros

```
Erro acontece
      ↓
Log estruturado com contexto + request_id
      ↓
Enviado ao rastreador (Sentry) se inesperado
      ↓
Usuário recebe mensagem em português, acionável, com o request_id
```

Ao usuário:

> Não foi possível concluir a operação. Tente novamente em alguns instantes.
> Se o problema persistir, informe o código `req_01J8XK2M9P`.

Internamente:

```
ERROR  payments.service.ts:143
       Database timeout after 3000ms
       request_id=req_01J8XK2M9P  user_id=usr_01J7...  transaction_id=trx_...
```

Nunca: stack trace na tela, mensagem em inglês do driver do banco, `[object Object]`,
ou o silêncio de um erro engolido.

## Métricas e alertas

Mínimo por serviço: taxa de requisições, taxa de erro (4xx/5xx), latência
(p50/p95/p99), saúde das dependências, tamanho e falhas de fila.

Alertas que valem a pena (o resto vira ruído e é ignorado):

- taxa de erro 5xx acima do limiar por N minutos
- latência p95 acima do SLO
- fila crescendo sem consumo
- job falhando repetidamente
- healthcheck falhando
- certificado expirando em menos de 14 dias
- espaço em disco / conexões de banco perto do limite

Todo alerta tem dono e runbook. Alerta sem ação definida é notificação decorativa.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| OBS-001 | Logs estruturados em JSON | BASE | Sem `console.log` em produção | Sim |
| OBS-002 | `request_id` propagado ponta a ponta | BASE | Presente em log e resposta de erro | Sim |
| OBS-003 | Níveis de log usados corretamente | BASE | `debug` desligado em produção | Sim |
| OBS-004 | Redação automática de dados sensíveis no logger | BASE | Senha/token/CPF nunca aparecem | Sim |
| OBS-005 | Erro logado com stack trace e contexto | BASE | Reproduzível a partir do log | Não |
| OBS-006 | Rastreador de erros configurado | BASE | Sentry (ou equivalente) recebendo eventos | Sim |
| OBS-007 | Mensagem de erro ao usuário em português e acionável | BASE | Sem detalhe técnico | Não |
| OBS-008 | `request_id` exibido ao usuário em erro inesperado | BASE | Código presente na tela | Não |
| OBS-009 | Tabela de auditoria append-only | SAAS | Sem update/delete permitidos | Sim |
| OBS-010 | Auditoria registra ator, ação, entidade, antes/depois, IP e data | SAAS | Campos presentes | Sim |
| OBS-011 | Operações de negócio relevantes auditadas | SAAS | Create/update/delete/aprovação cobertos | Não |
| OBS-012 | Mudanças de permissão auditadas | SAAS | Evento registrado | Sim |
| OBS-013 | Exportação de dados auditada | SAAS | Evento registrado | Sim |
| OBS-014 | Falha de auditoria cancela operação crítica | FIN | Transação revertida | Sim |
| OBS-015 | Auditoria consultável na interface com filtros | SAAS | Tela com filtro por usuário/entidade/período | Não |
| OBS-016 | Dado sensível mascarado no registro de auditoria | SAAS | Verificado | Sim |
| OBS-017 | Retenção de auditoria definida e cumprida | FIN | Política documentada | Não |
| OBS-018 | Métricas de requisição, erro e latência coletadas | BASE | Dashboard disponível | Sim |
| OBS-019 | Healthcheck monitorado externamente | BASE | Uptime check ativo | Sim |
| OBS-020 | Alertas configurados para erro, latência e fila | BASE | Notificação chega a um canal com dono | Sim |
| OBS-021 | Todo alerta tem dono e runbook | REC | Documentado | Não |
| OBS-022 | Logs centralizados e pesquisáveis | REC | Consulta por `request_id` funciona | Sim |
| OBS-023 | Retenção de logs definida | BASE | 30–90 dias configurados | Sim |
