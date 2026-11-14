'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, baixarCurriculo } from '@/lib/api';
import { useProteger } from '@/components/Auth';
import { ESTADOS_CAND, data } from '@/lib/format';
import Avatar from '@/components/Avatar';
import Aviso from '@/components/Aviso';

export default function CandidaturaDetalhe() {
  const { id } = useParams();
  const { pronto } = useProteger('empresa');
  const [c, setC] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { if (pronto) api(`/empresa/candidaturas/${id}`).then(setC).catch((e) => setErro(e.message)); }, [pronto, id]);

  async function mudar(estado) {
    setMsg(''); setErro('');
    try { await api(`/empresa/candidaturas/${id}`, { metodo: 'PATCH', corpo: { estado } }); setC({ ...c, estado }); setMsg('Estado atualizado.'); }
    catch (e) { setErro(e.message); }
  }

  if (!pronto) return <p className="contentor pagina suave">A carregar…</p>;
  if (erro && !c) return <div className="contentor pagina"><Aviso>{erro}</Aviso><Link href="/empresa">← Voltar ao painel</Link></div>;
  if (!c) return <p className="contentor pagina suave">A carregar…</p>;
  const competencias = (c.competencias || '').split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="contentor pagina">
      <p className="migalhas"><Link href="/empresa">← Voltar ao painel</Link></p>
      <div className="perfil-grelha">
        <section className="cartao cartao-perfil">
          <Avatar id={c.candidato_id} nome={c.nome} versao={c.foto} tamanho={110} />
          <h1 style={{ fontSize: '1.6rem' }}>{c.nome}</h1>
          <p className="perfil-titulo">{c.titulo_candidato || 'Profissão não indicada'}</p>
          <p className="suave">{[c.provincia, c.escolaridade, c.experiencia].filter(Boolean).join(' · ')}</p>
          {competencias.length > 0 && <ul className="chips">{competencias.map((x) => <li key={x}>{x}</li>)}</ul>}
          {c.bio && <p className="perfil-bio">{c.bio}</p>}
          <p style={{ margin: 0 }}><a href={`mailto:${c.email}`}>{c.email}</a><br /><a href={`tel:${c.telefone}`}>{c.telefone}</a></p>
        </section>

        <section className="cartao">
          <h2 style={{ fontSize: '1.2rem' }}>Candidatura a “{c.vaga}”</h2>
          <p className="suave">Recebida em {data(c.criado_em)}</p>
          <Aviso>{erro}</Aviso>
          <Aviso tipo="ok">{msg}</Aviso>
          {c.mensagem && <><h3>Mensagem do candidato</h3><p className="perfil-bio">{c.mensagem}</p></>}
          <div className="campo" style={{ maxWidth: 280 }}>
            <label htmlFor="estado">Estado da candidatura</label>
            <select id="estado" value={c.estado} onChange={(e) => mudar(e.target.value)}>
              {Object.entries(ESTADOS_CAND).filter(([k]) => k !== 'retirada').map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
          </div>
          <div className="acoes">
            <button className="botao" onClick={() => baixarCurriculo(c.id).catch((e) => setErro(e.message))}>Abrir currículo{c.curriculo_nome ? ` (${c.curriculo_nome})` : ''}</button>
            <a className="botao botao-claro" href={`mailto:${c.email}?subject=${encodeURIComponent('Candidatura: ' + c.vaga)}`}>Enviar e-mail</a>
          </div>
        </section>
      </div>
    </div>
  );
}
