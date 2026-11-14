'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [['/candidato', 'Painel'], ['/candidato/perfil', 'O meu perfil'], ['/candidato/curriculo', 'O meu currículo']];

export default function NavCandidato() {
  const atual = usePathname();
  return (
    <nav className="subnav" aria-label="Área do candidato">
      {LINKS.map(([href, nome]) => (
        <Link key={href} href={href} aria-current={atual === href ? 'page' : undefined}>{nome}</Link>
      ))}
    </nav>
  );
}
