/**
 * Post-build script: converts Vite's dist/ output into Vercel Build Output API v3 format.
 *
 * Input:
 *   dist/client/  → static assets (hashed JS/CSS/images)
 *   dist/server/  → SSR server bundle (exports default { async fetch(request) })
 *
 * Output (.vercel/output/):
 *   static/       → served as-is by Vercel CDN
 *   functions/index.func/  → Node.js serverless function for all non-asset requests
 *   config.json   → routing rules
 */

import { cp, mkdir, writeFile, rm } from 'fs/promises'
import { existsSync } from 'fs'

const OUTPUT = '.vercel/output'

// Clean previous build
if (existsSync(OUTPUT)) {
  await rm(OUTPUT, { recursive: true })
}

// 1. Static assets → CDN
await mkdir(`${OUTPUT}/static`, { recursive: true })
await cp('dist/client', `${OUTPUT}/static`, { recursive: true })
console.log('✓ Static assets →', `${OUTPUT}/static/`)

// 2. Server function
const FUNC = `${OUTPUT}/functions/index.func`
await mkdir(FUNC, { recursive: true })
await cp('dist/server', FUNC, { recursive: true })
console.log('✓ Server bundle →', FUNC)

// Vercel function config
// server.js exports `export default { async fetch(request, env, ctx) }`
// which Vercel Fluid Compute (Node.js) supports natively.
await writeFile(`${FUNC}/.vc-config.json`, JSON.stringify({
  runtime: 'nodejs22.x',
  handler: 'server.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: false,
  supportsResponseStreaming: true
}, null, 2))
console.log('✓ .vc-config.json written')

// 3. Vercel routing config
// - Immutable hashed assets served from CDN with long cache
// - Everything else handled by the SSR server function
await writeFile(`${OUTPUT}/config.json`, JSON.stringify({
  version: 3,
  routes: [
    {
      src: '/assets/(.*)',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true
    },
    { src: '/(.*)', dest: '/index' }
  ]
}, null, 2))
console.log('✓ config.json written')

console.log('\n✅ .vercel/output/ ready for deployment')
