# Feature Contract — <Nome da funcionalidade>

> Copie para `.ai/FEATURES/<slug>.md` antes de implementar.
> Este contrato existe para impedir a entrega "criei a tela" — sem endpoint,
> sem permissão, sem auditoria, sem estado vazio, sem validação, sem teste.

**Status:** Rascunho | Acordado | Em implementação | Entregue
**Data:** aaaa-mm-dd
**Responsável:**

---

## 1. Objetivo

Uma frase: quem precisa disso e para quê.

> Operadores precisam cadastrar fornecedores para vincular emissões ao
> fornecedor correto e apurar comissão por parceiro.

**Não faz parte deste escopo:** (liste explicitamente o que fica de fora)

## 2. Regras de negócio

| # | Regra | Origem |
| --- | --- | --- |
| 1 | CNPJ é único por agência | — |
| 2 | Fornecedor com emissões vinculadas não pode ser excluído | — |
| 3 | | |

Toda regra aqui foi **confirmada**, não inferida. Regra não confirmada vira
pergunta, não código.

## 3. Permissões

| Papel | Ver | Criar | Editar | Excluir |
| --- | :-: | :-: | :-: | :-: |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Operador | ✅ | ✅ | ✅ | ❌ |
| Cliente | ❌ | ❌ | ❌ | ❌ |

**Escopo do registro:** o usuário só acessa registros da própria agência.
Acesso a registro de outra agência retorna **404**.

## 4. Entidades

```
suppliers
  id            uuid
  tenant_id     uuid    FK, NOT NULL
  name          text    NOT NULL
  document      text    NOT NULL
  email         text
  status        text    NOT NULL DEFAULT 'ACTIVE'
  created_at / updated_at / deleted_at

  UNIQUE (tenant_id, document) WHERE deleted_at IS NULL
```

Exclusão: soft delete.

## 5. Endpoints

| Método | Rota | Permissão | Descrição |
| --- | --- | --- | --- |
| GET | `/v1/suppliers` | `suppliers:read` | Lista paginada com busca e filtro |
| GET | `/v1/suppliers/{id}` | `suppliers:read` | Detalhe |
| POST | `/v1/suppliers` | `suppliers:create` | Cria |
| PATCH | `/v1/suppliers/{id}` | `suppliers:update` | Atualiza |
| DELETE | `/v1/suppliers/{id}` | `suppliers:delete` | Exclui (soft) |

## 6. Validações

| Campo | Regra | Mensagem |
| --- | --- | --- |
| name | obrigatório, 3–120 caracteres | "Informe o nome do fornecedor." |
| document | obrigatório, CNPJ válido, único | "CNPJ inválido." / "Já existe fornecedor com este CNPJ." |
| email | opcional, formato válido | "E-mail inválido." |

## 7. Erros

| Situação | Status | `code` | Mensagem ao usuário |
| --- | --- | --- | --- |
| Não encontrado / fora do escopo | 404 | `SUPPLIER_NOT_FOUND` | "Fornecedor não encontrado." |
| CNPJ duplicado | 409 | `SUPPLIER_DOCUMENT_TAKEN` | "Já existe um fornecedor com este CNPJ." |
| Exclusão com vínculos | 409 | `SUPPLIER_HAS_ISSUANCES` | "Não é possível excluir: há emissões vinculadas." |
| Sem permissão | 403 | `FORBIDDEN` | "Você não tem permissão para esta ação." |

## 8. Telas e estados

| Tela | Arquétipo | Componentes |
| --- | --- | --- |
| Listagem | listagem | PageHeader, SearchInput, FilterBar, DataTable, Pagination, EmptyState |
| Detalhe | detalhe | PageHeader, Card, Tabs |
| Criar/Editar | formulário | Form, FormField, MaskedInput, Button |

Estados obrigatórios em cada tela com dados:

```
[ ] loading    skeleton
[ ] empty inicial   "Nenhum fornecedor cadastrado." + [Novo fornecedor]
[ ] empty de busca  "Nenhum resultado para «x»." + [Limpar filtros]
[ ] error      "Erro ao carregar fornecedores." + [Tentar novamente]
[ ] success    conteúdo + contagem
```

## 9. Fluxos

```
Criar fornecedor
  Listagem → [+ Novo fornecedor] → formulário
    → validar → POST → sucesso: toast + volta à listagem atualizada
    → erro de validação: erro por campo, dados preservados
    → erro de servidor: erro geral + request_id
```

## 10. Auditoria

| Ação | Registra |
| --- | --- |
| CREATE | ator, entidade, id, valores iniciais, IP |
| UPDATE | ator, campos alterados (antes → depois), IP |
| DELETE | ator, entidade, id, motivo (se exigido), IP |

## 11. Testes

```
[ ] Unit: validação de CNPJ
[ ] Unit: regra de bloqueio de exclusão com vínculos
[ ] Integração: CRUD completo (201, 200, 204)
[ ] Integração: 422 validação, 409 duplicado, 409 vínculo
[ ] Integração: 401 sem token, 403 sem permissão, 404 outro tenant
[ ] E2E: criar fornecedor e vê-lo na listagem
```

## 12. Critérios de aceite

```
[ ] Operador cria fornecedor e ele aparece na listagem
[ ] CNPJ duplicado na mesma agência é rejeitado com mensagem clara
[ ] Fornecedor de outra agência é inacessível (404)
[ ] Exclusão com emissões vinculadas é bloqueada com explicação
[ ] Alteração de preço/dados aparece na auditoria com antes e depois
[ ] Todas as telas funcionam em 375px
[ ] Definition of Done concluída sem item obrigatório em aberto
```

## 13. Questões em aberto

| # | Pergunta | Responsável | Status |
| --- | --- | --- | --- |
| 1 | Fornecedor inativo pode receber nova emissão? | | Aberta |

Questão aberta que bloqueia implementação **para** a implementação daquela parte.
