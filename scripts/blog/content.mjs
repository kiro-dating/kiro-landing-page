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
import { LANGS, PATHS, PHOTO_LICENSES, UI, WORDS_PER_MINUTE, DEFAULT_OG_IMAGE, photoBase } from './config.mjs';
/* Dépendance à sens unique : templates.mjs n'importe jamais ce module. Elle
   existe pour que la construction d'URL reste au seul endroit qui la connaît
   — dupliquer ici le chemin d'une page d'auteur serait la garantie de le voir
   diverger le jour où un segment traduit change. */
import { photoFigure, urls } from './templates.mjs';
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

/**
 * Photographies disponibles pendant le rendu, déjà résolues pour `renderLang`.
 * Même mécanique que `headings` : posée par renderMarkdown, lue par le
 * renderer d'images, remise à zéro à chaque article.
 */
let renderPhotos = new Map();

/**
 * Photographies effectivement rencontrées dans le corps de l'article.
 *
 * On les collecte au rendu plutôt que de les redéclarer dans le frontmatter :
 * une photo retirée du texte disparaît alors d'elle-même du JSON-LD et du
 * sitemap, sans qu'on ait à y penser. Une liste tenue à la main aurait
 * survécu à la suppression, et affirmé aux moteurs une image absente de la page.
 */
let usedPhotos = [];

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

    /**
     * Images. Deux formes cohabitent :
     *
     *   ![texte](/chemin.webp "légende")
     *       image simple, telle qu'écrite. Comportement historique, inchangé.
     *
     *   ![](photo:identifiant)
     *       photographie du registre content/blog/photos.json. Tout — jeu de
     *       largeurs, formats, dimensions, texte alternatif, légende, crédit,
     *       licence — vient du registre. Le Markdown ne porte que l'intention
     *       « ici, cette photo », ce qui évite d'avoir à retoucher un article
     *       le jour où une photo est réencodée.
     *
     * Un texte ou un titre écrits malgré tout dans le Markdown l'emportent :
     * c'est la porte de sortie pour un cas particulier, sans dupliquer le reste.
     */
    image({ href, title, text }) {
      const photoId = /^photo:(.+)$/.exec(href)?.[1];
      if (photoId) {
        const photo = renderPhotos.get(photoId);
        /* Un identifiant inconnu est une erreur d'article, pas une image
           manquante : on refuse de construire la page plutôt que de publier
           une photographie fantôme sans crédit ni licence. */
        if (!photo) {
          throw new ContentError(
            `photographie inconnue « ${photoId} » — absente de content/blog/photos.json`,
          );
        }
        if (!usedPhotos.some((p) => p.id === photoId)) usedPhotos.push(photo);
        return photoFigure(photo, {
          alt: text || undefined,
          caption: title ? typo(title) : undefined,
        });
      }
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

/** Rend le corps Markdown et renvoie le HTML, les titres H2/H3 et les photos rencontrés. */
const renderMarkdown = (markdown, lang = 'fr', photos = new Map()) => {
  headingSlugs = new Set();
  headings = [];
  usedPhotos = [];
  renderPhotos = photos;
  renderLang = lang;
  const html = marked.parse(markdown);
  return { html, headings: [...headings], photos: [...usedPhotos] };
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

/* ── Photographies ──────────────────────────────────────────────────────── */

/** Registre brut des photographies. Vide si le fichier n'existe pas encore. */
export const loadPhotos = () => readJson(path.join(PATHS.content, 'photos.json'), { photos: {} }).photos ?? {};

/**
 * Transforme le registre en vues prêtes à l'emploi pour UNE langue.
 *
 * Tout ce dont ont besoin le rendu, le JSON-LD, le sitemap et la page de
 * crédits est résolu ici, une fois : chemins des dérivées, dimensions,
 * licence complète, et surtout le photographe rattaché à l'entité Person
 * déjà déclarée dans authors.json. C'est cette résolution unique qui garantit
 * que la légende affichée, la balise Schema.org et le crédit embarqué dans le
 * fichier nomment exactement la même personne et la même licence.
 *
 * Une incohérence de registre (licence inconnue, photographe absent) est une
 * erreur de contenu : elle arrête le build. Publier une photographie dont on
 * ne sait pas affirmer les droits est précisément ce qu'on veut rendre impossible.
 */
export const resolvePhotos = (photos, { authors, lang }) => {
  /* Les textes du registre ne traversent pas Markdown : ils n'ont donc jamais
     vu les règles typographiques françaises. On les leur applique ici, sinon
     une légende de photo afficherait une apostrophe droite et un deux-points
     collé au milieu d'un article qui, lui, est correctement composé. */
  const pick = (value) => {
    const raw =
      value && typeof value === 'object' && !Array.isArray(value) ? (value[lang] ?? value.fr) : value;
    return lang === 'fr' && typeof raw === 'string' ? frenchTypography(raw) : raw;
  };

  const resolved = new Map();
  for (const [id, photo] of Object.entries(photos)) {
    const license = PHOTO_LICENSES[photo.license];
    if (!license) {
      throw new ContentError(`photographie « ${id} » : licence inconnue « ${photo.license} »`);
    }
    const author = authors[photo.photographer];
    if (!author) {
      throw new ContentError(
        `photographie « ${id} » : photographe « ${photo.photographer} » absent de authors.json`,
      );
    }
    if (!photo.width || !photo.height) {
      throw new ContentError(
        `photographie « ${id} » : dimensions absentes du registre. ` +
          'Lancer `node scripts/media/photos-kiro.mjs` pour les mesurer.',
      );
    }

    const base = photoBase(photo.collection, id);
    resolved.set(id, {
      id,
      collection: photo.collection,
      /* Chemins des fichiers réellement produits par scripts/media/photos-kiro.mjs. */
      src: `${base}.jpg`,
      sources: [
        { type: 'image/avif', srcset: photo.widths.map((w) => `${base}-${w}.avif ${w}w`).join(', ') },
        { type: 'image/webp', srcset: photo.widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ') },
      ],
      widths: photo.widths,
      width: photo.width,
      height: photo.height,
      /* Déclinaison Open Graph, produite seulement pour les photographies
         destinées à servir de couverture. Rapport 1200/630 imposé et vérifié
         par scripts/media/photos-kiro.mjs. */
      cover: photo.cover
        ? {
            src: `${base}-cover.jpg`,
            width: 1200,
            height: 630,
            sources: [
              {
                type: 'image/avif',
                srcset: (photo.coverWidths || []).map((w) => `${base}-cover-${w}.avif ${w}w`).join(', '),
              },
              {
                type: 'image/webp',
                srcset: (photo.coverWidths || []).map((w) => `${base}-cover-${w}.webp ${w}w`).join(', '),
              },
            ],
          }
        : null,
      alt: pick(photo.alt),
      caption: pick(photo.caption),
      place: pick(photo.place),
      capturedAt: photo.capturedAt || null,
      articles: photo.articles || [],
      license: {
        id: license.id,
        label: license.label,
        deed: pick(license.deed),
        legal: license.legal,
        short: pick(license.short),
        summary: pick(license.summary),
        /* Page où l'on apprend à quelles conditions réutiliser la photo.
           Résolue ICI parce que seo.mjs ne peut pas appeler urls() sans créer
           un cycle d'import — et parce que la valeur doit être la même dans le
           JSON-LD, dans le fichier XMP et dans le pied de page. */
        acquirePath: urls(lang).photoCredits(),
      },
      photographer: {
        key: photo.photographer,
        /* Le slug est ce qui relie le crédit photo à l'entité Person unique
           du blog — voir personId() dans scripts/blog/seo.mjs. */
        slug: author.slug,
        name: pick(author.name),
        /* Page d'auteur du blog : le crédit d'une photo renvoie vers la même
           page que la signature d'un article, pas vers une fiche parallèle. */
        path: urls(lang).author(author.slug),
      },
    });
  }
  return resolved;
};

/* ── Chargement des articles ────────────────────────────────────────────── */

class ContentError extends Error {}

const requireField = (value, field, file) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new ContentError(`champ obligatoire « ${field} » manquant — ${file}`);
  }
  return value;
};

/**
 * Charge les articles d'une langue.
 *
 * Par défaut, seuls les articles publiables sont retournés. Les brouillons
 * (`draft: true`) et les articles datés dans le futur sont ignorés
 * silencieusement : ils restent versionnés dans le dépôt mais n'apparaissent
 * ni dans le HTML, ni dans le sitemap, ni dans le RSS.
 *
 * `only: 'drafts'` inverse le filtre et ne retourne QUE ces articles-là, en les
 * marquant `noindex`. C'est le mode de relecture locale — voir la constante
 * PREVIEW dans scripts/build-blog.mjs. Les deux ensembles sont strictement
 * disjoints : un brouillon ne peut jamais se retrouver dans une liste, un
 * sitemap ou un flux, puisqu'il n'est même pas dans le même tableau.
 */
export const loadPosts = (langCode, { taxonomy, authors, photos = new Map(), warn = () => {}, only = 'published' }) => {
  const wantDrafts = only === 'drafts';
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

    /* Les modèles d'article sont de la documentation : jamais rendus, même en
       relecture. Sans ça, le mode relecture produirait « /blog/mon-slug-seo/ ». */
    if (data.template === true) continue;

    const isDraft = data.draft === true;
    if (isDraft && !wantDrafts) continue;

    const title = requireField(data.title, 'title', rel);
    const slug = slugify(data.slug || path.basename(file, '.md'));
    if (!slug) throw new ContentError(`slug vide — ${rel}`);
    if (seenSlugs.has(slug)) throw new ContentError(`slug en double « ${slug} » — ${rel}`);
    seenSlugs.add(slug);

    const publishedAt = toDate(requireField(data.publishedAt, 'publishedAt', rel));
    if (!publishedAt) throw new ContentError(`date « publishedAt » invalide — ${rel}`);
    /* Publication programmée : invisible tant que la date n'est pas atteinte.
       C'est le second verrou, indépendant de `draft`. */
    const isScheduled = publishedAt.getTime() > now;
    if (isScheduled && !wantDrafts) continue;
    if (wantDrafts && !isDraft && !isScheduled) continue;

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

    /* Couverture photographique : elle vient du même registre que les images
       du corps. Un identifiant inconnu, ou une photo dont la déclinaison de
       couverture n'a pas été produite, arrête le build — publier une
       couverture cassée serait la régression la plus visible possible. */
    let coverPhoto = null;
    if (data.coverPhoto) {
      const key = String(data.coverPhoto).trim();
      coverPhoto = photos.get(key) || null;
      if (!coverPhoto) {
        throw new ContentError(
          `couverture « ${key} » inconnue — absente de content/blog/photos.json — ${rel}`,
        );
      }
      if (!coverPhoto.cover) {
        throw new ContentError(
          `la photographie « ${key} » n'a pas de déclinaison de couverture — ${rel}\n` +
            '  Ajoute un bloc `cover.crop` au rapport 1200/630 dans content/blog/photos.json,\n' +
            '  puis lance `node scripts/media/photos-kiro.mjs`.',
        );
      }
    }

    const { html, headings: toc, photos: bodyPhotos } = renderMarkdown(content, langCode, photos);
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
      cover: coverPhoto ? coverPhoto.cover.src : data.cover || null,
      /* Photographies du corps, dans l'ordre d'apparition. Collectées au rendu
         — voir `usedPhotos`. Alimentent le JSON-LD et le sitemap images. */
      photos: bodyPhotos,
      /* Photographie servant de couverture, si l'article en déclare une.
         Elle porte sa licence et son auteur comme n'importe quelle autre —
         c'est précisément l'intérêt de la faire venir du registre plutôt que
         de recopier six champs dans le frontmatter. */
      coverPhoto,
      coverAlt: coverPhoto ? coverPhoto.alt : String(data.coverAlt || data.title || '').trim(),
      /* `coverTitle` alimente l'attribut title de l'image et le sitemap images ;
         `coverCaption` produit la légende visible sous l'illustration.
         Les deux sont facultatifs — sans eux, le rendu est celui d'avant. */
      /* `coverVector` : version vectorielle de l'illustration. Quand elle
         existe, c'est ELLE que le navigateur affiche, via <picture> — net à
         n'importe quelle densité d'écran, sans peser plus lourd. Le raster
         `cover` reste la source de l'Open Graph (les réseaux sociaux
         n'acceptent pas le SVG) et le repli des navigateurs anciens.
         `coverSrcset` : jeu de rasters pour ce repli, du plus petit au plus
         grand. Chaque taille doit être rasterisée DEPUIS le vectoriel — jamais
         agrandie depuis une taille inférieure. */
      coverVector: coverPhoto ? null : data.coverVector ? String(data.coverVector).trim() : null,
      coverSrcset: coverPhoto ? null : data.coverSrcset ? String(data.coverSrcset).trim() : null,
      /* Sources <picture> de la couverture. Un vectoriel quand l'illustration
         en a un, les formats modernes de la photographie sinon. */
      coverSources: coverPhoto
        ? coverPhoto.cover.sources
        : data.coverVector
          ? [{ type: 'image/svg+xml', srcset: String(data.coverVector).trim() }]
          : [],
      coverTitle: coverPhoto ? coverPhoto.place : data.coverTitle ? String(data.coverTitle).trim() : null,
      coverCaption: coverPhoto ? coverPhoto.caption : data.coverCaption ? String(data.coverCaption).trim() : null,
      coverCredit: coverPhoto ? null : data.coverCredit ? String(data.coverCredit).trim() : null,
      featured: data.featured === true,
      faq,
      /** Clé partagée entre les versions FR et EN d'un même article → hreflang. */
      translationKey: data.translationKey ? String(data.translationKey).trim() : null,
      related: (data.related || []).map((s) => slugify(s)),
      /* Un brouillon relu en local est TOUJOURS noindex, quoi qu'en dise son
         frontmatter. C'est non négociable : la page ne doit jamais pouvoir
         être indexée si elle sort du poste de travail par accident. */
      noindex: data.noindex === true || isDraft || isScheduled,
      isDraft,
      isScheduled,
      canonicalOverride: data.canonical ? String(data.canonical) : null,
    });
  }

  return posts.sort((a, b) => b.publishedAt - a.publishedAt);
};

/* ── Vues dérivées ──────────────────────────────────────────────────────── */

/**
 * Vue d'un auteur dans UNE langue.
 *
 * Extraite de `decorate` parce qu'elle sert aussi hors du contexte d'un
 * article : la page de crédits photo doit décrire un photographe même s'il n'a
 * publié aucun article dans la langue courante. Dupliquer cette résolution
 * avait produit exactement ce défaut — une fiche non traduite, donc un
 * `jobTitle` vide dans les données structurées anglaises.
 *
 * `name`, `jobTitle` et `bio` acceptent une chaîne ou un objet { fr, en } : un
 * nom d'équipe éditoriale doit pouvoir être traduit sans dupliquer l'auteur.
 */
export const localizeAuthor = (author, key, lang) => {
  const localized = (value) =>
    value && typeof value === 'object' && !Array.isArray(value) ? (value[lang] ?? value.fr) : value;
  const slug = author.slug || key;
  return {
    ...author,
    key,
    slug,
    /* Chemin de la page d'auteur : le nœud Person du JSON-LD s'y ancre, et
       c'est aussi la cible du lien de signature. Résolu ici pour que la
       construction d'URL reste au même endroit pour tout le monde. */
    path: urls(lang).author(slug),
    name: localized(author.name),
    jobTitle: localized(author.jobTitle) || null,
    /* Titre court pour le JSON-LD ; à défaut, celui affiché. */
    jobTitleSchema: localized(author.jobTitleSchema) || localized(author.jobTitle) || null,
    bio: localized(author.bio) || null,
  };
};

/** Métadonnées affichables d'un article (dates formatées, auteur, catégorie…). */
export const decorate = (post, { taxonomy, authors }) => {
  const t = UI[post.lang];
  const category = taxonomy.categories.find((c) => c.key === post.categoryKey);
  return {
    ...post,
    categoryLabel: category?.label?.[post.lang] || post.categoryKey,
    categorySlug: category?.slug?.[post.lang] || post.categoryKey,
    tagLabels: post.tags.map((key) => {
      const tag = taxonomy.tags.find((x) => x.key === key);
      return { key, label: tag?.label?.[post.lang] || key };
    }),
    author: localizeAuthor(authors[post.authorKey], post.authorKey, post.lang),
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
