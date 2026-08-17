# `.ai/guard-rules.json`

Convenções **deste projeto** que o `eos-guard` deve cobrar no momento da escrita.

O hook global do EOS conhece segurança — o que vale em qualquer sistema. As
convenções do seu projeto ("todo modal usa `<Modal>`", "formatação só de
`lib/format.ts`") só você pode declarar.

Sem isto, a convenção existe apenas na documentação. E documentação não bloqueia
escrita: ela é lida por quem já foi procurar.

## Formato

```json
{
  "rules": [
    {
      "id": "DS-006",
      "label": "Modal escrito à mão",
      "fix": "Use components/Modal — traz trap de foco, ESC e retorno do foco.",
      "pattern": "fixed inset-0",
      "unless": "components/Modal",
      "paths": "\\.tsx$",
      "skipPaths": "components/Modal\\.tsx$",
      "hard": false
    }
  ]
}
```

| Campo | Para quê |
| --- | --- |
| `pattern` | Regex testada **linha a linha** |
| `unless` | Regex testada no **arquivo inteiro** — isenta quem já usa a abstração correta |
| `paths` | Só aplica a arquivos que casem |
| `skipPaths` | Isenta arquivos (ex.: o próprio componente) |
| `hard` | `true` bloqueia; `false` (padrão) só alerta |

## Comece por `hard: false`

Alerta primeiro, bloqueio depois. Uma regra nova quase sempre tem falso positivo
que ninguém previu, e um hook que bloqueia errado é um hook que alguém desliga —
e hook desligado não protege nada.

Arquivos de teste são isentos automaticamente.
