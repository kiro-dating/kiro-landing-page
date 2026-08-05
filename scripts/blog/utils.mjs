/**
 * Utilitaires purs du générateur de blog.
 * Aucun accès disque, aucune dépendance externe : facile à tester et à raisonner.
 */

/** Échappe le texte destiné à du contenu HTML. */
export const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Échappe une valeur destinée à un nœud XML (sitemap, RSS). */
export const escapeXml = escapeHtml;

/** Échappe une chaîne injectée dans un bloc <script> JSON-LD. */
export const escapeJsonLd = (value) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

/**
 * Slug SEO : minuscules, accents retirés, séparateur tiret.
 * Volontairement strict — un slug ne doit jamais contenir de majuscule
 * ni de caractère ambigu (leçon tirée des URLs de Hinge).
 */
export const slugify = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Retire le balisage HTML d'une chaîne (pour le résumé, l'index de recherche, le RSS). */
export const stripHtml = (html = '') =>
  String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    // Les balises de bloc deviennent une espace (les mots ne doivent pas se coller),
    // les balises en ligne disparaissent (« <a>guide</a>. » → « guide. », pas « guide . »)
    .replace(/<\/?(?:p|div|li|ul|ol|h[1-6]|blockquote|tr|td|th|table|section|article|figure|figcaption|br|hr)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    /* On compacte les blancs SAUF les insécables : en JavaScript, `\s` englobe
       U+00A0 et U+202F, et un `replace(/\s+/g, ' ')` naïf annulerait toute la
       typographie française dans la table des matières et le JSON-LD. */
    .replace(/[^\S\u00A0\u202F]+/g, ' ')
    .trim();

/** Tronque proprement sur une frontière de mot. */
export const truncate = (text = '', max = 160) => {
  const clean = String(text).trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

/** Temps de lecture en minutes, minimum 1. */
export const readingTimeOf = (text, wordsPerMinute) => {
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
};

/** Normalise une date de frontmatter en Date UTC. Renvoie null si invalide. */
export const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** `2026-08-04` — format machine (datetime, sitemap). */
export const isoDay = (date) => date.toISOString().slice(0, 10);

/** Date lisible localisée (« 4 août 2026 »). */
export const formatDate = (date, locale) =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

/** Concatène des segments d'URL en garantissant une seule barre oblique. */
export const joinUrl = (...parts) =>
  `/${parts
    .filter((p) => p !== undefined && p !== null && p !== '')
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/+/, '/');

/** Découpe une liste en pages de taille fixe. Toujours au moins une page. */
export const paginate = (items, perPage) => {
  if (items.length === 0) return [[]];
  const pages = [];
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));
  return pages;
};

/** Somme de contrôle courte et stable, pour les noms de fichiers d'assets. */
export const shortHash = (input) => {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  return (h1.toString(36) + h2.toString(36)).slice(0, 10);
};

/**
 * Typographie française.
 *
 * En français, une espace insécable est obligatoire à l'intérieur des
 * guillemets et avant les ponctuations doubles. Sans elle, le navigateur
 * coupe la ligne au mauvais endroit — un « » orphelin en début de ligne,
 * un « ! » séparé de son mot. C'est très visible sur mobile, où les lignes
 * sont courtes.
 *
 * Convention retenue (usage courant de la presse francophone) :
 *   · espace fine insécable (U+202F) pour « » ! ? ; % et les milliers ;
 *   · espace insécable normale (U+00A0) avant les deux-points.
 *
 * Appliqué uniquement au texte français, et jamais au code : le point
 * d'entrée est le rendu des nœuds de texte de Markdown, qui ne voit ni les
 * blocs de code, ni les attributs HTML, ni les URLs.
 */
const NARROW_NBSP = '\u202F';
const NBSP = '\u00A0';

export const frenchTypography = (text = '') =>
  String(text)
    .replace(/«\s+/g, `«${NARROW_NBSP}`)
    .replace(/\s+»/g, `${NARROW_NBSP}»`)
    .replace(/\s+([!?;])/g, `${NARROW_NBSP}$1`)
    .replace(/\s+:/g, `${NBSP}:`)
    // « 45 % » et « 1 700 » : le nombre ne doit jamais être coupé de son unité
    .replace(/(\d)\s+%/g, `$1${NARROW_NBSP}%`)
    .replace(/(\d)\s+(\d{3})\b/g, `$1${NARROW_NBSP}$2`);

/** Déduplique en conservant l'ordre. */
export const unique = (list) => [...new Set(list)];
