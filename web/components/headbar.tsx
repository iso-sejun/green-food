import Link from "next/link";
import { LocationBadge } from "./location-badge";

const links = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/saved", label: "Saved Recipes" }
];

export function Headbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(120,220,168,0.94)] backdrop-blur">
      <div className="page-shell flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--bg-navy)]"
          >
            Root & Recepie
          </Link>
          <LocationBadge />
        </div>
        <nav className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-bold text-[var(--bg-navy)] transition hover:bg-white/55"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
