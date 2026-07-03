// Metadata própria do /blog. IMPORTANTE: sem isto, a página herdaria o
// canonical '/' do layout raiz e diria ao Google que ela é uma cópia da home
// (o que a tirava dos resultados de busca).
export const metadata = {
  title: 'Blog',
  description:
    'O blog do Corelakes, criador de conteúdo de Minecraft: notícias do jogo, guias e projetos da comunidade brasileira.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog — Corelakes',
    description:
      'O blog do Corelakes, criador de conteúdo de Minecraft: notícias do jogo, guias e projetos da comunidade brasileira.',
    url: '/blog',
  },
};

export default function BlogLayout({ children }) {
  return children;
}
