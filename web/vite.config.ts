import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { fluxApi } from './server/flux-api.ts'

// Raiz do repositório: os exemplos em docs/exemplos/ são importados pela interface.
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss(), fluxApi()],
  server: { host: '127.0.0.1', port: 5173, fs: { allow: [repoRoot] } },
  preview: { host: '127.0.0.1', port: 4173 },
})
