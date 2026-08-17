#!/usr/bin/env node
/**
 * EOS Guard — PreToolUse (Write|Edit)
 *
 * Bloqueia violações DURAS do Engineering Operating System (EOS), isto é,
 * apenas o que não admite exceção local (nível 0 da hierarquia de autoridade).
 *
 * Filosofia: conservador por design. Um hook com falso positivo é desligado —
 * e um hook desligado não protege nada. Na dúvida, deixe passar; a revisão
 * humana e o /eos-check pegam o resto.
 *
 * Referência: __EOS_HOME__/
 */

'use strict'

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rb|php|java|cs)$/i
const SKIP_PATH =
  /(node_modules|\.next|dist|build|coverage|\.git|vendor|__snapshots__)\//
const TEST_FILE = /(\.(spec|test)\.|\/(tests?|__tests__|e2e|fixtures|mocks)\/)/i
const EXAMPLE_FILE = /(\.env\.example|\.env\.sample|\.env\.template)$/i

/** Valores que claramente não são segredos reais. */
const PLACEHOLDER =
  /^(x{3,}|y{3,}|\.{3,}|<.*>|\{\{.*\}\}|\$\{.*\}|change[_-]?me|your[_-].*|example|placeholder|dummy|fake|test|sample|secret|password|token|redacted|todo|none|null|undefined|true|false|\d+)$/i

/** Regras. `hard: true` bloqueia; `hard: false` apenas alerta. */
const RULES = [
  {
    id: 'SEC-009',
    hard: true,
    label: 'Segredo hardcoded no código',
    fix: 'Mova para variável de ambiente e leia via config validada no boot.',
    skip: (p) => TEST_FILE.test(p) || EXAMPLE_FILE.test(p),
    test(line) {
      const m = line.match(
        /\b(password|passwd|secret|api[_-]?key|apikey|access[_-]?token|auth[_-]?token|private[_-]?key|client[_-]?secret|db[_-]?pass\w*)\s*[:=]\s*(['"`])([^'"`\n]{8,})\2/i,
      )
      if (!m) return false
      const value = m[3]
      if (PLACEHOLDER.test(value.trim())) return false
      if (/^(process\.env|import\.meta|env\.|config\.)/i.test(value)) return false
      // Nome de campo/tipo, não atribuição de valor: `password: string`
      if (/^(string|number|boolean|any|unknown)$/i.test(value)) return false
      return true
    },
  },
  {
    id: 'SEC-004',
    hard: true,
    label: 'SQL montado por concatenação/interpolação',
    fix: 'Use query parametrizada ou o ORM. Interpolar entrada em SQL é injeção.',
    skip: (p) => TEST_FILE.test(p),
    test(line) {
      // Template literal de SQL com interpolação
      if (/`[^`]*\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^`]*\$\{/i.test(line)) {
        // Prisma.sql`...${x}` e sql`...` são parametrizados — liberados
        if (/(Prisma\.sql|\bsql)\s*`/.test(line)) return false
        return true
      }
      // Concatenação com +
      if (/['"][^'"]*\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^'"]*['"]\s*\+/i.test(line))
        return true
      return false
    },
  },
  {
    id: 'AUTH-003',
    hard: true,
    label: 'Hash de senha fraco ou ausente',
    fix: 'Use Argon2id (preferido) ou bcrypt com cost >= 12.',
    skip: (p) => TEST_FILE.test(p),
    test(line) {
      // MD5/SHA1 aplicado a senha
      if (/\b(md5|sha1)\b/i.test(line) && /password|senha|passwd/i.test(line)) return true
      // bcrypt com cost baixo
      const b = line.match(/bcrypt\.(hash|hashSync)\s*\([^,]+,\s*(\d+)/)
      if (b && Number(b[2]) < 12) return true
      return false
    },
  },
  {
    id: 'BE-007',
    hard: false,
    label: 'Catch vazio — erro engolido em silêncio',
    fix: 'Trate, registre com contexto, ou propague. Nunca silencie.',
    skip: (p) => TEST_FILE.test(p),
    test(line) {
      return /catch\s*(\([^)]*\))?\s*\{\s*\}/.test(line)
    },
  },
  {
    id: 'DS-007',
    hard: false,
    label: 'alert()/confirm() nativo',
    fix: 'Use Toast para notificação e AlertDialog para confirmação.',
    skip: (p) => TEST_FILE.test(p) || !/\.(tsx|jsx)$/i.test(p),
    test(line) {
      return /(^|[^.\w])(alert|confirm)\s*\(/.test(line) && !/\/\//.test(line.split(/alert|confirm/)[0])
    },
  },
  {
    id: 'FE-020',
    hard: false,
    label: 'dangerouslySetInnerHTML sem sanitização visível',
    fix: 'Sanitize (DOMPurify) ou renderize como texto.',
    skip: (p) => TEST_FILE.test(p),
    test(line) {
      return (
        /dangerouslySetInnerHTML/.test(line) &&
        !/(sanitiz|DOMPurify|purify|clean)/i.test(line)
      )
    },
  },
]

function readStdin() {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (c) => (data += c))
    process.stdin.on('end', () => resolve(data))
    setTimeout(() => resolve(data), 4000)
  })
}

function contentOf(input) {
  if (typeof input.content === 'string') return input.content
  if (typeof input.new_string === 'string') return input.new_string
  if (Array.isArray(input.edits)) return input.edits.map((e) => e.new_string || '').join('\n')
  return ''
}

function allow() {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' },
    }),
  )
  process.exit(0)
}

;(async () => {
  let payload
  try {
    payload = JSON.parse(await readStdin())
  } catch {
    process.exit(0) // entrada ilegível: nunca bloquear por falha do próprio hook
  }

  const path = payload?.tool_input?.file_path || ''
  if (!path || !CODE_EXT.test(path) || SKIP_PATH.test(path)) process.exit(0)

  const content = contentOf(payload.tool_input || {})
  if (!content) process.exit(0)

  const hits = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim() || /^\s*(\/\/|\*|#)/.test(line)) continue // comentários fora

    // Escape documentado. Aceito na própria linha OU nas 3 anteriores.
    //
    // As linhas anteriores existem porque a linha ofensora costuma estar DENTRO
    // de um template literal — onde um `//` viraria parte da string. Sem isso,
    // o escape simplesmente não é aplicável a SQL multilinha, que é justamente
    // onde os falsos positivos aparecem. Descoberto usando o próprio hook.
    const janela = lines.slice(Math.max(0, i - 3), i + 1).join('\n')
    if (/eos-disable/.test(janela)) continue

    for (const rule of RULES) {
      if (rule.skip && rule.skip(path)) continue
      try {
        if (rule.test(line)) {
          hits.push({ rule, line: i + 1, text: line.trim().slice(0, 120) })
        }
      } catch {
        /* regra com defeito nunca bloqueia a escrita */
      }
    }
  }

  if (!hits.length) allow()

  const blocking = hits.filter((h) => h.rule.hard)
  const warnings = hits.filter((h) => !h.rule.hard)

  const render = (h) =>
    `  ${h.rule.id}  ${h.rule.label}\n` +
    `    linha ${h.line}: ${h.text}\n` +
    `    → ${h.rule.fix}`

  if (blocking.length) {
    const msg =
      `🛑 EOS — violação de requisito obrigatório em ${path}\n\n` +
      blocking.map(render).join('\n\n') +
      (warnings.length ? '\n\nAlertas adicionais:\n' + warnings.map(render).join('\n\n') : '') +
      `\n\nEstes requisitos são de nível 0 (segurança) e não admitem exceção local.\n` +
      `Corrija antes de escrever. Se for falso positivo, adicione "eos-disable" na linha com o motivo.`

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: msg,
        },
      }),
    )
    process.exit(0)
  }

  // Só alertas: deixa passar, mas injeta o aviso no contexto
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        additionalContext:
          `⚠️ EOS — pontos de atenção em ${path}:\n` + warnings.map(render).join('\n\n'),
      },
    }),
  )
})()
