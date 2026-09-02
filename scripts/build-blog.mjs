#!/usr/bin/env node
/**
 * Générateur statique du blog Kiro.
 *
 *   npm run build          → vite build, puis ce script
 *   npm run blog:build     → ce script seul (itération rapide sur le contenu)
 *
 * Le script écrit UNIQUEMENT dans `dist/`, à côté du résultat de Vite.
 * Il ne modifie aucun fichier source et ne touche jamais à `dist/index.html`,
 * la page d'accueil restant intégralement gérée par l'application React.
 *
 * Sorties (FR ; EN sous /en/blog avec les segments traduits) :
 *   /blog/                              index paginé
 *   /blog/page/2/                       …
 *   /blog/<slug>/                       article
 *   /blog/categorie/<slug>/             catégorie (paginée)
 *   /blog/tag/<slug>/                   tag (paginé)
 *   /blog/auteur/<slug>/                auteur
 *   /blog/recherche/                    recherche côté client (noindex)
 *   /blog/rss.xml                       flux RSS
 *   /blog/search-index.json             index de recherche
 *   /sitemap.xml + /sitemap-*.xml       sitemaps
 *   /robots.txt
 */

import fs from 'node:fs';
import path from 'node:path';
import { LANG_CODES, LANGS, PATHS, PER_PAGE, RELATED_COUNT, SITE_URL, UI } from './blog/config.mjs';
import {
  ContentError,
  decorate,
  loadAuthors,
  loadPhotos,
  loadPosts,
  loadTaxonomy,
  localizeAuthor,
  relatedPosts,
  resolvePhotos,
} from './blog/content.mjs';
import {
  archivePage,
  articlePage,
  authorProfile,
  authorsPage,
  indexPage,
  listingPage,
  photoCreditsPage,
  searchPage,
  urls,
} from './blog/templates.mjs';
import { robots, rss, searchIndex, sitemap, sitemapIndex } from './blog/feeds.mjs';
import { assertNoBrokenInternalLinks } from './blog/links.mjs';
import {
  abs,
  articleNode,
  blogNode,
  breadcrumbNode,
  collectionNode,
  faqNode,
  graph,
  imageObjectNode,
  organizationNode,
  personId,
  personNode,
  websiteNode,
} from './blog/seo.mjs';
import { isoDay, paginate, shortHash, slugify, unique } from './blog/utils.mjs';

/* ── Relecture locale des brouillons ────────────────────────────────────── */

/**
 * `BLOG_PREVIEW_DRAFTS=1 npm run blog:build` génère AUSSI les pages des
 * brouillons, pour pouvoir les relire dans un navigateur avant publication.
 *
 * Trois garanties, dans cet ordre :
 *   1. le mode est refusé sur Vercel et en production — un brouillon ne peut
 *      pas partir en ligne par une variable d'environnement oubliée ;
 *   2. les brouillons sont chargés dans un tableau SÉPARÉ. Ils n'entrent donc
 *      dans aucun index, aucune catégorie, aucun tag, aucune page auteur,
 *      aucun article relié, aucun flux RSS, aucun index de recherche — non par
 *      filtrage, mais parce qu'ils ne sont pas dans les données ;
 *   3. chaque page produite est `noindex`, et n'est jamais ajoutée au sitemap.
 */
const PREVIEW = process.env.BLOG_PREVIEW_DRAFTS === '1';

if (PREVIEW && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
  throw new Error(
    'BLOG_PREVIEW_DRAFTS est un mode de relecture locale et ne peut pas servir en production.',
  );
}

/* ── Journalisation ─────────────────────────────────────────────────────── */

const warnings = [];
const warn = (message) => warnings.push(message);
const log = (message) => process.stdout.write(`  ${message}\n`);

/**
 * Regroupe les articles par année puis par mois, du plus récent au plus ancien.
 * Sert à la fois aux pages d'archives, à la barre de navigation et à la colonne
 * latérale. Une période sans article n'apparaît jamais : la structure est
 * dérivée des articles eux-mêmes, donc aucune page vide ne peut être produite.
 */
const archiveTree = (posts, lang) => {
  const t = UI[lang];
  const years = new Map();
  for (const post of posts) {
    const y = post.publishedAt.getUTCFullYear();
    const m = post.publishedAt.getUTCMonth() + 1;
    if (!years.has(y)) years.set(y, new Map());
    const months = years.get(y);
    months.set(m, (months.get(m) || 0) + 1);
  }
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      count: [...months.values()].reduce((n, c) => n + c, 0),
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, count]) => ({ month, count, label: t.months[month - 1] })),
    }));
};

/**
 * Sujets à explorer, dérivés des tags portés par des articles publiés.
 *
 * On ne code aucune liste en dur : les libellés viennent de `taxonomy.json` et
 * un sujet n'apparaît que si sa page de tag est réellement générée. Le jour où
 * un tag n'est plus employé, il disparaît de la colonne tout seul.
 */
const topicChips = (posts, taxonomy, lang, limit = 10) => {
  const counts = new Map();
  for (const post of posts) {
    for (const key of post.tags) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => {
      const tag = taxonomy.tags.find((x) => x.key === key);
      return { key, count, label: tag?.label?.[lang] || key };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, lang))
    .slice(0, limit);
};

/** Fiches d'auteurs enrichies : nombre d'articles et catégories dominantes. */
const authorCards = (posts, authors, lang) =>
  unique(posts.map((p) => p.authorKey)).map((key) => {
    const written = posts.filter((p) => p.authorKey === key);
    const decorated = written[0].author;
    const counts = new Map();
    for (const p of written) counts.set(p.categoryLabel, (counts.get(p.categoryLabel) || 0) + 1);
    return {
      key,
      slug: slugify(authors[key]?.slug || key),
      name: decorated.name,
      jobTitle: decorated.jobTitle,
      bio: decorated.bio,
      avatar: authors[key]?.avatar || null,
      url: authors[key]?.url || null,
      urlLabel: authors[key]?.urlLabel || null,
      count: written.length,
      topCategories: [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([label]) => label),
      posts: written,
    };
  }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, lang));

/** Date de mise à jour la plus récente d'un ensemble d'articles (lastmod du sitemap). */
const newestUpdate = (posts) =>
  posts.length === 0 ? new Date() : new Date(Math.max(...posts.map((p) => p.updatedAt.getTime())));

/* ── Écriture ───────────────────────────────────────────────────────────── */

let filesWritten = 0;

/* Garde-fou : plus aucune page du blog ne doit envoyer vers le centre d'aide
   de Kiro Social. C'est un AUTRE projet, son ancien centre d'aide a été retiré
   et renvoie 404 — le blog y a envoyé les lecteurs pendant un temps. Contrôlé
   au moment de l'écriture plutôt qu'en relisant dist/, parce que dist/ n'est
   pas purgé entre deux builds et contiendrait de vieilles pages. */
const assertNoLegacyHelpCenter = (relativePath, contents) => {
  if (!relativePath.endsWith('.html')) return;
  const match = contents.match(/https?:\/\/[^"'\s]*kirosocial\.com\/aide[^"'\s]*/);
  if (match) {
    throw new Error(
      `centre d'aide obsolète dans « ${relativePath} » : ${match[0]}\n`
        + "  Kiro Social est un autre projet et son centre d'aide ne répond plus.\n"
        + '  Utilise HELP.* de scripts/blog/config.mjs (https://aide.kirodating.com).',
    );
  }
};

/**
 * Toute référence `@id` du JSON-LD doit être résolue sur la MÊME page.
 *
 * Le graphe d'une page est autonome : un moteur qui la lit n'a rien d'autre
 * sous les yeux. Référencer une entité sans la définir revient donc à ne rien
 * dire du tout — l'auteur d'un article, le photographe d'une image
 * disparaissent silencieusement, sans qu'aucune page ne paraisse cassée.
 *
 * Ce contrôle a été ajouté après avoir laissé passer exactement ce défaut : la
 * page de crédits anglaise créditait un photographe par `@id` alors que son
 * nœud n'était construit que pour les auteurs publiés dans cette langue.
 *
 * Les `@id` du site (#organization, #website) sont définis sur chaque page ;
 * seules les références internes au graphe sont vérifiées.
 */
const assertResolvableSchemaIds = (relativePath, contents) => {
  if (!relativePath.endsWith('.html')) return;
  const block = contents.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!block) return;
  const graph = JSON.parse(
    block[1].replace(/\\u003c/g, '<').replace(/\\u003e/g, '>').replace(/\\u0026/g, '&'),
  )['@graph'];
  if (!Array.isArray(graph)) return;

  const defined = new Set(graph.map((node) => node['@id']).filter(Boolean));
  const referenced = new Set();
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== 'object') return;
    /* Une référence pure est un objet qui ne porte QUE `@id`. Un nœud complet
       porte aussi son `@type` : c'est une définition, pas un renvoi. */
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === '@id') referenced.add(value['@id']);
    else Object.values(value).forEach(walk);
  };
  graph.forEach(walk);

  const orphans = [...referenced].filter((id) => !defined.has(id));
  if (orphans.length > 0) {
    throw new Error(
      `référence JSON-LD non résolue dans « ${relativePath} » : ${orphans.join(', ')}\n`
        + '  Le nœud complet doit figurer dans le même @graph que la référence.',
    );
  }
};

const write = (relativePath, contents) => {
  assertNoLegacyHelpCenter(relativePath, contents);
  assertResolvableSchemaIds(relativePath, contents);
  const target = path.join(PATHS.dist, relativePath.replace(/^\/+/, ''));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
  filesWritten += 1;
};

/** Une URL en `/chemin/` devient `chemin/index.html`. */
const writePage = (url, html) => write(path.join(url, 'index.html'), html);

/* ── Feuille de style ───────────────────────────────────────────────────── */

/**
 * La feuille du blog est assemblée à partir de deux sources :
 *   1. le bloc `:root` de `src/index.css` — jetons de design du site (couleurs,
 *      polices). Extrait à la compilation : une seule source de vérité, aucune
 *      dérive possible entre la landing page et le blog.
 *   2. `styles/blog.css` — styles propres au blog.
 *
 * Le fichier produit porte une empreinte dans son nom : immuable côté CDN.
 */
const buildStylesheet = () => {
  const appCss = fs.readFileSync(PATHS.appCss, 'utf8');
  const rootBlock = appCss.match(/:root\s*\{[\s\S]*?\n\}/);
  if (!rootBlock) {
    throw new Error(
      "impossible d'extraire le bloc :root de src/index.css — les jetons de design du blog seraient incohérents",
    );
  }
  const blogCss = fs.readFileSync(path.join(PATHS.styles, 'blog.css'), 'utf8');
  const css = `/* Généré par scripts/build-blog.mjs — ne pas éditer.
   Jetons repris de src/index.css, styles issus de styles/blog.css. */\n${rootBlock[0]}\n\n${blogCss}`;
  const file = `/blog-assets/blog.${shortHash(css)}.css`;
  write(file, css);
  return file;
};

const buildScript = () => {
  const js = fs.readFileSync(path.join(PATHS.publicDir, 'blog-assets', 'blog.js'), 'utf8');
  const file = `/blog-assets/blog.${shortHash(js)}.js`;
  write(file, js);
  return file;
};

/* ── Construction ───────────────────────────────────────────────────────── */

const main = () => {
  process.stdout.write('\n▸ Blog Kiro — génération statique\n');

  if (!fs.existsSync(PATHS.dist)) {
    throw new Error(
      `dossier « dist/ » introuvable. Lance d'abord « npm run build » (vite build), puis ce script.`,
    );
  }

  const taxonomy = loadTaxonomy();
  const authors = loadAuthors();
  /* Registre des photographies, résolu une fois PAR LANGUE : les légendes et
     les libellés de licence sont traduits, mais les fichiers et les droits,
     eux, sont les mêmes des deux côtés. */
  const photoRegistry = loadPhotos();
  const photosByLang = Object.fromEntries(
    LANG_CODES.map((lang) => [lang, resolvePhotos(photoRegistry, { authors, lang })]),
  );

  const assets = { css: buildStylesheet(), js: buildScript() };

  /** Articles décorés, par langue. */
  const byLang = {};
  /** Brouillons décorés, par langue — vides hors mode relecture. */
  const draftsByLang = {};
  for (const lang of LANG_CODES) {
    const photos = photosByLang[lang];
    const raw = loadPosts(lang, { taxonomy, authors, photos, warn });
    byLang[lang] = raw.map((post) => decorate(post, { taxonomy, authors }));
    draftsByLang[lang] = PREVIEW
      ? loadPosts(lang, { taxonomy, authors, photos, warn, only: 'drafts' }).map((post) =>
          decorate(post, { taxonomy, authors }),
        )
      : [];
  }

  /**
   * Table des traductions : translationKey → { fr: url, en: url }.
   * C'est elle qui alimente hreflang. Un article sans clé n'a pas d'alternate,
   * ce qui est correct : mieux vaut aucune balise qu'une balise mensongère.
   */
  const translations = new Map();
  for (const lang of LANG_CODES) {
    for (const post of byLang[lang]) {
      if (!post.translationKey) continue;
      const entry = translations.get(post.translationKey) || {};
      if (entry[lang]) {
        warn(`clé de traduction « ${post.translationKey} » utilisée deux fois en ${lang}`);
      }
      entry[lang] = post.url;
      translations.set(post.translationKey, entry);
    }
  }

  const alternatesFor = (post) => {
    if (!post.translationKey) return [];
    const entry = translations.get(post.translationKey) || {};
    return LANG_CODES.filter((code) => entry[code]).map((code) => ({ lang: code, path: entry[code] }));
  };

  /** Alternates des pages d'index : les deux langues existent toujours. */
  const staticAlternates = (builder) =>
    LANG_CODES.map((code) => ({ lang: code, path: builder(code) }));

  /**
   * Sujets qu'un auteur traite RÉELLEMENT, déduits de ses articles publiés.
   *
   * Alimente `knowsAbout` du nœud Person. Déduire plutôt que déclarer a deux
   * vertus : la liste ne peut pas mentir, et elle se met à jour toute seule
   * quand l'auteur écrit sur autre chose. Les catégories d'abord — elles
   * portent le sujet —, complétées par les tags les plus fréquents.
   */
  const knowsAboutOf = (authorPosts, lang) => {
    const counts = new Map();
    for (const post of authorPosts) {
      for (const label of [post.categoryLabel, ...post.tagLabels.map((t) => t.label)]) {
        if (label) counts.set(label, (counts.get(label) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], lang))
      .slice(0, 8)
      .map(([label]) => label);
  };

  const sitemapEntries = { pages: [], blog: [] };
  const allUrls = new Set();

  const track = (bucket, entry) => {
    if (allUrls.has(entry.loc)) {
      warn(`URL générée deux fois : ${entry.loc}`);
      return;
    }
    allUrls.add(entry.loc);
    sitemapEntries[bucket].push(entry);
  };

  /* — Page d'accueil du site (gérée par React, listée ici pour le sitemap) — */
  track('pages', { loc: '/', changefreq: 'weekly', priority: '1.0', lastmod: isoDay(new Date()) });

  for (const lang of LANG_CODES) {
    const t = UI[lang];
    const u = urls(lang);
    const posts = byLang[lang];
    const conf = LANGS[lang];

    log(`${conf.locale} — ${posts.length} article(s)`);

    /* Archives et fiches auteurs : dérivées des articles publiés, donc jamais
       en avance sur le contenu réel. */
    const archives = archiveTree(posts, lang);
    const authorList = authorCards(posts, authors, lang);

    /**
     * Un nœud Person par auteur, construit UNE fois pour toute la langue.
     *
     * Toutes les pages qui parlent d'un auteur — ses articles, sa page de
     * profil, l'index des auteurs, les crédits photo — insèrent ce même objet
     * et le référencent par son `@id`. C'est ce qui fait qu'un moteur voit une
     * personne avec vingt mentions plutôt que vingt personnes avec une mention.
     */
    const personByAuthor = new Map(
      unique(posts.map((p) => p.authorKey)).map((key) => {
        const authorPosts = posts.filter((p) => p.authorKey === key);
        const merged = { ...authors[key], ...authorPosts[0].author };
        const slug = slugify(merged.slug || key);
        return [
          key,
          personNode(
            { ...merged, slug, path: u.author(slug) },
            { knowsAbout: knowsAboutOf(authorPosts, lang) },
          ),
        ];
      }),
    );
    const topics = topicChips(posts, taxonomy, lang);

    /* Catégories effectivement utilisées : on ne publie pas de page vide. */
    const usedCategoryKeys = new Set(posts.map((p) => p.categoryKey));
    const categories = taxonomy.categories.filter((c) => usedCategoryKeys.has(c.key));

    /* — Index paginé —
       Par défaut, la une est simplement l'article le plus récent : `posts` est
       déjà trié par date décroissante, donc aucune intervention n'est
       nécessaire quand un nouvel article paraît.
       `featured: true` sert à ÉPINGLER un article en tête malgré la
       chronologie. Un seul épinglage est honoré, le plus récent : sans cette
       limite, un vieil article dont on aurait oublié de retirer le drapeau
       resterait indéfiniment à la une devant des articles plus frais.
       On ne réordonne QUE l'affichage : le RSS et le sitemap conservent
       l'ordre de publication réel. */
    const pinned = posts.filter((p) => p.featured).slice(0, 1);
    const listing = [...pinned, ...posts.filter((p) => p !== pinned[0])];
    const pages = paginate(listing, PER_PAGE);
    pages.forEach((pagePosts, i) => {
      const page = i + 1;
      const url = u.index(page);
      const html = indexPage({
        lang,
        archives,
        topics,
        indexUrl: u.searchIndex(),
        posts: pagePosts,
        page,
        totalPages: pages.length,
        categories,
        assets,
        otherLangUrl: urls(LANG_CODES.find((c) => c !== lang)).index(),
        alternates: staticAlternates((code) => urls(code).index()),
        schema: graph([
          organizationNode(),
          websiteNode(lang),
          blogNode({
            lang,
            path: u.index(),
            name: t.blogTitle,
            description: t.blogTagline,
            posts,
          }),
          breadcrumbNode([
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
          ]),
        ]),
      });
      writePage(url, html);
      track('blog', {
        loc: url,
        changefreq: 'daily',
        priority: page === 1 ? '0.9' : '0.5',
        lastmod: isoDay(newestUpdate(posts)),
        alternates: page === 1 ? staticAlternates((code) => urls(code).index()) : [],
      });
    });

    /* — Articles — */
    for (const post of posts) {
      const related = relatedPosts(post, posts, RELATED_COUNT);
      const alternates = alternatesFor(post);
      const otherLang = alternates.find((a) => a.lang !== lang);

      const html = articlePage({
        lang,
        post,
        related,
        assets,
        alternates,
        otherLangUrl: otherLang ? otherLang.path : null,
        schema: graph([
          organizationNode(),
          websiteNode(lang),
          articleNode(post),
          /* `articleNode` ne référence l'auteur que par son `@id` : le nœud
             complet doit donc voyager dans le même graphe, sinon la référence
             ne résout rien. */
          personByAuthor.get(post.authorKey),
          faqNode(post),
          breadcrumbNode([
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
            { name: post.categoryLabel, path: u.category(post.categorySlug) },
            { name: post.title, path: post.url },
          ]),
        ]),
      });
      writePage(post.url, html);

      if (!post.noindex) {
        track('blog', {
          loc: post.url,
          changefreq: 'monthly',
          priority: post.featured ? '0.8' : '0.7',
          lastmod: isoDay(post.updatedAt),
          alternates,
          /* Illustration déclarée avec la page : l'image est rattachée à son
             article plutôt qu'indexée comme un fichier isolé. */
          images: [
            ...(post.cover
              ? [
                  {
                    loc: post.cover,
                    title: post.coverTitle || post.title,
                    caption: post.coverCaption || post.coverAlt,
                  },
                ]
              : []),
            /* Les photographies du corps aussi : sans elles, le sitemap
               n'annoncerait que l'illustration, et les originaux — les seules
               images à porter une licence déclarée — resteraient invisibles
               pour l'indexation d'images. */
            ...post.photos.map((photo) => ({
              loc: photo.src,
              title: photo.place,
              caption: photo.caption,
            })),
          ],
        });
      }
    }

    /* — Brouillons (relecture locale seulement) —
       Rendus comme des articles, mais jamais suivis : pas de sitemap, pas de
       RSS, pas d'index de recherche, pas d'article relié pointant vers eux. */
    for (const post of draftsByLang[lang]) {
      const html = articlePage({
        lang,
        post,
        related: [],
        assets,
        alternates: [],
        otherLangUrl: null,
        schema: graph([
          organizationNode(),
          websiteNode(lang),
          articleNode(post),
          personByAuthor.get(post.authorKey),
          faqNode(post),
        ]),
      });
      writePage(post.url, html);
      /* URL locale complète : un brouillon n'est listé nulle part (c'est la
         garantie qu'il ne fuite pas), donc la seule façon de l'ouvrir est de
         connaître son adresse. Autant la donner, cliquable, dans le terminal. */
      log(
        `⚠ brouillon : http://localhost:5173${post.url}  (noindex, hors sitemap, hors index)${
          post.isScheduled && !post.isDraft ? ' — publication programmée' : ''
        }`,
      );
    }

    /* — Catégories — */
    for (const category of categories) {
      const slug = category.slug[lang];
      const categoryPosts = posts.filter((p) => p.categoryKey === category.key);
      const catPages = paginate(categoryPosts, PER_PAGE);

      catPages.forEach((pagePosts, i) => {
        const page = i + 1;
        const url = u.category(slug, page);
        const heading = category.label[lang];
        const description = category.description?.[lang] || '';
        const html = listingPage({
          lang,
          kind: 'category',
          title:
            page === 1
              ? `${heading} — ${t.blogTitle}`
              : `${heading} — ${t.pageOf(page, catPages.length)} — ${t.blogTitle}`,
          heading,
          description,
          path: url,
          posts: pagePosts,
          page,
          totalPages: catPages.length,
          categories,
          activeCategorySlug: slug,
          assets,
          hrefFor: (n) => u.category(slug, n),
          alternates:
            page === 1
              ? LANG_CODES.filter((code) => category.slug[code]).map((code) => ({
                  lang: code,
                  path: urls(code).category(category.slug[code]),
                }))
              : [],
          schema: graph([
            organizationNode(),
            websiteNode(lang),
            collectionNode({ lang, path: url, name: heading, description, posts: pagePosts }),
            breadcrumbNode([
              { name: t.home, path: '/' },
              { name: t.blog, path: u.index() },
              { name: heading, path: u.category(slug) },
            ]),
          ]),
        });
        writePage(url, html);
        track('blog', {
          loc: url,
          changefreq: 'weekly',
          priority: page === 1 ? '0.7' : '0.4',
          lastmod: isoDay(newestUpdate(categoryPosts)),
        });
      });
    }

    /* — Tags — */
    const usedTags = unique(posts.flatMap((p) => p.tags));
    for (const tagKey of usedTags) {
      const tag = taxonomy.tags.find((x) => x.key === tagKey);
      const label = tag?.label?.[lang] || tagKey;
      const tagPosts = posts.filter((p) => p.tags.includes(tagKey));
      const tagPages = paginate(tagPosts, PER_PAGE);

      tagPages.forEach((pagePosts, i) => {
        const page = i + 1;
        const url = u.tag(tagKey, page);
        const html = listingPage({
          lang,
          kind: 'tag',
          title: `${label} — ${t.blogTitle}`,
          heading: t.articlesTagged(label),
          description: tag?.description?.[lang] || '',
          path: url,
          posts: pagePosts,
          page,
          totalPages: tagPages.length,
          categories,
          assets,
          hrefFor: (n) => u.tag(tagKey, n),
          schema: graph([
            organizationNode(),
            websiteNode(lang),
            collectionNode({ lang, path: url, name: label, description: '', posts: pagePosts }),
            breadcrumbNode([
              { name: t.home, path: '/' },
              { name: t.blog, path: u.index() },
              { name: label, path: u.tag(tagKey) },
            ]),
          ]),
        });
        writePage(url, html);
        track('blog', { loc: url, changefreq: 'weekly', priority: '0.4', lastmod: isoDay(newestUpdate(tagPosts)) });
      });
    }

    /* — Auteurs — */
    const usedAuthors = unique(posts.map((p) => p.authorKey));
    for (const authorKey of usedAuthors) {
      const authorPosts = posts.filter((p) => p.authorKey === authorKey);
      /* Nom déjà résolu dans la langue courante par decorate() */
      const author = { ...authors[authorKey], ...authorPosts[0].author };
      const slug = slugify(author.slug || authorKey);
      const url = u.author(slug);
      const person = personByAuthor.get(authorKey);
      const html = listingPage({
        lang,
        kind: 'author',
        /* Le titre porte le nom ET le métier : une recherche sur un nom
           répandu se départage sur ce qui suit le nom. */
        title: author.jobTitle
          ? `${author.name} — ${author.jobTitle} | ${t.blogTitle}`
          : `${author.name} — ${t.blogTitle}`,
        heading: t.articlesBy(author.name),
        description: author.bio || '',
        path: url,
        posts: authorPosts.slice(0, PER_PAGE * 3),
        page: 1,
        totalPages: 1,
        categories,
        assets,
        hrefFor: () => url,
        /* Bloc d'identité : métier + liens `rel="me"` vers ses profils. Il
           double en HTML ce que `sameAs` déclare en JSON-LD — jusqu'ici, la
           page d'auteur ne renvoyait vers aucun de ses profils. */
        extraHtml: authorProfile(author, lang),
        schema: graph([
          organizationNode(),
          websiteNode(lang),
          person,
          /* ProfilePage plutôt que CollectionPage : c'est le type que Google
             attend d'une page qui PRÉSENTE quelqu'un, et il désigne
             explicitement la personne concernée via `mainEntity`. Une
             CollectionPage seule décrivait une liste d'articles sans jamais
             dire de qui elle parle. */
          {
            '@type': 'ProfilePage',
            '@id': `${abs(url)}#profile`,
            url: abs(url),
            name: author.name,
            ...(author.bio ? { description: author.bio } : {}),
            inLanguage: LANGS[lang].locale,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            mainEntity: { '@id': personId(author.slug || authorKey) },
            dateModified: newestUpdate(authorPosts).toISOString(),
          },
          collectionNode({ lang, path: url, name: author.name, description: '', posts: authorPosts }),
          breadcrumbNode([
            { name: t.home, path: '/' },
            { name: t.blog, path: u.index() },
            { name: author.name, path: url },
          ]),
        ]),
      });
      writePage(url, html);
      track('blog', { loc: url, changefreq: 'monthly', priority: '0.3', lastmod: isoDay(newestUpdate(authorPosts)) });
    }

    /* — Archives par année et par mois —
       Générées uniquement pour les périodes qui contiennent des articles :
       aucune page vide n'est possible, la structure vient du contenu. */
    for (const year of archives) {
      const yearPosts = posts.filter((p) => p.publishedAt.getUTCFullYear() === year.year);
      const yearPages = paginate(yearPosts, PER_PAGE);
      const monthLinks = `<nav class="archive-siblings" aria-label="${t.archives}">${year.months
        .map((m) => `<a href="${u.month(year.year, m.month)}">${m.label} <span>${m.count}</span></a>`)
        .join('')}</nav>`;

      yearPages.forEach((pagePosts, i) => {
        const pageNo = i + 1;
        const url = u.year(year.year, pageNo);
        writePage(
          url,
          archivePage({
            lang,
            heading: t.archiveYear(year.year),
            title: `${t.archiveYear(year.year)} | ${t.blogTitle}`,
            description: t.archiveYearMeta(year.year),
            path: url,
            posts: pagePosts,
            page: pageNo,
            totalPages: yearPages.length,
            hrefFor: (n) => u.year(year.year, n),
            categories,
            archives,
            assets,
            activeArchive: String(year.year),
            siblings: monthLinks,
            schema: graph([
              organizationNode(),
              websiteNode(lang),
              collectionNode({ lang, path: url, name: t.archiveYear(year.year), description: '', posts: pagePosts }),
              breadcrumbNode([
                { name: t.home, path: '/' },
                { name: t.blog, path: u.index() },
                { name: String(year.year), path: u.year(year.year) },
              ]),
            ]),
          }),
        );
        track('blog', { loc: url, changefreq: 'monthly', priority: '0.4', lastmod: isoDay(newestUpdate(pagePosts)) });
      });

      for (const month of year.months) {
        const monthPosts = yearPosts.filter((p) => p.publishedAt.getUTCMonth() + 1 === month.month);
        const monthPages = paginate(monthPosts, PER_PAGE);
        monthPages.forEach((pagePosts, i) => {
          const pageNo = i + 1;
          const url = u.month(year.year, month.month, pageNo);
          writePage(
            url,
            archivePage({
              lang,
              heading: t.archiveMonth(month.label, year.year),
              title: `${t.archiveMonth(month.label, year.year)} | ${t.blogTitle}`,
              description: t.archiveMonthMeta(month.label, year.year),
              path: url,
              posts: pagePosts,
              page: pageNo,
              totalPages: monthPages.length,
              hrefFor: (n) => u.month(year.year, month.month, n),
              categories,
              archives,
              assets,
              activeArchive: `${year.year}-${month.month}`,
              siblings: `<p class="archive-parent"><a href="${u.year(year.year)}">${t.archiveYear(year.year)}</a></p>`,
              schema: graph([
                organizationNode(),
                websiteNode(lang),
                collectionNode({ lang, path: url, name: t.archiveMonth(month.label, year.year), description: '', posts: pagePosts }),
                breadcrumbNode([
                  { name: t.home, path: '/' },
                  { name: t.blog, path: u.index() },
                  { name: String(year.year), path: u.year(year.year) },
                  { name: month.label, path: u.month(year.year, month.month) },
                ]),
              ]),
            }),
          );
          track('blog', { loc: url, changefreq: 'monthly', priority: '0.3', lastmod: isoDay(newestUpdate(pagePosts)) });
        });
      }
    }

    /* — Index des auteurs — */
    if (authorList.length > 0) {
      const url = u.authors();
      writePage(
        url,
        authorsPage({
          lang,
          authors: authorList,
          categories,
          assets,
          alternates: staticAlternates((code) => urls(code).authors()),
          schema: graph([
            organizationNode(),
            websiteNode(lang),
            /* La page qui présente les auteurs doit décrire les auteurs :
               sans ces nœuds, elle n'était qu'une liste de liens. */
            ...personByAuthor.values(),
            breadcrumbNode([
              { name: t.home, path: '/' },
              { name: t.blog, path: u.index() },
              { name: t.authors, path: url },
            ]),
          ]),
        }),
      );
      track('blog', { loc: url, changefreq: 'monthly', priority: '0.4', lastmod: isoDay(newestUpdate(posts)) });
    }

    /* — Crédits et licence des photographies —
       Générée dès qu'une photographie est déclarée. Elle DOIT exister : les
       données structurées de chaque photo pointent vers elle via
       `acquireLicensePage`, et un lien mort y ruinerait la déclaration de
       licence en plus de casser le garde-fou anti-lien-mort. */
    const creditPhotos = [...photosByLang[lang].values()];
    if (creditPhotos.length > 0) {
      /* Un nœud par photographe distinct. On réutilise celui de la langue
         courante quand l'auteur y publie — il porte alors `knowsAbout` —, et
         on le construit sinon. L'`@id` est le même dans les deux cas : c'est
         toujours la même personne. */
      const creditPersons = unique(creditPhotos.map((photo) => photo.photographer.key)).map(
        (key) =>
          personByAuthor.get(key) || personNode(localizeAuthor(authors[key], key, lang)),
      );
      const url = u.photoCredits();
      writePage(
        url,
        photoCreditsPage({
          lang,
          photos: creditPhotos,
          posts,
          categories,
          assets,
          alternates: staticAlternates((code) => urls(code).photoCredits()),
          schema: graph([
            organizationNode(),
            websiteNode(lang),
            /* Les nœuds des photographes CRÉDITÉS, pas ceux des auteurs
               d'articles. La distinction compte : un photographe peut n'avoir
               publié aucun article dans cette langue — c'est le cas de la
               version anglaise — et son nœud manquerait alors, laissant les
               crédits pointer vers un `@id` que rien ne définit. */
            ...creditPersons,
            {
              '@type': 'CollectionPage',
              '@id': `${abs(url)}#collection`,
              url: abs(url),
              name: t.photoCreditsTitle,
              description: t.photoCreditsMeta,
              inLanguage: LANGS[lang].locale,
              isPartOf: { '@id': `${SITE_URL}/#website` },
              /* Les ImageObject complets, licence comprise : cette page est
                 aussi une source valide pour l'indexation d'images. */
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: creditPhotos.map((photo, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: imageObjectNode(photo),
                })),
              },
            },
            breadcrumbNode([
              { name: t.home, path: '/' },
              { name: t.blog, path: u.index() },
              { name: t.photoCredits, path: url },
            ]),
          ]),
        }),
      );
      track('blog', { loc: url, changefreq: 'monthly', priority: '0.3', lastmod: isoDay(new Date()) });
    }

    /* — Recherche (noindex : outil, pas contenu) — */
    writePage(
      u.search(),
      searchPage({
        lang,
        categories,
        assets,
        archives,
        topics,
        recent: posts.slice(0, 6),
        /* Suggestions : les tags les plus employés, donc toujours en phase avec
           le contenu réel. Aucune requête inventée. */
        suggestions: unique(posts.flatMap((p) => p.tagLabels.map((x) => x.label))).slice(0, 6),
        indexUrl: u.searchIndex(),
        alternates: staticAlternates((code) => urls(code).search()),
        schema: graph([organizationNode(), websiteNode(lang)]),
      }),
    );
    write(u.searchIndex(), searchIndex(posts));

    /* — RSS — */
    write(u.rss(), rss({ lang, posts, path: u.rss() }));
  }

  /* — Garde-fou : aucun lien interne mort — */
  assertNoBrokenInternalLinks(byLang, allUrls);
  if (PREVIEW) assertNoBrokenInternalLinks(draftsByLang, allUrls);

  /* — Sitemaps + robots — */
  const today = isoDay(new Date());
  write('/sitemap-pages.xml', sitemap(sitemapEntries.pages));
  write('/sitemap-blog.xml', sitemap(sitemapEntries.blog));
  write('/sitemap.xml', sitemapIndex(['/sitemap-pages.xml', '/sitemap-blog.xml'], today));
  write('/robots.txt', robots('/sitemap.xml'));

  /* — Rapport — */
  const total = LANG_CODES.reduce((n, lang) => n + byLang[lang].length, 0);
  process.stdout.write(
    `\n  ✓ ${filesWritten} fichiers écrits dans dist/ — ${total} article(s), ${sitemapEntries.blog.length} URL(s) au sitemap\n`,
  );
  process.stdout.write(`  ✓ domaine : ${SITE_URL}\n`);
  if (PREVIEW) {
    const n = LANG_CODES.reduce((sum, lang) => sum + draftsByLang[lang].length, 0);
    process.stdout.write(`  ⚠ mode relecture : ${n} brouillon(s) rendu(s), en noindex et hors sitemap\n`);
  }
  if (warnings.length > 0) {
    process.stdout.write(`\n  ⚠ ${warnings.length} avertissement(s) :\n`);
    warnings.forEach((w) => process.stdout.write(`    · ${w}\n`));
  }
  process.stdout.write('\n');
};

try {
  main();
} catch (error) {
  const label = error instanceof ContentError ? 'Contenu invalide' : 'Échec de la génération';
  process.stderr.write(`\n✗ Blog — ${label} : ${error.message}\n\n`);
  process.exitCode = 1;
}
