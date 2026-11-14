import Link from 'next/link';
import { apiServidor } from '@/lib/api';
import BuscaVagas from '@/components/BuscaVagas';
import LinhaVaga from '@/components/LinhaVaga';

export default async function Inicio() {
  const [meta, lista] = await Promise.all([apiServidor('/meta'), apiServidor('/vagas?limite=6')]);
  const categorias = meta?.categorias || [];
  const vagas = lista?.vagas || [];

  return (
    <>
      <section className="hero">
        <div className="contentor">
          <h1>A sua próxima vaga está em Angola.</h1>
          <p>Procure por cargo e província, guarde as vagas de que gosta e candidate-se com o seu currículo em poucos minutos.</p>
          <BuscaVagas provincias={meta?.provincias} />
          <div className="atalhos">
            {['Luanda', 'Benguela', 'Huambo', 'Huíla'].map((n) => {
              const p = meta?.provincias?.find((x) => x.nome === n);
              return p ? <Link key={n} href={`/vagas?provincia=${p.id}`}>Vagas em {n}</Link> : null;
            })}
            <Link href="/vagas?regime=remoto">Trabalho remoto</Link>
            <Link href="/vagas?tipo=estagio">Estágios</Link>
          </div>
          {meta && (
            <ul className="numeros">
              <li><strong>{meta.stats.vagas}</strong>vagas abertas</li>
              <li><strong>{meta.stats.empresas}</strong>empresas</li>
              <li><strong>{meta.stats.candidatos}</strong>candidatos registados</li>
            </ul>
          )}
        </div>
      </section>

      <section className="seccao contentor">
        <div className="seccao-topo">
          <h2>Vagas mais recentes</h2>
          <Link href="/vagas">Ver todas as vagas</Link>
        </div>
        {vagas.length ? (
          <ul className="vagas">{vagas.map((v) => <LinhaVaga key={v.id} v={v} />)}</ul>
        ) : (
          <p className="vazio">{lista ? 'Ainda não há vagas publicadas.' : 'Não foi possível carregar as vagas. Tente novamente dentro de instantes.'}</p>
        )}
      </section>

      {categorias.length > 0 && (
        <section className="seccao contentor">
          <h2>Procurar por área</h2>
          <ul className="categorias">
            {categorias.map((c) => <li key={c.id}><Link href={`/vagas?categoria=${c.id}`}>{c.nome}</Link></li>)}
          </ul>
        </section>
      )}

      <section className="faixa">
        <div className="contentor faixa-grelha">
          <div>
            <h2>Está a contratar?</h2>
            <p>Publique a sua vaga e receba candidaturas com currículo diretamente no painel da empresa.</p>
          </div>
          <Link href="/registar?tipo=empresa" className="botao">Publicar uma vaga</Link>
        </div>
      </section>
    </>
  );
}
