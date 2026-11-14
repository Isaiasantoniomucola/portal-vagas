'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TIPOS, REGIMES, EXPERIENCIAS } from '@/lib/format';
import Aviso from './Aviso';

const VAZIA = { titulo: '', provincia_id: '', categoria_id: '', tipo_contrato: 'tempo_inteiro', regime: 'presencial', numero_vagas: 1,
  experiencia: 'Sem experiência', salario: '', prazo: '', descricao: '', responsabilidades: '', requisitos: '', beneficios: '', email_contacto: '' };

export default function FormVaga({ id }) {
  const router = useRouter();
  const [v, setV] = useState(VAZIA);
  const [meta, setMeta] = useState({ categorias: [], provincias: [] });
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  useEffect(() => {
    api('/meta').then(setMeta).catch(() => {});
    if (id) api(`/empresa/vagas/${id}`).then((x) => setV({ ...VAZIA, ...x, prazo: x.prazo ? x.prazo.slice(0, 10) : '' })).catch((e) => setErro(e.message));
  }, [id]);

  async function enviar(e) {
    e.preventDefault();
    setErro(''); setAEnviar(true);
    try {
      await api(id ? `/empresa/vagas/${id}` : '/empresa/vagas', { metodo: id ? 'PUT' : 'POST', corpo: v });
      router.push('/empresa');
    } catch (err) { setErro(err.message); setAEnviar(false); }
  }

  return (
    <form onSubmit={enviar} className="cartao media">
      <Aviso>{erro}</Aviso>
      <div className="campo"><label htmlFor="titulo">Título da vaga</label><input id="titulo" value={v.titulo} onChange={set('titulo')} required /></div>
      <div className="grelha-2">
        <div className="campo"><label htmlFor="provincia_id">Província</label>
          <select id="provincia_id" value={v.provincia_id} onChange={set('provincia_id')} required><option value="">Selecionar</option>{meta.provincias.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></div>
        <div className="campo"><label htmlFor="categoria_id">Área</label>
          <select id="categoria_id" value={v.categoria_id} onChange={set('categoria_id')} required><option value="">Selecionar</option>{meta.categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
        <div className="campo"><label htmlFor="tipo_contrato">Tipo de contrato</label>
          <select id="tipo_contrato" value={v.tipo_contrato} onChange={set('tipo_contrato')}>{Object.entries(TIPOS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></div>
        <div className="campo"><label htmlFor="regime">Regime</label>
          <select id="regime" value={v.regime} onChange={set('regime')}>{Object.entries(REGIMES).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></div>
        <div className="campo"><label htmlFor="experiencia">Experiência</label>
          <select id="experiencia" value={v.experiencia} onChange={set('experiencia')}>{EXPERIENCIAS.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div className="campo"><label htmlFor="numero_vagas">Número de vagas</label><input id="numero_vagas" type="number" min="1" value={v.numero_vagas} onChange={set('numero_vagas')} /></div>
        <div className="campo"><label htmlFor="salario">Salário</label><input id="salario" value={v.salario || ''} onChange={set('salario')} placeholder="Ex.: 250.000 Kz/mês" /></div>
        <div className="campo"><label htmlFor="prazo">Prazo de candidatura</label><input id="prazo" type="date" value={v.prazo} onChange={set('prazo')} /></div>
      </div>
      <div className="campo"><label htmlFor="descricao">Descrição da vaga</label><textarea id="descricao" value={v.descricao} onChange={set('descricao')} required /></div>
      <div className="campo"><label htmlFor="responsabilidades">Responsabilidades</label><textarea id="responsabilidades" value={v.responsabilidades || ''} onChange={set('responsabilidades')} /><p className="dica">Escreva um item por linha.</p></div>
      <div className="campo"><label htmlFor="requisitos">Requisitos</label><textarea id="requisitos" value={v.requisitos || ''} onChange={set('requisitos')} /><p className="dica">Um item por linha.</p></div>
      <div className="campo"><label htmlFor="beneficios">Benefícios</label><textarea id="beneficios" value={v.beneficios || ''} onChange={set('beneficios')} /><p className="dica">Um item por linha.</p></div>
      <div className="campo"><label htmlFor="email_contacto">E-mail de contacto (não é mostrado publicamente)</label><input id="email_contacto" type="email" value={v.email_contacto || ''} onChange={set('email_contacto')} /></div>
      <p className="dica">Depois de enviada, a vaga é revista pela nossa equipa antes de ser publicada.</p>
      <button className="botao" disabled={aEnviar}>{aEnviar ? 'A guardar…' : id ? 'Guardar alterações' : 'Enviar para revisão'}</button>
    </form>
  );
}
