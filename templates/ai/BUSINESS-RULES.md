# Business Rules

> Regras de domínio deste sistema. A IA **nunca** inventa regra de negócio —
> o que não estiver aqui vira pergunta.

## Glossário

| Termo | Definição |
| --- | --- |
| | |

## Entidades e ciclo de vida

### <Entidade>

```
<estado inicial> → <estado> → <estado final>
```

| Transição | Quem pode | Condições |
| --- | --- | --- |
| | | |

## Matriz de permissões

| Recurso \ Papel | Admin | Operador | Cliente |
| --- | :-: | :-: | :-: |
| `<recurso>:read` | ✅ | ✅ | ❌ |
| `<recurso>:create` | ✅ | ✅ | ❌ |
| `<recurso>:update` | ✅ | ✅ | ❌ |
| `<recurso>:delete` | ✅ | ❌ | ❌ |

**Escopo de registro:** todo usuário acessa apenas registros do próprio tenant.
Acesso fora do escopo retorna 404.

## Regras de cálculo

| Regra | Fórmula | Arredondamento | Testada em |
| --- | --- | --- | --- |
| | | | |

## Validações de domínio

| Campo/Entidade | Regra | Mensagem |
| --- | --- | --- |
| | | |

## Invariantes

Coisas que **nunca** podem ser verdadeiras no sistema:

- [ ]
- [ ]

## Regras temporais

| Regra | Detalhe |
| --- | --- |
| Fuso horário de negócio | America/Sao_Paulo |
| Armazenamento | UTC |
| Dias úteis / feriados | |
