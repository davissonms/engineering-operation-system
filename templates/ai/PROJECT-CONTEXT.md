# Project Context

> Este arquivo é lido pela IA **antes** de qualquer implementação.
> Mantê-lo verdadeiro é parte do trabalho, não tarefa futura.

## Identificação

| | |
| --- | --- |
| **Nome** | <nome do sistema> |
| **Descrição** | <duas frases: o que faz e para quem> |
| **Responsável** | |
| **Repositório** | |
| **Ambientes** | dev: · staging: · produção: |

## Conformidade EOS

| | |
| --- | --- |
| **Versão do padrão** | 1.0.0 |
| **Local do padrão** | `~/Documents/Engineering-Operating-System/` |
| **Perfis aplicáveis** | `BASE` · `SAAS` · `FIN` *(remova os que não se aplicam)* |

Perfis:
- `BASE` — sempre obrigatório
- `SAAS` — sistema multiusuário / multi-tenant
- `FIN` — toca dinheiro, pagamento ou emissão

## Usuários e papéis

| Papel | Quem é | O que faz |
| --- | --- | --- |
| Admin | | |
| Operador | | |
| Cliente | | |

## Domínio

Os conceitos centrais do negócio, em uma linha cada. Isto evita que a IA invente
vocabulário paralelo.

| Termo | Significado neste sistema |
| --- | --- |
| Cotação | |
| Emissão | |

## Multi-tenant

- [ ] Sim — coluna de tenant: `______`, obtida sempre da sessão
- [ ] Não

## SLOs

| Métrica | Alvo |
| --- | --- |
| LCP | < 2,5s |
| API p95 (leitura) | < 200ms |
| API p95 (listagem) | < 500ms |
| Disponibilidade | 99,5% |
| RPO | 24h |
| RTO | 8h |

## Integrações externas

| Serviço | Uso | Falha tolerável? |
| --- | --- | --- |
| | | |

## Restrições conhecidas

O que não pode ser mudado e por quê (contrato, legado, integração, prazo).

## Estado atual

| | |
| --- | --- |
| **Fase** | descoberta / desenvolvimento / produção |
| **Última atualização deste arquivo** | aaaa-mm-dd |
