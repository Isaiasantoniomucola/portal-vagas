import './globals.css';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import { AuthProvider } from '@/components/Auth';
import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';

const titulos = Bricolage_Grotesque({ subsets: ['latin'], variable: '--fonte-titulo', display: 'swap' });
const corpo = Public_Sans({ subsets: ['latin'], variable: '--fonte-corpo', display: 'swap' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Vagas.ao — Vagas de emprego em Angola', template: '%s · Vagas.ao' },
  description: 'Encontre vagas de emprego em todas as províncias de Angola e candidate-se online.',
  applicationName: 'Vagas.ao',
  openGraph: { type: 'website', siteName: 'Vagas.ao', locale: 'pt_PT', title: 'Vagas.ao — Vagas de emprego em Angola',
    description: 'Encontre vagas de emprego em todas as províncias de Angola e candidate-se online.' },
  alternates: { canonical: '/' },
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b5c8f' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${titulos.variable} ${corpo.variable}`}>
        <a href="#conteudo" className="saltar">Saltar para o conteúdo</a>
        <AuthProvider>
          <Cabecalho />
          <main id="conteudo">{children}</main>
          <Rodape />
        </AuthProvider>
      </body>
    </html>
  );
}
