const DOMAIN = 'https://automotiveinsight.com.au';

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
function addSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);

  newHeaders.set('Strict-Transport-Security',  'max-age=31536000; includeSubDomains; preload');
  newHeaders.set('X-Content-Type-Options',      'nosniff');
  newHeaders.set('X-Frame-Options',             'SAMEORIGIN');
  newHeaders.set('Referrer-Policy',             'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy',          'camera=(), microphone=(), geolocation=(), payment=()');
  newHeaders.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://maps.googleapis.com https://connect.podium.com https://cdn.podiumassets.com https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    // NOTE: automotiveinsight.com.au is in img-src because images are currently
    // hotlinked from there. Remove once images are migrated to the new CDN.
    "img-src 'self' data: https://automotiveinsight.com.au https://services.automotiveinsight.com.au https://maps.gstatic.com; " +
    "frame-src https://www.google.com; " +
    "connect-src 'self' https://*.supabase.co https://connect.podium.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com");

  return new Response(response.body, {
    status:  response.status,
    headers: newHeaders,
  });
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------
const SITEMAP_PAGES = [
  { url: '/',                          priority: '1.0', changefreq: 'weekly'  },
  { url: '/about',                     priority: '0.8', changefreq: 'monthly' },
  { url: '/services',                  priority: '0.9', changefreq: 'monthly' },
  { url: '/european-cars',             priority: '0.9', changefreq: 'monthly' },
  { url: '/asian-cars',                priority: '0.8', changefreq: 'monthly' },
  { url: '/logbook-service',           priority: '0.8', changefreq: 'monthly' },
  { url: '/fleet-maintenance',         priority: '0.7', changefreq: 'monthly' },
  { url: '/brakes-suspension',         priority: '0.8', changefreq: 'monthly' },
  { url: '/diagnostics',               priority: '0.8', changefreq: 'monthly' },
  { url: '/auto-electrical',           priority: '0.7', changefreq: 'monthly' },
  { url: '/ev-hybrid',                 priority: '0.9', changefreq: 'monthly' },
  { url: '/ev-hybrid/hybrid-servicing',priority: '0.8', changefreq: 'monthly' },
  { url: '/ev-hybrid/ev-charging',     priority: '0.7', changefreq: 'monthly' },
  { url: '/ev-hybrid/ev-diagnostics',  priority: '0.8', changefreq: 'monthly' },
  { url: '/faqs',                      priority: '0.7', changefreq: 'monthly' },
  { url: '/reviews',                   priority: '0.6', changefreq: 'monthly' },
  { url: '/contact',                   priority: '0.8', changefreq: 'monthly' },
];

function buildSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls = SITEMAP_PAGES.map(p => `
  <url>
    <loc>${DOMAIN}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------
const ROBOTS_TXT = `User-agent: *
Allow: /

# AI crawlers — all permitted (deliberate policy; review if training-data opt-out desired)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: https://automotiveinsight.com.au/sitemap.xml
`;

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/sitemap.xml') {
      return addSecurityHeaders(new Response(buildSitemap(), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
      }));
    }

    if (pathname === '/robots.txt') {
      return addSecurityHeaders(new Response(ROBOTS_TXT, {
        headers: { 'Content-Type': 'text/plain' }
      }));
    }

    // Fall through to static asset serving
    const response = await env.ASSETS.fetch(request);
    return addSecurityHeaders(response);
  },
};
