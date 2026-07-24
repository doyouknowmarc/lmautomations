import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// The client build emits the three static HTML entries; the SSR build (used by
// scripts/prerender.mjs) compiles src/entry-server.tsx instead, so it must not
// carry the HTML inputs.
export default defineConfig(({ isSsrBuild }) => ({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: isSsrBuild
      ? undefined
      : {
          input: {
            main: resolve(__dirname, 'index.html'),
            imprint: resolve(__dirname, 'imprint/index.html'),
            faq: resolve(__dirname, 'faq/index.html'),
          },
        },
  },
}))
