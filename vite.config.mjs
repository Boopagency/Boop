import ts from 'typescript';
import { defineConfig } from 'vite';

// Keep TypeScript transformation in-process in restricted desktop environments.
export default defineConfig({
  resolve: { preserveSymlinks: true },
  esbuild: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [{
    name: 'boop-typescript',
    transform(source, id) {
      if (!/\/src\/.*\.ts(?:\?|$)/.test(id)) return;
      return { code: ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText, map: null };
    },
  }],
  build: { minify: false, cssMinify: false },
});
