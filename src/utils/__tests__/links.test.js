import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LINKS, SITE_URL } from '../../config/links.js';
import { HELP } from '../../../scripts/blog/config.mjs';

/**
 * Garde-fou : le support de Kiro ne doit plus jamais pointer vers Kiro Social.
 *
 * Contexte — Kiro Social est un AUTRE projet. Son centre d'aide historique
 * (kirosocial.com/aide) a été retiré et renvoie 404 DEPLOYMENT_NOT_FOUND :
 * pendant un temps, la navigation, le pied de page et le blog de Kiro y
 * envoyaient les utilisateurs. Le centre d'aide officiel est
 * https://aide.kirodating.com/.
 *
 * Ce fichier vit dans src/utils/__tests__/ parce que c'est le seul dossier
 * ramassé par `npm test` (cf. vite.config.js → test.include) : le contrôle
 * tourne donc à chaque exécution des tests, sans configuration supplémentaire.
 */

const OFFICIAL_HELP = 'https://aide.kirodating.com';
const BANNED_HOST = 'kirosocial.com';
/* ESM : pas de __dirname — même approche que scripts/blog/config.mjs. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/* Surfaces réellement livrées aux utilisateurs de Kiro. Volontairement
   restreint : ni docs/, ni content/, ni les fichiers d'exemple — et surtout
   pas d'éventuels fichiers appartenant au projet Kiro Social. */
const PRODUCTION_GLOBS = [
  { dir: 'src', exts: ['.js', '.jsx', '.json'] },
  { dir: path.join('scripts', 'blog'), exts: ['.mjs'] },
  { dir: 'public', exts: ['.js'] },
];

/* Occurrences légitimes de kirosocial.com, tolérées explicitement :
   - les comptes sociaux, qui portent réellement ce nom de marque ;
   - les adresses de courriel, qui sont les boîtes en service (le centre
     d'aide officiel publie lui-même support@kirosocial.com) ;
   - les commentaires d'avertissement qui nomment le domaine pour l'interdire. */
const ALLOWED = [
  /(?:tiktok\.com\/@|instagram\.com\/|facebook\.com\/)kirosocial/,
  /(?:contact|support)@kirosocial\.com/,
  /jamais.*kirosocial\.com|kirosocial\.com.*(?:autre projet|ne répond plus|domaine mort)/i,
];

const walk = (dir, exts, out = []) => {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return out;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      /* __tests__ est exclu : ce fichier nomme forcément le domaine interdit
         pour pouvoir le chercher, et les tests ne sont pas livrés. */
      if (['node_modules', '_to_delete', '__tests__'].includes(entry.name)) continue;
      walk(rel, exts, out);
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(rel);
    }
  }
  return out;
};

describe('centre d’aide Kiro', () => {
  it('le site pointe vers le centre d’aide officiel', () => {
    for (const key of ['support', 'terms', 'privacy']) {
      expect(LINKS[key], key).toMatch(new RegExp(`^${OFFICIAL_HELP}/`));
    }
  });

  it('le générateur du blog pointe vers le même centre d’aide', () => {
    for (const key of ['base', 'support', 'terms', 'privacy']) {
      expect(HELP[key], key).toMatch(new RegExp(`^${OFFICIAL_HELP}/`));
    }
    expect(HELP.support).toBe(LINKS.support);
    expect(HELP.terms).toBe(LINKS.terms);
    expect(HELP.privacy).toBe(LINKS.privacy);
  });

  it('le domaine principal reste kirodating.com', () => {
    expect(SITE_URL).toMatch(/^https:\/\/(www\.)?kirodating\.com$/);
  });

  it('aucune surface de production ne référence le support Kiro Social', () => {
    const offenders = [];
    for (const { dir, exts } of PRODUCTION_GLOBS) {
      for (const file of walk(dir, exts)) {
        const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n');
        lines.forEach((line, i) => {
          if (!line.includes(BANNED_HOST)) return;
          if (ALLOWED.some((re) => re.test(line))) return;
          offenders.push(`${file}:${i + 1} → ${line.trim()}`);
        });
      }
    }
    expect(offenders, `Références interdites :\n${offenders.join('\n')}`).toEqual([]);
  });
});
