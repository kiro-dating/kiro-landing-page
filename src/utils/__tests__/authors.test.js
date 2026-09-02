import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Garde-fou : le blog ne présente aucune personne comme fondatrice de Kiro.
 *
 * Décision éditoriale — l'identité personnelle des auteurs est dissociée de la
 * propriété ou de la fondation de Kiro dans le contenu public. Les auteurs
 * restent nommés et crédités ; c'est le lien « untel = fondateur de Kiro » qui
 * ne doit plus apparaître, y compris dans les données structurées.
 *
 * Kiro reste évidemment éditeur : l'auteur `equipe-kiro` est de type
 * Organization et n'est pas concerné par ce contrôle.
 *
 * Le contrôle porte sur la SOURCE DE VÉRITÉ (content/blog/authors.json), d'où
 * dérivent toutes les surfaces : signature d'article, encadré auteur, cartes
 * de /blog/auteurs/, page auteur, JSON-LD, RSS et index de recherche.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const AUTHORS = path.join(ROOT, 'content', 'blog', 'authors.json');

/* Champs rendus publiquement pour un auteur. */
const PUBLIC_FIELDS = ['name', 'jobTitle', 'jobTitleSchema', 'bio', 'urlLabel'];

/* Formulations qui établiraient publiquement ce lien, FR et EN. */
const ROLE_PATTERNS = [
  /\bco[- ]?fondat(eur|rice)\b/i,
  /\bfondat(eur|rice)s?\b/i,
  /\bfounder\b/i,
  /\bco[- ]?founder\b/i,
  /\bcréat(eur|rice) de Kiro\b/i,
  /\bcreator of Kiro\b/i,
];

const flatten = (value, out = []) => {
  if (typeof value === 'string') out.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => flatten(v, out));
  return out;
};

const registry = JSON.parse(fs.readFileSync(AUTHORS, 'utf8'));

/* Seules les personnes réelles sont contrôlées : `equipe-kiro` est une
   Organization, et une organisation peut légitimement être « éditrice ». */
const people = Object.entries(registry).filter(
  ([key, a]) => key !== '_doc' && (a.type || 'Person') === 'Person',
);

describe('registre des auteurs', () => {
  it('contient au moins une personne', () => {
    expect(people.length).toBeGreaterThan(0);
  });

  it('ne présente aucune personne comme fondatrice ou créatrice de Kiro', () => {
    const offenders = [];
    for (const [key, author] of people) {
      for (const field of PUBLIC_FIELDS) {
        for (const text of flatten(author[field])) {
          const hit = ROLE_PATTERNS.find((re) => re.test(text));
          if (hit) offenders.push(`${key}.${field} → « ${text} » (motif ${hit})`);
        }
      }
    }
    expect(offenders, `Mentions interdites :\n${offenders.join('\n')}`).toEqual([]);
  });

  it('garde chaque personne nommée et créditable', () => {
    for (const [key, author] of people) {
      expect(flatten(author.name).join(''), key).not.toBe('');
      expect(author.slug, key).toBeTruthy();
    }
  });
});

/**
 * Hygiène des profils déclarés (`sameAs`).
 *
 * `sameAs` est ce qui dit aux moteurs « ces comptes sont la même personne ».
 * Sa valeur tient entièrement à sa fiabilité : une seule URL douteuse et la
 * déclaration entière perd son sens. Trois défauts la ruinent en silence —
 * un doublon, un paramètre de suivi qui rend l'URL instable, et une adresse
 * non sécurisée. Aucun ne se voit à l'œil dans un fichier JSON.
 */
describe('profils déclarés des auteurs', () => {
  /* Paramètres ajoutés par les boutons « partager » des réseaux. Ils encodent
     la SESSION qui a copié le lien, pas le profil : ils expirent, varient d'un
     partage à l'autre, et transforment une URL d'identité en URL jetable. */
  const TRACKING = /[?&](utm_[a-z]+|igsi|igshid|_r|_t|si|fbclid|gclid)=/i;

  it('chaque URL est sécurisée, canonique et unique', () => {
    for (const [key, author] of people) {
      const list = author.sameAs || [];
      expect(new Set(list).size, `${key} : doublon dans sameAs`).toBe(list.length);
      for (const url of list) {
        expect(url, `${key} → ${url}`).toMatch(/^https:\/\//);
        expect(TRACKING.test(url), `${key} : paramètre de suivi dans ${url}`).toBe(false);
        expect(url.trim(), `${key} : espace superflu dans ${url}`).toBe(url);
      }
    }
  });

  it('le site personnel déclaré figure aussi parmi les profils', () => {
    /* `url` alimente `Person.url`, `sameAs` alimente la désambiguïsation. Un
       site présent dans l'un mais absent de l'autre laisse la moitié du signal
       sur la table. */
    for (const [key, author] of people) {
      if (!author.url || !/^https?:\/\//i.test(author.url)) continue;
      expect(author.sameAs || [], `${key} : ${author.url} absent de sameAs`).toContain(author.url);
    }
  });

  it('aucun profil de la marque Kiro n’est déclaré comme profil personnel', () => {
    /* Les comptes kirosocial appartiennent à l'Organization, pas à la personne.
       Les confondre fusionnerait deux entités distinctes — exactement l'erreur
       inverse de celle que sameAs doit corriger. */
    for (const [key, author] of people) {
      for (const url of author.sameAs || []) {
        expect(/kirosocial/i.test(url), `${key} : ${url} est un compte de marque`).toBe(false);
      }
    }
  });
});
