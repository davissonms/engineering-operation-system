# 14 — Testes

Prefixo de requisitos: `TST`

---

## A pirâmide

```
              ╱ E2E ╲            poucos, caros, cobrem fluxos críticos
            ╱─────────╲
          ╱ Integração ╲         muitos, cobrem API + banco reais
        ╱───────────────╲
      ╱   Testes unitários ╲     a base: regra de negócio pura
    ╱───────────────────────╲
```

Invertida (muito E2E, pouco unitário) a suíte fica lenta, instável e ninguém
roda. É o antipadrão mais comum.

## Unitário

Testa regra de negócio isolada, sem banco, sem HTTP, sem rede.

```
calcularPreco()      com desconto, sem desconto, no limite, negativo
validarCPF()         válido, inválido, com máscara, vazio
calcularMilhas()     arredondamento, faixa mínima, faixa máxima
```

Regra: teste o **comportamento**, não a implementação. Se refatorar sem mudar
comportamento quebra o teste, o teste estava errado.

## Integração

Testa a fatia real: HTTP → service → banco.

```
POST /v1/customers
  ✅ 201 cria e persiste
  ✅ 422 com e-mail inválido
  ✅ 409 com e-mail duplicado
  ✅ 401 sem token
  ✅ 403 sem permissão
  ✅ 404 ao acessar registro de outro tenant
```

Os quatro últimos são os que costumam faltar — e são exatamente os que garantem
`AUTZ-001` a `AUTZ-005`. **Todo endpoint tem teste de autorização.**

Banco real (container), não mock. Cada teste limpa o que criou.

## E2E

Só o caminho crítico do negócio. Poucos, estáveis, valiosos.

```
Login → criar cotação → selecionar voo → enviar → confirmar recebimento
Recuperar senha → definir nova → entrar
Cadastrar cliente → emitir → verificar auditoria
```

Sem seletor por classe CSS (quebra a cada ajuste visual) — use `data-testid` ou
papel acessível. Sem `sleep` fixo — espere por condição.

## Cobertura

Cobertura é indicador, não meta. 100% de cobertura com asserção fraca não vale
nada; 60% bem escolhido vale muito.

| Área | Mínimo |
| --- | --- |
| Regra de negócio / cálculo | 90% |
| Autenticação e autorização | 100% dos caminhos de decisão |
| Services | 80% |
| Geral do projeto | 70% |
| UI puramente visual | sem meta |

## O que sempre precisa de teste

- Toda regra de cálculo (preço, comissão, milhas, imposto, prazo)
- Todo caminho de autorização (permitido **e** negado)
- Todo fluxo de autenticação
- Todo bug corrigido — o teste que falha antes do fix, e passa depois. Sem isso
  o mesmo bug volta.
- Toda validação de entrada
- Todo caso de borda: vazio, nulo, zero, negativo, muito grande, acentuado,
  emoji, string com aspas, data limite, fuso horário

## Regras da suíte

- Teste é determinístico. Teste que falha às vezes é pior que teste ausente:
  ensina o time a ignorar vermelho.
- Sem dependência de ordem entre testes.
- Sem chamada à rede externa — use mock/stub na fronteira.
- Sem dependência de data real: injete o relógio.
- Nome do teste descreve o comportamento:
  `deve retornar 404 ao acessar cotação de outra agência`.
- Teste desabilitado (`skip`) precisa de comentário com motivo e prazo.
- Suíte inteira roda no CI e bloqueia o merge.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| TST-001 | Suíte de testes executável por comando único | BASE | `npm test` funciona do zero | Sim |
| TST-002 | Testes rodam no CI e bloqueiam merge | BASE | Job obrigatório | Sim |
| TST-003 | Regra de negócio com teste unitário | BASE | Cobertura ≥ 90% em cálculo | Sim |
| TST-004 | Endpoints com teste de integração | BASE | Sucesso e erro cobertos | Sim |
| TST-005 | Todo endpoint com teste de autorização negada | BASE | 401/403/404 verificados | Sim |
| TST-006 | Fluxos de autenticação testados | BASE | Login, reset, refresh, logout | Sim |
| TST-007 | Isolamento de tenant testado | SAAS | Acesso cruzado retorna 404 | Sim |
| TST-008 | Fluxos críticos com teste E2E | BASE | Pelo menos os caminhos de receita | Sim |
| TST-009 | Todo bug corrigido ganha teste de regressão | BASE | Teste falha sem o fix | Não |
| TST-010 | Validações de entrada testadas | BASE | Casos inválidos cobertos | Sim |
| TST-011 | Casos de borda cobertos | BASE | Vazio, nulo, limite, acentuação | Não |
| TST-012 | Testes determinísticos, sem flakiness | BASE | Sem falha intermitente na suíte | Não |
| TST-013 | Sem dependência de ordem entre testes | BASE | Execução aleatória passa | Sim |
| TST-014 | Sem chamada a serviço externo real | BASE | Fronteiras mockadas | Sim |
| TST-015 | Relógio injetável, sem dependência de data real | BASE | Testes estáveis em qualquer dia | Não |
| TST-016 | Banco de teste isolado e limpo entre execuções | BASE | Container/schema dedicado | Sim |
| TST-017 | Cobertura mínima do projeto atingida | BASE | ≥ 70% global | Sim |
| TST-018 | Teste desabilitado tem motivo documentado | BASE | Comentário obrigatório | Sim |
| TST-019 | Seletores E2E estáveis (`data-testid`) | BASE | Sem seletor por classe de estilo | Sim |
| TST-020 | Sem espera fixa em testes assíncronos | BASE | Espera por condição | Sim |
| TST-021 | Testes de migração de banco | REC | Migration up/down verificada | Sim |
| TST-022 | Teste de contrato da API | REC | Diff de OpenAPI validado | Sim |
