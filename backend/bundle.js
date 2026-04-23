'use strict';
// Bundles backend/dist/serverless.js (tsc output) + all node_modules into a
// single self-contained file at api/dist/serverless.js for Vercel deployment.
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const entry = path.join(__dirname, 'dist', 'serverless.js');
const outfile = path.join(__dirname, '..', 'api', 'dist', 'serverless.js');

if (!fs.existsSync(entry)) {
  console.error('[bundle] Entry not found:', entry);
  console.error('[bundle] dist/ contents:', fs.existsSync(path.join(__dirname, 'dist'))
    ? fs.readdirSync(path.join(__dirname, 'dist'))
    : '(directory missing)');
  process.exit(1);
}

// NestJS uses try/require for optional peer features (websockets, microservices, etc.)
// and we don't use them. Any import that fails to resolve gets marked external so the
// bundle builds; at runtime NestJS's try/catch handles the missing modules.
const markOptionalDepsExternal = {
  name: 'mark-optional-deps-external',
  setup(build) {
    build.onResolve({ filter: /.*/ }, async (args) => {
      if (args.kind === 'entry-point' || args.path.startsWith('.') || path.isAbsolute(args.path)) {
        return null;
      }
      try {
        require.resolve(args.path, { paths: [args.resolveDir] });
        return null;
      } catch {
        return { path: args.path, external: true };
      }
    });
  },
};

esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile,
  external: ['pg-native'],
  keepNames: true,
  logLevel: 'warning',
  plugins: [markOptionalDepsExternal],
}).catch(() => process.exit(1));
