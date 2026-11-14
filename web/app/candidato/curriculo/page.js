'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, abrirPrivado } from '@/lib/api';
import { useProteger } from '@/components/Auth';
import { data } from '@/lib/format';
import NavCandidato from '@/components/NavCandidato';
import Aviso from '@/components/Aviso';

const EXT = /\.(pdf|docx?)$/i;

export default function CurriculoCandidato() {
  const { pronto } = useProteger('candidato');
  const [eu, setEu] = useState(null);
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [aEnviar, setAEnviar] = useState(false);

  const carregar = useCallback(() => api('/auth/eu').then(setEu).catch((e) => setMsg({ tipo: 'erro', texto: e.message })), []);
  useEffect(() => { if (pronto) carregar(); }, [pronto, carregar]);

  async function enviar(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!EXT.test(f.name)) return setMsg({ tipo: 'erro', texto: 'O currículo deve ser PDF, DOC ou DOCX.' });
    if (f.size > 5 * 1024 * 1024) return setMsg({ tipo: 'erro', texto: 'O ficheiro tem mais de 5 MB.' });
    setAEnviar(true); setMsg({ tipo: 'ok', texto: '' });
    try {
      const form = new FormData();
      form.append('curriculo', f);
      await api('/candidato/curriculo', { metodo: 'POST', form });
      await carregar();
      setMsg({ tipo: 'ok', texto: 'Currículo guardado.' });
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
    setAEnviar(false);
  }

  async function remover() {
    if (!confirm('Remover o currículo guardado? As candidaturas já enviadas mantêm o currículo que enviou na altura.')) return;
    try { await api('/candidato/curriculo', { metodo: 'DELETE' }); await carregar(); setMsg({ tipo: 'ok', texto: 'Currículo removido.' }); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  }

  if (!pronto || !eu) return <p className="contentor pagina suave">A carregar…</p>;
  return (
    <div className="contentor pagina">
      <NavCandidato />
      <h1 className="titulo-pagina">O meu currículo</h1>
      <div className="media">
        <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
        <section className="cartao" aria-label="Currículo guardado">
          {eu.curriculo ? (
            <>
              <div className="ficheiro">
                <span className="ficheiro-icone" aria-hidden="true">{/\.pdf$/i.test(eu.curriculo_nome || '') ? 'PDF' : 'DOC'}</span>
                <div>
                  <strong>{eu.curriculo_nome}</strong>
                  <p className="dica" style={{ margin: 0 }}>Guardado em {data(eu.curriculo_em)}</p>
                </div>
              </div>
              <div className="acoes" style={{ marginTop: 16 }}>
                <button className="botao botao-claro botao-pequeno" onClick={() => abrirPrivado('/candidato/curriculo').catch((e) => setMsg({ tipo: 'erro', texto: e.message }))}>Abrir</button>
                <label className="botao botao-pequeno" style={{ margin: 0 }}>
                  {aEnviar ? 'A enviar…' : 'Substituir'}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={enviar} disabled={aEnviar} className="sr-only" />
                </label>
                <button className="botao botao-claro botao-pequeno" onClick={remover}>Remover</button>
              </div>
            </>
          ) : (
            <label className="upload-caixa">
              <strong>{aEnviar ? 'A enviar…' : 'Adicionar currículo'}</strong>
              <span>PDF, DOC ou DOCX · até 5 MB</span>
              <span className="botao botao-pequeno">Escolher ficheiro</span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={enviar} disabled={aEnviar} className="sr-only" />
            </label>
          )}
        </section>

        <section className="cartao" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: '1.1rem' }}>Como funciona</h2>
          <ul className="texto-vaga" style={{ margin: 0 }}>
            <li>Este currículo é usado automaticamente quando se candidata a uma vaga.</li>
            <li>Cada candidatura guarda uma <strong>cópia</strong> do currículo da altura: se o substituir depois, as candidaturas antigas não mudam.</li>
            <li>Só as empresas a que se candidata (e a equipa do portal) podem abrir o seu currículo.</li>
            <li>Prefira PDF: mantém a formatação em qualquer dispositivo.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
