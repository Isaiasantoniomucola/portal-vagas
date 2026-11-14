const router = require('express').Router();
const db = require('../db');
const { autenticar, exigir } = require('../auth');
const { rota, texto, emailValido } = require('../util');

const TIPOS = ['tempo_inteiro', 'part_time', 'temporario', 'estagio', 'contrato'];
const REGIMES = ['presencial', 'hibrido', 'remoto'];
router.use(autenticar, exigir('empresa'));

function lerVaga(b) {
  const d = {
    titulo: texto(b.titulo, 200),
    provincia_id: Number(b.provincia_id),
    categoria_id: Number(b.categoria_id),
    tipo_contrato: TIPOS.includes(b.tipo_contrato) ? b.tipo_contrato : 'tempo_inteiro',
    regime: REGIMES.includes(b.regime) ? b.regime : 'presencial',
    numero_vagas: Math.min(999, Math.max(1, Number(b.numero_vagas) || 1)),
    experiencia: texto(b.experiencia, 100) || 'Sem experiência',
    salario: texto(b.salario, 100) || null,
    prazo: /^\d{4}-\d{2}-\d{2}$/.test(b.prazo || '') ? b.prazo : null,
    descricao: texto(b.descricao, 8000),
    responsabilidades: texto(b.responsabilidades, 8000) || null,
    requisitos: texto(b.requisitos, 8000) || null,
    beneficios: texto(b.beneficios, 8000) || null,
    email_contacto: emailValido(b.email_contacto) ? texto(b.email_contacto, 200) : null,
  };
  if (d.titulo.length < 3) return { erro: 'Indique o título da vaga.' };
  if (!d.provincia_id || !d.categoria_id) return { erro: 'Escolha a província e a categoria.' };
  if (d.descricao.length < 20) return { erro: 'Descreva a vaga (mínimo de 20 caracteres).' };
  return { d };
}

router.get('/vagas', rota(async (req, res) => {
  const [vagas] = await db.query(
    `SELECT v.id, v.titulo, v.estado, v.prazo, v.visualizacoes, v.criado_em, p.nome AS provincia,
            (SELECT COUNT(*) FROM candidaturas c WHERE c.vaga_id = v.id AND c.estado <> 'retirada') AS candidaturas
       FROM vagas v JOIN provincias p ON p.id = v.provincia_id
      WHERE v.empresa_id = ? ORDER BY v.criado_em DESC`, [req.utilizador.id]);
  res.json(vagas);
}));

router.get('/vagas/:id', rota(async (req, res) => {
  const [[v]] = await db.query('SELECT * FROM vagas WHERE id=? AND empresa_id=?', [Number(req.params.id), req.utilizador.id]);
  if (!v) return res.status(404).json({ erro: 'Vaga não encontrada.' });
  res.json(v);
}));

router.post('/vagas', rota(async (req, res) => {
  const { d, erro } = lerVaga(req.body);
  if (erro) return res.status(400).json({ erro });
  const cols = Object.keys(d);
  const [r] = await db.query(
    `INSERT INTO vagas (empresa_id, ${cols.join(',')}) VALUES (?, ${cols.map(() => '?').join(',')})`,
    [req.utilizador.id, ...cols.map((c) => d[c])]);
  res.status(201).json({ id: r.insertId, estado: 'pendente' });
}));

router.put('/vagas/:id', rota(async (req, res) => {
  const { d, erro } = lerVaga(req.body);
  if (erro) return res.status(400).json({ erro });
  const cols = Object.keys(d);
  // Ao editar, a vaga volta a ser revista pelo administrador.
  const [r] = await db.query(
    `UPDATE vagas SET ${cols.map((c) => `${c}=?`).join(',')}, estado='pendente' WHERE id=? AND empresa_id=?`,
    [...cols.map((c) => d[c]), Number(req.params.id), req.utilizador.id]);
  if (!r.affectedRows) return res.status(404).json({ erro: 'Vaga não encontrada.' });
  res.json({ ok: true });
}));

router.patch('/vagas/:id/encerrar', rota(async (req, res) => {
  await db.query("UPDATE vagas SET estado='encerrada' WHERE id=? AND empresa_id=?", [Number(req.params.id), req.utilizador.id]);
  res.json({ ok: true });
}));

router.delete('/vagas/:id', rota(async (req, res) => {
  await db.query('DELETE FROM vagas WHERE id=? AND empresa_id=?', [Number(req.params.id), req.utilizador.id]);
  res.json({ ok: true });
}));

router.get('/candidaturas', rota(async (req, res) => {
  const vaga = Number(req.query.vaga) || null;
  const [lista] = await db.query(
    `SELECT c.id, c.vaga_id, v.titulo AS vaga, c.candidato_id, c.nome, c.email, c.telefone, c.mensagem, c.estado, c.criado_em,
            u.foto, u.titulo AS titulo_candidato, u.escolaridade, u.experiencia
       FROM candidaturas c JOIN vagas v ON v.id = c.vaga_id JOIN utilizadores u ON u.id = c.candidato_id
      WHERE v.empresa_id = ? AND c.estado <> 'retirada' ${vaga ? 'AND v.id = ?' : ''}
      ORDER BY c.criado_em DESC`, vaga ? [req.utilizador.id, vaga] : [req.utilizador.id]);
  res.json(lista);
}));

// Perfil completo do candidato (só para candidaturas às vagas desta empresa)
router.get('/candidaturas/:id', rota(async (req, res) => {
  const [[c]] = await db.query(
    `SELECT c.id, c.vaga_id, v.titulo AS vaga, c.candidato_id, c.nome, c.email, c.telefone, c.mensagem, c.estado, c.criado_em,
            c.curriculo_nome, u.foto, u.titulo AS titulo_candidato, u.bio, u.competencias, u.escolaridade, u.experiencia,
            p.nome AS provincia
       FROM candidaturas c JOIN vagas v ON v.id = c.vaga_id
       JOIN utilizadores u ON u.id = c.candidato_id LEFT JOIN provincias p ON p.id = u.provincia_id
      WHERE c.id = ? AND v.empresa_id = ? AND c.estado <> 'retirada'`,
    [Number(req.params.id), req.utilizador.id]);
  if (!c) return res.status(404).json({ erro: 'Candidatura não encontrada.' });
  // Ao abrir pela primeira vez, passa a "Em análise" (o candidato vê o progresso)
  if (c.estado === 'pendente') {
    await db.query("UPDATE candidaturas SET estado='em_analise' WHERE id=?", [c.id]);
    c.estado = 'em_analise';
  }
  res.json(c);
}));

router.patch('/candidaturas/:id', rota(async (req, res) => {
  const estado = ['pendente', 'em_analise', 'aceite', 'rejeitada'].includes(req.body.estado) ? req.body.estado : null;
  if (!estado) return res.status(400).json({ erro: 'Estado inválido.' });
  const [r] = await db.query(
    `UPDATE candidaturas c JOIN vagas v ON v.id = c.vaga_id SET c.estado=? WHERE c.id=? AND v.empresa_id=?`,
    [estado, Number(req.params.id), req.utilizador.id]);
  if (!r.affectedRows) return res.status(404).json({ erro: 'Candidatura não encontrada.' });
  res.json({ ok: true });
}));

module.exports = router;
