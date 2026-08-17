---
name: eos-dod
description: >-
  Executa a Definition of Done do EOS antes de declarar uma funcionalidade ou um
  sistema pronto — verifica dados, backend, API, frontend, estados de tela,
  autorização, auditoria, acessibilidade, performance, testes e entrega, e
  reporta com pendências explícitas. Use quando o usuário perguntar se algo está
  pronto, pedir para revisar antes de subir, mencionar Definition of Done, ou
  antes de qualquer deploy/merge de funcionalidade.
---

# EOS — Definition of Done

Referência: `__EOS_HOME__/standard/18-DEFINITION-OF-DONE.md`

> Funcionar não é estar pronto.

## 1. Determinar o escopo

- Qual funcionalidade (ou o sistema inteiro, antes do primeiro deploy)?
- Quais perfis se aplicam? Leia `.ai/PROJECT-CONTEXT.md`.
  `BASE` sempre; `SAAS` e `FIN` conforme declarado.

Só cobre requisitos dos perfis declarados. Cobrar `FIN` de um sistema interno é
ruído.

## 2. Verificar de verdade

**Marque apenas o que você verificou.** Não marque o que "deve estar ok".

Verificação real significa: abriu o arquivo, rodou o teste, fez a chamada, olhou
a tela. Se não deu para verificar, o item é ⚠️ com o motivo — não ✅.

### Dados
- [ ] Migration criada, revisada e reversível
- [ ] Constraints, FKs e índices aplicados
- [ ] Estratégia de exclusão definida
- [ ] Isolamento de tenant garantido *(SAAS)*

### Backend
- [ ] Regra de negócio no service, testável
- [ ] Validação de entrada por schema **no servidor**
- [ ] Autorização: papel verificado
- [ ] Autorização: ownership/tenant verificado sobre o registro
- [ ] Erros mapeados para o contrato de resposta
- [ ] Operação multi-tabela em transação
- [ ] Trabalho lento em fila, job idempotente

### API
- [ ] Envelope `{data, meta}` / `{error}` padronizado
- [ ] Códigos de erro definidos e documentados
- [ ] Paginação, filtro e ordenação padronizados
- [ ] Nenhum campo sensível ou interno exposto
- [ ] OpenAPI atualizada

### Frontend
- [ ] Loading
- [ ] Empty inicial **e** empty de busca (distintos)
- [ ] Error com "Tentar novamente"
- [ ] Success
- [ ] Formulário: erro por campo + erro geral + anti-duplo-envio
- [ ] Componentes do design system reutilizados (nada duplicado)
- [ ] Feedback visível em toda ação
- [ ] Confirmação em ação destrutiva, com impacto informado

### Transversal
- [ ] Responsivo de 320px ao desktop
- [ ] Teclado, foco visível, labels, contraste
- [ ] Sem N+1, listagem paginada, dentro do SLO
- [ ] Logs estruturados nos pontos relevantes
- [ ] Auditoria de create/update/delete *(SAAS)*
- [ ] Nenhum dado sensível em log

### Testes
- [ ] Unitários da regra de negócio
- [ ] Integração: sucesso e erros
- [ ] Autorização negada (401/403/404)
- [ ] E2E do caminho crítico
- [ ] Suíte inteira passando — **rode e mostre a saída**

### Entrega
- [ ] Sem segredo no código
- [ ] Sem `any`/`ts-ignore`/`eslint-disable` sem justificativa
- [ ] Lint e type check limpos — **rode**
- [ ] `.ai/` atualizado
- [ ] CI verde

## 3. Comandos úteis

```bash
npm run lint && npm run typecheck && npm test
git diff --stat
grep -rn "console.log\|@ts-ignore\|eslint-disable\|any" src/ | head -30
grep -rniE "(password|secret|token|api_?key)\s*[:=]\s*['\"]" src/ | head -20
```

## 4. Reportar

Formato obrigatório:

```
DoD — <funcionalidade>   (perfis: BASE, SAAS)

✅ Dados, backend, API, autorização
✅ Estados loading/empty/error/success
✅ Auditoria de create/update/delete
⚠️  E2E cobre apenas o caminho feliz
❌ Acessibilidade: foco não retorna ao fechar o modal de edição

Pendências: 2 (1 alta, 1 média)
Bloqueia produção: sim — A11Y-005 é requisito BASE
```

Regras do relatório:

- Item ❌ de perfil obrigatório **bloqueia**. Diga isso explicitamente.
- Item ⚠️ é pendência declarada com prazo/responsável sugerido.
- Teste falhou? Cole a saída. Não resuma como "alguns testes falharam".
- Não escreva "pronto" com item obrigatório aberto. Nunca.
- Se o usuário decidir subir mesmo assim, registre a decisão — não apague a
  pendência do relatório.

## 5. Sistema completo

Antes do **primeiro deploy em produção**, use o segundo checklist do documento
(fundação, identidade, segurança, operação, produto) — inclui TLS, SPF/DKIM/DMARC,
backup com restauração testada, rollback ensaiado, alertas com dono e páginas de
erro personalizadas.
