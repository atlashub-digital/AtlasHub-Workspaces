// Pure access and navigation rules. The Core is the authority (403); these rules only decide what the
// interface shows, so a hidden item never replaces a server-side check.
import type { Entitlement, Me, MembershipSummary, Module, PlatformRole } from "./contract.ts";
import { MODULES } from "./contract.ts";

/** Active entitlement keys at `now` (status active, inside the validity window). */
export function activeKeys(items: Entitlement[], now: Date): string[] {
  return items
    .filter((e) => e.status === "active" && Date.parse(e.validFrom) <= now.getTime() && (e.validUntil === null || Date.parse(e.validUntil) > now.getTime()))
    .map((e) => e.key);
}

/** Modules granted by `module.<name>` keys, plus `workforce` when any mission is active (Core rule, 08 §5). */
export function modulesFrom(keys: string[]): Module[] {
  const set = new Set<Module>();
  for (const k of keys) {
    if (k.startsWith("module.")) {
      const m = k.slice(7) as Module;
      if ((MODULES as readonly string[]).includes(m)) set.add(m);
    } else if (k.startsWith("mission.")) set.add("workforce");
  }
  return MODULES.filter((m) => set.has(m));
}

/**
 * Synthetic means fixtures (demo mode) or a tenant the Core flags as sandbox. Anything else is presented as
 * real data: a production tenant must never see its activity labelled as disposable test data.
 */
export function isSynthetic(mode: "demo" | "api", membership: { sandbox?: boolean }) {
  return mode === "demo" || membership.sandbox === true;
}

export function membershipFor(me: Me, tenantId: string): MembershipSummary | undefined {
  return me.memberships.find((m) => m.tenantId === tenantId);
}

const WRITE_ROLES: PlatformRole[] = ["tenant_admin", "atlas_operator", "atlas_engineer", "atlas_owner"];

/** Mirrors identity(…, write=true) in the Core: tenant_user reads only. */
export function canDecide(role: PlatformRole): boolean {
  return WRITE_ROLES.includes(role);
}

export function isSupervisor(role: PlatformRole): boolean {
  return role.startsWith("atlas_");
}

export const ROLE_LABEL: Record<PlatformRole, string> = {
  tenant_user: "Leitura",
  tenant_admin: "Administrador",
  atlas_operator: "Supervisor AtlasHub",
  atlas_engineer: "Engenharia AtlasHub",
  atlas_owner: "Owner AtlasHub",
};

export type NavKey = "overview" | "workforce" | "expert" | "ami" | "community" | "approvals" | "usage";

export interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  locked: boolean; // module not entitled: shown, but leads to a locked state
  module?: Module;
}

export function navFor(tenantId: string, modules: Module[]): NavItem[] {
  const base = `/o/${encodeURIComponent(tenantId)}`;
  const has = (m: Module) => modules.includes(m);
  const items: NavItem[] = [
    { key: "overview", label: "Visão geral", href: base, locked: false },
    { key: "workforce", label: "Workforce", href: `${base}/workforce`, locked: !has("workforce"), module: "workforce" },
    { key: "expert", label: "Atlas Expert", href: `${base}/expert`, locked: false },
    { key: "ami", label: "AMI", href: `${base}/ami`, locked: !has("ami"), module: "ami" },
    { key: "approvals", label: "Aprovações", href: `${base}/approvals`, locked: false },
    { key: "usage", label: "Uso", href: `${base}/usage`, locked: false },
  ];
  if (has("community")) items.splice(4, 0, { key: "community", label: "Comunidade", href: `${base}/community`, locked: false, module: "community" });
  return items;
}

/** An approval is actionable only if pending and not expired (the Core keeps expired ones as pending). */
export function approvalStatus(a: { state: string; expiresAt: string }, now: Date): "pending" | "expired" | "approved" | "rejected" {
  if (a.state === "pending") return Date.parse(a.expiresAt) <= now.getTime() ? "expired" : "pending";
  return a.state as "approved" | "rejected";
}
