/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // durante a migração, não deixar o ESLint travar o build
  eslint: { ignoreDuringBuilds: true },
  images: {
    // a maioria das imagens vem do Vercel Blob e da Minecraft Wiki
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'minecraft.wiki' },
      { protocol: 'https', hostname: 'br.minecraft.wiki' },
    ],
  },
  // SEO: o domínio oficial é corelakes.jonasagra.com.br. Redirecionar o
  // domínio *.vercel.app (301) evita que o Google indexe o site duplicado —
  // era por isso que os dois apareciam na busca.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'corelakes.vercel.app' }],
        destination: 'https://corelakes.jonasagra.com.br/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
