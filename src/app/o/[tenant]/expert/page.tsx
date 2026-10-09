import { Icon } from "@/components/icons";
import { PageHeader, Panel, StateChip, when } from "@/components/ui";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "Atlas Expert" };

export default async function Expert({ params }: { params: Promise<{ tenant: string }> }) {
  const { core, membership, tenantId } = await tenantContext(params);
  const ex = await core.expert(tenantId);
  const now = new Date();
  return (
    <>
      <PageHeader eyebrow="Atlas Expert" title="O seu especialista" accent={`para ${membership.name}.`}>
        {ex.state && <StateChip state={ex.state} />}
      </PageHeader>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Como trabalha" subtitle="Dedicado logicamente a esta organização. Coordena; não tem acessos irrestritos." delay={0.05}>
          <ol className="flex flex-col gap-4">
            {[
              ["Recebe a necessidade", "Objetivo, contexto e restrições do projeto."],
              ["Prepara um plano", "Rascunho estruturado com passos, riscos e custos estimados."],
              ["Propõe integrações e composições", "Conectores e colaboradores digitais — sempre sujeitos a aprovação."],
              ["Coordena execuções autorizadas", "Só dentro desta organização, deste projeto e dos módulos ativos."],
              ["Acompanha resultados", "Estado, exceções e relatórios com dados medidos."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="ah-step" data-state={i < 2 ? "done" : "pending"}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-sm text-dim">{d}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-line bg-panel2/60 p-4">
            <span className="ws-icon-tile">
              <Icon name="spark" size={22} />
            </span>
            <div className="text-sm text-mute">
              Pedidos ao Expert ficam disponíveis na fase G3. Supervisão AtlasHub: <strong className="text-fg">{ex.supervisor?.displayName ?? "—"}</strong>.
            </div>
          </div>
        </Panel>
        <div className="flex flex-col gap-5">
          <Panel title="Políticas" subtitle="Aplicadas pelo tool gateway do Core." delay={0.1}>
            <ul className="flex flex-col gap-2.5">
              {ex.policies.map((p) => (
                <li key={p.tool} className="flex items-start justify-between gap-3 text-sm">
                  <code className="min-w-0 break-all text-mute">{p.tool}</code>
                  <StateChip state={p.policy} />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Planos recentes" delay={0.15}>
            {ex.recentPlans.length === 0 ? (
              <p className="text-sm text-dim">Ainda sem planos.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {ex.recentPlans.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>{r.title}</span>
                    <span className="text-xs text-dim">{when(r.startedAt, now)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
