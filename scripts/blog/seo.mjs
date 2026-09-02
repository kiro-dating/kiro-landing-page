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

/* ── Identité de l'auteur ───────────────────────────────────────────────── */

/**
 * Identifiant stable d'un auteur dans le graphe.
 *
 * C'est la pièce maîtresse, et elle vaut d'être expliquée. Sans `@id`, chaque
 * page émettait un objet Person anonyme : un moteur voyait autant de personnes
 * distinctes que de pages, et aucune ne cumulait l'autorité des autres. Avec un
 * `@id` ancré sur la page d'auteur, toutes les mentions du site — signature
 * d'article, encadré auteur, crédit photo, page de profil — désignent
 * littéralement le même nœud.
 *
 * L'ancre est la page d'auteur FRANÇAISE dans les deux langues, volontairement :
 * une personne n'a pas une identité par langue. Traduire l'identifiant
 * scinderait en deux ce qu'on cherche justement à réunir.
 */
export const personId = (slug) => `${SITE_URL}${LANGS.fr.base}/${LANGS.fr.segments.author}/${slug}/#person`;

/**
 * Nœud complet d'un auteur — Person, ou Organization pour une entité éditoriale.
 *
 * Trois champs font le vrai travail de désambiguïsation, et ils n'ont d'intérêt
 * que pris ensemble :
 *
 *   · `sameAs` déclare que ces URLs désignent la même personne. C'est le seul
 *     mécanisme normalisé pour relier une signature de blog à un site personnel
 *     et à des profils publics. Un nom répandu sans `sameAs` reste indistinct
 *     de ses homonymes, quelle que soit la qualité des articles.
 *   · `alternateName` couvre la forme courte du nom, celle que les gens tapent.
 *   · `homeLocation` sépare deux personnes du même nom par la géographie.
 *
 * `knowsAbout` est dérivé des sujets réellement traités, jamais déclaré à la
 * main : une compétence qu'aucun article ne démontre n'est pas une compétence.
 */
export const personNode = (author, { knowsAbout = [] } = {}) => {
  const isOrg = author.type === 'Organization';
  return {
    '@type': isOrg ? 'Organization' : 'Person',
    '@id': personId(author.slug),
    name: author.name,
    ...(author.alternateName && !isOrg ? { alternateName: author.alternateName } : {}),
    /* `url` pointe vers la page qui fait autorité sur la personne : son site
       s'il en a un, sa page d'auteur sinon. */
    url: author.url ? abs(author.url) : abs(author.path),
    /* La page d'auteur du blog est toujours déclarée, même quand `url` pointe
       ailleurs : c'est elle qui rassemble les articles. */
    mainEntityOfPage: abs(author.path),
    ...(author.jobTitleSchema && !isOrg ? { jobTitle: author.jobTitleSchema } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.homeLocation && !isOrg
      ? { homeLocation: { '@type': 'Place', name: author.homeLocation } }
      : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    /* Ne jamais émettre un `sameAs` vide : une liste vide se lit comme
       « cette personne n'a aucun autre profil », ce qui est faux et inutile. */
    ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
  };
};

/**
 * Photographie, en Schema.org.
 *
 * Ce nœud existe pour une raison précise et vérifiable : sans `license` ET
 * `acquireLicensePage`, Google Images n'affiche pas la mention de licence sous
 * l'image, et le photographe reste anonyme partout où l'image circule. Les
 * autres champs (`creator`, `creditText`, `copyrightNotice`) sont ce que Google
 * recommande d'ajouter pour que ce crédit soit exploitable.
 *
 * `width` et `height` viennent du fichier réellement produit, pas d'une
 * estimation : une dimension fausse ici contredirait le HTML de la page.
 */
export const imageObjectNode = (photo, { variant = 'body', representative = false } = {}) => {
  /* La déclinaison de couverture est un autre fichier — autre recadrage, autres
     dimensions —, donc une autre ressource : elle reçoit son propre `@id`. Les
     déclarer sous le même identifiant reviendrait à affirmer que deux fichiers
     différents sont la même image. */
  const view = variant === 'cover' && photo.cover ? photo.cover : photo;
  return {
    '@type': 'ImageObject',
    '@id': `${abs(view.src)}#image`,
    contentUrl: abs(view.src),
    url: abs(view.src),
    width: view.width,
    height: view.height,
    /* `representativeOfPage` : l'image que la page revendique comme la sienne.
       Réservé à la couverture — le dire de plusieurs images n'aurait pas de sens. */
    ...(representative ? { representativeOfPage: true } : {}),
    name: photo.place,
    caption: photo.caption,
    description: photo.alt,
    /* Référence, pas copie : le crédit d'une photo doit alimenter la MÊME entité
       que la signature des articles, sinon le photographe et l'auteur deviennent
       deux personnes aux yeux d'un moteur. */
    creator: { '@id': personId(photo.photographer.slug) },
    creditText: photo.photographer.name,
    copyrightNotice: `© ${photo.photographer.name}`,
    license: photo.license.deed,
    acquireLicensePage: abs(photo.license.acquirePath),
    ...(photo.place ? { contentLocation: { '@type': 'Place', name: photo.place } } : {}),
    /* Jamais de date inventée : le champ n'apparaît que si elle est connue. */
    ...(photo.capturedAt ? { dateCreated: photo.capturedAt } : {}),
  };
};

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
  /* Une couverture PHOTOGRAPHIQUE est un ImageObject complet, marqué
     `representativeOfPage` : la page revendique cette image, et l'image porte
     sa licence. Une couverture illustrée reste une simple URL — une œuvre Kiro
     n'a pas de licence tierce à déclarer. */
  image: [
    post.coverPhoto
      ? imageObjectNode(post.coverPhoto, { variant: 'cover', representative: true })
      : abs(post.ogImage),
    ...(post.photos || []).map((photo) => imageObjectNode(photo)),
  ],
  /* L'auteur est une RÉFÉRENCE vers le nœud complet, ajouté au même graphe par
     scripts/build-blog.mjs. Recopier ses champs sur chaque article produirait
     autant d'entités que d'articles — l'inverse de ce qu'on veut. */
  author: { '@id': personId(post.author.slug) },
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
