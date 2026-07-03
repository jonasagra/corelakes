import '@/index.css';
import RootShell from '@/components/RootShell';

const BASE = 'https://corelakes.jonasagra.com.br';
const DESC =
  'Corelakes é um criador de conteúdo de Minecraft e administrador da Minecraft Wiki em português. Notícias do jogo, guias e projetos da comunidade brasileira.';

export const metadata = {
  metadataBase: new URL(BASE),
  title: { default: 'Corelakes | Criador de Conteúdo de Minecraft', template: '%s — Corelakes' },
  description: DESC,
  alternates: { canonical: '/' },
  icons: { icon: '/icons/favicons/favicon.png', apple: '/icons/favicons/favicon.png' },
  verification: { google: 'f9duBKOPka4HMW2h5aeu0YAginVbWJQlQJx2ve3xXqQ' },
  openGraph: {
    type: 'website',
    siteName: 'Corelakes',
    title: 'Corelakes | Criador de Conteúdo de Minecraft',
    description: DESC,
    url: BASE,
    locale: 'pt_BR',
    images: ['/logo.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corelakes | Criador de Conteúdo de Minecraft',
    description: DESC,
    images: ['/logo.webp'],
    site: '@corelakes',
  },
};

export const viewport = { themeColor: '#0b0b0c' };

const personJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: 'Jonas Agra',
      alternateName: 'Corelakes',
      url: `${BASE}/`,
      image: `${BASE}/assets/personal.webp`,
      jobTitle: 'Estudante de Engenharia de Software, QA Tester e Criador de Conteúdo',
      description:
        'Jonas Agra, conhecido como Corelakes, é estudante de Engenharia de Software, testador, designer e criador de conteúdo. Paraibano, administra a Minecraft Wiki em português e é um dos maiores contribuidores da comunidade brasileira de Minecraft.',
      homeLocation: { '@type': 'Place', name: 'João Pessoa, Paraíba, Brasil' },
      sameAs: [
        'https://jonasagra.com.br',
        'https://x.com/corelakes',
        'https://youtube.com/@corelakes',
        'https://instagram.com/jnasagr',
        'https://github.com/jonasagra',
        'https://linkedin.com/in/jonasagra',
        'https://twitch.tv/corelakes',
        'https://bsky.app/profile/corelakes.bsky.social',
        'https://namemc.com/corelakes',
        'https://br.minecraft.wiki/Usuário:Corelakes',
      ],
    },
    {
      '@type': 'WebSite',
      name: 'Corelakes',
      url: `${BASE}/`,
      inLanguage: 'pt-BR',
      author: { '@type': 'Person', name: 'Jonas Agra' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preload" href="/fonts/San Francisco/SF-Pro-Text-Regular.otf" as="font" type="font/otf" crossOrigin="" />
        <link rel="preload" href="/fonts/San Francisco/SF-Pro-Display-Bold.otf" as="font" type="font/otf" crossOrigin="" />
        <link rel="preload" href="/fonts/MinecraftTen-VGORe.ttf" as="font" type="font/ttf" crossOrigin="" />
        <link rel="preload" href="/fonts/Minecraft-Fivev2.fecd15.ttf" as="font" type="font/ttf" crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
