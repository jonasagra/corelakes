// Metadata própria do /blog. IMPORTANTE: sem isto, a página herdaria o
// canonical '/' do layout raiz e diria ao Google que ela é uma cópia da home
// (o que a tirava dos resultados de busca).
export const metadata = {
  title: 'Blog',
  description:
    'Todos os posts do Corelakes: notícias de Minecraft, guias e conteúdo da comunidade brasileira do jogo.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog — Corelakes',
    description:
      'Todos os posts do Corelakes: notícias de Minecraft, guias e conteúdo da comunidade brasileira do jogo.',
    url: '/blog',
  },
};

export default function BlogLayout({ children }) {
  return children;
}
