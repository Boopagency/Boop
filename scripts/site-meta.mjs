import { createHash } from 'node:crypto';
import { site, pages } from '../site.config.mjs';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
export const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${site.url}/#organization`, name: site.name, url: `${site.url}/`, email: site.email,
      description: site.description, logo: { '@type': 'ImageObject', url: `${site.url}/icon-512.png`, width: 512, height: 512 },
      sameAs: [site.instagram], founder: site.people.filter(p => p.founder).map(p => ({ '@type': 'Person', name: p.name })),
      employee: site.people.map(p => ({ '@type': 'Person', name: p.name, jobTitle: p.jobTitle, image: `${site.url}/assets/${p.image}` })),
      knowsAbout: ['Gestão de marca', 'Estratégia de marca', 'Conteúdo e comunicação', 'Sites e e-commerce', 'Sistemas e automações'] },
    { '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.name, url: `${site.url}/`, inLanguage: 'pt-BR', publisher: { '@id': `${site.url}/#organization` } },
    { '@type': 'WebPage', '@id': `${site.url}/#webpage`, url: `${site.url}/`, name: pages[0].title, description: site.description, inLanguage: 'pt-BR', isPartOf: { '@id': `${site.url}/#website` }, about: { '@id': `${site.url}/#organization` } },
  ],
};
const json = JSON.stringify(schema).replaceAll('<', '\\u003c');
const hash = createHash('sha256').update(json).digest('base64');
export const securityHeaders = {
  'Content-Security-Policy': `default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.instagram.com; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self'; upgrade-insecure-requests`,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};
export function head(page) {
  return `<title>${escape(page.title)}</title>
  <meta name="description" content="${escape(page.description)}" />
  <meta name="robots" content="${page.index ? 'index, follow, max-image-preview:large' : 'noindex, follow'}" />
  ${page.index ? `<link rel="canonical" href="${site.url}${page.path}" />` : ''}
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Boop" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:title" content="${escape(page.title)}" />
  <meta property="og:description" content="${escape(page.description)}" />
  <meta property="og:url" content="${site.url}${page.path}" />
  <meta property="og:image" content="${site.url}${site.socialImage}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1344" />
  <meta property="og:image:height" content="756" />
  <meta property="og:image:alt" content="Boop: fazemos coisas que as pessoas lembram." />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escape(page.title)}" />
  <meta name="twitter:description" content="${escape(page.description)}" />
  <meta name="twitter:image" content="${site.url}${site.socialImage}" />
  <meta name="twitter:image:alt" content="Boop: fazemos coisas que as pessoas lembram." />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  ${page.path === '/' ? `<script type="application/ld+json">${json}</script>` : ''}`;
}
export function metadataPlugin() {
  return {
    name: 'boop-site-metadata',
    transformIndexHtml(html, context) {
      const filename = context.filename.replaceAll('\\', '/');
      const page = [...pages].reverse().find(p => filename.endsWith(`/${p.file}`)) || pages[0];
      return html.replace(/<!-- SEO -->[\s\S]*?<!-- \/SEO -->/, head(page));
    },
    generateBundle() {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p => p.index).map(p => `<url><loc>${site.url}${p.path}</loc></url>`).join('')}</urlset>\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n` });
      this.emitFile({ type: 'asset', fileName: '_headers', source: `/*\n${Object.entries(securityHeaders).map(([key,value]) => `  ${key}: ${value}`).join('\n')}\n/404.html\n  X-Robots-Tag: noindex, follow\n` });
    },
  };
}
