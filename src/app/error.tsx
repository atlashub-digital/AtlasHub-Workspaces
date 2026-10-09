"use client";

import Link from "next/link";

// Any failure that is not an access decision (5xx, timeout, network) lands here: an honest message instead of
// a blank 500, and never stale or invented data. Access denials (401/403/404) are mapped before reaching this.
export default function ErrorState({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="ah-page flex min-h-screen items-center justify-center px-4">
      <div role="alert" className="ah-card ah-bar max-w-[480px] p-8">
        <p className="ah-eyebrow">Serviço indisponível</p>
        <h1 className="mt-2 text-2xl font-bold">Não foi possível carregar os dados.</h1>
        <p className="mt-2 text-mute">O AtlasHub Core não respondeu a tempo. Tente de novo dentro de momentos.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="ah-btn">
            Tentar de novo
          </button>
          <Link href="/" className="ah-btn-quiet">
            Organizações
          </Link>
        </div>
      </div>
    </main>
  );
}
