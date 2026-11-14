'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Aviso from '@/components/Aviso';

export default function Contacto() {
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [aEnviar, setAEnviar] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    const form = e.target;
    setAEnviar(true); setMsg({ tipo: 'ok', texto: '' });
    try {
      await api('/contacto', { metodo: 'POST', corpo: Object.fromEntries(new FormData(form)) });
      setMsg({ tipo: 'ok', texto: 'Mensagem enviada. Respondemos assim que possível.' });
      form.reset();
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
    setAEnviar(false);
  }

  return (
    <div className="contentor pagina estreita">
      <h1>Contacto</h1>
      <p className="suave">Dúvidas sobre a sua conta, uma vaga ou uma denúncia? Escreva-nos.</p>
      <form onSubmit={enviar} className="cartao">
        <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
        <div className="campo"><label htmlFor="nome">Nome</label><input id="nome" name="nome" required /></div>
        <div className="campo"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required /></div>
        <div className="campo"><label htmlFor="assunto">Assunto</label><input id="assunto" name="assunto" required /></div>
        <div className="campo"><label htmlFor="mensagem">Mensagem</label><textarea id="mensagem" name="mensagem" minLength={10} required /></div>
        <button className="botao" disabled={aEnviar}>{aEnviar ? 'A enviar…' : 'Enviar mensagem'}</button>
      </form>
    </div>
  );
}
