const router = require('express').Router();
const db = require('../db');
const { autenticar, exigir } = require('../auth');
const path = require('path');
const upload = require('../upload');
const { definirCurriculo, removerCurriculo } = require('../ficheiros');
const { rota } = require('../util');

router.use(autenticar, exigir('candidato'));

router.get('/candidaturas', rota(async (req, res) => {
  const [l] = await db.query(
    `SELECT c.id, c.vaga_id, v.titulo, e.nome_empresa, p.nome AS provincia, c.estado, c.criado_em
       FROM candidaturas c JOIN vagas v ON v.id=c.vaga_id
       JOIN empresas e ON e.utilizador_id=v.empresa_id JOIN provincias p ON p.id=v.provincia_id
      WHERE c.candidato_id=? ORDER BY c.criado_em DESC`, [req.utilizador.id]);
  res.json(l);
}));

router.post('/candidaturas/:id/retirar', rota(async (req, res) => {
  const [r] = await db.query(
    "UPDATE candidaturas SET estado='retirada' WHERE id=? AND candidato_id=? AND estado IN ('pendente','em_analise')",
    [Number(req.params.id), req.utilizador.id]);
  if (!r.affectedRows) return res.status(400).json({ erro: 'Não é possível retirar esta candidatura.' });
  res.json({ ok: true });
}));

router.get('/guardadas', rota(async (req, res) => {
  const [l] = await db.query(
    `SELECT v.id, v.titulo, v.salario, v.prazo, v.tipo_contrato, v.regime, v.estado, e.nome_empresa, p.nome AS provincia
       FROM vagas_guardadas g JOIN vagas v ON v.id=g.vaga_id
       JOIN empresas e ON e.utilizador_id=v.empresa_id JOIN provincias p ON p.id=v.provincia_id
      WHERE g.candidato_id=? ORDER BY g.criado_em DESC`, [req.utilizador.id]);
  res.json(l);
}));

router.post('/guardadas/:vaga', rota(async (req, res) => {
  await db.query('INSERT IGNORE INTO vagas_guardadas (candidato_id, vaga_id) VALUES (?,?)', [req.utilizador.id, Number(req.params.vaga)]);
  res.status(201).json({ ok: true });
}));

router.delete('/guardadas/:vaga', rota(async (req, res) => {
  await db.query('DELETE FROM vagas_guardadas WHERE candidato_id=? AND vaga_id=?', [req.utilizador.id, Number(req.params.vaga)]);
  res.json({ ok: true });
}));

// Currículo guardado no perfil (usado por defeito nas candidaturas)
router.get('/curriculo', rota(async (req, res) => {
  const [[u]] = await db.query('SELECT curriculo, curriculo_nome FROM utilizadores WHERE id=?', [req.utilizador.id]);
  if (!u || !u.curriculo) return res.status(404).json({ erro: 'Ainda não adicionou um currículo.' });
  res.download(path.join(upload.DIR, path.basename(u.curriculo)), u.curriculo_nome || u.curriculo);
}));

router.post('/curriculo', upload.curriculo, upload.validarCurriculo, rota(async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Escolha um ficheiro PDF, DOC ou DOCX.' });
  await definirCurriculo(req.utilizador.id, req.file.filename, upload.nomeOriginal(req.file));
  res.status(201).json({ ok: true });
}));

router.delete('/curriculo', rota(async (req, res) => {
  await removerCurriculo(req.utilizador.id);
  res.json({ ok: true });
}));

module.exports = router;
