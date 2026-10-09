import Link from "next/link";

export default function NotFound() {
  return (
    <main className="ah-page flex min-h-screen items-center justify-center px-4">
      <div className="ah-card ah-bar max-w-[460px] p-8">
        <p className="ah-eyebrow">404</p>
        <h1 className="mt-2 text-2xl font-bold">Não encontrado</h1>
        <p className="mt-2 text-mute">A página não existe ou não pertence a uma organização onde tenha acesso.</p>
        <Link href="/" className="ah-btn mt-6">
          Voltar às organizações
        </Link>
      </div>
    </main>
  );
}
