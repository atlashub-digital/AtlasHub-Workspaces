import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { Brand, Empty, SandboxBadge } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/access";
import { onCoreError, requireCore } from "@/lib/session";

export const metadata = { title: "Organizações" };

const MODULE_LABEL = { workforce: "Workforce", ami: "AMI", community: "Comunidade", media: "Media" } as const;

export default async function Organizations() {
  const core = await requireCore();
  const me = await core.me().catch(onCoreError);
  return (
    <main className="ah-page min-h-screen">
      <header className="ws-topbar">
        <Brand />
        <div className="flex flex-wrap items-center gap-3">
          {core.mode === "demo" && <SandboxBadge />}
          <span className="text-sm text-mute">{me.displayName ?? me.email ?? "Sessão"}</span>
          <form action="/api/logout" method="post">
            <button className="ah-btn-quiet size-11 p-0!" aria-label="Terminar sessão">
              <Icon name="logout" size={18} />
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-8">
        <p className="ah-eyebrow ah-rise">Workspaces</p>
        <h1 className="ah-rise mt-3 text-[clamp(32px,4.4vw,52px)] font-extrabold leading-tight tracking-[-0.035em]">
          As suas <span className="ah-accent">organizações.</span>
        </h1>
        <p className="ah-rise mt-3 max-w-[640px] text-lg text-mute">
          Cada organização é um espaço isolado, com os seus projetos, colaboradores digitais, aprovações e consumo.
        </p>
        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {me.memberships.length === 0 && <Empty>Ainda não tem acesso a nenhuma organização. Peça um convite à AtlasHub.</Empty>}
          {me.memberships.map((m, i) => (
            <Link
              key={m.tenantId}
              href={`/o/${encodeURIComponent(m.tenantId)}`}
              className="ah-card ah-card-link ah-rise group flex flex-col gap-4 p-6 no-underline"
              style={{ "--d": `${0.06 * i + 0.1}s` } as CSSProperties}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="ws-icon-tile">
                  <Icon name="folder" size={22} />
                </span>
                {m.sandbox && <span className="ah-chip text-[11px] text-warn">SANDBOX</span>}
              </div>
              <div>
                <h2 className="text-[22px] font-bold tracking-[-0.02em]">{m.name}</h2>
                <p className="mt-1 text-sm text-mute">
                  {ROLE_LABEL[m.role]}
                  {m.tenantKind === "internal_pilot" && " · cliente-piloto interno"}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(m.modules ?? []).map((mod) => (
                  <span key={mod} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-cyan3">
                    {MODULE_LABEL[mod]}
                  </span>
                ))}
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-cyan3 transition-[gap] group-hover:gap-3">
                Abrir workspace <Icon name="arrow" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
