/**
 * SEO : métadonnées <head> et données structurées Schema.org.
 *
 * Tout ce que Google, Facebook, X/Twitter et LinkedIn lisent d'une page du
 * blog est produit ici. Un seul endroit à corriger si une règle change.
 */

import { BRAND, LANGS, SITE_URL, SOCIAL, DEFAULT_OG_IMAGE } from './config.mjs';
import { escapeHtml } from './utils.mjs';

/** URL absolue à partir d'un chemin de site. */
export const abs = (pathname = '/') =>
  /^https?:\/\//i.test(pathname) ? pathname : `${SITE_URL}${pathname.startsWith('/') ? '' : '/'}${pathname}`;

const meta = (attr, key, value) =>
  value ? `<meta ${attr}="${escapeHtml(key)}" content="${escapeHtml(value)}" />` : '';

/**
 * Bloc <head> commun à toutes les pages du blog.
 *
 * @param {object} o
 * @param {string} o.lang            code de langue ('fr' | 'en')
 * @param {string} o.title           <title> complet
 * @param {string} o.description     meta description
 * @param {string} o.path            chemin canonique de la page
 * @param {string} [o.image]         image Open Graph (chemin de site ou URL)
 * @param {string} [o.imageAlt]
 * @param {'website'|'article'} [o.type]
 * @param {boolean} [o.noindex]
 * @param {Array<{lang:string,path:string}>} [o.alternates] versions traduites
 * @param {string} [o.prev] / [o.next] pagination
 * @param {string} [o.rss]
 */
export const head = ({
  lang,
  title,
  description,
  path: pathname,
  image = DEFAULT_OG_IMAGE,
  imageAlt = BRAND,
  type = 'website',
  noindex = false,
  alternates = [],
  prev = null,
  next = null,
  rss = null,
  rssTitle = null,
  canonical = null,
}) => {
  const conf = LANGS[lang];
  const url = canonical || abs(pathname);

  const hreflang = alternates
    .map(
      ({ lang: code, path: p }) =>
        `<link rel="alternate" hreflang="${LANGS[code].locale}" href="${escapeHtml(abs(p))}" />`,
    )
    .join('\n    ');

  const xDefault = alternates.find(({ lang: code }) => LANGS[code].isDefault);

  return `<title>${escapeHtml(title)}</title>
    ${meta('name', 'description', description)}
    <link rel="canonical" href="${escapeHtml(url)}" />
    ${noindex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />'}
    ${hreflang}
    ${xDefault ? `<link rel="alternate" hreflang="x-default" href="${escapeHtml(abs(xDefault.path))}" />` : ''}
    ${prev ? `<link rel="prev" href="${escapeHtml(abs(prev))}" />` : ''}
    ${next ? `<link rel="next" href="${escapeHtml(abs(next))}" />` : ''}
    ${rss ? `<link rel="alternate" type="application/rss+xml" title="${escapeHtml(rssTitle || BRAND)}" href="${escapeHtml(abs(rss))}" />` : ''}

    <!-- Open Graph -->
    ${meta('property', 'og:site_name', BRAND)}
    ${meta('property', 'og:title', title)}
    ${meta('property', 'og:description', description)}
    ${meta('property', 'og:url', url)}
    ${meta('property', 'og:type', type)}
    ${meta('property', 'og:locale', conf.ogLocale)}
    ${meta('property', 'og:image', abs(image))}
    ${meta('property', 'og:image:alt', imageAlt)}
    ${meta('property', 'og:image:width', '1200')}
    ${meta('property', 'og:image:height', '630')}

    <!-- Twitter Cards -->
    ${meta('name', 'twitter:card', 'summary_large_image')}
    ${meta('name', 'twitter:title', title)}
    ${meta('name', 'twitter:description', description)}
    ${meta('name', 'twitter:image', abs(image))}
    ${meta('name', 'twitter:image:alt', imageAlt)}`;
};

/**
 * Encapsule un graphe JSON-LD dans un <script> sûr.
 * `<`, `>` et `&` sont échappés en séquences unicode : le JSON reste valide
 * et aucune chaîne de contenu ne peut fermer la balise <script>.
 */
export const jsonLd = (node) => {
  if (!node) return '';
  const json = JSON.stringify(node)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return `<script type="application/ld+json">${json}</script>`;
};

/* ── Nœuds Schema.org ───────────────────────────────────────────────────── */

export const organizationNode = () => ({
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND,
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: abs('/icon_kiro.png'),
  },
  sameAs: SOCIAL,
});

export const websiteNode = (lang) => ({
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: BRAND,
  inLanguage: LANGS[lang].locale,
  publisher: { '@id': `${SITE_URL}/#organization` },
});

/** Fil d'Ariane. `trail` = [{ name, path }], du plus général au plus précis. */
export const breadcrumbNode = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: abs(item.path),
  })),
});

export const blogNode = ({ lang, path: pathname, name, description, posts }) => ({
  '@type': 'Blog',
  '@id': `${abs(pathname)}#blog`,
  url: abs(pathname),
  name,
  description,
  inLanguage: LANGS[lang].locale,
  publisher: { '@id': `${SITE_URL}/#organization` },
  blogPost: posts.slice(0, 20).map((post) => ({
    '@type': 'BlogPosting',
    '@id': `${abs(post.url)}#article`,
    headline: post.title,
    url: abs(post.url),
    datePublished: post.publishedIso,
    dateModified: post.updatedIso,
  })),
});

export const collectionNode = ({ lang, path: pathname, name, description, posts }) => ({
  '@type': 'CollectionPage',
  '@id': `${abs(pathname)}#collection`,
  url: abs(pathname),
  name,
  description,
  inLanguage: LANGS[lang].locale,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: abs(post.url),
      name: post.title,
    })),
  },
});

export const articleNode = (post) => ({
  '@type': 'BlogPosting',
  '@id': `${abs(post.url)}#article`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': abs(post.url) },
  headline: post.title,
  description: post.description,
  articleSection: post.categoryLabel,
  keywords: post.tagLabels.map((t) => t.label).join(', ') || undefined,
  inLanguage: post.locale,
  url: abs(post.url),
  datePublished: post.publishedIso,
  dateModified: post.updatedIso,
  wordCount: post.wordCount,
  timeRequired: `PT${post.readingTime}M`,
  image: [abs(post.ogImage)],
  author: {
    '@type': post.author.type === 'Organization' ? 'Organization' : 'Person',
    name: post.author.name,
    ...(post.author.url ? { url: abs(post.author.url) } : {}),
    ...(post.author.jobTitle ? { jobTitle: post.author.jobTitle } : {}),
  },
  publisher: { '@id': `${SITE_URL}/#organization` },
  isPartOf: { '@id': `${SITE_URL}/#website` },
});

/** FAQPage — uniquement si l'article déclare au moins une question. */
export const faqNode = (post) =>
  post.faq.length === 0
    ? null
    : {
        '@type': 'FAQPage',
        '@id': `${abs(post.url)}#faq`,
        mainEntity: post.faq.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: { '@type': 'Answer', text: entry.answerText },
        })),
      };

/** Enveloppe finale : un seul graphe par page, plus simple à déboguer. */
export const graph = (nodes) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
});
