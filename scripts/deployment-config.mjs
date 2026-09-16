import fs from 'node:fs';
import { securityHeaders } from './site-meta.mjs';

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'vite',
  outputDirectory: 'dist',
  cleanUrls: true,
  trailingSlash: true,
  headers: [
    { source: '/(.*)', headers: Object.entries(securityHeaders).map(([key, value]) => ({ key, value })) },
    { source: '/404', headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }] },
  ],
};
const serialized = `${JSON.stringify(config, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (fs.readFileSync('vercel.json', 'utf8') !== serialized) throw new Error('Run node scripts/deployment-config.mjs after changing structured data/security headers.');
  console.log('Deployment headers match the site metadata.');
} else {
  fs.writeFileSync('vercel.json', serialized);
}
