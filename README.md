# Corelakes — React + Vite + Tailwind CSS

Personal portfolio & blog for Jonas Agra (Corelakes).

## Tech stack
| Layer | Tool |
|---|---|
| UI framework | React 18 |
| Bundler | Vite 5 |
| CSS | Tailwind CSS 3 + custom Minecraft theme |
| Routing | React Router v6 |
| Backend / Auth | Supabase (JS SDK v2) |
| Rich-text editor | Quill via react-quill |
| Image pipeline | Custom HEIC-safe processor + Supabase Storage |

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
│   ├── useAuth.js      # Supabase session management + admin flag
│   └── usePosts.js     # CRUD layer with localStorage fallback
│
└── utils/
    ├── supabase.js     # Singleton client, config helpers, slug generator
    └── imageProcessor.js # ImageProcessor (HEIC / EXIF) + SupabaseUploader
```

## Deployment (Vercel)

1. Push to GitHub.
2. Import repo in [vercel.com](https://vercel.com).
3. Framework preset → **Vite**.
4. No environment variables needed – public Supabase credentials are baked in for read access; admin credentials are saved to `localStorage` at runtime via the Config screen.

## Supabase tables expected

| Table | Columns |
|---|---|
| `posts` | `id` (int, PK) · `title` · `slug` · `content` · `excerpt` · `image_url` · `created_at` · `updated_at` |

Storage bucket: **`blog-images`** (public, path `posts/`).

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
| `mc-red` | `#8b2020` |
| `mc-red-light` | `#a52a2a` |
| `mc-nav` | `#1c1c1d` |

Font families: `font-mc` · `font-mc-bold` · `font-mc-five`
