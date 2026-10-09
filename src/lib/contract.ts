// Types of the Workspaces ↔ Core contract.
// Source of truth: AtlasHub-AI-WaaS docs/workspaces/core-workspaces-v1.draft.openapi.json (1.0.0-draft.2).
// Replace with types generated from the published openapi.json once the Core PRs land.

export type Module = "workforce" | "ami" | "community" | "media";
export const MODULES: readonly Module[] = ["workforce", "ami", "community", "media"];

export type PlatformRole = "tenant_user" | "tenant_admin" | "atlas_operator" | "atlas_engineer" | "atlas_owner";
export type TenantKind = "customer" | "internal_pilot" | "platform";

export interface MembershipSummary {
  tenantId: string;
  role: PlatformRole;
  name: string;
  tenantStatus?: string;
  tenantKind?: TenantKind;
  sandbox?: boolean;
  modules?: Module[];
}

export interface Me {
  sub: string;
  email: string | null;
  displayName?: string;
  memberships: MembershipSummary[];
}

export interface Entitlement {
  key: string; // mission.<templateId> · product.<productId> · module.<module>
  source: "trial" | "order" | "subscription" | "grant";
  quantity: number | null;
  validFrom: string;
  validUntil: string | null;
  status: "active" | "expired" | "revoked";
}

export interface EntitlementsResponse {
  tenantId: string;
  modules: Module[];
  items: Entitlement[];
}

export type DeploymentState = "draft" | "sandbox" | "acceptance" | "pilot" | "active" | "paused" | "suspended" | "terminated";

export interface Deployment {
  id: string;
  tenantId: string;
  roleId: string;
  packReleaseId: string;
  state: DeploymentState;
  projectId?: string | null;
  createdAt?: string;
}

export type ProjectStatus = "planning" | "sandbox" | "active" | "paused" | "archived";

export interface Project {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  summary?: string;
  status: ProjectStatus;
  modules: Module[];
  supervisor: { userId: string; displayName: string } | null;
  deploymentIds: string[];
}

export type RunState = "queued" | "pending" | "awaiting_approval" | "blocked" | "completed" | "cancelled" | "suspended" | "dead_letter";

export interface Run {
  id: string;
  tenantId: string;
  deploymentId: string;
  state: RunState;
  attempts: number;
  startedAt: string;
  finishedAt: string | null;
  costEstimate: string;
  summary?: string;
}

export interface Approval {
  id: string;
  tenantId: string;
  runId: string;
  requestedAction: string; // reschedule · handoff · tool:<toolId>
  state: "pending" | "approved" | "rejected";
  expiresAt: string;
  resolvedAt: string | null;
  summary?: string;
}

export interface UsageSummary {
  from: string;
  to: string;
  runs: Partial<Record<RunState, number>>;
  metrics: { metric: string; unit: string; quantity: number; estimatedCost: string; currency: string }[];
}

export type ToolPolicy = "auto" | "approval" | "forbidden";

export interface ExpertStatus {
  tenantId: string;
  enabled: boolean;
  deploymentId: string | null;
  state: DeploymentState | null;
  supervisor: { userId: string; displayName: string } | null;
  policies: { tool: string; policy: ToolPolicy }[];
  recentPlans: (Run & { title: string })[];
}

export interface RoleSummary {
  id: string;
  name: string;
  status: "demo" | "pilot" | "ga" | "proposed";
}

export class CoreError extends Error {
  readonly status: 401 | 403 | 404 | 503;
  constructor(status: 401 | 403 | 404 | 503, message: string) {
    super(message);
    this.name = "CoreError";
    this.status = status;
  }
}
