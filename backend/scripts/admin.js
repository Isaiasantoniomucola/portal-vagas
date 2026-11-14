// Cria ou repõe o administrador com ADMIN_EMAIL / ADMIN_SENHA do .env
// Uso: npm run admin   (Docker: docker compose exec api npm run admin)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/db');

(async () => {
  const PROD = process.env.NODE_ENV === 'production';
  const email = (process.env.ADMIN_EMAIL || 'admin@portalvagas.ao').trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA || (PROD ? '' : 'Admin@12345');
  const minimo = PROD ? 12 : 8;
  if (senha.length < minimo || (PROD && senha === 'Admin@12345')) {
    console.error(`Defina ADMIN_SENHA com pelo menos ${minimo} caracteres${PROD ? ' (e diferente do exemplo)' : ''}.`);
    process.exit(1);
  }
  const hash = await bcrypt.hash(senha, 10);
  const [[a]] = await db.query('SELECT id FROM utilizadores WHERE email = ?', [email]);
  if (a) {
    await db.query("UPDATE utilizadores SET senha_hash = ?, tipo = 'admin', ativo = 1 WHERE id = ?", [hash, a.id]);
    console.log('Administrador atualizado (senha reposta):', email);
  } else {
    await db.query("INSERT INTO utilizadores (nome, email, senha_hash, tipo) VALUES ('Administrador', ?, ?, 'admin')", [email, hash]);
    console.log('Administrador criado:', email);
  }
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
