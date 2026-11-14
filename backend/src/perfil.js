// Pontuação do perfil do candidato (0–100). Usada no painel e para validar candidaturas.
const MINIMO = Number(process.env.PERFIL_MINIMO || 50);

const ITENS = [
  { campo: 'foto', rotulo: 'Foto de perfil', peso: 15, ok: (u) => !!u.foto },
  { campo: 'curriculo', rotulo: 'Currículo', peso: 15, ok: (u) => !!u.curriculo },
  { campo: 'competencias', rotulo: 'Competências (pelo menos 2, separadas por vírgula)', peso: 15,
    ok: (u) => (u.competencias || '').split(',').filter((x) => x.trim().length >= 2).length >= 2 },
  { campo: 'titulo', rotulo: 'Profissão ou título', peso: 10, ok: (u) => (u.titulo || '').trim().length >= 3 },
  { campo: 'provincia_id', rotulo: 'Província', peso: 10, ok: (u) => !!u.provincia_id },
  { campo: 'telefone', rotulo: 'Telefone', peso: 10, ok: (u) => (u.telefone || '').trim().length >= 7 },
  { campo: 'escolaridade', rotulo: 'Nível de escolaridade', peso: 10, ok: (u) => !!u.escolaridade },
  { campo: 'bio', rotulo: 'Apresentação (mínimo 40 caracteres)', peso: 10, ok: (u) => (u.bio || '').trim().length >= 40 },
  { campo: 'experiencia', rotulo: 'Experiência profissional', peso: 5, ok: (u) => !!u.experiencia },
];

exports.MINIMO = MINIMO;
exports.calcular = (u) => {
  let percentagem = 0;
  const faltam = [];
  for (const i of ITENS) {
    if (i.ok(u)) percentagem += i.peso;
    else faltam.push({ campo: i.campo, rotulo: i.rotulo, peso: i.peso });
  }
  return { percentagem, faltam, minimo: MINIMO, pode_candidatar: percentagem >= MINIMO };
};
