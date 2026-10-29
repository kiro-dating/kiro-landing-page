/**
 * Gabarits HTML du blog — identité « Kiro Solid » (refonte du 2026-10-29).
 *
 * Chaque fonction renvoie une chaîne HTML complète et autonome : les pages du
 * blog sont servies telles quelles, sans JavaScript obligatoire. Le seul script
 * chargé (menu, partage, progression de lecture, recherche) est une
 * amélioration progressive : sans lui, tout se lit et tout se navigue.
 *
 * Le blog a désormais son propre en-tête et son propre pied de page : il ne
 * recopie plus `TopNav.jsx` / `Footer.jsx` de la landing. Les deux surfaces
 * peuvent donc évoluer séparément (la landing sera refondue après la
 * publication de l'app).
 *
 * Contrat SEO : rien dans ce fichier ne produit le <head> SEO — il vient de
 * seo.mjs, inchangé. Seuls le corps des pages et la feuille de style évoluent.
 */

import { APP_CTA, BRAND, CONTACT_EMAIL, HELP, LANGS, PER_PAGE, UI } from './config.mjs';
import { escapeHtml, joinUrl } from './utils.mjs';
import { abs, head, jsonLd } from './seo.mjs';
import { insertInlineCta } from './inline-cta.mjs';

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
    /* Page de crédits photo. Ce n'est pas une page de confort : c'est la cible
       de `acquireLicensePage` dans les données structurées, donc une URL qui
       DOIT exister — le garde-fou anti-lien-mort la vérifie. */
    photoCredits: () => joinUrl(base, segments.photoCredits),
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

/* ── Icônes (SVG en ligne, trait de 2, décoratives) ─────────────────────── */

const svg = (size, body, extra = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;

const ICON = {
  search: (s = 18) => svg(s, '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  menu: (s = 20) => svg(s, '<path d="M4 7h16M4 12h16M4 17h16"/>', ' class="kb-icon-open"'),
  close: (s = 20) => svg(s, '<path d="M6 6l12 12M18 6 6 18"/>', ' class="kb-icon-close"'),
  arrowRight: (s = 18) => svg(s, '<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowLeft: (s = 20) => svg(s, '<path d="M19 12H5M11 18l-6-6 6-6"/>'),
  share: (s = 18) => svg(s, '<path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
  list: (s = 18) => svg(s, '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
  chevron: (s = 18) => svg(s, '<path d="m6 9 6 6 6-6"/>', ' class="kb-chevron"'),
  pin: (s = 18) => svg(s, '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
};

/* ── Fragments communs ──────────────────────────────────────────────────── */

const otherLangOf = (lang) => (lang === 'fr' ? 'en' : 'fr');

/** Initiales d'un auteur sans photo : « PH » ; une organisation affiche « K ». */
export const initialsOf = (author) => {
  if (!author || !author.name) return 'K';
  if (author.type === 'Organization') return BRAND.charAt(0);
  const letters = author.name
    .split(/\s+/)
    .filter((word) => /^\p{Lu}/u.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('');
  return letters || author.name.trim().charAt(0).toUpperCase();
};

const avatar = (author, size = 40) =>
  author.avatar
    ? `<img class="kb-avatar" src="${escapeHtml(author.avatar)}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async" />`
    : `<span class="kb-avatar" aria-hidden="true">${escapeHtml(initialsOf(author))}</span>`;

/** Bouton d'appel à l'action vers l'app — cible et libellé : APP_CTA (config.mjs). */
const appButton = (lang, { variant = 'red', placement, arrow = false, className = '' } = {}) =>
  `<a class="kb-btn kb-btn--${variant}${className ? ` ${className}` : ''}" href="${escapeHtml(APP_CTA.href)}" data-kiro-cta="${placement}">${escapeHtml(
    APP_CTA.label[lang],
  )}${arrow ? ICON.arrowRight() : ''}</a>`;

/** Marque : symbole rouge + logotype + pastille « BLOG ». Mène à l'accueil du blog. */
const brand = (lang, className = '') => {
  const t = UI[lang];
  return `<a class="kb-brand${className ? ` ${className}` : ''}" href="${urls(lang).index()}" aria-label="${escapeHtml(t.brandHome)}">
          <img class="kb-brand-symbol" src="/icons/kiro-symbol.svg" alt="" width="24" height="30" />
          <img class="kb-brand-wordmark" src="/images/kiro-wordmark.webp" alt="" width="50" height="20" />
          <span class="kb-brand-pill">${escapeHtml(t.blog.toUpperCase())}</span>
        </a>`;
};

/** Lien de langue : la traduction de la page si elle existe, sinon l'accueil du blog dans l'autre langue. */
const langLink = (lang, otherLangUrl, className = 'kb-pill-btn', { full = false } = {}) => {
  const t = UI[lang];
  const other = otherLangOf(lang);
  const href = otherLangUrl || urls(other).index();
  /* Pastille « EN » / « FR » dans l'en-tête ; libellé complet dans le menu.
     Le texte visible reste au début du nom accessible (WCAG 2.5.3, axe
     label-content-name-mismatch) : « EN Read the blog in English ». Le
     complément est rédigé dans la langue cible, comme l'annonce `lang`. */
  const label = full
    ? `<span>${escapeHtml(t.otherLang)}</span>`
    : `${escapeHtml(t.langShort)}<span class="sr-only"> ${escapeHtml(t.langSwitch)}</span>`;
  return `<a class="${className}" href="${href}" hreflang="${LANGS[other].locale}" lang="${LANGS[other].locale}">${label}</a>`;
};

/**
 * Menu mobile plein écran.
 *
 * Un <details> natif : il s'ouvre et se ferme sans JavaScript, au clavier
 * comme au doigt. blog.js ajoute ce qu'un menu modal doit faire en plus :
 * piéger le focus, se fermer avec Échap (focus rendu au bouton) et bloquer
 * le défilement de la page derrière.
 */
const mobileMenu = (lang, { categories = [], activeCategorySlug = null, otherLangUrl = null } = {}) => {
  const t = UI[lang];
  const u = urls(lang);
  return `<details class="kb-menu" data-kb-menu>
          <summary class="kb-icon-btn kb-icon-btn--dark" aria-label="${escapeHtml(t.menu)}">${ICON.menu()}${ICON.close()}</summary>
          <div class="kb-menu-panel">
            <nav class="kb-menu-nav" aria-label="${escapeHtml(t.menuTitle)}">
              <p class="kb-menu-label">${escapeHtml(t.sectionsNav)}</p>
              <ul class="kb-menu-list">
                <li><a href="${u.index()}">${escapeHtml(t.allArticles)}</a></li>
                ${categories
                  .map(
                    (c) =>
                      `<li><a href="${u.category(c.slug[lang])}"${c.slug[lang] === activeCategorySlug ? ' aria-current="page"' : ''}>${escapeHtml(c.label[lang])}</a></li>`,
                  )
                  .join('\n                ')}
              </ul>
              <ul class="kb-menu-list kb-menu-list--minor">
                <li><a href="${u.search()}">${escapeHtml(t.searchTitle)}</a></li>
                <li><a href="${u.authors()}">${escapeHtml(t.authors)}</a></li>
                <li><a href="${u.photoCredits()}">${escapeHtml(t.photoCredits)}</a></li>
                <li>${langLink(lang, otherLangUrl, 'kb-menu-lang', { full: true })}</li>
              </ul>
            </nav>
            ${appButton(lang, { placement: 'blog-menu', arrow: true, className: 'kb-btn--block' })}
          </div>
        </details>`;
};

/**
 * En-tête commun.
 *
 * `variant: 'article'` : sous 1024 px, l'en-tête devient compact — retour au
 * blog, titre, partage — et porte la barre de progression de lecture. Au-delà,
 * il reprend la navigation complète.
 */
const header = (lang, { variant = 'default', categories = [], activeCategorySlug = null, otherLangUrl = null, share = null } = {}) => {
  const t = UI[lang];
  const u = urls(lang);
  const isArticle = variant === 'article';
  const navCategories = categories.slice(0, 4);
  return `<header class="kb-header${isArticle ? ' kb-header--article' : ''}">
      <div class="kb-wrap kb-header-inner">
        ${
          isArticle
            ? `<a class="kb-icon-btn kb-icon-btn--soft kb-only-compact" href="${u.index()}" aria-label="${escapeHtml(t.backToBlogShort)}">${ICON.arrowLeft()}</a>
        <a class="kb-header-title kb-only-compact" href="${u.index()}">${escapeHtml(t.headerTitle)}</a>`
            : ''
        }
        ${brand(lang, isArticle ? 'kb-only-wide' : '')}
        ${
          navCategories.length > 0
            ? `<nav class="kb-nav" aria-label="${escapeHtml(t.sectionsNav)}">
          ${navCategories
            .map(
              (c) =>
                `<a href="${u.category(c.slug[lang])}"${c.slug[lang] === activeCategorySlug ? ' aria-current="page"' : ''}>${escapeHtml(c.label[lang])}</a>`,
            )
            .join('\n          ')}
        </nav>`
            : ''
        }
        <div class="kb-header-actions${isArticle ? ' kb-only-wide' : ''}">
          <a class="kb-icon-btn" href="${u.search()}" aria-label="${escapeHtml(t.searchTitle)}">${ICON.search()}</a>
          ${langLink(lang, otherLangUrl, 'kb-pill-btn kb-hide-narrow')}
          ${appButton(lang, { placement: 'blog-header', className: 'kb-hide-narrow' })}
          ${mobileMenu(lang, { categories, activeCategorySlug, otherLangUrl })}
        </div>
        ${
          isArticle && share
            ? `<button type="button" class="kb-icon-btn kb-icon-btn--soft kb-only-compact" data-kb-share data-share-url="${escapeHtml(share.url)}" data-share-title="${escapeHtml(share.title)}" data-copied-label="${escapeHtml(t.copied)}" aria-label="${escapeHtml(t.shareArticle)}" hidden>${ICON.share()}</button>`
            : ''
        }
      </div>
      ${isArticle ? '<div class="kb-progress" aria-hidden="true"><span class="kb-progress-bar" data-kb-progress></span></div>' : ''}
    </header>`;
};

/** Pied de page blanc et sobre. */
const footer = (lang) => {
  const t = UI[lang];
  const u = urls(lang);
  const year = new Date().getUTCFullYear();
  return `<footer class="kb-footer">
      <div class="kb-wrap kb-footer-inner">
        <p class="kb-footer-copy">© ${year} ${BRAND}</p>
        <nav class="kb-footer-nav" aria-label="${escapeHtml(t.resources)}">
          <a href="${HELP.support}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.helpCenter)}</a>
          <a href="${HELP.terms}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.terms)}</a>
          <a href="${HELP.privacy}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.privacy)}</a>
          <a href="${u.photoCredits()}">${escapeHtml(t.photoCredits)}</a>
          <a href="${u.authors()}">${escapeHtml(t.authors)}</a>
          <a href="${u.rss()}">RSS</a>
        </nav>
      </div>
    </footer>`;
};

/** Fil d'Ariane visible. `trail` = [{ name, path }] ; le dernier élément n'est pas un lien. */
const breadcrumb = (lang, trail, className = '') => {
  const t = UI[lang];
  const items = trail
    .map((item, i) =>
      i === trail.length - 1
        ? `<li aria-current="page">${escapeHtml(item.name)}</li>`
        : `<li><a href="${item.path}">${escapeHtml(item.name)}</a></li>`,
    )
    .join('');
  return `<nav class="kb-breadcrumb${className ? ` ${className}` : ''}" aria-label="${escapeHtml(t.breadcrumbAria)}"><ol>${items}</ol></nav>`;
};

/** Barre de puces : « Tous les articles » + catégories. Active = noir plein. */
const chipsNav = (lang, categories, activeSlug = null) => {
  const t = UI[lang];
  const u = urls(lang);
  const chip = (href, label, active) =>
    `<a class="kb-chip${active ? ' is-active' : ''}" href="${href}"${active ? ' aria-current="page"' : ''}>${escapeHtml(label)}</a>`;
  return `<nav class="kb-chips" aria-label="${escapeHtml(t.categories)}">
          <div class="kb-chips-track">
            ${chip(u.index(), t.allArticles, activeSlug === null)}
            ${categories.map((c) => chip(u.category(c.slug[lang]), c.label[lang], c.slug[lang] === activeSlug)).join('\n            ')}
          </div>
        </nav>`;
};

const coverImg = (post, { eager = false } = {}) =>
  post.cover
    ? `<img src="${escapeHtml(post.cover)}" alt="" width="1200" height="630" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`
    : '<span class="kb-placeholder"></span>';

/** Durée courte « 13 min » pour les cartes. */
const shortReading = (post, lang) => `${post.readingTime} ${UI[lang].minRead}`;

/**
 * Carte d'article. Le titre porte le seul lien ; il s'étend à toute la carte
 * (pseudo-élément), ce qui donne une grande cible tactile sans imbriquer de
 * liens ni répéter le nom du lien pour les lecteurs d'écran.
 */
const card = (post, lang, { level = 3 } = {}) => `<article class="kb-card">
          <div class="kb-card-media">${coverImg(post)}</div>
          <div class="kb-card-body">
            <p class="kb-eyebrow">${escapeHtml(post.categoryLabel)}</p>
            <h${level} class="kb-card-title"><a class="kb-stretched" href="${post.url}">${escapeHtml(post.title)}</a></h${level}>
            <p class="kb-card-meta"><time datetime="${post.publishedDay}">${escapeHtml(post.publishedLabel)}</time><span aria-hidden="true"> · </span><span>${escapeHtml(shortReading(post, lang))}</span></p>
          </div>
        </article>`;

const grid = (posts, lang) => `<div class="kb-grid">
        ${posts.map((p) => card(p, lang)).join('\n        ')}
      </div>`;

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
  return `<nav class="kb-pagination" aria-label="${escapeHtml(t.paginationAria)}">
      ${current > 1 ? `<a class="kb-pill-btn" rel="prev" href="${hrefFor(current - 1)}">${escapeHtml(t.previous)}</a>` : ''}
      <ul>
        ${pages
          .map((p) =>
            p === '…'
              ? '<li aria-hidden="true">…</li>'
              : `<li>${p === current ? `<span class="kb-page is-current" aria-current="page">${p}</span>` : `<a class="kb-page" href="${hrefFor(p)}">${p}</a>`}</li>`,
          )
          .join('')}
      </ul>
      ${current < total ? `<a class="kb-pill-btn" rel="next" href="${hrefFor(current + 1)}">${escapeHtml(t.next)}</a>` : ''}
      <p class="kb-pagination-count">${escapeHtml(t.pageOf(current, total))}</p>
    </nav>`;
};

/**
 * Bandeau application. Un seul appel à l'action par page en plus de l'en-tête :
 * sur un article qui porte déjà l'encart du milieu, ce bandeau n'est pas rendu.
 */
const cta = (lang) => {
  const t = UI[lang];
  return `<div class="kb-wrap kb-cta-wrap">
      <aside class="kb-cta" aria-label="${escapeHtml(BRAND)}">
        <div class="kb-cta-copy">
          <p class="kb-cta-title">${escapeHtml(t.ctaTitleStart)} <span>${escapeHtml(t.ctaTitleEnd)}</span></p>
          <p class="kb-cta-text">${escapeHtml(t.ctaText)}</p>
        </div>
        ${appButton(lang, { placement: 'blog', arrow: true, className: 'kb-btn--lg' })}
      </aside>
    </div>`;
};

/** Encart application du milieu d'article (voir inline-cta.mjs pour l'emplacement). */
export const inlineCta = (lang) => {
  const t = UI[lang];
  return `<aside class="kb-inline-cta" aria-label="${escapeHtml(BRAND)}">
              <p class="kb-inline-cta-title"><span class="kb-inline-cta-icon">${ICON.pin(18)}</span>${escapeHtml(t.inlineCtaTitle)}</p>
              <p class="kb-inline-cta-text">${escapeHtml(t.inlineCtaText)}</p>
              ${appButton(lang, { placement: 'blog-inline', className: 'kb-btn--block' })}
            </aside>`;
};

/** En-tête de page de liste (catégorie, tag, auteur, archives, crédits…). */
const pageHero = (lang, { trail, eyebrow = '', heading, description = '', extraHtml = '' }) => `<section class="kb-hero kb-hero--compact">
        <div class="kb-wrap">
          ${breadcrumb(lang, trail)}
          ${eyebrow ? `<p class="kb-eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
          <h1 class="kb-page-title">${escapeHtml(heading)}</h1>
          ${description ? `<p class="kb-page-desc">${escapeHtml(description)}</p>` : ''}
          ${extraHtml}
        </div>
      </section>`;

/* ── Identité de l'auteur ───────────────────────────────────────────────── */

/**
 * Libellé lisible d'un profil, déduit de son domaine.
 *
 * Évite d'avoir à saisir un libellé à côté de chaque URL dans authors.json :
 * ajouter un profil reste une seule ligne, et le lien s'affiche correctement.
 */
const PROFILE_LABELS = [
  [/(^|\.)linkedin\.com$/, 'LinkedIn'],
  [/(^|\.)github\.com$/, 'GitHub'],
  [/(^|\.)(x|twitter)\.com$/, 'X'],
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)youtube\.com$/, 'YouTube'],
  [/(^|\.)threads\.(net|com)$/, 'Threads'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)medium\.com$/, 'Medium'],
  [/(^|\.)dev\.to$/, 'DEV'],
  [/(^|\.)stackoverflow\.com$/, 'Stack Overflow'],
];

const profileLabel = (url) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const known = PROFILE_LABELS.find(([re]) => re.test(host));
    return known ? known[1] : host;
  } catch {
    return url;
  }
};

/**
 * Bloc d'identité affiché en tête d'une page d'auteur.
 *
 * Il porte les liens `rel="me"` vers les profils de la personne. Ce n'est pas
 * décoratif : `rel="me"` est la déclaration d'identité lisible par machine qui
 * double le `sameAs` du JSON-LD. Les deux disent la même chose par deux canaux
 * différents, et c'est ce qui permet à un moteur de rattacher une signature de
 * blog à un site personnel plutôt que de la confondre avec un homonyme.
 *
 * Le site personnel passe en premier — c'est la page qui fait autorité sur la
 * personne ; les autres profils suivent, dans l'ordre déclaré.
 */
export const authorProfile = (author, lang) => {
  const t = UI[lang];
  const primary = author.url && /^https?:\/\//i.test(author.url) ? author.url : null;
  const others = (author.sameAs || []).filter((url) => url !== primary);
  const links = [
    ...(primary ? [{ url: primary, label: author.urlLabel || profileLabel(primary) }] : []),
    ...others.map((url) => ({ url, label: profileLabel(url) })),
  ];
  /* Le métier n'est répété que s'il n'est pas déjà dans la bio affichée
     juste au-dessus. Sur une page d'auteur, une bio qui commence par « X est
     développeur… » suivie d'une ligne « Développeur… » se lit comme un bug de
     gabarit, pas comme une mise en avant. */
  const role =
    author.jobTitle && !(author.bio || '').toLowerCase().includes(author.jobTitle.toLowerCase())
      ? author.jobTitle
      : null;
  if (!role && links.length === 0) return '';

  return `<div class="author-profile">
            ${role ? `<p class="author-profile-role">${escapeHtml(role)}</p>` : ''}
            ${
              links.length > 0
                ? `<p class="author-profile-links"><span class="author-profile-label">${escapeHtml(
                    t.authorElsewhere,
                  )}</span>${links
                    .map(
                      ({ url, label }) =>
                        `<a href="${escapeHtml(url)}" rel="me noopener noreferrer" target="_blank">${escapeHtml(label)}</a>`,
                    )
                    .join('')}</p>`
                : ''
            }
          </div>`;
};

/* ── Photographies ──────────────────────────────────────────────────────── */

/**
 * Largeur d'affichage réelle d'une image dans le corps d'un article.
 *
 * Elle n'est pas décorative : c'est elle qui décide quelle dérivée le
 * navigateur télécharge. La colonne de lecture `.kb-article-main` est
 * plafonnée à 680 px (styles/blog.css, jeton --kiro-reading). Sous ce seuil,
 * l'image occupe la largeur de l'écran moins les marges (20 px de chaque côté).
 *
 * Si ces valeurs changent dans le CSS, elles doivent changer ici : une
 * annonce `sizes` fausse est invisible à l'œil et coûte de la bande passante à
 * chaque visite.
 */
const PHOTO_SIZES = '(max-width: 720px) calc(100vw - 40px), 680px';

/**
 * Figure d'une photographie du registre.
 *
 * Trois exigences tenues ensemble :
 *
 *   · AUCUN décalage de mise en page — `width`/`height` viennent du fichier
 *     réellement produit, donc le navigateur réserve la place avant l'octet
 *     d'image. C'est ce qui protège le Cumulative Layout Shift.
 *   · AVIF puis WebP puis JPEG, dans cet ordre : le premier format compris
 *     gagne, et le JPEG n'est chargé que par les navigateurs qui ne
 *     comprennent ni l'un ni l'autre.
 *   · Le crédit est VISIBLE, pas seulement dans les données structurées. Une
 *     licence qu'il faut lire le code source pour connaître n'est pas une
 *     licence exploitable par un lecteur.
 *
 * `overrides` permet à un article de remplacer le texte alternatif ou la
 * légende sans toucher au registre — cas particulier, pas usage courant.
 */
export const photoFigure = (photo, overrides = {}) => {
  const alt = overrides.alt ?? photo.alt;
  const caption = overrides.caption ?? photo.caption;
  const sources = photo.sources
    .map(
      ({ type, srcset }) =>
        `<source type="${type}" srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(PHOTO_SIZES)}" />`,
    )
    .join('');

  /* `rel="license"` est lu par les moteurs et par les extensions de
     réutilisation : c'est la déclaration lisible par machine qui double le
     JSON-LD, et les deux pointent la même URL par construction. */
  const credit =
    `<span class="post-figure-credit">Photo&nbsp;: ` +
    `<a href="${escapeHtml(photo.photographer.path)}">${escapeHtml(photo.photographer.name)}</a>` +
    ` — <a href="${escapeHtml(photo.license.deed)}" rel="license noopener" target="_blank">${escapeHtml(
      photo.license.label,
    )}</a></span>`;

  return `<figure class="post-figure post-photo">
          <picture>${sources}<img src="${escapeHtml(photo.src)}" alt="${escapeHtml(alt)}" width="${
            photo.width
          }" height="${photo.height}" loading="lazy" decoding="async" /></picture>
          <figcaption>${caption ? `<span class="post-figure-legend">${escapeHtml(caption)}</span>` : ''}${credit}</figcaption>
        </figure>`;
};

/**
 * Vercel Web Analytics.
 *
 * Les pages du blog sont du HTML statique : elles ne montent pas l'application
 * React, donc le composant <Analytics /> de src/App.jsx ne les couvre pas. On
 * charge ici le même script officiel, sur l'endpoint exact qu'injecte
 * @vercel/analytics (vérifié dans le paquet v2.0.1), servi par Vercel une fois
 * Web Analytics activé sur le projet.
 *
 * En local le script renvoie 404 : attendu, l'endpoint n'existe que sur Vercel.
 */
const ANALYTICS_TAG = '<script defer src="/_vercel/insights/script.js"></script>';

/**
 * Document HTML complet.
 * `assets` = { css, js } — chemins versionnés produits par le build.
 * Le <head> est inchangé par la refonte, à la feuille de style près.
 */
export const layout = ({
  lang,
  seo,
  schema,
  body,
  assets,
  bodyClass = '',
  otherLangUrl = null,
  categories = [],
  activeCategorySlug = null,
  headerVariant = 'default',
  share = null,
}) => {
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
    ${header(lang, { variant: headerVariant, categories, activeCategorySlug, otherLangUrl, share })}
    <main id="contenu">
${body}
    </main>
    ${footer(lang)}
    <script src="${assets.js}" defer></script>
    ${ANALYTICS_TAG}
  </body>
</html>
`;
};

/* ── Pages ──────────────────────────────────────────────────────────────── */

/** Carte « À la une » : image à gauche (1,25 fr), texte à droite ; empilée sur mobile. */
/* Pas de lien auteur dans la carte : toute la carte mène à l'article, une
   seule cible (C-B-12 : la zone tactile du nom débordait sur la date). La page
   auteur reste liée depuis l'article, « Les auteurs » et le pied de page. */
const featureCard = (post, lang) => {
  const t = UI[lang];
  return `<article class="kb-feature">
          <div class="kb-feature-media">
            ${
              post.cover
                ? `<picture>${post.coverVector ? `<source srcset="${escapeHtml(post.coverVector)}" type="image/svg+xml" />` : ''}<img src="${escapeHtml(post.cover)}" alt="" width="1200" height="630" fetchpriority="high" decoding="async" /></picture>`
                : '<span class="kb-placeholder"></span>'
            }
          </div>
          <div class="kb-feature-body">
            <p class="kb-feature-tags"><span class="kb-badge">${escapeHtml(t.featuredEyebrow)}</span><span class="kb-eyebrow">${escapeHtml(post.categoryLabel)}</span></p>
            <h2 class="kb-feature-title"><a class="kb-stretched" href="${post.url}">${escapeHtml(post.title)}</a></h2>
            <p class="kb-feature-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="kb-byline">
              ${avatar(post.author)}
              <div>
                <p class="kb-byline-name">${escapeHtml(post.author.name)}</p>
                <p class="kb-byline-meta"><time datetime="${post.publishedIso}">${escapeHtml(post.publishedLabel)}</time><span aria-hidden="true"> · </span><span>${escapeHtml(post.readingLabel)}</span></p>
              </div>
            </div>
          </div>
        </article>`;
};

/** « Explorer par sujet » : nuage de puces avec compteur. */
const topicsCard = (lang, topics) => {
  if (topics.length === 0) return '';
  const t = UI[lang];
  const u = urls(lang);
  return `<section class="kb-wrap kb-section" aria-labelledby="kb-topics-title">
        <div class="kb-panel">
          <h2 class="kb-panel-title" id="kb-topics-title">${escapeHtml(t.exploreTopics)}</h2>
          <ul class="kb-topics">
            ${topics
              .map(
                (topic) =>
                  `<li><a class="kb-chip kb-chip--soft" href="${u.tag(topic.key)}">${escapeHtml(topic.label)}<span class="kb-chip-count">${topic.count}</span></a></li>`,
              )
              .join('\n            ')}
          </ul>
        </div>
      </section>`;
};

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
}) => {
  const t = UI[lang];
  const u = urls(lang);
  const isFirst = page === 1;
  const [lead, ...rest] = isFirst ? posts : [];
  const list = isFirst ? rest : posts;
  const latestYear = archives[0]?.year;
  const archivesLink = latestYear
    ? `<a class="kb-link-arrow" href="${u.year(latestYear)}">${escapeHtml(t.archivesOf(latestYear))}${ICON.arrowRight(16)}</a>`
    : '';

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

  const body = `      <section class="kb-hero">
        <div class="kb-wrap kb-hero-split">
          <div class="kb-hero-main">
            ${breadcrumb(lang, [
              { name: t.home, path: '/' },
              { name: t.blog, path: u.index() },
            ])}
            <h1 class="kb-display">${escapeHtml(t.heroTitleStart)} <span class="kb-accent">${escapeHtml(t.heroTitleEnd)}</span></h1>
          </div>
          <p class="kb-hero-lead">${escapeHtml(t.heroLead)}${isFirst ? '' : ` <span class="kb-hero-page">${escapeHtml(t.pageOf(page, totalPages))}</span>`}</p>
        </div>
      </section>

      <div class="kb-wrap">
        ${chipsNav(lang, categories)}
      </div>

      ${
        isFirst && lead
          ? `<section class="kb-wrap" aria-label="${escapeHtml(t.featuredEyebrow)}">
        ${featureCard(lead, lang)}
      </section>`
          : ''
      }

      <section class="kb-wrap kb-section${list.length > 0 ? '' : ' kb-section--tight'}" aria-labelledby="kb-latest-title">
        ${posts.length === 0 ? `<p class="kb-empty">${escapeHtml(t.empty)}</p>` : ''}
        ${
          list.length > 0
            ? `<div class="kb-section-head">
          <h2 class="kb-section-title" id="kb-latest-title">${escapeHtml(t.latest)}</h2>
          ${archivesLink}
        </div>`
            : latestYear
              ? /* Un seul article (la une) : pas de titre « Derniers articles »
                   au-dessus d'une liste vide, mais l'accès aux archives reste. */
                `<h2 class="sr-only" id="kb-latest-title">${escapeHtml(t.archives)}</h2>
        <p class="kb-archives-only">${archivesLink}</p>`
              : ''
        }
        ${list.length > 0 ? grid(list, lang) : ''}
        ${pagination(lang, { current: page, total: totalPages, hrefFor: (n) => u.index(n) })}
      </section>

      ${topicsCard(lang, topics)}

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-index', otherLangUrl, categories });
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
  archives = [],
  assets,
  schema,
  siblings = '',
}) => {
  const t = UI[lang];
  const u = urls(lang);

  const seo = head({
    lang,
    title,
    description,
    path: pathname,
    type: 'website',
    prev: page > 1 ? hrefFor(page - 1) : null,
    next: page < totalPages ? hrefFor(page + 1) : null,
  });

  /* Toutes les années, pour circuler d'une archive à l'autre. */
  const years =
    archives.length > 1
      ? `<nav class="kb-archive-years" aria-label="${escapeHtml(t.archivesAll)}">${archives
          .map((y) => `<a class="kb-chip" href="${u.year(y.year)}">${y.year}</a>`)
          .join('')}</nav>`
      : '';

  const body = `      ${pageHero(lang, {
    trail: [
      { name: t.home, path: '/' },
      { name: t.blog, path: u.index() },
      { name: heading, path: pathname },
    ],
    eyebrow: t.archives,
    heading,
    extraHtml: `${siblings}${years}`,
  })}

      <section class="kb-wrap kb-section kb-section--tight">
        ${posts.length === 0 ? `<p class="kb-empty">${escapeHtml(t.empty)}</p>` : ''}
        <h2 class="sr-only">${escapeHtml(t.allArticles)}</h2>
        ${posts.length > 0 ? grid(posts, lang) : ''}
        ${pagination(lang, { current: page, total: totalPages, hrefFor })}
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

  const body = `      ${pageHero(lang, {
    trail: [
      { name: t.home, path: '/' },
      { name: t.blog, path: u.index() },
      { name: t.authors, path: u.authors() },
    ],
    eyebrow: t.authors,
    heading: t.authorsTitle,
    description: t.authorsMeta,
  })}

      <section class="kb-wrap kb-section kb-section--tight">
        <div class="kb-author-grid">
          ${authors
            .map(
              (a) => `<article class="kb-author-card">
            ${avatar(a, 64).replace('kb-avatar', 'kb-avatar kb-avatar--lg')}
            <div class="kb-author-card-body">
              <h2 class="kb-author-card-name"><a href="${u.author(a.slug)}">${escapeHtml(a.name)}</a></h2>
              ${a.jobTitle ? `<p class="kb-author-card-role">${escapeHtml(a.jobTitle)}</p>` : ''}
              ${a.bio ? `<p class="kb-author-card-bio">${escapeHtml(a.bio)}</p>` : ''}
              <p class="kb-author-card-meta">
                <span>${escapeHtml(t.articleCount(a.count))}</span>
                ${a.topCategories.length > 0 ? `<span aria-hidden="true"> · </span><span>${escapeHtml(t.writesAbout)} ${escapeHtml(a.topCategories.join(', '))}</span>` : ''}
              </p>
              <p class="kb-author-card-links">
                <a href="${u.author(a.slug)}">${escapeHtml(t.authorAllPosts(a.name))}</a>
                ${a.url && /^https?:\/\//i.test(a.url) ? `<a href="${escapeHtml(a.url)}" rel="author me noopener noreferrer" target="_blank">${escapeHtml(a.urlLabel || t.authorWebsite)}</a>` : ''}
              </p>
            </div>
          </article>`,
            )
            .join('\n          ')}
        </div>
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-authors', categories });
};

/**
 * Crédits et licence des photographies.
 *
 * Cette page n'est pas une politesse : c'est la cible de `acquireLicensePage`
 * dans les données structurées de chaque photo. Google exige qu'un lecteur
 * puisse y apprendre à quelles conditions réutiliser l'image ; sans elle, la
 * déclaration de licence est incomplète et le crédit n'apparaît nulle part.
 */
export const photoCreditsPage = ({ lang, photos, posts, categories, assets, schema, alternates }) => {
  const t = UI[lang];
  const u = urls(lang);
  /* Le registre ne connaît que des slugs. On affiche le VRAI titre de
     l'article : un slug transformé en phrase se lit mal et n'a aucune valeur
     de lien interne. */
  const titleOf = new Map(posts.map((post) => [post.slug, post.title]));

  const seo = head({
    lang,
    title: `${t.photoCreditsTitle} | ${BRAND}`,
    description: t.photoCreditsMeta,
    path: u.photoCredits(),
    type: 'website',
    alternates,
  });

  /* Les licences réellement utilisées, sans doublon. */
  const licenses = [...new Map(photos.map((p) => [p.license.id, p.license])).values()];

  const attribution = (photo) =>
    `${photo.photographer.name} — ${photo.place} — ${photo.license.label}`;

  const creditCard = (photo) => {
    const smallest = photo.widths[0];
    const base = photo.src.replace(/\.jpg$/, '');
    /* « Publiée dans » ne liste que des articles qui existent dans la langue
       de la page : un lien vers une page absente serait un lien mort. */
    const published = photo.articles.some((slug) => titleOf.has(slug));
    return `<article class="kb-credit">
            <a class="kb-credit-thumb" href="${escapeHtml(photo.src)}">
              <picture>
                <source type="image/avif" srcset="${escapeHtml(`${base}-${smallest}.avif`)}" />
                <source type="image/webp" srcset="${escapeHtml(`${base}-${smallest}.webp`)}" />
                <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async" />
              </picture>
            </a>
            <div class="kb-credit-body">
              <h2 class="kb-credit-place">${escapeHtml(photo.place)}</h2>
              <dl class="kb-credit-meta">
                <dt>${escapeHtml(t.photoCreditsPhotographer)}</dt>
                <dd><a href="${escapeHtml(photo.photographer.path)}">${escapeHtml(photo.photographer.name)}</a></dd>
                <dt>${escapeHtml(t.photoCreditsLicense)}</dt>
                <dd><a href="${escapeHtml(photo.license.deed)}" rel="license noopener" target="_blank">${escapeHtml(photo.license.label)}</a> — ${escapeHtml(photo.license.short)}</dd>
                <dt>${escapeHtml(t.photoCreditsSeenIn)}</dt>
                <dd>${
                  published
                    ? photo.articles
                        .filter((slug) => titleOf.has(slug))
                        .map((slug) => `<a href="${u.post(slug)}">${escapeHtml(titleOf.get(slug))}</a>`)
                        .join(', ')
                    : `<span class="kb-muted">${escapeHtml(t.photoCreditsUnused)}</span>`
                }</dd>
              </dl>
              <p class="kb-credit-attribution"><code>${escapeHtml(attribution(photo))}</code></p>
            </div>
          </article>`;
  };

  const body = `      ${pageHero(lang, {
    trail: [
      { name: t.home, path: '/' },
      { name: t.blog, path: u.index() },
      { name: t.photoCredits, path: u.photoCredits() },
    ],
    eyebrow: t.photoCredits,
    heading: t.photoCreditsTitle,
    description: t.photoCreditsIntro,
  })}

      <section class="kb-wrap kb-section kb-section--tight">
        <div class="kb-panel kb-license">
          <h2 class="kb-panel-title">${escapeHtml(t.photoCreditsHowTo)}</h2>
          ${licenses
            .map(
              (l) => `<p><a href="${escapeHtml(l.deed)}" rel="license noopener" target="_blank"><strong>${escapeHtml(l.label)}</strong></a> — ${escapeHtml(l.summary)}</p>`,
            )
            .join('')}
          <p class="kb-muted">${escapeHtml(
            lang === 'fr'
              ? 'Reprenez la ligne d’attribution indiquée sous chaque photographie. Pour un usage commercial, écrivez-nous.'
              : 'Reuse the attribution line shown under each photograph. For commercial use, get in touch.',
          )} <a href="mailto:${CONTACT_EMAIL}">${escapeHtml(CONTACT_EMAIL)}</a></p>
        </div>

        <p class="kb-count">${escapeHtml(t.photoCreditsCount(photos.length))}</p>

        <div class="kb-credit-list">
          ${photos.map(creditCard).join('\n          ')}
        </div>
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-photo-credits', categories });
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

  const body = `      ${pageHero(lang, {
    trail: [
      { name: t.home, path: '/' },
      { name: t.blog, path: u.index() },
      { name: heading, path: pathname },
    ],
    eyebrow: trailLabel,
    heading,
    description,
    extraHtml,
  })}

      <div class="kb-wrap">
        ${chipsNav(lang, categories, activeCategorySlug)}
      </div>

      <section class="kb-wrap kb-section kb-section--tight">
        <h2 class="sr-only">${escapeHtml(t.allArticles)}</h2>
        ${posts.length === 0 ? `<p class="kb-empty">${escapeHtml(t.empty)}</p>` : grid(posts, lang)}
        ${pagination(lang, { current: page, total: totalPages, hrefFor })}
      </section>

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: `blog-listing-${kind}`, categories, activeCategorySlug });
};

/** Largeur d'affichage réelle de la couverture : colonne de l'article (≤ 984 px). */
const COVER_SIZES = '(max-width: 1048px) 100vw, 984px';

/** Article relié, en liste compacte (vignette + titre + durée). */
const relatedItem = (post, lang) => `<li class="kb-related-item">
              <div class="kb-related-media">${coverImg(post)}</div>
              <div>
                <p class="kb-eyebrow">${escapeHtml(post.categoryLabel)}</p>
                <h3 class="kb-related-title"><a class="kb-stretched" href="${post.url}">${escapeHtml(post.title)}</a></h3>
                <p class="kb-card-meta">${escapeHtml(shortReading(post, lang))}</p>
              </div>
            </li>`;

export const articlePage = ({ lang, post, related, assets, schema, alternates, otherLangUrl, categories = [] }) => {
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

  /* Sommaire : mêmes conditions et mêmes ancres qu'avant la refonte (H2 du
     texte, dès trois intertitres). Deux présentations du même contenu : un
     <details> repliable sous 1024 px, une colonne collante au-delà. Une seule
     est affichée à la fois (display:none retire l'autre de l'arbre
     d'accessibilité). */
  const tocItems = post.toc.filter((h) => h.depth === 2);
  const hasToc = post.toc.length >= 3 && tocItems.length > 0;
  const tocList = `<ol class="kb-toc-list">${tocItems
    .map((h) => `<li><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`)
    .join('')}</ol>`;
  const tocMobile = hasToc
    ? `<details class="kb-toc-mobile">
              <summary><span class="kb-toc-summary">${ICON.list()}${escapeHtml(t.tocSections(tocItems.length))}</span>${ICON.chevron()}</summary>
              <nav aria-label="${escapeHtml(t.toc)}">${tocList}</nav>
            </details>`
    : '';
  const tocSide = hasToc
    ? /* Simple conteneur de mise en page, pas un <aside> : un repère
         « complémentaire » imbriqué dans <article> est signalé par axe
         (landmark-complementary-is-top-level). La sémantique utile est
         portée par le <nav> étiqueté. */
      `<div class="kb-toc-side">
            <nav aria-label="${escapeHtml(t.toc)}">
              <p class="kb-toc-title">${escapeHtml(t.toc)}</p>
              ${tocList}
            </nav>
          </div>`
    : '';

  /* Encart application au fil du texte : un seul, vers 40 %. S'il trouve sa
     place, le bandeau du bas n'est pas rendu (un seul appel à l'action par
     article, en plus de l'en-tête). */
  const { html: contentHtml, inserted: hasInlineCta } = insertInlineCta(post.html, inlineCta(lang));

  const faq =
    post.faq.length === 0
      ? ''
      : `<section class="kb-faq" aria-labelledby="faq-title">
            <h2 id="faq-title" class="kb-block-title">${escapeHtml(t.faqTitle)}</h2>
            ${post.faq
              .map(
                (entry) => `<details class="kb-faq-item">
              <summary><span>${escapeHtml(entry.question)}</span><span class="kb-faq-icon" aria-hidden="true"></span></summary>
              <div class="kb-faq-answer">${entry.answerHtml}</div>
            </details>`,
              )
              .join('\n            ')}
          </section>`;

  /* Encadré auteur : une seule source de vérité (content/blog/authors.json). */
  const author = post.author;
  const authorBox = `<aside class="kb-author-box" aria-labelledby="kb-author-title">
            <h2 class="kb-block-title" id="kb-author-title">${escapeHtml(t.aboutAuthor)}</h2>
            <div class="kb-author-box-body">
              ${avatar(author, 56).replace('kb-avatar', 'kb-avatar kb-avatar--md')}
              <div>
                <p class="kb-author-box-name">${escapeHtml(author.name)}</p>
                ${author.jobTitle ? `<p class="kb-author-box-role">${escapeHtml(author.jobTitle)}</p>` : ''}
                ${author.bio ? `<p class="kb-author-box-bio">${escapeHtml(author.bio)}</p>` : ''}
                <p class="kb-author-box-links">
                  <a href="${u.author(author.slug || author.key)}">${escapeHtml(t.authorAllPosts(author.name))}</a>
                  ${
                    author.url && /^https?:\/\//i.test(author.url)
                      ? `<a href="${escapeHtml(author.url)}" rel="author me noopener noreferrer" target="_blank">${escapeHtml(author.urlLabel || t.authorWebsite)}</a>`
                      : ''
                  }
                </p>
              </div>
            </div>
          </aside>`;

  const shareUrl = abs(post.url);
  const share = `<div class="kb-share" data-share-url="${escapeHtml(shareUrl)}" data-share-title="${escapeHtml(post.title)}">
            <span class="kb-share-label">${escapeHtml(t.share)}</span>
            <a class="kb-icon-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.shareOn('Facebook'))}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a class="kb-icon-btn" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.shareOn('X'))}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.5l-5.1-6.6L5.8 22H2.7l7.6-8.7L1.5 2h6.7l4.6 6.1zm-1.1 18h1.7L7.3 3.7H5.5z"/></svg>
            </a>
            <a class="kb-icon-btn" href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.shareOn('WhatsApp'))}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2m0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 0 1 12 3.8m4.7 10.3c-.3-.1-1.5-.8-1.7-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.6 11.4 11.4 0 0 0 4.4 3.9c1.6.6 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3"/></svg>
            </a>
            <button type="button" class="kb-pill-btn kb-share-copy" data-copy-label="${escapeHtml(t.copyLink)}" data-copied-label="${escapeHtml(t.copied)}" hidden>${escapeHtml(t.copyLink)}</button>
          </div>`;

  const cover = post.cover
    ? `<figure class="kb-cover${post.coverPhoto ? ' kb-cover--photo' : ''}">
            <picture>
              ${(post.coverSources || [])
                .filter((source) => source.srcset)
                .map(
                  (source) =>
                    `<source type="${source.type}" srcset="${escapeHtml(source.srcset)}"${
                      source.type === 'image/svg+xml' ? '' : ` sizes="${COVER_SIZES}"`
                    } />`,
                )
                .join('\n              ')}
              <img src="${escapeHtml(post.cover)}"${post.coverSrcset ? ` srcset="${escapeHtml(post.coverSrcset)}" sizes="${COVER_SIZES}"` : ''} alt="${escapeHtml(post.coverAlt)}"${post.coverTitle ? ` title="${escapeHtml(post.coverTitle)}"` : ''} width="1200" height="630" fetchpriority="high" decoding="async" />
            </picture>
            ${
              post.coverCaption || post.coverCredit || post.coverPhoto
                ? `<figcaption class="kb-cover-caption">${post.coverCaption ? escapeHtml(post.coverCaption) : ''}${
                    post.coverPhoto
                      ? /* Couverture photographique : le crédit est cliquable,
                           comme sous les photos du corps. */
                        `<span class="kb-cover-credit">Photo&nbsp;: <a href="${escapeHtml(
                          post.coverPhoto.photographer.path,
                        )}">${escapeHtml(post.coverPhoto.photographer.name)}</a> — <a href="${escapeHtml(
                          post.coverPhoto.license.deed,
                        )}" rel="license noopener" target="_blank">${escapeHtml(post.coverPhoto.license.label)}</a></span>`
                      : post.coverCredit
                        ? `<span class="kb-cover-credit">${escapeHtml(post.coverCredit)}</span>`
                        : ''
                  }</figcaption>`
                : ''
            }
          </figure>`
    : '';

  const otherLang = otherLangOf(lang);

  const body = `      <article class="kb-article">
        <div class="kb-wrap kb-article-grid${hasToc ? '' : ' kb-article-grid--single'}">
          <header class="kb-article-head">
            ${breadcrumb(
              lang,
              [
                { name: t.home, path: '/' },
                { name: t.blog, path: u.index() },
                { name: post.categoryLabel, path: u.category(post.categorySlug) },
                { name: post.title, path: post.url },
              ],
              'kb-breadcrumb--article',
            )}
            <a class="kb-eyebrow kb-eyebrow-link" href="${u.category(post.categorySlug)}">${escapeHtml(post.categoryLabel)}</a>
            <h1 class="kb-article-title">${escapeHtml(post.title)}</h1>
            <p class="kb-article-lead">${escapeHtml(post.excerpt)}</p>
            <div class="kb-byline">
              ${avatar(post.author)}
              <div>
                <p class="kb-byline-name">${escapeHtml(t.by)} <a href="${u.author(post.author.slug || post.author.key)}" rel="author">${escapeHtml(post.author.name)}</a>${post.author.jobTitle ? ` <span class="kb-byline-role">— ${escapeHtml(post.author.jobTitle)}</span>` : ''}</p>
                <p class="kb-byline-meta">
                  <time datetime="${post.publishedIso}">${escapeHtml(post.publishedLabel)}</time>
                  ${post.wasUpdated ? `<span aria-hidden="true">·</span> <time datetime="${post.updatedIso}">${escapeHtml(t.updatedOn)} ${escapeHtml(post.updatedLabel)}</time>` : ''}
                  <span aria-hidden="true">·</span> <span>${escapeHtml(post.readingLabel)}</span>
                  ${otherLangUrl ? `<span aria-hidden="true">·</span> <a href="${otherLangUrl}" hreflang="${LANGS[otherLang].locale}" lang="${LANGS[otherLang].locale}">${escapeHtml(t.otherLang)}</a>` : ''}
                </p>
              </div>
            </div>
          </header>

          ${cover}

          ${tocSide}

          <div class="kb-article-main">
            ${tocMobile}
            <div class="kb-prose post-content">
${contentHtml}
            </div>
            ${faq}
            ${
              post.tagLabels.length > 0
                ? `<div class="kb-tags"><span class="kb-tags-label">${escapeHtml(t.tags)}</span>${post.tagLabels
                    .map((tag) => `<a class="kb-chip kb-chip--sm" href="${u.tag(tag.key)}">${escapeHtml(tag.label)}</a>`)
                    .join('')}</div>`
                : ''
            }
            ${share}
            ${authorBox}
            ${
              related.length > 0
                ? `<section class="kb-related" aria-labelledby="kb-related-title">
            <h2 class="kb-block-title" id="kb-related-title">${escapeHtml(t.relatedTitle)}</h2>
            <ul class="kb-related-list">
            ${related.map((p) => relatedItem(p, lang)).join('\n            ')}
            </ul>
            <p class="kb-related-back"><a class="kb-link-arrow" href="${u.index()}">${escapeHtml(t.backToBlogShort)}${ICON.arrowRight(16)}</a></p>
          </section>`
                : ''
            }
          </div>
        </div>

        ${hasInlineCta ? '' : cta(lang)}
      </article>`;

  return layout({
    lang,
    seo,
    schema,
    body,
    assets,
    bodyClass: 'blog-article',
    otherLangUrl,
    categories,
    activeCategorySlug: post.categorySlug,
    headerVariant: 'article',
    share: { url: shareUrl, title: post.title },
  });
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

  const form = `<form class="kb-search" role="search" data-search-index="${indexUrl}" action="${u.search()}" method="get">
            <label class="kb-search-label" for="q">${escapeHtml(t.searchTitle)}</label>
            <div class="kb-search-field">
              ${ICON.search(20)}
              <input id="q" name="q" type="search" autocomplete="off" placeholder="${escapeHtml(t.searchPlaceholder)}" />
              <button class="kb-btn kb-btn--dark" type="submit">${escapeHtml(t.search)}</button>
            </div>
          </form>
          <p class="kb-search-status" data-search-status role="status">${escapeHtml(t.searchPrompt)}</p>
          ${
            suggestions.length > 0
              ? `<div class="kb-suggestions"><p class="kb-suggestions-label">${escapeHtml(t.suggestions)}</p><div class="kb-suggestions-list">${suggestions
                  .map((q) => `<a class="kb-chip" href="${u.search()}?q=${encodeURIComponent(q)}">${escapeHtml(q)}</a>`)
                  .join('')}</div></div>`
              : ''
          }`;

  const body = `      ${pageHero(lang, {
    trail: [
      { name: t.home, path: '/' },
      { name: t.blog, path: u.index() },
      { name: t.search, path: u.search() },
    ],
    heading: t.searchTitle,
    description: t.searchIntro,
    extraHtml: form,
  })}

      <section class="kb-wrap kb-section kb-section--tight">
        <div class="kb-grid" data-search-results></div>
        <!-- Avant toute recherche, la page reste utile : elle propose les
             derniers articles plutôt qu'une zone vide. -->
        <div data-search-fallback>
          ${recent.length > 0 ? `<h2 class="kb-section-title">${escapeHtml(t.recentArticles)}</h2>${grid(recent, lang)}` : ''}
        </div>
        <noscript><p class="kb-empty">${lang === 'fr' ? 'La recherche nécessite JavaScript. Parcours les catégories et les articles ci-dessus.' : 'Search requires JavaScript. Browse the categories and articles above.'}</p></noscript>
      </section>

      ${topicsCard(lang, topics)}

      ${cta(lang)}`;

  return layout({ lang, seo, schema, body, assets, bodyClass: 'blog-search-page', categories });
};

export const PER_PAGE_EXPORT = PER_PAGE;

