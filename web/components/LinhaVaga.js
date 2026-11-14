import Link from 'next/link';
import { TIPOS, REGIMES, diasRestantes } from '@/lib/format';
import Logo from './Logo';

export default function LinhaVaga({ v }) {
  const prazo = diasRestantes(v.prazo);
  return (
    <li className="vaga-linha">
      <Logo id={v.empresa_id} versao={v.logo} nome={v.nome_empresa} />
      <div className="vaga-corpo">
        <h3><Link href={`/vagas/${v.id}`}>{v.titulo}</Link></h3>
        <p className="vaga-empresa">{v.nome_empresa} · {v.provincia}</p>
        <p className="vaga-meta">
          <span>{TIPOS[v.tipo_contrato]}</span>
          <span>{REGIMES[v.regime]}</span>
          <span>{v.categoria}</span>
        </p>
      </div>
      <div className="vaga-lado">
        <strong>{v.salario || 'Salário a combinar'}</strong>
        {prazo && <span className="suave">{prazo}</span>}
      </div>
    </li>
  );
}
