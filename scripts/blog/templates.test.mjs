/**
 * Tests des gabarits « Kiro Solid » du blog.
 *
 *     npm test            (inclut ce fichier via scripts/blog/vitest.config.mjs)
 *     npm run test:blog   (tests du générateur seuls)
 *
 * Ils portent sur les vrais modules du build, pas sur des copies.
 */

import { describe, expect, it } from 'vitest';

import { APP_CTA, UI } from './config.mjs';
import { insertInlineCta, topLevelH2 } from './inline-cta.mjs';
import { articlePage, indexPage, initialsOf, inlineCta } from './templates.mjs';

const BLOCK = '<aside class="kb-inline-cta">CTA</aside>';
const para = (n, words = 40) => `<p>${Array.from({ length: words }, () => `mot${n}`).join(' ')}</p>\n`;
const ids = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).sort();

/* ── Emplacement de l'encart ────────────────────────────────────────────── */

describe('insertInlineCta', () => {
  it('insère juste avant le H2 de premier niveau le plus proche de 40 %', () => {
    const html =
      para(0) +
      '<h2 id="a">A</h2>\n' + para(1) + para(2) +
      '<h2 id="b">B</h2>\n' + para(3) + para(4) +
      '<h2 id="c">C</h2>\n' + para(5) + para(6) + para(7);
    const ratios = topLevelH2(html).map((h) => h.ratio);
    expect(ratios).toHaveLength(3);
    const { html: out, inserted } = insertInlineCta(html, BLOCK);
    expect(inserted).toBe(true);
    /* « b » est à ~37,5 % du texte : c'est le plus proche de 40 %. */
    expect(out).toContain(`${BLOCK}\n<h2 id="b">`);
    expect(out.split(BLOCK)).toHaveLength(2);
  });

  it('ne retient jamais le premier H2 (pas d’encart dans l’introduction)', () => {
    const html = `<h2 id="intro">Intro</h2>\n${para(0)}${para(1)}<h2 id="suite">Suite</h2>\n${para(2)}`;
    const { html: out } = insertInlineCta(html, BLOCK);
    expect(out.indexOf(BLOCK)).toBeGreaterThan(out.indexOf('id="intro"'));
    expect(out).toContain(`${BLOCK}\n<h2 id="suite">`);
  });

  it('n’insère jamais au milieu d’une liste, d’une citation ou d’un tableau', () => {
    const html =
      `<h2 id="un">Un</h2>\n${para(0)}` +
      `<ul>\n<li>${para(1)}<h2 id="piege-liste">Dans une liste</h2></li>\n</ul>\n` +
      `<blockquote><h2 id="piege-citation">Dans une citation</h2></blockquote>\n` +
      `<div class="post-table-wrap"><table><tbody><tr><td><h2 id="piege-tableau">x</h2></td></tr></tbody></table></div>\n` +
      `${para(2)}<h2 id="deux">Deux</h2>\n${para(3)}`;
    expect(topLevelH2(html).map((h) => /^<h2 id="([^"]+)"/.exec(html.slice(h.index))[1])).toEqual(['un', 'deux']);
    const { html: out } = insertInlineCta(html, BLOCK);
    expect(out).toContain(`${BLOCK}\n<h2 id="deux">`);
    const listPart = out.slice(out.indexOf('<ul>'), out.indexOf('</ul>'));
    expect(listPart).not.toContain(BLOCK);
  });

  it('laisse toutes les ancres intactes et le texte inchangé', () => {
    const html = `${para(0)}<h2 id="a">A</h2>\n${para(1)}<h3 id="a-1">A1</h3>\n${para(2)}<h2 id="b">B</h2>\n${para(3)}`;
    const { html: out } = insertInlineCta(html, BLOCK);
    expect(ids(out)).toEqual(ids(html));
    expect(out.replace(`${BLOCK}\n`, '')).toBe(html);
  });

  it('ne fait rien sans point d’insertion possible', () => {
    const noH2 = `${para(0)}${para(1)}`;
    expect(insertInlineCta(noH2, BLOCK)).toEqual({ html: noH2, inserted: false });
    const oneH2 = `<h2 id="seul">Seul</h2>\n${para(0)}`;
    expect(insertInlineCta(oneH2, BLOCK)).toEqual({ html: oneH2, inserted: false });
    expect(insertInlineCta('', BLOCK).inserted).toBe(false);
  });
});

/* ── Appel à l'action centralisé ────────────────────────────────────────── */

const FORBIDDEN = [
  /testflight/i,
  /telegram/i,
  /whatsapp\.com\/channel/i,
  /apps\.apple\.com/i,
  /play\.google\.com/i,
  /\bb[eê]ta\b/i,
  /liste d.attente/i,
  /waitlist/i,
  /traduction/i,
  /translation/i,
  /cr[ée]ole inclus/i,
  /\bcercles?\b/i,
];

const uiStrings = (lang) =>
  Object.values(UI[lang]).flatMap((value) => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [String(value(2)), String(value('X', 'Y'))];
    if (Array.isArray(value)) return value;
    return [];
  });

describe('APP_CTA', () => {
  it('mène à la page d’accueil du site tant que l’app n’est pas publiée', () => {
    expect(APP_CTA.href).toBe('/');
    expect(APP_CTA.label.fr).toBe('Découvrir Kiro');
    expect(APP_CTA.label.en).toBe('Discover Kiro');
  });

  it('les libellés du bouton viennent de APP_CTA', () => {
    expect(UI.fr.ctaButton).toBe(APP_CTA.label.fr);
    expect(UI.en.ctaButton).toBe(APP_CTA.label.en);
  });

  it('aucune mention de store, bêta, TestFlight, Telegram, liste d’attente ou fonction en dormance dans l’interface', () => {
    for (const lang of ['fr', 'en']) {
      for (const text of [...uiStrings(lang), APP_CTA.href, APP_CTA.label[lang]]) {
        for (const re of FORBIDDEN) expect(text, `${lang} : « ${text} »`).not.toMatch(re);
      }
    }
  });

  it('l’encart d’article garde data-kiro-cta et vise APP_CTA.href', () => {
    const html = inlineCta('fr');
    expect(html).toContain('data-kiro-cta="blog-inline"');
    expect(html).toContain(`href="${APP_CTA.href}"`);
  });
});

/* ── Pages ──────────────────────────────────────────────────────────────── */

const author = { key: 'auteur', slug: 'auteur', name: 'Pierre Handy Charles', type: 'Person', jobTitle: null, bio: null, avatar: null, url: null };
const fakePost = (html) => ({
  lang: 'fr',
  slug: 'exemple',
  url: '/blog/exemple/',
  title: 'Titre',
  seoTitle: null,
  description: 'Description',
  excerpt: 'Chapeau',
  html,
  toc: [...html.matchAll(/<h2 id="([^"]+)">([^<]*)<\/h2>/g)].map((m) => ({ id: m[1], text: m[2], depth: 2 })),
  readingTime: 4,
  readingLabel: '4 min de lecture',
  categoryKey: 'c',
  categoryLabel: 'Catégorie',
  categorySlug: 'categorie-x',
  tags: [],
  tagLabels: [],
  author,
  publishedIso: '2026-08-31T00:00:00.000Z',
  publishedLabel: '31 août 2026',
  publishedDay: '2026-08-31',
  updatedIso: '2026-08-31T00:00:00.000Z',
  updatedLabel: '31 août 2026',
  wasUpdated: false,
  cover: null,
  coverSources: [],
  coverAlt: '',
  coverPhoto: null,
  faq: [{ question: 'Une question ?', answerHtml: '<p>Une réponse.</p>' }],
  photos: [],
  noindex: false,
  ogImage: '/images/og.jpg',
});
const render = (html) =>
  articlePage({
    lang: 'fr',
    post: fakePost(html),
    related: [],
    assets: { css: '/blog-assets/blog.test.css', js: '/blog-assets/blog.test.js' },
    schema: null,
    alternates: [],
    otherLangUrl: null,
    categories: [],
  });

describe('articlePage', () => {
  const long = `${para(0)}<h2 id="a">A</h2>\n${para(1)}<h2 id="b">B</h2>\n${para(2)}<h2 id="c">C</h2>\n${para(3)}`;

  it('un seul appel à l’action dans l’article : l’encart remplace le bandeau du bas', () => {
    const page = render(long);
    expect(page.match(/data-kiro-cta="blog-inline"/g)).toHaveLength(1);
    expect(page).not.toContain('data-kiro-cta="blog"');
  });

  it('sans point d’insertion, le bandeau du bas est rendu', () => {
    const page = render(para(0));
    expect(page).not.toContain('data-kiro-cta="blog-inline"');
    expect(page.match(/data-kiro-cta="blog"/g)).toHaveLength(1);
  });

  it('conserve les ancres du sommaire, le <details> mobile et la FAQ en accordéon', () => {
    const page = render(long);
    for (const id of ['a', 'b', 'c']) {
      expect(page).toContain(`<h2 id="${id}">`);
      expect(page).toContain(`href="#${id}"`);
    }
    expect(page).toContain('<details class="kb-toc-mobile">');
    expect(page).toMatch(/Sommaire · 3\s+sections/);
    expect(page).toContain('<details class="kb-faq-item">');
    /* Sommaire latéral : <nav> étiqueté, jamais un <aside> imbriqué dans
       <article> (axe : landmark-complementary-is-top-level). */
    expect(page).toContain('<div class="kb-toc-side">');
    expect(page).not.toMatch(/<aside class="kb-toc-side"/);
    expect(page.match(/<h1[\s>]/g)).toHaveLength(1);
  });

  it('aucun lien de store ni de bêta dans le HTML rendu', () => {
    const page = render(long);
    for (const re of FORBIDDEN.slice(0, 8)) expect(page).not.toMatch(re);
  });
});

describe('indexPage', () => {
  it('rend un seul H1 et la barre de filtres avec l’état actif', () => {
    const page = indexPage({
      lang: 'fr',
      posts: [],
      page: 1,
      totalPages: 1,
      categories: [{ key: 'c', slug: { fr: 'cat' }, label: { fr: 'Cat' } }],
      assets: { css: '/a.css', js: '/a.js' },
      schema: null,
      alternates: [],
    });
    expect(page.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(page).toContain('class="kb-chip is-active" href="/blog/" aria-current="page"');
    expect(page).toContain('data-kb-menu');
  });
});

describe('carte « À la une »', () => {
  it('une seule cible : aucun lien auteur dans la carte (C-B-12)', () => {
    const page = indexPage({
      lang: 'fr',
      posts: [fakePost(para(0))],
      page: 1,
      totalPages: 1,
      categories: [],
      assets: { css: '/a.css', js: '/a.js' },
      schema: null,
      alternates: [],
    });
    const feature = page.slice(page.indexOf('<article class="kb-feature">'), page.indexOf('</article>', page.indexOf('<article class="kb-feature">')));
    expect(feature.match(/<a\s/g)).toHaveLength(1);
    expect(feature).toContain('class="kb-stretched" href="/blog/exemple/"');
    expect(feature).toContain('Pierre Handy Charles');
  });
});

describe('initialsOf', () => {
  it('initiales d’une personne, symbole pour une organisation', () => {
    expect(initialsOf({ name: 'Pierre Handy Charles', type: 'Person' })).toBe('PH');
    expect(initialsOf({ name: 'L’équipe Kiro', type: 'Organization' })).toBe('K');
    expect(initialsOf({ name: 'zoé', type: 'Person' })).toBe('Z');
  });
});
