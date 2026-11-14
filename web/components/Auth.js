'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem('utilizador');
      if (u && localStorage.getItem('token')) setUtilizador(JSON.parse(u));
    } catch {}
    setCarregado(true);
  }, []);

  const entrar = useCallback((token, u) => {
    localStorage.setItem('token', token);
    localStorage.setItem('utilizador', JSON.stringify(u));
    setUtilizador(u);
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilizador');
    setUtilizador(null);
  }, []);

  return <Ctx.Provider value={{ utilizador, carregado, entrar, sair }}>{children}</Ctx.Provider>;
}

export const painelDe = (tipo) => (tipo === 'admin' ? '/admin' : tipo === 'empresa' ? '/empresa' : '/candidato');

// Redireciona quem não tem sessão ou o tipo de conta certo
export function useProteger(tipo) {
  const { utilizador, carregado, sair } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!carregado) return;
    if (!utilizador) router.replace(`/entrar?proxima=${encodeURIComponent(window.location.pathname)}`);
    else if (utilizador.tipo !== tipo) router.replace(painelDe(utilizador.tipo));
  }, [carregado, utilizador, tipo, router]);
  return { pronto: carregado && utilizador?.tipo === tipo, utilizador, sair };
}
