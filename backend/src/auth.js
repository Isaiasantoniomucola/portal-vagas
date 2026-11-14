const jwt = require('jsonwebtoken');

function ler(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(h.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

exports.assinar = (u) =>
  jwt.sign({ id: u.id, tipo: u.tipo, nome: u.nome }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.opcional = (req, _res, next) => {
  req.utilizador = ler(req);
  next();
};

exports.autenticar = (req, res, next) => {
  const u = ler(req);
  if (!u) return res.status(401).json({ erro: 'Sessão inválida. Entre novamente.' });
  req.utilizador = u;
  next();
};

exports.exigir = (...tipos) => (req, res, next) => {
  if (!tipos.includes(req.utilizador.tipo)) {
    return res.status(403).json({ erro: 'Não tem permissão para esta ação.' });
  }
  next();
};
