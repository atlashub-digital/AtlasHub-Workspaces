// Synthetic sandbox data. Fictitious organisations, people and numbers only — no real client data.
// Public repository: client pilots use generic designations; the private mapping lives in atlas-ops.
import type { Approval, Deployment, Entitlement, MembershipSummary, Project, RoleSummary, Run, RunState } from "../contract.ts";

export const DEMO_TENANTS = [
  { id: "pilot-a-sandbox", name: "Cliente-piloto A", tagline: "Comércio digital e marketing", kind: "internal_pilot" as const },
  { id: "pilot-b-sandbox", name: "Cliente-piloto B", tagline: "Investigação e produção de conteúdo", kind: "internal_pilot" as const },
  { id: "pilot-c-sandbox", name: "Cliente-piloto C", tagline: "Suporte, comunidade e assistência especializada", kind: "internal_pilot" as const },
  // Isolation tests only: no projects of its own beyond a smoke project, never shown as a client.
  { id: "atlas-synthetic-qa", name: "AtlasHub QA", tagline: "Testes de isolamento (sintético)", kind: "qa" as const },
];

export const DEMO_USERS: Record<string, { displayName: string; email: string; memberships: Omit<MembershipSummary, "name">[] }> = {
  "demo-admin-a": { displayName: "Ana (admin · A)", email: "admin-a@example.test", memberships: [{ tenantId: "pilot-a-sandbox", role: "tenant_admin" }] },
  "demo-viewer-b": { displayName: "Bruno (leitura · B)", email: "viewer-b@example.test", memberships: [{ tenantId: "pilot-b-sandbox", role: "tenant_user" }] },
  "demo-admin-c": { displayName: "Carla (admin · C)", email: "admin-c@example.test", memberships: [{ tenantId: "pilot-c-sandbox", role: "tenant_admin" }] },
  "demo-qa": { displayName: "QA (leitura · sintético)", email: "qa@example.test", memberships: [{ tenantId: "atlas-synthetic-qa", role: "tenant_user" }] },
  "demo-supervisor-1": {
    displayName: "Supervisor AtlasHub 1",
    email: "supervisor-1@example.test",
    memberships: [
      { tenantId: "pilot-a-sandbox", role: "atlas_operator" },
      { tenantId: "pilot-b-sandbox", role: "atlas_operator" },
    ],
  },
  "demo-supervisor-2": { displayName: "Supervisora AtlasHub 2", email: "supervisor-2@example.test", memberships: [{ tenantId: "pilot-c-sandbox", role: "atlas_operator" }] },
};

const SUPERVISOR = {
  "pilot-a-sandbox": { userId: "demo-supervisor-1", displayName: "Supervisor AtlasHub 1" },
  "pilot-b-sandbox": { userId: "demo-supervisor-1", displayName: "Supervisor AtlasHub 1 (interino)" },
  "pilot-c-sandbox": { userId: "demo-supervisor-2", displayName: "Supervisora AtlasHub 2" },
} as const;
export const supervisorOf = (tenantId: string) => SUPERVISOR[tenantId as keyof typeof SUPERVISOR] ?? null;

/** Catalogue names (Core: catalog_mission_template i18n pt-BR; packs 0.3.x). Proposed items are not deployable yet. */
export const ROLES: RoleSummary[] = [
  { id: "ROLE-001", name: "Confirmação de consultas", status: "demo" },
  { id: "ROLE-002", name: "Assistente Comercial", status: "demo" },
  { id: "ROLE-003", name: "Secretária Administrativa", status: "demo" },
  { id: "ROLE-004", name: "Consultor Imobiliário Digital", status: "demo" },
  { id: "ROLE-005", name: "Assistente E-commerce", status: "demo" },
  { id: "ROLE-006", name: "Assistente de Marketing", status: "demo" },
  { id: "ROLE-007", name: "Assistente Financeiro Administrativo", status: "demo" },
  { id: "ROLE-008", name: "Assistente de RH", status: "demo" },
  { id: "ROLE-EXPERT", name: "Atlas Expert", status: "proposed" },
  { id: "AMI-MI", name: "AMI · Market Intelligence", status: "proposed" },
  { id: "AMI-OFFER", name: "AMI · Offer Research", status: "proposed" },
  { id: "AMI-ANALYTICS", name: "AMI · Growth Analytics", status: "proposed" },
];
export const roleName = (id: string) => ROLES.find((r) => r.id === id)?.name ?? id;

const grant = (tenantId: string, key: string): Entitlement & { tenantId: string } => ({
  tenantId,
  key,
  source: "grant",
  quantity: null,
  validFrom: "2026-10-01T00:00:00.000Z",
  validUntil: null,
  status: "active",
});

// Same module sets as the Core's synthetic pilot seed (AtlasHub-AI-WaaS scripts/seed-pilots.mjs).
export const ENTITLEMENTS: (Entitlement & { tenantId: string })[] = [
  grant("pilot-a-sandbox", "module.workforce"),
  grant("pilot-a-sandbox", "module.ami"),
  grant("pilot-b-sandbox", "module.workforce"),
  grant("pilot-b-sandbox", "module.media"),
  grant("pilot-c-sandbox", "module.workforce"),
  grant("pilot-c-sandbox", "module.community"),
  grant("atlas-synthetic-qa", "module.workforce"),
  // An expired trial must never unlock anything (tests rely on it).
  { tenantId: "pilot-c-sandbox", key: "module.ami", source: "trial", quantity: null, validFrom: "2026-09-01T00:00:00.000Z", validUntil: "2026-09-08T00:00:00.000Z", status: "expired" },
];

const p = (tenantId: string, slug: string, name: string, summary: string, modules: Project["modules"], deploymentIds: string[]): Project => ({
  id: `${tenantId}:${slug}`,
  tenantId,
  slug,
  name,
  summary,
  status: "sandbox",
  modules,
  supervisor: supervisorOf(tenantId),
  deploymentIds,
});

export const PROJECTS: Project[] = [
  p("pilot-a-sandbox", "inteligencia-mercado", "Inteligência de mercado", "Anúncios e ofertas de fontes autorizadas, com proveniência e custo por recolha.", ["ami"], []),
  p("pilot-a-sandbox", "comercio-digital", "Comércio digital", "Catálogo, encomendas e atendimento da loja.", ["workforce"], ["dep-a-005"]),
  p("pilot-a-sandbox", "operacoes-marketing", "Operações de marketing", "Calendário, campanhas e conteúdo com aprovação por peça.", ["workforce"], ["dep-a-006"]),
  p("pilot-b-sandbox", "investigacao", "Investigação", "Recolha de fontes e sínteses com referência, revistas por pessoa.", ["workforce"], ["dep-b-006"]),
  p("pilot-b-sandbox", "producao-conteudo", "Produção de conteúdo", "Guiões, rascunhos e calendário editorial com aprovação por peça.", ["workforce", "media"], ["dep-b-003"]),
  p("pilot-c-sandbox", "suporte", "Suporte", "Pedidos frequentes e encaminhamento para a equipa.", ["workforce"], ["dep-c-005"]),
  p("pilot-c-sandbox", "comunidade", "Comunidade", "Espaço de membros com consentimento e escalonamento humano.", ["community"], []),
  p("pilot-c-sandbox", "assistencia-especializada", "Assistência especializada", "Respostas revistas por especialistas; sem dados pessoais nem clínicos no sandbox.", ["workforce"], ["dep-c-003"]),
  p("atlas-synthetic-qa", "smoke", "Smoke de isolamento", "Projeto técnico para testes A/B entre tenants.", ["workforce"], ["dep-q-003"]),
];

const d = (id: string, tenantId: string, roleId: string, projectId: string | null): Deployment => ({
  id,
  tenantId,
  roleId,
  packReleaseId: roleId === "ROLE-EXPERT" ? "atlas-integration-expert@0.0.0-proposed" : `PACK-${roleId.slice(5)}@0.x`,
  state: "sandbox",
  projectId,
  createdAt: "2026-10-09T12:00:00.000Z",
});

export const DEPLOYMENTS: Deployment[] = [
  d("dep-a-005", "pilot-a-sandbox", "ROLE-005", "pilot-a-sandbox:comercio-digital"),
  d("dep-a-006", "pilot-a-sandbox", "ROLE-006", "pilot-a-sandbox:operacoes-marketing"),
  d("dep-a-expert", "pilot-a-sandbox", "ROLE-EXPERT", null),
  d("dep-b-006", "pilot-b-sandbox", "ROLE-006", "pilot-b-sandbox:investigacao"),
  d("dep-b-003", "pilot-b-sandbox", "ROLE-003", "pilot-b-sandbox:producao-conteudo"),
  d("dep-b-expert", "pilot-b-sandbox", "ROLE-EXPERT", null),
  d("dep-c-005", "pilot-c-sandbox", "ROLE-005", "pilot-c-sandbox:suporte"),
  d("dep-c-003", "pilot-c-sandbox", "ROLE-003", "pilot-c-sandbox:assistencia-especializada"),
  d("dep-c-expert", "pilot-c-sandbox", "ROLE-EXPERT", null),
  d("dep-q-003", "atlas-synthetic-qa", "ROLE-003", "atlas-synthetic-qa:smoke"),
  d("dep-q-expert", "atlas-synthetic-qa", "ROLE-EXPERT", null),
];

/** Deterministic synthetic runs, relative to `now` so screens always look current. */
export function runsFor(tenantId: string, now: Date): Run[] {
  const plan: [string, RunState, number, string][] = [
    ["005", "completed", 2, "Pedido sintético #1042: estado de encomenda respondido"],
    ["006", "awaiting_approval", 3, "Rascunho de publicação aguarda aprovação"],
    ["005", "completed", 7, "Reembolso sintético encaminhado para pessoa"],
    ["006", "completed", 26, "Calendário editorial da semana preparado"],
    ["003", "completed", 5, "Pedido de agenda sintético confirmado"],
    ["003", "blocked", 30, "Pedido fora do âmbito: escalado"],
    ["expert", "completed", 50, "Plano de integração (rascunho)"],
  ];
  const deps = DEPLOYMENTS.filter((x) => x.tenantId === tenantId);
  const out: Run[] = [];
  plan.forEach(([suffix, state, hoursAgo, summary], i) => {
    const dep = deps.find((x) => x.id.endsWith(suffix));
    if (!dep) return;
    const startedAt = new Date(now.getTime() - hoursAgo * 3_600_000);
    out.push({
      id: `run-${tenantId.slice(6, 7)}-${String(i + 1).padStart(3, "0")}`,
      tenantId,
      deploymentId: dep.id,
      state,
      attempts: state === "blocked" ? 1 : 1,
      startedAt: startedAt.toISOString(),
      finishedAt: state === "completed" || state === "blocked" ? new Date(startedAt.getTime() + 90_000).toISOString() : null,
      costEstimate: "0",
      summary,
    });
  });
  return out;
}

export function approvalsFor(tenantId: string, now: Date): Approval[] {
  const runs = runsFor(tenantId, now);
  const waiting = runs.filter((r) => r.state === "awaiting_approval");
  const list: Approval[] = waiting.map((r, i) => ({
    id: `apr-${r.id}`,
    tenantId,
    runId: r.id,
    requestedAction: "tool:content.publish_draft",
    state: "pending",
    expiresAt: new Date(now.getTime() + (40 - i * 10) * 60_000).toISOString(),
    resolvedAt: null,
    summary: "Publicar rascunho no canal de teste (sem efeito externo em sandbox)",
  }));
  if (runs[0])
    list.push({
      id: `apr-${runs[0].id}-old`,
      tenantId,
      runId: runs[0].id,
      requestedAction: "tool:commerce.refund_request",
      state: "pending",
      expiresAt: new Date(now.getTime() - 30 * 60_000).toISOString(),
      resolvedAt: null,
      summary: "Pedido de reembolso sintético (expirado, sem decisão)",
    });
  return list;
}

export const EXPERT_POLICIES = [
  { tool: "expert.read_context", policy: "auto" },
  { tool: "expert.draft_plan", policy: "auto" },
  { tool: "expert.propose_integration", policy: "approval" },
  { tool: "expert.propose_composition", policy: "approval" },
  { tool: "expert.request_run", policy: "approval" },
  { tool: "shell · segredos · DNS · deploy · pagamentos · publicação · gasto", policy: "forbidden" },
] as const;
