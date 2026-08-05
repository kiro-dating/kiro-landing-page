/**
 * Lecture et normalisation du contenu.
 *
 * Un article = un fichier Markdown dans `content/blog/<langue>/<slug>.md`,
 * avec un en-tête YAML (frontmatter). Ce module en fait un objet stable
 * consommé par les gabarits, les flux et le SEO — et refuse un fichier
 * invalide plutôt que de publier une page cassée.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { LANGS, PATHS, UI, WORDS_PER_MINUTE, DEFAULT_OG_IMAGE } from './config.mjs';
import {
  escapeHtml,
  formatDate,
  frenchTypography,
  isoDay,
  joinUrl,
  readingTimeOf,
  slugify,
  stripHtml,
  toDate,
  truncate,
  unique,
} from './utils.mjs';

/* ── Rendu Markdown ─────────────────────────────────────────────────────── */

/** Compteur d'ancres, réinitialisé à chaque article (voir renderMarkdown). */
let headingSlugs = new Set();

/** Titres collectés pendant le rendu → sert à construire la table des matières. */
let headings = [];

/** Langue du rendu en cours : conditionne l'application des règles typographiques. */
let renderLang = 'fr';

/** Applique la typographie française aux textes de la langue concernée. */
const typo = (text) => (renderLang === 'fr' ? frenchTypography(text) : text);

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    /** Titres : ancre stable et unique, indispensable pour la TOC et les liens profonds. */
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const plain = stripHtml(text);
      let id = slugify(plain) || `section-${headings.length + 1}`;
      let n = 2;
      while (headingSlugs.has(id)) id = `${slugify(plain)}-${n++}`;
      headingSlugs.add(id);
      if (depth === 2 || depth === 3) headings.push({ id, text: plain, depth });
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    },

    /** Liens : les liens externes s'ouvrent dans un nouvel onglet, en sécurité. */
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const isExternal = /^https?:\/\//i.test(href) && !href.includes('kirodating.com');
      const attrs = [
        `href="${escapeHtml(href)}"`,
        title ? `title="${escapeHtml(title)}"` : '',
        isExternal ? 'target="_blank" rel="noopener noreferrer"' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<a ${attrs}>${text}</a>`;
    },

    /** Images : jamais bloquantes, jamais responsables d'un décalage de mise en page. */
    image({ href, title, text }) {
      const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : '';
      return `<figure class="post-figure"><img src="${escapeHtml(href)}" alt="${escapeHtml(
        text || '',
      )}" loading="lazy" decoding="async" />${caption}</figure>`;
    },

    /**
     * Nœuds de texte : seul point d'entrée de la typographie française.
     * Les blocs et fragments de code ne passent pas par ici, les attributs
     * et les URLs non plus — aucun risque de corrompre du balisage.
     */
    text(token) {
      const raw = token.tokens ? this.parser.parseInline(token.tokens) : (token.text ?? '');
      return typo(raw);
    },

    /** Tableaux : encapsulés pour rester lisibles sur mobile sans casser la page. */
    table(token) {
      const header = `<thead><tr>${token.header
        .map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`)
        .join('')}</tr></thead>`;
      const body = `<tbody>${token.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`,
        )
        .join('')}</tbody>`;
      return `<div class="post-table-wrap"><table>${header}${body}</table></div>`;
    },
  },
});

/** Rend le corps Markdown et renvoie le HTML + les titres H2/H3 rencontrés. */
const renderMarkdown = (markdown, lang = 'fr') => {
  headingSlugs = new Set();
  headings = [];
  renderLang = lang;
  const html = marked.parse(markdown);
  return { html, headings: [...headings] };
};

/** Rend un fragment court (réponse de FAQ, bio d'auteur) sans polluer la TOC. */
export const renderInline = (markdown = '') => {
  const saved = headings;
  headings = [];
  const html = marked.parse(String(markdown)).trim();
  headings = saved;
  return html;
};

/* ── Taxonomies ─────────────────────────────────────────────────────────── */

const readJson = (file, fallback) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

export const loadTaxonomy = () => readJson(path.join(PATHS.content, 'taxonomy.json'), { categories: [], tags: [] });
export const loadAuthors = () => readJson(path.join(PATHS.content, 'authors.json'), {});

/* ── Chargement des articles ────────────────────────────────────────────── */

class ContentError extends Error {}

const requireField = (value, field, file) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new ContentError(`champ obligatoire « ${field} » manquant — ${file}`);
  }
  return value;
};

/**
 * Charge tous les articles publiables d'une langue.
 *
 * Les brouillons (`draft: true`) et les articles datés dans le futur sont
 * ignorés silencieusement : ils restent versionnés dans le dépôt mais
 * n'apparaissent ni dans le HTML, ni dans le sitemap, ni dans le RSS.
 */
export const loadPosts = (langCode, { taxonomy, authors, warn = () => {} }) => {
  const lang = LANGS[langCode];
  const dir = path.join(PATHS.content, lang.dir);
  if (!fs.existsSync(dir)) return [];

  const categoryKeys = new Set(taxonomy.categories.map((c) => c.key));
  const tagKeys = new Set(taxonomy.tags.map((t) => t.key));
  const now = Date.now();
  const posts = [];
  const seenSlugs = new Set();

  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const rel = path.relative(PATHS.root, filePath);

    if (data.draft === true) continue;

    const title = requireField(data.title, 'title', rel);
    const slug = slugify(data.slug || path.basename(file, '.md'));
    if (!slug) throw new ContentError(`slug vide — ${rel}`);
    if (seenSlugs.has(slug)) throw new ContentError(`slug en double « ${slug} » — ${rel}`);
    seenSlugs.add(slug);

    const publishedAt = toDate(requireField(data.publishedAt, 'publishedAt', rel));
    if (!publishedAt) throw new ContentError(`date « publishedAt » invalide — ${rel}`);
    if (publishedAt.getTime() > now) continue; // publication programmée

    const updatedAt = toDate(data.updatedAt) || publishedAt;

    const categoryKey = requireField(data.category, 'category', rel);
    if (!categoryKeys.has(categoryKey)) {
      throw new ContentError(`catégorie inconnue « ${categoryKey} » — ${rel} (voir content/blog/taxonomy.json)`);
    }

    const tags = unique((data.tags || []).map((t) => slugify(t))).filter(Boolean);
    for (const tag of tags) {
      if (!tagKeys.has(tag)) warn(`tag non déclaré « ${tag} » — ${rel} (ajoute-le à taxonomy.json)`);
    }

    const authorKey = requireField(data.author, 'author', rel);
    if (!authors[authorKey]) throw new ContentError(`auteur inconnu « ${authorKey} » — ${rel}`);

    const { html, headings: toc } = renderMarkdown(content, langCode);
    const plain = stripHtml(html);

    /* Les champs du frontmatter ne passent pas par Markdown : on leur applique
       les mêmes règles typographiques, sinon le H1 casse au mauvais endroit. */
    const fix = (value) => (langCode === 'fr' ? frenchTypography(String(value)) : String(value));

    const description = truncate(fix(requireField(data.description, 'description', rel).trim()), 165);
    const excerpt = fix(String(data.excerpt || '').trim()) || truncate(plain, 200);

    const faq = (data.faq || []).map((entry) => ({
      question: fix(String(entry.q ?? entry.question ?? '').trim()),
      answerHtml: renderInline(entry.a ?? entry.answer ?? ''),
      answerText: stripHtml(renderInline(entry.a ?? entry.answer ?? '')),
    })).filter((entry) => entry.question && entry.answerText);

    posts.push({
      lang: langCode,
      locale: lang.locale,
      file: rel,
      slug,
      url: joinUrl(lang.base, slug),
      title: fix(String(title).trim()),
      /* Titre de la balise <title> quand il doit différer du H1 : le H1 peut être
         conversationnel, le <title> reste optimisé pour la SERP. Facultatif. */
      seoTitle: data.seoTitle ? fix(String(data.seoTitle).trim()) : null,
      description,
      excerpt,
      html,
      toc,
      wordCount: plain.split(/\s+/).filter(Boolean).length,
      readingTime: Number(data.readingTime) || readingTimeOf(plain, WORDS_PER_MINUTE),
      categoryKey,
      tags,
      authorKey,
      publishedAt,
      updatedAt,
      cover: data.cover || null,
      coverAlt: String(data.coverAlt || data.title || '').trim(),
      featured: data.featured === true,
      faq,
      /** Clé partagée entre les versions FR et EN d'un même article → hreflang. */
      translationKey: data.translationKey ? String(data.translationKey).trim() : null,
      related: (data.related || []).map((s) => slugify(s)),
      noindex: data.noindex === true,
      canonicalOverride: data.canonical ? String(data.canonical) : null,
    });
  }

  return posts.sort((a, b) => b.publishedAt - a.publishedAt);
};

/* ── Vues dérivées ──────────────────────────────────────────────────────── */

/** Métadonnées affichables d'un article (dates formatées, auteur, catégorie…). */
export const decorate = (post, { taxonomy, authors }) => {
  const t = UI[post.lang];
  const category = taxonomy.categories.find((c) => c.key === post.categoryKey);
  const author = authors[post.authorKey];
  /* `name` et `jobTitle` acceptent une chaîne ou un objet { fr, en } : un nom
     d'équipe éditoriale doit pouvoir être traduit sans dupliquer l'auteur. */
  const localized = (value) =>
    value && typeof value === 'object' && !Array.isArray(value) ? value[post.lang] ?? value.fr : value;
  return {
    ...post,
    categoryLabel: category?.label?.[post.lang] || post.categoryKey,
    categorySlug: category?.slug?.[post.lang] || post.categoryKey,
    tagLabels: post.tags.map((key) => {
      const tag = taxonomy.tags.find((x) => x.key === key);
      return { key, label: tag?.label?.[post.lang] || key };
    }),
    author: {
      ...author,
      key: post.authorKey,
      name: localized(author.name),
      jobTitle: localized(author.jobTitle) || null,
    },
    publishedIso: post.publishedAt.toISOString(),
    updatedIso: post.updatedAt.toISOString(),
    publishedDay: isoDay(post.publishedAt),
    publishedLabel: formatDate(post.publishedAt, post.locale),
    updatedLabel: formatDate(post.updatedAt, post.locale),
    wasUpdated: post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000,
    readingLabel: t.readingTime(post.readingTime),
    ogImage: post.cover || DEFAULT_OG_IMAGE,
  };
};

/**
 * Articles reliés : les `related` explicites du frontmatter d'abord,
 * complétés par proximité (même catégorie, puis tags partagés, puis récence).
 */
export const relatedPosts = (post, all, count) => {
  const pool = all.filter((p) => p.slug !== post.slug);
  const picked = [];
  const push = (p) => {
    if (p && !picked.some((x) => x.slug === p.slug)) picked.push(p);
  };

  for (const slug of post.related) push(pool.find((p) => p.slug === slug));

  const score = (p) =>
    (p.categoryKey === post.categoryKey ? 10 : 0) +
    p.tags.filter((tag) => post.tags.includes(tag)).length * 3;

  [...pool]
    .sort((a, b) => score(b) - score(a) || b.publishedAt - a.publishedAt)
    .forEach(push);

  return picked.slice(0, count);
};

export { ContentError };
