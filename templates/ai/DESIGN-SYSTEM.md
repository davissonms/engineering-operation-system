# Design System

> **Regra número um:** antes de criar qualquer componente, procure aqui.
> Diferença visual é **variante**, não componente novo.

## Tokens

Definidos em: `<caminho — ex: src/app/globals.css / tailwind.config.ts>`

### Cores

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `primary` | | | Ação principal |
| `secondary` | | | Ação secundária |
| `destructive` | | | Exclusão, erro |
| `success` | | | Confirmação |
| `warning` | | | Atenção |
| `muted` | | | Texto e fundo secundários |
| `background` / `foreground` | | | Base |
| `border` / `ring` | | | Bordas e foco |

### Escalas

```
Espaçamento   4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
Raio          sm · md · lg · full
Tipografia    xs · sm · base · lg · xl · 2xl · 3xl · 4xl
Sombra        sm · md · lg
Breakpoints   sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536
Motion        fast 150ms · base 200ms · slow 300ms
Z-index       dropdown · sticky · modal · popover · toast
```

**Proibido:** valor de cor, espaçamento ou fonte escrito solto no componente.
Se o token não existe, adicione o token.

## Componentes disponíveis

Atualize esta tabela **na mesma entrega** em que criar um componente.

| Componente | Caminho | Variantes | Notas |
| --- | --- | --- | --- |
| Button | `components/ui/button.tsx` | default, secondary, destructive, outline, ghost, link | tamanhos sm/md/lg |
| Input | | | |
| Select | | | |
| Dialog | | | |
| AlertDialog | | | ação destrutiva |
| DataTable | | | **toda** listagem tabular |
| Form / FormField | | | **todo** formulário |
| EmptyState | | | inicial e de busca |
| ErrorState | | | com retry |
| Skeleton | | | loading |
| Toast | | | notificações |
| Pagination | | | |
| PageHeader | | | |

## Regras obrigatórias

1. Toda listagem tabular usa **DataTable**. Não se escreve `<table>` em página.
2. Todo formulário usa **Form/FormField**.
3. Ação destrutiva usa **AlertDialog** com impacto informado.
4. Notificação transitória usa **Toast**. `alert()` e `confirm()` são proibidos.
5. Estados vazio/erro/loading usam os componentes padrão.
6. Componente em `components/ui/` é agnóstico de domínio.
7. Componente que aparece em 2+ telas pertence ao design system.
8. Ícones vêm de uma única biblioteca.

## Arquétipos de página

| Arquétipo | Telas que usam | Referência |
| --- | --- | --- |
| Listagem | | `app/(dashboard)/____/page.tsx` |
| Detalhe | | |
| Formulário | | |
| Dashboard | | |
| Configurações | | |

Antes de desenhar uma tela nova, identifique o arquétipo. Quase sempre é um deles.

## Vocabulário da interface

| Conceito | Termo oficial | Nunca use |
| --- | --- | --- |
| Salvar | "Salvar" | "Gravar", "Confirmar" |
| Excluir | "Excluir" | "Deletar", "Remover", "Apagar" |
| Cancelar | "Cancelar" | "Voltar", "Sair" |
| Data | `17/08/2026 10:42` | formatos ISO na interface |
| Moeda | `R$ 2.650,00` | `2650.00` |

## Status e cores

| Status | Cor | Rótulo |
| --- | --- | --- |
| Ativo | success | "Ativo" |
| Inativo | muted | "Inativo" |
| Pendente | warning | "Pendente" |
| Cancelado | destructive | "Cancelado" |

Status nunca é comunicado **apenas** por cor.
