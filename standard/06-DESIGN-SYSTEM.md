# 06 — Design System

Prefixo de requisitos: `DS`

Este é o documento que impede o projeto de acumular `Button.tsx`,
`PrimaryButton.tsx`, `ActionButton.tsx`, `SubmitButton.tsx` e `CustomButton.tsx`
resolvendo o mesmo problema.

---

## A regra central

> **Antes de criar qualquer componente, página, fluxo ou padrão visual, procure
> se já existe implementação equivalente no projeto.**

E o corolário que a IA precisa ouvir explicitamente:

> Diferença visual é **variante**, não componente novo.

```
Preciso de um botão vermelho de exclusão.
        ↓
Existe Button?  SIM
        ↓
Button tem variant="destructive"?
        ↓
   SIM → use                 NÃO → adicione a variante ao Button
                                    (não crie DeleteButton)
```

## Tokens

Nenhum valor visual é escrito solto no código. Tudo vem de token.

```
Cor          primary, secondary, destructive, success, warning, muted,
             background, foreground, border, ring
Tipografia   família, escala (xs → 4xl), peso, altura de linha
Espaçamento  escala fixa (4, 8, 12, 16, 24, 32, 48, 64)
Raio         sm, md, lg, full
Sombra       sm, md, lg
Borda        largura e cor padrão
Breakpoints  sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536
Motion       duração (fast 150ms, base 200ms, slow 300ms) e easing
Z-index      escala nomeada (dropdown, sticky, modal, popover, toast)
```

Proibido: `#3b82f6`, `margin-top: 13px`, `font-size: 15px` no meio de um
componente. Se o token não existe, a decisão é **adicionar o token**, não
contornar.

Tema claro e escuro são definidos nos tokens, nunca por condicional espalhada.

## Inventário mínimo de componentes

Todo projeto tem, no mínimo:

```
Primitivos      Button · Input · Textarea · Select · Checkbox · Radio · Switch
                Label · Badge · Avatar · Separator · Skeleton · Spinner

Composição      Card · Modal/Dialog · Drawer/Sheet · Tabs · Accordion
                Dropdown · Popover · Tooltip · Toast · AlertDialog

Dados           DataTable · Pagination · EmptyState · ErrorState · LoadingState

Formulário      Form · FormField · FormError · DatePicker · Combobox
                FileUpload · MaskedInput

Layout          PageHeader · PageContainer · Sidebar · Topbar · Breadcrumb
```

Regras duras:

- Toda listagem tabular usa **DataTable**. Não se escreve `<table>` na página.
- Todo formulário usa **Form/FormField**. Não se gerencia estado de formulário
  na mão em cada tela.
- Todo modal usa **Dialog**. Ação destrutiva usa **AlertDialog**.
- Toda notificação transitória usa **Toast**. Não existe `alert()`.
- Todo estado vazio usa **EmptyState**. Não se escreve `<p>Nada aqui</p>`.

## Anatomia padrão de uma página de listagem

Este arquétipo se repete: clientes, fornecedores, cotações, emissões, usuários.
A segunda listagem do sistema **não é** um novo design — é o mesmo arquétipo.

```
┌──────────────────────────────────────────────────┐
│ Clientes                        [+ Novo cliente] │  PageHeader
│                                                  │
│ [ 🔍 Buscar ]  [Filtros ▾]        [Exportar ▾]  │  Toolbar
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Nome        E-mail        Status      Ações  │ │  DataTable
│ ├──────────────────────────────────────────────┤ │
│ │ João        ...           Ativo         ⋮    │ │
│ │ Maria       ...           Ativo         ⋮    │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ 127 resultados            ← 1 2 3 4 5 →          │  Pagination
└──────────────────────────────────────────────────┘
```

Arquétipos reconhecidos: **listagem**, **detalhe**, **formulário de criação/edição**,
**wizard**, **dashboard**, **configurações**. Antes de desenhar uma tela nova,
identifique o arquétipo — quase sempre é um deles.

## Quando criar um componente novo

```
Existe equivalente?              → use
Existe com pequena diferença?    → adicione variante/prop
Aparece em 2+ telas?             → é componente do design system
Aparece em 1 tela só?            → componente local do domínio
É primitivo visual novo?         → vai para components/ui/ + documenta

Criou algo em components/ui/?
        ↓
Atualizar .ai/DESIGN-SYSTEM.md e .ai/COMPONENTS.md — na mesma entrega
```

Um componente só entra no design system quando é **genérico** (não conhece
domínio), **tokenizado**, **acessível** e **documentado**. `CustomerCard` não é
design system; `Card` é.

## Consistência de linguagem

- Rótulos em português, sem jargão técnico exposto ao usuário.
- Ações sempre com o mesmo verbo: "Salvar" (nunca "Gravar" numa tela e "Salvar"
  em outra), "Excluir" (nunca "Deletar"/"Remover" misturados).
- Datas no formato brasileiro na interface: `17/08/2026 10:42`.
- Moeda: `R$ 2.650,00`.
- Estados de entidade com vocabulário fixo e cor consistente por status.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| DS-001 | Design system existe e está documentado | BASE | `.ai/DESIGN-SYSTEM.md` + `components/ui/` | Não |
| DS-002 | Tokens definidos para cor, tipografia, espaçamento, raio, sombra, breakpoints, motion e z-index | BASE | Definidos em um único lugar | Sim |
| DS-003 | Nenhum valor visual arbitrário no código | BASE | Sem hex/px soltos fora dos tokens | Sim |
| DS-004 | Toda listagem tabular usa DataTable | BASE | Sem `<table>` escrito em página | Sim |
| DS-005 | Todo formulário usa o componente Form padrão | BASE | Sem gestão manual de formulário por tela | Parcial |
| DS-006 | Todo modal usa Dialog; destrutivo usa AlertDialog | BASE | Sem modal ad hoc | Sim |
| DS-007 | Notificações usam Toast; `alert()` proibido | BASE | Sem `alert`/`confirm` nativos | Sim |
| DS-008 | Estados vazio/erro/loading usam componentes padrão | BASE | EmptyState, ErrorState, Skeleton | Não |
| DS-009 | Nenhum componente duplicado com a mesma função | BASE | Auditoria de duplicidade limpa | Parcial |
| DS-010 | Variante em vez de novo componente para diferença visual | BASE | Verificado em code review | Não |
| DS-011 | Componente do design system é agnóstico de domínio | BASE | `components/ui/` não importa tipos de domínio | Sim |
| DS-012 | Novo componente reutilizável é documentado na mesma entrega | BASE | `.ai/COMPONENTS.md` atualizado | Não |
| DS-013 | Tema claro/escuro resolvido por tokens | REC | Sem condicional de tema espalhada | Sim |
| DS-014 | Arquétipos de página reutilizados | BASE | Listagens do sistema seguem o mesmo layout | Não |
| DS-015 | Vocabulário de ações e status consistente | BASE | Glossário em `.ai/UX-PATTERNS.md` | Não |
| DS-016 | Formatação brasileira de data e moeda na interface | BASE | `dd/mm/aaaa` e `R$ 0.000,00` | Sim |
| DS-017 | Ícones de uma única biblioteca | BASE | Sem mistura de conjuntos de ícones | Sim |
| DS-018 | Componentes do design system acessíveis por teclado | BASE | Foco visível, ordem lógica, ESC fecha overlays | Parcial |
