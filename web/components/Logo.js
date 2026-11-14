import { API } from '@/lib/api';
import { corDe } from '@/lib/format';

// Logótipo público da empresa (ou inicial colorida quando não há imagem)
export default function Logo({ id, versao, nome = '', tamanho = 48 }) {
  const estilo = { width: tamanho, height: tamanho, fontSize: tamanho * 0.42 };
  if (versao && id) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="vaga-marca vaga-logo" style={estilo} alt="" src={`${API}/utilizadores/${id}/foto?v=${encodeURIComponent(versao)}`} />;
  }
  return <span className="vaga-marca" style={{ ...estilo, background: corDe(nome) }} aria-hidden="true">{nome[0]?.toUpperCase()}</span>;
}
