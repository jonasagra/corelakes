'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative z-[1] max-w-[800px] mx-auto px-5 pt-[120px] pb-16">
      <div className="text-center py-[60px]">
        <p className="font-mc-ten text-[4rem] text-mc-green-bright leading-none mb-2"
           style={{ textShadow: '3px 3px 0 #1d1d1d' }}>
          404
        </p>
        <h1 className="font-mc-five text-[1.8rem] text-white mb-4 sm:text-[1.4rem]"
            style={{ textShadow: '3px 3px 0 #3f3f3f' }}>
          Página não encontrada
        </h1>
        <p className="text-white/70 mb-7 max-w-[460px] mx-auto leading-relaxed">
          O endereço que você acessou não existe ou foi movido. Confira o link e tente de novo, ou volte para a página inicial.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="mc-btn">← Início</Link>
          <Link href="/blog" className="mc-btn">Ir para o blog</Link>
        </div>
      </div>
    </main>
  );
}
