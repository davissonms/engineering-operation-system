# 09 — Segurança

Prefixo de requisitos: `SEC`
Base normativa: **OWASP ASVS 5.0**, **OWASP Top 10:2025**, **NIST SSDF**, **LGPD**

Autenticação está em `07`; autorização em `08`. Aqui fica o resto.

---

## Nível 1 — obrigatório em qualquer sistema

- HTTPS em tudo, com HSTS
- Hash forte de senha
- Proteção contra SQL Injection (query parametrizada / ORM — nunca concatenação)
- Proteção contra XSS (escape por padrão, sanitização quando há HTML)
- Proteção contra CSRF quando há cookie de sessão
- Validação de entrada no servidor
- Rate limiting
- Controle de acesso
- Segredos fora do código
- Headers de segurança
- CORS restrito
- Gerenciamento de sessão
- Timeout de sessão
- Logs de segurança
- Dependências atualizadas

## Nível 2 — sistemas sensíveis (SAAS/FIN)

- MFA
- Gestão de dispositivos e sessões
- Auditoria completa
- Detecção de comportamento anômalo
- Criptografia de dados sensíveis em repouso
- Segregação de privilégios
- Backup criptografado
- Plano de recuperação de desastre testado

## Headers obrigatórios

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...   (sem 'unsafe-inline' em produção)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY                              (ou CSP frame-ancestors 'none')
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

E o que **não** deve aparecer: `X-Powered-By`, versão do servidor, banner de
framework.

## Injeção

- SQL: sempre parametrizado. Concatenar entrada em query é bloqueio absoluto.
- NoSQL: validar tipo — objeto onde se espera string vira operador.
- Comando de sistema: evitar. Se inevitável, sem shell e com lista branca de
  argumentos.
- Template/SSTI: nunca renderizar template vindo de entrada do usuário.
- Path traversal: normalizar e validar caminho contra diretório base.
- SSRF: lista branca de destinos; bloquear IP privado, loopback e metadata
  (`169.254.169.254`) em qualquer requisição saída a partir de URL do usuário.

## Segredos

- Nenhum segredo no repositório. Nunca. Nem em histórico, nem em comentário,
  nem em teste.
- Variáveis de ambiente + cofre de segredos no ambiente gerenciado.
- Rotação periódica de chaves; rotação imediata em suspeita de vazamento.
- Scan de segredos (Gitleaks) no CI e em pre-commit.
- Segredo que vazou é segredo morto: rotacione, não remova só do histórico.

## Dependências

- Lockfile commitado.
- Auditoria automática de vulnerabilidades no CI (`npm audit` / Dependabot).
- Vulnerabilidade crítica ou alta **bloqueia** o deploy.
- Dependência nova exige verificação de manutenção, popularidade e licença.
- Sem instalação de pacote a partir de URL arbitrária ou fork não auditado.

## Dados pessoais (LGPD)

- Coletar o mínimo necessário para a finalidade declarada.
- Base legal identificada para cada tratamento.
- Dado sensível criptografado em repouso.
- Nunca logar CPF, cartão, token, senha ou dado de saúde.
- Mascarar dado sensível na interface e nos relatórios quando não for essencial
  (`***.456.789-**`).
- Titular pode acessar, corrigir e solicitar exclusão dos seus dados.
- Retenção definida por tipo de dado, com expurgo automatizado.
- Incidente de segurança tem plano de resposta e notificação.

## Arquivos

- Validar tipo real (magic bytes), não a extensão nem o `Content-Type` enviado.
- Limite de tamanho por arquivo e por requisição.
- Renomear no armazenamento; nunca usar o nome enviado pelo usuário.
- Armazenar fora do webroot, sem permissão de execução.
- Servir por URL assinada com expiração; nunca por caminho previsível.
- Varredura antivírus quando o arquivo é compartilhado entre usuários.

## Ciclo de desenvolvimento seguro (SSDF)

```
Design      → modelagem de ameaça em feature sensível
Código      → lint de segurança + review humano
CI          → SAST (Semgrep/CodeQL) + scan de segredos + auditoria de deps
Pré-deploy  → checklist de segurança da Definition of Done
Produção    → monitoramento, alertas, plano de resposta a incidente
```

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| SEC-001 | HTTPS obrigatório com HSTS | BASE | Header presente, HTTP redireciona | Sim |
| SEC-002 | Headers de segurança configurados | BASE | CSP, nosniff, frame-options, referrer-policy | Sim |
| SEC-003 | CSP sem `unsafe-inline`/`unsafe-eval` em produção | REC | Política verificada | Sim |
| SEC-004 | Queries parametrizadas — sem concatenação de entrada | BASE | SAST limpo | Sim |
| SEC-005 | Saída escapada por padrão contra XSS | BASE | Sem render de HTML cru não sanitizado | Sim |
| SEC-006 | Proteção CSRF quando há cookie de sessão | BASE | Token ou `SameSite=Strict` + verificação de origem | Sim |
| SEC-007 | CORS com origens explícitas | BASE | Sem `*` com credenciais | Sim |
| SEC-008 | Rate limiting global e por endpoint sensível | BASE | 429 configurado | Sim |
| SEC-009 | Nenhum segredo no repositório | BASE | Gitleaks limpo, inclusive no histórico | Sim |
| SEC-010 | Segredos em cofre/env, com rotação definida | BASE | Documentado e aplicado | Não |
| SEC-011 | Scan de segredos no CI | BASE | Job obrigatório | Sim |
| SEC-012 | SAST executado no CI | BASE | Semgrep/CodeQL com falha bloqueante | Sim |
| SEC-013 | Auditoria de dependências no CI | BASE | Crítico/alto bloqueia deploy | Sim |
| SEC-014 | Lockfile commitado | BASE | Presente no repositório | Sim |
| SEC-015 | Proteção contra SSRF em requisições derivadas de entrada | BASE | Lista branca + bloqueio de IP interno | Sim |
| SEC-016 | Proteção contra path traversal | BASE | Caminho normalizado e validado | Sim |
| SEC-017 | Upload validado por tipo real e tamanho | BASE | Magic bytes + limite | Sim |
| SEC-018 | Arquivos armazenados fora do webroot, sem execução | BASE | Verificado na infraestrutura | Sim |
| SEC-019 | Download por URL assinada com expiração | BASE | Sem caminho público previsível | Sim |
| SEC-020 | Servidor não expõe versão/tecnologia | BASE | Sem `X-Powered-By` | Sim |
| SEC-021 | Erros não vazam informação técnica | BASE | Resposta genérica em 500 | Sim |
| SEC-022 | Dados pessoais sensíveis criptografados em repouso | SAAS | Colunas cifradas | Não |
| SEC-023 | Dado sensível nunca é logado | BASE | Redação automática no logger | Sim |
| SEC-024 | Mascaramento de dado sensível na interface | SAAS | CPF/cartão mascarados | Não |
| SEC-025 | Base legal e finalidade documentadas (LGPD) | SAAS | Registro de tratamento | Não |
| SEC-026 | Titular pode acessar, corrigir e excluir dados | SAAS | Fluxo implementado | Não |
| SEC-027 | Política de retenção com expurgo automatizado | SAAS | Job de expurgo ativo | Sim |
| SEC-028 | Modelagem de ameaça em feature sensível | FIN | Documento no PR | Não |
| SEC-029 | Plano de resposta a incidente documentado | FIN | Runbook existente | Não |
| SEC-030 | Detecção de comportamento anômalo com alerta | FIN | Alertas configurados | Não |
| SEC-031 | Antivírus em arquivo compartilhado entre usuários | FIN | Varredura no upload | Sim |
| SEC-032 | Revisão de segurança antes do deploy | BASE | Checklist da DoD aprovado | Não |
