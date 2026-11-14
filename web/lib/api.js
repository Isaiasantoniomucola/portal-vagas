export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Chamadas feitas no navegador (com o token da sessão)
export async function api(caminho, { metodo = 'GET', corpo, form } = {}) {
  const headers = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (form) body = form;
  else if (corpo) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(corpo);
  }
  let r;
  try {
    r = await fetch(API + caminho, { method: metodo, headers, body });
  } catch {
    throw new Error('Sem ligação ao servidor. Verifique a internet e tente novamente.');
  }
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(dados.erro || 'Não foi possível concluir o pedido.');
    e.status = r.status;
    throw e;
  }
  return dados;
}

// Chamadas feitas no servidor Next.js (páginas públicas)
export async function apiServidor(caminho) {
  try {
    const r = await fetch((process.env.API_URL || API) + caminho, { cache: 'no-store' });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

// Abre um ficheiro privado (exige sessão) num novo separador
export async function abrirPrivado(caminho) {
  const token = localStorage.getItem('token');
  const r = await fetch(API + caminho, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error('Não foi possível abrir o ficheiro.');
  const url = URL.createObjectURL(await r.blob());
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export const baixarCurriculo = (candidaturaId) => abrirPrivado(`/candidaturas/${candidaturaId}/curriculo`);
