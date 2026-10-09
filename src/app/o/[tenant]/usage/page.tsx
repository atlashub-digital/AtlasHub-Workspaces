import { Kpi, PageHeader, Panel } from "@/components/ui";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "Uso" };

export default async function Usage({ params }: { params: Promise<{ tenant: string }> }) {
  const { core, tenantId } = await tenantContext(params);
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 86_400_000);
  const s = await core.usageSummary(tenantId, from, to);
  const total = Object.values(s.runs).reduce((a, b) => a + (b ?? 0), 0);
  return (
    <>
      <PageHeader eyebrow="Uso" title="Consumo dos" accent="últimos 30 dias." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi icon="chart" label="Execuções" value={String(total)} delay={0.05} />
        <Kpi icon="check" label="Concluídas" value={String(s.runs.completed ?? 0)} delay={0.1} />
        <Kpi icon="team" label="Aguardam aprovação" value={String(s.runs.awaiting_approval ?? 0)} delay={0.15} />
      </div>
      <Panel title="Métricas" subtitle="Só fontes medidas; custos estimados explicitamente." className="mt-5" delay={0.2}>
        <table className="ws-table">
          <thead>
            <tr>
              <th scope="col">Métrica</th>
              <th scope="col">Quantidade</th>
              <th scope="col">Custo estimado</th>
            </tr>
          </thead>
          <tbody>
            {s.metrics.map((m) => (
              <tr key={m.metric}>
                <td>
                  <code className="text-mute">{m.metric}</code>
                </td>
                <td className="tabular-nums">
                  {m.quantity} {m.unit}
                </td>
                <td className="tabular-nums">
                  {m.estimatedCost} {m.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
