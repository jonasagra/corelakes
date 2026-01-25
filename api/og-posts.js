import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const supabaseUrl = 'https://nkrpxjlixrpvmvkyzobf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcnB4amxpeHJwdm12a3l6b2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTU1ODAsImV4cCI6MjA4NDg3MTU4MH0.EvfrUfAQKQo-scZ487m4nT2FyUggYDpavD1YTUZhfWs';

// Check if request is from a social media bot
function isSocialBot(userAgent) {
  if (!userAgent) return false;
  
  const botPatterns = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'WhatsApp',
    'LinkedInBot',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'SkypeUriPreview',
    'pinterest',
  ];
  
  return botPatterns.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

export default async function handler(request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const userAgent = request.headers.get('user-agent') || '';
  
  // If not a bot or no slug, return original HTML
  if (!isSocialBot(userAgent) || !slug) {
    return fetch(new URL('/posts.html', url.origin).toString());
  }
  
  try {
    // Fetch post from Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !post) {
      return fetch(new URL('/posts.html', url.origin).toString());
    }
    
    // Fetch original HTML
    const originalHtml = await fetch(new URL('/posts.html', url.origin).toString());
    let html = await originalHtml.text();
    
    // Prepare meta tags
    const title = post.title || 'Blog de Corelakes';
    const description = post.excerpt || '';
    const image = post.image_url || 'https://minecraft.wiki/images/Corelakes_pfp_avatar.png?84b72';
    const postUrl = `${url.origin}/posts.html?slug=${slug}`;
    
    // Inject meta tags
    html = html.replace(
      '<title id="page-title">Blog de Corelakes</title>',
      `<title id="page-title">${escapeHtml(title)} - Corelakes</title>`
    );
    
    html = html.replace(
      '<meta name="description" id="meta-description" content="">',
      `<meta name="description" id="meta-description" content="${escapeHtml(description)}">`
    );
    
    html = html.replace(
      '<meta property="og:title" id="og-title" content="">',
      `<meta property="og:title" id="og-title" content="${escapeHtml(title)}">`
    );
    
    html = html.replace(
      '<meta property="og:description" id="og-description" content="">',
      `<meta property="og:description" id="og-description" content="${escapeHtml(description)}">`
    );
    
    html = html.replace(
      '<meta property="og:image" id="og-image" content="">',
      `<meta property="og:image" id="og-image" content="${escapeHtml(image)}">`
    );
    
    html = html.replace(
      '<meta property="og:url" id="og-url" content="">',
      `<meta property="og:url" id="og-url" content="${escapeHtml(postUrl)}">`
    );
    
    html = html.replace(
      '<meta name="twitter:title" id="twitter-title" content="">',
      `<meta name="twitter:title" id="twitter-title" content="${escapeHtml(title)}">`
    );
    
    html = html.replace(
      '<meta name="twitter:description" id="twitter-description" content="">',
      `<meta name="twitter:description" id="twitter-description" content="${escapeHtml(description)}">`
    );
    
    html = html.replace(
      '<meta name="twitter:image" id="twitter-image" content="">',
      `<meta name="twitter:image" id="twitter-image" content="${escapeHtml(image)}">`
    );
    
    return new Response(html, {
      headers: {
        'content-type': 'text/html',
        'cache-control': 'public, max-age=3600',
      },
    });
    
  } catch (error) {
    console.error('Error generating OG tags:', error);
    return fetch(new URL('/posts.html', url.origin).toString());
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}