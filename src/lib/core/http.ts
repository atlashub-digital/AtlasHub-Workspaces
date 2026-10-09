import "server-only";
import { CoreError } from "../contract.ts";
import type { Approval, Deployment, EntitlementsResponse, ExpertStatus, Me, MembershipSummary, Project, RoleSummary, Run, RunState, UsageSummary } from "../contract.ts";
import type { Core } from "./types.ts";

/** BFF → Core. Runs only on the server; the access token never reaches browser JavaScript. */
export class HttpCore implements Core {
  readonly mode = "api" as const;
  private readonly base: string;
  private readonly token: string;
  constructor(base: string, token: string) {
    this.base = base;
    this.token = token;
    const url = new URL(base);
    if (url.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(url.hostname)) throw new Error("CORE_API_URL must use HTTPS");
  }

  private async get<T>(path: string, query: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = new URL(path, this.base);
    for (const [k, v] of Object.entries(query)) if (v !== undefined) url.searchParams.set(k, String(v));
    let res: Response;
    try {
      res = await fetch(url, { headers: { authorization: `Bearer ${this.token}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
    } catch {
      throw new CoreError(503, "Core indisponível");
    }
    if (res.status === 401 || res.status === 403 || res.status === 404) throw new CoreError(res.status, `Core ${res.status} em ${url.pathname}`);
    if (!res.ok) throw new CoreError(503, "Core indisponível");
    return (await res.json()) as T;
  }

  async me(): Promise<Me> {
    try {
      return await this.get<Me>("/v1/me");
    } catch (e) {
      // Until GET /v1/me lands (PR-D), fall back to /v1/me/memberships (PR #7).
      if (!(e instanceof CoreError) || e.status !== 404) throw e;
      const memberships = await this.get<MembershipSummary[]>("/v1/me/memberships");
      return { sub: "", email: null, memberships };
    }
  }
  entitlements(tenant: string) {
    return this.get<EntitlementsResponse>("/v1/entitlements", { tenant });
  }
  projects(tenant: string) {
    return this.get<Project[]>("/v1/projects", { tenant });
  }
  deployments(tenant: string) {
    return this.get<Deployment[]>(`/v1/tenants/${encodeURIComponent(tenant)}/deployments`);
  }
  runs(tenant: string, opts: { state?: RunState; deploymentId?: string; limit?: number } = {}) {
    return this.get<Run[]>("/v1/runs", { tenant, state: opts.state, deploymentId: opts.deploymentId });
  }
  approvals(tenant: string) {
    return this.get<Approval[]>("/v1/approvals", { tenant });
  }
  usageSummary(tenant: string, from: Date, to: Date) {
    return this.get<UsageSummary>("/v1/usage/summary", { tenant, from: from.toISOString(), to: to.toISOString() });
  }
  expert(tenant: string) {
    return this.get<ExpertStatus>("/v1/expert", { tenant });
  }
  async roles(): Promise<RoleSummary[]> {
    const rows = await this.get<{ id: string; name: string; commercialState: string }[]>("/v1/roles");
    return rows.map((r) => ({ id: r.id, name: r.name, status: (r.commercialState as RoleSummary["status"]) ?? "demo" }));
  }
}
