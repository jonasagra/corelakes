const BASE = 'https://corelakes.jonasagra.com.br';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
