# Security Rules

> Base: `standard/09-SEGURANCA.md`. Aqui ficam apenas as particularidades
> deste sistema.

## Classificação de dados

| Dado | Classificação | Tratamento |
| --- | --- | --- |
| Senha | Crítico | Argon2id, nunca reversível, nunca logado |
| CPF/CNPJ | Pessoal | Mascarado na interface, nunca logado |
| Cartão | Crítico | Não armazenar; usar tokenização do gateway |
| E-mail | Pessoal | Não logar em claro |
| | | |

## Superfícies sensíveis

| Endpoint/Fluxo | Risco | Mitigação |
| --- | --- | --- |
| Login | Brute force | Rate limit por IP e conta + backoff |
| Recuperação de senha | Enumeração de usuário | Resposta e tempo constantes |
| Upload | Execução remota | Validação de magic bytes, storage isolado |
| Exportação | Vazamento em massa | Escopo de tenant + auditoria |
| | | |

## Rate limits

| Endpoint | Limite | Janela |
| --- | --- | --- |
| `POST /v1/auth/login` | 5 | 15 min por conta |
| `POST /v1/auth/forgot-password` | 3 | 1h por e-mail |
| Global | | |

## Segredos

| Segredo | Onde vive | Rotação |
| --- | --- | --- |
| | cofre/env | |

## LGPD

| Item | Situação |
| --- | --- |
| Base legal documentada | |
| Retenção definida | |
| Expurgo automatizado | |
| Fluxo de acesso/correção/exclusão pelo titular | |
| Encarregado (DPO) | |

## Incidentes

| Passo | Responsável | Contato |
| --- | --- | --- |
| Detecção | | |
| Contenção | | |
| Comunicação | | |
