import ts from 'typescript';
import { defineConfig } from 'vite';
import { metadataPlugin } from './scripts/site-meta.mjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Keep TypeScript transformation in-process in restricted desktop environments.
export default defineConfig({
  appType: 'mpa',
  resolve: { preserveSymlinks: true },
  esbuild: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [metadataPlugin(), {
    name: 'boop-not-found',
    configureServer(server) {
      return () => server.middlewares.use(async (req,res,next) => {
        if(!req.headers.accept?.includes('text/html'))return next();
        if(['/', '/index.html', '/privacidade/', '/privacidade/index.html'].includes(req.url?.split('?')[0]))return next();
        const html=await server.transformIndexHtml('/404.html',await readFile('404.html','utf8'));
        res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
      });
    },
    configurePreviewServer(server) {
      return () => server.middlewares.use(async (req,res,next) => {
        if(!req.headers.accept?.includes('text/html'))return next();
        if(['/', '/index.html', '/privacidade/', '/privacidade/index.html'].includes(req.url?.split('?')[0]))return next();
        res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await readFile('dist/404.html','utf8'));
      });
    },
  }, {
    name: 'boop-typescript',
    transform(source, id) {
      if (!/\/src\/.*\.ts(?:\?|$)/.test(id)) return;
      return { code: ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText, map: null };
    },
  }],
  build: { minify: 'esbuild', cssMinify: true, rollupOptions: { input: {main:resolve('index.html'),privacy:resolve('privacidade/index.html'),notFound:resolve('404.html')} } },
});
