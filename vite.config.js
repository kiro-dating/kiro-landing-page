import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/utils/__tests__/**/*.test.js'],
    // Exclude JSX/React files from tests to avoid slow transforms
    exclude: ['**/*.jsx', '**/node_modules/**'],
  },
})
