/**
 * Flux et fichiers techniques : sitemaps, RSS, robots.txt, index de recherche.
 *
 * Règle générale : tout ce qui est listé ici doit être indexable et cohérent
 * avec les balises canoniques des pages. Une URL absente du sitemap mais
 * indexable n'est pas un problème ; l'inverse en est un.
 */

import { BRAND, LANGS, SITE_URL, UI } from './config.mjs';
import { escapeXml, stripHtml, truncate } from './utils.mjs';
import { abs } from './seo.mjs';

/**
 * Extension « image » du protocole sitemap.
 * Déclarer l'illustration d'un article aide les moteurs à l'associer à sa page
 * plutôt qu'à la traiter comme un fichier isolé. Sans effet si `images` est vide.
 */
const imageNodes = (images) =>
  images
    .map(
      ({ loc, title, caption }) => `
    <image:image>
      <image:loc>${escapeXml(abs(loc))}</image:loc>${title ? `\n      <image:title>${escapeXml(title)}</image:title>` : ''}${
        caption ? `\n      <image:caption>${escapeXml(caption)}</image:caption>` : ''
      }
    </image:image>`,
    )
    .join('');

const urlNode = ({ loc, lastmod, changefreq, priority, alternates = [], images = [] }) => `  <url>
    <loc>${escapeXml(abs(loc))}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}${
      changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ''
    }${priority ? `\n    <priority>${priority}</priority>` : ''}
${alternates
  .map(
    ({ lang, path }) =>
      `    <xhtml:link rel="alternate" hreflang="${LANGS[lang].locale}" href="${escapeXml(abs(path))}" />`,
  )
  .join('\n')}${alternates.length ? '\n' : ''}${imageNodes(images)}
  </url>`;

/** Sitemap d'un ensemble d'URLs, avec les alternates hreflang. */
export const sitemap = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(urlNode).join('\n')}
</urlset>
`;

/** Index de sitemaps — permet d'ajouter d'autres sitemaps plus tard sans rien casser. */
export const sitemapIndex = (files, lastmod) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files
  .map(
    (file) => `  <sitemap>
    <loc>${escapeXml(abs(file))}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  )
  .join('\n')}
</sitemapindex>
`;

export const robots = (sitemapUrl) => `# robots.txt — ${BRAND}
User-agent: *
Allow: /

# Pages d'outils : utiles aux humains, sans valeur pour l'index
Disallow: /blog/recherche/
Disallow: /en/blog/search/

Sitemap: ${abs(sitemapUrl)}
`;

/** Flux RSS 2.0 d'une langue. */
export const rss = ({ lang, posts, path: pathname }) => {
  const t = UI[lang];
  const now = new Date().toUTCString();
  const items = posts
    .slice(0, 30)
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(abs(post.url))}</link>
      <guid isPermaLink="true">${escapeXml(abs(post.url))}</guid>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <category>${escapeXml(post.categoryLabel)}</category>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>
      <description>${escapeXml(truncate(stripHtml(post.html), 400))}</description>
    </item>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(t.blogTitle)}</title>
    <link>${escapeXml(abs(LANGS[lang].base))}/</link>
    <atom:link href="${escapeXml(abs(pathname))}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(t.blogTagline)}</description>
    <language>${LANGS[lang].locale}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <copyright>© ${new Date().getUTCFullYear()} ${BRAND}</copyright>
${items}
  </channel>
</rss>
`;
};

/**
 * Index de recherche : chargé uniquement sur la page /recherche/.
 * Volontairement compact — un article = un objet, pas de corps complet.
 */
export const searchIndex = (posts) =>
  JSON.stringify(
    posts.map((post) => ({
      t: post.title,
      u: post.url,
      d: post.excerpt,
      c: post.categoryLabel,
      g: post.tagLabels.map((x) => x.label),
      p: post.publishedLabel,
      r: post.readingLabel,
      i: post.cover || '',
      // Corps réduit : améliore la pertinence sans exploser le poids du fichier
      b: truncate(stripHtml(post.html), 1200),
    })),
  );

export { SITE_URL };
