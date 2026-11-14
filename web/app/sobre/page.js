import Link from 'next/link';
export const metadata = { title: 'Sobre nós' };

export default function Sobre() {
  return (
    <div className="contentor pagina media texto-vaga">
      <h1>Sobre o Vagas.ao</h1>
      <p>O Vagas.ao liga quem procura trabalho a empresas que estão a contratar em todas as províncias de Angola.</p>
      <h2>Como funciona</h2>
      <p>Os candidatos criam uma conta gratuita, procuram vagas por área, província e tipo de contrato, guardam as que lhes interessam e candidatam-se anexando o currículo. As empresas publicam vagas e gerem as candidaturas num único painel.</p>
      <h2>Vagas revistas</h2>
      <p>Todas as vagas são revistas pela nossa equipa antes de serem publicadas. Se encontrar uma vaga suspeita, <Link href="/contacto">avise-nos</Link>.</p>
      <p>Nunca pague para se candidatar a uma vaga. Nenhuma empresa legítima o pede.</p>
    </div>
  );
}
