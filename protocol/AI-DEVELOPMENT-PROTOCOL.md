# AI Development Protocol

Como o Claude Code (e qualquer agente de IA) deve trabalhar dentro do EOS.

Este documento não descreve o que construir. Descreve **o que consultar antes de
construir, o que é proibido fazer sem verificar, quando reutilizar, quando criar,
quando atualizar o contexto e quando parar e pedir decisão humana.**

---

## 0. Regra de ouro

> A IA não é a fonte da verdade sobre o projeto. Os arquivos são.

A memória de contexto se perde, se resume e se distorce entre sessões. Antes de
afirmar que algo existe, existe de determinado jeito, ou não existe — **leia o
arquivo**. "Eu acho que o projeto usa X" não é uma base aceitável para escrever
código.

---

## 1. Ciclo obrigatório

```
        PEDIDO
          ↓
   ┌──────────────┐
   │ 1. ORIENTAR  │  ler .ai/, identificar perfis e stack
   └──────┬───────┘
          ↓
   ┌──────────────┐
   │ 2. PROCURAR  │  já existe algo equivalente?
   └──────┬───────┘
          ↓
   ┌──────────────┐
   │ 3. CONTRATAR │  escopo explícito (Feature Contract se for grande)
   └──────┬───────┘
          ↓
   ┌──────────────┐
   │ 4. VERIFICAR │  conflito com o padrão? → PARAR
   └──────┬───────┘
          ↓
   ┌──────────────┐
   │ 5. IMPLEMENTAR│ backend → API → frontend → estados → testes
   └──────┬───────┘
          ↓
   ┌──────────────┐
   │ 6. AUDITAR   │  Definition of Done dos perfis do projeto
   └──────┬───────┘
          ↓
   ┌──────────────┐
   │ 7. REGISTRAR │  atualizar .ai/ com o que virou padrão
   └──────────────┘
```

Nenhuma etapa é opcional. Etapas 1, 2 e 4 são baratas e evitam a maior parte do
retrabalho.

---

## 2. ORIENTAR — o que ler antes de qualquer coisa

Na primeira tarefa de cada sessão, leia (na ordem, se existirem):

```
.ai/PROJECT-CONTEXT.md      o que é o sistema, perfis EOS, versão do padrão
.ai/TECH-STACK.md           tecnologias, versões, comandos
.ai/ARCHITECTURE.md         camadas, módulos, fronteiras
.ai/DESIGN-SYSTEM.md        tokens e componentes disponíveis
.ai/BUSINESS-RULES.md       regras de domínio
.ai/API-CONVENTIONS.md      contrato de resposta, erro, paginação
.ai/DECISIONS/              ADRs, especialmente os que criam exceções
```

Se `.ai/` não existe, **não invente convenções**: rode `/eos-init` ou avise que o
projeto não está sob o padrão e pergunte se deve ser inicializado.

Se `.ai/` existe mas está desatualizado em relação ao código, o **código vence**
para fatos (o que existe) e o **documento vence** para intenção (o que deve ser).
Aponte a divergência.

---

## 3. PROCURAR — reutilizar antes de criar

Proibido criar qualquer um destes sem antes procurar o equivalente:

| Vai criar | Procure antes em |
| --- | --- |
| Componente de UI | `.ai/DESIGN-SYSTEM.md`, `components/`, `components/ui/` |
| Página/tela | páginas com o mesmo arquétipo (listagem, detalhe, formulário) |
| Endpoint | rotas/controllers do módulo e de módulos irmãos |
| Tabela/model | schema atual, migrations, entidades relacionadas |
| Utilitário/helper | `shared/`, `lib/`, `utils/` |
| Hook | `hooks/` |
| Tipo/DTO | tipos do módulo e tipos compartilhados |
| Padrão de erro | `.ai/API-CONVENTIONS.md`, catálogo de códigos de erro |

Busque por **função**, não por nome. Não achar `formatCurrency` não significa que
não exista — procure por `toBRL`, `money`, `currency`, `formatPrice`.

Ordem de decisão:

```
Existe idêntico?           → use
Existe quase igual?        → estenda por props/parâmetro/composição
Existe padrão análogo?     → siga a mesma forma
Não existe nada parecido?  → crie, documente e registre
```

**Nunca** crie a segunda variação de um componente existente para resolver uma
diferença visual pontual. Isso é `Button` + `PrimaryButton` + `ActionButton`
nascendo. Diferença visual é variante, não componente novo.

---

## 4. CONTRATAR — escopo explícito antes de escrever

Para tarefas pequenas (um campo, um ajuste, um bug), siga direto.

Para funcionalidade nova relevante, escreva um **Feature Contract**
(`protocol/FEATURE-CONTRACT.template.md`) e confirme antes de implementar. Ele
força a lista que costuma ser esquecida: permissões, auditoria, estados de tela,
erros, validações, testes, critério de aceite.

Sintoma de que faltou contrato: "criei a tela" — mas sem endpoint, sem permissão,
sem estado vazio, sem loading, sem validação, sem mobile, sem teste.

---

## 5. VERIFICAR — quando parar

Pare e pergunte antes de implementar quando:

| Situação | Por quê |
| --- | --- |
| O pedido contraria um requisito `BASE` | Nível 1 não cede a nível 7 |
| O pedido exige criar um segundo padrão para a mesma coisa | Entropia arquitetural |
| A mudança altera contrato de API já consumido | Quebra cliente externo |
| A mudança apaga ou transforma dado existente | Irreversível |
| Falta regra de negócio para decidir corretamente | Chute vira bug de domínio |
| A tarefa exige credencial, ambiente ou acesso que você não tem | Bloqueio real |
| A mudança tem impacto de segurança que você não consegue avaliar | Nível 0 |

Use o formato de parada da `HIERARQUIA-DE-AUTORIDADE.md`. Uma pergunta objetiva
com opções — não um ensaio, não um pedido de permissão genérico.

**Não pare** por: escolha de nome de variável, formatação, detalhe de layout
coberto pelo design system, ou qualquer decisão que um colega experiente tomaria
sozinho. Decida, siga, e diga o que decidiu.

---

## 6. IMPLEMENTAR — ordem e completude

Ordem padrão de uma feature vertical:

```
1. Modelo de dados + migration
2. Regras de domínio / service
3. Autorização (papel + ownership/tenant)
4. Endpoint + validação de entrada + contrato de resposta
5. Erros e códigos de erro
6. Auditoria e logs
7. Cliente/serviço no frontend + tipos
8. Tela: loading → empty → error → success
9. Formulário: validação por campo, erro geral, anti-duplo-envio
10. Responsividade e acessibilidade
11. Testes: unit → integração → E2E do caminho crítico
12. Documentação e atualização de .ai/
```

Regras de implementação inegociáveis:

- Nunca escreva credencial, token ou chave no código. Sempre variável de ambiente.
- Nunca desabilite verificação de tipo, lint ou teste para "fazer passar".
  `any`, `@ts-ignore`, `eslint-disable` e `skip` precisam de comentário com motivo.
- Nunca crie migration destrutiva sem plano de reversão explícito.
- Nunca faça `SELECT *` em endpoint que retorna dado de usuário.
- Nunca retorne hash de senha, token ou campo interno em resposta de API.
- Nunca implemente autorização apenas no frontend.
- Nunca introduza dependência nova sem dizer por quê e verificar manutenção/licença.

---

## 7. AUDITAR — o gate

Antes de dizer que terminou, rode a Definition of Done
(`standard/18-DEFINITION-OF-DONE.md`) contra os perfis declarados do projeto e
**reporte o resultado honestamente**:

```
DoD — Cadastro de fornecedores (perfis: BASE, SAAS)

✅ Backend, validação, autorização, contrato de API
✅ Estados loading/empty/error/success
✅ Auditoria de create/update/delete
⚠️  Testes E2E: só o caminho feliz
❌ Acessibilidade: navegação por teclado no modal não verificada

Pendências: 2 (1 média, 1 alta)
```

Nunca reporte "pronto" com item vermelho aberto. Item pendente é pendência
declarada, não detalhe. Se o teste falhou, mostre a saída do teste.

---

## 8. REGISTRAR — quando atualizar o contexto

Atualize `.ai/` **na mesma entrega**, não depois, quando:

| Aconteceu | Atualize |
| --- | --- |
| Criou componente reutilizável | `.ai/DESIGN-SYSTEM.md` + `.ai/COMPONENTS.md` |
| Criou padrão de UX novo | `.ai/UX-PATTERNS.md` |
| Escolheu tecnologia, biblioteca ou abordagem estrutural | `.ai/DECISIONS/ADR-NNN.md` |
| Criou/alterou entidade | `.ai/DATABASE.md` |
| Criou/alterou contrato de API | `.ai/API-CONVENTIONS.md` |
| Descobriu regra de negócio não documentada | `.ai/BUSINESS-RULES.md` |
| Registrou exceção ao padrão | `.ai/DECISIONS/ADR-NNN.md` |
| Mudou stack ou versão relevante | `.ai/TECH-STACK.md` |

Critério simples: **se a próxima sessão precisaria saber disso para não fazer
diferente, escreva.**

Se a decisão deveria valer para *todos* os projetos, diga explicitamente que ela
é candidata a subir para o EOS — não a promova sozinho.

---

## 9. Comunicação

- Responda em português.
- Diga o que fez, não o que pretende fazer em seguida, em uma lista longa.
- Referencie arquivo e linha (`src/modules/auth/auth.service.ts:88`).
- Se algo não foi feito, diga que não foi feito e por quê.
- Não anuncie conclusão sem ter verificado. "Deve funcionar" não é verificação.
- Ao encontrar um problema fora do escopo pedido, relate — não corrija por conta
  própria a menos que seja trivial e relacionado.

---

## 10. Antipadrões — a IA nunca faz isso

| Antipadrão | Correto |
| --- | --- |
| Criar `UserService2`, `utilsNew`, `index-v2` | Alterar o existente ou renomear com migração |
| Comentar código quebrado em vez de resolver | Corrigir ou remover, com explicação |
| Adicionar `try/catch` vazio para o erro sumir | Tratar, logar com contexto e propagar |
| Inventar campo, endpoint ou regra de negócio | Perguntar |
| Assumir que a tabela tem determinada coluna | Ler o schema |
| Refatorar meio sistema junto com um bugfix | Uma coisa por entrega |
| Escrever teste que sempre passa para fechar o checklist | Teste que falha se o comportamento quebrar |
| Reescrever do zero o que já funciona | Entender antes de substituir |
| Sumir com a pendência no relatório final | Declarar |
