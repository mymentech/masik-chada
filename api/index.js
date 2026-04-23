'use strict';
/**
 * Vercel serverless function entry point (must live at /api/ in the project root).
 *
 * `npm run build` compiles backend/src/serverless.ts → backend/dist/serverless.js
 * before Vercel serves this file, so the require below always finds the
 * compiled output.
 */
module.exports = require('../backend/dist/serverless').default;
