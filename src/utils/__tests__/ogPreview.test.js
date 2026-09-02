import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * Fraîcheur de l'aperçu de partage.
 *
 * L'image d'aperçu a la particularité de n'apparaître NULLE PART sur le site :
 * on ne la voit qu'en partageant un lien. Une dérive y passe donc totalement
 * inaperçue — c'est exactement ce qui s'est produit, l'aperçu ayant continué
 * pendant des mois à afficher un thème abandonné, un slogan retiré et un nom de
 * domaine étranger au projet.
 *
 * Ces contrôles remplacent la vigilance par une vérification :
 *
 *   · l'empreinte des sources doit correspondre à l'image produite — modifier
 *     le slogan du hero ou une couleur de marque rend le test rouge, avec la
 *     commande à lancer ;
 *   · le fichier annoncé doit exister ;
 *   · index.html ne doit plus contenir de texte d'aperçu écrit en dur, sans
 *     quoi la source unique cesserait d'en être une ;
 *   · et rien ne doit renvoyer vers kirosocial.com, qui est un autre projet.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const MANIFEST = path.join(ROOT, 'src/config/og-preview.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const heroFr = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/fr/translation.json'), 'utf8')).hero;

describe('aperçu de partage', () => {
  it('correspond aux sources actuelles du site', () => {
    /* On délègue au script lui-même : il est la seule autorité sur la façon
       dont l'empreinte est calculée. Dupliquer ce calcul ici garantirait qu'un
       jour les deux divergent, et le test cesserait de vouloir dire quelque
       chose. `--check` ne produit aucun fichier. */
    let output = '';
    let failed = false;
    try {
      output = execFileSync('node', ['scripts/media/og-image.mjs', '--check'], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      failed = true;
      output = `${error.stdout || ''}${error.stderr || ''}`;
    }
    expect(failed, `\n${output}`).toBe(false);
  });

  it('annonce un fichier qui existe réellement', () => {
    expect(manifest.image, 'le manifeste doit porter un chemin de site').toMatch(/^\/images\//);
    expect(
      fs.existsSync(path.join(ROOT, 'public', manifest.image)),
      `${manifest.image} est annoncée mais absente de public/`,
    ).toBe(true);
  });

  it('porte une empreinte dans son nom, pour contourner les caches sociaux', () => {
    /* Facebook et WhatsApp mettent en cache une image PAR URL, parfois pour des
       semaines. Sans empreinte dans le nom, une correction d'aperçu resterait
       invisible sur tous les liens déjà partagés. */
    expect(manifest.image).toMatch(/og-kiro-[0-9a-f]{12}\.jpg$/);
    expect(manifest.image).toContain(manifest.sourceHash);
  });

  it('reprend le titre et le sous-titre réellement affichés par le hero', () => {
    expect(manifest.title).toContain(heroFr.tagline_1);
    expect(manifest.title).toContain(heroFr.tagline_2);
    expect(manifest.description).toBe(heroFr.secondary);
  });
});

describe('métadonnées de index.html', () => {
  it('ne contient aucun texte d’aperçu écrit en dur', () => {
    for (const token of ['%KIRO_TITLE%', '%KIRO_OG_DESCRIPTION%', '%KIRO_OG_IMAGE%']) {
      expect(indexHtml, `${token} doit rester un jeton injecté au build`).toContain(token);
    }
    /* Le slogan retiré du site ne doit pas réapparaître par un copier-coller. */
    expect(indexHtml).not.toContain('Arrête de swiper');
  });

  it('ne renvoie jamais vers kirosocial.com', () => {
    /* Kiro Social est un AUTRE projet. Son nom figurait jusqu'ici dans les
       pixels de l'image d'aperçu, là où aucun contrôle de texte ne pouvait le
       voir — d'où ce garde-fou sur les sources qui composent cette image. */
    expect(indexHtml).not.toMatch(/kirosocial\.com/);
    expect(JSON.stringify(manifest)).not.toMatch(/kirosocial\.com/);
    expect(JSON.stringify(heroFr)).not.toMatch(/kirosocial\.com/);
  });
});
