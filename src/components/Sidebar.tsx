"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/access";
import { Icon, type IconName } from "./icons";
import { Brand } from "./ui";

const ICON: Record<NavItem["key"], IconName> = {
  overview: "home",
  workforce: "team",
  expert: "spark",
  ami: "radar",
  community: "community",
  approvals: "check",
  usage: "chart",
};

export function Sidebar({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <aside className="ws-sidebar">
      <Brand />
      <nav aria-label="Organização" className="ws-nav">
        {items.map((item) => {
          const on = item.key === "overview" ? path === item.href || path.startsWith(`${item.href}/projects`) : path.startsWith(item.href);
          return (
            <Link key={item.key} href={item.href} aria-current={on ? "page" : undefined} data-locked={item.locked}>
              <Icon name={ICON[item.key]} />
              <span>{item.label}</span>
              {item.locked && (
                <span className="ml-auto" title="Módulo não ativo">
                  <Icon name="lock" size={15} />
                  <span className="sr-only">(módulo não ativo)</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="ws-sidebar-foot mt-auto rounded-xl border border-line bg-[linear-gradient(160deg,rgba(22,120,190,0.25),rgba(7,20,34,0.9))] p-4">
        <p className="text-[15px] font-semibold leading-snug">
          Empresas mais humanas.
          <br />
          Equipas <span className="ah-accent">mais capazes.</span>
        </p>
        <p className="mt-3 text-[10px] font-semibold tracking-[0.28em] text-dim">PEOPLE | TECHNOLOGY | RESULTS</p>
      </div>
    </aside>
  );
}
