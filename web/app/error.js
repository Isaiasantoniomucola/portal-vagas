'use client';
export default function Erro({ reset }) {
  return (
    <section className="contentor pagina centro">
      <h1>Algo correu mal</h1>
      <p className="suave">Não foi possível mostrar esta página. Tente novamente dentro de instantes.</p>
      <p><button className="botao" onClick={() => reset()}>Tentar novamente</button></p>
    </section>
  );
}
