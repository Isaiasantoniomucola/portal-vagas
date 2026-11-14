export default function BuscaVagas({ provincias = [], q = '', provincia = '' }) {
  return (
    <form action="/vagas" method="get" className="busca" role="search">
      <div>
        <label htmlFor="q" className="sr-only" style={{ position: 'absolute', left: -999 }}>Cargo ou empresa</label>
        <input id="q" name="q" defaultValue={q} placeholder="Cargo, palavra-chave ou empresa" />
      </div>
      <div>
        <label htmlFor="provincia" style={{ position: 'absolute', left: -999 }}>Província</label>
        <select id="provincia" name="provincia" defaultValue={provincia}>
          <option value="">Todas as províncias</option>
          {provincias.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>
      <button className="botao" type="submit">Procurar vagas</button>
    </form>
  );
}
