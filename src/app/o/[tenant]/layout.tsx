import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Sidebar } from "@/components/Sidebar";
import { SandboxBadge } from "@/components/ui";
import { membershipFor, navFor, ROLE_LABEL } from "@/lib/access";
import { onCoreError, requireCore } from "@/lib/session";

export default async function TenantLayout({ children, params }: { children: ReactNode; params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const core = await requireCore();
  const me = await core.me().catch(onCoreError);
  const membership = membershipFor(me, decodeURIComponent(tenant));
  // Not a member → 404 (indistinguishable from non-existent, like the Core).
  if (!membership) notFound();
  const ent = await core.entitlements(membership.tenantId).catch(onCoreError);
  return (
    <div className="ws-shell">
      <Sidebar items={navFor(membership.tenantId, ent.modules)} />
      <div className="ws-main">
        <header className="ws-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <div className="truncate text-[17px] font-bold">{membership.name}</div>
              <div className="text-xs text-dim">{ROLE_LABEL[membership.role]}</div>
            </div>
            {me.memberships.length > 1 && (
              <Link href="/" className="ah-btn-quiet px-3! text-sm!" aria-label="Trocar de organização">
                <Icon name="switch" size={16} /> Trocar
              </Link>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(membership.sandbox || core.mode === "demo") && <SandboxBadge />}
            <span className="hidden text-sm text-mute sm:inline">{me.displayName ?? me.email}</span>
            <form action="/api/logout" method="post">
              <button className="ah-btn-quiet size-11 p-0!" aria-label="Terminar sessão">
                <Icon name="logout" size={18} />
              </button>
            </form>
          </div>
        </header>
        <main className="ws-content">{children}</main>
      </div>
    </div>
  );
}
