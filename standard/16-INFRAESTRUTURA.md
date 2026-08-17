# 16 — Infraestrutura, Backup e Continuidade

Prefixo de requisitos: `INF`

Antes de pensar na tela, o projeto define a fundação. É a parte da "casa" que
ninguém vê e sem a qual nada se sustenta.

---

## Checklist de fundação

Todo projeto novo define, antes da primeira linha de código de negócio:

```
□ domínio e subdomínios
□ DNS
□ certificado TLS + renovação automática
□ ambiente de desenvolvimento
□ ambiente de homologação (staging)
□ ambiente de produção
□ banco de dados (instância, versão, dimensionamento)
□ armazenamento de arquivos
□ serviço de e-mail transacional (com SPF, DKIM, DMARC)
□ cache / filas
□ agregação de logs
□ monitoramento e alertas
□ rastreamento de erros
□ backups
□ variáveis de ambiente
□ gerenciamento de segredos
□ CI/CD
□ política de rollback
```

```
PROJETO
├── DEV
│   ├── frontend
│   ├── backend
│   └── database
├── STAGING
│   ├── frontend
│   ├── backend
│   └── database
└── PRODUÇÃO
    ├── frontend
    ├── backend
    ├── database
    ├── storage
    ├── cache
    └── monitoring
```

## Backup

Regra **3-2-1**: 3 cópias, 2 mídias/destinos diferentes, 1 fora do ambiente
principal.

| Item | Regra |
| --- | --- |
| Frequência | Diário no mínimo; contínuo (PITR) em `FIN` |
| Retenção | 7 diários + 4 semanais + 12 mensais |
| Criptografia | Em repouso e em trânsito |
| Localização | Pelo menos uma cópia fora da mesma conta/região |
| Teste de restauração | **Trimestral**, com resultado registrado |
| Escopo | Banco + arquivos + configuração/segredos |

> Backup não testado não é backup. É esperança com custo de armazenamento.

## RPO e RTO

Todo projeto declara:

- **RPO** (perda máxima aceitável de dados): quanto de trabalho pode se perder?
- **RTO** (tempo máximo para voltar): quanto tempo o sistema pode ficar fora?

Defaults: sistema interno RPO 24h / RTO 8h. Sistema `FIN` RPO 15min / RTO 1h.

Esses números definem a arquitetura de backup e redundância — não o contrário.

## Domínio, DNS e TLS

- HTTPS com renovação automática e alerta 14 dias antes de expirar.
- SPF, DKIM e DMARC configurados no domínio de envio — sem isso o e-mail de
  recuperação de senha cai no spam e o fluxo de auth "não funciona".
- TTL de DNS adequado antes de qualquer migração planejada.

## Isolamento e acesso

- Banco de dados **nunca** exposto à internet pública.
- Acesso administrativo por VPN/bastion, com MFA.
- Princípio do menor privilégio para credenciais de aplicação — a aplicação não
  precisa de superusuário no banco.
- Acesso de pessoas revisado periodicamente; desligamento revoga no mesmo dia.
- Firewall com regra de negação padrão.

## Recuperação de desastre

Documento com: o que fazer, em que ordem, quem aciona, onde estão os backups,
como restaurar, como validar, como comunicar. Testado ao menos uma vez por ano.

---

## Requisitos

| ID | Requisito | Perfil | Critério de aceite | Auto |
| --- | --- | --- | --- | --- |
| INF-001 | Checklist de fundação preenchido antes do desenvolvimento | BASE | Registrado em `.ai/PROJECT-CONTEXT.md` | Não |
| INF-002 | Três ambientes provisionados | BASE | Dev, staging, produção | Não |
| INF-003 | TLS com renovação automática | BASE | Certificado válido, renovação testada | Sim |
| INF-004 | Alerta de expiração de certificado | BASE | 14 dias de antecedência | Sim |
| INF-005 | SPF, DKIM e DMARC configurados | BASE | Verificado por ferramenta de DNS | Sim |
| INF-006 | Backup automático do banco | BASE | Diário no mínimo | Sim |
| INF-007 | Backup de arquivos e configuração | BASE | Incluídos na rotina | Sim |
| INF-008 | Backup criptografado | BASE | Em repouso e trânsito | Sim |
| INF-009 | Cópia de backup fora do ambiente principal | BASE | Região/conta distinta | Não |
| INF-010 | Retenção de backup definida e aplicada | BASE | 7/4/12 ou política própria | Sim |
| INF-011 | Restauração testada trimestralmente | BASE | Registro do teste | Não |
| INF-012 | RPO e RTO declarados | BASE | Documentados | Não |
| INF-013 | Plano de recuperação de desastre documentado | SAAS | Runbook existente | Não |
| INF-014 | Plano de DR testado anualmente | FIN | Registro do exercício | Não |
| INF-015 | Banco de dados sem exposição pública | BASE | Sem porta aberta na internet | Sim |
| INF-016 | Acesso administrativo por VPN/bastion com MFA | BASE | Verificado | Não |
| INF-017 | Credencial da aplicação com menor privilégio | BASE | Sem superusuário | Não |
| INF-018 | Firewall com negação padrão | BASE | Regras explícitas de liberação | Sim |
| INF-019 | Revisão periódica de acessos | SAAS | Trimestral, registrada | Não |
| INF-020 | Revogação de acesso no desligamento | BASE | Mesmo dia | Não |
| INF-021 | PITR habilitado | FIN | Recuperação por ponto no tempo | Sim |
| INF-022 | Monitoramento de disco, memória e conexões | BASE | Alertas configurados | Sim |
| INF-023 | Infraestrutura descrita como código ou documentada | REC | IaC ou runbook de provisionamento | Não |
| INF-024 | Custo de infraestrutura monitorado | REC | Alerta de anomalia de custo | Sim |
