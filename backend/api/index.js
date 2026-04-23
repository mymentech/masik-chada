'use strict';
/**
 * Vercel serverless function entry point.
 *
 * `npm run build` (tsc) compiles src/serverless.ts → dist/serverless.js
 * before Vercel serves this file, so the require below always finds the
 * compiled output.
 */
module.exports = require('../dist/serverless').default;
