export default function manifest() {
  return {
    name: 'Vagas.ao — Vagas de emprego em Angola',
    short_name: 'Vagas.ao',
    lang: 'pt',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f6f7',
    theme_color: '#0b5c8f',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
