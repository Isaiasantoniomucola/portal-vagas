'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Avatar from './Avatar';
import Aviso from './Aviso';

// Recorta ao centro e reduz para 480×480 antes de enviar (ficheiros pequenos e rápidos)
async function prepararImagem(ficheiro) {
  const img = await createImageBitmap(ficheiro);
  const lado = Math.min(img.width, img.height);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 480;
  canvas.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 480, 480);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.88));
  return new File([blob], 'foto.jpg', { type: 'image/jpeg' });
}

export default function FotoUpload({ id, nome, foto, tipo = 'candidato', aoAlterar, rotulo = 'Foto de perfil', dica }) {
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  async function escolher(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setErro('');
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setErro('Escolha uma imagem JPG, PNG ou WEBP.');
    if (f.size > 10 * 1024 * 1024) return setErro('A imagem é demasiado grande (máximo 10 MB).');
    setAEnviar(true);
    try {
      const form = new FormData();
      form.append('foto', await prepararImagem(f));
      await api('/auth/foto', { metodo: 'PUT', form });
      await aoAlterar();
    } catch (err) { setErro(err.message || 'Não foi possível enviar a imagem.'); }
    setAEnviar(false);
  }

  async function remover() {
    setErro(''); setAEnviar(true);
    try { await api('/auth/foto', { metodo: 'DELETE' }); await aoAlterar(); } catch (err) { setErro(err.message); }
    setAEnviar(false);
  }

  return (
    <div className="foto-upload">
      <Avatar id={id} nome={nome} versao={foto} tipo={tipo} tamanho={96} />
      <div>
        <p className="rotulo-forte">{rotulo}</p>
        <div className="acoes">
          <label className="botao botao-claro botao-pequeno" style={{ margin: 0 }}>
            {aEnviar ? 'A enviar…' : foto ? 'Alterar' : 'Carregar'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={escolher} disabled={aEnviar} className="sr-only" />
          </label>
          {foto && <button type="button" className="botao-texto" onClick={remover} disabled={aEnviar}>Remover</button>}
        </div>
        <p className="dica">{dica || 'JPG, PNG ou WEBP. A imagem é recortada ao centro.'}</p>
        <Aviso>{erro}</Aviso>
      </div>
    </div>
  );
}
