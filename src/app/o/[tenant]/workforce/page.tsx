import { Locked, PageHeader, Panel, StateChip, when } from "@/components/ui";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "Workforce" };

export default async function Workforce({ params }: { params: Promise<{ tenant: string }> }) {
  const { core, membership, tenantId, modules } = await tenantContext(params);
  if (!modules.includes("workforce")) return <Locked module="Workforce" tenantName={membership.name} />;
  const now = new Date();
  const [deployments, runs, projects, roles] = await Promise.all([core.deployments(tenantId), core.runs(tenantId), core.projects(tenantId), core.roles()]);
  const workers = deployments.filter((d) => d.roleId !== "ROLE-EXPERT");
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  return (
    <>
      <PageHeader eyebrow="AI Workforce" title="Equipa de" accent="colaboradores digitais." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workers.map((d, i) => {
          const own = runs.filter((r) => r.deploymentId === d.id);
          const last = own[0];
          return (
            <Panel key={d.id} title={roleName(d.roleId)} subtitle={projects.find((p) => p.id === d.projectId)?.name ?? "Sem projeto"} delay={0.05 * i} action={<StateChip state={d.state} />}>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-dim">Execuções</dt>
                  <dd className="text-lg font-bold">{own.length}</dd>
                </div>
                <div>
                  <dt className="text-dim">Última</dt>
                  <dd>{last ? when(last.startedAt, now) : "—"}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-dim">{d.packReleaseId}</p>
            </Panel>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-dim">Só leitura nesta fase (G2). Provisionar ou alterar colaboradores é feito pela AtlasHub, com aprovação.</p>
    </>
  );
}
