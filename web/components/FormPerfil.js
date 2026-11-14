'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TAMANHOS } from '@/lib/format';
import Aviso from './Aviso';
import FotoUpload from './FotoUpload';
import AlterarSenha from './AlterarSenha';

// Perfil da empresa
export default function FormPerfil() {
  const [p, setP] = useState(null);
  const [provincias, setProvincias] = useState([]);
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });

  const carregar = useCallback(() => api('/auth/eu').then(setP).catch((e) => setMsg({ tipo: 'erro', texto: e.message })), []);
  useEffect(() => { carregar(); api('/meta').then((m) => setProvincias(m.provincias)).catch(() => {}); }, [carregar]);

  async function guardar(e) {
    e.preventDefault();
    try {
      await api('/auth/perfil', { metodo: 'PUT', corpo: p });
      setMsg({ tipo: 'ok', texto: 'Perfil guardado.' });
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  }

  if (!p) return <p className="suave">A carregar…</p>;
  return (
    <>
    <form onSubmit={guardar} className="cartao media">
      <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
      <FotoUpload id={p.id} nome={p.nome_empresa || p.nome} foto={p.foto} tipo="empresa" aoAlterar={carregar}
        rotulo="Logótipo da empresa" dica="Aparece em todas as suas vagas. Use um logótipo quadrado." />
      <hr className="separador" />
      <div className="grelha-2">
        <div className="campo"><label htmlFor="nome_empresa">Nome da empresa</label><input id="nome_empresa" value={p.nome_empresa || ''} onChange={set('nome_empresa')} required /></div>
        <div className="campo"><label htmlFor="nif">NIF</label><input id="nif" value={p.nif || ''} onChange={set('nif')} /></div>
        <div className="campo"><label htmlFor="setor">Setor</label><input id="setor" value={p.setor || ''} onChange={set('setor')} /></div>
        <div className="campo">
          <label htmlFor="tamanho">Número de trabalhadores</label>
          <select id="tamanho" value={p.tamanho || ''} onChange={set('tamanho')}>
            <option value="">Selecionar</option>
            {TAMANHOS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="campo"><label htmlFor="website">Website</label><input id="website" value={p.website || ''} onChange={set('website')} /></div>
        <div className="campo"><label htmlFor="endereco">Endereço</label><input id="endereco" value={p.endereco || ''} onChange={set('endereco')} /></div>
        <div className="campo"><label htmlFor="nome">Nome do responsável</label><input id="nome" value={p.nome || ''} onChange={set('nome')} required /></div>
        <div className="campo"><label htmlFor="telefone">Telefone</label><input id="telefone" type="tel" value={p.telefone || ''} onChange={set('telefone')} /></div>
      </div>
      <div className="campo"><label htmlFor="descricao">Sobre a empresa</label><textarea id="descricao" maxLength={800} value={p.descricao || ''} onChange={set('descricao')} /></div>
      <button className="botao">Guardar alterações</button>
    </form>
    <AlterarSenha />
    </>
  );
}
