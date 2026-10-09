import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AtlasHub Workspaces", template: "%s · AtlasHub Workspaces" },
  description: "Painel autenticado da AtlasHub: organizações, projetos, Workforce, Atlas Expert e AMI.",
  robots: { index: false, follow: false },
};

// lang="pt": a decisão PT-PT vs PT-BR está pendente (igual ao app.atlashub.si).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-ink text-fg antialiased">{children}</body>
    </html>
  );
}
