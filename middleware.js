export const config = {
  matcher: '/posts.html',
};

const supabaseUrl = 'https://nkrpxjlixrpvmvkyzobf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcnB4amxpeHJwdm12a3l6b2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTU1ODAsImV4cCI6MjA4NDg3MTU4MH0.EvfrUfAQKQo-scZ487m4nT2FyUggYDpavD1YTUZhfWs';

function isSocialBot(userAgent) {
  if (!userAgent) return false;
  
  const ua = userAgent.toLowerCase();
  
  const botPatterns = [
    // Facebook
    'facebookexternalhit',
    'facebot',
    // Twitter/X
    'twitterbot',
    // WhatsApp
    'whatsapp',
    // Discord
    'discordbot',
    // LinkedIn
    'linkedinbot',
    // Telegram
    'telegrambot',
    // Slack
    'slackbot',
    'slack-imgproxy',
    // Skype
    'skypeuripreview',
    // Pinterest
    'pinterest',
    // Reddit
    'redditbot',
    // Mastodon
    'mastodon',
    // iMessage
    'applebot',
  ];
  
  return botPatterns.some(bot => ua.includes(bot));
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // If not a social bot, let it through normally
  if (!isSocialBot(userAgent)) {
    return;
  }
  
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  
  // If no slug, let it through
  if (!slug) {
    return;
  }
  
  try {
    // Fetch post from Supabase
    const response = await fetch(
      `${supabaseUrl}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    
    if (!response.ok) {
      return;
    }
    
    const posts = await response.json();
    const post = posts[0];
    
    if (!post) {
      return;
    }
    
    // Fetch the original HTML
    const htmlResponse = await fetch(url.toString(), {
      headers: {
        'user-agent': 'vercel-bot', // Avoid infinite loop
      },
    });
    
    let html = await htmlResponse.text();
    
    // Prepare meta tags
    const title = post.title || 'Blog pessoal - Corelakes';
    const description = post.excerpt || '';
    const image = post.image_url || 'https://minecraft.wiki/images/Corelakes_pfp_avatar.png?84b72';
    const postUrl = `${url.origin}/posts.html?slug=${slug}`;
    
    // Inject meta tags
    html = html.replace(
      '<title id="page-title">Blog pessoal</title>',
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
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
    
  } catch (error) {
    console.error('Middleware error:', error);
    return;
  }
}