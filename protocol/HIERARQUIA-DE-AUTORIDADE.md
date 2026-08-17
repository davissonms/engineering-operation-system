# Hierarquia de Autoridade

Quando duas fontes de regra discordam, esta hierarquia decide. Sem ela, cada
sessão de IA e cada desenvolvedor resolve o conflito de um jeito.

---

## A cadeia

```
┌──────────────────────────────────────────────────┐
│ 0. SEGURANÇA E LEI                               │  nunca cede
│    OWASP ASVS · LGPD · integridade de dados      │
└───────────────────────┬──────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ 1. EOS — PADRÃO GLOBAL                           │  standard/*.md
│    Requisitos BASE. Vale para todos os projetos. │
└───────────────────────┬──────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ 2. ADRs DO PROJETO                               │  .ai/DECISIONS/
│    Decisões registradas, inclusive exceções      │
└───────────────────────┬──────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ 3. CONTEXTO DO PROJETO                           │  .ai/*.md
│    Stack, arquitetura, regras de negócio         │
└───────────────────────┬──────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ 4. DESIGN SYSTEM DO PROJETO                      │  .ai/DESIGN-SYSTEM.md
│    Tokens, componentes, padrões de UX            │
└───────────────────────┬──────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ 5. FEATURE CONTRACT                              │  .ai/FEATURES/
│    O escopo acordado desta funcionalidade        │
└───────────────────────┬──────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ 6. CÓDIGO EXISTENTE                              │
│    Convenção observada no repositório            │
└───────────────────────┬──────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ 7. PEDIDO PONTUAL DA SESSÃO                      │
│    "faz assim aqui"                              │
└──────────────────────────────────────────────────┘
```

**Nível mais alto vence.** Um pedido de sessão (7) não derruba um requisito BASE
de segurança (0/1). Ele vira uma proposta de exceção.

---

## Como um nível inferior sobrepõe um superior

Nunca por decisão de implementação. Só por **promoção formal**:

```
Pedido da sessão contradiz o padrão
        ↓
A IA PARA e explica qual regra está sendo contrariada
        ↓
     ┌──┴──────────────┬─────────────────┐
     ↓                 ↓                 ↓
 Cancelar         Exceção local     Mudar o padrão
                  (ADR no projeto)  (PR no EOS + bump de versão)
```

Regra prática: **nada de nível 0 admite exceção local.** Senha em texto puro,
endpoint sem verificação de autorização, secret no repositório e ausência de
HTTPS não têm ADR que resolva. São bloqueio.

---

## O que a IA faz ao detectar conflito

Não silencia, não escolhe sozinha, não implementa "os dois jeitos".

Formato obrigatório da parada:

```
⚠️ CONFLITO COM O PADRÃO

Pedido:      criar um componente TableCustom para a tela de clientes
Contraria:   DS-004 (BASE) — toda listagem tabular usa o componente DataTable
Fonte:       standard/06-DESIGN-SYSTEM.md
Nível:       4 (Design System) vs 7 (pedido da sessão)

Opções:
A) Usar DataTable e estender via props/slots  ← recomendado
B) Registrar exceção em ADR e criar TableCustom nesta tela
C) Promover a mudança ao padrão global (DataTable deixa de ser obrigatório)

Como você quer seguir?
```

Depois da escolha, se for B ou C, o registro é **parte da entrega**, não um
"depois eu documento".

---

## Precedência entre projetos

Nenhuma. Um ADR do projeto A não vale no projeto B. Se a decisão deve valer para
todos, ela sobe para `standard/` com bump de versão — é assim que o padrão
aprende sem virar colcha de retalhos.

## Quando o padrão é silencioso

Silêncio não é permissão nem proibição. A ordem é:

1. Existe convenção no código do projeto? Siga-a.
2. Existe convenção idiomática da linguagem/framework? Siga-a.
3. Escolha a opção mais explícita e reversível, e registre em `.ai/DECISIONS/`
   se a escolha for estrutural.
4. Se a lacuna reaparecer em outro projeto, ela vira requisito no EOS.
