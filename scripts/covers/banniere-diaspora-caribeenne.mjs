/**
 * Bannière éditoriale — diaspora caribéenne au Canada
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTENTION
 * ─────────────────────────────────────────────────────────────────────────────
 * Une seule illustration horizontale, composée de quatre colonnes verticales.
 * Chaque colonne est une bande graphique construite à partir d'UN drapeau :
 * ses couleurs, et la géométrie de son motif (bandes, sautoir, croix, bande
 * diagonale) reprise en très grand et en faible opacité.
 *
 * Un même horizon organique traverse les quatre colonnes sans interruption :
 * c'est lui qui fait de l'ensemble une illustration unique plutôt qu'une
 * juxtaposition. Sous l'horizon, un relief et quelques palmiers, très discrets,
 * dans un ton assombri de la couleur de la colonne — une texture, pas une carte
 * postale.
 *
 * En bas de chaque colonne, le drapeau réel, à ses PROPRES proportions
 * officielles, non déformé, en petit format. Il sert d'ancrage factuel : la
 * grande bande est une interprétation graphique, le petit drapeau est exact.
 *
 * Réutilisable : le même script produit d'autres sélections de pays en
 * changeant `SELECTION`, pour d'autres articles du blog.
 *
 * Lancement manuel — ce fichier ne fait PAS partie du build :
 *     node scripts/covers/banniere-diaspora-caribeenne.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CE QUI EST EXACT ET CE QUI NE L'EST PAS
 * ─────────────────────────────────────────────────────────────────────────────
 * · Les PETITS DRAPEAUX sont exacts : géométrie dérivée du texte officiel
 *   (constitution ou loi), proportions officielles respectées, aucun
 *   étirement. Sources citées au-dessus de chaque fonction.
 * · Les GRANDES BANDES ne sont pas des drapeaux et ne prétendent pas l'être :
 *   ce sont des compositions qui reprennent les couleurs et le motif. Ne jamais
 *   les légender comme « le drapeau de… ».
 * · Aucun de ces États ne publie de valeur hexadécimale officielle. La Jamaïque
 *   est le seul à publier des couleurs officielles, en Pantone (109 or,
 *   355 vert), converties ici. Les autres valeurs sont des références
 *   largement utilisées, NON officielles.
 * · Haïti et la République dominicaine sont représentés par leur drapeau CIVIL,
 *   sans armoiries. Base constitutionnelle explicite pour la République
 *   dominicaine (art. 31) ; usage vexillologique établi mais SANS base
 *   constitutionnelle pour Haïti.
 * · Aucun fichier tiers n'est téléchargé : tout est construit géométriquement.
 *   Aucune question de licence ne se pose donc sur cette illustration.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/images/blog');

/* ── Palette Kiro (src/index.css) ───────────────────────────────────────── */

const KIRO = { cream: '#faf6f2', ink: '#171515', red: '#e0342b' };

const CANVAS = { w: 1200, h: 630 };
const MARGIN_X = 40;
const MARGIN_Y = 34;
const GAP = 14;
const RADIUS = 22;

const r3 = (n) => Math.round(n * 1000) / 1000;

/* ── Petits drapeaux : géométrie issue du texte officiel ────────────────── */

/**
 * HAÏTI — drapeau civil. Constitution de 1987, art. 3 : « deux bandes
 * horizontales de longueurs égales, le bleu en haut le rouge en bas ».
 * Proportions 3:5 (relevé Flags of the World, non fixé par la Constitution).
 */
const flagHaiti = (w, h) =>
  `<rect width="${r3(w)}" height="${r3(h / 2)}" fill="#00209F"/>` +
  `<rect y="${r3(h / 2)}" width="${r3(w)}" height="${r3(h / 2)}" fill="#D21034"/>`;

/**
 * JAMAÏQUE — sautoir d'or, triangles vert (haut/bas) et noir (guindant/battant).
 * « The diagonal cross is in gold and one-sixth of the length of the fly »,
 * proportions officielles 1:2. Le texte est ambigu ; lecture littérale retenue
 * (la bande vaut w/6 mesurée horizontalement sur le bord supérieur), soit
 * d = h·w/12. Couleurs : Pantone 109 et 355, seules couleurs officielles du lot.
 */
const flagJamaica = (w, h) => {
  const d = (h * w) / 12;
  const xE = d / h;
  const yE = d / w;
  const apexY = h / 2 - d / w;
  const apexX = w / 2 - d / h;
  const poly = (pts, fill) =>
    `<polygon points="${pts.map(([x, y]) => `${r3(x)},${r3(y)}`).join(' ')}" fill="${fill}"/>`;
  return (
    `<rect width="${r3(w)}" height="${r3(h)}" fill="#FFD100"/>` +
    poly(
      [
        [xE, 0],
        [w - xE, 0],
        [w / 2, apexY],
      ],
      '#009639',
    ) +
    poly(
      [
        [xE, h],
        [w - xE, h],
        [w / 2, h - apexY],
      ],
      '#009639',
    ) +
    poly(
      [
        [0, yE],
        [0, h - yE],
        [apexX, h / 2],
      ],
      '#000000',
    ) +
    poly(
      [
        [w, yE],
        [w, h - yE],
        [w - apexX, h / 2],
      ],
      '#000000',
    )
  );
};

/**
 * RÉPUBLIQUE DOMINICAINE — drapeau marchand (sans armoiries).
 * Constitution, art. 31 : croix blanche « del ancho de la mitad de la altura de
 * un cuartel » ⇒ quartier = 2H/5, croix = H/5. Dernière phrase du même article :
 * « La bandera mercante es la misma que la nacional sin escudo. »
 * Proportions 2:3 (loi 210-19, art. 4).
 */
const flagDominican = (w, h) => {
  const c = h / 5;
  const qh = (h - c) / 2;
  const qw = (w - c) / 2;
  return (
    `<rect width="${r3(w)}" height="${r3(h)}" fill="#FFFFFF"/>` +
    `<rect width="${r3(qw)}" height="${r3(qh)}" fill="#002D62"/>` +
    `<rect x="${r3(qw + c)}" width="${r3(qw)}" height="${r3(qh)}" fill="#CE1126"/>` +
    `<rect y="${r3(qh + c)}" width="${r3(qw)}" height="${r3(qh)}" fill="#CE1126"/>` +
    `<rect x="${r3(qw + c)}" y="${r3(qh + c)}" width="${r3(qw)}" height="${r3(qh)}" fill="#002D62"/>`
  );
};

/**
 * TRINITÉ-ET-TOBAGO — National Emblems (Regulation) Act, chap. 19:04 :
 * ensemble noir + blanc = L/5 au coin supérieur du guindant, chaque liseré
 * blanc = 1/6 de cet ensemble. ⇒ blanc = L/30, noir = 2L/15.
 * Proportions officielles 5:3 à terre.
 */
const flagTrinidad = (w, h) => {
  const band = w / 5;
  const white = band / 6;
  const stripe = (x0, x1, fill) =>
    `<polygon points="${r3(x0)},0 ${r3(x1)},0 ${r3(x1 + w - band)},${r3(h)} ${r3(x0 + w - band)},${r3(h)}" fill="${fill}"/>`;
  return (
    `<rect width="${r3(w)}" height="${r3(h)}" fill="#C8102E"/>` +
    stripe(0, white, '#FFFFFF') +
    stripe(white, band - white, '#000000') +
    stripe(band - white, band, '#FFFFFF')
  );
};

/**
 * BARBADE — trois bandes verticales égales (outremer, or, outremer) et une tête
 * de trident brisé noire au centre. Proportions officielles 2:3.
 *
 * ⚠️ RÉSERVE IMPORTANTE, à ne pas perdre de vue :
 * il n'existe PAS de planche de construction officielle du trident. Flags of
 * the World le dit explicitement : « Different sources differ in the
 * representation of the shape of the trident — possibly it is not entirely
 * defined. » Les bandes et les proportions sont donc exactes ; la tête de
 * trident est une reconstruction fidèle à la description publiée (trois pointes,
 * la centrale plus haute, hampe brisée sous la traverse), pas une reproduction
 * d'une géométrie officielle qui n'existe pas.
 *
 * Couleurs : les seules valeurs officielles sont des références British Colour
 * Council — outremer BCC 148, or BS O/002 — qui ne se convertissent pas
 * exactement en hexadécimal. Les valeurs ci-dessous viennent des conversions
 * RGB relevées par FOTW (0-38-127 et 255-199-38). NON officielles.
 */
const flagBarbados = (w, h) => {
  const band = w / 3;
  /* Boîte du trident : centrée dans la bande d'or. */
  const tw = h * 0.3;
  const th = h * 0.62;
  const tx = band + (band - tw) / 2;
  const ty = (h - th) / 2;
  const P = (x, y) => `${r3(tx + x * tw)},${r3(ty + y * th)}`;
  return (
    `<rect width="${r3(w)}" height="${r3(h)}" fill="#00267F"/>` +
    `<rect x="${r3(band)}" width="${r3(band)}" height="${r3(h)}" fill="#FFC726"/>` +
    `<g fill="#000000">` +
    `<polygon points="${P(0.5, 0)} ${P(0.61, 0.45)} ${P(0.39, 0.45)}"/>` +
    `<polygon points="${P(0.1, 0.08)} ${P(0.2, 0.45)} ${P(0, 0.45)}"/>` +
    `<polygon points="${P(0.9, 0.08)} ${P(1, 0.45)} ${P(0.8, 0.45)}"/>` +
    `<rect x="${r3(tx)}" y="${r3(ty + 0.45 * th)}" width="${r3(tw)}" height="${r3(0.11 * th)}"/>` +
    `<rect x="${r3(tx + 0.41 * tw)}" y="${r3(ty + 0.56 * th)}" width="${r3(0.18 * tw)}" height="${r3(0.44 * th)}"/>` +
    `</g>`
  );
};

/* ── Motifs : la géométrie du drapeau, reprise en très grand ────────────── */

/** Haïti : bicolore à partage horizontal — un disque bas, comme un soleil
    posé sur la ligne de partage, plus deux bandes horizontales très pâles. */
const motifHaiti = (w, h, a) =>
  `<g opacity="0.16" fill="${a}">` +
  `<circle cx="${r3(w / 2)}" cy="${r3(h * 0.4)}" r="${r3(w * 0.27)}"/>` +
  `</g>`;

/** Jamaïque : le sautoir, à pleine colonne. */
const motifJamaica = (w, h, a) =>
  `<g opacity="0.30" stroke="${a}" stroke-width="${r3(w * 0.14)}" stroke-linecap="square">` +
  `<line x1="${r3(-w * 0.1)}" y1="${r3(-h * 0.05)}" x2="${r3(w * 1.1)}" y2="${r3(h * 0.72)}"/>` +
  `<line x1="${r3(w * 1.1)}" y1="${r3(-h * 0.05)}" x2="${r3(-w * 0.1)}" y2="${r3(h * 0.72)}"/>` +
  `</g>`;

/** Barbade : le triband vertical, repris à pleine colonne. */
const motifBarbados = (w, h, a) =>
  `<g opacity="0.17" fill="${a}">` +
  `<rect x="${r3(w * 0.335)}" y="${r3(-h * 0.05)}" width="${r3(w * 0.33)}" height="${r3(h * 0.8)}"/>` +
  `</g>`;

/** République dominicaine : la croix, décentrée vers le haut. */
const motifDominican = (w, h, a) =>
  `<g opacity="0.16" fill="${a}">` +
  `<rect x="${r3(w * 0.44)}" y="${r3(-h * 0.05)}" width="${r3(w * 0.12)}" height="${r3(h * 0.8)}"/>` +
  `<rect x="${r3(-w * 0.1)}" y="${r3(h * 0.28)}" width="${r3(w * 1.2)}" height="${r3(h * 0.12)}"/>` +
  `</g>`;

/** Trinité-et-Tobago : la bande diagonale et ses liserés. */
const motifTrinidad = (w, h, a) =>
  `<g opacity="0.20" stroke="${a}" stroke-linecap="square">` +
  `<line x1="${r3(-w * 0.15)}" y1="${r3(-h * 0.08)}" x2="${r3(w * 1.05)}" y2="${r3(h * 0.78)}" stroke-width="${r3(w * 0.17)}"/>` +
  `<line x1="${r3(-w * 0.15)}" y1="${r3(h * 0.06)}" x2="${r3(w * 1.05)}" y2="${r3(h * 0.92)}" stroke-width="${r3(w * 0.03)}"/>` +
  `</g>`;

/* ── Dictionnaire des colonnes ──────────────────────────────────────────── */

const COLUMNS = {
  haiti: {
    label: 'Haïti',
    sky: '#00209F',
    land: '#D21034',
    accent: '#FFFFFF',
    ratio: 5 / 3,
    flag: flagHaiti,
    motif: motifHaiti,
    relief: 'montagnes',
    darkLand: false,
  },
  jamaique: {
    label: 'Jamaïque',
    sky: '#009639',
    land: '#08331C',
    accent: '#FFD100',
    ratio: 2,
    flag: flagJamaica,
    motif: motifJamaica,
    relief: 'collines',
    darkLand: true,
  },
  dominicaine: {
    label: ['République', 'dominicaine'],
    sky: '#002D62',
    land: '#CE1126',
    accent: '#FFFFFF',
    ratio: 3 / 2,
    flag: flagDominican,
    motif: motifDominican,
    relief: 'montagnes',
    darkLand: false,
  },
  trinite: {
    label: 'Trinité-et-Tobago',
    sky: '#C8102E',
    land: '#141414',
    accent: '#FFFFFF',
    ratio: 5 / 3,
    flag: flagTrinidad,
    motif: motifTrinidad,
    relief: 'collines',
    darkLand: true,
  },
  barbade: {
    label: 'Barbade',
    sky: '#00267F',
    /* Adouci par rapport au #FFC726 du drapeau : c'est un aplat de composition,
       pas le drapeau. La chips en bas de colonne, elle, garde la valeur exacte. */
    land: '#E9B830',
    accent: '#FFFFFF',
    ratio: 3 / 2,
    flag: flagBarbados,
    motif: motifBarbados,
    relief: 'collines',
    darkLand: false,
    lightLand: true,
  },
  cuba: {
    label: 'Cuba',
    sky: '#002A8F',
    land: '#CF142B',
    accent: '#FFFFFF',
    ratio: 2,
    flag: (w, h) => {
      const band = h / 5;
      const triW = (h * Math.sqrt(3)) / 2;
      const rStar = h * 0.19;
      const cx = triW * 0.42;
      const cy = h / 2;
      const pts = Array.from({ length: 5 }, (_, i) => {
        const ang = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
        return `${r3(cx + rStar * Math.cos(ang))},${r3(cy + rStar * Math.sin(ang))}`;
      });
      return (
        `<rect width="${r3(w)}" height="${r3(h)}" fill="#FFFFFF"/>` +
        [0, 2, 4]
          .map((i) => `<rect y="${r3(i * band)}" width="${r3(w)}" height="${r3(band)}" fill="#002A8F"/>`)
          .join('') +
        `<polygon points="0,0 ${r3(triW)},${r3(h / 2)} 0,${r3(h)}" fill="#CF142B"/>` +
        `<polygon points="${pts.join(' ')}" fill="#FFFFFF"/>`
      );
    },
    motif: motifDominican,
    relief: 'collines',
  },
};

/** Sélection retenue pour l'article 2. Changer cette liste suffit à décliner.
 *  Uniquement des États souverains, pour qu'aucune colonne ne puisse se lire
 *  comme une prise de position territoriale ou politique. */
const SELECTION = ['haiti', 'jamaique', 'dominicaine', 'trinite', 'barbade'];

/* ── Éléments de paysage ────────────────────────────────────────────────── */

/**
 * Horizon : une seule sinusoïde définie dans les coordonnées GLOBALES du
 * canevas. Chaque colonne n'en montre que son tronçon — d'où la sensation
 * d'une ligne continue qui traverse toute l'illustration.
 */
const HORIZON = { base: CANVAS.h * 0.545, amp: 26, period: CANVAS.w * 0.86, phase: -0.6 };
const horizonY = (xGlobal) =>
  HORIZON.base + HORIZON.amp * Math.sin((2 * Math.PI * xGlobal) / HORIZON.period + HORIZON.phase);

/** Tronçon d'horizon d'une colonne, échantillonné, en coordonnées locales. */
const horizonPath = (x0, w, yTop) => {
  const pts = [];
  for (let x = 0; x <= w + 4; x += 4) pts.push(`${r3(x)},${r3(horizonY(x0 + x) - yTop)}`);
  return pts;
};

/** Crête de relief : une seconde ligne, plus basse et plus dentelée. */
const ridgePath = (x0, w, yTop, seed, style, scale = 1) => {
  const peaks = style === 'montagnes' ? 3 : 4;
  const height = (style === 'montagnes' ? 68 : 44) * scale;
  const pts = [];
  for (let x = 0; x <= w + 4; x += 4) {
    const t = (x0 + x) / CANVAS.w;
    const jag =
      Math.sin(t * peaks * Math.PI * 2 + seed) * height * 0.5 +
      Math.sin(t * peaks * Math.PI * 5.3 + seed * 2) * height * 0.18;
    pts.push(`${r3(x)},${r3(horizonY(x0 + x) - yTop + height * 0.55 - jag)}`);
  }
  return pts;
};

/** Palmier stylisé : tronc courbe et cinq palmes. Volontairement schématique. */
const palm = (x, y, scale, fill, opacity) => {
  const s = scale;
  const frond = (dx, dy, cx, cy) =>
    `<path d="M0,0 Q${r3(cx * s)},${r3(cy * s)} ${r3(dx * s)},${r3(dy * s)}" fill="none" stroke="${fill}" stroke-width="${r3(2.1 * s)}" stroke-linecap="round"/>`;
  return (
    `<g transform="translate(${r3(x)} ${r3(y)})" opacity="${opacity}">` +
    `<path d="M0,0 Q${r3(-2 * s)},${r3(-13 * s)} ${r3(1.5 * s)},${r3(-25 * s)}" fill="none" stroke="${fill}" stroke-width="${r3(2.4 * s)}" stroke-linecap="round"/>` +
    `<g transform="translate(${r3(1.5 * s)} ${r3(-25 * s)})">` +
    frond(-13, -4, -8, -12) +
    frond(13, -4, 8, -12) +
    frond(-10, 6, -11, -4) +
    frond(10, 6, 11, -4) +
    frond(0, -12, 3, -9) +
    `</g></g>`
  );
};

/* ── Composition ────────────────────────────────────────────────────────── */

const column = (key, index, x0, w, yTop, h) => {
  const c = COLUMNS[key];
  const id = `col${index}`;
  const bottom = h;

  /* Terre : le tronçon d'horizon, refermé sur le bas de la colonne. */
  const land = `M${horizonPath(x0, w, yTop).join(' L')} L${r3(w)},${r3(bottom)} L0,${r3(bottom)} Z`;
  const horizonLine = `M${horizonPath(x0, w, yTop).join(' L')}`;

  /* Relief : deux plans. Les silhouettes restent noires — un aplat clair
     délaverait la terre. Le relief d'une terre très sombre est rendu lisible
     par un liseré clair sur la crête, pas par un remplissage. */
  const silhouette = '#000000';
  const opFar = 0.1;
  const opNear = 0.2;
  const farPts = ridgePath(x0, w, yTop, index * 1.7 + 2.4, c.relief, 0.55);
  const nearPts = ridgePath(x0, w, yTop, index * 1.7, c.relief);
  const ridge = `M${nearPts.join(' L')} L${r3(w)},${r3(bottom)} L0,${r3(bottom)} Z`;
  const far = `M${farPts.join(' L')} L${r3(w)},${r3(bottom)} L0,${r3(bottom)} Z`;
  const farLine = `M${farPts.join(' L')}`;
  const ridgeLine = `M${nearPts.join(' L')}`;

  /* Palmiers : positions fixes, dépendantes de l'indice — reproductible. */
  const palms = [0.16, 0.44, 0.79]
    .map((t, i) => {
      const px = w * t;
      const py = horizonY(x0 + px) - yTop + 96 + i * 16;
      return c.darkLand
        ? palm(px, py, 1.5 + ((index + i) % 3) * 0.22, '#ffffff', 0.14)
        : palm(px, py, 1.5 + ((index + i) % 3) * 0.22, silhouette, c.lightLand ? 0.17 : 0.26);
    })
    .join('');

  /* Drapeau réel, à ses proportions officielles, non déformé. */
  const fh = 38;
  const fw = fh * c.ratio;
  const fx = (w - fw) / 2;
  const fy = bottom - 118;

  return `
  <g transform="translate(${r3(x0)} ${r3(yTop)})">
    <clipPath id="${id}"><rect width="${r3(w)}" height="${r3(h)}" rx="${RADIUS}"/></clipPath>
    <g clip-path="url(#${id})">
      <rect width="${r3(w)}" height="${r3(h)}" fill="${c.sky}"/>
      <rect width="${r3(w)}" height="${r3(h)}" fill="url(#sky${index})"/>
      ${c.motif(w, h, c.accent)}
      <path d="${land}" fill="${c.land}"/>
      <path d="${land}" fill="url(#haze)"/>
      <path d="${far}" fill="${silhouette}" opacity="${opFar}"/>
      <path d="${farLine}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.13"/>
      <path d="${ridge}" fill="${silhouette}" opacity="${opNear}"/>
      <path d="${ridgeLine}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.17"/>
      ${palms}
      <path d="${horizonLine}" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>
      <rect width="${r3(w)}" height="${r3(h)}" fill="url(#grain)" opacity="0.5"/>
      <rect width="${r3(w)}" height="${r3(h)}" fill="url(#vignette)"/>
    </g>
    <rect x="0.75" y="0.75" width="${r3(w - 1.5)}" height="${r3(h - 1.5)}" rx="${RADIUS}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5"/>
    <g transform="translate(${r3(fx)} ${r3(fy)})" filter="url(#chip)">
      ${c.flag(fw, fh)}
      <rect width="${r3(fw)}" height="${r3(fh)}" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1"/>
    </g>
    ${label(c, w, bottom)}
  </g>`;
};

/**
 * Libellé d'une colonne. Un nom trop long pour la largeur disponible est écrit
 * sur deux lignes plutôt qu'abrégé — la colonne est étroite, pas le pays.
 * La couleur suit la clarté de la terre : du blanc sur de l'or ne se lit pas.
 */
const label = (c, w, bottom) => {
  const lines = Array.isArray(c.label) ? c.label : [c.label];
  const fill = c.lightLand ? '#171515' : '#ffffff';
  const first = bottom - 46 - (lines.length - 1) * 17;
  return (
    `<text class="lbl" x="${r3(w / 2)}" y="${r3(first)}" text-anchor="middle" fill="${fill}">` +
    lines
      .map((line, i) =>
        i === 0
          ? line.toUpperCase()
          : `<tspan x="${r3(w / 2)}" dy="17">${line.toUpperCase()}</tspan>`,
      )
      .join('') +
    `</text>`
  );
};

const build = (keys) => {
  const n = keys.length;
  const w = (CANVAS.w - 2 * MARGIN_X - GAP * (n - 1)) / n;
  const h = CANVAS.h - 2 * MARGIN_Y;

  const skyGradients = keys
    .map(
      (k, i) => `<linearGradient id="sky${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.06"/>
    </linearGradient>`,
    )
    .join('\n    ');

  const cols = keys
    .map((k, i) => column(k, i, MARGIN_X + i * (w + GAP), w, MARGIN_Y, h))
    .join('\n');

  /* Fil de liaison : une courbe unique qui traverse colonnes et intervalles.
     Elle passe dans le ciel, au-dessus de l'horizon, et porte un point par
     colonne. C'est le seul élément qui ignore délibérément les séparations. */
  const centers = keys.map((_, i) => MARGIN_X + i * (w + GAP) + w / 2);
  const threadY = (x) => CANVAS.h * 0.3 + 34 * Math.sin((2 * Math.PI * x) / (CANVAS.w * 1.15) + 1.9);
  const threadPts = [];
  for (let x = MARGIN_X + 10; x <= CANVAS.w - MARGIN_X - 10; x += 6) {
    threadPts.push(`${r3(x)},${r3(threadY(x))}`);
  }
  const thread =
    `<g>` +
    `<path d="M${threadPts.join(' L')}" fill="none" stroke="#ffffff" stroke-width="2.2" ` +
    `stroke-linecap="round" stroke-dasharray="1 11" opacity="0.72"/>` +
    centers
      .map(
        (cx) =>
          `<circle cx="${r3(cx)}" cy="${r3(threadY(cx))}" r="5.5" fill="#ffffff" opacity="0.92"/>` +
          `<circle cx="${r3(cx)}" cy="${r3(threadY(cx))}" r="11" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.35"/>`,
      )
      .join('') +
    `</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.w}" height="${CANVAS.h}" viewBox="0 0 ${CANVAS.w} ${CANVAS.h}" role="img">
  <defs>
    ${skyGradients}
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="42%" r="78%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.13"/>
    </radialGradient>
    <radialGradient id="bg" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${KIRO.cream}"/>
    </radialGradient>
    <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
      <rect width="6" height="6" fill="none"/>
      <rect width="6" height="1" fill="#ffffff" opacity="0.04"/>
    </pattern>
    <filter id="chip" x="-40%" y="-40%" width="180%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
    <filter id="colshadow" x="-10%" y="-8%" width="120%" height="118%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="${KIRO.ink}" flood-opacity="0.16"/>
    </filter>
  </defs>
  <style>
    .lbl { font-family: 'Inter', system-ui, sans-serif; font-size: 13px; font-weight: 700;
           letter-spacing: 0.14em; }
  </style>
  <rect width="${CANVAS.w}" height="${CANVAS.h}" fill="url(#bg)"/>
  <g filter="url(#colshadow)">${cols}
  </g>
  ${thread}
</svg>
`;
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, 'rencontres-caribeennes-canada-diaspora-illustration.svg');
fs.writeFileSync(file, build(SELECTION), 'utf8');
console.log(`écrit : ${path.relative(process.cwd(), file)}  (${SELECTION.join(' · ')})`);
