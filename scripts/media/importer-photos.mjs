#!/usr/bin/env node
/**
 * Import vérifié des photographies éditoriales depuis Wikimedia Commons.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI CE SCRIPT EXISTE
 * ─────────────────────────────────────────────────────────────────────────────
 * L'environnement d'assistance ne peut pas joindre commons.wikimedia.org : le
 * domaine y répond « cache-only and cannot be fetched ». Impossible donc d'y
 * relire une licence, et impossible d'y télécharger un fichier. Or la règle du
 * projet est absolue : aucune image n'est intégrée sans que sa page source ait
 * été relue.
 *
 * Ce script fait ce travail depuis TA machine, qui a un accès normal au réseau.
 * Il ne se contente pas de télécharger : il interroge l'API de Commons et
 * COMPARE ce qu'elle renvoie à ce qu'on attend. Si l'auteur ou la licence ont
 * changé depuis la vérification, il refuse le fichier et le dit.
 *
 *     node scripts/media/importer-photos.mjs
 *
 * Sorties :
 *     public/images/blog/photos/<nom>.<ext>          fichier original
 *     docs/seo/credits-photos.json                   auteur, licence, source
 *
 * Il n'écrit RIEN dans l'article. L'intégration reste une décision manuelle,
 * prise après lecture du rapport que ce script affiche.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'blog', 'photos');
const CREDITS = path.join(ROOT, 'docs', 'seo', 'credits-photos.json');

/**
 * Ce qu'on attend de chaque fichier. `licence` et `auteur` sont des ATTENTES :
 * si Commons répond autre chose, le fichier est rejeté, pas corrigé en silence.
 */
const PHOTOS = [
  {
    id: 'cuisine-haitienne-table',
    file: 'Ayiti&DR 2007 085.jpg',
    auteur: 'Coolsarahs',
    licenceAttendue: /public domain|pd-|cc0/i,
    creditFr: 'Photo : Coolsarahs, domaine public, via Wikimedia Commons',
    note: 'Recadrer sur la nourriture pour écarter mains, corps et emballages en bordure.',
  },
  {
    id: 'carnaval-caribeen-toronto',
    file: 'Dragon at Toronto Caribbean Carnival Parade (42097747670).jpg',
    auteur: 'Peter Kudlacz',
    licenceAttendue: /cc by 2\.0/i,
    creditFr: 'Photo : Peter Kudlacz, CC BY 2.0, via Wikimedia Commons',
    note: 'Recadrer sur le char pour réduire publicités et texte commercial.',
  },
  {
    id: 'poulet-jerk-jamaicain-vancouver',
    file: 'Jamaican jerk chicken at The Reef (21110397941).jpg',
    auteur: 'Ruth Hartnup',
    licenceAttendue: /cc by 2\.0/i,
    creditFr: 'Photo : Ruth Hartnup, CC BY 2.0, via Wikimedia Commons',
    note: 'Aucun visage, aucune marque relevée. Recadrage a priori inutile.',
  },
  {
    id: 'mangu-dominicain',
    file: 'Dominican Mangu.jpg',
    auteur: 'Ll1324',
    licenceAttendue: /cc0/i,
    creditFr: 'Photo : Ll1324, CC0 1.0, via Wikimedia Commons',
    note: 'Facultative — à n’intégrer que si elle sert le rythme de l’article.',
    optionnelle: true,
  },
];

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'KiroBlog/1.0 (https://kirodating.com; import éditorial vérifié)';

/** Texte brut d'un champ extmetadata, qui arrive parfois en HTML. */
const plain = (value) =>
  String(value ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const fetchMeta = async (file) => {
  const url =
    `${API}?action=query&format=json&origin=*&prop=imageinfo` +
    `&iiprop=url|extmetadata|mime|size&titles=${encodeURIComponent(`File:${file}`)}`;
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`API Commons : HTTP ${res.status}`);
  const pages = (await res.json())?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined) throw new Error('fichier introuvable sur Commons');
  const info = page.imageinfo?.[0];
  const meta = info?.extmetadata ?? {};
  return {
    descriptionUrl: info.descriptionurl,
    downloadUrl: info.url,
    mime: info.mime,
    largeur: info.width,
    hauteur: info.height,
    auteur: plain(meta.Artist?.value),
    licence: plain(meta.LicenseShortName?.value),
    conditions: plain(meta.UsageTerms?.value),
    licenceUrl: plain(meta.LicenseUrl?.value),
    usageCommercial: plain(meta.Restrictions?.value) || 'aucune restriction déclarée',
    description: plain(meta.ImageDescription?.value).slice(0, 160),
  };
};

const download = async (url, dest) => {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`téléchargement : HTTP ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
};

const main = async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const credits = [];
  let refuses = 0;

  for (const photo of PHOTOS) {
    process.stdout.write(`\n▸ ${photo.id}\n`);
    let meta;
    try {
      meta = await fetchMeta(photo.file);
    } catch (error) {
      process.stdout.write(`  ✗ REFUSÉ — ${error.message}\n`);
      refuses += 1;
      continue;
    }

    const auteurOk = meta.auteur.toLowerCase().includes(photo.auteur.toLowerCase());
    const licenceOk = photo.licenceAttendue.test(meta.licence) || photo.licenceAttendue.test(meta.conditions);

    process.stdout.write(`  page      : ${meta.descriptionUrl}\n`);
    process.stdout.write(`  auteur    : ${meta.auteur || '—'}  ${auteurOk ? '✓' : '✗ ATTENDU : ' + photo.auteur}\n`);
    process.stdout.write(`  licence   : ${meta.licence || '—'}  ${licenceOk ? '✓' : '✗ NE CORRESPOND PAS'}\n`);
    process.stdout.write(`  conditions: ${meta.conditions || '—'}\n`);
    process.stdout.write(`  dimensions: ${meta.largeur}×${meta.hauteur} (${meta.mime})\n`);
    if (meta.description) process.stdout.write(`  descript. : ${meta.description}\n`);

    if (!auteurOk || !licenceOk) {
      process.stdout.write(`  ✗ REFUSÉ — l'auteur ou la licence ne correspondent plus à la vérification.\n`);
      refuses += 1;
      continue;
    }

    const ext = path.extname(photo.file) || '.jpg';
    const dest = path.join(OUT_DIR, `${photo.id}${ext}`);
    await download(meta.downloadUrl, dest);
    const ko = (fs.statSync(dest).size / 1024).toFixed(0);
    process.stdout.write(`  ✓ téléchargé : ${path.relative(ROOT, dest)} (${ko} ko)\n`);
    if (photo.note) process.stdout.write(`  → à faire : ${photo.note}\n`);

    credits.push({
      id: photo.id,
      fichierOriginal: path.relative(ROOT, dest),
      pageSource: meta.descriptionUrl,
      auteur: meta.auteur,
      licence: meta.licence,
      licenceUrl: meta.licenceUrl,
      conditions: meta.conditions,
      creditFr: photo.creditFr,
      dimensionsOriginales: `${meta.largeur}×${meta.hauteur}`,
      verifieLe: new Date().toISOString().slice(0, 10),
    });
  }

  fs.mkdirSync(path.dirname(CREDITS), { recursive: true });
  fs.writeFileSync(CREDITS, `${JSON.stringify(credits, null, 2)}\n`, 'utf8');

  process.stdout.write(`\n${credits.length} photo(s) vérifiée(s) et téléchargée(s), ${refuses} refusée(s).\n`);
  process.stdout.write(`Crédits écrits dans ${path.relative(ROOT, CREDITS)}\n`);
  process.stdout.write(
    `\nProchaine étape, à la main : recadrer si nécessaire, convertir en WebP\n` +
      `(macOS : sips -s format webp fichier.jpg --out fichier.webp), puis me le dire\n` +
      `pour que j'insère les figures dans l'article avec crédits et légendes.\n`,
  );
};

main().catch((error) => {
  process.stderr.write(`\n✗ ${error.message}\n`);
  process.exitCode = 1;
});
