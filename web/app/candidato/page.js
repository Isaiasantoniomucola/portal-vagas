'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useProteger } from '@/components/Auth';
import { ESTADOS_CAND, TIPOS, REGIMES, data } from '@/lib/format';
import Separadores from '@/components/Separadores';
import NavCandidato from '@/components/NavCandidato';
import Avatar from '@/components/Avatar';
import Progresso from '@/components/Progresso';
import Aviso from '@/components/Aviso';

export default function PainelCandidato() {
  const { pronto } = useProteger('candidato');
  const [sep, setSep] = useState('candidaturas');
  const [eu, setEu] = useState(null);
  const [cands, setCands] = useState([]);
  const [guardadas, setGuardadas] = useState([]);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const [c, g, u] = await Promise.all([api('/candidato/candidaturas'), api('/candidato/guardadas'), api('/auth/eu')]);
      setCands(c); setGuardadas(g); setEu(u);
    } catch (e) { setErro(e.message); }
  }, []);
  useEffect(() => { if (pronto) carregar(); }, [pronto, carregar]);

  async function retirar(id) {
    if (!confirm('Retirar esta candidatura?')) return;
    try { await api(`/candidato/candidaturas/${id}/retirar`, { metodo: 'POST' }); carregar(); } catch (e) { setErro(e.message); }
  }
  async function removerGuardada(id) {
    try { await api(`/candidato/guardadas/${id}`, { metodo: 'DELETE' }); carregar(); } catch (e) { setErro(e.message); }
  }

  if (!pronto) return <p className="contentor pagina suave">A carregar…</p>;
  const perfil = eu?.perfil;
  const ativas = cands.filter((c) => c.estado !== 'retirada');

  return (
    <div className="contentor pagina">
      <NavCandidato />
      {eu && (
        <section className="resumo-perfil cartao" aria-label="Resumo do perfil">
          <Avatar id={eu.id} nome={eu.nome} versao={eu.foto} tamanho={72} />
          <div className="resumo-perfil-texto">
            <h1>Olá, {eu.nome.split(' ')[0]}</h1>
            <p className="suave">{eu.titulo || 'Complete o seu perfil para se destacar'}{eu.provincia ? ` · ${eu.provincia}` : ''}</p>
            {perfil && (
              <>
                <Progresso valor={perfil.percentagem} minimo={perfil.minimo} />
                <p className="dica">
                  Perfil {perfil.percentagem}% completo.{' '}
                  {perfil.pode_candidatar
                    ? (perfil.faltam.length ? 'Pode candidatar-se; complete o resto para ganhar destaque.' : 'Perfil completo.')
                    : `Precisa de ${perfil.minimo}% para se candidatar.`}{' '}
                  {perfil.faltam.length > 0 && <Link href="/candidato/perfil">Completar perfil</Link>}
                </p>
              </>
            )}
          </div>
          <Link className="botao" href="/vagas">Procurar vagas</Link>
        </section>
      )}

      <div className="resumo">
        <div><strong>{ativas.length}</strong>candidaturas enviadas</div>
        <div><strong>{ativas.filter((c) => c.estado === 'em_analise').length}</strong>em análise</div>
        <div><strong>{ativas.filter((c) => c.estado === 'aceite').length}</strong>aceites</div>
        <div><strong>{guardadas.length}</strong>vagas guardadas</div>
      </div>

      <Separadores ativo={sep} aoMudar={setSep} itens={[['candidaturas', 'Candidaturas'], ['guardadas', 'Vagas guardadas']]} />
      <Aviso>{erro}</Aviso>

      {sep === 'candidaturas' && (cands.length === 0 ? (
        <p className="vazio">Ainda não se candidatou a nenhuma vaga. <Link href="/vagas">Ver vagas abertas</Link></p>
      ) : (
        <div className="tabela-rolar"><table>
          <thead><tr><th>Vaga</th><th>Empresa</th><th>Data</th><th>Estado</th><th></th></tr></thead>
          <tbody>{cands.map((c) => (
            <tr key={c.id}>
              <td><Link href={`/vagas/${c.vaga_id}`}>{c.titulo}</Link><br /><span className="suave">{c.provincia}</span></td>
              <td>{c.nome_empresa}</td><td>{data(c.criado_em)}</td>
              <td><span className={`etiqueta etiqueta-${c.estado}`}>{ESTADOS_CAND[c.estado]}</span></td>
              <td>{['pendente', 'em_analise'].includes(c.estado) && <button className="botao botao-claro botao-pequeno" onClick={() => retirar(c.id)}>Retirar</button>}</td>
            </tr>))}</tbody>
        </table></div>
      ))}

      {sep === 'guardadas' && (guardadas.length === 0 ? (
        <p className="vazio">Não guardou nenhuma vaga. Use “Guardar vaga” na página da vaga.</p>
      ) : (
        <ul className="vagas">{guardadas.map((v) => (
          <li key={v.id} className="vaga-linha" style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="vaga-corpo">
              <h3><Link href={`/vagas/${v.id}`}>{v.titulo}</Link></h3>
              <p className="vaga-empresa">{v.nome_empresa} · {v.provincia}</p>
              <p className="vaga-meta"><span>{TIPOS[v.tipo_contrato]}</span><span>{REGIMES[v.regime]}</span>{v.estado !== 'aprovada' && <span>Encerrada</span>}</p>
            </div>
            <button className="botao botao-claro botao-pequeno" onClick={() => removerGuardada(v.id)}>Remover</button>
          </li>))}</ul>
      ))}
    </div>
  );
}
