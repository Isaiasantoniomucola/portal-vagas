'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Aviso from './Aviso';

// Alterar palavra-passe (candidato, empresa e administrador)
export default function AlterarSenha() {
  const vazio = { senha_atual: '', nova_senha: '', confirmar: '' };
  const [f, setF] = useState(vazio);
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [aGuardar, setAGuardar] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function guardar(e) {
    e.preventDefault();
    setMsg({ tipo: 'ok', texto: '' });
    if (f.nova_senha.length < 8) return setMsg({ tipo: 'erro', texto: 'A nova palavra-passe deve ter pelo menos 8 caracteres.' });
    if (f.nova_senha !== f.confirmar) return setMsg({ tipo: 'erro', texto: 'As palavras-passe não coincidem.' });
    setAGuardar(true);
    try {
      await api('/auth/senha', { metodo: 'PUT', corpo: { senha_atual: f.senha_atual, nova_senha: f.nova_senha } });
      setF(vazio);
      setMsg({ tipo: 'ok', texto: 'Palavra-passe alterada.' });
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
    setAGuardar(false);
  }

  return (
    <form onSubmit={guardar} className="cartao media" style={{ marginTop: '1.5rem' }} autoComplete="off">
      <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>Alterar palavra-passe</h2>
      <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
      <div className="campo"><label htmlFor="senha_atual">Palavra-passe atual</label><input id="senha_atual" type="password" autoComplete="current-password" value={f.senha_atual} onChange={set('senha_atual')} required /></div>
      <div className="grelha-2">
        <div className="campo"><label htmlFor="nova_senha">Nova palavra-passe</label><input id="nova_senha" type="password" autoComplete="new-password" minLength={8} value={f.nova_senha} onChange={set('nova_senha')} required /><p className="dica">Mínimo de 8 caracteres.</p></div>
        <div className="campo"><label htmlFor="confirmar_senha">Confirmar nova palavra-passe</label><input id="confirmar_senha" type="password" autoComplete="new-password" value={f.confirmar} onChange={set('confirmar')} required /></div>
      </div>
      <button className="botao" disabled={aGuardar}>{aGuardar ? 'A alterar…' : 'Alterar palavra-passe'}</button>
    </form>
  );
}
