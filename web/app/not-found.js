import Link from 'next/link';

export default function NaoEncontrada() {
  return (
    <section className="contentor pagina centro">
      <h1>Página não encontrada</h1>
      <p className="suave">O endereço que abriu não existe ou foi removido.</p>
      <p><Link href="/vagas" className="botao">Ver vagas</Link></p>
    </section>
  );
}
