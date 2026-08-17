# UX Patterns

> Padrões de interação deste sistema. Uma tela nova segue um padrão existente
> antes de inventar um novo.

## Arquétipos de tela

### Listagem
```
PageHeader (título + ação primária)
Toolbar (busca + filtros + exportar)
DataTable
Pagination (com contagem de resultados)
```
Estados: loading (skeleton) · empty inicial · empty de busca · error · success

### Detalhe
```
PageHeader (título + breadcrumb + ações)
Card com dados principais
Tabs para seções relacionadas (histórico, documentos, auditoria)
```

### Formulário
```
PageHeader
Form em seções agrupadas por assunto
Rodapé fixo: [Cancelar]  [Salvar]
```

## Comportamentos padrão

| Situação | Padrão |
| --- | --- |
| Sucesso em ação | Toast + atualização da lista |
| Erro de validação | Erro por campo + foco no primeiro erro |
| Erro de servidor | Erro geral + request_id |
| Exclusão | AlertDialog com impacto listado |
| Exclusão reversível | Toast com "Desfazer" |
| Operação > 10s | Fila + notificação ao concluir |
| Filtro ativo | Chip removível + "Limpar filtros" |
| Sessão expirando | Modal de aviso com opção de continuar |
| Sem permissão | Tela dedicada, nunca erro cru |

## Mensagens padrão

| Situação | Texto |
| --- | --- |
| Empty inicial | "Nenhum <recurso> cadastrado." + ação de criar |
| Empty de busca | "Nenhum resultado para «termo»." + limpar filtros |
| Erro de carga | "Erro ao carregar <recurso>." + [Tentar novamente] |
| Erro genérico | "Não foi possível concluir a operação. Código: <request_id>" |
| Salvo | "<Recurso> salvo com sucesso." |
| Excluído | "<Recurso> excluído." |

## Formatação

| Tipo | Formato |
| --- | --- |
| Data | `17/08/2026` |
| Data e hora | `17/08/2026 10:42` |
| Moeda | `R$ 2.650,00` |
| CPF | `123.456.789-00` |
| CNPJ | `12.345.678/0001-90` |
| Telefone | `(11) 98765-4321` |

## Mobile

- Alvo de toque mínimo 44×44px
- Tabela vira cartão abaixo de `md`
- Modal vira drawer de tela cheia
