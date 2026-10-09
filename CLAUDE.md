# CLAUDE.md — AtlasHub Workspaces

Frontend autenticado (Next 16, React 19, Tailwind 4, TypeScript estrito) sobre o AtlasHub Platform Core (`AtlasHub-AI-WaaS`). Responsável técnico: Claude Code (FE+BE). Revisão independente: Codex oficial. Detalhe: `README.md`.

## Comandos
Node ≥ 22. `npm test` → `npm run lint` → `npm run typecheck` → `npm run build` (a CI corre os quatro).

## Regras de ouro
1. **Um backend:** todos os dados vêm do Core. Não criar APIs, auth, catálogos de Workers nem entitlements próprios aqui.
2. **O Core decide:** o frontend esconde o que não está ativo, mas a autorização é sempre do Core (401/403/404). Não confiar em verificações só de UI.
3. **Isolamento:** tudo o que é de tenant é pedido com `?tenant=` ou na rota `/o/[tenant]`. Sem membership → 404.
4. **Sem dados reais:** o modo demo usa só fixtures sintéticas, emails `@example.test` e designações genéricas ("Cliente-piloto A/B/C"). Este repositório é **público**: nunca nomes reais de clientes ou pilotos (o mapeamento vive no `atlas-ops`, privado), segredos, IPs ou hostnames internos.
5. **Pilotos internos** (ventures próprias, ADR-0003) nunca são apresentados como clientes externos.
6. **Visual Pack V1 intocável:** usar os tokens e componentes `ah-*`/`ws-*` existentes; alterações de marca exigem o Founder.
7. **Acessibilidade:** alvos ≥ 44 px, `button`/`a` reais, `aria-label` em botões só com ícone, sem scroll horizontal a 390/768/1440 px.
8. **Sem deploy de produção** sem gate (P0: login real, RBAC+RLS, entitlements no backend, TLS/DNS revistos, aprovação do Founder).

## O que não mexer
- `public/fonts/*` e `public/assets/atlashub-logo.webp`: cópias do Visual Pack (licenças OFL incluídas).
- `src/lib/core/fixtures.ts`: só dados sintéticos; os testes falham se aparecerem emails reais ou nomes não genéricos.
