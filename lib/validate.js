// ── Validação e sanitização (no SERVIDOR) ──────────────────────
// É AQUI que mora a segurança contra "manipular campos pelo DevTools".
// Não importa o que o navegador envie: o servidor corta tamanho, rejeita
// lixo e remove qualquer HTML perigoso (scripts, onerror, etc.) ANTES de
// gravar no banco. O cliente é tratado como não-confiável por princípio.
import sanitizeHtml from 'sanitize-html';

// HTML permitido no conteúdo do post (o que o editor Quill realmente gera).
const CONTENT_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'p', 'br', 'span', 'strong', 'em', 'u', 's',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'hr',
    // embeds: YouTube (iframe, só de hosts permitidos) e X/Twitter
    // (blockquote.twitter-tweet — o script de widgets roda na página do post)
    'iframe', 'div', 'figure', 'figcaption',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
    li: ['data-list'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'title', 'start'],
    div: ['data-youtube-video'],
    blockquote: ['data-theme', 'cite'],
    // classes para alinhamento/tamanho de imagem e embeds
    '*': ['class'],
  },
  // iframes só destes hosts sobrevivem à sanitização
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  // Só cores em style (o que o Quill aplica); nada de position/url/expression.
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  // Força links externos seguros
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
  },
};

export function cleanContent(html) {
  return sanitizeHtml(String(html || ''), CONTENT_OPTIONS);
}

// Texto puro (título, resumo): remove TODO HTML.
function cleanText(value) {
  return sanitizeHtml(String(value ?? ''), { allowedTags: [], allowedAttributes: {} }).trim();
}

function isValidImageUrl(url) {
  if (!url) return true; // opcional
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Valida e limpa a entrada de um post. Lança Error com mensagem amigável
 * se algo estiver fora das regras. Retorna campos já sanitizados.
 */
export function validatePost(body) {
  const title = cleanText(body?.title);
  const excerpt = cleanText(body?.excerpt);
  const imageUrl = String(body?.imageUrl ?? '').trim();
  const content = cleanContent(body?.content);

  // rascunho ou publicado — qualquer outra coisa vira 'published'
  const status = body?.status === 'draft' ? 'draft' : 'published';
  const featured = Boolean(body?.featured);

  let categoryId = body?.categoryId ?? null;
  if (categoryId !== null && categoryId !== '') {
    categoryId = Number(categoryId);
    if (!Number.isInteger(categoryId) || categoryId <= 0) throw new Error('Categoria inválida.');
  } else {
    categoryId = null;
  }

  if (title.length < 1) throw new Error('Título é obrigatório.');
  if (title.length > 200) throw new Error('Título muito longo (máx. 200).');
  if (excerpt.length > 300) throw new Error('Resumo muito longo (máx. 300).');
  // rascunho pode estar vazio; post publicado precisa de conteúdo
  if (status === 'published' && content.length < 1) throw new Error('Conteúdo é obrigatório.');
  if (content.length > 100000) throw new Error('Conteúdo muito longo.');
  if (imageUrl.length > 2000) throw new Error('URL da imagem muito longa.');
  if (!isValidImageUrl(imageUrl)) throw new Error('URL da imagem inválida.');

  return { title, excerpt, imageUrl: imageUrl || null, content, status, featured, categoryId };
}

/** Valida uma categoria (nome + cor em hex). */
export function validateCategory(body) {
  const name = cleanText(body?.name);
  const color = String(body?.color ?? '').trim().toLowerCase();
  if (name.length < 1) throw new Error('Nome da categoria é obrigatório.');
  if (name.length > 40) throw new Error('Nome muito longo (máx. 40).');
  if (!/^#[0-9a-f]{6}$/.test(color)) throw new Error('Cor inválida (use hex, ex.: #c0392b).');
  return { name, color };
}

/** Gera slug seguro a partir do título (autoridade é do servidor). */
export function generateSlug(title) {
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200) || 'post';
}
