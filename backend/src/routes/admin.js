const router = require('express').Router();
const db = require('../db');
const { autenticar, exigir } = require('../auth');
const { rota, texto } = require('../util');

router.use(autenticar, exigir('admin'));

router.get('/resumo', rota(async (_req, res) => {
  const [[r]] = await db.query(`SELECT
    (SELECT COUNT(*) FROM vagas WHERE estado='pendente') AS pendentes,
    (SELECT COUNT(*) FROM vagas WHERE estado='aprovada') AS aprovadas,
    (SELECT COUNT(*) FROM utilizadores WHERE tipo='empresa') AS empresas,
    (SELECT COUNT(*) FROM utilizadores WHERE tipo='candidato') AS candidatos,
    (SELECT COUNT(*) FROM candidaturas) AS candidaturas`);
  res.json(r);
}));

router.get('/vagas', rota(async (req, res) => {
  const estado = ['pendente', 'aprovada', 'rejeitada', 'encerrada'].includes(req.query.estado) ? req.query.estado : null;
  const [l] = await db.query(
    `SELECT v.id, v.titulo, v.estado, v.criado_em, e.nome_empresa, p.nome AS provincia, c.nome AS categoria
       FROM vagas v JOIN empresas e ON e.utilizador_id=v.empresa_id
       JOIN provincias p ON p.id=v.provincia_id JOIN categorias c ON c.id=v.categoria_id
      ${estado ? 'WHERE v.estado = ?' : ''} ORDER BY v.criado_em DESC LIMIT 200`, estado ? [estado] : []);
  res.json(l);
}));

router.patch('/vagas/:id', rota(async (req, res) => {
  if (!['aprovada', 'rejeitada', 'pendente', 'encerrada'].includes(req.body.estado)) return res.status(400).json({ erro: 'Estado inválido.' });
  await db.query('UPDATE vagas SET estado=? WHERE id=?', [req.body.estado, Number(req.params.id)]);
  res.json({ ok: true });
}));

router.delete('/vagas/:id', rota(async (req, res) => {
  await db.query('DELETE FROM vagas WHERE id=?', [Number(req.params.id)]);
  res.json({ ok: true });
}));

router.get('/utilizadores', rota(async (req, res) => {
  const tipo = req.query.tipo === 'empresa' ? 'empresa' : 'candidato';
  const [l] = await db.query(
    `SELECT u.id, u.nome, u.email, u.telefone, u.ativo, u.criado_em, e.nome_empresa
       FROM utilizadores u LEFT JOIN empresas e ON e.utilizador_id=u.id WHERE u.tipo=? ORDER BY u.criado_em DESC LIMIT 300`, [tipo]);
  res.json(l);
}));

router.patch('/utilizadores/:id', rota(async (req, res) => {
  await db.query("UPDATE utilizadores SET ativo=? WHERE id=? AND tipo <> 'admin'", [req.body.ativo ? 1 : 0, Number(req.params.id)]);
  res.json({ ok: true });
}));

// CRUD genérico para categorias e províncias
for (const [rotaNome, tabela, uso] of [['categorias', 'categorias', 'categoria_id'], ['provincias', 'provincias', 'provincia_id']]) {
  router.post(`/${rotaNome}`, rota(async (req, res) => {
    const nome = texto(req.body.nome, 150);
    if (!nome) return res.status(400).json({ erro: 'Indique o nome.' });
    try {
      const [r] = await db.query(`INSERT INTO ${tabela} (nome) VALUES (?)`, [nome]);
      res.status(201).json({ id: r.insertId, nome });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Já existe um registo com este nome.' });
      throw e;
    }
  }));
  router.put(`/${rotaNome}/:id`, rota(async (req, res) => {
    await db.query(`UPDATE ${tabela} SET nome=? WHERE id=?`, [texto(req.body.nome, 150), Number(req.params.id)]);
    res.json({ ok: true });
  }));
  router.delete(`/${rotaNome}/:id`, rota(async (req, res) => {
    const [[{ n }]] = await db.query(`SELECT COUNT(*) AS n FROM vagas WHERE ${uso}=?`, [Number(req.params.id)]);
    if (n) return res.status(409).json({ erro: `Existem ${n} vagas associadas. Altere-as antes de apagar.` });
    await db.query(`DELETE FROM ${tabela} WHERE id=?`, [Number(req.params.id)]);
    res.json({ ok: true });
  }));
}

router.get('/mensagens', rota(async (_req, res) => {
  const [l] = await db.query('SELECT * FROM mensagens_contacto ORDER BY criado_em DESC LIMIT 100');
  res.json(l);
}));

module.exports = router;
