const router = require('express').Router();
const db = require('../db');
const { opcional, autenticar, exigir } = require('../auth');
const upload = require('../upload');
const { definirCurriculo } = require('../ficheiros');
const { calcular } = require('../perfil');
const { rota, texto, likeSeguro } = require('../util');

const CAMPOS = `v.id, v.titulo, v.tipo_contrato, v.regime, v.salario, v.prazo, v.criado_em, v.experiencia, v.empresa_id,
  p.nome AS provincia, c.nome AS categoria, e.nome_empresa, u.foto AS logo`;
const JUNCOES = `FROM vagas v
  JOIN provincias p ON p.id = v.provincia_id
  JOIN categorias c ON c.id = v.categoria_id
  JOIN empresas e ON e.utilizador_id = v.empresa_id
  JOIN utilizadores u ON u.id = v.empresa_id`;

router.get('/', rota(async (req, res) => {
  const { q, categoria, provincia, tipo, regime } = req.query;
  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 10));
  const onde = ["v.estado = 'aprovada'", '(v.prazo IS NULL OR v.prazo >= CURDATE())'];
  const p = [];
  if (q) {
    const l = `%${likeSeguro(texto(String(q), 80))}%`;
    onde.push('(v.titulo LIKE ? OR e.nome_empresa LIKE ? OR v.descricao LIKE ?)');
    p.push(l, l, l);
  }
  if (Number(categoria)) { onde.push('v.categoria_id = ?'); p.push(Number(categoria)); }
  if (Number(provincia)) { onde.push('v.provincia_id = ?'); p.push(Number(provincia)); }
  if (tipo) { onde.push('v.tipo_contrato = ?'); p.push(String(tipo)); }
  if (regime) { onde.push('v.regime = ?'); p.push(String(regime)); }
  const filtro = onde.join(' AND ');

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total ${JUNCOES} WHERE ${filtro}`, p);
  const [vagas] = await db.query(
    `SELECT ${CAMPOS} ${JUNCOES} WHERE ${filtro} ORDER BY v.criado_em DESC LIMIT ? OFFSET ?`,
    [...p, limite, (pagina - 1) * limite]
  );
  res.json({ vagas, total, pagina, paginas: Math.max(1, Math.ceil(total / limite)) });
}));

router.get('/:id', opcional, rota(async (req, res) => {
  const [[v]] = await db.query(
    `SELECT v.*, p.nome AS provincia, c.nome AS categoria, e.nome_empresa, e.website, e.setor,
            e.descricao AS sobre_empresa, u.foto AS logo
       ${JUNCOES} WHERE v.id = ?`,
    [Number(req.params.id)]
  );
  if (!v) return res.status(404).json({ erro: 'Vaga não encontrada.' });
  const me = req.utilizador;
  const dono = me && (me.id === v.empresa_id || me.tipo === 'admin');
  if (v.estado !== 'aprovada' && !dono) return res.status(404).json({ erro: 'Vaga não encontrada.' });

  if (v.estado === 'aprovada' && !dono) await db.query('UPDATE vagas SET visualizacoes = visualizacoes + 1 WHERE id = ?', [v.id]);
  let guardada = false, candidatou = false;
  if (me && me.tipo === 'candidato') {
    const [g] = await db.query('SELECT 1 FROM vagas_guardadas WHERE candidato_id=? AND vaga_id=?', [me.id, v.id]);
    guardada = g.length > 0;
    const [c] = await db.query("SELECT 1 FROM candidaturas WHERE candidato_id=? AND vaga_id=? AND estado <> 'retirada'", [me.id, v.id]);
    candidatou = c.length > 0;
  }
  delete v.email_contacto;
  res.json({ ...v, guardada, candidatou });
}));

router.post('/:id/candidatar', autenticar, exigir('candidato'), upload.curriculo, upload.validarCurriculo,
  rota(async (req, res) => {
    const id = Number(req.params.id);
    const [[vaga]] = await db.query(
      "SELECT id FROM vagas WHERE id=? AND estado='aprovada' AND (prazo IS NULL OR prazo >= CURDATE())", [id]);
    if (!vaga) return res.status(404).json({ erro: 'Esta vaga já não aceita candidaturas.' });

    // Se enviou um ficheiro novo, passa a ser o currículo guardado no perfil
    if (req.file) await definirCurriculo(req.utilizador.id, req.file.filename, upload.nomeOriginal(req.file));

    const [[u]] = await db.query(
      `SELECT nome, email, telefone, provincia_id, titulo, escolaridade, experiencia, bio, competencias, foto, curriculo, curriculo_nome
         FROM utilizadores WHERE id=?`, [req.utilizador.id]);
    const telefone = texto(req.body.telefone, 30) || u.telefone;
    if (!u.curriculo) return res.status(400).json({ erro: 'Adicione o seu currículo (PDF, DOC ou DOCX) para se candidatar.' });
    if (!telefone) return res.status(400).json({ erro: 'Indique um número de telefone.' });
    if (telefone !== u.telefone) await db.query('UPDATE utilizadores SET telefone=? WHERE id=?', [telefone, req.utilizador.id]);
    u.telefone = telefone;

    const perfil = calcular(u);
    if (!perfil.pode_candidatar) {
      return res.status(422).json({
        erro: `O seu perfil está a ${perfil.percentagem}%. Precisa de pelo menos ${perfil.minimo}% para se candidatar.`,
        perfil,
      });
    }
    const mensagem = texto(req.body.mensagem, 1500) || null;

    const [[antiga]] = await db.query('SELECT id, estado FROM candidaturas WHERE vaga_id=? AND candidato_id=?', [id, req.utilizador.id]);
    if (antiga && antiga.estado !== 'retirada') return res.status(409).json({ erro: 'Já se candidatou a esta vaga.' });
    if (antiga) {
      await db.query(
        "UPDATE candidaturas SET estado='pendente', curriculo=?, curriculo_nome=?, telefone=?, mensagem=?, criado_em=NOW() WHERE id=?",
        [u.curriculo, u.curriculo_nome, telefone, mensagem, antiga.id]);
    } else {
      await db.query(
        'INSERT INTO candidaturas (vaga_id, candidato_id, nome, email, telefone, curriculo, curriculo_nome, mensagem) VALUES (?,?,?,?,?,?,?,?)',
        [id, req.utilizador.id, u.nome, u.email, telefone, u.curriculo, u.curriculo_nome, mensagem]);
    }
    res.status(201).json({ ok: true });
  }));

module.exports = router;
