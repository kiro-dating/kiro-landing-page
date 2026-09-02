#!/usr/bin/env node
/**
 * Dérivation des photographies originales du blog.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CE QUE FAIT CE SCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * Il part des originaux pleine résolution (hors dépôt public) et produit les
 * fichiers réellement servis aux lecteurs :
 *
 *     media/photos/<collection>/<id>.jpg          ← original, non publié
 *          ↓
 *     public/images/blog/photos/<collection>/     ← dérivés, publiés
 *          <id>-480.avif   <id>-480.webp
 *          <id>-900.avif   <id>-900.webp
 *          <id>-1560.avif  <id>-1560.webp
 *          <id>.jpg                                ← repli universel
 *
 * Trois choses le distinguent d'un simple redimensionnement :
 *
 *   1. Il ÉCRIT les dimensions réelles dans content/blog/photos.json. Le
 *      générateur du blog n'a donc besoin d'aucune bibliothèque d'images pour
 *      poser width/height sur chaque balise — et la page ne saute jamais au
 *      chargement.
 *
 *   2. Il EMBARQUE les métadonnées IPTC/XMP dans chaque fichier : auteur,
 *      copyright, ligne de crédit, URL de licence. Google lit ces champs comme
 *      source alternative aux données structurées ; les deux déclarations
 *      doivent coïncider, et c'est la même table (PHOTO_LICENSES) qui alimente
 *      les deux. Une photo copiée hors du site emporte son crédit avec elle.
 *
 *   3. Il RETIRE tout le reste : géolocalisation, numéro de série d'appareil,
 *      miniature intégrée. Publier la position GPS d'un lieu de prise de vue
 *      personnel n'a aucun intérêt éditorial et en a un pour qui voudrait
 *      pister un photographe.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UTILISATION
 * ─────────────────────────────────────────────────────────────────────────────
 *     node scripts/media/photos-kiro.mjs            dérive ce qui manque
 *     node scripts/media/photos-kiro.mjs --force    redérive tout
 *     node scripts/media/photos-kiro.mjs --check    ne produit rien, vérifie
 *
 * `--check` est le mode utilisé par les tests : il échoue si un fichier
 * déclaré au registre est absent du disque, sans jamais rien écrire.
 *
 * Prérequis, uniquement pour PRODUIRE (jamais pour `--check`) :
 *   · `sharp`, volontairement hors dépendances du projet — voir loadSharp() ;
 *   · `exiftool`, pour les métadonnées. Sans lui, les images sont quand même
 *     produites et le script le signale : les fichiers restent valides,
 *     seulement moins bien documentés.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { PATHS, PHOTO_LICENSES, SITE_URL } from '../blog/config.mjs';

/**
 * `sharp` est importé À LA DEMANDE, et volontairement absent des dépendances
 * du projet.
 *
 * Raison : les dérivées sont versionnées dans public/. Ni `npm run build`, ni
 * le déploiement, ni les tests n'ont donc besoin d'une bibliothèque d'images —
 * seule la RE-dérivation en a besoin, c'est-à-dire le jour où une photo est
 * ajoutée ou recadrée. Faire porter au projet entier une dépendance native
 * lourde pour cet usage-là serait un mauvais échange.
 *
 * Conséquence pratique : `--check` fonctionne partout, sans rien installer.
 */
const loadSharp = async () => {
  try {
    return (await import('sharp')).default;
  } catch {
    throw new Error(
      'sharp est requis pour dériver les images, et n’est pas installé.\n' +
        '    Il n’est PAS une dépendance du projet — les dérivées sont versionnées,\n' +
        '    donc le build et le déploiement n’en ont jamais besoin.\n' +
        '    Pour cette opération ponctuelle :  npm i --no-save sharp',
    );
  }
};

const REGISTRY = path.join(PATHS.content, 'photos.json');
const AUTHORS = path.join(PATHS.content, 'authors.json');

const FORCE = process.argv.includes('--force');
const CHECK = process.argv.includes('--check');

/*
 * Réglages d'encodage.
 *
 * `chromaSubsampling: '4:2:0'` est explicite parce que sharp encode l'AVIF en
 * 4:4:4 par défaut : sur une photographie chargée en feuillage, ce défaut
 * produisait ici des fichiers de 360 ko là où le 4:2:0 en produit trois fois
 * moins, sans différence visible. Le 4:4:4 se justifie sur du texte ou un
 * aplat de couleur, pas sur une photo.
 *
 * `effort: 4` : au-delà, le gain de poids se compte en pourcents et le temps
 * d'encodage en minutes.
 */
const QUALITY = {
  /*
   * La qualité BAISSE quand la largeur monte, et ce n'est pas une économie de
   * bout de chandelle : la colonne d'article fait 772 px CSS. La dérivée de
   * 1560 px n'est donc jamais affichée à sa taille réelle — elle est réduite
   * de moitié par le navigateur sur écran 2×, et cette réduction efface
   * justement les artefacts de compression. Encoder le 1560 aussi finement
   * que le 480 revient à payer des détails que personne ne verra.
   *
   * Le 480, lui, est parfois affiché à 1:1 sur un petit écran 1× : c'est celui
   * qui doit rester le plus propre.
   */
  avif: { 480: 58, 900: 50, 1560: 40 },
  webp: { 480: 80, 900: 74, 1560: 66 },
  jpeg: 82,
};

/** Qualité pour une largeur donnée, avec repli sur la largeur connue la plus proche. */
const qualityFor = (format, width) => {
  const table = QUALITY[format];
  if (table[width]) return table[width];
  const widths = Object.keys(table).map(Number).sort((a, b) => a - b);
  const nearest = widths.find((w) => w >= width) ?? widths[widths.length - 1];
  return table[nearest];
};

/** Largeur du repli JPEG. Une seule : c'est un filet, pas un jeu responsive. */
const FALLBACK_WIDTH = 1200;

/**
 * Couverture d'article : 1200×630, le format Open Graph.
 *
 * Ce n'est pas un recadrage esthétique de plus. C'est l'image que Facebook,
 * LinkedIn, X et iMessage affichent quand quelqu'un partage l'article — donc
 * la seule vue de la photographie que verront des gens qui ne visitent jamais
 * la page. Elle est produite depuis l'original, jamais par étirement de la
 * version d'article : le rapport 1,905 n'a rien à voir avec celui d'une photo.
 *
 * Le JPEG est conservé pour l'Open Graph plutôt qu'un format moderne : les
 * robots d'aperçu des réseaux et des messageries restent le maillon le plus
 * conservateur de la chaîne.
 */
const COVER = { widths: [1200, 2400], ratio: 1200 / 630 };

/**
 * Largeurs de couverture réellement productibles depuis une source donnée.
 *
 * On n'agrandit jamais : une couverture 2400 tirée d'un original de 2048 px
 * serait plus lourde ET moins nette. Quand la source ne suit pas, on s'arrête
 * à sa largeur réelle plutôt que d'annoncer un fichier qui n'existera pas.
 */
const coverWidthsFor = (sourceWidth) => {
  const usable = COVER.widths.filter((w) => w <= sourceWidth);
  if (usable.length === COVER.widths.length) return usable;
  const largest = Math.max(...usable, 0);
  return largest === sourceWidth || sourceWidth < COVER.widths[0]
    ? usable
    : [...usable, sourceWidth];
};


/**
 * Budget de poids par fichier dérivé, en kilo-octets.
 *
 * Ce n'est pas un détail cosmétique : ces images sont chargées dans le corps
 * d'un article, donc elles entrent dans le budget de la page. Un dépassement
 * n'arrête pas la production — il est SIGNALÉ, pour qu'on décide en connaissance
 * de cause plutôt que de découvrir la régression en production.
 */
const BUDGET_KO = { 480: 60, 900: 150, 1560: 320 };

/** Marge accordée au repli WebP, qui compresse moins bien à qualité perçue égale. */
const WEBP_TOLERANCE = 1.7;

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const hasExiftool = () => {
  try {
    execFileSync('exiftool', ['-ver'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

/**
 * Métadonnées embarquées. Les noms de champs sont ceux qu'attendent les
 * moteurs et les logiciels de catalogage (IPTC Core + XMP Rights).
 */
const writeMetadata = (file, { author, credit, license, description, place }) => {
  const deed = license.deed.fr;
  execFileSync(
    'exiftool',
    [
      '-overwrite_original',
      '-all=', //                                  on repart de zéro : plus de GPS, plus de numéro de série
      `-XMP-dc:Creator=${author}`,
      `-XMP-dc:Rights=© ${author}`,
      `-XMP-dc:Description=${description}`,
      `-XMP-photoshop:Credit=${credit}`,
      `-XMP-photoshop:Source=${SITE_URL}`,
      `-XMP-xmpRights:Marked=True`,
      `-XMP-xmpRights:WebStatement=${deed}`,
      `-XMP-xmpRights:UsageTerms=${license.summary.fr}`,
      `-XMP-plus:LicensorURL=${SITE_URL}/blog/credits-photos`,
      `-IPTC:By-line=${author}`,
      `-IPTC:CopyrightNotice=© ${author}`,
      `-IPTC:Credit=${credit}`,
      `-IPTC:Caption-Abstract=${description}`,
      `-IPTC:Sub-location=${place}`,
      `-EXIF:Artist=${author}`,
      `-EXIF:Copyright=© ${author} — ${license.label}`,
      file,
    ],
    { stdio: 'pipe' },
  );
};

const main = async () => {
  const registry = readJson(REGISTRY);
  const authors = readJson(AUTHORS);
  const exiftool = CHECK ? false : hasExiftool();
  const sharp = CHECK ? null : await loadSharp();

  if (!exiftool && !CHECK) {
    process.stdout.write(
      '  ⚠ exiftool absent : les images seront produites SANS métadonnées embarquées.\n' +
        '    Installer exiftool puis relancer avec --force pour les compléter.\n\n',
    );
  }

  const problems = [];
  const warnings = [];
  let produced = 0;
  let skipped = 0;
  let registryChanged = false;

  for (const [id, photo] of Object.entries(registry.photos)) {
    const license = PHOTO_LICENSES[photo.license];
    if (!license) {
      problems.push(`${id} : licence inconnue « ${photo.license} »`);
      continue;
    }

    const author = authors[photo.photographer];
    if (!author) {
      problems.push(`${id} : photographe « ${photo.photographer} » absent de authors.json`);
      continue;
    }
    const authorName = typeof author.name === 'string' ? author.name : author.name.fr;

    const source = path.join(PATHS.photoSources, photo.collection, `${id}.jpg`);
    const outDir = path.join(PATHS.photoOutput, photo.collection);
    const widths = [...photo.widths].sort((a, b) => a - b);
    const largest = widths[widths.length - 1];

    /* Fichiers que le registre promet au reste du générateur. */
    const expected = [
      ...widths.flatMap((w) => [`${id}-${w}.avif`, `${id}-${w}.webp`]),
      `${id}.jpg`,
      ...(photo.cover
        ? [
            ...(photo.coverWidths || []).flatMap((w) => [`${id}-cover-${w}.avif`, `${id}-cover-${w}.webp`]),
            `${id}-cover.jpg`,
          ]
        : []),
    ];

    if (CHECK) {
      const missing = expected.filter((f) => !fs.existsSync(path.join(outDir, f)));
      if (missing.length) problems.push(`${id} : ${missing.length} fichier(s) manquant(s) — ${missing.join(', ')}`);
      if (!photo.width || !photo.height) problems.push(`${id} : dimensions absentes du registre`);
      continue;
    }

    if (!fs.existsSync(source)) {
      problems.push(`${id} : original introuvable — ${path.relative(PATHS.root, source)}`);
      continue;
    }

    const allPresent = expected.every((f) => fs.existsSync(path.join(outDir, f)));
    if (allPresent && photo.width && !FORCE) {
      skipped += 1;
      continue;
    }

    fs.mkdirSync(outDir, { recursive: true });

    /* Le recadrage s'applique AVANT toute réduction : recadrer après aurait
       imposé de convertir les coordonnées, source classique d'erreur d'un
       pixel. `extract` travaille dans le repère de l'original. */
    const base = () => {
      const pipeline = sharp(source).rotate();
      return photo.crop ? pipeline.extract(photo.crop) : pipeline;
    };

    /* Seule la largeur de la source nous intéresse ici : la hauteur des
       dérivées est relue plus bas dans le fichier réellement produit. */
    const meta = await base().metadata();

    if (meta.width < largest) {
      problems.push(
        `${id} : original de ${meta.width} px, plus étroit que la largeur demandée (${largest} px). ` +
          'Aucun agrandissement effectué — fournir un original plus grand ou réduire `widths`.',
      );
      continue;
    }

    for (const width of widths) {
      await base()
        .resize({ width })
        .avif({ quality: qualityFor('avif', width), effort: 4, chromaSubsampling: '4:2:0' })
        .toFile(path.join(outDir, `${id}-${width}.avif`));
      await base()
        .resize({ width })
        .webp({ quality: qualityFor('webp', width), effort: 5 })
        .toFile(path.join(outDir, `${id}-${width}.webp`));

      /* AVIF ne gagne pas toujours : sur un feuillage dense en petite largeur,
         il lui arrive de dépasser le WebP. Servir alors un AVIF plus lourd
         serait absurde, puisque le navigateur le préférerait. On le signale
         plutôt que de le subir. */
      const avifKo = fs.statSync(path.join(outDir, `${id}-${width}.avif`)).size / 1024;
      const webpKo = fs.statSync(path.join(outDir, `${id}-${width}.webp`)).size / 1024;
      /* Le budget porte sur l'AVIF, parce que c'est LUI que reçoit la quasi-
         totalité des navigateurs. Le WebP n'est qu'un repli hérité : on lui
         accorde la tolérance de WEBP_TOLERANCE plutôt que de le juger au même
         mètre, sans quoi on serrerait la qualité de tous pour l'exception. */
      const budget = BUDGET_KO[width];
      if (avifKo > webpKo) {
        warnings.push(`${id} @${width} : AVIF (${Math.round(avifKo)} ko) plus lourd que WebP (${Math.round(webpKo)} ko)`);
      }
      if (budget && avifKo > budget) {
        warnings.push(`${id} @${width} : AVIF ${Math.round(avifKo)} ko, au-dessus du budget de ${budget} ko`);
      }
      if (budget && webpKo > budget * WEBP_TOLERANCE) {
        warnings.push(
          `${id} @${width} : WebP ${Math.round(webpKo)} ko, au-dessus de la tolérance de ${Math.round(budget * WEBP_TOLERANCE)} ko`,
        );
      }
    }
    await base()
      .resize({ width: Math.min(FALLBACK_WIDTH, meta.width) })
      .jpeg({ quality: QUALITY.jpeg, progressive: true, mozjpeg: true })
      .toFile(path.join(outDir, `${id}.jpg`));

    if (photo.cover) {
      /* Le recadrage de couverture s'applique APRÈS le recadrage de base :
         une photo dont on a déjà écarté une zone ne doit pas la voir revenir
         par la couverture. Ses coordonnées sont donc celles de l'image
         recadrée, pas celles de l'original. */
      const coverBase = () => (photo.cover.crop ? base().extract(photo.cover.crop) : base());
      /* Dimensions du recadrage DÉCLARÉ, pas celles que renvoie metadata() :
         sharp n'applique `extract` qu'à l'exécution, donc metadata() décrit
         encore la source. Lire l'une pour l'autre faisait échouer le contrôle
         de rapport sur un recadrage pourtant correct. */
      const coverMeta = photo.cover.crop
        ? { width: photo.cover.crop.width, height: photo.cover.crop.height }
        : { width: meta.width, height: meta.height };
      const got = coverMeta.width / coverMeta.height;
      if (Math.abs(got - COVER.ratio) > 0.02) {
        problems.push(
          `${id} : recadrage de couverture au rapport ${got.toFixed(3)}, attendu ${COVER.ratio.toFixed(3)}. ` +
            'Une couverture hors format serait rognée par les réseaux sociaux, sans contrôle sur ce qui disparaît.',
        );
        continue;
      }
      const coverWidths = coverWidthsFor(coverMeta.width);
      for (const width of coverWidths) {
        await coverBase()
          .resize({ width })
          .avif({ quality: qualityFor('avif', width), effort: 4, chromaSubsampling: '4:2:0' })
          .toFile(path.join(outDir, `${id}-cover-${width}.avif`));
        await coverBase()
          .resize({ width })
          .webp({ quality: qualityFor('webp', width), effort: 5 })
          .toFile(path.join(outDir, `${id}-cover-${width}.webp`));
      }
      await coverBase()
        .resize({ width: COVER.widths[0] })
        .jpeg({ quality: QUALITY.jpeg, progressive: true, mozjpeg: true })
        .toFile(path.join(outDir, `${id}-cover.jpg`));

      /* Écrit au registre comme le sont width/height : le générateur du blog
         doit connaître les largeurs disponibles sans jamais ouvrir un fichier. */
      if (JSON.stringify(photo.coverWidths) !== JSON.stringify(coverWidths)) {
        photo.coverWidths = coverWidths;
        registryChanged = true;
      }
    }

    if (exiftool) {
      const credit = `Photo : ${authorName} (${license.label})`;
      for (const file of expected) {
        writeMetadata(path.join(outDir, file), {
          author: authorName,
          credit,
          license,
          description: photo.alt.fr,
          place: photo.place.fr,
        });
      }
    }

    /* Dimensions de la plus grande dérivée. On les LIT dans le fichier produit
       au lieu de les calculer depuis la source : l'encodeur arrondit la hauteur
       lui-même, et un calcul indépendant finirait par annoncer en HTML et en
       JSON-LD un rapport que le fichier ne respecte pas exactement. */
    const largestFile = await sharp(path.join(outDir, `${id}-${largest}.webp`)).metadata();
    const height = largestFile.height;
    if (photo.width !== largest || photo.height !== height) {
      photo.width = largest;
      photo.height = height;
      registryChanged = true;
    }
    produced += 1;
    process.stdout.write(`  ✓ ${photo.collection}/${id} — ${widths.join(', ')} px (${largest}×${height})\n`);
  }

  if (registryChanged) {
    /* Réécriture du registre avec les dimensions mesurées. L'ordre des clés est
       préservé par JSON.stringify : le diff reste lisible. */
    fs.writeFileSync(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    process.stdout.write('  ✓ content/blog/photos.json — dimensions mises à jour\n');
  }

  if (warnings.length) {
    process.stdout.write(`\n  ⚠ ${warnings.length} avertissement(s) de poids :\n${warnings.map((w) => `      · ${w}`).join('\n')}\n`);
  }

  if (problems.length) {
    process.stderr.write(`\n  ✗ ${problems.length} problème(s) :\n${problems.map((p) => `      · ${p}`).join('\n')}\n\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    CHECK
      ? `\n  ✓ registre conforme : ${Object.keys(registry.photos).length} photographie(s), tous les fichiers présents\n\n`
      : `\n  ✓ ${produced} photographie(s) dérivée(s), ${skipped} déjà à jour\n\n`,
  );
};

main().catch((error) => {
  process.stderr.write(`\n  ✗ ${error.message}\n\n`);
  process.exitCode = 1;
});
