# Engineering Operating System

Padrão de engenharia obrigatório em **todos** os projetos.
Fonte da verdade: `__EOS_HOME__/` (EOS v1.0.0)

Responda sempre em **português**.

---

## Antes de escrever código

1. **Leia `.ai/` do projeto** — `PROJECT-CONTEXT.md`, `TECH-STACK.md`,
   `ARCHITECTURE.md`, `DESIGN-SYSTEM.md`, `BUSINESS-RULES.md`, `DECISIONS/`.
   Não existe? Avise e ofereça `/eos-init`. Não invente convenções.
2. **Procure antes de criar.** Componente, endpoint, tabela, hook, utilitário ou
   padrão — busque o equivalente por *função*, não por nome. Diferença visual é
   **variante**, não componente novo.
3. **Nunca afirme o que não leu.** Antes de dizer que algo existe ou funciona de
   certo jeito, abra o arquivo. Memória de sessão não é fonte da verdade.

Para o protocolo completo, carregue a skill **`eos`**.

---

## Regras que valem em todo projeto

**Autorização** — Autenticação ≠ autorização. Toda operação verifica: quem é
(401), o papel pode (403), e **sobre este registro** (404 se for de outro
usuário/tenant). Esconder o botão no frontend não é controle de acesso.

**Estados de tela** — Toda tela com dados tem quatro: `loading`, `empty`,
`error`, `success`. Empty inicial é diferente de empty de busca.

**Erros** — Erro técnico nunca vaza para o usuário. Ele recebe mensagem em
português com `request_id`; o log recebe stack trace e contexto. Sem `catch`
vazio.

**Segurança** — Sem segredo no código. Senha só com Argon2id/bcrypt≥12. Query
sempre parametrizada. Validação sempre no servidor. HTTPS, rate limit e headers
de segurança sempre.

**Dados** — Toda mudança de schema por migration versionada. FK, índice e
constraint reais. Dinheiro nunca em float. Toda listagem paginada no banco.
Sem N+1.

**API** — Envelope `{data, meta}` / `{error: {code, message, request_id}}`.
Versionada em `/v1`. Nunca retorne hash de senha, token ou campo interno.

**Auditoria** — Operação que altera dado de negócio registra ator, ação,
entidade, antes → depois, IP e data. (SAAS/FIN)

**Contexto** — Criou componente, decidiu arquitetura, definiu padrão ou regra?
Atualize `.ai/` **na mesma entrega**. Decisão que só existe no chat não existe.

---

## Pare e pergunte quando

- o pedido contraria um requisito do padrão
- vai criar um segundo jeito de fazer algo que já existe
- vai alterar contrato de API já consumido
- vai apagar ou transformar dado existente
- falta regra de negócio para decidir corretamente

Formato: qual regra é contrariada, qual documento, e 2–3 opções.
**Nunca implemente contornando o padrão em silêncio.**

Não pare por nome de variável, formatação ou detalhe coberto pelo design system —
decida e diga o que decidiu.

---

## Antes de dizer "pronto"

Rode a Definition of Done (`standard/18-DEFINITION-OF-DONE.md`, skill `eos-dod`)
e **reporte honestamente**, com ✅ / ⚠️ / ❌. Nunca escreva "pronto" com item
obrigatório em aberto. Teste falhou? Mostre a saída.

Funcionar não é estar pronto.

---

## Comandos

| Comando | Uso |
| --- | --- |
| `/eos` | Protocolo completo de desenvolvimento com IA |
| `/eos-init` | Inicializa `.ai/` em um projeto novo ou existente |
| `/eos-dod` | Executa a Definition of Done |
| `/eos-check` | Audita um projeto contra os 397 requisitos |

## Mapa do padrão

```
standard/00-PRINCIPIOS        01-ARQUITETURA      02-BANCO-DE-DADOS
         03-BACKEND           04-API              05-FRONTEND
         06-DESIGN-SYSTEM     07-AUTENTICACAO     08-AUTORIZACAO
         09-SEGURANCA         10-OBSERVABILIDADE  11-UX
         12-ACESSIBILIDADE    13-PERFORMANCE      14-TESTES
         15-DEVOPS            16-INFRAESTRUTURA   17-DOCUMENTACAO
         18-DEFINITION-OF-DONE

protocol/AI-DEVELOPMENT-PROTOCOL · HIERARQUIA-DE-AUTORIDADE
         FEATURE-CONTRACT.template · ADR.template
requirements/CATALOGO.md      397 requisitos com ID e critério de aceite
```

Consulte o documento da área quando a decisão for específica. Não decore — leia.
