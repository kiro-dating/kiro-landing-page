/**
 * Encart application placé dans le fil d'un article.
 *
 * Règle éditoriale (refonte « Kiro Solid », 2026-10-29) : un seul encart par
 * article, vers 40 % du texte, posé à une frontière de section — juste avant
 * le H2 le plus proche de ce seuil. Ainsi :
 *
 *   · l'encart ne coupe jamais une section, une liste, une citation, un
 *     tableau ou une figure : seuls les H2 de premier niveau sont candidats ;
 *   · il n'interrompt pas l'introduction : le premier H2 (début de la
 *     première section) n'est jamais retenu ;
 *   · il ne touche à aucun identifiant : on insère du HTML, on ne réécrit
 *     rien, donc toutes les ancres du sommaire restent valides.
 *
 * Module pur, sans dépendance au reste du générateur : testé par
 * scripts/blog/templates.test.mjs. Le HTML de l'article (`post.html`) n'est
 * PAS modifié en amont : RSS, index de recherche et garde-fou de liens
 * continuent de lire le texte d'origine. L'insertion n'existe que dans la page.
 */

/** Éléments de bloc à l'intérieur desquels un H2 n'est jamais un point d'insertion. */
const CONTAINERS = new Set([
  'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'figure', 'div', 'details', 'aside', 'section', 'pre', 'dl',
]);

/** Longueur de texte visible d'un fragment HTML (balises retirées, blancs compactés). */
const textLength = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, 'x')
    .replace(/\s+/g, ' ')
    .trim().length;

/**
 * Positions des `<h2` de premier niveau, avec la part de texte qui les précède.
 * @returns {{ index: number, ratio: number }[]}
 */
export const topLevelH2 = (html) => {
  const total = textLength(html);
  if (total === 0) return [];
  const found = [];
  let depth = 0;
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let match;
  while ((match = tagRe.exec(html)) !== null) {
    const [, closing, rawName, selfClosing] = match;
    const name = rawName.toLowerCase();
    if (name === 'h2' && !closing && depth === 0) {
      found.push({ index: match.index, ratio: textLength(html.slice(0, match.index)) / total });
      continue;
    }
    if (!CONTAINERS.has(name) || selfClosing) continue;
    depth = closing ? Math.max(0, depth - 1) : depth + 1;
  }
  return found;
};

/**
 * Insère `blockHtml` juste avant le H2 de premier niveau le plus proche de
 * `target` (0.4 = 40 % du texte). Le premier H2 du texte n'est jamais retenu.
 *
 * @returns {{ html: string, inserted: boolean }}
 */
export const insertInlineCta = (html, blockHtml, { target = 0.4 } = {}) => {
  const candidates = topLevelH2(html).slice(1);
  if (candidates.length === 0 || !blockHtml) return { html, inserted: false };
  const best = candidates.reduce((a, b) => (Math.abs(b.ratio - target) < Math.abs(a.ratio - target) ? b : a));
  return {
    html: `${html.slice(0, best.index)}${blockHtml}\n${html.slice(best.index)}`,
    inserted: true,
  };
};
