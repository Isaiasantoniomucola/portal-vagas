'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from './Auth';
import Aviso from './Aviso';

export default function AcoesVaga({ vagaId, encerrada }) {
  const { utilizador, carregado } = useAuth();
  const [guardada, setGuardada] = useState(false);
  const [candidatou, setCandidatou] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);
  const candidato = utilizador?.tipo === 'candidato';

  useEffect(() => {
    if (!carregado || !candidato) return;
    Promise.all([api('/candidato/guardadas'), api('/candidato/candidaturas'), api('/auth/eu')])
      .then(([g, c, eu]) => {
        setGuardada(g.some((x) => x.id === vagaId));
        setCandidatou(c.some((x) => x.vaga_id === vagaId && x.estado !== 'retirada'));
        setPerfil(eu);
      })
      .catch(() => {});
  }, [carregado, candidato, vagaId]);

  async function alternarGuardar() {
    try {
      await api(`/candidato/guardadas/${vagaId}`, { metodo: guardada ? 'DELETE' : 'POST' });
      setGuardada(!guardada);
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }); }
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true); setMsg({ tipo: '', texto: '' });
    try {
      await api(`/vagas/${vagaId}/candidatar`, { metodo: 'POST', form: new FormData(e.target) });
      setCandidatou(true); setForm(false);
      setMsg({ tipo: 'ok', texto: 'Candidatura enviada. Acompanhe o estado no seu painel.' });
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.message });
      api('/auth/eu').then(setPerfil).catch(() => {});
    }
    setEnviando(false);
  }

  if (encerrada) return <Aviso tipo="erro">Esta vaga já não aceita candidaturas.</Aviso>;
  if (!carregado) return null;
  if (!utilizador) {
    return (
      <>
        <Link className="botao" style={{ width: '100%' }} href={`/entrar?proxima=/vagas/${vagaId}`}>Entrar para se candidatar</Link>
        <p className="dica">Ainda não tem conta? <Link href="/registar">Crie uma gratuitamente</Link>.</p>
      </>
    );
  }
  if (!candidato) return <p className="dica">Apenas contas de candidato podem candidatar-se.</p>;

  return (
    <>
      <Aviso tipo={msg.tipo || 'erro'}>{msg.texto}</Aviso>
      {candidatou ? (
        <p className="etiqueta etiqueta-aceite">Já se candidatou a esta vaga</p>
      ) : perfil && !perfil.perfil.pode_candidatar ? (
        <div className="aviso aviso-erro">
          <p style={{ margin: '0 0 .5rem' }}>O seu perfil está a {perfil.perfil.percentagem}%. Precisa de {perfil.perfil.minimo}% para se candidatar.</p>
          <ul className="checklist">{perfil.perfil.faltam.slice(0, 5).map((i) => <li key={i.campo}>{i.rotulo}<span>+{i.peso}%</span></li>)}</ul>
          <Link className="botao botao-pequeno" href="/candidato/perfil">Completar perfil</Link>
        </div>
      ) : form ? (
        <form onSubmit={enviar}>
          <div className="campo">
            <label htmlFor="telefone">Telefone</label>
            <input id="telefone" name="telefone" type="tel" required defaultValue={perfil?.telefone || ''} />
          </div>
          <div className="campo">
            <label htmlFor="curriculo">Currículo (PDF, DOC ou DOCX)</label>
            {perfil?.curriculo ? (
              <p className="dica" style={{ margin: '0 0 .4rem' }}>Vamos enviar o seu currículo guardado: <strong>{perfil.curriculo_nome}</strong>. Pode trocá-lo abaixo (passa a ser o seu currículo guardado).</p>
            ) : null}
            <input id="curriculo" name="curriculo" type="file" accept=".pdf,.doc,.docx" required={!perfil?.curriculo} />
          </div>
          <div className="campo">
            <label htmlFor="mensagem">Mensagem para a empresa (opcional)</label>
            <textarea id="mensagem" name="mensagem" maxLength={1500} />
          </div>
          <button className="botao" style={{ width: '100%' }} disabled={enviando}>{enviando ? 'A enviar…' : 'Enviar candidatura'}</button>
        </form>
      ) : (
        <button className="botao" style={{ width: '100%' }} onClick={() => setForm(true)}>Candidatar-me</button>
      )}
      <button className="botao botao-claro" style={{ width: '100%', marginTop: '.6rem' }} onClick={alternarGuardar} aria-pressed={guardada}>
        {guardada ? 'Vaga guardada ✓' : 'Guardar vaga'}
      </button>
    </>
  );
}
