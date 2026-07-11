import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareBar from '@/components/ShareBar';
import { AdminEditLink, TweetWidgetLoader } from './PostClientExtras';

const BASE = 'https://corelakes.jonasagra.com.br';

// Mesma ideia do layout.jsx: busca direto no banco, no servidor — assim
// o HTML que o Googlebot recebe já vem com o post inteiro dentro, sem
// precisar esperar JavaScript rodar no navegador.
async function getPost(slug) {
  if (!slug) return null;

  try {
    const { sql } = await import('../../../lib/db.js');
    const rows = await sql`
      SELECT p.*, c.name AS category_name, c.color AS category_color
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ${String(slug)} AND p.status = 'published'
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (error) {
    console.error('Erro ao carregar post:', error);
    return null;
  }
}

export default async function Post({ params }) {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug;
  const post = await getPost(slug);

  if (!post) notFound();

  const date = post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR') : '';

  return (
    <main className="relative z-[1] pb-16">
      <article>
        {/* header + corpo: faixa CINZA começando logo abaixo da navbar */}
        <div className="w-full bg-[#161617] mb-8 pt-[110px]">
          <div className="max-w-[800px] mx-auto px-6 py-8 sm:px-5 sm:py-6">
            <header className="mb-7">
              {post.image_url && (
                <div className="relative mb-8">
                  <img src={post.image_url} alt={post.title}
                    className="w-full max-h-[420px] object-cover" />
                  {post.category_name && (
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-[13px] px-3 py-[5px] font-mc-pixel text-[0.78rem] uppercase tracking-[1px] text-white border-2 border-black whitespace-nowrap"
                      style={{ background: post.category_color || '#3c8527' }}>
                      {post.category_name}
                    </span>
                  )}
                </div>
              )}
              {!post.image_url && post.category_name && (
                <span className="inline-block mb-3 px-2 py-[3px] font-mc-pixel text-[0.78rem] uppercase tracking-[1px] text-white border border-black"
                  style={{ background: post.category_color || '#3c8527' }}>
                  {post.category_name}
                </span>
              )}
              <h1 className="font-mc-ten uppercase text-[1.9rem] text-white mb-4 leading-[1.3] sm:text-[1.4rem]">
                {post.title}
              </h1>
              <div className="flex flex-wrap gap-5 font-mc-pixel text-white/55 text-[0.8rem] pb-5 border-b border-[#2a2a2b]">
                <span className="flex items-center gap-[6px]">
                  <img src="https://minecraft.wiki/images/archive/20181112133323%21Calendar_sheet.png?ec376&format=original" alt="" aria-hidden="true" className="oreUI-icon !w-4 !h-4" />
                  {date}
                </span>
                <span className="flex items-center gap-[6px]">
                  <img src="https://minecraft.wiki/images/Book_and_Quill_JE2_BE2.png?2128f&format=original" alt="" aria-hidden="true" className="oreUI-icon !w-4 !h-4" />
                  Corelakes
                </span>
                <AdminEditLink slug={post.slug} />
              </div>
            </header>

            {/* conteúdo já sanitizado no servidor ao salvar (lib/validate.js
                roda o sanitize-html antes de gravar) — não precisa sanitizar
                de novo aqui. */}
            <div className="post-body text-base"
              dangerouslySetInnerHTML={{ __html: post.content || '' }} />

            <ShareBar title={post.title} url={`${BASE}/post/${post.slug}`} />
          </div>
        </div>

        <nav className="max-w-[800px] mx-auto px-5">
          <Link href="/blog" className="mc-btn">← Voltar ao blog</Link>
        </nav>
      </article>

      <TweetWidgetLoader hasTweet={!!post.content?.includes('twitter-tweet')} />
    </main>
  );
}
