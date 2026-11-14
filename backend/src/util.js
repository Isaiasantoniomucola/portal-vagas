exports.rota = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.texto = (v, max = 255) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
exports.emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
exports.likeSeguro = (v) => String(v).replace(/[\\%_]/g, '\\$&');
