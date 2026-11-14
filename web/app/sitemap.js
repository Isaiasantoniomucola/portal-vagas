export const dynamic = 'force-dynamic';

import { apiServidor } from '@/lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap() {
  const vagas = (await apiServidor('/sitemap')) || [];
  return [
    { url: SITE, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/vagas`, changeFrequency: 'hourly', priority: 0.9 },
    ...['sobre', 'contacto', 'privacidade', 'termos'].map((p) => ({ url: `${SITE}/${p}`, changeFrequency: 'yearly', priority: 0.3 })),
    ...vagas.map((v) => ({
      url: `${SITE}/vagas/${v.id}`,
      lastModified: new Date(String(v.atualizado_em).replace(' ', 'T') + 'Z'),
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
