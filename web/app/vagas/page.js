import Link from 'next/link';
import { apiServidor } from '@/lib/api';
import { TIPOS, REGIMES } from '@/lib/format';
import LinhaVaga from '@/components/LinhaVaga';

export const metadata = { title: 'Vagas de emprego' };

export default async function Vagas({ searchParams }) {
  const f = { q: '', categoria: '', provincia: '', tipo: '', regime: '', pagina: '1', ...searchParams };
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  const [meta, res] = await Promise.all([apiServidor('/meta'), apiServidor(`/vagas?${qs}`)]);
  const ligacao = (pagina) => `/vagas?${new URLSearchParams({ ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)), pagina })}`;

  return (
    <div className="contentor pagina">
      <h1>Vagas de emprego</h1>
      <form className="filtros" action="/vagas" method="get">
        <div><label htmlFor="q">Cargo ou empresa</label><input id="q" name="q" defaultValue={f.q} /></div>
        <div>
          <label htmlFor="provincia">Província</label>
          <select id="provincia" name="provincia" defaultValue={f.provincia}>
            <option value="">Todas</option>
            {meta?.provincias.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="categoria">Área</label>
          <select id="categoria" name="categoria" defaultValue={f.categoria}>
            <option value="">Todas</option>
            {meta?.categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tipo">Contrato</label>
          <select id="tipo" name="tipo" defaultValue={f.tipo}>
            <option value="">Todos</option>
            {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="regime">Regime</label>
          <select id="regime" name="regime" defaultValue={f.regime}>
            <option value="">Todos</option>
            {Object.entries(REGIMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button className="botao" type="submit">Filtrar</button>
      </form>

      {!res ? (
        <p className="vazio">Não foi possível carregar as vagas. Tente novamente dentro de instantes.</p>
      ) : res.vagas.length === 0 ? (
        <p className="vazio">Nenhuma vaga corresponde à sua pesquisa. <Link href="/vagas">Limpar filtros</Link></p>
      ) : (
        <>
          <p className="suave">{res.total} {res.total === 1 ? 'vaga encontrada' : 'vagas encontradas'}</p>
          <ul className="vagas">{res.vagas.map((v) => <LinhaVaga key={v.id} v={v} />)}</ul>
          {res.paginas > 1 && (
            <nav className="paginacao" aria-label="Paginação">
              {res.pagina > 1 && <Link className="botao botao-claro botao-pequeno" href={ligacao(res.pagina - 1)}>Anterior</Link>}
              <span>Página {res.pagina} de {res.paginas}</span>
              {res.pagina < res.paginas && <Link className="botao botao-claro botao-pequeno" href={ligacao(res.pagina + 1)}>Seguinte</Link>}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
