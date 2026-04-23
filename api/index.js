'use strict';
// The build step compiles + bundles backend/src/serverless.ts into this directory.
// Using a co-located path so Vercel's nft file-tracer picks it up automatically.
module.exports = require('./dist/serverless').default;
