/**
 * Post-build: remove dist/client/index.html so Vercel routes all
 * HTML requests through the SSR function instead of serving the
 * static shell. Assets in dist/client/assets/ are served by CDN.
 */
import { rm } from 'fs/promises'
import { existsSync } from 'fs'

if (existsSync('dist/client/index.html')) {
  await rm('dist/client/index.html')
  console.log('✓ Removed dist/client/index.html (SSR handles HTML)')
}

console.log('✅ Build complete — assets in dist/client/, SSR in api/ssr.js')
