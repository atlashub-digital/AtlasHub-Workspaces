import type { Approval, Deployment, EntitlementsResponse, ExpertStatus, Me, Project, RoleSummary, Run, RunState, UsageSummary } from "../contract.ts";

/** The only data access the UI uses. Two implementations: demo (synthetic) and api (BFF → Core). */
export interface Core {
  readonly mode: "demo" | "api";
  me(): Promise<Me>;
  entitlements(tenant: string): Promise<EntitlementsResponse>;
  projects(tenant: string): Promise<Project[]>;
  deployments(tenant: string): Promise<Deployment[]>;
  runs(tenant: string, opts?: { state?: RunState; deploymentId?: string; limit?: number }): Promise<Run[]>;
  approvals(tenant: string): Promise<Approval[]>;
  usageSummary(tenant: string, from: Date, to: Date): Promise<UsageSummary>;
  expert(tenant: string): Promise<ExpertStatus>;
  roles(): Promise<RoleSummary[]>;
}
