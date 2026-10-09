import { Locked, PageHeader, Panel, StateChip } from "@/components/ui";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "AMI" };

export default async function Ami({ params }: { params: Promise<{ tenant: string }> }) {
  const { core, membership, modules } = await tenantContext(params);
  if (!modules.includes("ami")) return <Locked module="AMI" tenantName={membership.name} />;
  const roles = await core.roles();
  const packs = roles.filter((r) => r.id.startsWith("AMI-"));
  return (
    <>
      <PageHeader eyebrow="AMI · Market Intelligence" title="Inteligência de mercado" accent="com proveniência." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Recolhas" subtitle="Anúncios e ofertas de fontes autorizadas (schema ami.ads.v1)." delay={0.05}>
          <p className="rounded-xl border border-dashed border-line2 px-4 py-8 text-center text-sm text-dim">
            Módulo ativo em sandbox. As recolhas reais entram no gate G3: fonte autorizada, custo observável por recolha e aprovação antes de qualquer gasto.
          </p>
        </Panel>
        <Panel title="Composição do módulo" subtitle="Roles/Packs reutilizáveis do catálogo único." delay={0.1}>
          <ul className="flex flex-col gap-2.5">
            {packs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{p.name}</span>
                <StateChip state={p.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
