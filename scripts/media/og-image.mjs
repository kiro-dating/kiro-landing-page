#!/usr/bin/env node
/**
 * Aperçu de partage (Open Graph) de la page d'accueil.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI CE SCRIPT EXISTE
 * ─────────────────────────────────────────────────────────────────────────────
 * L'image d'aperçu était un fichier dessiné à la main, déposé une fois et jamais
 * revu. Elle a fini par montrer un thème sombre que le site n'a plus, un slogan
 * qu'il ne dit plus, et un nom de domaine qui ne lui appartient pas. Personne ne
 * l'a vu pendant des mois : cette image n'apparaît nulle part sur le site — on
 * ne la découvre qu'en partageant un lien, c'est-à-dire au pire moment.
 *
 * Le problème de fond n'était pas l'image, c'était le procédé. Une ressource
 * qu'il faut penser à refaire finit toujours par mentir. Celle-ci est donc
 * COMPOSÉE À PARTIR DU SITE :
 *
 *   · la copie vient de src/locales/fr/translation.json — exactement les
 *     chaînes que le composant Hero affiche ;
 *   · les couleurs et la typographie viennent du bloc :root de src/index.css —
 *     les mêmes jetons que l'application ;
 *   · le logotype et les glaçons sont les fichiers du site.
 *
 * Changer le slogan ou une couleur de marque suffit donc à rendre l'aperçu
 * périmé — et un test le signale (src/utils/__tests__/og-image.test.js), au
 * lieu de laisser la dérive s'installer en silence.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UTILISATION
 * ─────────────────────────────────────────────────────────────────────────────
 *     npm run og              régénère l'image si les sources ont changé
 *     npm run og -- --force   régénère dans tous les cas
 *     npm run og -- --check   ne produit rien, dit seulement si c'est à jour
 *
 * Produire l'image demande `playwright` et `@fontsource/inter`, qui ne sont
 * VOLONTAIREMENT pas des dépendances du projet (voir loadPlaywright) :
 *     npm i --no-save playwright @fontsource/inter && npx playwright install chromium
 * Le mode `--check`, celui qu'utilisent les tests, n'a besoin d'aucun des deux.
 *
 * Si Chromium est déjà installé ailleurs (image d'intégration continue), le
 * chemin du binaire peut être donné par PLAYWRIGHT_CHROMIUM_PATH.
 *
 * Volontairement HORS de `npm run build` : produire cette image demande un
 * navigateur, et l'exiger à chaque déploiement rendrait le build dépendant
 * d'un binaire lourd pour une ressource qui change deux fois par an. L'image
 * est versionnée ; le test garantit qu'elle reste vraie.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = path.join(ROOT, 'src', 'config', 'og-preview.json');
const OUT_DIR = path.join(ROOT, 'public', 'images');

const FORCE = process.argv.includes('--force');
const CHECK = process.argv.includes('--check');

/** Dimensions imposées par Open Graph. Ni Facebook ni WhatsApp n'en acceptent d'autres sans rogner. */
const SIZE = { width: 1200, height: 630 };

/**
 * Version du gabarit.
 *
 * À incrémenter quand la MISE EN PAGE change sans qu'aucune source ne bouge :
 * sans ça, le contrôle de fraîcheur conclurait à tort que l'image est à jour.
 */
const TEMPLATE_VERSION = 2;

const read = (relative) => fs.readFileSync(path.join(ROOT, relative));
const readText = (relative) => read(relative).toString('utf8');

/** Jetons de design réellement déclarés par l'application. */
const designTokens = () => {
  const css = readText('src/index.css');
  const block = /:root\s*\{([\s\S]*?)\}/.exec(css);
  if (!block) throw new Error('bloc :root introuvable dans src/index.css');
  const tokens = {};
  for (const match of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[match[1].trim()] = match[2].trim();
  }
  return tokens;
};

/** Copie affichée par le composant Hero, dans la langue du document (fr). */
const heroCopy = () => {
  const t = JSON.parse(readText('src/locales/fr/translation.json'));
  const hero = t.hero || {};
  for (const key of ['tagline_1', 'tagline_2', 'secondary']) {
    if (!hero[key]) throw new Error(`hero.${key} absent de src/locales/fr/translation.json`);
  }
  return { line1: hero.tagline_1, line2: hero.tagline_2, secondary: hero.secondary };
};

const dataUri = (relative, mime) => `data:${mime};base64,${read(relative).toString('base64')}`;

/* La copie vient d'un fichier de traduction : une apostrophe typographique ne
   pose aucun problème, mais une esperluette ou un chevron casserait le gabarit
   en silence — et l'image partirait déformée sans que personne ne la regarde. */
const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Tout ce dont dépend l'image. Sa somme est l'empreinte de fraîcheur. */
const sources = () => {
  const tokens = designTokens();
  const copy = heroCopy();
  return {
    templateVersion: TEMPLATE_VERSION,
    size: SIZE,
    copy,
    /* Uniquement les jetons employés par le gabarit : une couleur de section
       sans rapport ne doit pas rendre l'image périmée. */
    colors: {
      ink: tokens['--text-primary'],
      muted: tokens['--text-secondary'],
      brand: tokens['--brand-red'],
      cream: tokens['--s-cream'],
      background: tokens['--bg-color'],
    },
    assets: {
      wordmark: crypto.createHash('sha256').update(read('public/images/kiro-wordmark.webp')).digest('hex'),
      ice: crypto.createHash('sha256').update(read('public/icons/ice-cube.webp')).digest('hex'),
    },
    domain: 'kirodating.com',
  };
};

const hashOf = (value) =>
  crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);

/**
 * Gabarit de la carte.
 *
 * Il reprend la composition du hero — logotype, titre sur deux lignes dont la
 * seconde en rouge de marque, sous-titre — sans reprendre la photographie de
 * profil qui s'y trouve : une personne identifiable présentée comme utilisatrice
 * d'une application de rencontre n'a rien à faire dans une image qu'on ne
 * contrôle plus une fois partagée.
 */
const template = (src) => {
  const { colors, copy, domain } = src;
  const font = (weight) => {
    const file = `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff2`;
    if (!fs.existsSync(path.join(ROOT, file))) {
      throw new Error(
        `Inter ${weight} est introuvable (${file}).\n` +
          '    La police du site est embarquée dans l’image : sans elle, la capture\n' +
          '    partirait dans une typographie de repli.\n' +
          `    Installer le nécessaire :  ${INSTALL_HINT}`,
      );
    }
    return `@font-face{font-family:'Inter';font-style:normal;font-weight:${weight};src:url(${dataUri(
      file,
      'font/woff2',
    )}) format('woff2');}`;
  };

  return `<!doctype html><meta charset="utf-8"><style>
  ${[400, 600, 800].map(font).join('')}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${SIZE.width}px;height:${SIZE.height}px;overflow:hidden;
       font-family:'Inter',sans-serif;
       background:linear-gradient(165deg, ${colors.cream} 0%, ${colors.background} 62%, ${colors.cream} 100%);
       position:relative}
  .frame{position:absolute;inset:0;padding:70px 76px 128px;display:flex;flex-direction:column;justify-content:center}
  .wordmark{width:236px;height:auto;margin-bottom:30px}
  h1{font-size:66px;font-weight:800;line-height:1.06;letter-spacing:-0.03em;color:${colors.ink}}
  h1 .accent{color:${colors.brand}}
  p{margin-top:24px;max-width:706px;font-size:25px;line-height:1.5;font-weight:400;color:${colors.muted}}
  .domain{position:absolute;left:76px;bottom:56px;font-size:22px;font-weight:600;
          letter-spacing:0.01em;color:${colors.muted}}
  /* Glaçons : le motif de la marque, repris du hero. Purement décoratif,
     donc placé hors du flux et jamais superposé au texte. */
  .ice{position:absolute;user-select:none}
  .ice-1{width:210px;top:-34px;right:-26px;transform:rotate(9deg);opacity:.92}
  .ice-2{width:150px;bottom:44px;right:118px;transform:rotate(-13deg);opacity:.8}
  .ice-3{width:96px;top:250px;right:268px;transform:rotate(19deg);opacity:.55}
</style>
<img class="ice ice-1" src="${dataUri('public/icons/ice-cube.webp', 'image/webp')}" alt="">
<img class="ice ice-2" src="${dataUri('public/icons/ice-cube.webp', 'image/webp')}" alt="">
<img class="ice ice-3" src="${dataUri('public/icons/ice-cube.webp', 'image/webp')}" alt="">
<div class="frame">
  <img class="wordmark" src="${dataUri('public/images/kiro-wordmark.webp', 'image/webp')}" alt="Kiro">
  <h1>${escapeHtml(copy.line1)}<br><span class="accent">${escapeHtml(copy.line2)}</span></h1>
  <p>${escapeHtml(copy.secondary)}</p>
</div>
<span class="domain">${escapeHtml(domain)}</span>`;
};

/**
 * Outils nécessaires UNIQUEMENT à la production de l'image.
 *
 * Ni `playwright` ni `@fontsource/inter` ne sont des dépendances du projet, et
 * c'est délibéré : l'aperçu est versionné, donc `npm install`, `npm run build`,
 * `npm test` et le déploiement n'en ont jamais besoin. Imposer un navigateur de
 * 300 Mo à chaque installation pour une image qui change deux fois par an
 * serait un mauvais échange — le même raisonnement que pour `sharp` dans
 * scripts/media/photos-kiro.mjs.
 *
 * Le mode `--check`, lui, ne touche à aucun des deux : le contrôle de fraîcheur
 * tourne partout, sans rien installer.
 */
const INSTALL_HINT =
  'npm i --no-save playwright @fontsource/inter && npx playwright install chromium';

const loadPlaywright = async () => {
  try {
    return (await import('playwright')).chromium;
  } catch {
    throw new Error(
      'playwright est requis pour produire l’aperçu, et n’est pas installé.\n' +
        '    Ce n’est PAS une dépendance du projet — l’image est versionnée,\n' +
        '    donc le build et le déploiement n’en ont jamais besoin.\n' +
        `    Pour cette opération ponctuelle :  ${INSTALL_HINT}`,
    );
  }
};

const main = async () => {
  const src = sources();
  const sourceHash = hashOf(src);
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(readText('src/config/og-preview.json')) : null;
  const fresh =
    manifest?.sourceHash === sourceHash && fs.existsSync(path.join(ROOT, 'public', manifest.image));

  if (CHECK) {
    if (fresh) {
      process.stdout.write(`\n  ✓ aperçu à jour — ${manifest.image}\n\n`);
      return;
    }
    process.stderr.write(
      `\n  ✗ aperçu périmé : les sources du site ont changé depuis sa génération.\n` +
        `      attendu ${sourceHash}, manifeste ${manifest?.sourceHash ?? '(aucun)'}\n` +
        '      Régénérer avec :  npm run og\n\n',
    );
    process.exitCode = 1;
    return;
  }

  if (fresh && !FORCE) {
    process.stdout.write(`\n  ✓ déjà à jour — ${manifest.image}\n\n`);
    return;
  }

  const chromium = await loadPlaywright();
  /* `PLAYWRIGHT_CHROMIUM_PATH` : échappatoire pour les environnements qui
     fournissent déjà un Chromium au lieu de laisser Playwright le télécharger
     (conteneurs d'intégration continue, images préconstruites). Sans elle, on
     laisse Playwright résoudre son binaire comme d'habitude. */
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1 });
  await page.setContent(template(src), { waitUntil: 'load' });
  /* Forme chaîne volontaire : l'expression est évaluée DANS la page, où
     `document` existe. Écrite en fonction fléchée, elle ferait référence à un
     `document` que ce fichier — un script Node — ne connaît pas. Attendre les
     polices est indispensable : sans ça, la capture peut figer un rendu de
     repli, et le titre partirait dans la mauvaise typographie. */
  await page.evaluate('document.fonts.ready');
  const buffer = await page.screenshot({ type: 'jpeg', quality: 90 });
  await browser.close();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const name = `og-kiro-${sourceHash}.jpg`;
  fs.writeFileSync(path.join(OUT_DIR, name), buffer);
  /* Le chemin historique reçoit la MÊME image. Les réseaux sociaux gardent en
     cache l'URL qu'ils ont déjà vue : sans ça, tout partage déjà indexé
     continuerait d'afficher l'ancienne carte. Le nom empreinté, lui, garantit
     qu'un nouveau partage ne peut pas tomber sur une version périmée. */
  fs.writeFileSync(path.join(OUT_DIR, 'og-kiro.jpg'), buffer);

  /* Les anciennes empreintes ne servent plus à rien et alourdiraient public/. */
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (/^og-kiro-[0-9a-f]{12}\.jpg$/.test(file) && file !== name) {
      fs.unlinkSync(path.join(OUT_DIR, file));
    }
  }

  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(
    MANIFEST,
    `${JSON.stringify(
      {
        _doc:
          'Généré par scripts/media/og-image.mjs — ne pas éditer à la main. ' +
          '`sourceHash` est l’empreinte des sources du site (copie du hero, jetons de design, ' +
          'logotype, glaçons) : s’il ne correspond plus, l’aperçu est périmé.',
        image: `/images/${name}`,
        sourceHash,
        title: `Kiro — ${src.copy.line1} ${src.copy.line2}`,
        description: src.copy.secondary,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  process.stdout.write(
    `\n  ✓ /images/${name} — ${SIZE.width}×${SIZE.height}, ${Math.round(buffer.length / 1024)} ko\n` +
      `  ✓ /images/og-kiro.jpg mis à jour (caches existants)\n` +
      `  ✓ src/config/og-preview.json\n\n`,
  );
};

main().catch((error) => {
  process.stderr.write(`\n  ✗ ${error.message}\n\n`);
  process.exitCode = 1;
});
