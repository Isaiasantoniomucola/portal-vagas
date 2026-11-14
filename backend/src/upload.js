const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');

const BASE = path.join(__dirname, '..', 'uploads');
const DIR = path.join(BASE, 'curriculos');
const DIR_FOTOS = path.join(BASE, 'fotos');

const gerarNome = (file) =>
  `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`;

function criar(destino, extensoes, limite, mensagem, campo) {
  return multer({
    storage: multer.diskStorage({ destination: destino, filename: (_r, f, cb) => cb(null, gerarNome(f)) }),
    limits: { fileSize: limite },
    fileFilter: (_r, f, cb) =>
      extensoes.includes(path.extname(f.originalname).toLowerCase()) ? cb(null, true) : cb(new Error(mensagem)),
  }).single(campo);
}

// Devolve erros em JSON (e não uma página de erro)
const executar = (mw) => (req, res, next) =>
  mw(req, res, (e) => {
    if (!e) return next();
    res.status(400).json({ erro: e.code === 'LIMIT_FILE_SIZE' ? 'O ficheiro é demasiado grande.' : e.message });
  });

const lerInicio = (ficheiro, n) => {
  const fd = fs.openSync(ficheiro, 'r');
  const b = Buffer.alloc(n);
  fs.readSync(fd, b, 0, n, 0);
  fs.closeSync(fd);
  return b;
};

// Confirma o tipo REAL do ficheiro pela assinatura e apaga o que for falso
const validador = (testes, mensagem) => (req, res, next) => {
  if (!req.file) return next();
  const b = lerInicio(req.file.path, 12);
  if (testes.some((t) => t(b))) return next();
  fs.unlink(req.file.path, () => {});
  res.status(400).json({ erro: mensagem });
};
const inicia = (...bytes) => (b) => bytes.every((x, i) => b[i] === x);

module.exports = {
  DIR,
  DIR_FOTOS,
  curriculo: executar(criar(DIR, ['.pdf', '.doc', '.docx'], 5 * 1024 * 1024, 'O currículo deve ser PDF, DOC ou DOCX.', 'curriculo')),
  foto: executar(criar(DIR_FOTOS, ['.jpg', '.jpeg', '.png', '.webp'], 2 * 1024 * 1024, 'A foto deve ser JPG, PNG ou WEBP.', 'foto')),
  validarCurriculo: validador(
    [inicia(0x25, 0x50, 0x44, 0x46), inicia(0xd0, 0xcf, 0x11, 0xe0), inicia(0x50, 0x4b, 0x03, 0x04)],
    'O ficheiro enviado não é um PDF, DOC ou DOCX válido.'),
  validarFoto: validador(
    [inicia(0xff, 0xd8, 0xff), inicia(0x89, 0x50, 0x4e, 0x47), (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP'],
    'O ficheiro enviado não é uma imagem JPG, PNG ou WEBP válida.'),
  // multer lê o nome em latin1; converte para UTF-8 e limpa
  nomeOriginal: (file) =>
    Buffer.from(file.originalname, 'latin1').toString('utf8').replace(/[\\/\u0000-\u001f]/g, '').slice(0, 200),
};
