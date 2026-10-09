import "server-only";
import { notFound } from "next/navigation";
import { isSynthetic, membershipFor } from "./access.ts";
import { onCoreError, requireCore } from "./session.ts";

/** Resolves the tenant route param against the caller's memberships and entitlements (Core is the authority). */
export async function tenantContext(params: Promise<{ tenant: string }>) {
  const { tenant } = await params;
  const core = await requireCore();
  const me = await core.me().catch(onCoreError);
  const membership = membershipFor(me, decodeURIComponent(tenant));
  if (!membership) notFound();
  const ent = await core.entitlements(membership.tenantId).catch(onCoreError);
  return { core, me, membership, tenantId: membership.tenantId, modules: ent.modules, entitlements: ent, synthetic: isSynthetic(core.mode, membership) };
}
