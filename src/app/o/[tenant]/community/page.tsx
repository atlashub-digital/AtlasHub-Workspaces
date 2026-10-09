import { Locked, PageHeader, Panel } from "@/components/ui";
import { tenantContext } from "@/lib/tenant";

export const metadata = { title: "Comunidade" };

export default async function Community({ params }: { params: Promise<{ tenant: string }> }) {
  const { membership, modules, synthetic } = await tenantContext(params);
  if (!modules.includes("community")) return <Locked module="Community" tenantName={membership.name} />;
  return (
    <>
      <PageHeader eyebrow="Comunidade" title="Comunidade e" accent="acompanhamento." />
      <Panel title="Produto do cliente" subtitle="Assistente de comunidade e acompanhamento de membros — distinto do Atlas Expert." delay={0.05}>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-mute">
          <li>Consentimento explícito e minimização de dados dos membros.</li>
          <li>Escalonamento humano obrigatório; sem conselho médico nem ações autónomas de saúde.</li>
          <li>Dados de membros nunca saem desta organização.</li>
        </ul>
        {synthetic && <p className="mt-4 text-xs text-dim">Em sandbox: sem membros nem conversas reais.</p>}
      </Panel>
    </>
  );
}
