# Corelakes — React + Vite + Tailwind CSS

Personal portfolio & blog for Jonas Agra (Corelakes).

## Tech stack
| Layer | Tool |
|---|---|
| UI framework | React 18 |
| Bundler | Vite 5 |
| CSS | Tailwind CSS 3 + custom Minecraft theme |
| Routing | React Router v6 |
| Backend / Auth | Vercel Serverless Functions (`/api`) + Neon (Postgres) + sessão JWT em cookie httpOnly |
| Rich-text editor | Quill via react-quill |
| Image pipeline | Custom HEIC-safe processor + Vercel Blob |

## Getting started

```bash
npm install        # install deps
npm run dev        # start dev-server → http://localhost:5173
npm run build      # production bundle → dist/
npm run preview    # preview the production build locally
```

## Project structure

```
src/
├── main.jsx            # React root + BrowserRouter
├── App.jsx             # Layout shell: Navbar, Particles, Toast, Routes, Footer
├── index.css           # Tailwind imports, @font-face, Quill overrides, .post-body styles
│
├── components/
│   ├── Navbar.jsx      # Fixed nav – desktop horizontal / mobile slide panel
│   ├── Footer.jsx      # Glass-effect footer (full contacts on Home, minimal elsewhere)
│   ├── Particles.jsx   # 15 animated green particles
│   └── Toast.jsx       # Global toast bus (import { showToast } anywhere)
│
├── pages/
│   ├── Home.jsx        # Profile photos, logo, bio, social grid
│   ├── Blog.jsx        # Post cards grid with admin edit/delete
│   ├── Post.jsx        # Single post view with rich-text body
│   └── Admin.jsx       # Config → Login → Dashboard (editor + posts table)
│
├── hooks/
│   ├── useAuth.js      # Sessão validada pelo servidor (/api/me, /api/login)
│   └── usePosts.js     # CRUD via /api/posts
│
└── utils/
    ├── api.js          # Cliente fetch da API + slug (prévia)
    └── imageProcessor.js # ImageProcessor (HEIC / EXIF) + ApiUploader

api/                    # Funções serverless (back-end)
├── _lib/               # db (Neon), auth (sessão/senha), validate (sanitização)
├── login.js · logout.js · me.js
├── posts/index.js · posts/[id].js
└── upload.js           # Upload para o Vercel Blob

db/schema.sql           # Tabelas posts + users
scripts/create-admin.mjs# Cria/redefine o admin
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
| `mc-green-dark` |