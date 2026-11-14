const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const upload = require('../upload');
const { assinar, autenticar } = require('../auth');
const { definirFoto, removerFoto } = require('../ficheiros');
const { calcular } = require('../perfil');
const { ESCOLARIDADES, EXPERIENCIAS } = require('../constantes');
const { rota, texto, emailValido } = require('../util');

router.post('/registo', rota(async (req, res) => {
  const nome = texto(req.body.nome, 160);
  const email = texto(req.body.email, 200).toLowerCase();
  const senha = req.body.senha || '';
  const tipo = req.body.tipo === 'empresa' ? 'empresa' : 'candidato';
  const telefone = texto(req.body.telefone, 30);
  const nomeEmpresa = texto(req.body.nome_empresa, 200);

  if (nome.length < 2) return res.status(400).json({ erro: 'Indique o seu nome.' });
  if (!emailValido(email)) return res.status(400).json({ erro: 'Indique um e-mail válido.' });
  if (senha.length < 8) return res.status(400).json({ erro: 'A palavra-passe deve ter pelo menos 8 caracteres.' });
  if (tipo === 'empresa' && nomeEmpresa.length < 2) return res.status(400).json({ erro: 'Indique o nome da empresa.' });

  const [[existe]] = await db.query('SELECT id FROM utilizadores WHERE email = ?', [email]);
  if (existe) return res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });

  const hash = await bcrypt.hash(senha, 10);
  const [r] = await db.query(
    'INSERT INTO utilizadores (nome, email, telefone, senha_hash, tipo) VALUES (?,?,?,?,?)',
    [nome, email, telefone || null, hash, tipo]
  );
  if (tipo === 'empresa') {
    await db.query('INSERT INTO empresas (utilizador_id, nome_empresa, nif) VALUES (?,?,?)', [
      r.insertId, nomeEmpresa, texto(req.body.nif, 30) || null,
    ]);
  }
  const u = { id: r.insertId, tipo, nome };
  res.status(201).json({ token: assinar(u), utilizador: u });
}));

router.post('/entrar', rota(async (req, res) => {
  const email = texto(req.body.email, 200).toLowerCase();
  const [[u]] = await db.query('SELECT id, nome, tipo, senha_hash, ativo FROM utilizadores WHERE email = ?', [email]);
  const ok = u && (await bcrypt.compare(req.body.senha || '', u.senha_hash));
  if (!ok) return res.status(401).json({ erro: 'E-mail ou palavra-passe incorretos.' });
  if (!u.ativo) return res.status(403).json({ erro: 'Esta conta está desativada.' });
  res.json({ token: assinar(u), utilizador: { id: u.id, nome: u.nome, tipo: u.tipo } });
}));

router.get('/eu', autenticar, rota(async (req, res) => {
  const [[u]] = await db.query(
    `SELECT u.id, u.nome, u.email, u.telefone, u.tipo, u.provincia_id, p.nome AS provincia, u.titulo, u.escolaridade,
            u.experiencia, u.bio, u.competencias, u.foto, u.curriculo, u.curriculo_nome, u.curriculo_em,
            e.nome_empresa, e.nif, e.website, e.setor, e.endereco, e.tamanho, e.descricao
       FROM utilizadores u
       LEFT JOIN provincias p ON p.id = u.provincia_id
       LEFT JOIN empresas e ON e.utilizador_id = u.id
      WHERE u.id = ?`,
    [req.utilizador.id]
  );
  if (!u) return res.status(404).json({ erro: 'Conta não encontrada.' });
  if (u.tipo === 'candidato') u.perfil = calcular(u);
  res.json(u);
}));

router.put('/perfil', autenticar, rota(async (req, res) => {
  const b = req.body;
  const nome = texto(b.nome, 160);
  if (nome.length < 2) return res.status(400).json({ erro: 'Indique o seu nome.' });
  const escolaridade = ESCOLARIDADES.includes(b.escolaridade) ? b.escolaridade : null;
  const experiencia = EXPERIENCIAS.includes(b.experiencia) ? b.experiencia : null;
  const competencias = texto(b.competencias, 300).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 15).join(', ');

  await db.query(
    `UPDATE utilizadores SET nome=?, telefone=?, provincia_id=?, titulo=?, escolaridade=?, experiencia=?, bio=?, competencias=? WHERE id=?`,
    [nome, texto(b.telefone, 30) || null, Number(b.provincia_id) || null, texto(b.titulo, 160) || null,
     escolaridade, experiencia, texto(b.bio, 600) || null, competencias || null, req.utilizador.id]
  );
  if (req.utilizador.tipo === 'empresa') {
    await db.query(
      'UPDATE empresas SET nome_empresa=?, nif=?, website=?, setor=?, endereco=?, tamanho=?, descricao=? WHERE utilizador_id=?',
      [texto(b.nome_empresa, 200), texto(b.nif, 30) || null, texto(b.website, 255) || null, texto(b.setor, 150) || null,
       texto(b.endereco, 255) || null, texto(b.tamanho, 20) || null, texto(b.descricao, 800) || null, req.utilizador.id]
    );
  }
  res.json({ ok: true });
}));

// Foto do candidato ou logótipo da empresa
router.put('/foto', autenticar, upload.foto, upload.validarFoto, rota(async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Escolha uma imagem.' });
  await definirFoto(req.utilizador.id, req.file.filename);
  res.json({ foto: req.file.filename });
}));

router.delete('/foto', autenticar, rota(async (req, res) => {
  await removerFoto(req.utilizador.id);
  res.json({ ok: true });
}));

router.put('/senha', autenticar, rota(async (req, res) => {
  const { senha_atual, nova_senha } = req.body;
  if ((nova_senha || '').length < 8) return res.status(400).json({ erro: 'A nova palavra-passe deve ter pelo menos 8 caracteres.' });
  const [[u]] = await db.query('SELECT senha_hash FROM utilizadores WHERE id = ?', [req.utilizador.id]);
  if (!(await bcrypt.compare(senha_atual || '', u.senha_hash))) return res.status(400).json({ erro: 'A palavra-passe atual está incorreta.' });
  await db.query('UPDATE utilizadores SET senha_hash = ? WHERE id = ?', [await bcrypt.hash(nova_senha, 10), req.utilizador.id]);
  res.json({ ok: true });
}));

module.exports = router;
