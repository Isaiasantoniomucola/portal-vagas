export const TIPOS = {
  tempo_inteiro: 'Tempo inteiro',
  part_time: 'Meio período',
  temporario: 'Temporário',
  estagio: 'Estágio',
  contrato: 'Contrato',
};
export const REGIMES = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' };
export const ESTADOS_VAGA = { pendente: 'Em revisão', aprovada: 'Publicada', rejeitada: 'Rejeitada', encerrada: 'Encerrada' };
export const ESTADOS_CAND = { pendente: 'Recebida', em_analise: 'Em análise', aceite: 'Aceite', rejeitada: 'Não selecionado', retirada: 'Retirada' };
export const EXPERIENCIAS = ['Sem experiência', 'Menos de 1 ano', '1–3 anos', '3–6 anos', 'Mais de 6 anos'];
export const ESCOLARIDADES = ['Ensino primário', 'Ensino secundário (I ciclo)', 'Ensino médio (II ciclo)', 'Curso técnico-profissional', 'Licenciatura', 'Mestrado', 'Doutoramento'];
export const TAMANHOS = ['1–10', '11–50', '51–200', '201–500', '501–1000', 'Mais de 1000'];

export function data(d) {
  if (!d) return '—';
  const x = new Date(String(d).replace(' ', 'T'));
  return isNaN(x) ? '—' : x.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function diasRestantes(prazo) {
  if (!prazo) return null;
  const dias = Math.ceil((new Date(prazo + 'T23:59:59') - new Date()) / 86400000);
  if (dias < 0) return 'Prazo terminado';
  if (dias === 0) return 'Termina hoje';
  if (dias === 1) return 'Termina amanhã';
  return `Termina em ${dias} dias`;
}

export const linhas = (t) => (t || '').split('\n').map((s) => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

export function corDe(nome = '') {
  const cores = ['#0B5C8F', '#8A4B08', '#1E6B52', '#6B3FA0', '#A3322B', '#2F4858'];
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) % 997;
  return cores[h % cores.length];
}
