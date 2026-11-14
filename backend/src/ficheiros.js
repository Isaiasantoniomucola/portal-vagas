// Gestão do ciclo de vida dos ficheiros: nunca apagar um currículo que ainda é usado
// numa candidatura, e não deixar ficheiros órfãos.
const fs = require('fs');
const path = require('path');
const db = require('./db');
const { DIR, DIR_FOTOS } = require('./upload');

const apagar = (pasta, nome) => nome && fs.unlink(path.join(pasta, path.basename(nome)), () => {});

async function limparCurriculoSeLivre(nome) {
  if (!nome) return;
  const [[r]] = await db.query(
    'SELECT (SELECT COUNT(*) FROM utilizadores WHERE curriculo = ?) + (SELECT COUNT(*) FROM candidaturas WHERE curriculo = ?) AS n',
    [nome, nome]);
  if (!r.n) apagar(DIR, nome);
}

async function definirCurriculo(userId, nome, original) {
  const [[u]] = await db.query('SELECT curriculo FROM utilizadores WHERE id = ?', [userId]);
  await db.query('UPDATE utilizadores SET curriculo=?, curriculo_nome=?, curriculo_em=NOW() WHERE id=?', [nome, original, userId]);
  if (u && u.curriculo && u.curriculo !== nome) await limparCurriculoSeLivre(u.curriculo);
}

async function removerCurriculo(userId) {
  const [[u]] = await db.query('SELECT curriculo FROM utilizadores WHERE id = ?', [userId]);
  await db.query('UPDATE utilizadores SET curriculo=NULL, curriculo_nome=NULL, curriculo_em=NULL WHERE id=?', [userId]);
  if (u) await limparCurriculoSeLivre(u.curriculo);
}

async function definirFoto(userId, nome) {
  const [[u]] = await db.query('SELECT foto FROM utilizadores WHERE id = ?', [userId]);
  await db.query('UPDATE utilizadores SET foto=? WHERE id=?', [nome, userId]);
  if (u && u.foto) apagar(DIR_FOTOS, u.foto);
}

async function removerFoto(userId) {
  const [[u]] = await db.query('SELECT foto FROM utilizadores WHERE id = ?', [userId]);
  await db.query('UPDATE utilizadores SET foto=NULL WHERE id=?', [userId]);
  if (u && u.foto) apagar(DIR_FOTOS, u.foto);
}

module.exports = { limparCurriculoSeLivre, definirCurriculo, removerCurriculo, definirFoto, removerFoto };
