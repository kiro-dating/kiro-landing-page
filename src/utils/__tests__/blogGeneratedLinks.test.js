/**
 * Garde-fou des liens de blog dans les pages GÉNÉRÉES (scripts/blog/links.mjs).
 *
 * Régression visée : sur /en/blog/photo-credits/, le crédit des photos d'un
 * auteur qui ne publie qu'en français pointait vers /en/blog/author/<slug>/,
 * une page jamais générée (6 liens, plus `mainEntityOfPage` en JSON-LD).
 */
import { describe, expect, it } from 'vitest';

import { findBrokenGeneratedLinks } from '../../../scripts/blog/links.mjs';

const SITE = 'https://kirodating.com';
const existing = new Set(['/blog/', '/blog/auteur/pierre/', '/en/blog/', '/en/blog/photo-credits/']);
const page = (html) => [{ file: '/en/blog/photo-credits/', html }];

describe('findBrokenGeneratedLinks', () => {
  it('signale un lien vers une page d’auteur jamais générée', () => {
    expect(findBrokenGeneratedLinks(page('<a href="/en/blog/author/pierre/">P</a>'), existing, SITE)).toEqual([
      '/en/blog/photo-credits/ → /en/blog/author/pierre/',
    ]);
  });

  it('signale aussi une URL absolue de blog citée dans le JSON-LD', () => {
    const html = '<script type="application/ld+json">{"mainEntityOfPage":"https://kirodating.com/en/blog/author/pierre/"}</script>';
    expect(findBrokenGeneratedLinks(page(html), existing, SITE)).toHaveLength(1);
  });

  it('accepte le repli vers la page d’auteur dans une autre langue', () => {
    const html = '<a href="/blog/auteur/pierre/">P</a> {"mainEntityOfPage":"https://kirodating.com/blog/auteur/pierre/"}';
    expect(findBrokenGeneratedLinks(page(html), existing, SITE)).toEqual([]);
  });

  it('ignore la landing, le centre d’aide, les ancres et les fichiers', () => {
    const html =
      '<a href="/#jeux">j</a><a href="https://aide.kirodating.com/support">a</a>' +
      '<a href="/en/blog/#top">t</a><link href="/blog/rss.xml"><a href="/blog-assets/blog.abc.css">c</a>';
    expect(findBrokenGeneratedLinks(page(html), existing, SITE)).toEqual([]);
  });

  it('lit aussi les apostrophes, www., http:// et les barres échappées du JSON', () => {
    const variants = [
      "<a href='/en/blog/author/pierre/'>P</a>",
      '{"url":"https://www.kirodating.com/en/blog/author/pierre/"}',
      '{"url":"http://kirodating.com/en/blog/author/pierre/"}',
      '{"url":"https:\\/\\/kirodating.com\\/en\\/blog\\/author\\/pierre\\/"}',
    ];
    for (const html of variants) expect(findBrokenGeneratedLinks(page(html), existing, SITE), html).toHaveLength(1);
  });

  it('décode les chemins encodés et contrôle les slugs contenant un point', () => {
    expect(findBrokenGeneratedLinks(page('<a href="/blog/auteur/pi%65rre/">P</a>'), existing, SITE)).toEqual([]);
    expect(findBrokenGeneratedLinks(page('<a href="/blog/v1.2/">v</a>'), existing, SITE)).toHaveLength(1);
  });
});

