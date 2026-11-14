'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, painelDe } from '@/components/Auth';
import Aviso from '@/components/Aviso';

export default function Entrar() {
  const { entrar } = useAuth();
  const router = useRouter();
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  async function submeter(e) {
    e.preventDefault();
    setErro(''); setAEnviar(true);
    const f = Object.fromEntries(new FormData(e.target));
    try {
      const r = await api('/auth/entrar', { metodo: 'POST', corpo: f });
      entrar(r.token, r.utilizador);
      const proxima = new URLSearchParams(window.location.search).get('proxima');
      router.push(proxima && proxima.startsWith('/') && !proxima.startsWith('//') ? proxima : painelDe(r.utilizador.tipo));
    } catch (err) { setErro(err.message); setAEnviar(false); }
  }

  return (
    <div className="contentor pagina estreita">
      <h1>Entrar</h1>
      <form onSubmit={submeter} className="cartao">
        <Aviso>{erro}</Aviso>
        <div className="campo"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="campo"><label htmlFor="senha">Palavra-passe</label><input id="senha" name="senha" type="password" autoComplete="current-password" required /></div>
        <button className="botao" style={{ width: '100%' }} disabled={aEnviar}>{aEnviar ? 'A entrar…' : 'Entrar'}</button>
      </form>
      <p className="centro">Ainda não tem conta? <Link href="/registar">Criar conta</Link></p>
    </div>
  );
}
