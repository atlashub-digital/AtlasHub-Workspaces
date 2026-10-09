// Synthetic Core: same contract and the same isolation rule as the real API — a user only reaches tenants
// where they hold an active membership; anything else is 403, exactly like identity() in the Core.
import { activeKeys, modulesFrom } from "../access.ts";
import { CoreError } from "../contract.ts";
import type { Approval, Deployment, EntitlementsResponse, ExpertStatus, Me, Project, RoleSummary, Run, RunState, UsageSummary } from "../contract.ts";
import { approvalsFor, DEMO_TENANTS, DEMO_USERS, DEPLOYMENTS, ENTITLEMENTS, EXPERT_POLICIES, PROJECTS, ROLES, runsFor, supervisorOf } from "./fixtures.ts";
import type { Core } from "./types.ts";

export class DemoCore implements Core {
  readonly mode = "demo" as const;
  private readonly userId: string;
  private readonly now: () => Date;
  constructor(userId: string, now: () => Date = () => new Date()) {
    this.userId = userId;
    this.now = now;
  }

  private guard(tenant: string) {
    const user = DEMO_USERS[this.userId];
    if (!user) throw new CoreError(401, "Sessão inválida");
    if (!user.memberships.some((m) => m.tenantId === tenant)) throw new CoreError(403, "Sem membership neste tenant");
  }

  private modulesOf(tenant: string) {
    return modulesFrom(activeKeys(ENTITLEMENTS.filter((e) => e.tenantId === tenant), this.now()));
  }

  async me(): Promise<Me> {
    const user = DEMO_USERS[this.userId];
    if (!user) throw new CoreError(401, "Sessão inválida");
    return {
      sub: this.userId,
      email: user.email,
      displayName: user.displayName,
      memberships: user.memberships.map((m) => {
        const t = DEMO_TENANTS.find((x) => x.id === m.tenantId)!;
        return { ...m, name: t.name, tenantStatus: "active", tenantKind: t.kind, sandbox: true, modules: this.modulesOf(m.tenantId) };
      }),
    };
  }

  async entitlements(tenant: string): Promise<EntitlementsResponse> {
    this.guard(tenant);
    const items = ENTITLEMENTS.filter((e) => e.tenantId === tenant).map((e) => ({ key: e.key, source: e.source, quantity: e.quantity, validFrom: e.validFrom, validUntil: e.validUntil, status: e.status }));
    return { tenantId: tenant, modules: this.modulesOf(tenant), items };
  }

  async projects(tenant: string): Promise<Project[]> {
    this.guard(tenant);
    return PROJECTS.filter((p) => p.tenantId === tenant);
  }

  async deployments(tenant: string): Promise<Deployment[]> {
    this.guard(tenant);
    return DEPLOYMENTS.filter((x) => x.tenantId === tenant);
  }

  async runs(tenant: string, opts: { state?: RunState; deploymentId?: string; limit?: number } = {}): Promise<Run[]> {
    this.guard(tenant);
    return runsFor(tenant, this.now())
      .filter((r) => (!opts.state || r.state === opts.state) && (!opts.deploymentId || r.deploymentId === opts.deploymentId))
      .slice(0, opts.limit ?? 50);
  }

  async approvals(tenant: string): Promise<Approval[]> {
    this.guard(tenant);
    return approvalsFor(tenant, this.now());
  }

  async usageSummary(tenant: string, from: Date, to: Date): Promise<UsageSummary> {
    this.guard(tenant);
    const runs = runsFor(tenant, this.now()).filter((r) => {
      const t = Date.parse(r.startedAt);
      return t >= from.getTime() && t <= to.getTime();
    });
    const counts: UsageSummary["runs"] = {};
    for (const r of runs) counts[r.state] = (counts[r.state] ?? 0) + 1;
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      runs: counts,
      metrics: [{ metric: "role_action", unit: "action", quantity: runs.filter((r) => r.state === "completed").length, estimatedCost: "0", currency: "BRL" }],
    };
  }

  async expert(tenant: string): Promise<ExpertStatus> {
    this.guard(tenant);
    const dep = DEPLOYMENTS.find((x) => x.tenantId === tenant && x.roleId === "ROLE-EXPERT") ?? null;
    const plans = runsFor(tenant, this.now())
      .filter((r) => r.deploymentId === dep?.id)
      .map((r) => ({ ...r, title: r.summary ?? "Plano" }));
    return {
      tenantId: tenant,
      enabled: Boolean(dep),
      deploymentId: dep?.id ?? null,
      state: dep?.state ?? null,
      supervisor: supervisorOf(tenant),
      policies: EXPERT_POLICIES.map((x) => ({ ...x })),
      recentPlans: plans,
    };
  }

  async roles(): Promise<RoleSummary[]> {
    return ROLES;
  }
}

export const DEMO_PERSONAS = Object.entries(DEMO_USERS).map(([id, u]) => ({ id, label: u.displayName }));
