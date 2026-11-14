const test = require('node:test');
const assert = require('node:assert');
const { texto, emailValido, likeSeguro } = require('../src/util');

test('texto limita e remove espaços', () => {
  assert.strictEqual(texto('  olá  ', 10), 'olá');
  assert.strictEqual(texto('abcdef', 3), 'abc');
  assert.strictEqual(texto(123), '');
});
test('emailValido', () => {
  assert.ok(emailValido('a@b.co'));
  assert.ok(!emailValido('a@b'));
});
test('likeSeguro escapa curingas', () => {
  assert.strictEqual(likeSeguro('100%_ok'), '100\\%\\_ok');
});

const { calcular } = require('../src/perfil');
test('perfil: percentagem e mínimo', () => {
  const vazio = calcular({});
  assert.strictEqual(vazio.percentagem, 0);
  assert.ok(!vazio.pode_candidatar);
  const bom = calcular({ foto: 'f.jpg', curriculo: 'c.pdf', competencias: 'Excel, Inglês', titulo: 'Técnico', provincia_id: 1,
    telefone: '923000000', escolaridade: 'Licenciatura', bio: 'x'.repeat(40), experiencia: '1–3 anos' });
  assert.strictEqual(bom.percentagem, 100);
  assert.ok(bom.pode_candidatar);
  assert.strictEqual(calcular({ curriculo: 'c.pdf', titulo: 'Técnico', provincia_id: 1, telefone: '923000000', escolaridade: 'Licenciatura' }).percentagem, 55);
});
