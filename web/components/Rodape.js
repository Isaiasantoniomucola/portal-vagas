import Link from 'next/link';

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="contentor rodape-grelha">
        <div>
          <p className="logo">Vagas<span className="logo-ao">.ao</span></p>
          <p className="suave">Candidate-se a vagas verificadas em todas as províncias de Angola.</p>
        </div>
        <nav aria-label="Candidatos">
          <h2>Candidatos</h2>
          <Link href="/vagas">Procurar vagas</Link>
          <Link href="/registar">Criar conta</Link>
          <Link href="/candidato">As minhas candidaturas</Link>
        </nav>
        <nav aria-label="Empresas">
          <h2>Empresas</h2>
          <Link href="/registar?tipo=empresa">Publicar uma vaga</Link>
          <Link href="/empresa">Painel da empresa</Link>
        </nav>
        <nav aria-label="Portal">
          <h2>Portal</h2>
          <Link href="/sobre">Sobre nós</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/privacidade">Política de privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
        </nav>
      </div>
      <p className="contentor rodape-fim">© {new Date().getFullYear()} Vagas.ao. Todos os direitos reservados.</p>
    </footer>
  );
}
