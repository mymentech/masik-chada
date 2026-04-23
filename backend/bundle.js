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

esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile,
  external: ['pg-native'],
  keepNames: true,
  logLevel: 'warning',
}).catch(() => process.exit(1));
