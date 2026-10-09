import { PageHeader, Panel, StateChip, when } from "@/components/ui";
import { approvalStatus, canDecide } from "@/lib/access";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "Aprovações" };

export default async function Approvals({ params }: { params: Promise<{ tenant: string }> }) {
  const { core, membership, tenantId } = await tenantContext(params);
  const now = new Date();
  const approvals = await core.approvals(tenantId);
  return (
    <>
      <PageHeader eyebrow="Controlo humano" title="Aprovações" accent="pendentes." />
      <Panel
        title="Pedidos"
        subtitle={canDecide(membership.role) ? "Pode decidir nesta organização (decisão ativa na fase G4)." : "O seu papel é só de leitura."}
        delay={0.05}
      >
        <div className="overflow-x-auto">
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Ação pedida</th>
                <th scope="col">Detalhe</th>
                <th scope="col">Estado</th>
                <th scope="col">Expira</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((a) => (
                <tr key={a.id}>
                  <td>
                    <code className="text-mute">{a.requestedAction}</code>
                  </td>
                  <td>{a.summary ?? a.runId}</td>
                  <td>
                    <StateChip state={approvalStatus(a, now)} />
                  </td>
                  <td className="text-dim">{when(a.expiresAt, now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
