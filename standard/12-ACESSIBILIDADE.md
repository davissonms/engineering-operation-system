# 12 — Acessibilidade

Prefixo de requisitos: `A11Y`
Base normativa: **WCAG 2.2 nível AA**

Meta: **AA** em sistemas internos e de cliente. Não é opcional — é requisito de
qualidade (ISO 25010) e, em muitos contratos, de conformidade.

---

## O teste de 5 minutos

Antes de considerar uma tela pronta:

1. Guarde o mouse. Chegue a todos os controles com `Tab` e execute com `Enter`/`Espaço`.
2. O foco está sempre **visível**? Perdeu o foco em algum ponto?
3. Abra um modal: o foco entrou nele, ficou preso dentro, `ESC` fecha e o foco
   volta para onde estava?
4. Aumente o zoom para 200%. Ainda dá para usar?
5. O texto tem contraste suficiente contra o fundo?

Se qualquer resposta for não, a tela não está pronta.

## Semântica

- HTML semântico primeiro: `<button>` para ação, `<a>` para navegação,
  `<nav>`, `<main>`, `<header>`, `<table>` para tabela de dados.
- `<div onClick>` não é botão. Não recebe foco, não responde a `Enter`, não é
  anunciado como controle.
- Um `<h1>` por página; hierarquia de títulos sem pular níveis.
- ARIA só quando o HTML nativo não resolve. ARIA errado é pior que ARIA ausente.

## Formulários

- Todo campo tem `<label>` associado (`for`/`id`). Placeholder **não** é label —
  ele some quando a pessoa digita.
- Erro associado ao campo por `aria-describedby` e anunciado (`role="alert"`).
- Campo com erro marcado com `aria-invalid`.
- Agrupamentos (radio, checkbox) em `<fieldset>` com `<legend>`.
- Erro nunca é comunicado só por cor.

## Contraste e cor

| Elemento | Mínimo |
| --- | --- |
| Texto normal | 4.5:1 |
| Texto grande (≥18.66px bold / ≥24px) | 3:1 |
| Componentes de interface e foco | 3:1 |

E: **cor nunca é o único portador de informação**. Status "Ativo/Inativo" precisa
de texto ou ícone, não só de bolinha verde e vermelha.

## Teclado

- Ordem de tabulação segue a ordem visual.
- Foco sempre visível, com contraste suficiente. `outline: none` sem substituto
  é falha grave.
- Sem armadilha de foco fora de modais.
- Link "Pular para o conteúdo" no início da página.
- Atalhos de teclado não conflitam com os do leitor de tela e do navegador.

## Conteúdo dinâmico

- Toast e mensagens de status em região `aria-live` apropriada
  (`polite` para informação, `assertive` para erro).
- Carregamento anunciado, não só visual.
- Mudança de rota move o foco para o início do conteúdo.

## Mídia e movimento

- Toda imagem informativa tem `alt` descritivo; decorativa tem `alt=""`.
- Ícone sozinho como botão tem `aria-label`.
- Respeitar `prefers-reduced-motion`.
- Nada que pisque mais de 3 vezes por segundo.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| A11Y-001 | HTML semântico para controles e estrutura | BASE | Sem `div` clicável como botão | Sim |
| A11Y-002 | Toda funcionalidade acessível por teclado | BASE | Navegação completa sem mouse | Parcial |
| A11Y-003 | Foco sempre visível com contraste adequado | BASE | Sem `outline: none` sem substituto | Sim |
| A11Y-004 | Ordem de tabulação igual à ordem visual | BASE | Verificado manualmente | Não |
| A11Y-005 | Modal com foco preso, `ESC` fecha e devolve o foco | BASE | Verificado no componente Dialog | Não |
| A11Y-006 | Todo campo com label associado | BASE | Sem placeholder como label | Sim |
| A11Y-007 | Erro de campo associado e anunciado | BASE | `aria-describedby` + `aria-invalid` | Sim |
| A11Y-008 | Contraste de texto ≥ 4.5:1 | BASE | Auditoria automática limpa | Sim |
| A11Y-009 | Contraste de componentes e foco ≥ 3:1 | BASE | Auditoria automática limpa | Sim |
| A11Y-010 | Informação nunca transmitida só por cor | BASE | Texto ou ícone acompanham | Não |
| A11Y-011 | Imagens com `alt` apropriado | BASE | Informativa descreve, decorativa vazia | Sim |
| A11Y-012 | Botão de ícone com `aria-label` | BASE | Verificado por lint | Sim |
| A11Y-013 | Hierarquia de títulos correta | BASE | Um `h1`, sem pular níveis | Sim |
| A11Y-014 | Mensagens dinâmicas em região `aria-live` | BASE | Toasts anunciados | Não |
| A11Y-015 | Link "pular para o conteúdo" | REC | Presente e funcional | Sim |
| A11Y-016 | Interface utilizável com zoom de 200% | BASE | Sem perda de conteúdo ou função | Não |
| A11Y-017 | `prefers-reduced-motion` respeitado | REC | Animações reduzidas | Sim |
| A11Y-018 | Idioma da página declarado (`lang="pt-BR"`) | BASE | Atributo presente | Sim |
| A11Y-019 | Auditoria automatizada no CI | REC | axe/Lighthouse sem violação crítica | Sim |
| A11Y-020 | Tabelas de dados com cabeçalhos associados | BASE | `<th scope>` correto | Sim |
