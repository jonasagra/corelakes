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
};

export default nextConfig;
