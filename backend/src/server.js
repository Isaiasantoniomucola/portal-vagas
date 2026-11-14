require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const upload = require('./upload');
const { autenticar, opcional } = require('./auth');
const { rota, texto, emailValido } = require('./util');

const PROD = process.env.NODE_ENV === 'production';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Defina JWT_SECRET com pelo menos 32 caracteres no ficheiro .env');
  process.exit(1);
}
fs.mkdirSync(upload.DIR, { recursive: true });
fs.mkdirSync(upload.DIR_FOTOS, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // atrás do nginx
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // permite <img> da API noutro domínio/porta
app.use(compression());
app.use(cors({ origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '200kb' }));

// Registo simples de pedidos (visível com `docker compose logs api`)
app.use((req, res, next) => {
  const t = Date.now();
  res.on('finish', () => {
    if (req.path !== '/api/saude') console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl.split('?')[0]} ${res.statusCode} ${Date.now() - t}ms`);
  });
  next();
});

app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 240, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false,
  message: { erro: 'Demasiadas tentativas. Aguarde alguns minutos e tente novamente.' } }));

app.get('/api/saude', rota(async (_req, res) => {
  await db.query('SELECT 1');
  res.json({ ok: true });
}));

app.get('/api/meta', rota(async (_req, res) => {
  const [categorias] = await db.query('SELECT id, nome FROM categorias ORDER BY nome');
  const [provincias] = await db.query('SELECT id, nome FROM provincias ORDER BY nome');
  const [[stats]] = await db.query(`SELECT
    (SELECT COUNT(*) FROM vagas WHERE estado='aprovada' AND (prazo IS NULL OR prazo >= CURDATE())) AS vagas,
    (SELECT COUNT(*) FROM utilizadores WHERE tipo='empresa') AS empresas,
    (SELECT COUNT(*) FROM utilizadores WHERE tipo='candidato') AS candidatos`);
  res.json({ categorias, provincias, stats });
}));

// Para o sitemap: vagas abertas
app.get('/api/sitemap', rota(async (_req, res) => {
  const [vagas] = await db.query(
    `SELECT id, atualizado_em FROM vagas WHERE estado='aprovada' AND (prazo IS NULL OR prazo >= CURDATE())
      ORDER BY criado_em DESC LIMIT 5000`);
  res.json(vagas);
}));

app.post('/api/contacto', rateLimit({ windowMs: 60 * 60 * 1000, limit: 10 }), rota(async (req, res) => {
  const b = req.body;
  if (!texto(b.nome) || !emailValido(b.email) || !texto(b.assunto) || texto(b.mensagem, 4000).length < 10) {
    return res.status(400).json({ erro: 'Preencha todos os campos (a mensagem deve ter pelo menos 10 caracteres).' });
  }
  await db.query('INSERT INTO mensagens_contacto (nome, email, assunto, mensagem) VALUES (?,?,?,?)',
    [texto(b.nome, 160), texto(b.email, 200), texto(b.assunto, 200), texto(b.mensagem, 4000)]);
  res.status(201).json({ ok: true });
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vagas', require('./routes/vagas'));
app.use('/api/empresa', require('./routes/empresa'));
app.use('/api/candidato', require('./routes/candidato'));
app.use('/api/admin', require('./routes/admin'));

// Download protegido do currículo (candidato, empresa dona da vaga ou admin)
app.get('/api/candidaturas/:id/curriculo', autenticar, rota(async (req, res) => {
  const [[c]] = await db.query(
    'SELECT c.curriculo, c.candidato_id, v.empresa_id FROM candidaturas c JOIN vagas v ON v.id=c.vaga_id WHERE c.id=?',
    [Number(req.params.id)]);
  const u = req.utilizador;
  if (!c || !(u.tipo === 'admin' || u.id === c.candidato_id || u.id === c.empresa_id)) {
    return res.status(404).json({ erro: 'Ficheiro não encontrado.' });
  }
  res.download(path.join(upload.DIR, path.basename(c.curriculo)));
}));

// Foto / logótipo: logótipos de empresas são públicos; fotos de candidatos só para o próprio,
// administradores e empresas que receberam uma candidatura dessa pessoa.
app.get('/api/utilizadores/:id/foto', opcional, rota(async (req, res) => {
  const [[u]] = await db.query('SELECT id, tipo, foto FROM utilizadores WHERE id=?', [Number(req.params.id)]);
  if (!u || !u.foto) return res.status(404).json({ erro: 'Sem foto.' });
  let permitido = u.tipo === 'empresa';
  const me = req.utilizador;
  if (!permitido && me) {
    permitido = me.id === u.id || me.tipo === 'admin';
    if (!permitido && me.tipo === 'empresa') {
      const [r] = await db.query(
        `SELECT 1 FROM candidaturas c JOIN vagas v ON v.id=c.vaga_id
          WHERE v.empresa_id=? AND c.candidato_id=? AND c.estado <> 'retirada' LIMIT 1`, [me.id, u.id]);
      permitido = r.length > 0;
    }
  }
  if (!permitido) return res.status(404).json({ erro: 'Sem foto.' });
  res.set('Cache-Control', u.tipo === 'empresa' ? 'public, max-age=86400' : 'private, max-age=300');
  res.sendFile(path.join(upload.DIR_FOTOS, path.basename(u.foto)));
}));

app.use('/api', (_req, res) => res.status(404).json({ erro: 'Recurso não encontrado.' }));
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Pedido inválido.' });
  console.error(err);
  res.status(500).json({ erro: 'Ocorreu um erro no servidor. Tente novamente.' });
});

const porta = Number(process.env.PORT || 4000);
const servidor = app.listen(porta, () => console.log(`API a correr na porta ${porta} (${PROD ? 'produção' : 'desenvolvimento'})`));

// Encerramento limpo (docker stop / pm2 restart)
for (const sinal of ['SIGTERM', 'SIGINT']) {
  process.on(sinal, () => servidor.close(async () => { await db.end().catch(() => {}); process.exit(0); }));
}
