import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    ...tanstackStart(),
  ],
  ssr: {
    noExternal: true,
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash]-r2.js',
        entryFileNames: 'assets/[name]-[hash]-r2.js',
      },
    },
  },
})
