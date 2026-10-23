import fs from 'node:fs';
import { securityHeaders } from './site-meta.mjs';

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'vite',
  outputDirectory: 'dist',
  cleanUrls: true,
  trailingSlash: true,
  // Links curtos da bio: cada perfil do Instagram leva a /link/ com a UTM que diz de onde veio o lead.
  redirects: ['jabez', 'boop'].flatMap(profile => [`/${profile}`, `/${profile}/`].map(source => (
    { source, destination: `/link/?utm_source=instagram&utm_medium=bio&utm_campaign=${profile}`, permanent: false }
  ))),
  headers: [
    { source: '/(.*)', headers: Object.entries(securityHeaders).map(([key, value]) => ({ key, value })) },
    { source: '/404', headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }] },
    // Keep *.vercel.app deployment URLs out of search results; only the custom domain is indexed.
    { source: '/(.*)', has: [{ type: 'host', value: { suf: '.vercel.app' } }], headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
  ],
};
const serialized = `${JSON.stringify(config, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (fs.readFileSync('vercel.json', 'utf8') !== serialized) throw new Error('Run node scripts/deployment-config.mjs after changing structured data/security headers.');
  console.log('Deployment headers match the site metadata.');
} else {
  fs.writeFileSync('vercel.json', serialized);
}
