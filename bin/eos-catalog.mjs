#!/usr/bin/env node
// Regenera requirements/CATALOGO.md a partir das tabelas de requisitos em standard/*.md
// Uso: node bin/eos-catalog.mjs

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const STANDARD = join(ROOT, 'standard')
const OUT = join(ROOT, 'requirements', 'CATALOGO.md')

const ROW = /^\|\s*([A-Z0-9]+-\d{3})\s*\|(.+)$/
const PERFIS = ['BASE', 'SAAS', 'FIN', 'REC']

const reqs = []
const seen = new Map()
const problems = []

for (const file of readdirSync(STANDARD).filter((f) => f.endsWith('.md')).sort()) {
  const titulo = readFileSync(join(STANDARD, file), 'utf8').split('\n')[0].replace(/^#\s*/, '')

  for (const line of readFileSync(join(STANDARD, file), 'utf8').split('\n')) {
    const m = line.match(ROW)
    if (!m) continue

    const cells = line.split('|').map((c) => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1)
    const [id, requisito, perfil, criterio, auto] = cells

    if (!PERFIS.includes(perfil)) problems.push(`${id}: perfil inválido "${perfil}" (${file})`)
    if (seen.has(id)) problems.push(`${id}: duplicado em ${file} e ${seen.get(id)}`)
    seen.set(id, file)

    reqs.push({ id, requisito, perfil, criterio, auto, file, titulo })
  }
}

const porPerfil = (p) => reqs.filter((r) => r.perfil === p).length
const autos = reqs.filter((r) => r.auto === 'Sim').length

const grupos = [...new Set(reqs.map((r) => r.titulo))]

const linhas = []
linhas.push('# Catálogo de Requisitos — EOS')
linhas.push('')
linhas.push('> **Arquivo gerado.** Não edite à mão.')
linhas.push('> Fonte: as tabelas de requisitos em `standard/*.md`.')
linhas.push('> Regenerar: `node bin/eos-catalog.mjs`')
linhas.push('')
linhas.push(`Versão do padrão: **${readFileSync(join(ROOT, 'VERSION'), 'utf8').trim()}**`)
linhas.push('')
linhas.push('## Resumo')
linhas.push('')
linhas.push('| | Quantidade |')
linhas.push('| --- | ---: |')
linhas.push(`| **Total de requisitos** | ${reqs.length} |`)
linhas.push(`| BASE — todo sistema | ${porPerfil('BASE')} |`)
linhas.push(`| SAAS — multiusuário | ${porPerfil('SAAS')} |`)
linhas.push(`| FIN — financeiro | ${porPerfil('FIN')} |`)
linhas.push(`| REC — recomendado | ${porPerfil('REC')} |`)
linhas.push(`| Automatizáveis | ${autos} |`)
linhas.push('')
linhas.push('## Perfis')
linhas.push('')
linhas.push('| Perfil | Significado |')
linhas.push('| --- | --- |')
linhas.push('| `BASE` | Obrigatório em todo sistema web, sem exceção |')
linhas.push('| `SAAS` | Obrigatório em sistema multiusuário / multi-tenant |')
linhas.push('| `FIN` | Obrigatório em sistema que toca dinheiro, pagamento ou emissão |')
linhas.push('| `REC` | Recomendado — a ausência exige justificativa |')
linhas.push('')

for (const g of grupos) {
  const doGrupo = reqs.filter((r) => r.titulo === g)
  linhas.push(`## ${g}`)
  linhas.push('')
  linhas.push(`Fonte: [\`standard/${doGrupo[0].file}\`](../standard/${doGrupo[0].file})`)
  linhas.push('')
  linhas.push('| ID | Requisito | Perfil | Critério de aceite | Auto |')
  linhas.push('| --- | --- | --- | --- | --- |')
  for (const r of doGrupo) {
    linhas.push(`| \`${r.id}\` | ${r.requisito} | \`${r.perfil}\` | ${r.criterio} | ${r.auto} |`)
  }
  linhas.push('')
}

writeFileSync(OUT, linhas.join('\n'))

console.log(`✅ ${reqs.length} requisitos → requirements/CATALOGO.md`)
console.log(`   BASE ${porPerfil('BASE')} · SAAS ${porPerfil('SAAS')} · FIN ${porPerfil('FIN')} · REC ${porPerfil('REC')} · automatizáveis ${autos}`)

if (problems.length) {
  console.error('\n⚠️  Problemas encontrados:')
  for (const p of problems) console.error('   ' + p)
  process.exit(1)
}
