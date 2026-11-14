import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiServidor } from '@/lib/api';
import { TIPOS, REGIMES, data, diasRestantes, linhas } from '@/lib/format';
import AcoesVaga from '@/components/AcoesVaga';
import Logo from '@/components/Logo';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const EMPREGO = { tempo_inteiro: 'FULL_TIME', part_time: 'PART_TIME', temporario: 'TEMPORARY', estagio: 'INTERN', contrato: 'CONTRACTOR' };

export async function generateMetadata({ params }) {
  const v = await apiServidor(`/vagas/${params.id}`);
  if (!v) return { title: 'Vaga não encontrada', robots: { index: false } };
  const descricao = `${v.nome_empresa} procura ${v.titulo} em ${v.provincia}. ${v.descricao}`.replace(/\s+/g, ' ').slice(0, 155);
  return {
    title: `${v.titulo} — ${v.nome_empresa}`,
    description: descricao,
    alternates: { canonical: `/vagas/${v.id}` },
    openGraph: { title: `${v.titulo} — ${v.nome_empresa}`, description: descricao, type: 'article' },
  };
}

function Lista({ titulo, texto }) {
  const itens = linhas(texto);
  if (!itens.length) return null;
  return (<><h2>{titulo}</h2><ul>{itens.map((i, n) => <li key={n}>{i}</li>)}</ul></>);
}

export default async function Vaga({ params }) {
  const v = await apiServidor(`/vagas/${params.id}`);
  if (!v) notFound();
  const encerrada = v.estado !== 'aprovada' || (v.prazo && new Date(v.prazo + 'T23:59:59') < new Date());

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: v.titulo,
    description: v.descricao.split('\n').filter(Boolean).map((p) => `<p>${p.replace(/</g, '&lt;')}</p>`).join(''),
    datePosted: String(v.criado_em).slice(0, 10),
    ...(v.prazo ? { validThrough: `${v.prazo}T23:59:59` } : {}),
    employmentType: EMPREGO[v.tipo_contrato],
    hiringOrganization: { '@type': 'Organization', name: v.nome_empresa, ...(v.website ? { sameAs: v.website } : {}) },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressRegion: v.provincia, addressCountry: 'AO' } },
    ...(v.regime === 'remoto' ? { jobLocationType: 'TELECOMMUTE', applicantLocationRequirements: { '@type': 'Country', name: 'AO' } } : {}),
    directApply: true,
    url: `${SITE}/vagas/${v.id}`,
  };

  return (
    <div className="contentor pagina">
      {!encerrada && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      )}
      <p className="migalhas"><Link href="/vagas">← Todas as vagas</Link></p>
      <div className="detalhe">
        <article className="texto-vaga">
          <div className="cabeca-vaga">
            <Logo id={v.empresa_id} versao={v.logo} nome={v.nome_empresa} tamanho={64} />
            <div>
              <h1>{v.titulo}</h1>
              <p className="suave">{v.nome_empresa} · {v.provincia}</p>
            </div>
          </div>
          <h2>Sobre a vaga</h2>
          {v.descricao.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          <Lista titulo="Responsabilidades" texto={v.responsabilidades} />
          <Lista titulo="Requisitos" texto={v.requisitos} />
          <Lista titulo="Benefícios" texto={v.beneficios} />
          {v.sobre_empresa && (<><h2>Sobre a empresa</h2><p>{v.sobre_empresa}</p></>)}
        </article>
        <aside className="detalhe-lado" aria-label="Resumo e candidatura">
          <dl className="ficha">
            <div><dt>Salário</dt><dd>{v.salario || 'A combinar'}</dd></div>
            <div><dt>Contrato</dt><dd>{TIPOS[v.tipo_contrato]}</dd></div>
            <div><dt>Regime</dt><dd>{REGIMES[v.regime]}</dd></div>
            <div><dt>Experiência</dt><dd>{v.experiencia}</dd></div>
            <div><dt>Área</dt><dd>{v.categoria}</dd></div>
            <div><dt>Vagas</dt><dd>{v.numero_vagas}</dd></div>
            <div><dt>Publicada</dt><dd>{data(v.criado_em)}</dd></div>
            <div><dt>Prazo</dt><dd>{v.prazo ? `${data(v.prazo)} (${diasRestantes(v.prazo)})` : 'Sem prazo'}</dd></div>
          </dl>
          <AcoesVaga vagaId={v.id} encerrada={encerrada} />
        </aside>
      </div>
    </div>
  );
}
