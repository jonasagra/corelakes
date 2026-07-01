const BASE = 'https://corelakes.jonasagra.com.br';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
