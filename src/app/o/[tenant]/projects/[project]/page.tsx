import { notFound } from "next/navigation";
import { PageHeader, Panel, StateChip, when } from "@/components/ui";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "Projeto" };

export default async function ProjectPage({ params }: { params: Promise<{ tenant: string; project: string }> }) {
  const { project: slug } = await params;
  const { core, tenantId, modules } = await tenantContext(params);
  const projects = await core.projects(tenantId);
  const project = projects.find((p) => p.slug === decodeURIComponent(slug));
  if (!project) notFound();
  const now = new Date();
  const [deployments, runs, roles] = await Promise.all([core.deployments(tenantId), core.runs(tenantId), core.roles()]);
  const mine = deployments.filter((d) => project.deploymentIds.includes(d.id));
  const myRuns = runs.filter((r) => project.deploymentIds.includes(r.deploymentId));
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  const inactive = project.modules.filter((m) => !modules.includes(m));
  return (
    <>
      <PageHeader eyebrow="Projeto" title={project.name}>
        <StateChip state={project.status} />
      </PageHeader>
      {project.summary && <p className="ah-rise -mt-3 mb-6 max-w-[720px] text-mute">{project.summary}</p>}
      {inactive.length > 0 && (
        <p className="ah-rise mb-5 rounded-lg border border-warn/40 bg-warn/5 px-4 py-3 text-sm text-[#ecc37e]">
          Este projeto usa {inactive.map((m) => `module.${m}`).join(", ")}, que não está ativo nesta organização.
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Colaboradores digitais" subtitle="Composições de Roles/Packs atribuídas a este projeto." delay={0.05}>
          {mine.length === 0 ? (
            <p className="text-sm text-dim">Nenhum colaborador provisionado. O Atlas Expert pode propor uma composição (sujeita a aprovação).</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {mine.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel2/60 p-3.5">
                  <div>
                    <div className="font-semibold">{roleName(d.roleId)}</div>
                    <div className="text-xs text-dim">{d.packReleaseId}</div>
                  </div>
                  <StateChip state={d.state} />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-dim">Supervisão AtlasHub: {project.supervisor?.displayName ?? "—"}</p>
        </Panel>
        <Panel title="Execuções" subtitle="Só deste projeto." delay={0.1}>
          {myRuns.length === 0 ? (
            <p className="text-sm text-dim">Sem execuções.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="ws-table">
                <thead>
                  <tr>
                    <th scope="col">Execução</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {myRuns.map((r) => (
                    <tr key={r.id}>
                      <td>{r.summary ?? r.id}</td>
                      <td>
                        <StateChip state={r.state} />
                      </td>
                      <td className="text-dim">{when(r.startedAt, now)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
