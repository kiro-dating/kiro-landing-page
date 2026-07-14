import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /* Domaine officiel : valeur par défaut intégrée au build.
     Surchargable par la variable VITE_SITE_URL (Vercel → Environment Variables).
     Utilisé par index.html (%VITE_SITE_URL%) pour canonical/Open Graph. */
  const siteUrl = env.VITE_SITE_URL || 'https://kirodating.com'

  return {
    plugins: [
      react(),
      {
        name: 'kiro-site-url-default',
        transformIndexHtml: (html) => html.replaceAll('%VITE_SITE_URL%', siteUrl),
      },
    ],
    test: {
      environment: 'node',
      globals: true,
      include: ['src/utils/__tests__/**/*.test.js'],
      // Exclude JSX/React files from tests to avoid slow transforms
      exclude: ['**/*.jsx', '**/node_modules/**'],
    },
  }
})
