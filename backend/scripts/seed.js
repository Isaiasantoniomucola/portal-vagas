// Cria o administrador e dados de demonstração (executar uma vez: npm run seed)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/db');

(async () => {
  const PROD = process.env.NODE_ENV === 'production';
  if (PROD && (!process.env.ADMIN_SENHA || process.env.ADMIN_SENHA.length < 12 || process.env.ADMIN_SENHA === 'Admin@12345')) {
    console.error('Em produção, defina ADMIN_SENHA com pelo menos 12 caracteres (e diferente do exemplo).');
    process.exit(1);
  }
  const email = (process.env.ADMIN_EMAIL || 'admin@portalvagas.ao').toLowerCase();
  const [[a]] = await db.query('SELECT id FROM utilizadores WHERE email=?', [email]);
  if (!a) {
    await db.query("INSERT INTO utilizadores (nome,email,senha_hash,tipo) VALUES ('Administrador',?,?, 'admin')",
      [email, await bcrypt.hash(process.env.ADMIN_SENHA || 'Admin@12345', 10)]);
    console.log('Administrador criado:', email);
  }

  if (PROD) { console.log('Produção: dados de demonstração não foram criados.'); return process.exit(0); }
  const [[ja]] = await db.query("SELECT id FROM utilizadores WHERE email='empresa@exemplo.ao'");
  if (ja) { console.log('Dados de demonstração já existem.'); return process.exit(0); }

  const hash = await bcrypt.hash('Demo@12345', 10);
  const [e] = await db.query("INSERT INTO utilizadores (nome,email,telefone,senha_hash,tipo) VALUES ('Recursos Humanos','empresa@exemplo.ao','923000000',?, 'empresa')", [hash]);
  await db.query("INSERT INTO empresas (utilizador_id,nome_empresa,setor,tamanho,descricao) VALUES (?,?,?,?,?)",
    [e.insertId, 'Exemplo Angola, Lda.', 'Serviços', '51–200', 'Empresa fictícia usada para demonstração do portal.']);
  await db.query("INSERT INTO utilizadores (nome,email,telefone,senha_hash,tipo) VALUES ('Candidato Demo','candidato@exemplo.ao','922000000',?, 'candidato')", [hash]);

  const id = async (t, n) => (await db.query(`SELECT id FROM ${t} WHERE nome=?`, [n]))[0][0].id;
  const vagas = [
    ['Técnico de Suporte Informático', 'Luanda', 'Informática e tecnologia', 'tempo_inteiro', 'presencial', 'Sem experiência', '250.000 – 350.000 Kz/mês'],
    ['Programador Web Júnior', 'Luanda', 'Informática e tecnologia', 'tempo_inteiro', 'hibrido', '1–3 anos', '400.000 – 600.000 Kz/mês'],
    ['Assistente Administrativo', 'Benguela', 'Administração e gestão', 'tempo_inteiro', 'presencial', '1–3 anos', '180.000 Kz/mês'],
    ['Operador de Logística', 'Huambo', 'Logística e transportes', 'contrato', 'presencial', 'Sem experiência', 'A combinar'],
    ['Enfermeiro(a) Geral', 'Huíla', 'Saúde', 'tempo_inteiro', 'presencial', '1–3 anos', '300.000 Kz/mês'],
    ['Gestor de Redes Sociais', 'Luanda', 'Marketing e publicidade', 'part_time', 'remoto', '1–3 anos', '150.000 Kz/mês'],
    ['Estagiário de Contabilidade', 'Cabinda', 'Serviços financeiros', 'estagio', 'presencial', 'Sem experiência', '80.000 Kz/mês'],
    ['Engenheiro Civil', 'Cuanza Sul', 'Construção civil', 'contrato', 'presencial', '3–6 anos', '700.000 Kz/mês'],
  ];
  for (const [t, prov, cat, tipo, reg, exp, sal] of vagas) {
    await db.query(
      `INSERT INTO vagas (empresa_id,titulo,provincia_id,categoria_id,tipo_contrato,regime,experiencia,salario,prazo,descricao,responsabilidades,requisitos,beneficios,estado)
       VALUES (?,?,?,?,?,?,?,?,DATE_ADD(CURDATE(), INTERVAL 45 DAY),?,?,?,?, 'aprovada')`,
      [e.insertId, t, await id('provincias', prov), await id('categorias', cat), tipo, reg, exp, sal,
       `Procuramos um(a) profissional para a posição de ${t}. Vaga de demonstração.`,
       'Executar as tarefas da função com qualidade;\nTrabalhar em equipa;\nReportar à chefia direta.',
       'Formação adequada à função;\nBoa comunicação;\nDisponibilidade imediata.',
       'Subsídio de transporte;\nSubsídio de alimentação;\nFormação contínua.']);
  }
  console.log('Dados de demonstração criados (empresa@exemplo.ao / candidato@exemplo.ao — senha Demo@12345).');
  process.exit(0);
})().catch((err) => { console.error(err); process.exit(1); });
