#!/usr/bin/env bash
#
# EOS — instalador para o Claude Code.
#
# Liga o padrão a TODOS os seus projetos: copia as regras globais, as skills
# e o hook de bloqueio para ~/.claude/ e registra o hook em settings.json.
#
#   bash bin/eos-install.sh              instala ou atualiza
#   bash bin/eos-install.sh --dry-run    mostra o que faria, sem escrever
#   bash bin/eos-install.sh --uninstall  remove o que foi instalado
#
# É idempotente: rodar de novo atualiza no lugar. Arquivos existentes que
# seriam sobrescritos viram backup com timestamp antes de qualquer escrita.

set -euo pipefail

EOS_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SETTINGS="$CLAUDE_DIR/settings.json"
STAMP="$(date +%Y%m%d-%H%M%S)"

SKILLS=(eos eos-init eos-dod eos-check)
HOOK_NAME="eos-guard.js"

BEGIN_MARK="<!-- EOS:BEGIN — gerado por bin/eos-install.sh. Não edite entre os marcadores. -->"
END_MARK="<!-- EOS:END -->"

DRY_RUN=false
UNINSTALL=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --uninstall) UNINSTALL=true ;;
    -h|--help) sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Opção desconhecida: $arg" >&2; exit 1 ;;
  esac
done

# ── saída ────────────────────────────────────────────────────────────────
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
info() { printf '  \033[2m·\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

run() { if $DRY_RUN; then info "[dry-run] $*"; else eval "$@"; fi; }

# ── pré-requisitos ───────────────────────────────────────────────────────
command -v node >/dev/null 2>&1 || die "Node.js é necessário (o hook e o gerador de catálogo são JS)."
[ -d "$EOS_HOME/standard" ] || die "Não encontrei standard/ em $EOS_HOME. Rode a partir do repositório do EOS."

# ═════════════════════════════════════════════════════════════════════════
# Desinstalação
# ═════════════════════════════════════════════════════════════════════════
if $UNINSTALL; then
  echo
  echo "Removendo o EOS de $CLAUDE_DIR"
  echo

  for s in "${SKILLS[@]}"; do
    if [ -d "$CLAUDE_DIR/skills/$s" ]; then
      run "rm -rf '$CLAUDE_DIR/skills/$s'"; ok "skill $s removida"
    fi
  done

  [ -f "$CLAUDE_DIR/hooks/$HOOK_NAME" ] && { run "rm -f '$CLAUDE_DIR/hooks/$HOOK_NAME'"; ok "hook removido"; }

  # Remove só o bloco marcado, preservando o resto do seu CLAUDE.md.
  if [ -f "$CLAUDE_DIR/CLAUDE.md" ] && grep -qF "$BEGIN_MARK" "$CLAUDE_DIR/CLAUDE.md"; then
    if ! $DRY_RUN; then
      cp "$CLAUDE_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md.bak-$STAMP"
      node -e '
        const fs = require("fs");
        const [file, b, e] = process.argv.slice(1);
        let s = fs.readFileSync(file, "utf8");
        const i = s.indexOf(b), j = s.indexOf(e);
        if (i !== -1 && j !== -1) s = (s.slice(0, i) + s.slice(j + e.length)).replace(/\n{3,}/g, "\n\n").trim() + "\n";
        fs.writeFileSync(file, s);
      ' "$CLAUDE_DIR/CLAUDE.md" "$BEGIN_MARK" "$END_MARK"
    fi
    ok "bloco removido de CLAUDE.md (backup salvo)"
  fi

  # Desregistra o hook, preservando todos os outros.
  if [ -f "$SETTINGS" ]; then
    if ! $DRY_RUN; then
      cp "$SETTINGS" "$SETTINGS.bak-$STAMP"
      node -e '
        const fs = require("fs");
        const [file, hook] = process.argv.slice(1);
        const s = JSON.parse(fs.readFileSync(file, "utf8"));
        const pre = s.hooks?.PreToolUse;
        if (Array.isArray(pre)) {
          s.hooks.PreToolUse = pre.filter(
            (g) => !(g.hooks || []).some((h) => (h.command || "").includes(hook)),
          );
          if (!s.hooks.PreToolUse.length) delete s.hooks.PreToolUse;
        }
        fs.writeFileSync(file, JSON.stringify(s, null, 2) + "\n");
      ' "$SETTINGS" "$HOOK_NAME"
    fi
    ok "hook desregistrado de settings.json (backup salvo)"
  fi

  echo
  echo "Removido. O repositório do padrão em $EOS_HOME continua intacto."
  exit 0
fi

# ═════════════════════════════════════════════════════════════════════════
# Instalação
# ═════════════════════════════════════════════════════════════════════════
echo
echo "Engineering Operating System — instalação"
echo
info "padrão:  $EOS_HOME"
info "destino: $CLAUDE_DIR"
$DRY_RUN && warn "modo dry-run: nada será escrito"
echo

run "mkdir -p '$CLAUDE_DIR/skills' '$CLAUDE_DIR/hooks'"

# ── 1. Skills ────────────────────────────────────────────────────────────
echo "Skills"
for s in "${SKILLS[@]}"; do
  src="$EOS_HOME/claude/skills/$s/SKILL.md"
  dst="$CLAUDE_DIR/skills/$s/SKILL.md"
  [ -f "$src" ] || die "arquivo ausente no repositório: $src"

  if ! $DRY_RUN; then
    mkdir -p "$(dirname "$dst")"
    # Backup só se existir e for diferente do que vamos escrever.
    if [ -f "$dst" ] && ! sed "s|__EOS_HOME__|$EOS_HOME|g" "$src" | cmp -s - "$dst"; then
      cp "$dst" "$dst.bak-$STAMP"
    fi
    sed "s|__EOS_HOME__|$EOS_HOME|g" "$src" > "$dst"
  fi
  ok "/$s"
done

# ── 2. Hook ──────────────────────────────────────────────────────────────
echo
echo "Hook de bloqueio"
src="$EOS_HOME/claude/hooks/$HOOK_NAME"
dst="$CLAUDE_DIR/hooks/$HOOK_NAME"
if ! $DRY_RUN; then
  [ -f "$dst" ] && ! sed "s|__EOS_HOME__|$EOS_HOME|g" "$src" | cmp -s - "$dst" && cp "$dst" "$dst.bak-$STAMP"
  sed "s|__EOS_HOME__|$EOS_HOME|g" "$src" > "$dst"
  chmod +x "$dst"
fi
ok "$HOOK_NAME"

# ── 3. CLAUDE.md global ──────────────────────────────────────────────────
echo
echo "Regras globais"
target="$CLAUDE_DIR/CLAUDE.md"
if ! $DRY_RUN; then
  body="$(sed "s|__EOS_HOME__|$EOS_HOME|g" "$EOS_HOME/claude/CLAUDE.md")"
  block="$BEGIN_MARK
$body
$END_MARK"

  if [ ! -f "$target" ]; then
    printf '%s\n' "$block" > "$target"
    RESULT="criado"
  elif grep -qF "$BEGIN_MARK" "$target"; then
    cp "$target" "$target.bak-$STAMP"
    BLOCK="$block" node -e '
      const fs = require("fs");
      const [file, b, e] = process.argv.slice(1);
      const s = fs.readFileSync(file, "utf8");
      const i = s.indexOf(b), j = s.indexOf(e);
      fs.writeFileSync(file, s.slice(0, i) + process.env.BLOCK + s.slice(j + e.length));
    ' "$target" "$BEGIN_MARK" "$END_MARK"
    RESULT="bloco atualizado no lugar"
  else
    # Já existe um CLAUDE.md seu: acrescentamos ao final, sem tocar no resto.
    cp "$target" "$target.bak-$STAMP"
    printf '\n\n%s\n' "$block" >> "$target"
    RESULT="bloco acrescentado ao seu CLAUDE.md existente"
  fi
else
  RESULT="[dry-run]"
fi
ok "CLAUDE.md — $RESULT"

# ── 4. Registro do hook em settings.json ─────────────────────────────────
echo
echo "settings.json"
if ! $DRY_RUN; then
  [ -f "$SETTINGS" ] && cp "$SETTINGS" "$SETTINGS.bak-$STAMP"

  NODE_BIN="$(command -v node)" HOOK_PATH="$dst" node -e '
    const fs = require("fs");
    const file = process.argv[1];

    // Preserva integralmente qualquer configuração já existente.
    let settings = {};
    if (fs.existsSync(file)) {
      try {
        settings = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch {
        console.error("settings.json inválido — abortando para não perder sua configuração.");
        process.exit(1);
      }
    }

    settings.hooks ??= {};
    settings.hooks.PreToolUse ??= [];

    const command = `"${process.env.NODE_BIN}" "${process.env.HOOK_PATH}"`;
    const already = settings.hooks.PreToolUse.some((g) =>
      (g.hooks || []).some((h) => (h.command || "").includes("eos-guard.js")),
    );

    if (already) {
      // Atualiza o caminho, caso o repositório tenha sido movido.
      for (const g of settings.hooks.PreToolUse) {
        for (const h of g.hooks || []) {
          if ((h.command || "").includes("eos-guard.js")) h.command = command;
        }
      }
      console.log("ATUALIZADO");
    } else {
      // Entra no INÍCIO: um bloqueio de segurança deve rodar antes dos demais.
      settings.hooks.PreToolUse.unshift({
        matcher: "Write|Edit",
        hooks: [{ type: "command", command, timeout: 5 }],
      });
      console.log("REGISTRADO");
    }

    fs.writeFileSync(file, JSON.stringify(settings, null, 2) + "\n");
  ' "$SETTINGS" > /tmp/eos-settings-result || die "falha ao atualizar settings.json (backup em $SETTINGS.bak-$STAMP)"

  ok "hook $(cat /tmp/eos-settings-result | tr 'A-Z' 'a-z') em PreToolUse"
  rm -f /tmp/eos-settings-result
else
  ok "[dry-run] registraria o hook em PreToolUse"
fi

# ── 5. Verificação ───────────────────────────────────────────────────────
if ! $DRY_RUN; then
  echo
  echo "Verificação"

  for s in "${SKILLS[@]}"; do
    head -3 "$CLAUDE_DIR/skills/$s/SKILL.md" | grep -q "^name: $s" \
      && ok "skill $s válida" || warn "skill $s com frontmatter inesperado"
  done

  # O hook precisa bloquear um segredo hardcoded e liberar código limpo.
  probe() {
    printf '%s' "$1" | node "$dst" 2>/dev/null \
      | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{console.log(JSON.parse(d).hookSpecificOutput.permissionDecision)}catch{console.log("erro")}})'
  }
  deny=$(probe '{"tool_name":"Write","tool_input":{"file_path":"/p/a.ts","content":"const secret = \"abc123def456ghi\""}}')
  allow=$(probe '{"tool_name":"Write","tool_input":{"file_path":"/p/b.ts","content":"const k = process.env.API_KEY"}}')
  [ "$deny" = "deny" ] && ok "hook bloqueia segredo hardcoded" || warn "hook não bloqueou (obtido: $deny)"
  [ "$allow" = "allow" ] && ok "hook libera código limpo" || warn "hook bloqueou código limpo (obtido: $allow)"

  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$SETTINGS" \
    && ok "settings.json continua válido"
fi

echo
echo "Pronto. Abra uma nova sessão do Claude Code — as regras carregam sozinhas."
echo
echo "  /eos         protocolo de desenvolvimento"
echo "  /eos-init    cria o .ai/ de um projeto"
echo "  /eos-dod     Definition of Done"
echo "  /eos-check   auditoria contra os 397 requisitos"
echo
$DRY_RUN || echo "Backups (se houve) estão em $CLAUDE_DIR com sufixo .bak-$STAMP"
