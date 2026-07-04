'use client';

// Compartilhar o post: ícones dedicados de public/icons (share-*).
// X, Facebook e Reddit abrem o composer oficial da rede; o Discord não
// tem URL de share — o botão copia o link pronto pra colar no chat.
import { showToast } from '@/components/Toast';

const NETWORKS = [
  {
    name: 'X (Twitter)',
    icon: '/icons/share-x-icon.png',
    url: (u, t) => `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
  },
  {
    name: 'Facebook',
    icon: '/icons/share-facebook-icon.png',
    url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  },
  {
    name: 'Reddit',
    icon: '/icons/share-reddit-icon.png',
    url: (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
  },
];

export default function ShareBar({ title, url }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const copyForDiscord = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copiado! Cole no seu Discord.', 'success');
    } catch {
      showToast('Não foi possível copiar o link.', 'error');
    }
  };

  return (
    // mobile: label em cima, ícones embaixo; desktop: tudo numa linha
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 mt-10 pt-6 border-t border-[#2a2a2b]">
      <span className="text-[0.92rem] text-white/75">Compartilhe esta história</span>
      <div className="flex items-center gap-6">
        {NETWORKS.map(({ name, icon, url: build }) => (
          <a
            key={name}
            href={build(u, t)}
            target="_blank"
            rel="noopener noreferrer"
            title={`Compartilhar no ${name}`}
            aria-label={`Compartilhar no ${name}`}
            className="share-icon"
          >
            <img src={icon} alt="" aria-hidden="true" className="w-7 h-7 object-contain" />
          </a>
        ))}
        <button
          type="button"
          onClick={copyForDiscord}
          title="Copiar o link para colar no Discord"
          aria-label="Copiar o link para colar no Discord"
          className="share-icon bg-transparent border-none p-0 cursor-pointer"
        >
          <img src="/icons/share-discord-icon.png" alt="" aria-hidden="true" className="w-7 h-7 object-contain" />
        </button>
      </div>
    </div>
  );
}
