import { Brand } from "@/components/ui";
import { DEMO_PERSONAS } from "@/lib/core/demo";
import { coreMode } from "@/lib/session";

export const metadata = { title: "Entrar" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const demo = coreMode() === "demo";
  return (
    <main className="ah-page flex min-h-screen items-center justify-center px-4 py-12">
      <div className="ah-card ah-bar ah-rise w-full max-w-[460px] p-6 sm:p-8">
        <Brand href="/login" />
        <p className="ah-eyebrow mt-8">Workspaces</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">Entrar</h1>
        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-[#ff6e78]/40 bg-[#ff6e78]/10 px-4 py-3 text-sm text-[#ffb3b8]">
            {error === "credentials" ? "Email ou palavra-passe inválidos." : error === "config" ? "Login real ainda não configurado neste ambiente." : "Não foi possível iniciar a sessão."}
          </p>
        )}
        {demo ? (
          <>
            <p className="mt-2 text-mute">
              Ambiente de demonstração. Escolha uma persona fictícia: cada uma só vê as organizações onde tem membership.
            </p>
            <form action="/api/session/demo" method="post" className="mt-6 flex flex-col gap-2.5">
              {DEMO_PERSONAS.map((p) => (
                <button key={p.id} name="user" value={p.id} className="ah-btn-quiet justify-between! text-left">
                  {p.label}
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </form>
            <p className="mt-5 text-xs text-dim">Sem dados reais: organizações, pessoas e números são sintéticos.</p>
          </>
        ) : (
          <form action="/api/session" method="post" className="mt-6 flex flex-col gap-5">
            <label className="block text-sm font-medium text-mute">
              Email
              <input required name="email" type="email" autoComplete="email" className="ah-input" />
            </label>
            <label className="block text-sm font-medium text-mute">
              Palavra-passe
              <input required name="password" type="password" autoComplete="current-password" className="ah-input" />
            </label>
            <button className="ah-btn w-full" type="submit">
              Entrar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
