/**
 * Tests du générateur du blog (scripts/blog/*.test.mjs).
 *
 * La configuration principale (vite.config.js → test.include) ne ramasse que
 * src/utils/__tests__/ : les tests du générateur — dont links.test.mjs, le
 * garde-fou anti-lien-mort — n'étaient donc jamais exécutés par `npm test`.
 * Cette configuration dédiée les rattache à `npm test` (voir package.json)
 * sans toucher à vite.config.js, qui sert aussi au build de la landing.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  root,
  test: {
    environment: 'node',
    include: ['scripts/blog/**/*.test.mjs'],
  },
});
