/**
 * Registre de l'espagnol du site : tutoiement (« tú ») et pluriel d'Amérique
 * latine (« ustedes »), comme la fiche Google Play es-419.
 *
 * Régression visée (revue du 2026-10-29) : deux textes de jeux mélangeaient
 * « tú » et le « vosotros » d'Espagne (« os », « vuestra », « descubrid »).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const strings = (node, prefix = '') =>
  typeof node === 'string'
    ? [[prefix, node]]
    : Object.entries(node).flatMap(([key, value]) => strings(value, prefix ? `${prefix}.${key}` : key));

/* Formes propres au « vosotros » : pronoms, possessifs, 2e personne du
   pluriel (-áis, -éis, -ís au présent ; -steis au passé) et impératifs. */
/* Bornes Unicode explicites : en JavaScript, \b ignore les lettres accentuées
   (« vacíos » contiendrait sinon le pronom « os »). */
const VOSOTROS =
  /(?<!\p{L})(vosotr[oa]s|vuestr[oa]s?|os|\p{L}+(?:áis|éis|asteis|isteis)|compartís|descubrid|probad|venid|unid|haced)(?!\p{L})/iu;

describe('Espagnol du site : un seul registre', () => {
  for (const dir of ['es', 'es-MX']) {
    const file = ['translation.json', 'overrides.json']
      .map((name) => path.join(ROOT, 'src/locales', dir, name))
      .find((candidate) => fs.existsSync(candidate));
    it(`${dir} : aucune forme de « vosotros »`, () => {
      const offenders = strings(JSON.parse(fs.readFileSync(file, 'utf8'))).filter(([, text]) => VOSOTROS.test(text));
      expect(offenders).toEqual([]);
    });
  }

  it('le motif détecte bien le « vosotros » (contrôle négatif)', () => {
    expect(VOSOTROS.test('Descubrid vuestra puntuación')).toBe(true);
    expect(VOSOTROS.test('Kiro os propone')).toBe(true);
    expect(VOSOTROS.test('Descubre su puntuación y los rasgos que comparten')).toBe(false);
  });
});
