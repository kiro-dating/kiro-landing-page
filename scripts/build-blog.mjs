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
  loadPosts,
  loadTaxonomy,
  relatedPosts,
} from './blog/content.mjs';
import { articlePage, indexPage, listingPage, searchPage, urls } from './blog/templates.mjs';
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
  organizationNode,
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

/** Date de mise à jour la plus récente d'un ensemble d'articles (lastmod du sitemap). */
const newestUpdate = (posts) =>
  posts.length === 0 ? new Date() : new Date(Math.max(...posts.map((p) => p.updatedAt.getTime())));

/* ── Écriture ───────────────────────────────────────────────────────────── */

let filesWritten = 0;

const write = (relativePath, contents) => {
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

  const assets = { css: buildStylesheet(), js: buildScript() };

  /** Articles décorés, par langue. */
  const byLang = {};
  /** Brouillons décorés, par langue — vides hors mode relecture. */
  const draftsByLang = {};
  for (const lang of LANG_CODES) {
    const raw = loadPosts(lang, { taxonomy, authors, warn });
    byLang[lang] = raw.map((post) => decorate(post, { taxonomy, authors }));
    draftsByLang[lang] = PREVIEW
      ? loadPosts(lang, { taxonomy, authors, warn, only: 'drafts' }).map((post) =>
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
          images: post.cover
            ? [
                {
                  loc: post.cover,
                  title: post.coverTitle || post.title,
                  caption: post.coverCaption || post.coverAlt,
                },
              ]
            : [],
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
        schema: graph([organizationNode(), websiteNode(lang), articleNode(post), faqNode(post)]),
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
      const html = listingPage({
        lang,
        kind: 'author',
        title: `${author.name} — ${t.blogTitle}`,
        heading: t.articlesBy(author.name),
        description: author.bio || '',
        path: url,
        posts: authorPosts.slice(0, PER_PAGE * 3),
        page: 1,
        totalPages: 1,
        categories,
        assets,
        hrefFor: () => url,
        schema: graph([
          organizationNode(),
          websiteNode(lang),
          {
            '@type': author.type === 'Organization' ? 'Organization' : 'Person',
            name: author.name,
            ...(author.url ? { url: abs(author.url) } : {}),
            ...(author.jobTitleSchema ? { jobTitle: author.jobTitleSchema } : {}),
            ...(author.bio ? { description: author.bio } : {}),
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

    /* — Recherche (noindex : outil, pas contenu) — */
    writePage(
      u.search(),
      searchPage({
        lang,
        categories,
        assets,
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
