import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, PHOTO_LICENSES } from '../../../scripts/blog/config.mjs';

/**
 * Garde-fous des photographies du blog.
 *
 * Publier la photographie de quelqu'un — ici, celle de l'auteur du blog — sans
 * pouvoir en démontrer les droits est la seule erreur de cette famille qui ne
 * se rattrape pas après coup. Ces contrôles rendent l'erreur impossible plutôt
 * que rare :
 *
 *   · une licence inconnue, un photographe fantôme ou une dimension absente
 *     arrêtent le build (scripts/blog/content.mjs) ; on le vérifie ici aussi,
 *     pour que l'échec soit lisible plutôt que déguisé en page cassée ;
 *   · un fichier déclaré mais absent du disque produirait une image morte
 *     accompagnée d'un crédit — pire qu'une image absente ;
 *   · une photo référencée dans un article mais retirée du registre publierait
 *     une image SANS crédit ni licence, exactement ce qu'on veut interdire ;
 *   · et le crédit doit voyager AVEC le fichier : une photo copiée hors du site
 *     doit rester attribuable, sinon la licence ne protège rien.
 *
 * Ce fichier vit dans src/utils/__tests__/ parce que c'est le seul dossier
 * ramassé par `npm test` (cf. vite.config.js → test.include).
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/blog/photos.json'), 'utf8'));
const authors = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/blog/authors.json'), 'utf8'));
const photos = Object.entries(registry.photos);

/** Tous les fichiers Markdown d'articles, toutes langues confondues. */
const articleFiles = Object.values(LANGS).flatMap(({ dir }) => {
  const folder = path.join(ROOT, 'content/blog', dir);
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ lang: dir, slug: f.replace(/\.md$/, ''), path: path.join(folder, f) }));
});

/**
 * Corps d'un article, frontmatter retiré.
 *
 * Le retirer n'est pas un détail : l'en-tête YAML contient des commentaires de
 * documentation, et un exemple de syntaxe écrit là — `![](photo:identifiant)` —
 * serait lu comme une vraie photographie manquante. On regarde donc exactement
 * ce que le moteur de rendu regarde, c'est-à-dire ce qui suit le frontmatter.
 */
const bodyOf = (file) => {
  const raw = fs.readFileSync(file, 'utf8');
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(raw);
  return match ? raw.slice(match[0].length) : raw;
};

describe('registre des photographies', () => {
  it('déclare au moins une photographie', () => {
    expect(photos.length).toBeGreaterThan(0);
  });

  it('chaque photographie porte une licence connue et vérifiable', () => {
    for (const [id, photo] of photos) {
      const license = PHOTO_LICENSES[photo.license];
      expect(license, `${id} : licence « ${photo.license} » absente de PHOTO_LICENSES`).toBeTruthy();
      /* Une licence sans URL publique n'est pas opposable : Google l'ignore, et
         un réutilisateur ne peut pas savoir ce qu'il a le droit de faire. */
      for (const [lang, url] of Object.entries(license.deed)) {
        expect(url, `${id} → deed.${lang}`).toMatch(/^https:\/\//);
      }
      expect(license.label, `${id} : libellé de licence`).toBeTruthy();
    }
  });

  it('chaque photographe est un auteur déjà déclaré, pas une identité parallèle', () => {
    for (const [id, photo] of photos) {
      const author = authors[photo.photographer];
      expect(author, `${id} : photographe « ${photo.photographer} » absent de authors.json`).toBeTruthy();
      /* Réutiliser l'entité Person existante est ce qui empêche l'apparition
         d'un second « auteur » du blog qui serait la même personne. */
      expect(author.type, `${id} : le photographe doit être une personne`).toBe('Person');
      expect(author.slug, `${id} : le photographe doit avoir une page d'auteur`).toBeTruthy();
    }
  });

  it('chaque photographie annonce des dimensions mesurées', () => {
    for (const [id, photo] of photos) {
      const largest = Math.max(...photo.widths);
      expect(photo.width, `${id} : largeur absente — lancer scripts/media/photos-kiro.mjs`).toBe(largest);
      expect(photo.height, `${id} : hauteur absente`).toBeGreaterThan(0);
    }
  });

  it('jamais de date de prise de vue inventée', () => {
    for (const [id, photo] of photos) {
      if (photo.capturedAt === null) continue;
      expect(photo.capturedAt, `${id} : capturedAt doit être AAAA-MM-JJ ou null`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('fichiers dérivés', () => {
  it('tous les fichiers promis par le registre existent réellement', () => {
    const missing = [];
    for (const [id, photo] of photos) {
      const dir = path.join(ROOT, 'public/images/blog/photos', photo.collection);
      const expected = [...photo.widths.flatMap((w) => [`${id}-${w}.avif`, `${id}-${w}.webp`]), `${id}.jpg`];
      for (const file of expected) {
        if (!fs.existsSync(path.join(dir, file))) missing.push(`${photo.collection}/${file}`);
      }
    }
    expect(missing, `Fichiers déclarés mais absents :\n${missing.join('\n')}`).toEqual([]);
  });

  it('le crédit et la licence sont embarqués dans les fichiers eux-mêmes', () => {
    /* Les métadonnées XMP sont stockées en clair dans le fichier : on peut donc
       vérifier leur présence sans aucune bibliothèque d'images. C'est ce qui
       garantit qu'une photo enregistrée depuis le site reste attribuable —
       la déclaration de la page ne suit pas le fichier, celle-ci si. */
    const naked = [];
    for (const [id, photo] of photos) {
      const author = authors[photo.photographer];
      const name = typeof author.name === 'string' ? author.name : author.name.fr;
      const deed = PHOTO_LICENSES[photo.license].deed.fr;
      const file = path.join(ROOT, 'public/images/blog/photos', photo.collection, `${id}.jpg`);
      if (!fs.existsSync(file)) continue;
      const bytes = fs.readFileSync(file, 'latin1');
      if (!bytes.includes(deed)) naked.push(`${id} : URL de licence absente du fichier`);
      /* Le nom est encodé en UTF-8 dans le XMP ; on cherche une partie ASCII
         du nom pour rester indépendant de l'encodage relu. */
      if (!bytes.includes(name.split(' ')[0])) naked.push(`${id} : nom du photographe absent du fichier`);
    }
    expect(naked, `Fichiers sans crédit embarqué :\n${naked.join('\n')}`).toEqual([]);
  });
});

/** Identifiant déclaré en couverture par un article, s'il y en a un. */
const coverPhotoOf = (file) => {
  const raw = fs.readFileSync(file, 'utf8');
  const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(raw);
  if (!front) return null;
  /* Les lignes commentées sont ignorées : le frontmatter documente la syntaxe. */
  const line = front[1]
    .split('\n')
    .find((l) => /^\s*coverPhoto\s*:/.test(l) && !/^\s*#/.test(l));
  return line ? line.split(':').slice(1).join(':').trim().replace(/^['"]|['"]$/g, '') : null;
};

describe('cohérence entre les articles et le registre', () => {
  it('toute photographie citée dans un article existe au registre', () => {
    const unknown = [];
    for (const article of articleFiles) {
      const body = bodyOf(article.path);
      for (const match of body.matchAll(/!\[[^\]]*\]\(photo:([^)\s"]+)/g)) {
        if (!registry.photos[match[1]]) unknown.push(`${article.lang}/${article.slug} → ${match[1]}`);
      }
    }
    expect(unknown, `Photographies citées mais absentes du registre :\n${unknown.join('\n')}`).toEqual([]);
  });

  it('toute couverture photographique existe et dispose de sa déclinaison', () => {
    const problems = [];
    for (const article of articleFiles) {
      const id = coverPhotoOf(article.path);
      if (!id) continue;
      const photo = registry.photos[id];
      if (!photo) {
        problems.push(`${article.slug} : couverture « ${id} » absente du registre`);
        continue;
      }
      /* Une couverture sans son bloc `cover` produirait une page sans image
         d'aperçu : invisible en local, catastrophique au partage. */
      if (!photo.cover) problems.push(`${article.slug} : « ${id} » n'a pas de bloc cover`);
      if (!photo.coverWidths?.length) {
        problems.push(`${article.slug} : « ${id} » n'a pas de largeurs de couverture mesurées`);
      }
      const dir = path.join(ROOT, 'public/images/blog/photos', photo.collection);
      for (const file of [
        `${id}-cover.jpg`,
        ...(photo.coverWidths || []).flatMap((w) => [`${id}-cover-${w}.avif`, `${id}-cover-${w}.webp`]),
      ]) {
        if (!fs.existsSync(path.join(dir, file))) problems.push(`${article.slug} : ${file} absent`);
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  it('les articles listés par une photographie existent', () => {
    const slugs = new Set(articleFiles.map((a) => a.slug));
    const dangling = [];
    for (const [id, photo] of photos) {
      for (const slug of photo.articles || []) {
        if (!slugs.has(slug)) dangling.push(`${id} → ${slug}`);
      }
    }
    expect(dangling, `Articles inexistants référencés :\n${dangling.join('\n')}`).toEqual([]);
  });

  it('toute photographie utilisée dans un article se déclare comme telle', () => {
    /* L'inverse du contrôle précédent : c'est `articles` qui alimente la page
       de crédits. Une photo publiée mais non déclarée y apparaîtrait comme
       « non publiée », donc introuvable pour qui veut savoir d'où elle vient. */
    const undeclared = [];
    for (const article of articleFiles) {
      const used = [
        ...[...bodyOf(article.path).matchAll(/!\[[^\]]*\]\(photo:([^)\s"]+)/g)].map((m) => m[1]),
        /* Servir de couverture EST une publication : sans cette ligne, la photo
           de couverture apparaîtrait « non publiée » sur la page de crédits. */
        coverPhotoOf(article.path),
      ].filter(Boolean);
      for (const id of used) {
        const photo = registry.photos[id];
        if (photo && !(photo.articles || []).includes(article.slug)) {
          undeclared.push(`${id} est publiée dans ${article.slug} sans le déclarer`);
        }
      }
    }
    expect(undeclared, undeclared.join('\n')).toEqual([]);
  });
});

describe('page de crédits', () => {
  it('la route existe dans toutes les langues', () => {
    /* `acquireLicensePage` des données structurées pointe vers cette page. Un
       segment manquant produirait une URL de licence en 404, ce qui invalide
       la déclaration entière aux yeux des moteurs. */
    for (const [code, conf] of Object.entries(LANGS)) {
      expect(conf.segments.photoCredits, `segment photoCredits manquant en ${code}`).toBeTruthy();
    }
  });
});

describe('règle Kiro sur les personnes photographiées', () => {
  /* Aucune personne visible sur une photographie ne doit être présentée comme
     célibataire, comme utilisatrice de Kiro, ou comme cherchant une relation.
     Les légendes parlent du LIEU. Ce contrôle est volontairement littéral :
     il ne juge pas l'intention, il interdit le vocabulaire qui ferait basculer
     une légende de lieu en légende de personne. */
  const FORBIDDEN = [
    /\bcélibataires?\b/i,
    /\bsingles?\b/i,
    /\butilisat(eur|rice)s?\s+(de\s+)?kiro\b/i,
    /\bkiro\s+users?\b/i,
    /\b(cherche|cherchent|cherchant)\s+(l['’]amour|quelqu['’]un|un\s+partenaire)/i,
    /\blooking\s+for\s+(love|someone|a\s+partner)\b/i,
  ];

  it('aucune légende ni texte alternatif ne qualifie les personnes visibles', () => {
    const offenders = [];
    for (const [id, photo] of photos) {
      for (const field of ['alt', 'caption', 'place']) {
        for (const [lang, text] of Object.entries(photo[field] || {})) {
          for (const pattern of FORBIDDEN) {
            if (pattern.test(text)) offenders.push(`${id}.${field}.${lang} → ${pattern}`);
          }
        }
      }
    }
    expect(offenders, `Légendes interdites :\n${offenders.join('\n')}`).toEqual([]);
  });
});
