'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, painelDe } from '@/components/Auth';
import Aviso from '@/components/Aviso';

export default function Registar() {
  const { entrar } = useAuth();
  const router = useRouter();
  const [tipo, setTipo] = useState('candidato');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tipo') === 'empresa') setTipo('empresa');
  }, []);

  async function submeter(e) {
    e.preventDefault();
    setErro(''); setAEnviar(true);
    const f = Object.fromEntries(new FormData(e.target));
    if (f.senha !== f.confirmar) { setErro('As palavras-passe não coincidem.'); setAEnviar(false); return; }
    try {
      const r = await api('/auth/registo', { metodo: 'POST', corpo: { ...f, tipo } });
      entrar(r.token, r.utilizador);
      router.push(painelDe(r.utilizador.tipo));
    } catch (err) { setErro(err.message); setAEnviar(false); }
  }

  return (
    <div className="contentor pagina estreita">
      <h1>Criar conta</h1>
      <form onSubmit={submeter} className="cartao">
        <div className="seletor" role="radiogroup" aria-label="Tipo de conta">
          <label><input type="radio" name="tipo" checked={tipo === 'candidato'} onChange={() => setTipo('candidato')} /><span>Procuro emprego</span></label>
          <label><input type="radio" name="tipo" checked={tipo === 'empresa'} onChange={() => setTipo('empresa')} /><span>Sou uma empresa</span></label>
        </div>
        <Aviso>{erro}</Aviso>
        {tipo === 'empresa' && (
          <>
            <div className="campo"><label htmlFor="nome_empresa">Nome da empresa</label><input id="nome_empresa" name="nome_empresa" required /></div>
            <div className="campo"><label htmlFor="nif">NIF (opcional)</label><input id="nif" name="nif" /></div>
          </>
        )}
        <div className="campo"><label htmlFor="nome">{tipo === 'empresa' ? 'Nome do responsável' : 'Nome completo'}</label><input id="nome" name="nome" autoComplete="name" required /></div>
        <div className="campo"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="campo"><label htmlFor="telefone">Telefone</label><input id="telefone" name="telefone" type="tel" autoComplete="tel" /></div>
        <div className="campo"><label htmlFor="senha">Palavra-passe</label><input id="senha" name="senha" type="password" minLength={8} autoComplete="new-password" required /><p className="dica">Mínimo de 8 caracteres.</p></div>
        <div className="campo"><label htmlFor="confirmar">Repetir palavra-passe</label><input id="confirmar" name="confirmar" type="password" autoComplete="new-password" required /></div>
        <button className="botao" style={{ width: '100%' }} disabled={aEnviar}>{aEnviar ? 'A criar conta…' : 'Criar conta'}</button>
        <p className="dica">Ao criar conta aceita os <Link href="/termos">Termos de uso</Link> e a <Link href="/privacidade">Política de privacidade</Link>.</p>
      </form>
      <p className="centro">Já tem conta? <Link href="/entrar">Entrar</Link></p>
    </div>
  );
}
