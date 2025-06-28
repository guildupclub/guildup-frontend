// app/sitemap.xml/route.ts
import { type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = 'https://www.guildup.club';

  // Simulate fetching dynamic data (replace with real DB/API calls)
  const posts = [{ id: '789' }, { id: '456' }];
  const communities = [
    { id: '123', slug: 'Nlp-CoachPallavikambo-67fcceae8924663fe50bb7bf' },
    { id: '456', slug: 'AnotherCreator-xyz123' },
  ];

  const staticRoutes = [
    '', 'blogs', 'chat', 'contact-us', 'creator-studio',
    'booking', 'hiring', 'no-community', 'payments', 'feeds',
    'privacy-policy', 'terms-conditions', 'profile', 'community', 'community/feed',
    'api/search', 'api/auth/signin', 'api/auth/signup'
  ];

  let urls = staticRoutes.map(
    route => `
    <url>
      <loc>${baseUrl}/${route}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
  );

  posts.forEach(post => {
    urls.push(`
    <url>
      <loc>${baseUrl}/post/${post.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
  });

  communities.forEach(comm => {
    urls.push(`
    <url>
      <loc>${baseUrl}/community/${comm.id}/feed</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
    <url>
      <loc>${baseUrl}/community/${comm.slug}/profile</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('\n')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
