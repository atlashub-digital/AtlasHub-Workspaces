import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { Kpi, PageHeader, Panel, StateChip, when } from "@/components/ui";
import { approvalStatus } from "@/lib/access";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "Visão geral" };

const MODULE_LABEL = { workforce: "Workforce", ami: "AMI", community: "Comunidade", media: "Media" } as const;

export default async function Overview({ params }: { params: Promise<{ tenant: string }> }) {
  const { core, membership, tenantId, modules } = await tenantContext(params);
  const now = new Date();
  const [projects, deployments, runs, approvals, expert, roles] = await Promise.all([
    core.projects(tenantId),
    core.deployments(tenantId),
    core.runs(tenantId, { limit: 6 }),
    core.approvals(tenantId),
    core.expert(tenantId),
    core.roles(),
  ]);
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  const pending = approvals.filter((a) => approvalStatus(a, now) === "pending").length;
  const workers = deployments.filter((d) => d.roleId !== "ROLE-EXPERT");
  const base = `/o/${encodeURIComponent(tenantId)}`;

  return (
    <>
      <PageHeader eyebrow="Visão geral" title={membership.name} accent="em operação.">
        <div className="flex flex-wrap gap-1.5">
          {modules.map((m) => (
            <span key={m} className="ah-chip text-[11px] text-cyan3">
              module.{m}
            </span>
          ))}
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon="folder" label="Projetos" value={String(projects.length)} delay={0.05} />
        <Kpi icon="team" label="Colaboradores digitais" value={String(workers.length)} note="em sandbox" delay={0.1} />
        <Kpi icon="check" label="Aprovações pendentes" value={String(pending)} delay={0.15} />
        <Kpi icon="chart" label="Execuções recentes" value={String(runs.length)} note="dados sintéticos" delay={0.2} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Projetos" subtitle="Iniciativas desta organização e os módulos que usam." delay={0.15}>
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                href={`${base}/projects/${encodeURIComponent(p.slug)}`}
                className="ah-card-link group flex flex-col gap-2 rounded-xl border border-line bg-panel2/60 p-4 no-underline"
                style={{ "--d": `${0.04 * i}s` } as CSSProperties}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold">{p.name}</h3>
                  <StateChip state={p.status} />
                </div>
                {p.summary && <p className="text-sm text-mute">{p.summary}</p>}
                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  {p.modules.map((m) => (
                    <span key={m} className={`rounded-full border px-2 py-0.5 text-[11px] ${modules.includes(m) ? "border-line text-cyan3" : "border-line text-dim"}`}>
                      {MODULE_LABEL[m]}
                      {!modules.includes(m) && " · inativo"}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel
          title="Atlas Expert"
          subtitle="O seu ponto de contacto: recebe necessidades, propõe planos e integrações."
          delay={0.2}
          action={
            <Link href={`${base}/expert`} className="text-sm font-semibold text-cyan3 hover:text-fg">
              Abrir →
            </Link>
          }
        >
          <div className="flex items-center gap-3">
            <span className="ws-icon-tile">
              <Icon name="spark" size={22} />
            </span>
            <div>
              <div className="font-semibold">{expert.enabled ? "Disponível em sandbox" : "Não provisionado"}</div>
              <div className="text-xs text-dim">Supervisão: {expert.supervisor?.displayName ?? "—"}</div>
            </div>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {expert.recentPlans.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-mute">{r.title}</span>
                <span className="text-xs text-dim">{when(r.startedAt, now)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Atividade recente"
        subtitle="Últimas execuções dos colaboradores digitais desta organização."
        className="mt-5"
        delay={0.25}
        action={
          <Link href={`${base}/workforce`} className="text-sm font-semibold text-cyan3 hover:text-fg">
            Ver Workforce →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Execução</th>
                <th scope="col">Colaborador</th>
                <th scope="col">Estado</th>
                <th scope="col">Quando</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td>{r.summary ?? r.id}</td>
                  <td className="text-mute">{roleName(deployments.find((d) => d.id === r.deploymentId)?.roleId ?? "")}</td>
                  <td>
                    <StateChip state={r.state} />
                  </td>
                  <td className="text-dim">{when(r.startedAt, now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
