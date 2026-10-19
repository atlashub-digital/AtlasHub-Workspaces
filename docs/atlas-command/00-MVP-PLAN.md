# Helena Atlas Command — Gate G0 / proposta de integração

Missão-mãe: [Workspaces #3](https://github.com/atlashub-digital/AtlasHub-Workspaces/issues/3). Execução frontend: [#4](https://github.com/atlashub-digital/AtlasHub-Workspaces/issues/4).

## O que este PR entrega
Contratos e testes iniciais (sem UI ativa): eventos tipados de Helena Voice, Knowledge Galaxy e REA; verificação defensiva de payload de grafo e regra de ownership para evitar duas vozes em simultâneo. **Não está ligado à Helena nem a dados reais.**

## Caminho da aplicação
- `/o/[tenant]/command` será implementado dentro do layout protegido atual, não em domínio/SPA separado.
- Workspaces mantém o login e a autoridade do Platform Core; nenhum novo backend de autenticação.
- Backend Core integra o gateway Hermes (perfil Helena existente) e o Knowledge Gateway autorizado. Os detalhes de API, streaming, autenticação e áudio dependem da versão efetivamente instalada.
- A Knowledge Galaxy usa `3d-force-graph` com foco, clusters, links, inspector e fallback 2D/reduced-motion; sem recursos externos/CDN silenciosos.
- A galáxia só recebe nodes/edges **já filtrados pelo backend**; `validateGalaxyPayload` é defesa adicional, não política de acesso.

## O que ainda falta — Claude Code + Helena
1. Helena: prova de identidade da Helena existente, gateway, sessões, STT/TTS e permissões, versão e rollback; sem expor segredos.
2. Claude Code: adaptar o cliente Hermes validado, suportar saída em PT, microfone/voz e mensagens de erro sem estados falsos.
3. Claude Code: página autenticada com 3D Force Graph; fontes reais e link para documento, não fixture em modo API.
4. Claude Code: contrato efetivo Knowledge Gateway v1, filtros cross-tenant + ACL antes de retrieval e renderização; Helena valida permissões.
5. Claude Code: investigação técnica, integração REA isolada e relatório sujeito a revisão; Helena aprova execução no ambiente.
6. CI `npm test && npm run lint && npm run typecheck && npm run build`; smoke visual a 390/768/1440; WebKit/microfone onde aplicável.

## Regra operacional — Owner único
Claude Code é o Engineering Lead único condicionado ao acesso controlado a staging. Helena é Operations & Infrastructure Lead, incluindo Cloudflare, Vercel, Supabase, credenciais e homologação. Se não for viável disponibilizar um ambiente seguro ao Claude Code, Codex substitui-o integralmente, sem paralelismo ou fragmentação entre agentes. Não atribuir trabalho a Íris/Rui neste MVP.

## Não fazer
Nenhuma mudança ao Visual Pack V1, Helena production config, VPS, pagamentos, segredo, migração ou deploy sem gate. Neste repositório público não inserir nomes de clientes, logs, credenciais ou URLs internas.
