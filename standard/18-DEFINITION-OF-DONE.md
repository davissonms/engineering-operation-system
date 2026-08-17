# 18 — Definition of Done

Prefixo de requisitos: `DOD`

> **Uma funcionalidade só está pronta quando atende à Definition of Done.**
> Não quando "funciona".

Este é o portão. Nenhuma feature vai para produção com item vermelho aberto sem
decisão explícita de quem responde pelo produto.

---

## Checklist — funcionalidade

Marque apenas o que foi **verificado**, não o que "deve estar ok".

### Requisito e escopo
```
[ ] Requisito compreendido e escopo acordado
[ ] Regras de negócio confirmadas (nada foi inventado)
[ ] Feature Contract escrito, quando a feature é relevante
```

### Dados
```
[ ] Migration criada, revisada e reversível
[ ] Constraints, FKs e índices aplicados
[ ] Estratégia de exclusão definida
[ ] Isolamento de tenant garantido            (SAAS)
```

### Backend
```
[ ] Regra de negócio implementada no service
[ ] Validação de entrada por schema no servidor
[ ] Autorização: papel verificado
[ ] Autorização: ownership/tenant verificado sobre o registro
[ ] Erros de domínio mapeados para o contrato de resposta
[ ] Operação multi-tabela em transação
[ ] Trabalho lento em fila, com job idempotente
```

### API
```
[ ] Contrato de resposta padronizado (data/meta e error)
[ ] Códigos de erro definidos e documentados
[ ] Paginação, filtro e ordenação padronizados
[ ] Nenhum campo sensível ou interno exposto
[ ] OpenAPI atualizada
```

### Frontend
```
[ ] Estado de loading
[ ] Estado vazio (inicial e de busca, distintos)
[ ] Estado de erro com opção de tentar novamente
[ ] Estado de sucesso
[ ] Formulário: erro por campo + erro geral + anti-duplo-envio
[ ] Componentes do design system reutilizados (nada duplicado)
[ ] Feedback visível para toda ação
[ ] Confirmação em ação destrutiva, com impacto informado
```

### Qualidade transversal
```
[ ] Responsivo de 320px ao desktop
[ ] Acessível: teclado, foco visível, labels, contraste
[ ] Performance dentro do SLO (sem N+1, listagem paginada)
[ ] Logs estruturados nos pontos relevantes
[ ] Auditoria de create/update/delete                     (SAAS)
[ ] Nenhum dado sensível em log
```

### Testes
```
[ ] Unitários da regra de negócio
[ ] Integração do endpoint: sucesso e erros
[ ] Teste de autorização negada (401/403/404)
[ ] E2E do caminho crítico, quando aplicável
[ ] Suíte inteira passando
```

### Entrega
```
[ ] Sem segredo no código
[ ] Sem `any`/`ts-ignore`/`eslint-disable` sem justificativa
[ ] Lint e type check limpos
[ ] `.ai/` atualizado (componentes, decisões, regras, contratos)
[ ] Code review aprovado
[ ] CI verde
[ ] Homologado em staging
```

---

## Checklist — sistema, antes do primeiro deploy em produção

```
FUNDAÇÃO
[ ] Domínio, DNS e TLS com renovação automática
[ ] SPF, DKIM e DMARC configurados
[ ] Três ambientes provisionados
[ ] Segredos em cofre, fora do repositório

IDENTIDADE
[ ] Login, logout, cadastro, verificação de e-mail
[ ] Recuperação de senha completa (token único, expirável, hasheado)
[ ] Alteração de senha e de e-mail
[ ] Sessões: refresh rotativo, expiração, invalidação
[ ] Papéis e permissões definidos e aplicados no servidor

SEGURANÇA
[ ] HTTPS + HSTS + headers de segurança
[ ] Rate limiting
[ ] Validação de entrada em todos os endpoints
[ ] Scan de segredos, SAST e audit de dependências limpos
[ ] Teste de IDOR/autorização executado

OPERAÇÃO
[ ] Logs centralizados e pesquisáveis
[ ] Rastreamento de erros ativo
[ ] Healthcheck monitorado
[ ] Alertas com dono definido
[ ] Backup automático + restauração testada
[ ] Rollback documentado e ensaiado

PRODUTO
[ ] Página 404 e página de erro personalizadas
[ ] Textos revisados em português
[ ] Auditoria consultável na interface           (SAAS)
[ ] Política de privacidade e termos             (SAAS)
[ ] README permite subir o projeto do zero
```

---

## Como reportar

Honestamente. Item pendente é pendência declarada, não detalhe omitido.

```
DoD — Cadastro de fornecedores   (perfis: BASE, SAAS)

✅ Dados, backend, API, autorização
✅ Estados loading/empty/error/success
✅ Auditoria de create/update/delete
✅ Testes unitários e de integração
⚠️  E2E cobre apenas o caminho feliz
❌ Acessibilidade: foco não retorna ao fechar o modal de edição

Pendências: 2 (1 alta, 1 média)
Bloqueia produção: sim — A11Y-005 é requisito BASE
```

Nunca escreva "pronto" com item ❌ de perfil obrigatório em aberto.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| DOD-001 | Perfis de conformidade declarados no projeto | BASE | `.ai/PROJECT-CONTEXT.md` | Sim |
| DOD-002 | DoD executada antes de declarar feature pronta | BASE | Resultado registrado no PR | Não |
| DOD-003 | Nenhum item obrigatório em aberto no merge | BASE | Verificado em review | Não |
| DOD-004 | Pendência aceita registrada com prazo e responsável | BASE | Issue criada | Não |
| DOD-005 | Checklist de sistema cumprido antes do 1º deploy | BASE | Registro de homologação | Não |
| DOD-006 | Homologação humana antes de produção | BASE | Aprovação registrada | Não |
| DOD-007 | Relatório de DoD honesto, com pendências visíveis | BASE | Sem "pronto" com item vermelho | Não |
