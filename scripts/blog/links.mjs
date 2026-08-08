/**
 * Garde-fou : aucun lien interne mort dans le corps d'un article.
 *
 * Vérifie que tout lien d'article pointant vers le blog mène à une page
 * réellement générée par ce build.
 *
 * Pourquoi c'est bloquant plutôt qu'un simple avertissement : un lien mort en
 * production coûte un lecteur perdu et un signal négatif pour l'indexation,
 * alors qu'un build rouge coûte trente secondes. C'est la même logique que la
 * validation du frontmatter.
 *
 * Seuls les chemins commençant par un préfixe de blog sont contrôlés — ce sont
 * les seuls que ce générateur maîtrise entièrement. Les liens vers la landing
 * page (`/`, `/#jeux`), vers le centre d'aide ou vers un domaine externe ne
 * sont pas concernés.
 *
 * Conséquence pratique pour la rédaction : une référence vers un article qui
 * n'existe pas encore ne doit PAS être un lien. On la garde en texte simple et
 * on la trace dans docs/seo/registre-contenus.csv ; le jour où la cible est
 * publiée, le lien peut être activé et ce contrôle le validera.
 *
 * Le module est séparé du générateur pour être testable seul :
 *     node --test scripts/blog/links.test.mjs
 */

import { LANG_CODES, LANGS } from './config.mjs';

/** Préfixes d'URL contrôlés (« /blog », « /en/blog »…). */
const blogPrefixes = () => LANG_CODES.map((code) => LANGS[code].base);

/**
 * Liste les liens d'articles qui pointent vers une page de blog inexistante.
 *
 * @param {Record<string, Array<{file: string, html: string}>>} byLang
 *        articles décorés, groupés par code de langue
 * @param {Set<string>} generatedUrls  URLs réellement écrites, avec barre finale
 * @returns {string[]} descriptions « fichier → URL » des liens fautifs
 */
export const findBrokenInternalLinks = (byLang, generatedUrls) => {
  const prefixes = blogPrefixes();
  const broken = [];

  for (const lang of LANG_CODES) {
    for (const post of byLang[lang] ?? []) {
      const hrefs = [...post.html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
      for (const raw of hrefs) {
        if (!prefixes.some((prefix) => raw === prefix || raw.startsWith(`${prefix}/`))) continue;
        const url = raw.endsWith('/') ? raw : `${raw}/`;
        if (!generatedUrls.has(url)) broken.push(`${post.file} → ${raw}`);
      }
    }
  }

  return broken;
};

/**
 * Même contrôle, mais fait échouer le build.
 * @throws {Error} dès qu'un seul lien interne ne résout pas
 */
export const assertNoBrokenInternalLinks = (byLang, generatedUrls) => {
  const broken = findBrokenInternalLinks(byLang, generatedUrls);
  if (broken.length === 0) return;
  throw new Error(
    `${broken.length} lien(s) interne(s) pointent vers une page inexistante :\n    · ${broken.join('\n    · ')}\n` +
      "  Une référence vers un article à venir doit rester du texte, pas un lien.",
  );
};
