# Catálogo de Requisitos — EOS

> **Arquivo gerado.** Não edite à mão.
> Fonte: as tabelas de requisitos em `standard/*.md`.
> Regenerar: `node bin/eos-catalog.mjs`

Versão do padrão: **1.0.0**

## Resumo

| | Quantidade |
| --- | ---: |
| **Total de requisitos** | 397 |
| BASE — todo sistema | 324 |
| SAAS — multiusuário | 29 |
| FIN — financeiro | 18 |
| REC — recomendado | 26 |
| Automatizáveis | 247 |

## Perfis

| Perfil | Significado |
| --- | --- |
| `BASE` | Obrigatório em todo sistema web, sem exceção |
| `SAAS` | Obrigatório em sistema multiusuário / multi-tenant |
| `FIN` | Obrigatório em sistema que toca dinheiro, pagamento ou emissão |
| `REC` | Recomendado — a ausência exige justificativa |

## 01 — Arquitetura

Fonte: [`standard/01-ARQUITETURA.md`](../standard/01-ARQUITETURA.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `ARC-001` | Código organizado por módulo de domínio | `BASE` | Existe `modules/` (ou equivalente) com pastas por domínio | Não |
| `ARC-002` | Regra de negócio isolada da camada HTTP | `BASE` | Nenhum service importa tipos de request/response HTTP | Sim |
| `ARC-003` | Acesso a dados isolado em repositório/ORM | `BASE` | Nenhum controller executa query | Sim |
| `ARC-004` | Módulo não importa interno de outro módulo | `BASE` | Lint de fronteira configurado e passando | Sim |
| `ARC-005` | `shared/` não depende de `modules/` | `BASE` | Verificado por lint de import | Sim |
| `ARC-006` | Design system isolado em `components/ui/` | `BASE` | Diretório existe e é a origem dos primitivos | Não |
| `ARC-007` | Configuração lida e validada em um único ponto | `BASE` | Módulo de config valida env no boot e falha rápido | Sim |
| `ARC-008` | Integrações externas isoladas em `infrastructure/` | `BASE` | Nenhum service chama SDK externo diretamente | Não |
| `ARC-009` | Divisão em múltiplos serviços exige ADR | `BASE` | ADR existente quando há mais de um deployable | Não |
| `ARC-010` | Estrutura documentada em `.ai/ARCHITECTURE.md` | `BASE` | Arquivo existe e reflete a árvore real | Não |
| `ARC-011` | Comunicação entre módulos por service público ou evento | `BASE` | Nenhuma query cruzando fronteira de domínio | Não |
| `ARC-012` | Multi-tenant isolado em camada única | `SAAS` | Filtro de tenant aplicado no repositório, não caso a caso | Sim |

## 02 — Banco de Dados

Fonte: [`standard/02-BANCO-DE-DADOS.md`](../standard/02-BANCO-DE-DADOS.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `DB-001` | Toda mudança de schema via migration versionada | `BASE` | Migrations no repositório; schema reproduzível do zero | Sim |
| `DB-002` | Toda tabela tem PK única e estável | `BASE` | Sem tabela sem PK | Sim |
| `DB-003` | Toda tabela tem `created_at` e `updated_at` | `BASE` | Verificado por inspeção de schema | Sim |
| `DB-004` | Toda relação tem FK real com `ON DELETE` explícito | `BASE` | Sem FK implícita apenas na aplicação | Sim |
| `DB-005` | Índice em toda FK e em colunas de filtro frequente | `BASE` | Índices presentes; listagens sem seq scan em tabela grande | Parcial |
| `DB-006` | Senha armazenada apenas como hash forte | `BASE` | Argon2id ou bcrypt cost ≥ 12 | Sim |
| `DB-007` | Valores monetários sem ponto flutuante | `BASE` | `numeric` ou inteiro em centavos | Sim |
| `DB-008` | Datas em `timestamptz` armazenadas em UTC | `BASE` | Sem coluna de data sem timezone | Sim |
| `DB-009` | Operação multi-tabela em transação | `BASE` | Services relevantes usam transação | Não |
| `DB-010` | Estratégia de exclusão definida por entidade | `BASE` | Documentado em `.ai/DATABASE.md` | Não |
| `DB-011` | Soft delete filtrado por padrão em toda consulta | `BASE` | Middleware/escopo global, não filtro manual | Sim |
| `DB-012` | Índice único compatível com soft delete | `BASE` | Índice parcial `WHERE deleted_at IS NULL` | Sim |
| `DB-013` | Toda listagem paginada no banco | `BASE` | Nenhum endpoint retorna coleção sem limite | Sim |
| `DB-014` | Sem `SELECT *` em código de aplicação | `BASE` | Verificado por lint/review | Parcial |
| `DB-015` | Sem consultas N+1 em listagens | `BASE` | Contagem de queries verificada em teste de integração | Parcial |
| `DB-016` | Migration destrutiva com backup e plano de reversão | `BASE` | Registrado no PR | Não |
| `DB-017` | Nenhuma alteração manual de schema em produção | `BASE` | Schema de produção igual ao gerado pelas migrations | Sim |
| `DB-018` | Convenção de nomes única no projeto | `BASE` | `snake_case`, plural, FK `<entidade>_id` | Parcial |
| `DB-019` | Seed de desenvolvimento reproduzível | `REC` | Comando único popula ambiente de dev | Sim |
| `DB-020` | `tenant_id` obrigatório e indexado em tabelas de tenant | `SAAS` | NOT NULL + FK + presente nos índices únicos | Sim |
| `DB-021` | Isolamento de tenant garantido em camada única | `SAAS` | Filtro aplicado no repositório/middleware | Sim |
| `DB-022` | Dados pessoais sensíveis criptografados em repouso | `FIN` | Documento/cartão/token cifrados | Não |
| `DB-023` | Histórico imutável de transações financeiras | `FIN` | Registro financeiro nunca sofre update destrutivo | Não |
| `DB-024` | Schema documentado em `.ai/DATABASE.md` | `BASE` | Entidades, relações e estratégias descritas | Não |

## 03 — Backend

Fonte: [`standard/03-BACKEND.md`](../standard/03-BACKEND.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `BE-001` | TypeScript em modo strict | `BASE` | `strict: true`, build sem erro | Sim |
| `BE-002` | Toda entrada validada por schema no servidor | `BASE` | Nenhum handler lê body sem validação | Sim |
| `BE-003` | Whitelist de campos na entrada | `BASE` | Campo não declarado é rejeitado/removido | Sim |
| `BE-004` | Limites explícitos de tamanho e faixa | `BASE` | Strings, arrays, payload e upload com limite | Parcial |
| `BE-005` | Hierarquia de erros de domínio independente de HTTP | `BASE` | Classes de erro sem dependência de framework web | Sim |
| `BE-006` | Filtro global converte erro em resposta padronizada | `BASE` | Toda rota responde no contrato de erro | Sim |
| `BE-007` | Nenhum `catch` vazio ou silencioso | `BASE` | Verificado por lint e review | Sim |
| `BE-008` | Erro interno nunca vaza detalhe técnico ao usuário | `BASE` | Sem stack trace, SQL ou caminho de arquivo na resposta | Sim |
| `BE-009` | Toda resposta de erro tem `request_id` correlacionável | `BASE` | ID presente na resposta e no log | Sim |
| `BE-010` | Regra de negócio isolada em service testável | `BASE` | Teste unitário de service sem HTTP/banco real | Sim |
| `BE-011` | Trabalho lento executado em fila | `BASE` | Nenhuma requisição HTTP síncrona acima do SLO por I/O externo | Não |
| `BE-012` | Job com retry, limite, dead-letter e log | `BASE` | Configuração presente na fila | Sim |
| `BE-013` | Job idempotente | `BASE` | Reexecução não duplica efeito | Não |
| `BE-014` | Timeout explícito em toda chamada externa | `BASE` | Nenhum cliente HTTP com timeout infinito | Sim |
| `BE-015` | Configuração via env validada no boot | `BASE` | App falha ao subir com env inválida | Sim |
| `BE-016` | `.env.example` completo e sem segredos | `BASE` | Todas as chaves presentes, valores neutros | Sim |
| `BE-017` | Nenhum segredo no código ou no repositório | `BASE` | Scan de segredos limpo | Sim |
| `BE-018` | Graceful shutdown implementado | `BASE` | SIGTERM finaliza requisições e jobs em andamento | Sim |
| `BE-019` | Healthcheck `/health` e readiness `/ready` | `BASE` | Endpoints respondem estado real de dependências | Sim |
| `BE-020` | Webhook de terceiro validado por assinatura | `SAAS` | Assinatura verificada e replay bloqueado | Sim |
| `BE-021` | Retry apenas em operação idempotente | `BASE` | Sem retry cego em POST não idempotente | Não |
| `BE-022` | Operações financeiras com idempotency key | `FIN` | Chave obrigatória e reuso retorna resultado original | Sim |
| `BE-023` | Uploads validados por tipo real, tamanho e destino isolado | `BASE` | Sem execução, sem path traversal, fora do webroot | Sim |
| `BE-024` | Nenhum `any`/`ts-ignore` sem justificativa comentada | `BASE` | Ocorrências revisadas em code review | Parcial |

## 04 — API

Fonte: [`standard/04-API.md`](../standard/04-API.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `API-001` | Versionamento no caminho (`/v1`) | `BASE` | Todas as rotas versionadas | Sim |
| `API-002` | Recursos no plural, sem verbo na URL | `BASE` | Verificado em review/spec | Parcial |
| `API-003` | Métodos HTTP com semântica correta | `BASE` | `GET` não altera estado | Sim |
| `API-004` | Status codes conforme tabela do padrão | `BASE` | Testes de integração cobrem os casos | Sim |
| `API-005` | Envelope de sucesso padronizado (`data`/`meta`) | `BASE` | Todas as respostas seguem o formato | Sim |
| `API-006` | Envelope de erro padronizado com `code` e `request_id` | `BASE` | Todas as respostas de erro seguem o formato | Sim |
| `API-007` | Erro de validação detalhado por campo | `BASE` | `details[]` com `field` e `code` | Sim |
| `API-008` | Catálogo de códigos de erro documentado | `BASE` | `.ai/API-CONVENTIONS.md` lista os códigos | Não |
| `API-009` | Paginação obrigatória em toda listagem | `BASE` | Nenhum endpoint retorna coleção ilimitada | Sim |
| `API-010` | `per_page` com teto imposto pelo servidor | `BASE` | Valor acima do máximo é limitado ou rejeitado | Sim |
| `API-011` | Filtro, busca e ordenação padronizados | `BASE` | Mesma sintaxe em todos os recursos | Parcial |
| `API-012` | Parâmetro desconhecido rejeitado | `BASE` | Retorna 400 | Sim |
| `API-013` | HTTPS obrigatório | `BASE` | HTTP não serve conteúdo autenticado | Sim |
| `API-014` | CORS com origens explícitas | `BASE` | Sem `*` em rota autenticada | Sim |
| `API-015` | Rate limit com `429` e `Retry-After` | `BASE` | Configurado por IP e por usuário | Sim |
| `API-016` | Datas em ISO 8601 com timezone | `BASE` | Sem formato local na API | Sim |
| `API-017` | Valores monetários sem float, com moeda explícita | `BASE` | Verificado no contrato | Sim |
| `API-018` | Nenhum campo sensível ou interno na resposta | `BASE` | Serialização por DTO explícito, não pelo model | Sim |
| `API-019` | OpenAPI 3.1 gerado do código e versionado | `BASE` | Spec atualizada no repositório | Sim |
| `API-020` | Permissão exigida documentada por endpoint | `SAAS` | Consta na spec | Não |
| `API-021` | `Idempotency-Key` em operação com efeito externo | `FIN` | Reuso retorna o resultado original | Sim |
| `API-022` | Depreciação anunciada com header e prazo mínimo | `REC` | `Deprecation`/`Sunset` presentes | Sim |
| `API-023` | Webhooks emitidos com assinatura e retry | `SAAS` | HMAC + política de reentrega documentada | Sim |
| `API-024` | Mudança de contrato detectada no PR | `REC` | Diff de OpenAPI no CI | Sim |

## 05 — Frontend

Fonte: [`standard/05-FRONTEND.md`](../standard/05-FRONTEND.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `FE-001` | Estado de loading em toda busca de dados | `BASE` | Skeleton/indicador presente | Não |
| `FE-002` | Estado vazio com ação primária | `BASE` | Mensagem + CTA | Não |
| `FE-003` | Estado de erro com opção de tentar novamente | `BASE` | Mensagem + retry | Não |
| `FE-004` | Empty inicial distinto de empty de busca | `BASE` | Mensagens e ações diferentes | Não |
| `FE-005` | Validação de formulário com erro por campo | `BASE` | Erro exibido junto ao campo | Não |
| `FE-006` | Erro geral exibido fora dos campos | `BASE` | Falha de rede/servidor visível | Não |
| `FE-007` | Prevenção de duplo envio | `BASE` | Botão desabilitado durante submissão | Sim |
| `FE-008` | Foco movido para o primeiro erro após submit | `BASE` | Verificado manualmente | Não |
| `FE-009` | Aviso ao sair com alterações não salvas | `REC` | Confirmação exibida | Não |
| `FE-010` | Máscara/formatação nos campos aplicáveis | `BASE` | CPF, CNPJ, telefone, moeda, data | Não |
| `FE-011` | Busca de dados em camada dedicada | `BASE` | Sem `fetch` dentro de JSX | Sim |
| `FE-012` | Invalidação de cache após mutação | `BASE` | Lista reflete a alteração sem reload manual | Não |
| `FE-013` | Listagem paginada no servidor | `BASE` | Sem carregar coleção inteira no cliente | Sim |
| `FE-014` | Sem valores de estilo fora dos tokens | `BASE` | Sem cor/espaçamento arbitrário | Sim |
| `FE-015` | Props tipadas, sem `any` | `BASE` | Build strict sem erro | Sim |
| `FE-016` | Sem lógica de negócio dentro de componente | `BASE` | Lógica em hook/service | Não |
| `FE-017` | Imagens otimizadas e sem layout shift | `BASE` | `next/image` com dimensões | Sim |
| `FE-018` | Carregamento sob demanda em rotas pesadas | `REC` | `dynamic import` aplicado | Não |
| `FE-019` | Debounce em campo de busca | `BASE` | ~300ms | Não |
| `FE-020` | HTML de terceiro sanitizado | `BASE` | Sem `dangerouslySetInnerHTML` cru | Sim |
| `FE-021` | Nenhum segredo em variável pública | `BASE` | Scan de `NEXT_PUBLIC_*` | Sim |
| `FE-022` | Token de sessão em cookie `httpOnly` quando possível | `BASE` | Sem token em `localStorage` | Sim |
| `FE-023` | Interface responsiva de 320px a desktop | `BASE` | Sem scroll horizontal, sem sobreposição | Parcial |
| `FE-024` | Página de erro e 404 personalizadas | `BASE` | `error.tsx` e `not-found.tsx` existem | Sim |

## 06 — Design System

Fonte: [`standard/06-DESIGN-SYSTEM.md`](../standard/06-DESIGN-SYSTEM.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `DS-001` | Design system existe e está documentado | `BASE` | `.ai/DESIGN-SYSTEM.md` + `components/ui/` | Não |
| `DS-002` | Tokens definidos para cor, tipografia, espaçamento, raio, sombra, breakpoints, motion e z-index | `BASE` | Definidos em um único lugar | Sim |
| `DS-003` | Nenhum valor visual arbitrário no código | `BASE` | Sem hex/px soltos fora dos tokens | Sim |
| `DS-004` | Toda listagem tabular usa DataTable | `BASE` | Sem `<table>` escrito em página | Sim |
| `DS-005` | Todo formulário usa o componente Form padrão | `BASE` | Sem gestão manual de formulário por tela | Parcial |
| `DS-006` | Todo modal usa Dialog; destrutivo usa AlertDialog | `BASE` | Sem modal ad hoc | Sim |
| `DS-007` | Notificações usam Toast; `alert()` proibido | `BASE` | Sem `alert`/`confirm` nativos | Sim |
| `DS-008` | Estados vazio/erro/loading usam componentes padrão | `BASE` | EmptyState, ErrorState, Skeleton | Não |
| `DS-009` | Nenhum componente duplicado com a mesma função | `BASE` | Auditoria de duplicidade limpa | Parcial |
| `DS-010` | Variante em vez de novo componente para diferença visual | `BASE` | Verificado em code review | Não |
| `DS-011` | Componente do design system é agnóstico de domínio | `BASE` | `components/ui/` não importa tipos de domínio | Sim |
| `DS-012` | Novo componente reutilizável é documentado na mesma entrega | `BASE` | `.ai/COMPONENTS.md` atualizado | Não |
| `DS-013` | Tema claro/escuro resolvido por tokens | `REC` | Sem condicional de tema espalhada | Sim |
| `DS-014` | Arquétipos de página reutilizados | `BASE` | Listagens do sistema seguem o mesmo layout | Não |
| `DS-015` | Vocabulário de ações e status consistente | `BASE` | Glossário em `.ai/UX-PATTERNS.md` | Não |
| `DS-016` | Formatação brasileira de data e moeda na interface | `BASE` | `dd/mm/aaaa` e `R$ 0.000,00` | Sim |
| `DS-017` | Ícones de uma única biblioteca | `BASE` | Sem mistura de conjuntos de ícones | Sim |
| `DS-018` | Componentes do design system acessíveis por teclado | `BASE` | Foco visível, ordem lógica, ESC fecha overlays | Parcial |

## 07 — Autenticação

Fonte: [`standard/07-AUTENTICACAO.md`](../standard/07-AUTENTICACAO.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `AUTH-001` | Login com credenciais validadas no servidor | `BASE` | Endpoint funcional e testado | Sim |
| `AUTH-002` | Logout invalida a sessão no servidor | `BASE` | Refresh token revogado | Sim |
| `AUTH-003` | Senha armazenada com Argon2id ou bcrypt ≥ 12 | `BASE` | Verificado no código | Sim |
| `AUTH-004` | Senha mínima de 12 caracteres | `BASE` | Validação no servidor | Sim |
| `AUTH-005` | Bloqueio de senhas vazadas conhecidas | `REC` | Verificação contra base de leaks | Sim |
| `AUTH-006` | Colar senha e gerenciadores permitidos | `BASE` | Sem bloqueio de `paste` | Sim |
| `AUTH-007` | Recuperação de senha disponível | `BASE` | Fluxo completo funcionando | Sim |
| `AUTH-008` | Token de recuperação expira | `BASE` | Máximo 1h | Sim |
| `AUTH-009` | Token de recuperação de uso único | `BASE` | Segundo uso é rejeitado | Sim |
| `AUTH-010` | Token armazenado hasheado | `BASE` | Banco não contém token em claro | Sim |
| `AUTH-011` | Resposta não revela existência de e-mail | `BASE` | Mesma resposta e mesmo tempo | Sim |
| `AUTH-012` | Sessões invalidadas após troca de senha | `BASE` | Sessões antigas param de funcionar | Sim |
| `AUTH-013` | Usuário notificado por e-mail em troca de senha | `BASE` | E-mail enviado | Sim |
| `AUTH-014` | Verificação de e-mail no cadastro | `BASE` | Conta inativa até verificar | Sim |
| `AUTH-015` | Alteração de e-mail confirmada nos dois endereços | `BASE` | Confirmação dupla | Sim |
| `AUTH-016` | Alteração de senha exige a senha atual | `BASE` | Validado no servidor | Sim |
| `AUTH-017` | Access token de curta duração | `BASE` | ≤ 15 min | Sim |
| `AUTH-018` | Refresh token rotativo com detecção de reuso | `BASE` | Reuso revoga a família | Sim |
| `AUTH-019` | Cookie de sessão `httpOnly`, `Secure`, `SameSite` | `BASE` | Flags presentes | Sim |
| `AUTH-020` | Rate limit no login por IP e por conta | `BASE` | 429 após limite | Sim |
| `AUTH-021` | Mensagem de falha de login genérica | `BASE` | Sem distinção de causa | Sim |
| `AUTH-022` | Backoff progressivo após falhas | `BASE` | Atraso crescente | Sim |
| `AUTH-023` | ID de sessão regenerado no login | `BASE` | Sem fixação de sessão | Sim |
| `AUTH-024` | Expiração por inatividade | `BASE` | Configurada e testada | Sim |
| `AUTH-025` | Listagem e encerramento de sessões ativas | `SAAS` | Tela `/account/sessions` | Não |
| `AUTH-026` | MFA via TOTP disponível | `SAAS` | Ativação e verificação funcionando | Sim |
| `AUTH-027` | MFA obrigatório para administradores | `FIN` | Login admin exige segundo fator | Sim |
| `AUTH-028` | Códigos de recuperação de MFA hasheados e de uso único | `FIN` | Verificado no código | Sim |
| `AUTH-029` | Eventos de autenticação registrados em log de segurança | `BASE` | Login, falha, logout, reset, MFA | Sim |
| `AUTH-030` | Nenhum dado sensível de autenticação em log | `BASE` | Sem senha ou token nos logs | Sim |

## 08 — Autorização

Fonte: [`standard/08-AUTORIZACAO.md`](../standard/08-AUTORIZACAO.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `AUTZ-001` | Toda rota protegida verifica autenticação no servidor | `BASE` | Teste com token ausente retorna 401 | Sim |
| `AUTZ-002` | Deny by default — rota sem regra é negada | `BASE` | Teste automatizado varre rotas sem guard | Sim |
| `AUTZ-003` | Verificação por permissão, não por papel espalhado | `BASE` | Sem `role === 'admin'` no código de negócio | Sim |
| `AUTZ-004` | Ownership verificado em todo acesso a recurso | `BASE` | Teste de IDOR retorna 404 | Sim |
| `AUTZ-005` | Recurso de outro escopo responde 404, não 403 | `BASE` | Verificado em teste | Sim |
| `AUTZ-006` | `tenant_id` obtido da sessão, nunca do cliente | `SAAS` | Payload com tenant é ignorado/rejeitado | Sim |
| `AUTZ-007` | Filtro de tenant aplicado em camada única | `SAAS` | Middleware/RLS, não por endpoint | Sim |
| `AUTZ-008` | Escalada de privilégio impossível por payload | `BASE` | `role`/`permissions` rejeitados na entrada | Sim |
| `AUTZ-009` | Operações em lote verificam cada item | `BASE` | Teste com item de outro escopo falha a operação | Sim |
| `AUTZ-010` | Exportações e relatórios respeitam o escopo | `BASE` | Teste de escopo em relatório | Sim |
| `AUTZ-011` | Matriz de papéis e permissões documentada | `BASE` | `.ai/BUSINESS-RULES.md` ou doc dedicado | Não |
| `AUTZ-012` | Frontend replica permissões apenas como UX | `BASE` | Remoção da regra no cliente não libera a ação | Sim |
| `AUTZ-013` | Permissões carregadas da sessão do servidor | `BASE` | Sem permissões hardcoded no cliente | Sim |
| `AUTZ-014` | Tela de "sem permissão" tratada | `BASE` | 403 não exibe erro cru | Não |
| `AUTZ-015` | Mudança de papel/permissão registrada em auditoria | `SAAS` | Evento no audit log | Sim |
| `AUTZ-016` | Mudança de permissão reflete na sessão ativa | `SAAS` | Revalidação ou revogação de sessão | Não |
| `AUTZ-017` | Testes automatizados de autorização por papel | `BASE` | Suíte cobre acesso permitido e negado | Sim |
| `AUTZ-018` | Segregação de funções em operações críticas | `FIN` | Quem cria não aprova | Não |
| `AUTZ-019` | Acesso administrativo restrito e registrado | `FIN` | Log de toda ação administrativa | Sim |
| `AUTZ-020` | Endpoints internos/admin não expostos publicamente | `BASE` | Rede/rota restrita | Sim |

## 09 — Segurança

Fonte: [`standard/09-SEGURANCA.md`](../standard/09-SEGURANCA.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `SEC-001` | HTTPS obrigatório com HSTS | `BASE` | Header presente, HTTP redireciona | Sim |
| `SEC-002` | Headers de segurança configurados | `BASE` | CSP, nosniff, frame-options, referrer-policy | Sim |
| `SEC-003` | CSP sem `unsafe-inline`/`unsafe-eval` em produção | `REC` | Política verificada | Sim |
| `SEC-004` | Queries parametrizadas — sem concatenação de entrada | `BASE` | SAST limpo | Sim |
| `SEC-005` | Saída escapada por padrão contra XSS | `BASE` | Sem render de HTML cru não sanitizado | Sim |
| `SEC-006` | Proteção CSRF quando há cookie de sessão | `BASE` | Token ou `SameSite=Strict` + verificação de origem | Sim |
| `SEC-007` | CORS com origens explícitas | `BASE` | Sem `*` com credenciais | Sim |
| `SEC-008` | Rate limiting global e por endpoint sensível | `BASE` | 429 configurado | Sim |
| `SEC-009` | Nenhum segredo no repositório | `BASE` | Gitleaks limpo, inclusive no histórico | Sim |
| `SEC-010` | Segredos em cofre/env, com rotação definida | `BASE` | Documentado e aplicado | Não |
| `SEC-011` | Scan de segredos no CI | `BASE` | Job obrigatório | Sim |
| `SEC-012` | SAST executado no CI | `BASE` | Semgrep/CodeQL com falha bloqueante | Sim |
| `SEC-013` | Auditoria de dependências no CI | `BASE` | Crítico/alto bloqueia deploy | Sim |
| `SEC-014` | Lockfile commitado | `BASE` | Presente no repositório | Sim |
| `SEC-015` | Proteção contra SSRF em requisições derivadas de entrada | `BASE` | Lista branca + bloqueio de IP interno | Sim |
| `SEC-016` | Proteção contra path traversal | `BASE` | Caminho normalizado e validado | Sim |
| `SEC-017` | Upload validado por tipo real e tamanho | `BASE` | Magic bytes + limite | Sim |
| `SEC-018` | Arquivos armazenados fora do webroot, sem execução | `BASE` | Verificado na infraestrutura | Sim |
| `SEC-019` | Download por URL assinada com expiração | `BASE` | Sem caminho público previsível | Sim |
| `SEC-020` | Servidor não expõe versão/tecnologia | `BASE` | Sem `X-Powered-By` | Sim |
| `SEC-021` | Erros não vazam informação técnica | `BASE` | Resposta genérica em 500 | Sim |
| `SEC-022` | Dados pessoais sensíveis criptografados em repouso | `SAAS` | Colunas cifradas | Não |
| `SEC-023` | Dado sensível nunca é logado | `BASE` | Redação automática no logger | Sim |
| `SEC-024` | Mascaramento de dado sensível na interface | `SAAS` | CPF/cartão mascarados | Não |
| `SEC-025` | Base legal e finalidade documentadas (LGPD) | `SAAS` | Registro de tratamento | Não |
| `SEC-026` | Titular pode acessar, corrigir e excluir dados | `SAAS` | Fluxo implementado | Não |
| `SEC-027` | Política de retenção com expurgo automatizado | `SAAS` | Job de expurgo ativo | Sim |
| `SEC-028` | Modelagem de ameaça em feature sensível | `FIN` | Documento no PR | Não |
| `SEC-029` | Plano de resposta a incidente documentado | `FIN` | Runbook existente | Não |
| `SEC-030` | Detecção de comportamento anômalo com alerta | `FIN` | Alertas configurados | Não |
| `SEC-031` | Antivírus em arquivo compartilhado entre usuários | `FIN` | Varredura no upload | Sim |
| `SEC-032` | Revisão de segurança antes do deploy | `BASE` | Checklist da DoD aprovado | Não |

## 10 — Observabilidade: Logs, Auditoria e Erros

Fonte: [`standard/10-OBSERVABILIDADE.md`](../standard/10-OBSERVABILIDADE.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `OBS-001` | Logs estruturados em JSON | `BASE` | Sem `console.log` em produção | Sim |
| `OBS-002` | `request_id` propagado ponta a ponta | `BASE` | Presente em log e resposta de erro | Sim |
| `OBS-003` | Níveis de log usados corretamente | `BASE` | `debug` desligado em produção | Sim |
| `OBS-004` | Redação automática de dados sensíveis no logger | `BASE` | Senha/token/CPF nunca aparecem | Sim |
| `OBS-005` | Erro logado com stack trace e contexto | `BASE` | Reproduzível a partir do log | Não |
| `OBS-006` | Rastreador de erros configurado | `BASE` | Sentry (ou equivalente) recebendo eventos | Sim |
| `OBS-007` | Mensagem de erro ao usuário em português e acionável | `BASE` | Sem detalhe técnico | Não |
| `OBS-008` | `request_id` exibido ao usuário em erro inesperado | `BASE` | Código presente na tela | Não |
| `OBS-009` | Tabela de auditoria append-only | `SAAS` | Sem update/delete permitidos | Sim |
| `OBS-010` | Auditoria registra ator, ação, entidade, antes/depois, IP e data | `SAAS` | Campos presentes | Sim |
| `OBS-011` | Operações de negócio relevantes auditadas | `SAAS` | Create/update/delete/aprovação cobertos | Não |
| `OBS-012` | Mudanças de permissão auditadas | `SAAS` | Evento registrado | Sim |
| `OBS-013` | Exportação de dados auditada | `SAAS` | Evento registrado | Sim |
| `OBS-014` | Falha de auditoria cancela operação crítica | `FIN` | Transação revertida | Sim |
| `OBS-015` | Auditoria consultável na interface com filtros | `SAAS` | Tela com filtro por usuário/entidade/período | Não |
| `OBS-016` | Dado sensível mascarado no registro de auditoria | `SAAS` | Verificado | Sim |
| `OBS-017` | Retenção de auditoria definida e cumprida | `FIN` | Política documentada | Não |
| `OBS-018` | Métricas de requisição, erro e latência coletadas | `BASE` | Dashboard disponível | Sim |
| `OBS-019` | Healthcheck monitorado externamente | `BASE` | Uptime check ativo | Sim |
| `OBS-020` | Alertas configurados para erro, latência e fila | `BASE` | Notificação chega a um canal com dono | Sim |
| `OBS-021` | Todo alerta tem dono e runbook | `REC` | Documentado | Não |
| `OBS-022` | Logs centralizados e pesquisáveis | `REC` | Consulta por `request_id` funciona | Sim |
| `OBS-023` | Retenção de logs definida | `BASE` | 30–90 dias configurados | Sim |

## 11 — UX

Fonte: [`standard/11-UX.md`](../standard/11-UX.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `UX-001` | Ação destrutiva exige confirmação | `BASE` | AlertDialog antes de excluir | Não |
| `UX-002` | Confirmação informa o impacto | `BASE` | Lista de registros afetados | Não |
| `UX-003` | Ação crítica irreversível exige digitação de confirmação | `FIN` | Campo de confirmação | Não |
| `UX-004` | Desfazer oferecido em ação reversível | `REC` | Toast com "Desfazer" | Não |
| `UX-005` | Botão destrutivo visualmente distinto e não primário | `BASE` | Verificado no design system | Não |
| `UX-006` | Feedback visível em até 100ms de qualquer ação | `BASE` | Estado de carregamento imediato | Não |
| `UX-007` | Sucesso sempre confirmado visualmente | `BASE` | Toast ou mudança de estado | Não |
| `UX-008` | Operação acima de 10s processada em background com notificação | `BASE` | Fila + aviso ao concluir | Não |
| `UX-009` | Mensagens em português, claras e acionáveis | `BASE` | Sem jargão ou código técnico | Não |
| `UX-010` | Estado da tela refletido na URL (filtros, página, busca) | `BASE` | URL compartilhável reproduz a tela | Não |
| `UX-011` | Botão voltar do navegador funciona | `BASE` | Sem quebra de navegação | Não |
| `UX-012` | Usuário sempre sabe onde está | `BASE` | Título/breadcrumb/menu ativo | Não |
| `UX-013` | Nenhuma tela sem saída | `BASE` | Erro/vazio/403 oferecem ação | Não |
| `UX-014` | Erro de formulário preserva os dados digitados | `BASE` | Valores mantidos | Não |
| `UX-015` | Campos obrigatórios sinalizados | `BASE` | Marcação visual | Não |
| `UX-016` | Ordem e posição de botões consistentes no sistema | `BASE` | Primário à direita em todas as telas | Não |
| `UX-017` | Formulário longo com etapas ou rascunho | `REC` | Progresso visível | Não |
| `UX-018` | Listagem exibe contagem de resultados | `BASE` | Total visível | Não |
| `UX-019` | Filtros ativos visíveis e removíveis | `BASE` | Chips ou "Limpar filtros" | Não |
| `UX-020` | Seleção múltipla indica quantidade e ações disponíveis | `REC` | Barra de seleção | Não |
| `UX-021` | Aviso antes da expiração de sessão | `SAAS` | Modal com opção de continuar | Não |
| `UX-022` | Alvos de toque com no mínimo 44×44px | `BASE` | Verificado em mobile | Parcial |
| `UX-023` | Tabelas adaptadas a telas pequenas | `BASE` | Cartão ou rolagem indicada | Não |
| `UX-024` | Padrões de UX documentados em `.ai/UX-PATTERNS.md` | `BASE` | Arquivo existe e é seguido | Não |

## 12 — Acessibilidade

Fonte: [`standard/12-ACESSIBILIDADE.md`](../standard/12-ACESSIBILIDADE.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `A11Y-001` | HTML semântico para controles e estrutura | `BASE` | Sem `div` clicável como botão | Sim |
| `A11Y-002` | Toda funcionalidade acessível por teclado | `BASE` | Navegação completa sem mouse | Parcial |
| `A11Y-003` | Foco sempre visível com contraste adequado | `BASE` | Sem `outline: none` sem substituto | Sim |
| `A11Y-004` | Ordem de tabulação igual à ordem visual | `BASE` | Verificado manualmente | Não |
| `A11Y-005` | Modal com foco preso, `ESC` fecha e devolve o foco | `BASE` | Verificado no componente Dialog | Não |
| `A11Y-006` | Todo campo com label associado | `BASE` | Sem placeholder como label | Sim |
| `A11Y-007` | Erro de campo associado e anunciado | `BASE` | `aria-describedby` + `aria-invalid` | Sim |
| `A11Y-008` | Contraste de texto ≥ 4.5:1 | `BASE` | Auditoria automática limpa | Sim |
| `A11Y-009` | Contraste de componentes e foco ≥ 3:1 | `BASE` | Auditoria automática limpa | Sim |
| `A11Y-010` | Informação nunca transmitida só por cor | `BASE` | Texto ou ícone acompanham | Não |
| `A11Y-011` | Imagens com `alt` apropriado | `BASE` | Informativa descreve, decorativa vazia | Sim |
| `A11Y-012` | Botão de ícone com `aria-label` | `BASE` | Verificado por lint | Sim |
| `A11Y-013` | Hierarquia de títulos correta | `BASE` | Um `h1`, sem pular níveis | Sim |
| `A11Y-014` | Mensagens dinâmicas em região `aria-live` | `BASE` | Toasts anunciados | Não |
| `A11Y-015` | Link "pular para o conteúdo" | `REC` | Presente e funcional | Sim |
| `A11Y-016` | Interface utilizável com zoom de 200% | `BASE` | Sem perda de conteúdo ou função | Não |
| `A11Y-017` | `prefers-reduced-motion` respeitado | `REC` | Animações reduzidas | Sim |
| `A11Y-018` | Idioma da página declarado (`lang="pt-BR"`) | `BASE` | Atributo presente | Sim |
| `A11Y-019` | Auditoria automatizada no CI | `REC` | axe/Lighthouse sem violação crítica | Sim |
| `A11Y-020` | Tabelas de dados com cabeçalhos associados | `BASE` | `<th scope>` correto | Sim |

## 13 — Performance

Fonte: [`standard/13-PERFORMANCE.md`](../standard/13-PERFORMANCE.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `PERF-001` | SLOs declarados no projeto | `BASE` | `.ai/PROJECT-CONTEXT.md` | Não |
| `PERF-002` | LCP < 2,5s nas páginas principais | `BASE` | Lighthouse/RUM | Sim |
| `PERF-003` | CLS < 0,1 | `BASE` | Lighthouse/RUM | Sim |
| `PERF-004` | INP < 200ms | `BASE` | RUM | Sim |
| `PERF-005` | p95 de leitura dentro do SLO | `BASE` | Medido em produção | Sim |
| `PERF-006` | Paginação obrigatória em toda listagem | `BASE` | Sem coleção ilimitada | Sim |
| `PERF-007` | Ausência de N+1 em listagens | `BASE` | Contagem de queries em teste | Sim |
| `PERF-008` | Índices presentes em filtros e joins | `BASE` | `EXPLAIN` sem seq scan relevante | Parcial |
| `PERF-009` | Apenas campos necessários trafegados | `BASE` | DTOs enxutos | Não |
| `PERF-010` | Operações longas em fila | `BASE` | Nada acima de 10s síncrono | Não |
| `PERF-011` | Cache com invalidação explícita | `REC` | Estratégia documentada | Não |
| `PERF-012` | Imagens otimizadas com dimensões | `BASE` | `next/image` | Sim |
| `PERF-013` | Carregamento sob demanda em rotas pesadas | `REC` | Code splitting aplicado | Sim |
| `PERF-014` | Orçamento de bundle definido e monitorado | `REC` | Falha de CI ao estourar | Sim |
| `PERF-015` | Debounce em campos de busca | `BASE` | ~300ms | Não |
| `PERF-016` | Timeout em toda chamada externa | `BASE` | Sem chamada sem timeout | Sim |
| `PERF-017` | Pool de conexões configurado com limite | `BASE` | Configuração explícita | Sim |
| `PERF-018` | Compressão de resposta habilitada | `BASE` | gzip/brotli ativos | Sim |
| `PERF-019` | Assets estáticos com cache de longa duração | `BASE` | Headers corretos + hash no nome | Sim |
| `PERF-020` | Teste de carga antes de produção | `FIN` | Relatório registrado | Não |
| `PERF-021` | Monitoramento contínuo de latência | `BASE` | Dashboard + alerta | Sim |
| `PERF-022` | Regressão de performance detectada no CI | `REC` | Lighthouse CI ou benchmark | Sim |

## 14 — Testes

Fonte: [`standard/14-TESTES.md`](../standard/14-TESTES.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `TST-001` | Suíte de testes executável por comando único | `BASE` | `npm test` funciona do zero | Sim |
| `TST-002` | Testes rodam no CI e bloqueiam merge | `BASE` | Job obrigatório | Sim |
| `TST-003` | Regra de negócio com teste unitário | `BASE` | Cobertura ≥ 90% em cálculo | Sim |
| `TST-004` | Endpoints com teste de integração | `BASE` | Sucesso e erro cobertos | Sim |
| `TST-005` | Todo endpoint com teste de autorização negada | `BASE` | 401/403/404 verificados | Sim |
| `TST-006` | Fluxos de autenticação testados | `BASE` | Login, reset, refresh, logout | Sim |
| `TST-007` | Isolamento de tenant testado | `SAAS` | Acesso cruzado retorna 404 | Sim |
| `TST-008` | Fluxos críticos com teste E2E | `BASE` | Pelo menos os caminhos de receita | Sim |
| `TST-009` | Todo bug corrigido ganha teste de regressão | `BASE` | Teste falha sem o fix | Não |
| `TST-010` | Validações de entrada testadas | `BASE` | Casos inválidos cobertos | Sim |
| `TST-011` | Casos de borda cobertos | `BASE` | Vazio, nulo, limite, acentuação | Não |
| `TST-012` | Testes determinísticos, sem flakiness | `BASE` | Sem falha intermitente na suíte | Não |
| `TST-013` | Sem dependência de ordem entre testes | `BASE` | Execução aleatória passa | Sim |
| `TST-014` | Sem chamada a serviço externo real | `BASE` | Fronteiras mockadas | Sim |
| `TST-015` | Relógio injetável, sem dependência de data real | `BASE` | Testes estáveis em qualquer dia | Não |
| `TST-016` | Banco de teste isolado e limpo entre execuções | `BASE` | Container/schema dedicado | Sim |
| `TST-017` | Cobertura mínima do projeto atingida | `BASE` | ≥ 70% global | Sim |
| `TST-018` | Teste desabilitado tem motivo documentado | `BASE` | Comentário obrigatório | Sim |
| `TST-019` | Seletores E2E estáveis (`data-testid`) | `BASE` | Sem seletor por classe de estilo | Sim |
| `TST-020` | Sem espera fixa em testes assíncronos | `BASE` | Espera por condição | Sim |
| `TST-021` | Testes de migração de banco | `REC` | Migration up/down verificada | Sim |
| `TST-022` | Teste de contrato da API | `REC` | Diff de OpenAPI validado | Sim |

## 15 — DevOps e CI/CD

Fonte: [`standard/15-DEVOPS.md`](../standard/15-DEVOPS.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `OPS-001` | Repositório Git com branch principal protegida | `BASE` | Sem push direto ou force | Sim |
| `OPS-002` | Conventional Commits | `BASE` | Validado por hook/CI | Sim |
| `OPS-003` | Pipeline de CI executando em todo PR | `BASE` | Workflow configurado | Sim |
| `OPS-004` | Lint bloqueante no CI | `BASE` | Falha impede merge | Sim |
| `OPS-005` | Type check bloqueante no CI | `BASE` | Falha impede merge | Sim |
| `OPS-006` | Testes bloqueantes no CI | `BASE` | Falha impede merge | Sim |
| `OPS-007` | Scan de segredos no CI | `BASE` | Gitleaks obrigatório | Sim |
| `OPS-008` | SAST no CI com bloqueio de crítico/alto | `BASE` | Semgrep/CodeQL | Sim |
| `OPS-009` | Auditoria de dependências no CI | `BASE` | Bloqueia crítico/alto | Sim |
| `OPS-010` | Build validado no CI antes do merge | `BASE` | Artefato gerado com sucesso | Sim |
| `OPS-011` | Ambientes dev, staging e produção separados | `BASE` | Três ambientes ativos | Não |
| `OPS-012` | Staging com paridade de configuração com produção | `BASE` | Mesma imagem, config diferente | Não |
| `OPS-013` | Dados reais nunca em dev/staging sem anonimização | `BASE` | Processo de anonimização | Não |
| `OPS-014` | Deploy automatizado e reproduzível | `BASE` | Sem passo manual não documentado | Sim |
| `OPS-015` | Migrations executadas automaticamente no deploy | `BASE` | Com trava de concorrência | Sim |
| `OPS-016` | Deploy sem downtime | `BASE` | Rolling ou blue-green | Não |
| `OPS-017` | Rollback documentado e testado | `BASE` | Ensaio registrado, alvo < 10 min | Não |
| `OPS-018` | Smoke test pós-deploy | `BASE` | Falha dispara rollback | Sim |
| `OPS-019` | Versão em produção rastreável até o commit | `BASE` | Endpoint/label de versão | Sim |
| `OPS-020` | Segredos fora da imagem e do repositório | `BASE` | Injetados em runtime | Sim |
| `OPS-021` | Container roda como usuário não-root | `BASE` | Dockerfile com `USER` | Sim |
| `OPS-022` | Imagem base com versão fixada | `BASE` | Sem `:latest` | Sim |
| `OPS-023` | Scan de vulnerabilidade da imagem | `REC` | Trivy/Grype no CI | Sim |
| `OPS-024` | PR com descrição de mudança, teste e risco | `BASE` | Template de PR | Sim |
| `OPS-025` | Code review obrigatório antes do merge | `BASE` | Aprovação exigida | Sim |
| `OPS-026` | Feature flag para liberação desacoplada | `REC` | Mecanismo disponível | Não |
| `OPS-027` | Ambiente reproduzível com um comando | `BASE` | `docker compose up` funciona | Sim |

## 16 — Infraestrutura, Backup e Continuidade

Fonte: [`standard/16-INFRAESTRUTURA.md`](../standard/16-INFRAESTRUTURA.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `INF-001` | Checklist de fundação preenchido antes do desenvolvimento | `BASE` | Registrado em `.ai/PROJECT-CONTEXT.md` | Não |
| `INF-002` | Três ambientes provisionados | `BASE` | Dev, staging, produção | Não |
| `INF-003` | TLS com renovação automática | `BASE` | Certificado válido, renovação testada | Sim |
| `INF-004` | Alerta de expiração de certificado | `BASE` | 14 dias de antecedência | Sim |
| `INF-005` | SPF, DKIM e DMARC configurados | `BASE` | Verificado por ferramenta de DNS | Sim |
| `INF-006` | Backup automático do banco | `BASE` | Diário no mínimo | Sim |
| `INF-007` | Backup de arquivos e configuração | `BASE` | Incluídos na rotina | Sim |
| `INF-008` | Backup criptografado | `BASE` | Em repouso e trânsito | Sim |
| `INF-009` | Cópia de backup fora do ambiente principal | `BASE` | Região/conta distinta | Não |
| `INF-010` | Retenção de backup definida e aplicada | `BASE` | 7/4/12 ou política própria | Sim |
| `INF-011` | Restauração testada trimestralmente | `BASE` | Registro do teste | Não |
| `INF-012` | RPO e RTO declarados | `BASE` | Documentados | Não |
| `INF-013` | Plano de recuperação de desastre documentado | `SAAS` | Runbook existente | Não |
| `INF-014` | Plano de DR testado anualmente | `FIN` | Registro do exercício | Não |
| `INF-015` | Banco de dados sem exposição pública | `BASE` | Sem porta aberta na internet | Sim |
| `INF-016` | Acesso administrativo por VPN/bastion com MFA | `BASE` | Verificado | Não |
| `INF-017` | Credencial da aplicação com menor privilégio | `BASE` | Sem superusuário | Não |
| `INF-018` | Firewall com negação padrão | `BASE` | Regras explícitas de liberação | Sim |
| `INF-019` | Revisão periódica de acessos | `SAAS` | Trimestral, registrada | Não |
| `INF-020` | Revogação de acesso no desligamento | `BASE` | Mesmo dia | Não |
| `INF-021` | PITR habilitado | `FIN` | Recuperação por ponto no tempo | Sim |
| `INF-022` | Monitoramento de disco, memória e conexões | `BASE` | Alertas configurados | Sim |
| `INF-023` | Infraestrutura descrita como código ou documentada | `REC` | IaC ou runbook de provisionamento | Não |
| `INF-024` | Custo de infraestrutura monitorado | `REC` | Alerta de anomalia de custo | Sim |

## 17 — Documentação e Contexto

Fonte: [`standard/17-DOCUMENTACAO.md`](../standard/17-DOCUMENTACAO.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `DOC-001` | Diretório `.ai/` presente e populado | `BASE` | Arquivos principais existem | Sim |
| `DOC-002` | `PROJECT-CONTEXT.md` com perfis e versão do EOS | `BASE` | Perfis declarados | Sim |
| `DOC-003` | `TECH-STACK.md` com versões e comandos | `BASE` | Reflete o projeto real | Não |
| `DOC-004` | `ARCHITECTURE.md` reflete a estrutura real | `BASE` | Árvore e camadas descritas | Não |
| `DOC-005` | `DESIGN-SYSTEM.md` com tokens e componentes | `BASE` | Atualizado a cada componente novo | Não |
| `DOC-006` | `COMPONENTS.md` como inventário consultável | `BASE` | Todos os componentes de `ui/` listados | Não |
| `DOC-007` | `BUSINESS-RULES.md` com regras e permissões | `BASE` | Matriz de papéis presente | Não |
| `DOC-008` | `API-CONVENTIONS.md` com contratos e códigos de erro | `BASE` | Catálogo completo | Não |
| `DOC-009` | ADRs numerados para decisões estruturais | `BASE` | `DECISIONS/` com registros | Não |
| `DOC-010` | ADR revisto marcado como `Superseded`, nunca apagado | `BASE` | Histórico preservado | Não |
| `DOC-011` | Toda exceção ao EOS registrada em ADR | `BASE` | Rastreável | Não |
| `DOC-012` | README permite rodar o projeto do zero | `BASE` | Novo dev sobe em < 15 min | Não |
| `DOC-013` | README documenta testes e deploy | `BASE` | Comandos presentes | Não |
| `DOC-014` | Contexto atualizado na mesma entrega que o código | `BASE` | Verificado em code review | Não |
| `DOC-015` | OpenAPI publicada e atualizada | `BASE` | Gerada do código | Sim |
| `DOC-016` | Variáveis de ambiente documentadas | `BASE` | `.env.example` completo | Sim |
| `DOC-017` | Runbooks de operação para incidentes comuns | `SAAS` | Passos, dono e escalonamento | Não |
| `DOC-018` | Feature Contract para funcionalidade relevante | `BASE` | `FEATURES/` com o contrato | Não |
| `DOC-019` | Divergência entre doc e código corrigida ao ser notada | `BASE` | Sem doc sabidamente falso | Não |
| `DOC-020` | Documentação em português | `BASE` | Padrão do time | Não |

## 18 — Definition of Done

Fonte: [`standard/18-DEFINITION-OF-DONE.md`](../standard/18-DEFINITION-OF-DONE.md)

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| `DOD-001` | Perfis de conformidade declarados no projeto | `BASE` | `.ai/PROJECT-CONTEXT.md` | Sim |
| `DOD-002` | DoD executada antes de declarar feature pronta | `BASE` | Resultado registrado no PR | Não |
| `DOD-003` | Nenhum item obrigatório em aberto no merge | `BASE` | Verificado em review | Não |
| `DOD-004` | Pendência aceita registrada com prazo e responsável | `BASE` | Issue criada | Não |
| `DOD-005` | Checklist de sistema cumprido antes do 1º deploy | `BASE` | Registro de homologação | Não |
| `DOD-006` | Homologação humana antes de produção | `BASE` | Aprovação registrada | Não |
| `DOD-007` | Relatório de DoD honesto, com pendências visíveis | `BASE` | Sem "pronto" com item vermelho | Não |
