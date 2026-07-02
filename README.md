# Corelakes — Next.js 15 (App Router) + Tailwind CSS

Portfolio pessoal e blog de Jonas Agra (Corelakes).

## Tech stack
| Camada | Ferramenta |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 18 |
| CSS | Tailwind CSS 3 + tema Minecraft customizado |
| Backend / Auth | API Routes (`/api`) + Neon (Postgres) + sessão JWT em cookie httpOnly |
| Rich-text editor | Quill via react-quill |
| Image pipeline | Upload para Vercel Blob |
| Deploy | Vercel |

## Getting started

```bash
npm install        # instalar dependências
npm run dev        # iniciar servidor de dev → http://localhost:3000
npm run build      # build de produção → .next/
npm run start      # servir build de produção localmente
```

## Project structure

```
app/
├── layout.jsx              # Root layout (metadata, fonts, JSON-LD, RootShell)
├── page.jsx                # Página inicial (Home)
├── not-found.jsx           # Página 404
├── robots.js · sitemap.js  # SEO (robots.txt e sitemap.xml gerados)
├── api/                    # Route Handlers (TODO o back-end mora aqui)
│   ├── posts/route.js      # CRUD de posts
│   ├── login/ · logout/ · me/ · 2fa/
│   ├── upload/route.js     # Upload de imagens (FormData → WEBP → Vercel Blob)
│   ├── og/ · og-image/     # Previews de compartilhamento (Open Graph)
│   └── news-sitemap/       # Sitemap Google News (via rewrite /news-sitemap.xml)
├── blog/
│   ├── layout.jsx          # Metadata do /blog (canonical próprio)
│   └── page.jsx            # Listagem de posts
├── post/
│   └── [slug]/
│       ├── layout.jsx      # Metadata dinâmica + JSON-LD do post
│       └── page.jsx        # Post individual (dinâmico)
└── admin/
    ├── layout.jsx          # noindex (painel não aparece no Google)
    ├── page.jsx            # Dashboard admin (login + editor)
    └── components/         # Componentes privados do admin
        ├── AdminControls.jsx
        ├── CreatePostTab.jsx
        ├── InfoPostsTab.jsx
        ├── SecurityTab.jsx
        └── quillImage.js

src/
├── index.css               # Tailwind imports, @font-face, estilos globais
├── components/
│   ├── RootShell.jsx       # Shell: Navbar + Particles + Toast + ConfirmModal + Footer
│   ├── Navbar.jsx          # Nav fixa – desktop horizontal / mobile slide
│   ├── Footer.jsx          # Rodapé com redes sociais e links
│   ├── Particles.jsx       # Partículas animadas verdes
│   ├── Toast.jsx           # Sistema de toast global
│   └── ConfirmModal.jsx    # Modal de confirmação global
├── hooks/
│   ├── useAuth.js          # Sessão validada pelo servidor (/api/me, /api/login)
│   └── usePosts.js         # CRUD via /api/posts
├── utils/
│   ├── api.js              # Cliente fetch + gerador de slug
│   └── imageProcessor.js   # Prepara imagem (HEIC→JPEG) e envia p/ /api/upload
└── data/
    └── socials.js          # Lista de redes sociais

lib/                        # Lógica de servidor compartilhada
├── db.js                   # Conexão Neon (Postgres)
├── auth.js                 # Sessão JWT, senha scrypt, anti-CSRF
├── validate.js             # Sanitização de posts
├── totp.js · ratelimit.js  # 2FA e limite de tentativas
├── routeAdapter.js         # Converte Request → (req, res) p/ os handlers
└── handlers/               # Handlers usados pelas rotas em app/api/*

db/schema.sql               # Tabelas posts + users
scripts/create-admin.mjs    # Cria/redefine o admin
```

## Configuração e deploy

Variáveis de ambiente necessárias (veja `.env.example`): `DATABASE_URL`, `AUTH_SECRET`,
`BLOB_READ_WRITE_TOKEN`.

Passos: rode `db/schema.sql` no Neon, crie o admin com `npm run create-admin` e configure
as variáveis na Vercel.

## Minecraft theme tokens (Tailwind)

| Token | Hex |
|---|---|
| `mc-dark` | `#1e1e1f` |
| `mc-bg` | `#48494a` |
| `mc-bg-dark` | `#313233` |
| `mc-bg-light` | `#5a5b5c` |
| `mc-green` | `#3c8527` |
| `mc-green-light` | `#4ca632` |
| `mc-green-dark` | `#2d6a1e` |
| `mc-green-bright` | `#6cc349` |
| `mc-green-link` | `#a0e081` |
| `mc-red` | `#8b2020` |
| `mc-nav` | `#111112` |
| `mc-black` | `#0b0b0c` |
| `mc-panel` | `#1b1b1c` |
| `mc-gold` | `#ffb12b` |