'use client';
import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { corDe } from '@/lib/format';

// Foto de perfil. As fotos de candidatos são privadas: pedidas com a sessão e mostradas como blob.
export default function Avatar({ id, nome = '', versao, tipo = 'candidato', tamanho = 48 }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let vivo = true;
    let url = null;
    setSrc(null);
    if (versao && id) {
      if (tipo === 'empresa') setSrc(`${API}/utilizadores/${id}/foto?v=${encodeURIComponent(versao)}`);
      else {
        fetch(`${API}/utilizadores/${id}/foto`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then((r) => (r.ok ? r.blob() : null))
          .then((b) => { if (b && vivo) { url = URL.createObjectURL(b); setSrc(url); } })
          .catch(() => {});
      }
    }
    return () => { vivo = false; if (url) URL.revokeObjectURL(url); };
  }, [id, versao, tipo]);

  const estilo = { width: tamanho, height: tamanho, fontSize: tamanho * 0.38 };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="avatar" style={estilo} src={src} alt={`Foto de ${nome}`} />;
  }
  const iniciais = nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  return <span className="avatar" style={{ ...estilo, background: corDe(nome) }} aria-hidden="true">{iniciais}</span>;
}
