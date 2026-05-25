import { defineConfig } from '@tanstack/react-start/config'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  tsr: {
    routesDirectory: './src/routes',
    generatedRouteTree: './src/routeTree.gen.ts',
  },
  vite: {
    plugins: [tailwindcss(), tsConfigPaths()],
  },
  server: {
    preset: 'vercel',
  },
})
