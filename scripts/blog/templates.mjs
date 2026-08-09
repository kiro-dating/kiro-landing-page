/**
 * Gabarits HTML du blog.
 *
 * Chaque fonction renvoie une chaîne HTML complète et autonome : les pages du
 * blog sont servies telles quelles, sans JavaScript obligatoire. Le seul script
 * chargé (partage + recherche) est une amélioration progressive.
 *
 * L'entête et le pied de page reprennent volontairement le balisage et les
 * classes de `src/components/TopNav.jsx` et `src/components/Footer.jsx` afin
 * que le blog soit visuellement indistinguable du reste du site.
 */

import { BRAND, CONTACT_EMAIL, HELP, LANGS, PER_PAGE, SITE_URL, UI } from './config.mjs';
import { escapeHtml, joinUrl } from './utils.mjs';
import { abs, head, jsonLd } from './seo.mjs';

/* ── Fabriques d'URL ────────────────────────────────────────────────────── */

export const urls = (lang) => {
  const { base, segments } = LANGS[lang];
  return {
    index: (page = 1) => (page <= 1 ? joinUrl(base) : joinUrl(base, segments.page, page)),
    post: (slug) => joinUrl(base, slug),
    category: (slug, page = 1) =>
      page <= 1 ? joinUrl(base, segments.category, slug) : joinUrl(base, segments.category, slug, segments.page, page),
    tag: (slug, page = 1) =>
      page <= 1 ? joinUrl(base, segments.tag, slug) : joinUrl(base, segments.tag, slug, segments.page, page),
    author: (slug) => joinUrl(base, segments.author, slug),
    authors: () => joinUrl(base, segments.authors),
    /* Archives : /blog/2026/ et /blog/2026/08/. Le mois est toujours sur deux
       chiffres pour que les URLs se trient naturellement. */
    year: (y, page = 1) => (page <= 1 ? joinUrl(base, y) : joinUrl(base, y, segments.page, page)),
    month: (y, m, page = 1) =>
      page <= 1
        ? joinUrl(base, y, String(m).padStart(2, '0'))
        : joinUrl(base, y, String(m).padStart(2, '0'), segments.page, page),
    search: () => joinUrl(base, segments.search),
    rss: () => `${joinUrl(base)}rss.xml`,
    searchIndex: () => `${joinUrl(base)}search-index.json`,
  };
};

/* ── Fragments réutilisables ────────────────────────────────────────────── */

/** Liens de navigation, partagés par la barre desktop et le menu mobile. */
const navItems = (lang) => [
  { href: '/#concept', label: lang === 'fr' ? 'Découvrir' : 'Discover' },
  { href: '/#jeux', label: lang === 'fr' ? 'Les jeux' : 'Games' },
  { href: '/#abonnements', label: lang === 'fr' ? 'Abonnements' : 'Plans' },
  { href: urls(lang).index(), label: UI[lang].blog, isBlog: true },
];

const navLinks = (lang, { isBlogIndex = false } = {}) =>
  `
        <nav class="nav-center" aria-label="${lang === 'fr' ? 'Navigation principale' : 'Main navigation'}">
          ${navItems(lang)
            .map(
              (item) =>
                `<a href="${item.href}"${item.isBlog ? ` class="is-active"${isBlogIndex ? ' aria-current="page"' : ''}` : ''}>${escapeHtml(item.label)}</a>`,
            )
            .join('\n          ')}
        </nav>`;

/**
 * Menu mobile — un <details> natif, sans JavaScript.
 * En dessous de 720 px la barre horizontale ne tient pas ; sans ce menu, une
 * page du blog n'offrirait aucune navigation sur téléphone (le logo et la
 * recherche seuls), alors que l'essentiel du trafic viendra de là.
 */
const mobileMenu = (lang, { otherLangUrl = null } = {}) => {
  const t = UI[lang];
  const u = urls(lang);
  const label = lang === 'fr' ? 'Menu' : 'Menu';
  return `<details class="nav-menu">
          <summary aria-label="${label}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </summary>
          <nav class="nav-menu-panel" aria-label="${lang === 'fr' ? 'Navigation' : 'Navigation'}">
            ${navItems(lang)
              .map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`)
              .join('\n            ')}
            <a href="${u.search()}">${escapeHtml(t.search)}</a>
            ${otherLangUrl ? `<a href="${otherLangUrl}" hreflang="${LANGS[lang === 'fr' ? 'en' : 'fr'].locale}">${escapeHtml(t.otherLang)}</a>` : ''}
          </nav>
        </details>`;
};

const header = (lang, options = {}) => {
  const t = UI[lang];
  const u = urls(lang);
  return `<header class="top-nav scrolled blog-nav">
      <div class="top-nav-inner">
        <a class="nav-brand" href="/" aria-label="${BRAND}">
          <img src="/icons/kiro-symbol.svg" alt="${BRAND}" width="36" height="42" />
        </a>
        ${navLinks(lang, options)}
        <div class="nav-right">
          <a class="lang-toggle" href="${u.search()}" aria-label="${escapeHtml(t.searchTitle)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <span class="lang-toggle-label">${escapeHtml(t.search)}</span>
          </a>
          ${mobileMenu(lang, options)}
        </div>
      </div>
    </header>`;
};

/**
 * Pied de page.
 *
 * La colonne « Blog » liste des catégories RÉELLEMENT générées : on ne peut pas
 * y écrire une liste en dur, sinon un lien mort apparaîtrait le jour où une
 * catégorie se vide. `categories` vient donc du build.
 */
const footer = (lang, { otherLangUrl, categories = [] }) => {
  const t = UI[lang];
  const u = urls(lang);
  const year = new Date().getUTCFullYear();
  const legal =
    lang === 'fr'
      ? { terms: 'Conditions d’utilisation', privacy: 'Confidentialité', help: 'Centre d’aide', contact: 'Nous écrire' }
      : { terms: 'Terms of use', privacy: 'Privacy', help: 'Help centre', contact: 'Contact us' };

  return `<footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/icons/kiro-symbol.svg" alt="${BRAND}" width="40" height="46" loading="lazy" />
          <p>${escapeHtml(t.footerPitch)}</p>
        </div>
        <div class="footer-col">
          <h4>${escapeHtml(t.blog)}</h4>
          <ul>
            <li><a href="${u.index()}">${escapeHtml(t.allArticles)}</a></li>
            ${categories
              .map((c) => `<li><a href="${u.category(c.slug[lang])}">${escapeHtml(c.label[lang])}</a></li>`)
              .join('\n            ')}
            <li><a href="${u.authors()}">${escapeHtml(t.allAuthors)}</a></li>
            <li><a href="${u.search()}">${escapeHtml(t.search)}</a></li>
            <li><a href="${u.rss()}">RSS</a></li>
            ${otherLangUrl ? `<li><a href="${otherLangUrl}" hreflang="${LANGS[lang === 'fr' ? 'en' : 'fr'].locale}">${escapeHtml(t.otherLang)}</a></li>` : ''}
          </ul>
        </div>
        <div class="footer-col">
          <h4>Kiro</h4>
          <ul>
            <li><a href="/#concept">${lang === 'fr' ? 'Découvrir' : 'Discover'}</a></li>
            <li><a href="/#jeux">${lang === 'fr' ? 'Les jeux' : 'Games'}</a></li>
            <li><a href="/#abonnements">${lang === 'fr' ? 'Abonnements' : 'Plans'}</a></li>
            <li><a href="${HELP.support}" target="_blank" rel="noopener noreferrer">${escapeHtml(legal.help)}</a></li>
            <li><a href="mailto:${CONTACT_EMAIL}">${escapeHtml(legal.contact)}</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>${lang === 'fr' ? 'Légal' : 'Legal'}</h4>
          <ul>
            <li><a href="${HELP.terms}" target="_blank" rel="noopener noreferrer">${escapeHtml(legal.terms)}</a></li>
            <li><a href="${HELP.privacy}" target="_blank" rel="noopener noreferrer">${escapeHtml(legal.privacy)}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <span>© ${year} ${BRAND}. ${lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</span>
          <span>${SITE_URL.replace('https://', '')}</span>
        </div>
      </div>
    </footer>`;
};

/** Fil d'Ariane visible. `trail` = [{ name, path }] ; le dernier élément n'est pas un lien. */
const breadcrumb = (lang, trail) => {
  const t = UI[lang];
  const items = trail
    .map((item, i) => {
      const isLast = i === trail.length - 1;
      return isLast
        ? `<li aria-current="page"><span>${escapeHtml(item.name)}</span></li>`
        : `<li><a href="${item.path}">${escapeHtml(item.name)}</a></li>`;
    })
    .join('');
  /* `is-deep` = fil d'Ariane d'article (Accueil > Blog > Catégorie > Titre).
     Le dernier maillon y répète le H1 : on le masque visuellement sur mobile. */
  const deep = trail.length >= 4 ? ' is-deep' : '';
  return `<nav class="breadcrumb${deep}" aria-label="${escapeHtml(t.breadcrumbAria)}"><ol>${items}</ol></nav>`;
};

/** Carte d'article, utilisée par tous les index. */
const card = (post, lang, { featured = false } = {}) => {
  const t = UI[lang];
  const u = urls(lang);
  return `<article class="post-card${featured ? ' post-card-featured' : ''}">
        <a class="post-card-media" href="${post.url}" tabindex="-1" aria-hidden="true">
          ${featured ? `<span class="post-card-badge">${escapeHtml(t.featured)}</span>` : ''}
          ${
            post.cover
              ? `<img src="${escapeHtml(post.cover)}" alt="" loading="lazy" decoding="async" width="1200" height="630" />`
              : '<span class="post-card-placeholder"></span>'
          }
        </a>
        <div class="post-card-body">
          <a class="post-card-cat" href="${u.category(post.categorySlug)}">${escapeHtml(post.categoryLabel)}</a>
          <h3 class="post-card-title"><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
          <p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>
          <p class="post-card-meta">
            <time datetime="${post.publishedDay}">${escapeHtml(post.publishedLabel)}</time>
            <span aria-hidden="true">•</span>
            <span>${escapeHtml(post.readingLabel)}</span>
          </p>
        </div>
      </article>`;
};

/** Pagination indexable : de vraies URLs, jamais de défilement infini seul. */
const pagination = (lang, { current, total, hrefFor }) => {
  if (total <= 1) return '';
  const t = UI[lang];
  const pages = [];
  for (let i = 1; i <= total; i += 1) {
    const isEdge = i === 1 || i === total;
    const isNear = Math.abs(i - current) <= 1;
    if (isEdge || isNear) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return `<nav class="pagination" aria-label="${escapeHtml(t.paginationAria)}">
      ${current > 1 ? `<a class="pagination-arrow" rel="prev" href="${hrefFor(current - 1)}">${escapeHtml(t.previous)}</a>` : `<span class="pagination-arrow is-off">${escapeHtml(t.previous)}</span>`}
      <ul>
        ${pages
          .map((p) =>
            p === '…'
              ? '<li class="pagination-gap" aria-hidden="true">…</li>'
              : `<li>${p === current ? `<span class="is-current" aria-current="page">${p}</span>` : `<a href="${hrefFor(p)}">${p}</a>`}</li>`,
          )
          .join('')}
      </ul>
      ${current < total ? `<a class="pagination-arrow" rel="next" href="${hrefFor(current + 1)}">${escapeHtml(t.next)}</a>` : `<span class="pagination-arrow is-off">${escapeHtml(t.next)}</span>`}
      <p class="pagination-count">${escapeHtml(t.pageOf(current, total))}</p>
    </nav>`;
};

/** Bloc d'appel à l'action vers le produit. Un seul par page, après la valeur délivrée. */
const cta = (lang) => {
  const t = UI[lang];
  return `<aside class="blog-cta">
      <div class="blog-cta-inner">
        <p class="blog-cta-title">${escapeHtml(t.ctaTitle)}</p>
        <p class="blog-cta-text">${escapeHtml(t.ctaText)}</p>
        <a class="blog-cta-button" href="/#concept" data-kiro-cta="blog">${escapeHtml(t.ctaButton)}</a>
      </div>
    </aside>`;
};

/** Liste des catégories, présente sur tous les index (maillage interne). */
const categoryNav = (lang, categories, activeSlug = null) => {
  const t = UI[lang];
  const u = urls(lang);
  return `<nav class="cat-nav" aria-label="${escapeHtml(t.categories)}">
      <a href="${u.index()}"${activeSlug === null ? ' class="is-active" aria-current="page"' : ''}>${escapeHtml(t.allArticles)}</a>
      ${categories
        .map(
          (c) =>
            `<a href="${u.category(c.slug[lang])}"${c.slug[lang] === activeSlug ? ' class="is-active" aria-current="page"' : ''}>${escapeHtml(c.label[lang])}</a>`,
        )
        .join('')}
    </nav>`;
};

/* ── Enveloppe de page ──────────────────────────────────────────────────── */

/**
 * Document HTML complet.
 * `assets` = { css, js } — chemins versionnés produits par le build.
 */
export const layout = ({ lang, seo, schema, body, assets, bodyClass = '', otherLangUrl = null, isBlogIndex = false, categories = [] }) => {
  const conf = LANGS[lang];
  return `<!doctype html>
<html lang="${conf.locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/icon_kiro.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" />
    <link rel="stylesheet" href="${assets.css}" />
    ${seo}
    ${jsonLd(schema)}
  </head>
  <body class="blog-body ${bodyClass}">
    <a class="skip-link" href="#contenu">${lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>
    ${header(lang, { isBlogIndex, otherLangUrl })}
    <main id="contenu">
${body}
    </main>
    ${footer(lang, { otherLangUrl, categories })}
    <script src="${assets.js}" defer></script>
  </body>
</html>
`;
};

/* ── Fragments du redesign éditorial ────────────────────────────────────── */

/** Date courte « 8 août 2026 » → utilisée dans les listes compactes. */
const shortDate = (post) => post.publishedLabel;

/**
 * Barre de navigation secondaire : catégories, puis repères temporels, puis un
 * menu « … » discret qui contient tout le reste (années, mois, auteurs).
 * Le menu est un <details> natif : accessible au clavier, sans JavaScript.
 */
const browseBar = (lang, { categories, activeCategorySlug = null, archives = [], activeArchive = null }) => {
  const t = UI[lang];
  const u = urls(lang);
  /* Trois repères temporels au maximum dans la barre ; le reste va dans « … ». */
  const recentMonths = archives.flatMap((y) => y.months.map((m) => ({ ...m, year: y.year }))).slice(0, 3);

  return `<nav class="browse-bar" aria-label="${escapeHtml(t.browse)}">
        <div class="browse-scroll">
          <a href="${u.index()}"${activeCategorySlug === null && !activeArchive ? ' class="chip is-active" aria-current="page"' : ' class="chip"'}>${escapeHtml(t.allArticles)}</a>
          ${categories
            .map(
              (c) =>
                `<a href="${u.category(c.slug[lang])}" class="chip${c.slug[lang] === activeCategorySlug ? ' is-active' : ''}"${c.slug[lang] === activeCategorySlug ? ' aria-current="page"' : ''}>${escapeHtml(c.label[lang])}</a>`,
            )
            .join('')}
          ${
            recentMonths.length > 0
              ? `<span class="browse-sep" aria-hidden="true"></span>${recentMonths
                  .map(
                    (m) =>
                      `<a href="${u.month(m.year, m.month)}" class="chip chip-date${activeArchive === `${m.year}-${m.month}` ? ' is-active' : ''}">${escapeHtml(m.label)} ${m.year}</a>`,
                  )
                  .join('')}`
              : ''
          }
        </div>
        ${archivesMenu(lang, archives)}
      </nav>`;
};

/** Le menu « … » : archives complètes et auteurs, sans alourdir la barre. */
const archivesMenu = (lang, archives) => {
  const t = UI[lang];
  const u = urls(lang);
  if (archives.length === 0) return '';
  return `<details class="more-menu">
          <summary aria-label="${escapeHtml(t.moreOptions)}" title="${escapeHtml(t.moreOptions)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>
          </summary>
          <div class="more-menu-panel">
            <p class="more-menu-title">${escapeHtml(t.archives)}</p>
            ${archives
              .map(
                (y) => `<a class="more-menu-year" href="${u.year(y.year)}">${y.year} <span>${escapeHtml(t.articleCount(y.count))}</span></a>
            <div class="more-menu-months">${y.months
              .map((m) => `<a href="${u.month(y.year, m.month)}">${escapeHtml(m.label)}</a>`)
              .join('')}</div>`,
              )
              .join('')}
            <p class="more-menu-title">${escapeHtml(t.authors)}</p>
            <a class="more-menu-link" href="${u.authors()}">${escapeHtml(t.allAuthors)}</a>
            <a class="more-menu-link" href="${u.search()}">${escapeHtml(t.searchTitle)}</a>
          </div>
        </details>`;
};

/** Recherche dépliable : une loupe qui ouvre le champ. <details> natif. */
const searchToggle = (lang, indexUrl) => {
  const t = UI[lang];
  return `<details class="search-toggle">
          <summary aria-label="${escapeHtml(t.openSearch)}">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <span>${escapeHtml(t.search)}</span>
          </summary>
          <form class="blog-search blog-search-inline" role="search" data-search-index="${indexUrl}" novalidate>
            <label class="sr-only" for="q-inline">${escapeHtml(t.searchTitle)}</label>
            <input id="q-inline" name="q" type="search" autocomplete="off" placeholder="${escapeHtml(t.searchPlaceholder)}" />
            <button type="submit">${escapeHtml(t.search)}</button>
          </form>
          <p class="blog-search-status" data-search-status role="status"></p>
        </details>`;
};

/** Bloc éditorial de tête : image large à gauche, texte à droite. */
const featuredBlock = (post, lang) => {
  const t = UI[lang];
  const u = urls(lang);
  return `<article class="lead-post">
        <a class="lead-post-media" href="${post.url}" tabindex="-1" aria-hidden="true">
          ${
            post.cover
              ? `<picture>${post.coverVector ? `<source srcset="${escapeHtml(post.coverVector)}" type="image/svg+xml" />` : ''}<img src="${escapeHtml(post.cover)}" alt="" width="1200" height="630" fetchpriority="high" decoding="async" /></picture>`
              : '<span class="post-card-placeholder"></span>'
          }
          <span class="lead-post-badge">${escapeHtml(t.featuredEyebrow)}</span>
        </a>
        <div class="lead-post-body">
          <a class="post-card-cat" href="${u.category(post.categorySlug)}">${escapeHtml(post.categoryLabel)}</a>
          <h2 class="lead-post-title"><a href="${post.url}">${escapeHtml(post.title)}</a></h2>
          <p class="lead-post-excerpt">${escapeHtml(post.excerpt)}</p>
          <p class="lead-post-meta">
            <a href="${u.author(post.author.slug || post.author.key)}">${escapeHtml(post.author.name)}</a>
            <span aria-hidden="true">•</span><time datetime="${post.publishedIso}">${escapeHtml(shortDate(post))}</time>
            <span aria-hidden="true">•</span><span>${escapeHtml(post.readingLabel)}</span>
          </p>
        </div>
      </article>`;
};

/** Carte horizontale : vignette à gauche, texte à droite. Casse le rythme. */
const rowCard = (post, lang) => {
  const u = urls(lang);
  return `<article class="row-card">
        <a class="row-card-media" href="${post.url}" tabindex="-1" aria-hidden="true">
          ${post.cover ? `<img src="${escapeHtml(post.cover)}" alt="" width="1200" height="630" loading="lazy" decoding="async" />` : '<span class="post-card-placeholder"></span>'}
        </a>
        <div class="row-card-body">
          <a class="post-card-cat" href="${u.category(post.categorySlug)}">${escapeHtml(post.categoryLabel)}</a>
          <h3 class="row-card-title"><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
          <p class="row-card-excerpt">${escapeHtml(post.excerpt)}</p>
          <p class="post-card-meta"><time datetime="${post.publishedIso}">${escapeHtml(shortDate(post))}</time><span aria-hidden="true">•</span><span>${escapeHtml(post.readingLabel)}</span></p>
        </div>
      </article>`;
};

/** Élément de liste compacte pour la colonne latérale. */
const railItem = (post) => `<li class="rail-item">
          <a class="rail-item-media" href="${post.url}" tabindex="-1" aria-hidden="true">
            ${post.cover ? `<img src="${escapeHtml(post.cover)}" alt="" width="1200" height="630" loading="lazy" decoding="async" />` : '<span class="post-card-placeholder"></span>'}
          </a>
          <div>
            <time class="rail-item-date" datetime="${post.publishedIso}">${escapeHtml(shortDate(post))}</time>
            <a class="rail-item-title" href="${post.url}">${escapeHtml(post.title)}</a>
          </div>
        </li>`;

/** Colonne latérale : récents, archives, auteurs. Toujours utile, même à deux articles. */
const rail = (lang, { recent = [], archives = [], topics = [] }) => {
  const t = UI[lang];
  const u = urls(lang);
  return `<aside class="blog-rail">
        ${
          recent.length > 0
            ? `<section class="rail-block">
          <h2 class="rail-title">${escapeHtml(t.recentArticles)}</h2>
          <ul class="rail-list">${recent.map(railItem).join('')}</ul>
        </section>`
            : ''
        }
        ${
          archives.length > 0
            ? `<section class="rail-block">
          <h2 class="rail-title">${escapeHtml(t.archives)}</h2>
          <ul class="rail-archives">${archives
            .map(
              (y) =>
                `<li><a href="${u.year(y.year)}"><span>${y.year}</span><span class="rail-count">${escapeHtml(t.articleCount(y.count))}</span></a>
              <ul>${y.months.map((m) => `<li><a href="${u.month(y.year, m.month)}">${escapeHtml(m.label)}<span class="rail-badge">${m.count}</span></a></li>`).join('')}</ul></li>`,
            )
            .join('')}</ul>
        </section>`
            : ''
        }
        ${
          topics.length > 0
            ? `<section class="rail-block">
          <h2 class="rail-title">${escapeHtml(t.exploreTopics)}</h2>
          <ul class="rail-topics">${topics
            .map(
              (topic) =>
                `<li><a class="topic-pill" href="${u.tag(topic.key)}">${escapeHtml(topic.label)}<span class="topic-pill-count">${topic.count}</span></a></li>`,
            )
            .join('')}</ul>
        </section>`
            : ''
        }
      </aside>`;
};

/* ── Pages ──────────────────────────────────────────────────────────────── */

export const indexPage = ({
  lang,
  posts,
  page,
  totalPages,
  categories,
  assets,
  schema,
  alternates,
  otherLangUrl = null,
  archives = [],
  topics = [],
  indexUrl = '',
}) => {
  const t = UI[lang];
  const u = urls(lang);
  const isFirst = page === 1;
  const [lead, ...rest] = isFirst ? posts : [];
  const list = isFirst ? rest : posts;

  /* Rythme éditorial : la première carte suivante passe en horizontal, les
     autres en grille. Avec deux articles la page reste habitée ; avec vingt
     elle ne devient pas une liste plate. */
  const [firstRow, ...grid] = list;

  const seo = head({
    lang,
    title: isFirst ? t.metaTitleIndex : `${t.blogTitle} — ${t.pageOf(page, totalPages)} | ${BRAND}`,
    description: t.metaDescIndex,
    path: u.index(page),
    type: 'website',
    alternates,
    rss: u.rss(),
    rssTitle: t.blogTitle,
    prev: page > 1 ? u.index(page - 1) : null,
    next: page < totalPages ? u.index(page + 1) : null,
  });

  const body = `      <section class="blog-masthead">
        <div class="section-inner">
          ${breadcrumb(lang, [
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
          ])}
          <p class="section-eyebrow">${escapeHtml(t.blog)}</p>
          <h1 class="masthead-title">${escapeHtml(t.blogTitle)}</h1>
          <p class="masthead-tagline">${escapeHtml(t.blogTagline)}</p>
          ${indexUrl ? searchToggle(lang, indexUrl) : ''}
        </div>
      </section>

      <div class="section-inner">
        ${browseBar(lang, { categories, archives })}
      </div>

      ${
        isFirst && lead
          ? `<section class="blog-featured">
        <div class="section-inner">${featuredBlock(lead, lang)}</div>
      </section>`
          : ''
      }

      <section class="section blog-columns">
        <div class="section-inner blog-columns-inner">
          <div class="blog-main">
            ${posts.length === 0 ? `<p class="blog-empty">${escapeHtml(t.empty)}</p>` : ''}
            ${
              list.length > 0
                ? `<h2 class="stream-title">${escapeHtml(t.latest)}</h2>
            ${firstRow ? rowCard(firstRow, lang) : ''}
            ${grid.length > 0 ? `<div class="post-grid">${grid.map((p) => card(p, lang)).join('')}</div>` : ''}`
                : ''
            }
            ${pagination(lang, { current: page, total: totalPages, hrefFor: (n) => u.index(n) })}
          </div>
          ${rail(lang, { recent: isFirst ? [] : posts.slice(0, 4), archives, topics })}
        </div>
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-index', isBlogIndex: true, otherLangUrl, categories });
};

/**
 * Archive d'une année ou d'un mois.
 * Une page d'archive n'est jamais générée à vide : le build ne l'appelle que
 * pour les périodes qui contiennent réellement des articles.
 */
export const archivePage = ({
  lang,
  heading,
  title,
  description,
  path: pathname,
  posts,
  page,
  totalPages,
  hrefFor,
  categories,
  archives,
  assets,
  schema,
  activeArchive,
  siblings = '',
}) => {
  const t = UI[lang];
  const u = urls(lang);
  const [firstRow, ...grid] = posts;

  const seo = head({
    lang,
    title,
    description,
    path: pathname,
    type: 'website',
    prev: page > 1 ? hrefFor(page - 1) : null,
    next: page < totalPages ? hrefFor(page + 1) : null,
  });

  const body = `      <section class="blog-hero blog-hero-compact">
        <div class="section-inner">
          ${breadcrumb(lang, [
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
            { name: heading, path: pathname },
          ])}
          <p class="section-eyebrow">${escapeHtml(t.archives)}</p>
          <h1 class="section-title">${escapeHtml(heading)}</h1>
          ${siblings}
        </div>
      </section>

      <section class="section blog-columns">
        <div class="section-inner blog-columns-inner">
          <div class="blog-main">
            ${browseBar(lang, { categories, archives, activeArchive })}
            ${posts.length === 0 ? `<p class="blog-empty">${escapeHtml(t.empty)}</p>` : ''}
            <!-- Titre de niveau 2 non visible : les cartes sont des h3, il faut
                 un h2 entre elles et le h1 pour que la hiérarchie reste continue. -->
            <h2 class="sr-only">${escapeHtml(t.allArticles)}</h2>
            ${firstRow ? rowCard(firstRow, lang) : ''}
            ${grid.length > 0 ? `<div class="post-grid">${grid.map((p) => card(p, lang)).join('')}</div>` : ''}
            ${pagination(lang, { current: page, total: totalPages, hrefFor })}
          </div>
          ${rail(lang, { archives })}
        </div>
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-archive', categories });
};

/** Index des auteurs — générique, prévu pour plusieurs auteurs. */
export const authorsPage = ({ lang, authors, categories, assets, schema, alternates }) => {
  const t = UI[lang];
  const u = urls(lang);

  const seo = head({
    lang,
    title: `${t.authorsTitle} | ${BRAND}`,
    description: t.authorsMeta,
    path: u.authors(),
    type: 'website',
    alternates,
  });

  const body = `      <section class="blog-hero blog-hero-compact">
        <div class="section-inner">
          ${breadcrumb(lang, [
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
            { name: t.authors, path: u.authors() },
          ])}
          <p class="section-eyebrow">${escapeHtml(t.authors)}</p>
          <h1 class="section-title">${escapeHtml(t.authorsTitle)}</h1>
          <p class="section-desc">${escapeHtml(t.authorsMeta)}</p>
        </div>
      </section>

      <section class="section blog-listing">
        <div class="section-inner">
          <div class="author-grid">
            ${authors
              .map(
                (a) => `<article class="author-card">
              ${a.avatar ? `<img class="author-card-avatar" src="${escapeHtml(a.avatar)}" alt="" width="72" height="72" loading="lazy" />` : `<span class="author-card-avatar author-card-avatar-fallback" aria-hidden="true">${escapeHtml(a.name.trim().charAt(0))}</span>`}
              <div class="author-card-body">
                <h2 class="author-card-name"><a href="${u.author(a.slug)}">${escapeHtml(a.name)}</a></h2>
                ${a.jobTitle ? `<p class="author-card-role">${escapeHtml(a.jobTitle)}</p>` : ''}
                ${a.bio ? `<p class="author-card-bio">${escapeHtml(a.bio)}</p>` : ''}
                <p class="author-card-meta">
                  <span>${escapeHtml(t.articleCount(a.count))}</span>
                  ${a.topCategories.length > 0 ? `<span aria-hidden="true">•</span><span>${escapeHtml(t.writesAbout)} ${escapeHtml(a.topCategories.join(', '))}</span>` : ''}
                </p>
                <p class="author-card-links">
                  <a href="${u.author(a.slug)}">${escapeHtml(t.authorAllPosts(a.name))}</a>
                  ${a.url && /^https?:\/\//i.test(a.url) ? `<a href="${escapeHtml(a.url)}" rel="author noopener noreferrer" target="_blank">${escapeHtml(a.urlLabel || t.authorWebsite)}</a>` : ''}
                </p>
              </div>
            </article>`,
              )
              .join('')}
          </div>
        </div>
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-authors', categories });
};

export const listingPage = ({
  lang,
  kind, // 'category' | 'tag' | 'author'
  title,
  heading,
  description,
  path: pathname,
  posts,
  page,
  totalPages,
  categories,
  activeCategorySlug = null,
  assets,
  schema,
  alternates = [],
  hrefFor,
  extraHtml = '',
}) => {
  const t = UI[lang];
  const u = urls(lang);

  const seo = head({
    lang,
    title,
    description,
    path: pathname,
    type: 'website',
    alternates,
    prev: page > 1 ? hrefFor(page - 1) : null,
    next: page < totalPages ? hrefFor(page + 1) : null,
  });

  const trailLabel = { category: t.category, tag: t.tag, author: t.author }[kind];

  const body = `      <section class="blog-hero blog-hero-compact">
        <div class="section-inner">
          ${breadcrumb(lang, [
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
            { name: heading, path: pathname },
          ])}
          <p class="section-eyebrow">${escapeHtml(trailLabel)}</p>
          <h1 class="section-title">${escapeHtml(heading)}</h1>
          ${description ? `<p class="section-desc">${escapeHtml(description)}</p>` : ''}
          ${extraHtml}
        </div>
      </section>

      <section class="section blog-listing">
        <div class="section-inner">
          ${categoryNav(lang, categories, activeCategorySlug)}
          ${
            posts.length === 0
              ? `<p class="blog-empty">${escapeHtml(t.empty)}</p>`
              : `<div class="post-grid">${posts.map((p) => card(p, lang)).join('')}</div>`
          }
          ${pagination(lang, { current: page, total: totalPages, hrefFor })}
        </div>
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: `blog-listing-${kind}` });
};

export const articlePage = ({ lang, post, related, assets, schema, alternates, otherLangUrl }) => {
  const t = UI[lang];
  const u = urls(lang);

  const seo = head({
    lang,
    title: post.seoTitle || `${post.title} | ${BRAND}`,
    description: post.description,
    path: post.url,
    image: post.ogImage,
    imageAlt: post.coverAlt,
    type: 'article',
    noindex: post.noindex,
    canonical: post.canonicalOverride,
    alternates,
    rss: u.rss(),
    rssTitle: t.blogTitle,
  });

  const toc =
    post.toc.length >= 3
      ? `<nav class="post-toc" aria-label="${escapeHtml(t.inThisArticle)}">
            <p class="post-toc-title">${escapeHtml(t.inThisArticle)}</p>
            <ol>${post.toc
              .filter((h) => h.depth === 2)
              .map((h) => `<li><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`)
              .join('')}</ol>
          </nav>`
      : '';

  const faq =
    post.faq.length === 0
      ? ''
      : `<section class="post-faq" aria-labelledby="faq-title">
            <h2 id="faq-title">${escapeHtml(t.faqTitle)}</h2>
            ${post.faq
              .map(
                (entry) => `<details class="post-faq-item">
              <summary>${escapeHtml(entry.question)}</summary>
              <div class="post-faq-answer">${entry.answerHtml}</div>
            </details>`,
              )
              .join('')}
          </section>`;

  /* Encadré auteur : une seule source de vérité (content/blog/authors.json),
     reprise telle quelle ici et dans le JSON-LD. Rien n'est écrit en dur. */
  const author = post.author;
  const authorBox = `<aside class="post-author-box">
          <h2 class="post-author-box-title">${escapeHtml(t.aboutAuthor)}</h2>
          <div class="post-author-box-body">
            ${author.avatar ? `<img class="post-author-box-avatar" src="${escapeHtml(author.avatar)}" alt="" width="72" height="72" loading="lazy" decoding="async" />` : ''}
            <div>
              <p class="post-author-box-name">${escapeHtml(author.name)}</p>
              ${author.jobTitle ? `<p class="post-author-box-role">${escapeHtml(author.jobTitle)}</p>` : ''}
              ${author.bio ? `<p class="post-author-box-bio">${escapeHtml(author.bio)}</p>` : ''}
              <p class="post-author-box-links">
                <a href="${u.author(author.slug || author.key)}">${escapeHtml(t.authorAllPosts(author.name))}</a>
                ${
                  author.url && /^https?:\/\//i.test(author.url)
                    ? `<a href="${escapeHtml(author.url)}" rel="author noopener noreferrer" target="_blank">${escapeHtml(author.urlLabel || t.authorWebsite)}</a>`
                    : ''
                }
              </p>
            </div>
          </div>
        </aside>`;

  const shareUrl = abs(post.url);
  const share = `<div class="post-share" data-share-url="${escapeHtml(shareUrl)}" data-share-title="${escapeHtml(post.title)}" data-share-native-label="${escapeHtml(t.share)}">
          <span class="post-share-label">${escapeHtml(t.share)}</span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.shareOn('Facebook'))}">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.shareOn('X'))}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.5l-5.1-6.6L5.8 22H2.7l7.6-8.7L1.5 2h6.7l4.6 6.1zm-1.1 18h1.7L7.3 3.7H5.5z"/></svg>
          </a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.shareOn('WhatsApp'))}">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2m0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 0 1 12 3.8m4.7 10.3c-.3-.1-1.5-.8-1.7-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.6 11.4 11.4 0 0 0 4.4 3.9c1.6.6 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3"/></svg>
          </a>
          <button type="button" class="post-share-copy" data-copy-label="${escapeHtml(t.copyLink)}" data-copied-label="${escapeHtml(t.copied)}">${escapeHtml(t.copyLink)}</button>
        </div>`;

  const body = `      <article class="post">
        <header class="post-head">
          <div class="section-inner">
            ${breadcrumb(lang, [
              { name: t.home, path: '/' },
              { name: t.blog, path: u.index() },
              { name: post.categoryLabel, path: u.category(post.categorySlug) },
              { name: post.title, path: post.url },
            ])}
            <a class="post-cat" href="${u.category(post.categorySlug)}">${escapeHtml(post.categoryLabel)}</a>
            <h1 class="post-title">${escapeHtml(post.title)}</h1>
            <p class="post-lead">${escapeHtml(post.excerpt)}</p>
            <div class="post-byline">
              ${post.author.avatar ? `<img class="post-avatar" src="${escapeHtml(post.author.avatar)}" alt="" width="40" height="40" loading="lazy" />` : ''}
              <div>
                <p class="post-author">${escapeHtml(t.by)} <a href="${u.author(post.author.slug || post.author.key)}" rel="author">${escapeHtml(post.author.name)}</a>${post.author.jobTitle ? ` <span class="post-author-role">— ${escapeHtml(post.author.jobTitle)}</span>` : ''}</p>
                <p class="post-dates">
                  <time datetime="${post.publishedIso}">${escapeHtml(t.publishedOn)} ${escapeHtml(post.publishedLabel)}</time>
                  ${post.wasUpdated ? `<span aria-hidden="true">•</span> <time datetime="${post.updatedIso}">${escapeHtml(t.updatedOn)} ${escapeHtml(post.updatedLabel)}</time>` : ''}
                  <span aria-hidden="true">•</span> <span>${escapeHtml(post.readingLabel)}</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        ${
          post.cover
            ? `<figure class="post-cover">
          <picture>
            ${post.coverVector ? `<source srcset="${escapeHtml(post.coverVector)}" type="image/svg+xml" />` : ''}
            <img src="${escapeHtml(post.cover)}"${post.coverSrcset ? ` srcset="${escapeHtml(post.coverSrcset)}" sizes="(max-width: 1160px) 100vw, 1112px"` : ''} alt="${escapeHtml(post.coverAlt)}"${post.coverTitle ? ` title="${escapeHtml(post.coverTitle)}"` : ''} width="1200" height="630" fetchpriority="high" decoding="async" />
          </picture>
          ${
            post.coverCaption || post.coverCredit
              ? `<figcaption class="post-cover-caption">${post.coverCaption ? escapeHtml(post.coverCaption) : ''}${
                  post.coverCredit
                    ? `<span class="post-cover-credit">${escapeHtml(post.coverCredit)}</span>`
                    : ''
                }</figcaption>`
              : ''
          }
        </figure>`
            : ''
        }

        <div class="post-layout section-inner">
          <div class="post-main">
            ${toc}
            <div class="post-content">
${post.html}
            </div>
            ${faq}
            ${
              post.tagLabels.length > 0
                ? `<div class="post-tags"><span class="post-tags-label">${escapeHtml(t.tags)}</span>${post.tagLabels
                    .map((tag) => `<a href="${u.tag(tag.key)}">${escapeHtml(tag.label)}</a>`)
                    .join('')}</div>`
                : ''
            }
            ${share}
            ${authorBox}
          </div>
        </div>

        ${cta(lang)}

        ${
          related.length > 0
            ? `<section class="section related">
          <div class="section-inner">
            <h2 class="section-title">${escapeHtml(t.relatedTitle)}</h2>
            <div class="post-grid">${related.map((p) => card(p, lang)).join('')}</div>
            <p class="related-back"><a href="${u.index()}">${escapeHtml(t.backToBlog)}</a></p>
          </div>
        </section>`
            : ''
        }
      </article>`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-article', otherLangUrl });
};

export const searchPage = ({
  lang,
  categories,
  assets,
  schema,
  alternates,
  indexUrl,
  recent = [],
  topics = [],
  archives = [],
  suggestions = [],
}) => {
  const t = UI[lang];
  const u = urls(lang);

  const seo = head({
    lang,
    title: `${t.searchTitle} | ${BRAND}`,
    description: t.metaDescIndex,
    path: u.search(),
    alternates,
    noindex: true, // page d'outil : utile aux humains, sans intérêt pour l'index
  });

  const body = `      <section class="blog-hero blog-hero-compact">
        <div class="section-inner">
          ${breadcrumb(lang, [
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
            { name: t.search, path: u.search() },
          ])}
          <h1 class="section-title">${escapeHtml(t.searchTitle)}</h1>
          <p class="section-desc">${escapeHtml(t.searchIntro)}</p>
          <form class="blog-search" role="search" data-search-index="${indexUrl}" novalidate>
            <label class="sr-only" for="q">${escapeHtml(t.searchTitle)}</label>
            <input id="q" name="q" type="search" autocomplete="off" placeholder="${escapeHtml(t.searchPlaceholder)}" />
            <button type="submit">${escapeHtml(t.search)}</button>
          </form>
          <p class="blog-search-status" data-search-status role="status">${escapeHtml(t.searchPrompt)}</p>
          ${
            suggestions.length > 0
              ? `<p class="search-suggestions"><span>${escapeHtml(t.suggestions)}</span>${suggestions
                  .map((q) => `<a class="chip" href="${u.search()}?q=${encodeURIComponent(q)}">${escapeHtml(q)}</a>`)
                  .join('')}</p>`
              : ''
          }
        </div>
      </section>

      <section class="section blog-columns">
        <div class="section-inner blog-columns-inner">
          <div class="blog-main">
            ${browseBar(lang, { categories, archives })}
            <div class="post-grid" data-search-results></div>
            <!-- Avant toute recherche, la page reste utile : elle propose les
                 derniers articles plutôt qu'une zone vide. -->
            <div data-search-fallback>
              ${recent.length > 0 ? `<h2 class="stream-title">${escapeHtml(t.recentArticles)}</h2><div class="post-grid">${recent.map((p) => card(p, lang)).join('')}</div>` : ''}
            </div>
            <noscript><p class="blog-empty">${lang === 'fr' ? 'La recherche nécessite JavaScript. Parcours les catégories et les articles ci-dessus.' : 'Search requires JavaScript. Browse the categories and articles above.'}</p></noscript>
          </div>
          ${rail(lang, { archives, topics })}
        </div>
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-search-page', categories });
};


export const PER_PAGE_EXPORT = PER_PAGE;
