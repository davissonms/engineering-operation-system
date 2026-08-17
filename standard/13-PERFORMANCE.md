# 13 — Performance

Prefixo de requisitos: `PERF`

Performance sem número é opinião. Todo projeto declara seus SLOs em
`.ai/PROJECT-CONTEXT.md`; na ausência de declaração, valem os defaults abaixo.

---

## SLOs padrão

### Frontend (Core Web Vitals, no percentil 75)

| Métrica | Bom | Limite |
| --- | --- | --- |
| LCP (maior conteúdo) | < 2,5s | 4s |
| INP (interação) | < 200ms | 500ms |
| CLS (deslocamento) | < 0,1 | 0,25 |
| TTFB | < 800ms | 1,8s |

### Backend

| Tipo de endpoint | p95 | p99 |
| --- | --- | --- |
| Leitura simples | 200ms | 500ms |
| Listagem com filtro | 500ms | 1s |
| Escrita | 500ms | 1s |
| Relatório/agregação | 2s | 5s |
| Acima disso | processamento assíncrono |

### Banco

- Query de listagem: < 100ms
- Sem sequential scan em tabela acima de 10 mil linhas
- Sem N+1
- Conexões via pool, com limite definido

## Regras que resolvem 90% dos problemas

1. **Paginação obrigatória.** Nenhum endpoint devolve coleção ilimitada.
2. **Sem N+1.** Listagem com relacionamento usa join/include, não laço.
3. **Índice em toda coluna de filtro, ordenação e join.**
4. **Só os campos necessários.** `SELECT *` e DTOs gordos custam banda e memória.
5. **Trabalho lento vai para fila.** Requisição HTTP não gera PDF de 200 páginas.
6. **Cache no que é caro e muda pouco** — com invalidação explícita, nunca só TTL
   em dado crítico.
7. **Imagens otimizadas**, com dimensão declarada (evita CLS).
8. **Bundle sob controle**: import sob demanda em rota pesada; sem biblioteca
   grande para problema pequeno.
9. **Debounce em busca** (300ms).
10. **Timeout em toda chamada externa** — sem ele, a lentidão do terceiro vira a
    sua indisponibilidade.

## Antes de otimizar

Meça. Otimização sem medição é palpite caro, e quase sempre o gargalo está no
banco, não no código que parecia feio.

```
Reclamação de lentidão
        ↓
Medir (APM, log de duração, EXPLAIN ANALYZE)
        ↓
Identificar o gargalo real
        ↓
Corrigir
        ↓
Medir de novo e registrar o antes/depois
```

## Teste de carga

Sistema `FIN` ou com pico previsível (campanha, alta temporada) passa por teste
de carga antes de produção, com o resultado registrado. Descobrir o limite em
produção é a forma mais cara de descobrir.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| PERF-001 | SLOs declarados no projeto | BASE | `.ai/PROJECT-CONTEXT.md` | Não |
| PERF-002 | LCP < 2,5s nas páginas principais | BASE | Lighthouse/RUM | Sim |
| PERF-003 | CLS < 0,1 | BASE | Lighthouse/RUM | Sim |
| PERF-004 | INP < 200ms | BASE | RUM | Sim |
| PERF-005 | p95 de leitura dentro do SLO | BASE | Medido em produção | Sim |
| PERF-006 | Paginação obrigatória em toda listagem | BASE | Sem coleção ilimitada | Sim |
| PERF-007 | Ausência de N+1 em listagens | BASE | Contagem de queries em teste | Sim |
| PERF-008 | Índices presentes em filtros e joins | BASE | `EXPLAIN` sem seq scan relevante | Parcial |
| PERF-009 | Apenas campos necessários trafegados | BASE | DTOs enxutos | Não |
| PERF-010 | Operações longas em fila | BASE | Nada acima de 10s síncrono | Não |
| PERF-011 | Cache com invalidação explícita | REC | Estratégia documentada | Não |
| PERF-012 | Imagens otimizadas com dimensões | BASE | `next/image` | Sim |
| PERF-013 | Carregamento sob demanda em rotas pesadas | REC | Code splitting aplicado | Sim |
| PERF-014 | Orçamento de bundle definido e monitorado | REC | Falha de CI ao estourar | Sim |
| PERF-015 | Debounce em campos de busca | BASE | ~300ms | Não |
| PERF-016 | Timeout em toda chamada externa | BASE | Sem chamada sem timeout | Sim |
| PERF-017 | Pool de conexões configurado com limite | BASE | Configuração explícita | Sim |
| PERF-018 | Compressão de resposta habilitada | BASE | gzip/brotli ativos | Sim |
| PERF-019 | Assets estáticos com cache de longa duração | BASE | Headers corretos + hash no nome | Sim |
| PERF-020 | Teste de carga antes de produção | FIN | Relatório registrado | Não |
| PERF-021 | Monitoramento contínuo de latência | BASE | Dashboard + alerta | Sim |
| PERF-022 | Regressão de performance detectada no CI | REC | Lighthouse CI ou benchmark | Sim |
