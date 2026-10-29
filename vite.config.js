import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readOgPreview } from './scripts/og-preview.mjs'
import { graph, jsonLd, organizationNode, websiteNode } from './scripts/blog/seo.mjs'

/**
 * Sert les pages statiques du blog pendant `npm run dev`.
 *
 * En développement, Vite ne sert que l'application React : les fichiers
 * produits par `scripts/build-blog.mjs` vivent dans `dist/` et ne sont donc
 * visibles qu'avec `npm run preview`. Ce middleware comble le trou pour que
 * `/blog/...` fonctionne aussi sur le serveur de dev.
 *
 * Uniquement actif en `serve` : la construction de production n'est pas
 * touchée, et le blog reste servi par les fichiers statiques en ligne.
 *
 * Après avoir modifié un article, relancer `npm run blog:build` puis
 * rafraîchir — il n'y a pas de rechargement à chaud sur ces pages.
 */
const blogDevServer = (distDir) => {
  const OWNED = [
    /^\/blog(\/|$)/,
    /^\/en\/blog(\/|$)/,
    /^\/blog-assets\//,
    /^\/sitemap[\w-]*\.xml$/,
    /^\/robots\.txt$/,
  ]
  const TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
  }

  return {
    name: 'kiro-blog-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url || '').split('?')[0])
        if (!OWNED.some((re) => re.test(url))) return next()

        let file = path.join(distDir, url)
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
          file = path.join(file, 'index.html')
        }

        /* `startsWith` bloque toute remontée hors de dist/ via « .. » */
        if (!file.startsWith(distDir) || !fs.existsSync(file)) {
          res.statusCode = 404
          res.setHeader('content-type', 'text/html; charset=utf-8')
          res.end(
            '<!doctype html><meta charset="utf-8"><title>Blog non généré</title>' +
              '<style>body{font-family:system-ui;max-width:34rem;margin:15vh auto;padding:0 1.5rem;line-height:1.6;color:#171515}' +
              'code{background:#faf6f2;border:1px solid #ece4e0;border-radius:6px;padding:2px 6px}</style>' +
              '<h1>Cette page du blog n’est pas générée</h1>' +
              '<p>Le serveur de développement sert les pages du blog depuis <code>dist/</code>. ' +
              'Génère-les une fois :</p>' +
              '<pre><code>npm run build:site &amp;&amp; npm run blog:build</code></pre>' +
              '<p>Ensuite, un simple <code>npm run blog:build</code> suffit après chaque modification de contenu.</p>',
          )
          return
        }

        res.setHeader('content-type', `${TYPES[path.extname(file)] || 'application/octet-stream'}; charset=utf-8`)
        res.end(fs.readFileSync(file))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /* Domaine officiel : valeur par défaut intégrée au build.
     Surchargable par la variable VITE_SITE_URL (Vercel → Environment Variables).
     Utilisé par index.html (%VITE_SITE_URL%) pour canonical/Open Graph. */
  const siteUrl = env.VITE_SITE_URL || 'https://kirodating.com'

  /* Aperçu de partage (Open Graph).
     Titre, description et image viennent d'un seul fichier, produit par
     `npm run og` à partir de la copie du hero et des jetons de design. Les
     écrire en dur dans index.html les avait fait mentir pendant des mois :
     le site disait « Brisez la glace », l'aperçu partagé disait encore
     « Arrête de swiper » et affichait un domaine qui n'est pas le nôtre. */
  const preview = readOgPreview(process.cwd())

  /* Titre et description de résultat de recherche (rédigés à la main, voir
     src/config/seo.json). Échappés : ils finissent dans des attributs HTML. */
  const seo = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'src/config/seo.json'), 'utf8'))
  for (const key of ['title', 'description']) {
    if (typeof seo[key] !== 'string' || !seo[key].trim()) {
      throw new Error(`src/config/seo.json : « ${key} » est absent ou vide.`)
    }
  }
  const escapeAttr = (value) =>
    String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return {
    plugins: [
      react(),
      {
        name: 'kiro-html-meta',
        /* `order: 'pre'` — la substitution passe AVANT le remplacement des
           variables d'environnement de Vite. Sans ça, Vite voit un jeton
           %VITE_SITE_URL% qu'il ne connaît pas et affiche un avertissement à
           chaque occurrence, alors que le remplacement fonctionne très bien. */
        transformIndexHtml: {
          order: 'pre',
          handler: (html) =>
            Object.entries({
              '%VITE_SITE_URL%': siteUrl,
              '%KIRO_SEO_TITLE%': escapeAttr(seo.title),
              '%KIRO_SEO_DESCRIPTION%': escapeAttr(seo.description),
              /* Même Organization/WebSite que les pages du blog : aucun
                 conflit d'@id entre l'accueil et le blog. */
              '%KIRO_JSON_LD%': jsonLd(graph([organizationNode(), websiteNode('fr')])),
              '%KIRO_TITLE%': preview.title,
              '%KIRO_OG_DESCRIPTION%': preview.description,
              '%KIRO_OG_IMAGE%': preview.image,
            }).reduce((out, [token, value]) => out.replaceAll(token, value), html),
        },
      },
      blogDevServer(path.resolve(process.cwd(), 'dist')),
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
