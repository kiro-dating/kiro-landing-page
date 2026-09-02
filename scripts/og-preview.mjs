/**
 * Lecture du manifeste de l'aperçu de partage.
 *
 * Ce fichier est GÉNÉRÉ (`npm run og`) mais VERSIONNÉ, et il est lu à deux
 * endroits qui ne se connaissent pas : la configuration Vite, pour injecter les
 * balises Open Graph dans index.html, et le générateur du blog, pour son image
 * de partage par défaut.
 *
 * Il est donc devenu indispensable au build. Son absence — un `git add` partiel
 * qui l'oublie, une machine où `npm run og` n'a jamais tourné — arrête la
 * construction, ce qui est le bon comportement : mieux vaut un build rouge
 * qu'un site déployé avec un aperçu vide. Mais l'erreur brute de Node
 * (« ENOENT: no such file or directory ») n'aide personne, surtout dans les
 * journaux d'un déploiement distant. D'où ce point de lecture unique, qui dit
 * ce qui manque et comment le régénérer.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Chemin du manifeste, relatif à la racine du projet. */
export const OG_PREVIEW_PATH = path.join('src', 'config', 'og-preview.json');

const REQUIRED = ['image', 'sourceHash', 'title', 'description'];

/**
 * @param {string} root racine du projet
 * @returns {{image: string, sourceHash: string, title: string, description: string}}
 */
export const readOgPreview = (root) => {
  const file = path.join(root, OG_PREVIEW_PATH);

  if (!fs.existsSync(file)) {
    throw new Error(
      `${OG_PREVIEW_PATH} est introuvable.\n` +
        "  Ce fichier porte le titre, la description et l'image d'aperçu de partage.\n" +
        '  Il est généré à partir de la copie du hero et des jetons de design :\n' +
        '      npm run og\n' +
        "  S'il vient de disparaître d'un commit, c'est qu'il n'a pas été ajouté : il doit être versionné.",
    );
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${OG_PREVIEW_PATH} est illisible (${error.message}).\n  Régénérer avec : npm run og`);
  }

  const missing = REQUIRED.filter((key) => !manifest[key]);
  if (missing.length > 0) {
    throw new Error(
      `${OG_PREVIEW_PATH} est incomplet : ${missing.join(', ')} manquant(s).\n` +
        '  Ne pas le corriger à la main — régénérer avec : npm run og',
    );
  }

  return manifest;
};
