import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * Garde-fou « vérité produit » du site public.
 *
 * Google (extraits et aperçus IA) a repris pendant des mois des promesses que
 * Kiro ne tenait plus. Ce test empêche qu'une fonctionnalité indisponible soit
 * annoncée dans ce que les moteurs lisent : métadonnées de l'accueil, copie de
 * toutes les langues, articles publiés.
 *
 * Il NE fige PAS la liste : les interdictions viennent du registre
 * src/config/productClaims.json. Une fonctionnalité qui revient passe à
 * `status: "available"` (après validation produit) et cesse d'être bloquée.
 * Réf. : SITE-SEO-2026-10-29 (Kiro Project Guardian v2.1.0).
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const seo = JSON.parse(read('src/config/seo.json'));
const registry = JSON.parse(read('src/config/productClaims.json'));
const indexHtml = read('index.html');

const STATUSES = ['available', 'dormant', 'broken', 'abandoned', 'unverified'];
const SCOPES = ['meta', 'locales', 'blog'];

/** Revendications interdites pour un périmètre donné (statut ≠ available). */
const blocked = (scope, reg = registry) =>
  reg.claims
    .filter((c) => c.status !== 'available' && c.scopes.includes(scope))
    .map((c) => ({ id: c.id, res: c.patterns.map((p) => new RegExp(p, 'iu')) }));

const offenses = (text, scope, reg = registry) =>
  blocked(scope, reg)
    .map(({ id, res }) => ({ id, hits: res.filter((re) => re.test(text)).map(String) }))
    .filter((o) => o.hits.length);

const strings = (node, prefix = '') =>
  typeof node === 'string'
    ? [[prefix, node]]
    : Object.entries(node).flatMap(([k, v]) => strings(v, prefix ? `${prefix}.${k}` : k));

describe('Registre des revendications produit', () => {
  it('chaque entrée documente son statut, sa preuve et son périmètre', () => {
    expect(registry.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const c of registry.claims) {
      expect(STATUSES, c.id).toContain(c.status);
      expect(c.evidence, c.id).toBeTruthy();
      expect(c.scopes.length, c.id).toBeGreaterThan(0);
      for (const s of c.scopes) expect(SCOPES, c.id).toContain(s);
      for (const p of c.patterns) expect(() => new RegExp(p, 'iu'), `${c.id}: ${p}`).not.toThrow();
    }
  });

  it('bloque une promesse indisponible, puis l’autorise si le statut redevient available', () => {
    const planted = 'Kiro : jeux brise-glace et traduction instantanée.';
    expect(offenses(planted, 'meta').map((o) => o.id)).toContain('message-translation');
    const restored = {
      ...registry,
      claims: registry.claims.map((c) => (c.id === 'message-translation' ? { ...c, status: 'available' } : c)),
    };
    expect(offenses(planted, 'meta', restored)).toEqual([]);
  });

  it('n’interdit pas le vocabulaire courant (pas de faux positif)', () => {
    const ordinary =
      'Règles de communauté, vérifie ton adresse e-mail, photos vérifiées avant publication, ' +
      'boostez vos chances, l’influence du lieu, une soirée entre amis.';
    expect(offenses(ordinary, 'locales')).toEqual([]);
  });
});

describe('SEO de la page d’accueil', () => {
  it('injecte titre et description depuis seo.json, sans texte en dur', () => {
    expect(indexHtml).toContain('<title>%KIRO_SEO_TITLE%</title>');
    expect(indexHtml).toContain('content="%KIRO_SEO_DESCRIPTION%"');
  });

  it('respecte des longueurs lisibles dans les résultats Google', () => {
    expect(seo.title.length).toBeLessThanOrEqual(60);
    expect(seo.description.length).toBeGreaterThanOrEqual(110);
    expect(seo.description.length).toBeLessThanOrEqual(160);
  });

  it('ne promet aucune fonctionnalité indisponible', () => {
    const text = `${seo.title}\n${seo.description}\n${indexHtml}`;
    expect(offenses(text, 'meta')).toEqual([]);
  });

  it('reprend les données structurées du blog (une seule source, aucun conflit d’@id)', () => {
    expect(indexHtml).toContain('%KIRO_JSON_LD%');
    expect(indexHtml).not.toMatch(/application\/ld\+json/);
  });
});

describe('Copie publique de toutes les langues', () => {
  for (const lang of fs.readdirSync(path.join(ROOT, 'src/locales'))) {
    it(`${lang} : aucune fonctionnalité indisponible annoncée`, () => {
      /* Langue complète (translation.json) ou variante régionale (overrides.json). */
      const file = ['translation.json', 'overrides.json']
        .map((f) => `src/locales/${lang}/${f}`)
        .find((p) => fs.existsSync(path.join(ROOT, p)));
      const found = strings(JSON.parse(read(file)))
        .map(([key, value]) => ({ key, o: offenses(value, 'locales') }))
        .filter((x) => x.o.length);
      expect(found, JSON.stringify(found, null, 1)).toEqual([]);
    });
  }
});

describe('Articles publiés du blog', () => {
  const files = ['fr', 'en'].flatMap((l) =>
    fs
      .readdirSync(path.join(ROOT, 'content/blog', l))
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .map((f) => `content/blog/${l}/${f}`),
  );
  /* Les articles parlent légitimement de communautés culturelles ou de
     traduction au sens courant : seuls les motifs du périmètre `blog`, qui
     décrivent une FONCTIONNALITÉ (« traduction instantanée »), s'appliquent. */
  const blogBlocked = registry.claims
    .filter((c) => c.status !== 'available' && c.scopes.includes('blog'))
    .map((c) => ({ id: c.id, res: c.patterns.filter((p) => /\s/.test(p)).map((p) => new RegExp(p, 'iu')) }));
  for (const file of files) {
    it(`${file} : aucune fonctionnalité indisponible présentée comme disponible`, () => {
      const text = read(file);
      const hits = blogBlocked.flatMap(({ id, res }) => res.filter((re) => re.test(text)).map((re) => `${id}: ${re}`));
      expect(hits).toEqual([]);
    });
  }
});
