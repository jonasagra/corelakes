const BASE = 'https://corelakes.jonasagra.com.br';

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getPostBySlug(slug) {
  if (!slug) return null;

  try {
    const { sql } = await import('../../../lib/db.js');
    const rows = await sql`
      SELECT title, slug, excerpt, content, image_url, created_at, updated_at
      FROM posts
      WHERE slug = ${String(slug)} AND status = 'published'
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (error) {
    console.error('Erro ao carregar post para metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post não encontrado — Corelakes',
      description: 'O post solicitado não foi encontrado.',
      alternates: { canonical: `${BASE}/post/${slug}` },
    };
  }

  const description = post.excerpt || stripHtml(post.content || '').slice(0, 160);
  const url = `${BASE}/post/${slug}`;
  const image = post.image_url || '/logo.webp';
  const publishedTime = post.created_at ? new Date(post.created_at).toISOString() : undefined;

  return {
    title: `${post.title} — Corelakes`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      images: [image],
      publishedTime,
      siteName: 'Corelakes',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [image],
    },
    other: {
      'article:published_time': publishedTime,
      'article:publisher': 'Corelakes',
    },
  };
}

export default async function PostLayout({ children, params }) {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug;
  const post = await getPostBySlug(slug);

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        description: post.excerpt || stripHtml(post.content || '').slice(0, 160),
        image: [post.image_url || `${BASE}/logo.webp`],
        datePublished: new Date(post.created_at).toISOString(),
        dateModified: new Date(post.updated_at || post.created_at).toISOString(),
        author: {
          '@type': 'Person',
          name: 'Jonas Agra',
          url: `${BASE}/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Corelakes',
          logo: {
            '@type': 'ImageObject',
            url: `${BASE}/logo.webp`,
          },
        },
        mainEntityOfPage: `${BASE}/post/${slug}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
