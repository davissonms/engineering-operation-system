# 00 — Princípios

Os princípios não são requisitos verificáveis. Eles são o critério de desempate
quando duas regras parecem se contradizer, ou quando o padrão é silencioso.

---

## P1 — Funcionar não é estar pronto

A funcionalidade principal funcionando é o **começo** da entrega, não o fim.
Um sistema de cotações em que o cliente cria a cotação e o operador responde não
está pronto: falta autorização, auditoria, estado vazio, tratamento de erro,
rate limit, teste e homologação.

A régua é a `18-DEFINITION-OF-DONE.md`. Nada mais.

## P2 — O padrão é código, não folclore

Se uma regra não está escrita neste repositório, ela não existe. Não se assume
que "todo mundo sabe". Decisão que vira padrão vira arquivo, com ID e data.

Corolário: se você descobriu uma regra boa durante a implementação, o trabalho
não acabou quando o código funcionou — acabou quando a regra foi escrita.

## P3 — Reutilizar antes de criar

Antes de criar componente, endpoint, tabela, hook, utilitário ou padrão visual,
procure o equivalente existente. Criar um segundo jeito de fazer a mesma coisa é
uma decisão arquitetural e precisa ser tratada como tal.

O custo de um componente duplicado não é o arquivo a mais. É que a partir dali
metade do sistema evolui de um jeito e metade de outro.

## P4 — Segurança é atributo do processo, não etapa final

Não existe "depois a gente revisa a segurança". Autorização é implementada junto
com o endpoint. Hash de senha é implementado junto com o cadastro. Validação é
implementada junto com o formulário. (NIST SSDF)

## P5 — O backend nunca confia no frontend

Esconder o botão não é controle de acesso. Toda regra de autorização, validação
e limite existe no servidor. O frontend replica a regra para dar boa experiência,
nunca para garanti-la.

## P6 — Autenticação não é autorização

Estar logado não significa poder fazer. Toda operação sobre um recurso verifica
**quem é** (autenticação), **o que pode** (papel/permissão) e **sobre qual
registro** (ownership/tenant). As três, sempre.

## P7 — Todo estado da interface é um estado projetado

`loading`, `empty`, `error` e `success` são quatro telas, não uma. Se só existe
a tela de sucesso, a funcionalidade está incompleta — não "quase pronta".

## P8 — Erro técnico não vaza para o usuário

O usuário recebe uma mensagem em português que diz o que aconteceu e o que fazer.
O log interno recebe stack trace, IDs de correlação e contexto. Stack trace na
tela é vazamento de informação, não transparência.

## P9 — Toda ação relevante deixa rastro

Quem alterou o preço da emissão #93821, de quanto para quanto, quando, de qual IP.
Se o sistema não responde essa pergunta, ele não é auditável — e sistema
empresarial não auditável é passivo, não ativo.

## P10 — Automatizar a cobrança, não a boa vontade

Regra que depende da memória do desenvolvedor (ou do prompt do dia) não é regra,
é sorte. O que pode ser verificado por lint, teste, hook ou CI **deve** ser.
O documento existe para o que ainda não dá para automatizar.

## P11 — Explícito vence esperto

Código óbvio e um pouco mais longo vence código curto e engenhoso. O leitor do
seu código é você daqui a oito meses, um dev novo no time, e uma IA sem contexto.
Nenhum dos três merece um quebra-cabeça.

## P12 — Contexto persistente vence memória

A memória de uma sessão de IA se perde, resume ou distorce. Os arquivos em `.ai/`
e no git são a fonte da verdade. Decisão que só existe no histórico do chat não
existe.

## P13 — Sair do padrão é permitido; sair em silêncio, não

O padrão não é uma prisão. Toda exceção é legítima se estiver registrada como ADR
com contexto, decisão e consequência. O que é proibido é divergir sem registro.

## P14 — Dado do usuário é responsabilidade, não ativo

Coletar o mínimo necessário, guardar pelo tempo necessário, permitir correção e
exclusão, e nunca logar dado sensível. (LGPD, privacy by design)

## P15 — Nada vai para produção sem caminho de volta

Deploy sem rollback, migração sem reversão e mudança sem backup testado são
apostas. Antes de perguntar "como colocamos isso no ar", responda "como tiramos".

---

## Resolução de conflitos

Quando dois princípios colidem, esta é a ordem:

```
Segurança e integridade de dados
        ↓
Correção do comportamento
        ↓
Auditabilidade
        ↓
Experiência do usuário
        ↓
Consistência com o padrão
        ↓
Velocidade de entrega
```

Velocidade é a última. Sempre. Se a pressão de prazo está ganhando de segurança,
a decisão é do dono do produto, é registrada em ADR, e ganha prazo de correção.
