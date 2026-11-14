'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useProteger } from '@/components/Auth';
import { ESTADOS_VAGA, data } from '@/lib/format';
import Separadores from '@/components/Separadores';
import AlterarSenha from '@/components/AlterarSenha';
import Aviso from '@/components/Aviso';

function Lookup({ rota, titulo, setErro }) {
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState('');
  const carregar = useCallback(() => api('/meta').then((m) => setItens(m[rota])).catch((e) => setErro(e.message)), [rota, setErro]);
  useEffect(() => { carregar(); }, [carregar]);
  const executar = async (fn) => { setErro(''); try { await fn(); await carregar(); } catch (e) { setErro(e.message); } };

  return (
    <div className="media">
      <form className="topo-painel" onSubmit={(e) => { e.preventDefault(); executar(async () => { await api(`/admin/${rota}`, { metodo: 'POST', corpo: { nome } }); setNome(''); }); }}>
        <div className="campo" style={{ flex: 1, margin: 0 }}>
          <label htmlFor={`n-${rota}`}>Adicionar {titulo}</label>
          <input id={`n-${rota}`} value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <button className="botao" style={{ alignSelf: 'flex-end' }}>Adicionar</button>
      </form>
      <div className="tabela-rolar"><table>
        <thead><tr><th>Nome</th><th>Ações</th></tr></thead>
        <tbody>{itens.map((i) => (
          <tr key={i.id}><td>{i.nome}</td><td><div className="acoes">
            <button className="botao botao-claro botao-pequeno" onClick={() => { const n = prompt('Novo nome', i.nome); if (n) executar(() => api(`/admin/${rota}/${i.id}`, { metodo: 'PUT', corpo: { nome: n } })); }}>Renomear</button>
            <button className="botao botao-claro botao-pequeno" onClick={() => confirm(`Apagar “${i.nome}”?`) && executar(() => api(`/admin/${rota}/${i.id}`, { metodo: 'DELETE' }))}>Apagar</button>
          </div></td></tr>))}</tbody>
      </table></div>
    </div>
  );
}

export default function PainelAdmin() {
  const { pronto } = useProteger('admin');
  const [sep, setSep] = useState('vagas');
  const [resumo, setResumo] = useState(null);
  const [estado, setEstado] = useState('pendente');
  const [vagas, setVagas] = useState([]);
  const [tipoU, setTipoU] = useState('empresa');
  const [users, setUsers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [erro, setErro] = useState('');

  const carregarVagas = useCallback(() => api(`/admin/vagas?estado=${estado}`).then(setVagas).catch((e) => setErro(e.message)), [estado]);
  useEffect(() => { if (pronto) api('/admin/resumo').then(setResumo).catch((e) => setErro(e.message)); }, [pronto, vagas]);
  useEffect(() => { if (pronto && sep === 'vagas') carregarVagas(); }, [pronto, sep, carregarVagas]);
  useEffect(() => { if (pronto && sep === 'utilizadores') api(`/admin/utilizadores?tipo=${tipoU}`).then(setUsers).catch((e) => setErro(e.message)); }, [pronto, sep, tipoU]);
  useEffect(() => { if (pronto && sep === 'mensagens') api('/admin/mensagens').then(setMsgs).catch((e) => setErro(e.message)); }, [pronto, sep]);

  const mudarVaga = async (id, novo) => { try { await api(`/admin/vagas/${id}`, { metodo: 'PATCH', corpo: { estado: novo } }); carregarVagas(); } catch (e) { setErro(e.message); } };
  const apagarVaga = async (id) => { if (!confirm('Apagar esta vaga definitivamente?')) return; try { await api(`/admin/vagas/${id}`, { metodo: 'DELETE' }); carregarVagas(); } catch (e) { setErro(e.message); } };
  const alternarUser = async (u) => { try { await api(`/admin/utilizadores/${u.id}`, { metodo: 'PATCH', corpo: { ativo: !u.ativo } }); setUsers(users.map((x) => (x.id === u.id ? { ...x, ativo: u.ativo ? 0 : 1 } : x))); } catch (e) { setErro(e.message); } };

  if (!pronto) return <p className="contentor pagina suave">A carregar…</p>;
  return (
    <div className="contentor pagina">
      <div className="topo-painel"><h1>Administração</h1></div>
      {resumo && (
        <div className="resumo">
          <div><strong>{resumo.pendentes}</strong>vagas por aprovar</div>
          <div><strong>{resumo.aprovadas}</strong>vagas publicadas</div>
          <div><strong>{resumo.empresas}</strong>empresas</div>
          <div><strong>{resumo.candidatos}</strong>candidatos</div>
          <div><strong>{resumo.candidaturas}</strong>candidaturas</div>
        </div>
      )}
      <Separadores ativo={sep} aoMudar={(s) => { setErro(''); setSep(s); }} itens={[['vagas', 'Vagas'], ['utilizadores', 'Utilizadores'], ['categorias', 'Áreas'], ['provincias', 'Províncias'], ['mensagens', 'Mensagens'], ['conta', 'Conta']]} />
      <Aviso>{erro}</Aviso>

      {sep === 'vagas' && (
        <>
          <div className="campo" style={{ maxWidth: 260 }}>
            <label htmlFor="est">Estado</label>
            <select id="est" value={estado} onChange={(e) => setEstado(e.target.value)}>
              {Object.entries(ESTADOS_VAGA).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
          </div>
          {vagas.length === 0 ? <p className="vazio">Nenhuma vaga neste estado.</p> : (
            <div className="tabela-rolar"><table>
              <thead><tr><th>Vaga</th><th>Empresa</th><th>Área</th><th>Data</th><th>Ações</th></tr></thead>
              <tbody>{vagas.map((v) => (
                <tr key={v.id}>
                  <td><Link href={`/vagas/${v.id}`}>{v.titulo}</Link><br /><span className="suave">{v.provincia}</span></td>
                  <td>{v.nome_empresa}</td><td>{v.categoria}</td><td>{data(v.criado_em)}</td>
                  <td><div className="acoes">
                    {v.estado !== 'aprovada' && <button className="botao botao-pequeno" onClick={() => mudarVaga(v.id, 'aprovada')}>Aprovar</button>}
                    {v.estado === 'pendente' && <button className="botao botao-claro botao-pequeno" onClick={() => mudarVaga(v.id, 'rejeitada')}>Rejeitar</button>}
                    {v.estado === 'aprovada' && <button className="botao botao-claro botao-pequeno" onClick={() => mudarVaga(v.id, 'encerrada')}>Encerrar</button>}
                    <button className="botao botao-claro botao-pequeno" onClick={() => apagarVaga(v.id)}>Apagar</button>
                  </div></td>
                </tr>))}</tbody>
            </table></div>
          )}
        </>
      )}

      {sep === 'utilizadores' && (
        <>
          <div className="campo" style={{ maxWidth: 260 }}>
            <label htmlFor="tu">Tipo de conta</label>
            <select id="tu" value={tipoU} onChange={(e) => setTipoU(e.target.value)}><option value="empresa">Empresas</option><option value="candidato">Candidatos</option></select>
          </div>
          <div className="tabela-rolar"><table>
            <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Registo</th><th>Estado</th></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id}>
                <td>{u.nome_empresa || u.nome}{u.nome_empresa && <><br /><span className="suave">{u.nome}</span></>}</td>
                <td>{u.email}</td><td>{u.telefone || '—'}</td><td>{data(u.criado_em)}</td>
                <td><button className="botao botao-claro botao-pequeno" onClick={() => alternarUser(u)}>{u.ativo ? 'Desativar' : 'Reativar'}</button></td>
              </tr>))}</tbody>
          </table></div>
        </>
      )}

      {sep === 'categorias' && <Lookup rota="categorias" titulo="área" setErro={setErro} />}
      {sep === 'provincias' && <Lookup rota="provincias" titulo="província" setErro={setErro} />}

      {sep === 'conta' && <AlterarSenha />}

      {sep === 'mensagens' && (msgs.length === 0 ? <p className="vazio">Sem mensagens.</p> : (
        <div className="tabela-rolar"><table>
          <thead><tr><th>De</th><th>Assunto</th><th>Mensagem</th><th>Data</th></tr></thead>
          <tbody>{msgs.map((m) => (
            <tr key={m.id}><td>{m.nome}<br /><a href={`mailto:${m.email}`}>{m.email}</a></td><td>{m.assunto}</td><td style={{ minWidth: 240 }}>{m.mensagem}</td><td>{data(m.criado_em)}</td></tr>))}</tbody>
        </table></div>
      ))}
    </div>
  );
}
