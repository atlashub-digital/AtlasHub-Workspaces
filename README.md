# AtlasHub Workspaces

**Único frontend autenticado** da AtlasHub, multi-produto e organizado por **organizações (tenants) e projetos**. Mostra colaboradores digitais (Workforce), o **Atlas Expert** de cada organização, módulos de produto como o **AMI**, aprovações e consumo. Todos os dados vêm do **AtlasHub Platform Core** (`AtlasHub-AI-WaaS`), que é a única fonte de autenticação, tenants, entitlements, deployments, runs, approvals, usage e auditoria.

> **Estado:** shell inicial (G2) em `feat/workspaces-shell`, sem deploy de produção. Por omissão corre em **modo demonstração**, com dados 100 % sintéticos.

## Correr

```bash
npm ci
npm run dev          # http://localhost:3000 → /login (personas fictícias)
npm test             # regras de acesso e isolamento (node --test)
npm run lint && npm run typecheck && npm run build
```

Verificação visual e de isolamento (precisa de Playwright e de um `next start` a correr):

```bash
PLAYWRIGHT=<caminho do playwright> node scripts/visual-check.mjs http://localhost:3103 docs/evidence
```

## Modos

| `CORE_MODE` | Dados | Login |
|---|---|---|
| (vazio ou outro valor) | Nenhum | Ecrã "piloto controlado" com pedido de acesso pelo WhatsApp |
| `demo` | Fixtures sintéticas (`src/lib/core/fixtures.ts`), com o mesmo isolamento por membership do Core. **Recusado em `VERCEL_ENV=production`** | Personas fictícias |
| `api` | BFF → Core (`CORE_API_URL` em HTTPS), com o token em cookie HttpOnly. Sem `CORE_API_URL`/`SUPABASE_*` válidos → como vazio | Supabase Auth (o mesmo projeto que o Core verifica por JWKS) |

Regras em `src/lib/mode.ts` (testadas em `tests/mode.test.ts`). Para desenvolvimento: `CORE_MODE=demo npm run dev`.

Tenants sintéticos (iguais aos do Core, `AtlasHub-AI-WaaS/scripts/seed-pilots.mjs`): `pilot-a-sandbox` (Workforce + AMI), `pilot-b-sandbox` (Workforce + Media), `pilot-c-sandbox` (Workforce + Comunidade), `atlas-synthetic-qa` (testes de isolamento).

## Arquitetura

- `src/lib/contract.ts`: tipos do contrato Workspaces ↔ Core (rascunho `docs/workspaces/core-workspaces-v1.draft.openapi.json` no AI-WaaS).
- `src/lib/access.ts`: regras puras de acesso e navegação (entitlements → módulos → menu). **O Core é a autoridade**; esconder um menu não dá nem tira acesso.
- `src/lib/core/{types,demo,http}.ts`: a mesma interface com duas implementações.
- `src/app/o/[tenant]/…`: visão geral, projetos, Workforce, Atlas Expert, AMI, Comunidade, Aprovações e Uso.
- **Visual Pack V1 preservado:** tokens, fontes (Figtree, Barlow Semi Condensed), logótipo e componentes `ah-*` iguais aos do `app.atlashub.si` e `atlashub.si`. A maquete 05 é a referência visual, implementada com componentes reais.

## Regras

Ver [`CLAUDE.md`](CLAUDE.md).
