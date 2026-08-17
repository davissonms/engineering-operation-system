# 08 — Autorização

Prefixo de requisitos: `AUTZ`
Base normativa: **OWASP Top 10:2025 — A01 Broken Access Control**

---

## A regra em letras grandes

> **Autenticação ≠ Autorização.**
> Estar logado não significa poder fazer.

E a segunda, igualmente importante:

> **Esconder o botão no frontend não é controle de acesso.**

O frontend esconde o botão para não frustrar o usuário. O **backend** decide se a
operação acontece. Sempre. Um `curl` com um token válido é o teste real.

## As três perguntas

Toda operação responde às três, na ordem:

```
1. Quem é?              autenticação      → 401 se falhar
2. O papel pode?        permissão         → 403 se falhar
3. Sobre ESTE registro? ownership/tenant  → 404 se falhar
```

A terceira é a que quase sempre falta — e é exatamente o IDOR
(Insecure Direct Object Reference), a vulnerabilidade nº 1 do OWASP.

```
Usuário A (operador, agência X)
        ↓
GET /v1/quotes/123      ← cotação da agência Y
        ↓
Papel "operador" pode ler cotações?   SIM
        ↓
A cotação 123 pertence à agência X?   NÃO
        ↓
                404 Not Found
```

`404`, não `403`. `403` confirma que a cotação 123 existe.

## Modelo de papéis

```
ADMIN
├── usuários
├── financeiro
├── configurações
├── relatórios
└── auditoria

OPERADOR
├── cotações
├── emissões
└── clientes

CLIENTE
├── minhas cotações
├── meus pedidos
└── meu perfil
```

- Papéis definidos no servidor, nunca inferidos do token sem validação.
- Permissão é `recurso:ação` — `quotes:read`, `quotes:approve`, `users:delete`.
- Papel é um conjunto de permissões. O código verifica **permissão**, não papel.
  `if (user.role === 'admin')` espalhado pelo código é dívida garantida.
- **Deny by default**: rota sem regra explícita de autorização é negada, não
  liberada. Isso é verificado por teste automatizado.
- Escalada de privilégio é impossível por payload: `role`, `tenant_id`,
  `is_admin` e `permissions` nunca são aceitos do corpo da requisição.

## Multi-tenant

Em sistema multi-tenant, o `tenant_id` vem **do token de sessão**, nunca do
cliente. E o filtro é aplicado em **uma camada única** (middleware de repositório
ou row-level security), não endpoint a endpoint — porque endpoint a endpoint
alguém vai esquecer.

```
❌  findMany({ where: { tenantId: req.body.tenantId } })
❌  findMany({ where: { id } })                         sem tenant
✅  findMany({ where: { id, tenantId: ctx.tenantId } })  ctx vem da sessão
✅  repositório com filtro de tenant global aplicado automaticamente
```

## Autorização em massa

Operações em lote verificam **cada item**, não o primeiro. Exportação, impressão,
relatório e endpoints de busca são as portas dos fundos mais comuns — um filtro
de relatório sem escopo de tenant vaza a base inteira.

## Frontend

O frontend replica as permissões apenas para experiência:

- esconder ação que o usuário não pode executar
- desabilitar em vez de esconder quando a ausência confundir
- exibir tela de "sem permissão" em vez de erro cru

E nunca guarda a decisão: a permissão vem da sessão retornada pelo servidor.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| AUTZ-001 | Toda rota protegida verifica autenticação no servidor | BASE | Teste com token ausente retorna 401 | Sim |
| AUTZ-002 | Deny by default — rota sem regra é negada | BASE | Teste automatizado varre rotas sem guard | Sim |
| AUTZ-003 | Verificação por permissão, não por papel espalhado | BASE | Sem `role === 'admin'` no código de negócio | Sim |
| AUTZ-004 | Ownership verificado em todo acesso a recurso | BASE | Teste de IDOR retorna 404 | Sim |
| AUTZ-005 | Recurso de outro escopo responde 404, não 403 | BASE | Verificado em teste | Sim |
| AUTZ-006 | `tenant_id` obtido da sessão, nunca do cliente | SAAS | Payload com tenant é ignorado/rejeitado | Sim |
| AUTZ-007 | Filtro de tenant aplicado em camada única | SAAS | Middleware/RLS, não por endpoint | Sim |
| AUTZ-008 | Escalada de privilégio impossível por payload | BASE | `role`/`permissions` rejeitados na entrada | Sim |
| AUTZ-009 | Operações em lote verificam cada item | BASE | Teste com item de outro escopo falha a operação | Sim |
| AUTZ-010 | Exportações e relatórios respeitam o escopo | BASE | Teste de escopo em relatório | Sim |
| AUTZ-011 | Matriz de papéis e permissões documentada | BASE | `.ai/BUSINESS-RULES.md` ou doc dedicado | Não |
| AUTZ-012 | Frontend replica permissões apenas como UX | BASE | Remoção da regra no cliente não libera a ação | Sim |
| AUTZ-013 | Permissões carregadas da sessão do servidor | BASE | Sem permissões hardcoded no cliente | Sim |
| AUTZ-014 | Tela de "sem permissão" tratada | BASE | 403 não exibe erro cru | Não |
| AUTZ-015 | Mudança de papel/permissão registrada em auditoria | SAAS | Evento no audit log | Sim |
| AUTZ-016 | Mudança de permissão reflete na sessão ativa | SAAS | Revalidação ou revogação de sessão | Não |
| AUTZ-017 | Testes automatizados de autorização por papel | BASE | Suíte cobre acesso permitido e negado | Sim |
| AUTZ-018 | Segregação de funções em operações críticas | FIN | Quem cria não aprova | Não |
| AUTZ-019 | Acesso administrativo restrito e registrado | FIN | Log de toda ação administrativa | Sim |
| AUTZ-020 | Endpoints internos/admin não expostos publicamente | BASE | Rede/rota restrita | Sim |
