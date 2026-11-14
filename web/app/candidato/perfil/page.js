'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useProteger } from '@/components/Auth';
import { ESCOLARIDADES, EXPERIENCIAS } from '@/lib/format';
import NavCandidato from '@/components/NavCandidato';
import Avatar from '@/components/Avatar';
import FotoUpload from '@/components/FotoUpload';
import Progresso from '@/components/Progresso';
import Aviso from '@/components/Aviso';
import AlterarSenha from '@/components/AlterarSenha';

export default function PerfilCandidato() {
  const { pronto } = useProteger('candidato');
  const [eu, setEu] = useState(null);
  const [f, setF] = useState(null);
  const [provincias, setProvincias] = useState([]);
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [aGuardar, setAGuardar] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const carregar = useCallback(async () => {
    try { const u = await api('/auth/eu'); setEu(u); setF((ant) => ant || u); } catch (e) { setMsg({ tipo: 'erro', texto: e.message }); }
  }, []);
  useEffect(() => { if (pronto) { carregar(); api('/meta').then((m) => setProvincias(m.provincias)).catch(() => {}); } }, [pronto, carregar]);

  async function guardar(e) {
    e.preventDefault();
    setAGuardar(true); setMsg({ tipo: 'ok', texto: '' });
    try {
      await api('/auth/perfil', { metodo: 'PUT', corpo: f });
      await carregar();
      setMsg({ tipo: 'ok', texto: 'Perfil guardado.' });
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
    setAGuardar(false);
  }

  if (!pronto || !eu || !f) return <p className="contentor pagina suave">A carregar…</p>;
  const perfil = eu.perfil;
  const provinciaNome = provincias.find((p) => String(p.id) === String(f.provincia_id))?.nome;
  const competencias = (f.competencias || '').split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="contentor pagina">
      <NavCandidato />
      <h1 className="titulo-pagina">O meu perfil</h1>
      <div className="perfil-grelha">
        <aside className="perfil-lado">
          <section className="cartao cartao-perfil" aria-label="Pré-visualização do perfil">
            <p className="dica" style={{ marginTop: 0 }}>Assim as empresas veem o seu perfil quando se candidata:</p>
            <Avatar id={eu.id} nome={f.nome} versao={eu.foto} tamanho={110} />
            <h2>{f.nome}</h2>
            <p className="perfil-titulo">{f.titulo || 'Profissão por definir'}</p>
            <p className="suave">{[provinciaNome, f.escolaridade, f.experiencia].filter(Boolean).join(' · ') || 'Complete os seus dados'}</p>
            {competencias.length > 0 && <ul className="chips">{competencias.map((c) => <li key={c}>{c}</li>)}</ul>}
            {f.bio && <p className="perfil-bio">{f.bio}</p>}
            <p className="suave" style={{ fontSize: '.9rem' }}>{eu.email}{f.telefone ? ` · ${f.telefone}` : ''}</p>
            <p className="etiqueta" style={{ marginTop: 8 }}>{eu.curriculo ? `CV: ${eu.curriculo_nome}` : 'Sem currículo'}</p>
          </section>

          <section className="cartao" aria-label="Qualidade do perfil">
            <h2 style={{ fontSize: '1.1rem' }}>Perfil {perfil.percentagem}% completo</h2>
            <Progresso valor={perfil.percentagem} minimo={perfil.minimo} />
            <p className="dica">{perfil.pode_candidatar ? 'Já pode candidatar-se às vagas.' : `Precisa de ${perfil.minimo}% para se candidatar.`}</p>
            {perfil.faltam.length > 0 && (
              <ul className="checklist">
                {perfil.faltam.map((i) => (
                  <li key={i.campo}>
                    {i.campo === 'curriculo' ? <Link href="/candidato/curriculo">{i.rotulo}</Link> : i.rotulo}
                    <span>+{i.peso}%</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <form onSubmit={guardar} className="cartao">
          <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
          <FotoUpload id={eu.id} nome={eu.nome} foto={eu.foto} aoAlterar={carregar} dica="Use uma foto nítida, de frente e com fundo simples." />
          <hr className="separador" />
          <div className="grelha-2">
            <div className="campo"><label htmlFor="nome">Nome completo</label><input id="nome" value={f.nome || ''} onChange={set('nome')} required /></div>
            <div className="campo"><label htmlFor="telefone">Telefone</label><input id="telefone" type="tel" value={f.telefone || ''} onChange={set('telefone')} /></div>
            <div className="campo"><label htmlFor="email">E-mail</label><input id="email" value={eu.email} disabled /></div>
            <div className="campo">
              <label htmlFor="provincia_id">Província</label>
              <select id="provincia_id" value={f.provincia_id || ''} onChange={set('provincia_id')}>
                <option value="">Selecionar</option>
                {provincias.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="campo"><label htmlFor="titulo">Profissão ou título</label><input id="titulo" value={f.titulo || ''} onChange={set('titulo')} placeholder="Ex.: Técnico de informática" /></div>
            <div className="campo">
              <label htmlFor="escolaridade">Nível de escolaridade</label>
              <select id="escolaridade" value={f.escolaridade || ''} onChange={set('escolaridade')}>
                <option value="">Selecionar</option>
                {ESCOLARIDADES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="experiencia">Experiência profissional</label>
              <select id="experiencia" value={f.experiencia || ''} onChange={set('experiencia')}>
                <option value="">Selecionar</option>
                {EXPERIENCIAS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="campo"><label htmlFor="competencias">Competências</label><input id="competencias" value={f.competencias || ''} onChange={set('competencias')} placeholder="Excel, Atendimento, Inglês" /><p className="dica">Separe por vírgulas (mínimo 2).</p></div>
          </div>
          <div className="campo">
            <label htmlFor="bio">Apresentação</label>
            <textarea id="bio" maxLength={600} value={f.bio || ''} onChange={set('bio')} placeholder="Fale em poucas linhas da sua experiência e do que procura." />
            <p className="dica">{(f.bio || '').length}/600 (mínimo 40 para pontuar)</p>
          </div>
          <button className="botao" disabled={aGuardar}>{aGuardar ? 'A guardar…' : 'Guardar perfil'}</button>
        </form>
      </div>
      <AlterarSenha />
    </div>
  );
}
