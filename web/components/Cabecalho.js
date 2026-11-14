'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, painelDe } from './Auth';

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const { utilizador, sair } = useAuth();
  const router = useRouter();
  const fechar = () => setAberto(false);

  return (
    <header className="cabecalho">
      <div className="contentor barra">
        <Link href="/" className="logo" onClick={fechar}>
          <span className="logo-marca" aria-hidden="true">V</span> Vagas<span className="logo-ao">.ao</span>
        </Link>
        <button className="menu-botao" aria-expanded={aberto} aria-controls="menu" onClick={() => setAberto(!aberto)}>
          {aberto ? 'Fechar' : 'Menu'}
        </button>
        <nav id="menu" className={`menu ${aberto ? 'aberto' : ''}`} aria-label="Principal">
          <Link href="/vagas" onClick={fechar}>Vagas</Link>
          <Link href="/sobre" onClick={fechar}>Sobre</Link>
          <Link href="/contacto" onClick={fechar}>Contacto</Link>
          <span className="menu-conta">
            {utilizador ? (
              <>
                <Link href={painelDe(utilizador.tipo)} className="botao botao-claro" onClick={fechar}>O meu painel</Link>
                <button className="botao-texto" onClick={() => { sair(); fechar(); router.push('/'); }}>Sair</button>
              </>
            ) : (
              <>
                <Link href="/entrar" onClick={fechar}>Entrar</Link>
                <Link href="/registar" className="botao" onClick={fechar}>Criar conta</Link>
              </>
            )}
          </span>
        </nav>
      </div>
    </header>
  );
}
