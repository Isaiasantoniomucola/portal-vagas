'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, baixarCurriculo } from '@/lib/api';
import { useProteger } from '@/components/Auth';
import { ESTADOS_VAGA, ESTADOS_CAND, data } from '@/lib/format';
import Separadores from '@/components/Separadores';
import Avatar from '@/components/Avatar';
import FormPerfil from '@/components/FormPerfil';
import Aviso from '@/components/Aviso';

export default function PainelEmpresa() {
  const { pronto } = useProteger('empresa');
  const [sep, setSep] = useState('vagas');
  const [vagas, setVagas] = useState([]);
  const [cands, setCands] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const [v, c] = await Promise.all([api('/empresa/vagas'), api('/empresa/candidaturas')]);
      setVagas(v); setCands(c);
    } catch (e) { setErro(e.message); }
  }, []);
  useEffect(() => { if (pronto) carregar(); }, [pronto, carregar]);

  const acao = (fn) => async () => { try { await fn(); await carregar(); } catch (e) { setErro(e.message); } };
  const encerrar = (id) => acao(() => api(`/empresa/vagas/${id}/encerrar`, { metodo: 'PATCH' }));
  const apagar = (id) => acao(async () => { if (confirm('Apagar esta vaga e as suas candidaturas?')) await api(`/empresa/vagas/${id}`, { metodo: 'DELETE' }); });
  const mudarEstado = async (id, estado) => { try { await api(`/empresa/candidaturas/${id}`, { metodo: 'PATCH', corpo: { estado } }); carregar(); } catch (e) { setErro(e.message); } };

  if (!pronto) return <p className="contentor pagina suave">A carregar…</p>;
  const lista = filtro ? cands.filter((c) => String(c.vaga_id) === filtro) : cands;

  return (
    <div className="contentor pagina">
      <div className="topo-painel"><h1>Painel da empresa</h1><Link className="botao" href="/empresa/vagas/nova">Publicar vaga</Link></div>
      <div className="resumo">
        <div><strong>{vagas.filter((v) => v.estado === 'aprovada').length}</strong>vagas publicadas</div>
        <div><strong>{vagas.filter((v) => v.estado === 'pendente').length}</strong>em revisão</div>
        <div><strong>{cands.length}</strong>candidaturas recebidas</div>
        <div><strong>{cands.filter((c) => c.estado === 'pendente').length}</strong>por analisar</div>
      </div>
      <Separadores ativo={sep} aoMudar={setSep} itens={[['vagas', 'As minhas vagas'], ['candidaturas', 'Candidaturas'], ['perfil', 'Perfil da empresa']]} />
      <Aviso>{erro}</Aviso>

      {sep === 'vagas' && (vagas.length === 0 ? (
        <p className="vazio">Ainda não publicou nenhuma vaga. <Link href="/empresa/vagas/nova">Publicar a primeira vaga</Link></p>
      ) : (
        <div className="tabela-rolar"><table>
          <thead><tr><th>Vaga</th><th>Estado</th><th>Candidaturas</th><th>Visitas</th><th>Prazo</th><th>Ações</th></tr></thead>
          <tbody>{vagas.map((v) => (
            <tr key={v.id}>
              <td>{v.estado === 'aprovada' ? <Link href={`/vagas/${v.id}`}>{v.titulo}</Link> : v.titulo}<br /><span className="suave">{v.provincia}</span></td>
              <td><span className={`etiqueta etiqueta-${v.estado}`}>{ESTADOS_VAGA[v.estado]}</span></td>
              <td><button className="botao-texto" onClick={() => { setFiltro(String(v.id)); setSep('candidaturas'); }}>{v.candidaturas}</button></td>
              <td>{v.visualizacoes}</td><td>{v.prazo ? data(v.prazo) : '—'}</td>
              <td><div className="acoes">
                <Link className="botao botao-claro botao-pequeno" href={`/empresa/vagas/${v.id}/editar`}>Editar</Link>
                {v.estado === 'aprovada' && <button className="botao botao-claro botao-pequeno" onClick={encerrar(v.id)}>Encerrar</button>}
                <button className="botao botao-claro botao-pequeno" onClick={apagar(v.id)}>Apagar</button>
              </div></td>
            </tr>))}</tbody>
        </table></div>
      ))}

      {sep === 'candidaturas' && (
        <>
          <div className="campo" style={{ maxWidth: 360 }}>
            <label htmlFor="fv">Filtrar por vaga</label>
            <select id="fv" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="">Todas as vagas</option>
              {vagas.map((v) => <option key={v.id} value={v.id}>{v.titulo}</option>)}
            </select>
          </div>
          {lista.length === 0 ? <p className="vazio">Ainda não há candidaturas.</p> : (
            <div className="tabela-rolar"><table>
              <thead><tr><th>Candidato</th><th>Vaga</th><th>Contactos</th><th>Data</th><th>Estado</th><th>Ações</th></tr></thead>
              <tbody>{lista.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="celula-pessoa">
                      <Avatar id={c.candidato_id} nome={c.nome} versao={c.foto} tamanho={40} />
                      <div>
                        <Link href={`/empresa/candidaturas/${c.id}`}><strong>{c.nome}</strong></Link>
                        <br /><span className="suave">{[c.titulo_candidato, c.experiencia].filter(Boolean).join(' · ')}</span>
                      </div>
                    </div>
                  </td>
                  <td>{c.vaga}</td>
                  <td><a href={`mailto:${c.email}`}>{c.email}</a><br /><a href={`tel:${c.telefone}`}>{c.telefone}</a></td>
                  <td>{data(c.criado_em)}</td>
                  <td>
                    <label className="sr-only" style={{ position: 'absolute', left: -999 }} htmlFor={`e${c.id}`}>Estado da candidatura de {c.nome}</label>
                    <select id={`e${c.id}`} value={c.estado} onChange={(e) => mudarEstado(c.id, e.target.value)}>
                      {Object.entries(ESTADOS_CAND).filter(([k]) => k !== 'retirada').map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                    </select>
                  </td>
                  <td><div className="acoes">
                    <Link className="botao botao-pequeno" href={`/empresa/candidaturas/${c.id}`}>Ver perfil</Link>
                    <button className="botao botao-claro botao-pequeno" onClick={() => baixarCurriculo(c.id).catch((e) => setErro(e.message))}>CV</button>
                  </div></td>
                </tr>))}</tbody>
            </table></div>
          )}
        </>
      )}

      {sep === 'perfil' && <FormPerfil />}
    </div>
  );
}
