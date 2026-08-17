# 07 — Autenticação

Prefixo de requisitos: `AUTH`
Base normativa: **OWASP ASVS 5.0 — capítulos 2 (autenticação) e 3 (sessão)**

Este é o "núcleo de identidade": o módulo que todo sistema tem e que quase todo
sistema implementa pela metade.

---

## Rotas obrigatórias

```
/auth
  /login
  /register              quando há autocadastro
  /forgot-password
  /reset-password
  /verify-email
  /logout
  /refresh-token

/account
  /profile               nome, foto, dados pessoais
  /email                 alteração com confirmação no e-mail antigo e novo
  /password              alteração exigindo a senha atual
  /security              2FA, dispositivos
  /sessions              sessões ativas com opção de encerrar
  /notifications         preferências
```

Em sistemas mais sensíveis, acrescente `/2fa`, `/devices`, `/api-keys`.

## Fluxo de cadastro

```
Cadastrar
   ↓ validar dados (força de senha, e-mail válido, unicidade)
Criar usuário (status: pendente)
   ↓ hash da senha (Argon2id)
Enviar e-mail de verificação (token único, expira em 24h)
   ↓
Usuário verifica → status: ativo
   ↓
Login → Dashboard
```

## Fluxo de recuperação de senha

```
Esqueci minha senha
   ↓ informar e-mail
Gerar token: aleatório, ≥128 bits, armazenado como HASH, uso único, expira em 1h
   ↓
Enviar e-mail
   ↓ (resposta ao usuário é SEMPRE a mesma, exista o e-mail ou não)
Usuário acessa o link
   ↓ nova senha + confirmação
Invalidar token
   ↓
Invalidar todas as sessões ativas
   ↓
Notificar por e-mail que a senha foi alterada
   ↓
Login
```

Os detalhes que quase toda aplicação esquece — e que aqui são obrigatórios:

- token **expira**
- token é de **uso único**
- token é guardado **hasheado** no banco (vazamento do banco não dá acesso)
- a resposta **não revela** se o e-mail existe (user enumeration)
- rate limit por e-mail e por IP na solicitação
- sessões antigas são invalidadas após a troca
- o usuário é **notificado** da alteração
- o evento vai para o log de segurança

## Senhas

- Mínimo 12 caracteres. Sem exigência de "1 maiúscula + 1 símbolo" — comprimento
  vence composição (ASVS 5.0).
- Verificar contra lista de senhas vazadas (k-anonymity / HaveIBeenPwned).
- Permitir colar e permitir gerenciador de senhas. Nunca bloquear `paste`.
- Sem expiração periódica compulsória. Trocar senha só em suspeita de compromisso.
- Hash: **Argon2id** (preferido) ou bcrypt cost ≥ 12.
- Comparação em tempo constante.

## Sessão

| Item | Regra |
| --- | --- |
| Access token | JWT curto, 15 min |
| Refresh token | 7–30 dias, **rotativo**, armazenado hasheado |
| Reuso de refresh | Detectado → revoga toda a família de tokens |
| Transporte (web) | Cookie `httpOnly` + `Secure` + `SameSite=Lax/Strict` |
| Logout | Invalida refresh no servidor — não basta apagar no cliente |
| Sessão inativa | Expira (padrão 30 dias; 30 min em sistema financeiro) |
| Troca de senha | Invalida todas as sessões |
| Regeneração | Novo ID de sessão a cada login e a cada elevação de privilégio |

## Proteção contra abuso

- Rate limit no login: por IP **e** por conta.
- Bloqueio progressivo (backoff) após tentativas falhas, sem permitir que isso
  vire negação de serviço contra o usuário legítimo.
- Mensagem de falha de login sempre genérica: "E-mail ou senha inválidos."
- CAPTCHA ou desafio após N falhas.
- Tempo de resposta constante entre "usuário não existe" e "senha errada".

## MFA

Obrigatório para perfil `FIN` e para contas administrativas em `SAAS`.

- TOTP (RFC 6238) como padrão. SMS só como fallback.
- Códigos de recuperação gerados uma vez, exibidos uma vez, guardados hasheados.
- Desativar MFA exige senha atual + confirmação por e-mail.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| AUTH-001 | Login com credenciais validadas no servidor | BASE | Endpoint funcional e testado | Sim |
| AUTH-002 | Logout invalida a sessão no servidor | BASE | Refresh token revogado | Sim |
| AUTH-003 | Senha armazenada com Argon2id ou bcrypt ≥ 12 | BASE | Verificado no código | Sim |
| AUTH-004 | Senha mínima de 12 caracteres | BASE | Validação no servidor | Sim |
| AUTH-005 | Bloqueio de senhas vazadas conhecidas | REC | Verificação contra base de leaks | Sim |
| AUTH-006 | Colar senha e gerenciadores permitidos | BASE | Sem bloqueio de `paste` | Sim |
| AUTH-007 | Recuperação de senha disponível | BASE | Fluxo completo funcionando | Sim |
| AUTH-008 | Token de recuperação expira | BASE | Máximo 1h | Sim |
| AUTH-009 | Token de recuperação de uso único | BASE | Segundo uso é rejeitado | Sim |
| AUTH-010 | Token armazenado hasheado | BASE | Banco não contém token em claro | Sim |
| AUTH-011 | Resposta não revela existência de e-mail | BASE | Mesma resposta e mesmo tempo | Sim |
| AUTH-012 | Sessões invalidadas após troca de senha | BASE | Sessões antigas param de funcionar | Sim |
| AUTH-013 | Usuário notificado por e-mail em troca de senha | BASE | E-mail enviado | Sim |
| AUTH-014 | Verificação de e-mail no cadastro | BASE | Conta inativa até verificar | Sim |
| AUTH-015 | Alteração de e-mail confirmada nos dois endereços | BASE | Confirmação dupla | Sim |
| AUTH-016 | Alteração de senha exige a senha atual | BASE | Validado no servidor | Sim |
| AUTH-017 | Access token de curta duração | BASE | ≤ 15 min | Sim |
| AUTH-018 | Refresh token rotativo com detecção de reuso | BASE | Reuso revoga a família | Sim |
| AUTH-019 | Cookie de sessão `httpOnly`, `Secure`, `SameSite` | BASE | Flags presentes | Sim |
| AUTH-020 | Rate limit no login por IP e por conta | BASE | 429 após limite | Sim |
| AUTH-021 | Mensagem de falha de login genérica | BASE | Sem distinção de causa | Sim |
| AUTH-022 | Backoff progressivo após falhas | BASE | Atraso crescente | Sim |
| AUTH-023 | ID de sessão regenerado no login | BASE | Sem fixação de sessão | Sim |
| AUTH-024 | Expiração por inatividade | BASE | Configurada e testada | Sim |
| AUTH-025 | Listagem e encerramento de sessões ativas | SAAS | Tela `/account/sessions` | Não |
| AUTH-026 | MFA via TOTP disponível | SAAS | Ativação e verificação funcionando | Sim |
| AUTH-027 | MFA obrigatório para administradores | FIN | Login admin exige segundo fator | Sim |
| AUTH-028 | Códigos de recuperação de MFA hasheados e de uso único | FIN | Verificado no código | Sim |
| AUTH-029 | Eventos de autenticação registrados em log de segurança | BASE | Login, falha, logout, reset, MFA | Sim |
| AUTH-030 | Nenhum dado sensível de autenticação em log | BASE | Sem senha ou token nos logs | Sim |
