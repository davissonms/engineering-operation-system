# 05 — Frontend

Prefixo de requisitos: `FE`

Default: **Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui**.

---

## Os quatro estados

Toda tela que busca dado tem **quatro** estados projetados. Não um.

```
LOADING     "Carregando clientes..."       skeleton, nunca tela em branco
EMPTY       "Nenhum cliente cadastrado."   + ação primária para sair do vazio
ERROR       "Erro ao carregar clientes."   + botão Tentar novamente
SUCCESS     "127 clientes encontrados."    o conteúdo
```

E há uma distinção que quase todo sistema erra:

| Situação | Estado |
| --- | --- |
| Ainda não existe nenhum registro | **Empty inicial** — convida a criar |
| Existem registros, o filtro não achou | **Empty de busca** — convida a limpar o filtro |

São mensagens e ações diferentes. "Nenhum cliente cadastrado" com um filtro ativo
é mentira para o usuário.

## Formulários

Todo formulário trata, obrigatoriamente:

- validação no cliente **espelhando** a do servidor (nunca substituindo)
- erro por campo, próximo ao campo, com o campo marcado
- erro geral (falha de rede, 500) fora dos campos
- estado de envio com o botão desabilitado — **prevenção de duplo envio**
- feedback de sucesso
- foco no primeiro campo com erro após submissão inválida
- máscara e formatação (CPF, CNPJ, telefone, moeda, data) sem impedir colar
- confirmação antes de sair com alterações não salvas
- `label` real associado a cada campo (não placeholder no lugar de label)

## Dados e cache

- Busca de dados por camada dedicada (React Query/SWR ou Server Components) —
  nunca `fetch` solto dentro do JSX.
- Chave de cache estável e invalidação explícita após mutação.
- Mutação otimista só quando a reversão está implementada.
- Sem estado global para dado de servidor. Estado global é para sessão, tema e
  preferências.

## Performance

- Listagem sempre paginada — nunca "carrega tudo e filtra no cliente".
- Rota pesada com carregamento sob demanda (`dynamic import`).
- Imagem otimizada (`next/image`), com dimensão definida para evitar layout shift.
- Sem biblioteca pesada para problema pequeno (não importar uma lib de datas
  inteira para formatar uma data).
- Debounce em campo de busca (300ms como padrão).

## Estrutura de componente

- Um componente, uma responsabilidade. Acima de ~200 linhas, questione.
- Props tipadas explicitamente. Sem `any`, sem `props: any`.
- Sem lógica de negócio no componente — ela vive em hook ou service de `features/`.
- Sem valor de cor, espaçamento ou fonte fora dos tokens do design system.
- Componente de domínio nunca é importado por `components/ui/`.

## Segurança no cliente

- Nunca renderize HTML de terceiro sem sanitizar (`dangerouslySetInnerHTML` exige
  sanitização e justificativa).
- Token de acesso nunca em `localStorage` quando cookie `httpOnly` é possível.
- Nenhum segredo em variável `NEXT_PUBLIC_*` — tudo ali é público.
- Esconder botão não é segurança: a verificação real é do servidor.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| FE-001 | Estado de loading em toda busca de dados | BASE | Skeleton/indicador presente | Não |
| FE-002 | Estado vazio com ação primária | BASE | Mensagem + CTA | Não |
| FE-003 | Estado de erro com opção de tentar novamente | BASE | Mensagem + retry | Não |
| FE-004 | Empty inicial distinto de empty de busca | BASE | Mensagens e ações diferentes | Não |
| FE-005 | Validação de formulário com erro por campo | BASE | Erro exibido junto ao campo | Não |
| FE-006 | Erro geral exibido fora dos campos | BASE | Falha de rede/servidor visível | Não |
| FE-007 | Prevenção de duplo envio | BASE | Botão desabilitado durante submissão | Sim |
| FE-008 | Foco movido para o primeiro erro após submit | BASE | Verificado manualmente | Não |
| FE-009 | Aviso ao sair com alterações não salvas | REC | Confirmação exibida | Não |
| FE-010 | Máscara/formatação nos campos aplicáveis | BASE | CPF, CNPJ, telefone, moeda, data | Não |
| FE-011 | Busca de dados em camada dedicada | BASE | Sem `fetch` dentro de JSX | Sim |
| FE-012 | Invalidação de cache após mutação | BASE | Lista reflete a alteração sem reload manual | Não |
| FE-013 | Listagem paginada no servidor | BASE | Sem carregar coleção inteira no cliente | Sim |
| FE-014 | Sem valores de estilo fora dos tokens | BASE | Sem cor/espaçamento arbitrário | Sim |
| FE-015 | Props tipadas, sem `any` | BASE | Build strict sem erro | Sim |
| FE-016 | Sem lógica de negócio dentro de componente | BASE | Lógica em hook/service | Não |
| FE-017 | Imagens otimizadas e sem layout shift | BASE | `next/image` com dimensões | Sim |
| FE-018 | Carregamento sob demanda em rotas pesadas | REC | `dynamic import` aplicado | Não |
| FE-019 | Debounce em campo de busca | BASE | ~300ms | Não |
| FE-020 | HTML de terceiro sanitizado | BASE | Sem `dangerouslySetInnerHTML` cru | Sim |
| FE-021 | Nenhum segredo em variável pública | BASE | Scan de `NEXT_PUBLIC_*` | Sim |
| FE-022 | Token de sessão em cookie `httpOnly` quando possível | BASE | Sem token em `localStorage` | Sim |
| FE-023 | Interface responsiva de 320px a desktop | BASE | Sem scroll horizontal, sem sobreposição | Parcial |
| FE-024 | Página de erro e 404 personalizadas | BASE | `error.tsx` e `not-found.tsx` existem | Sim |
