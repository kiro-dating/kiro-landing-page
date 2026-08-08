/**
 * Tests du garde-fou anti-lien-mort.
 *
 *     npm test          (vitest, déjà configuré dans le projet)
 *
 * Aucune dépendance ajoutée : vitest est déjà en devDependencies.
 * Le test porte sur le vrai module utilisé par le build, pas sur une copie.
 */

import { describe, expect, it } from 'vitest';

import { assertNoBrokenInternalLinks, findBrokenInternalLinks } from './links.mjs';

/** Fabrique un article minimal tel que le générateur le passe au contrôle. */
const post = (file, html) => ({ file, html });

/** URLs « réellement générées » d'un build fictif. */
const generated = new Set(['/blog/', '/blog/article-publie/', '/en/blog/', '/en/blog/published-post/']);

describe('findBrokenInternalLinks', () => {
  it('accepte un lien vers un article réellement généré', () => {
    const byLang = {
      fr: [post('fr/a.md', '<a href="/blog/article-publie/">voir</a>')],
      en: [],
    };
    expect(findBrokenInternalLinks(byLang, generated)).toEqual([]);
  });

  it('refuse un lien vers un article qui n’existe pas', () => {
    const byLang = {
      fr: [post('fr/a.md', '<a href="/blog/article-a-venir/">voir</a>')],
      en: [],
    };
    expect(findBrokenInternalLinks(byLang, generated)).toEqual(['fr/a.md → /blog/article-a-venir/']);
  });

  it('tolère l’absence de barre oblique finale', () => {
    const byLang = { fr: [post('fr/a.md', '<a href="/blog/article-publie">voir</a>')], en: [] };
    expect(findBrokenInternalLinks(byLang, generated)).toEqual([]);
  });

  it('contrôle aussi le préfixe anglais', () => {
    const byLang = {
      fr: [],
      en: [post('en/a.md', '<a href="/en/blog/missing-post/">see</a>')],
    };
    expect(findBrokenInternalLinks(byLang, generated)).toEqual(['en/a.md → /en/blog/missing-post/']);
  });

  it('ignore ce que le générateur ne maîtrise pas : landing page, ancres, externes', () => {
    const byLang = {
      fr: [
        post(
          'fr/a.md',
          [
            '<a href="/">accueil</a>',
            '<a href="/#jeux">jeux</a>',
            '<a href="/aide/faq/">aide</a>',
            '<a href="https://www.pierrehandy.com/">portfolio</a>',
            '<a href="mailto:bonjour@kirodating.com">écrire</a>',
          ].join(''),
        ),
      ],
      en: [],
    };
    expect(findBrokenInternalLinks(byLang, generated)).toEqual([]);
  });

  it('ne confond pas un chemin qui commence par les mêmes lettres', () => {
    /* « /blogue-interne/ » ne doit pas être pris pour une URL du blog. */
    const byLang = { fr: [post('fr/a.md', '<a href="/blogue-interne/">x</a>')], en: [] };
    expect(findBrokenInternalLinks(byLang, generated)).toEqual([]);
  });

  it('ignore la partie ancre et la chaîne de requête', () => {
    const byLang = {
      fr: [post('fr/a.md', '<a href="/blog/article-publie/#faq">voir</a>')],
      en: [],
    };
    expect(findBrokenInternalLinks(byLang, generated)).toEqual([]);
  });

  it('signale chaque lien fautif, pas seulement le premier', () => {
    const byLang = {
      fr: [
        post('fr/a.md', '<a href="/blog/x/">1</a><a href="/blog/y/">2</a>'),
        post('fr/b.md', '<a href="/blog/z/">3</a>'),
      ],
      en: [],
    };
    expect(findBrokenInternalLinks(byLang, generated)).toHaveLength(3);
  });

  it('accepte une langue sans aucun article', () => {
    expect(findBrokenInternalLinks({ fr: [], en: [] }, generated)).toEqual([]);
  });
});

describe('assertNoBrokenInternalLinks', () => {
  it('ne lève rien quand tout résout', () => {
    const byLang = { fr: [post('fr/a.md', '<a href="/blog/article-publie/">ok</a>')], en: [] };
    expect(() => assertNoBrokenInternalLinks(byLang, generated)).not.toThrow();
  });

  it('fait échouer le build et nomme le fichier fautif', () => {
    const byLang = { fr: [post('fr/a.md', '<a href="/blog/article-a-venir/">x</a>')], en: [] };
    let message = '';
    try {
      assertNoBrokenInternalLinks(byLang, generated);
    } catch (error) {
      message = error.message;
    }
    expect(message).toMatch(/1 lien\(s\) interne\(s\)/);
    expect(message).toMatch(/fr\/a\.md/);
    expect(message).toMatch(/article-a-venir/);
  });
});
