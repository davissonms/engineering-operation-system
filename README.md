# Engineering Operating System (EOS)

**Versão 1.0.0** — um padrão de engenharia para aplicações web, projetado para
ser aplicado por humanos **e por IA**.

Este repositório é a **fonte da verdade** de como um sistema web é projetado,
construído, verificado e colocado em produção. Adote-o como está, ou use-o como
ponto de partida para o padrão da sua equipe.

> Nenhum sistema está pronto porque a funcionalidade principal funciona.
> Ele está pronto quando atende à Definition of Done.

---

## Por que existe

Sem um padrão, cada projeto reinventa autenticação, tratamento de erro, estrutura
de pastas, contrato de API e componentes de UI. Com IA no fluxo de desenvolvimento
isso piora: o modelo resolve localmente o problema que você pediu e cria
`Button.tsx`, `PrimaryButton.tsx`, `ActionButton.tsx` no mesmo projeto.

O EOS resolve isso transformando o padrão em **regras que a IA é obrigada a
consultar antes de escrever código**, não em documentação que alguém talvez leia.

## Base normativa

| Área | Referência |
| --- | --- |
| Qualidade de produto | ISO/IEC 25010:2023 |
| Requisitos de segurança verificáveis | OWASP ASVS 5.0 |
| Riscos críticos | OWASP Top 10:2025 |
| Processo de desenvolvimento seguro | NIST SP 800-218 (SSDF) |
| Arquitetura | Clean Architecture + SOLID |
| API | REST + OpenAPI 3.1 |
| Acessibilidade | WCAG 2.2 AA |
| Privacidade | LGPD + privacy by design |

## Estrutura

```
Engineering-Operating-System/
├── standard/      Os 19 documentos normativos (requisitos com ID)
├── protocol/      Como a IA trabalha dentro do padrão + templates
├── requirements/  Catálogo consolidado de todos os requisitos
├── templates/     Esqueleto de .ai/ para novo projeto + ADR + Feature Contract
└── bin/           Ferramentas (regerar catálogo, validar IDs)
```

Nos documentos, `<EOS>` significa o diretório onde você clonou este
repositório. Escolha um lugar estável — ele será referenciado pelos projetos.

---

## Instalação

Requer **Node.js** e o **Claude Code**.

```bash
git clone https://github.com/davissonms/engineering-operation-system.git
cd engineering-operation-system
bash bin/eos-install.sh
```

Abra uma nova sessão do Claude Code. As regras passam a valer em **todos** os
seus projetos, em qualquer diretório.

```bash
bash bin/eos-install.sh --dry-run     # mostra o que faria, sem escrever
bash bin/eos-install.sh --uninstall   # remove o que foi instalado
```

### O que o instalador faz

```
~/.claude/CLAUDE.md              regras não-negociáveis, carregadas em TODO projeto
~/.claude/skills/eos/            protocolo de consulta ao padrão
~/.claude/skills/eos-init/       bootstrap do .ai/ em projeto novo
~/.claude/skills/eos-dod/        gate de Definition of Done
~/.claude/skills/eos-check/      auditoria de um projeto contra o padrão
~/.claude/hooks/eos-guard.js     bloqueio automático de violações de segurança
~/.claude/settings.json          registra o hook em PreToolUse
```

**Ele não destrói a sua configuração.** Se você já usa o Claude Code:

- `settings.json` é **mesclado**, não sobrescrito — permissões, statusline e
  hooks de outros frameworks continuam intactos. Se o arquivo estiver
  corrompido, o instalador aborta em vez de tentar consertar.
- `CLAUDE.md` recebe o bloco do EOS **delimitado por marcadores**, ao final do
  que já existir. Suas regras pessoais permanecem.
- Tudo que seria sobrescrito vira backup com timestamp antes de qualquer escrita.
- Rodar de novo **atualiza no lugar** — não duplica nada.
- `--uninstall` remove só o que é do EOS, inclusive de dentro do `CLAUDE.md`
  e do `settings.json`.

Fonte do que é instalado: [`claude/`](claude/). Editar lá e reinstalar propaga a
mudança.

### Reinstale ao mover o repositório

Os arquivos instalados guardam o caminho absoluto do clone. Se você mover a
pasta, rode `bash bin/eos-install.sh` de novo para corrigir os ponteiros.

### Sem o Claude Code

O EOS continua servindo como documentação de referência, checklist de code
review e catálogo de requisitos para o seu próprio processo — só deixa de ser
cobrado automaticamente. Qualquer agente que leia arquivos de contexto pode
apontar para `standard/` e `protocol/`.

## Perfis de conformidade

Nem todo requisito vale para todo sistema. Cada requisito tem um perfil:

| Perfil | Significado |
| --- | --- |
| `BASE` | Obrigatório em **todo** sistema web, sem exceção |
| `SAAS` | Obrigatório em sistemas multiusuário / multi-tenant |
| `FIN` | Obrigatório em sistemas que tocam dinheiro, pagamento ou emissão |
| `REC` | Recomendado — a ausência precisa de justificativa, não de aprovação |

Um projeto declara seus perfis em `.ai/PROJECT-CONTEXT.md`. O gate de DoD só
cobra os requisitos dos perfis declarados.

## Stack de referência

O padrão define um **caminho feliz**. Sair dele é permitido, mas exige um ADR.

| Camada | Default |
| --- | --- |
| Frontend | Next.js (App Router) + React + TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Backend | NestJS + Node.js + TypeScript |
| Banco | PostgreSQL + Prisma |
| Cache / filas | Redis + BullMQ |
| Auth | JWT de acesso curto + refresh token rotativo em cookie httpOnly |
| Testes | Vitest / Jest + Supertest + Playwright |
| CI/CD | GitHub Actions |
| Observabilidade | Logs estruturados JSON + Sentry + healthcheck |
| Container | Docker + docker compose |

## Versionamento

O padrão segue SemVer.

- **MAJOR** — um requisito `BASE` é adicionado ou endurecido (quebra projetos existentes)
- **MINOR** — novo requisito `REC`/`SAAS`/`FIN`, ou nova seção
- **PATCH** — correção de texto, exemplo ou critério de aceite sem mudar a exigência

Projetos fixam a versão do padrão que seguem em `.ai/PROJECT-CONTEXT.md`.
Migrar de versão é uma tarefa explícita, não algo que acontece sozinho.

## Ordem de leitura para quem chega agora

1. `standard/00-PRINCIPIOS.md`
2. `protocol/HIERARQUIA-DE-AUTORIDADE.md`
3. `protocol/AI-DEVELOPMENT-PROTOCOL.md`
4. `standard/18-DEFINITION-OF-DONE.md`
5. O documento da área em que você vai trabalhar
