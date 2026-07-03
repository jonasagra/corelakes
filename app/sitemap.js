const BASE = 'https://corelakes.jonasagra.com.br';

export default async function sitemap() {
  const routes = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const { sql } = await import('../lib/db.js');
    const posts = await sql`SELECT slug, created_at, updated_at FROM posts WHERE status = 'published' ORDER BY created_at DESC`;

    const postRoutes = posts.map((post) => ({
      url: `${BASE}/post/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    return [...routes, ...postRoutes];
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    return routes;
  }
}
