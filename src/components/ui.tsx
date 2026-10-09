import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "./icons";

/** Official mark + ATLASHUB.SI / WORKSPACES wordmark (same construction as app.atlashub.si). */
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="AtlasHub.SI Workspaces — início" className="flex min-h-11 items-center gap-3 no-underline">
      <Image src="/assets/atlashub-logo.webp" width={40} height={40} alt="" priority className="rounded-full shadow-[0_0_18px_rgba(22,216,237,0.35)]" />
      <span className="flex flex-col leading-none">
        <strong className="text-[19px] font-extrabold tracking-[0.06em] text-fg">
          ATLASHUB<span className="text-accent">.SI</span>
        </strong>
        <small className="mt-1.5 text-[9px] font-semibold tracking-[0.34em] text-[#9fb5cb]">WORKSPACES</small>
      </span>
    </Link>
  );
}

export function SandboxBadge() {
  return (
    <span className="ah-chip border-warn/40 bg-warn/5 text-[11px] tracking-[0.12em] text-warn">
      <span className="ah-dot" aria-hidden="true" />
      SANDBOX · DADOS SINTÉTICOS
    </span>
  );
}

export function PageHeader({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent?: string; children?: ReactNode }) {
  return (
    <header className="ah-rise mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="ah-eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-[clamp(28px,3.4vw,40px)] font-extrabold leading-tight tracking-[-0.03em]">
          {title}
          {accent && <span className="ah-accent"> {accent}</span>}
        </h1>
      </div>
      {children}
    </header>
  );
}

export function Panel({ title, subtitle, action, children, className = "", delay = 0 }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; delay?: number }) {
  return (
    <section className={`ah-card ah-bar ah-rise p-5 sm:p-6 ${className}`} style={{ "--d": `${delay}s` } as CSSProperties} aria-label={title}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold tracking-[-0.01em]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-mute">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Kpi({ icon, label, value, note, delay = 0 }: { icon: IconName; label: string; value: string; note?: string; delay?: number }) {
  return (
    <div className="ah-card ah-rise flex items-start gap-4 p-5" style={{ "--d": `${delay}s` } as CSSProperties}>
      <span className="ws-icon-tile">
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0">
        <div className="text-sm text-mute">{label}</div>
        <div className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.02em] tabular-nums">{value}</div>
        {note && <div className="mt-2 text-xs text-dim">{note}</div>}
      </div>
    </div>
  );
}

const STATE_TONE: Record<string, string> = {
  completed: "text-ok",
  active: "text-ok",
  sandbox: "text-cyan3",
  pending: "text-warn",
  awaiting_approval: "text-warn",
  expired: "text-dim",
  blocked: "text-[#ff6e78]",
  dead_letter: "text-[#ff6e78]",
  approved: "text-ok",
  rejected: "text-[#ff6e78]",
  proposed: "text-dim",
  planning: "text-dim",
};

const STATE_LABEL: Record<string, string> = {
  completed: "Concluído",
  active: "Ativo",
  sandbox: "Sandbox",
  pending: "Pendente",
  awaiting_approval: "Aguarda aprovação",
  expired: "Expirada",
  blocked: "Bloqueado",
  dead_letter: "Falhou",
  approved: "Aprovada",
  rejected: "Rejeitada",
  queued: "Em fila",
  suspended: "Suspenso",
  proposed: "Proposto",
  planning: "Planeamento",
  auto: "Automático",
  approval: "Exige aprovação",
  forbidden: "Proibido",
};

export function StateChip({ state }: { state: string }) {
  return (
    <span className={`ah-chip text-[11px] ${STATE_TONE[state] ?? "text-mute"}`}>
      <span className="ah-dot" aria-hidden="true" />
      {STATE_LABEL[state] ?? state}
    </span>
  );
}

export function Locked({ module, tenantName }: { module: string; tenantName: string }) {
  return (
    <div className="ah-card ah-bar ah-rise flex flex-col items-start gap-4 p-8">
      <span className="ws-icon-tile">
        <Icon name="lock" size={22} />
      </span>
      <h2 className="text-2xl font-bold">Módulo {module} não ativo</h2>
      <p className="max-w-[560px] text-mute">
        {tenantName} não tem o entitlement <code className="text-cyan3">module.{module.toLowerCase()}</code>. A ativação é feita pela AtlasHub e é verificada
        no Core — esconder o menu não dá acesso.
      </p>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line2 px-4 py-6 text-center text-sm text-dim">{children}</p>;
}

export function when(iso: string, now = new Date()): string {
  const diff = Math.round((now.getTime() - Date.parse(iso)) / 60_000);
  if (diff < 0) {
    const m = -diff;
    return m < 60 ? `em ${m} min` : `em ${Math.round(m / 60)} h`;
  }
  if (diff < 60) return `há ${diff} min`;
  if (diff < 48 * 60) return `há ${Math.round(diff / 60)} h`;
  return `há ${Math.round(diff / 1440)} d`;
}
