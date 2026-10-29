# Refonte du blog kirodating.com/blog — identité « Kiro Solid »

| Champ | Valeur |
|---|---|
| Identifiant | **BLOG-REFONTE-2026-10-29** |
| Titre | Refonte visuelle du blog (gabarits, CSS, libellés) aux maquettes « Kiro Solid » |
| Date | 2026-10-29 |
| Type | Refonte d'interface (présentation uniquement) + tests |
| Auteur / agent | Claude (Opus 5.5), agent B « Kiro Blog Implementer », Guardian v2.1.0 (copie de référence `ref/GUARDIAN_SOURCE_SKILL.md`) |
| Dépôt | `kiro-dating/kiro-landing-page` (clone isolé, sans remote) |
| Working tree | `/home/claude/kiro/B-blog/premium-landing-page-blog` |
| Branche | `claude/blog-refonte` (créée depuis `main`) |
| Commit de référence (départ) | `bdbbe06` — style(landing): finitions responsive mobile, tablette et grands écrans |
| Dernier commit de code | `61ccd51` après la revue cycle 2 (§ 16.3) ; `8fadcd3` après le cycle 1 ; `4646e93` avant revue. Le rapport est committé à part |
| Module(s) | Générateur statique du blog : `scripts/blog/*`, `scripts/build-blog.mjs`, `styles/`, `public/blog-assets/blog.js`, `docs/BLOG.md`, `package.json` (script `test`) |
| Priorité | P2 — préparation au lancement (vitrine éditoriale) |
| Statut | **IMPLÉMENTÉ + TESTÉ (local), NON POUSSÉ, NON DÉPLOYÉ** |
| Conclusions | Refonte conforme aux maquettes et à la fondation ; contrat SEO intact (38/38 `<head>` identiques hors feuille de style, flux/sitemaps identiques) ; landing identique octet pour octet et au pixel près |
| Actions | Revue par l'agent C puis par Pierre ; intégration séquentielle sur `main` par Pierre ; ligne à ajouter au registre `audits/REPORT_REGISTRY.md` du projet (non faite : hors de mon périmètre d'écriture) |
| Tickets associés | Paquet `Kiro-Refonte-Aide-Blog-2026-10-29` (03_BLOG/PROMPT_REFONTE_BLOG.md) ; SITE-SEO-2026-10-29 (patch landing non appliqué, compatible) |
| Commits correctifs | voir § 3 |
| Tests de validation | lint (parité baseline), vitest 51 + 26, build, build:site, blog:preview, comparaison de `dist/`, 84 captures + contrôles automatiques, contrôles clavier, Lighthouse mobile, rendu pixel de la landing |
| État de déploiement | **NON EFFECTUÉ** (aucun push, merge, tag ni déploiement Vercel) |
| Dernière vérification | 2026-10-29 |
| Prochaine action | Revue cycle 1 traitée (§ 16) → GO de Pierre → **squash merge** sur `main` et push par Pierre (Vercel déploie au push) |

Anomalies suivies séparément dans ce rapport : **BLOG-REFONTE-2026-10-29-A1** (lien mort préexistant vers `/en/blog/author/pierre-handy-charles/`), **-A2** (mentions à revoir dans les articles), **-A3** (jeton `--kiro-muted` sous le seuil AA).

## 0. Déclaration de départ (Guardian § 0)

- Agent : Claude (agent B). Projet : blog de kirodating.com, généré au build dans le dépôt de la landing.
- Working tree : `/home/claude/kiro/B-blog/premium-landing-page-blog`, branche `claude/blog-refonte`, SHA de départ `bdbbe06`, `git status` propre au départ.
- Périmètre : gabarits du blog, `styles/blog.css` (+ nouveau `styles/kiro-tokens.css`), libellés FR/EN de `config.mjs`, `blog.js`, tests du générateur, `docs/BLOG.md`. Plateforme : web (pas d'impact iOS/Android).
- Interdits respectés : aucun changement dans `content/blog/**`, `src/`, `index.html`, `vite.config.js` ; aucun push/merge/rebase/tag/reset/clean ; aucun accès à A-help, C-review ni à l'ordinateur de Pierre ; `.env` absent et non nécessaire (le build utilise les valeurs par défaut, aucune variable d'environnement posée).
- Intégrateur : Pierre.

## 1. Résumé

Le blog adopte l'identité « Kiro Solid » de l'app :

- **En-tête propre au blog** : symbole rouge + logotype + pastille noire « BLOG », rubriques (catégories réellement publiées) au centre, recherche ronde, lien FR/EN, bouton rouge « Découvrir Kiro ». Sous 1120 px, les rubriques passent dans un **menu plein écran** (`<details>` natif + piège du focus, Échap, défilement bloqué via `blog.js`) ; sous 960 px, langue et bouton y passent aussi.
- **Accueil** : fil d'Ariane, H1 « Du match à la **vraie rencontre.** », chapeau à droite sur desktop, puces de filtre (actif noir, défilement horizontal interne sur mobile), carte « À la une » (1,25 fr / 1 fr, empilée sur mobile), grille de 3 cartes (2 à ≤ 960 px, liste compacte avec vignette de 96 px à ≤ 600 px), « Explorer par sujet » avec compteurs, lien « Archives 2026 ». Le rail latéral est remplacé ; **aucune URL ne disparaît** (toutes les pages du blog gardent au moins un lien entrant, vérifié).
- **Article** : en-tête compact sous 1024 px (retour, « Blog Kiro », partage Web Share API avec repli copie du lien), **barre de progression de 3 px** (statique avec `prefers-reduced-motion`), catégorie, H1, chapeau, auteur (initiales), date et durée, couverture pleine largeur ; **sommaire** repliable « Sommaire · N sections » sous 1024 px et colonne collante au-delà (mêmes ancres) ; corps 680 px, 18/30, H2 25/31 mobile et 30/37 desktop ; citations `#FFF1F1` 21/30 800 ; **un seul encart application** inséré automatiquement avant le H2 de premier niveau le plus proche de 40 % du texte (jamais dans une liste, une citation, un tableau ; jamais avant le premier H2) ; s'il est présent, le bandeau du bas n'est pas rendu ; FAQ en accordéon `<details>` avec bouton « + » 32 px qui devient « − » rouge ; auteur et « À lire ensuite » en cartes compactes.
- **Autres pages** (catégorie, tag, auteur, auteurs, archives année/mois, recherche, crédits photo), FR et EN, sur les mêmes composants. **Pied de page** blanc : Centre d'aide, Conditions, Confidentialité, Crédits photo, Les auteurs, RSS, © 2026 Kiro.
- **Appel à l'action centralisé** : `APP_CTA = { href: '/', label: { fr: 'Découvrir Kiro', en: 'Discover Kiro' } }` dans `scripts/blog/config.mjs`. Aucun lien store. « traduction instantanée (créole inclus) » retirée du bandeau ; nouveau texte « Rencontres par les lieux, jeux brise-glace et rendez-vous planifiés dans le chat. » (EN : « Meeting through places, icebreaker games and dates planned right in the chat. »). `data-kiro-cta` conservé (`blog`, `blog-header`, `blog-menu`, `blog-inline`).
- **Jetons** : `styles/kiro-tokens.css` (copie exacte de la fondation v1.1) concaténé **uniquement** à la feuille du blog ; `blog.css` n'utilise plus aucune variable de `src/index.css` (le bloc `:root` de la landing n'est plus lu). `--font-brand` (Comfortaa) : il était seulement **déclaré** dans la feuille du blog (repris du `:root` de la landing) et jamais utilisé ; il n'apparaît plus dans le CSS du blog. Rien n'a été retiré de `src/index.css`.
- Aucune dépendance d'exécution ajoutée ; Inter seulement ; aucun `backdrop-filter`, aucune transparence décorative, aucune ombre hors menu mobile ouvert, aucune animation en boucle.

## 2. État Git avant / après

| | Avant | Après |
|---|---|---|
| Branche | `claude/blog-refonte` | `claude/blog-refonte` |
| SHA | `bdbbe06` | `4646e93` (code) + commit du rapport |
| Arbre de travail | propre | propre |
| Remote | aucun (volontaire) | aucun |
| Push / merge / tag | — | **aucun** |

## 3. Commits (locaux, une intention par commit)

| SHA | Message |
|---|---|
| `fcc5fbb` | feat(blog): centraliser l'appel à l'action (APP_CTA) et les libellés Kiro Solid |
| `886e5a6` | feat(blog): jetons « Kiro Solid » réservés au blog |
| `574a03c` | feat(blog): encart application au fil de l'article |
| `ded864a` | refactor(blog): gabarits « Kiro Solid » |
| `a46e1c3` | style(blog): feuille de style « Kiro Solid » |
| `17674f0` | feat(blog): menu modal, partage et progression de lecture dans blog.js |
| `825f3e2` | test(blog): tests des gabarits et rattachement de scripts/blog à npm test |
| `60ea2c4` | style(blog): métadonnées en --kiro-text-2 pour un contraste AA |
| `38d9576` | docs(blog): documenter l'identité « Kiro Solid », APP_CTA et l'encart d'article |
| `4646e93` | fix(blog): rubriques de l'en-tête dans le menu sous 1120 px |
| (suivant) | docs(audits): rapport BLOG-REFONTE-2026-10-29 |

## 4. Fichiers modifiés, ajoutés, supprimés

| Fichier | Nature | Justification |
|---|---|---|
| `scripts/blog/config.mjs` | modifié | `APP_CTA`, libellés FR/EN (bandeau, encart, sommaire, menu, langue, pied de page) ; `PATHS.appCss` retiré |
| `scripts/blog/templates.mjs` | réécrit | nouveaux gabarits ; `urls`, `authorProfile`, `photoFigure` conservés (seul `PHOTO_SIZES` suit la nouvelle colonne de 680 px) ; `<head>` du `layout` inchangé |
| `scripts/build-blog.mjs` | modifié | feuille = `kiro-tokens.css` + `blog.css` ; catégories transmises aux articles ; puces d'archives ; type d'auteur pour l'avatar |
| `styles/blog.css` | réécrit | feuille « Kiro Solid » sur jetons `--kiro-*` ; anciennes règles (rail, barre « … », recherche dépliable, carte horizontale, pied sombre, top-nav de la landing) supprimées |
| `styles/kiro-tokens.css` | **ajouté** | jetons de la fondation, réservés au blog |
| `scripts/blog/inline-cta.mjs` | **ajouté** | emplacement pur et testé de l'encart d'article |
| `scripts/blog/templates.test.mjs` | **ajouté** | 15 tests (encart, APP_CTA, mentions interdites, un seul CTA, sommaire/FAQ, H1, initiales) |
| `scripts/blog/vitest.config.mjs` | **ajouté** | fait tourner `scripts/blog/*.test.mjs` dans `npm test` |
| `package.json` | modifié | `test` = suite existante **puis** tests du générateur ; `test:blog` ajouté. Aucune dépendance, lockfile inchangé |
| `public/blog-assets/blog.js` | modifié | menu modal, partage, progression, cartes de recherche |
| `docs/BLOG.md` | modifié | §§ 2, 4, 7, 7 bis, 8 mis à jour |
| `docs/audits/KIRO_BLOG_REFONTE_2026-10-29.md` | **ajouté** | ce rapport |

Aucun fichier supprimé. Non modifiés : `content/blog/**`, `src/**`, `index.html`, `vite.config.js`, `scripts/blog/seo.mjs`, `feeds.mjs`, `content.mjs`, `links.mjs`, `utils.mjs`.

Constat annexe : `scripts/blog/links.test.mjs` (11 tests du garde-fou anti-lien-mort) **n'était pas exécuté par `npm test`** sur `main` (le `test.include` de `vite.config.js` ne ramasse que `src/utils/__tests__/`). Il l'est désormais, via `scripts/blog/vitest.config.mjs`, sans toucher à `vite.config.js`.

## 5. Comparaison de `dist/` (baseline `main` ↔ branche)

Script : `/home/claude/kiro/B-blog/work/tools/compare-dist.mjs` — commande :
`node /home/claude/kiro/B-blog/work/tools/compare-dist.mjs /home/claude/kiro/B-blog/work/dist-baseline /home/claude/kiro/B-blog/premium-landing-page-blog/dist --json out.json`
(sortie complète : `work/logs/compare-dist.txt` et `.json`). Baseline : `npm run build` sur `bdbbe06` non modifié, copie intégrale dans `work/dist-baseline`.

| Contrôle | Résultat |
|---|---|
| Liste des fichiers | 168 → 168. Seuls changent les noms à empreinte des assets du blog : `blog-assets/blog.ka8q3r1voh.css` → `blog.1qna6ov1sf.css`, `blog.xxiidao7zv.js` → `blog.ns4t4j1ie9.js`. Aucune URL ajoutée ni retirée |
| Landing (`dist/index.html`, `dist/assets/**`, tous les fichiers de `public/` hors blog) | **119/119 identiques (sha256)**. `index.html` sha256 `cde5f795…41fb6615` identique |
| `<head>` des 38 pages du blog | **38/38 identiques** hors `href` de la feuille de style du blog (titres, descriptions, canonical, robots, hreflang + x-default, prev/next, alternate RSS, Open Graph, Twitter, JSON-LD) |
| JSON-LD (`BlogPosting`, `BreadcrumbList`, `FAQPage`, `Person`, `Organization`, `WebSite`, `Blog`, `CollectionPage`, `ProfilePage`) | identique sur les 38 pages |
| `sitemap.xml`, `sitemap-pages.xml`, `sitemap-blog.xml`, `robots.txt`, `search-index.json` FR/EN | identiques octet pour octet |
| `blog/rss.xml`, `en/blog/rss.xml` | identiques **hors `<lastBuildDate>`** (heure du build, change à chaque build, déjà le cas avant) |
| Liens internes apparus | aucun |
| Liens internes disparus | `/#concept`, `/#abonnements` (ancres de la landing que l'ancien en-tête/pied recopiait ; la landing reste liée par la marque, « Découvrir Kiro » et le corps des articles, où `/#jeux` subsiste) |
| Liens internes non résolus | `/en/blog/author/pierre-handy-charles/` — **préexistant** (présent dans la baseline), voir A1 |
| Pages du blog sans lien entrant | aucune (hors recherche, `noindex`) |
| Fichier `dist/blog-assets/blog.js` (copie non empreinte de `public/`) | modifié — c'est le script du blog copié par Vite depuis `public/`, pas un asset de la landing |

Écarts d'interface volontaires (corps des pages, hors `<head>`) : H1 de l'accueil (« Le blog Kiro » → « Du match à la vraie rencontre. »), libellés du bandeau, nouveaux libellés (sommaire, menu, encart, pied de page). Le `<title>` et la meta description de l'accueil sont inchangés.

## 6. Tests et scores réels

| Commande | Baseline (`bdbbe06`) | Branche |
|---|---|---|
| `npm ci` | OK | OK (même lockfile) |
| `npm run lint` | 16 erreurs (préexistantes : `api/places.js`, `src/components/*`, `src/utils/*`) | **16 erreurs, identiques ligne à ligne** ; `npx eslint scripts public/blog-assets` : 0 |
| `npm test` | 51/51 (5 fichiers) | **51/51 + 26/26** (`links.test.mjs` 11 + `templates.test.mjs` 15) |
| `npm run build` | OK, 48 fichiers blog, 36 URL au sitemap | OK, 48 fichiers, 36 URL |
| `npm run build:site` | — | OK (Vite seul ; n'appelle pas le générateur, la landing se construit même si le blog échoue) |
| `npm run blog:preview` | — | OK (0 brouillon dans le contenu actuel) |
| `git apply --check ref/seo/landing.patch` | OK | **OK sur la branche finale** (non appliqué) |

Lighthouse 12.8.2, mobile (émulation Moto G, throttling par défaut), Chromium 1243, servi en local sur :4174 :

| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| `/blog/aborder-quelquun-a-montreal/` | **98** | **100** | 96 | **100** |
| `/en/blog/turn-a-match-into-a-first-date/` | **97** | **100** | 96 | **100** |
| `/blog/` | **98** | **100** | 96 | **100** |
| Référence `main` : `/blog/aborder-quelquun-a-montreal/` | 97 | 96 | 96 | 100 |

Bonnes pratiques à 96 partout (avant comme après) : erreurs console propres à l'environnement local — Google Fonts injoignable depuis le bac à sable (`ERR_TUNNEL_CONNECTION_FAILED`) et `/_vercel/insights/script.js` en 404 hors Vercel. Rapports : `/home/claude/kiro/B-blog/work/lighthouse/*.report.html|json`.

Contrôles navigateur (Chromium, Playwright) — `work/captures/final/checks.json`, `interactions/keyboard.json` :

- 12 pages × 7 largeurs (360, 375, 390, 768, 1024, 1280, 1440) = **84 captures** : défilement horizontal **0**, cibles interactives < 44 px **0** (hors liens dans le texte courant, exception WCAG 2.5.8), texte posé sur une image **0**, H1 unique partout, **0** erreur JavaScript.
- Menu mobile (390 px) : ouverture au clavier, focus sur le premier lien, **piège du focus** vérifié sur 16 Tab et 16 Maj+Tab, **Échap** ferme et rend le focus au bouton « Menu », défilement bloqué puis rétabli.
- Sommaire mobile : ouverture Entrée, fermeture Espace, lien → ancre `#le-brise-glace-est-deja-dans-la-piece`, titre visible sous l'en-tête. Sommaire desktop collant à 104 px du haut, version mobile masquée.
- FAQ : ouverture Entrée, fermeture Espace ; question de 70 px de haut, bouton de 32 px.
- Progression : `scaleX(0.43)` à 40 % du défilement ; **`scaleX(0)` avec `prefers-reduced-motion`**.
- Partage sans Web Share API : bouton affiché, lien copié dans le presse-papiers, message « Lien copié » annoncé (`role="status"`).
- Landing `/` avant/après à 1440 et 390 px (`reducedMotion`, animations désactivées) : **0 pixel différent** sur 9 986 400 et 2 823 990 pixels (`work/captures/landing/landing-pixels.json`).

Validation sur appareils réels (iOS Safari, Android Chrome) et sur Firefox / Safari desktop : **non faite** (Chromium uniquement) — validation manuelle requise.

## 7. Captures

Dossier : `/home/claude/kiro/B-blog/work/captures/` (index : `captures/MANIFEST.md`).

- Jeu obligatoire : accueil desktop `final/blog-fr-1440.png` ; accueil mobile `final/blog-fr-390.png` ; article desktop `final/article-aborder-quelquun-a-montreal-1440.png` ; article mobile `final/article-aborder-quelquun-a-montreal-390.png` ; navigation mobile `final/interactions/menu-ouvert-blog-fr-390.png` (+ EN, + 1024).
- Toutes pages × largeurs : `final/<page>-<largeur>.png` (accueil FR/EN, articles FR/EN, catégorie, tag, recherche, crédits photo FR/EN, archives, auteurs, auteur).
- Côte à côte avec les maquettes : `comparaisons/accueil-desktop-1440.png`, `comparaisons/accueil-mobile-390.png`, `comparaisons/article-mobile-390.png`.
- Avant : `baseline/`. Landing avant/après : `landing/`.

Note : les captures utilisent Inter installée localement (Google Fonts injoignable depuis le bac à sable) ; en production, la même famille est servie par Google Fonts.

## 8. Écarts avec les maquettes

Accueil (desktop 1440 et mobile 390) :

1. **Pastille « À LA UNE »** placée dans la colonne de texte, à côté de la catégorie, et non sur la photo : la fondation interdit tout texte sur une photo (§ 1, principe 4).
2. **Bouton rouge du bandeau** en `#D92525` (`--kiro-red-action`) au lieu de `#F72C25` : blanc sur `#F72C25` = 3,9:1, insuffisant (§ 2 de la fondation, qui fait foi pour les valeurs).
3. Chapeau sans « Écrit à Montréal par l'équipe Kiro. » : une partie des articles est signée par une personne, la phrase aurait été inexacte.
4. Contenu réel : couverture photographique de l'article à la une (la maquette montrait l'ancienne illustration), extrait complet, **2 cartes** dans « Derniers articles » (3 articles FR publiés ; la 3ᵉ carte de la maquette était un emplacement).
5. Mobile : libellés complets des puces (« Diaspora & communautés » plutôt que « Diaspora ») et « Tous les articles » plutôt que « Tous » ; elles défilent horizontalement comme prévu.
6. Mobile : « Explorer par sujet » dans la même carte blanche que sur desktop, puces de 44 px (cible tactile) au lieu de 36 px ; pas de puce « Tous les sujets » (aucune page d'index des sujets n'existe ; ne pas créer d'URL).
7. Pied de page : ajout de « Les auteurs » (garde `/blog/auteurs/` accessible depuis chaque page) ; « Crédits photo » aussi sur mobile.

Article (mobile 390) :

8. Couverture au ratio exact 1200/630 (≈ 205 px de haut à 390) au lieu d'un bandeau fixe de 230 px : évite tout rognage (règle documentée dans `docs/BLOG.md`) ; légende et crédit photo cliquables conservés sous l'image (exigence de licence).
9. Signature : « Par » + métier de l'auteur conservés (déjà présents ; signal E-E-A-T).
10. **Encart d'article** : texte générique centralisé (« Croise les personnes qui fréquentent les mêmes endroits que toi, brise la glace avec un jeu et planifie le rendez-vous dans le chat. ») au lieu du texte propre à cet article de la maquette (Mont-Royal, Grande Bibliothèque) ; icône d'épingle de lieu. Sur cet article, le H2 le plus proche de 40 % est « Vert, jaune, rouge… » (≈ 54 %, contre ≈ 24 % pour le précédent) : l'encart tombe exactement à l'endroit de la maquette.
11. Bloc **Vert / jaune / rouge** coloré de la maquette **non reproduit** : dans l'article, ce sont trois paragraphes en gras ; en faire un composant exigerait de modifier le contenu (interdit). À décider avec Pierre (par exemple une syntaxe Markdown dédiée).
12. Fil d'Ariane masqué sous 1024 px sur l'article (la maquette n'en a pas) ; visible au-delà.
13. Bloc « Sujets » et barre de partage (Facebook, X, WhatsApp, copier le lien) conservés en fin d'article (absents de la maquette) ; pied de page complet au lieu du seul « © 2026 Kiro ».

Pas de maquette (conçu à partir de la fondation et des maquettes existantes) : article desktop (sommaire collant à gauche 240 px, colonne 680 px, couverture 984 px), tablette, menu plein écran, pages catégorie/tag/auteur(s)/archives/recherche/crédits.

## 9. Mentions à revoir dans les articles (non modifiées) — A2

| Fichier:ligne | Mention | Pourquoi |
|---|---|---|
| `content/blog/fr/rencontres-caribeennes-antillaises-canada.md:213` | « Et la **traduction instantanée**, créole inclus, existe parce que… » | Traduction en dormance (corrigée dans `ref/seo/landing.patch`, non appliqué) |
| `content/blog/fr/decrocher-premier-rendez-vous-application-rencontre.md:256` | « …avec [Kiro](/), et la bêta est ouverte si… » | Mention de bêta (à basculer au lancement) |
| `content/blog/en/turn-a-match-into-a-first-date.md:219` | « …and the beta is open if you want to see what it looks like. » | Idem (EN) |
| `content/blog/fr/decrocher-premier-rendez-vous-application-rencontre.md:230` | « Les lieux qui te ressemblent… un événement culturel, **une communauté**, une église… rencontres amoureuses comme amicales **ou communautaires** » | Peut évoquer les Cercles/communautés abandonnés ; à vérifier contre les types de lieux réels de l'app |
| `content/blog/en/turn-a-match-into-a-first-date.md:193` | « Places that look like you… a cultural event, **a community**, a church… » | Idem (EN) |
| `content/blog/fr/decrocher-premier-rendez-vous-application-rencontre.md:234` et `en/…:197` | lien `[jeux](/#jeux)` / `[Games](/#jeux)` | Ancre de la landing actuelle ; à revérifier lors de la refonte de la page d'accueil |

Aucune mention de TestFlight, Telegram, liste d'attente, Cercles (au sens produit), speed dating, badge vérifié ni SMS dans les articles publiés. Les nombreuses occurrences de « communauté(s) » dans `rencontres-caribeennes-antillaises-canada.md` (l. 57, 58, 82, 106, 127, 151-153, 165, 171, 205, 211, 230, 241) désignent les communautés culturelles (sens sociologique), pas la fonctionnalité : à mon avis à conserver.

## 10. Preuve que la landing est inchangée

- Aucun fichier de `src/`, `index.html`, `vite.config.js` ni `public/` hors `public/blog-assets/blog.js` n'est modifié (`git diff --stat bdbbe06..HEAD`, § 4).
- `dist/index.html` et les 14 fichiers de `dist/assets/` identiques en sha256 ; 119/119 fichiers hors blog identiques (§ 5).
- Rendu de `/` avant/après : 0 pixel différent à 1440 et 390 px (§ 6).
- La feuille du blog ne lit plus `src/index.css` : une évolution de la landing ne peut plus changer le blog, et inversement.

## 11. Compatibilité avec `landing.patch` (SITE-SEO-2026-10-29)

`git apply --check /home/claude/kiro/ref/seo/landing.patch` sur `4646e93` : **OK**. Le patch ne touche aucun fichier de la refonte. Il n'a pas été appliqué. Une fois appliqué, la mention « traduction instantanée » de l'article caribéen disparaît (ligne A2 n° 1).

## 12. JSON-LD d'un article (`/blog/aborder-quelquun-a-montreal/`)

Graphe complet de la page : `Organization`, `WebSite`, `BlogPosting`, `Person`, `FAQPage`, `BreadcrumbList` — **identique à la baseline** (§ 5). Extrait `BlogPosting` + `FAQPage` copié depuis `dist/` :

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://kirodating.com/blog/aborder-quelquun-a-montreal/#article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://kirodating.com/blog/aborder-quelquun-a-montreal/"
      },
      "headline": "À Montréal, le meilleur brise-glace est déjà autour de vous",
      "description": "Pas besoin de la phrase parfaite pour aborder quelqu’un. À Montréal, le contexte fait déjà la moitié du travail — reste à savoir lire le moment.",
      "articleSection": "Montréal & régions",
      "keywords": "Montréal, Brise-glace, Premier message, Culture québécoise",
      "inLanguage": "fr-CA",
      "url": "https://kirodating.com/blog/aborder-quelquun-a-montreal/",
      "datePublished": "2026-08-31T00:00:00.000Z",
      "dateModified": "2026-08-31T00:00:00.000Z",
      "wordCount": 2628,
      "timeRequired": "PT13M",
      "image": [
        {
          "@type": "ImageObject",
          "@id": "https://kirodating.com/images/blog/photos/montreal/belvedere-kondiaronk-mont-royal-cover.jpg#image",
          "contentUrl": "https://kirodating.com/images/blog/photos/montreal/belvedere-kondiaronk-mont-royal-cover.jpg",
          "url": "https://kirodating.com/images/blog/photos/montreal/belvedere-kondiaronk-mont-royal-cover.jpg",
          "width": 1200,
          "height": 630,
          "representativeOfPage": true,
          "name": "Belvédère Kondiaronk, mont Royal, Montréal",
          "caption": "Le belvédère Kondiaronk, en haut des marches. Personne n’arrive ici par hasard : c’est précisément ce qui rend une remarque sur la montée si facile à faire.",
          "description": "L’esplanade du belvédère Kondiaronk au mont Royal sous un ciel d’orage, avec la balustrade de pierre, les lampadaires, et le centre-ville de Montréal et le fleuve Saint-Laurent en arrière-plan.",
          "creator": {
            "@id": "https://kirodating.com/blog/auteur/pierre-handy-charles/#person"
          },
          "creditText": "Pierre Handy Charles",
          "copyrightNotice": "© Pierre Handy Charles",
          "license": "https://creativecommons.org/licenses/by-nc/4.0/deed.fr",
          "acquireLicensePage": "https://kirodating.com/blog/credits-photos/",
          "contentLocation": {
            "@type": "Place",
            "name": "Belvédère Kondiaronk, mont Royal, Montréal"
          }
        },
        {
          "@type": "ImageObject",
          "@id": "https://kirodating.com/images/blog/photos/montreal/vieux-port-montreal-vue-aerienne.jpg#image",
          "contentUrl": "https://kirodating.com/images/blog/photos/montreal/vieux-port-montreal-vue-aerienne.jpg",
          "url": "https://kirodating.com/images/blog/photos/montreal/vieux-port-montreal-vue-aerienne.jpg",
          "width": 1560,
          "height": 1170,
          "name": "Vieux-Port de Montréal, vu depuis la Grande roue",
          "caption": "Le Vieux-Port depuis la Grande roue. Presque tout ce qu’on voit ici est un endroit où quelqu’un a déjà une raison d’être — et où deux personnes en ont donc une en commun.",
          "description": "Vue aérienne du Vieux-Port de Montréal : le bassin Bonsecours au premier plan, la coupole argentée du marché Bonsecours, et les tours du centre-ville à l’horizon sous un ciel de beau temps.",
          "creator": {
            "@id": "https://kirodating.com/blog/auteur/pierre-handy-charles/#person"
          },
          "creditText": "Pierre Handy Charles",
          "copyrightNotice": "© Pierre Handy Charles",
          "license": "https://creativecommons.org/licenses/by-nc/4.0/deed.fr",
          "acquireLicensePage": "https://kirodating.com/blog/credits-photos/",
          "contentLocation": {
            "@type": "Place",
            "name": "Vieux-Port de Montréal, vu depuis la Grande roue"
          }
        },
        {
          "@type": "ImageObject",
          "@id": "https://kirodating.com/images/blog/photos/montreal/square-dorchester-fontaine.jpg#image",
          "contentUrl": "https://kirodating.com/images/blog/photos/montreal/square-dorchester-fontaine.jpg",
          "url": "https://kirodating.com/images/blog/photos/montreal/square-dorchester-fontaine.jpg",
          "width": 1560,
          "height": 973,
          "name": "Square Dorchester, centre-ville de Montréal",
          "caption": "Le square Dorchester, un midi d’été. Une place publique ne demande aucune justification pour s’y arrêter — c’est ce qui en fait un terrain facile.",
          "description": "La fontaine à vasques du square Dorchester en fonctionnement, entourée de bancs de bois courbes et d’arbres, devant la façade à colonnes de l’édifice Sun Life.",
          "creator": {
            "@id": "https://kirodating.com/blog/auteur/pierre-handy-charles/#person"
          },
          "creditText": "Pierre Handy Charles",
          "copyrightNotice": "© Pierre Handy Charles",
          "license": "https://creativecommons.org/licenses/by-nc/4.0/deed.fr",
          "acquireLicensePage": "https://kirodating.com/blog/credits-photos/",
          "contentLocation": {
            "@type": "Place",
            "name": "Square Dorchester, centre-ville de Montréal"
          }
        },
        {
          "@type": "ImageObject",
          "@id": "https://kirodating.com/images/blog/photos/montreal/grande-roue-vieux-port.jpg#image",
          "contentUrl": "https://kirodating.com/images/blog/photos/montreal/grande-roue-vieux-port.jpg",
          "url": "https://kirodating.com/images/blog/photos/montreal/grande-roue-vieux-port.jpg",
          "width": 1560,
          "height": 1170,
          "name": "Grande roue de Montréal, Vieux-Port",
          "caption": "La Grande roue, côté parc. Proposer de se revoir marche mieux quand ce qu’on propose est petit, précis, et facile à refuser.",
          "description": "La Grande roue de Montréal, blanche sur un ciel bleu, vue depuis une pelouse du Vieux-Port encadrée par le feuillage de deux arbres.",
          "creator": {
            "@id": "https://kirodating.com/blog/auteur/pierre-handy-charles/#person"
          },
          "creditText": "Pierre Handy Charles",
          "copyrightNotice": "© Pierre Handy Charles",
          "license": "https://creativecommons.org/licenses/by-nc/4.0/deed.fr",
          "acquireLicensePage": "https://kirodating.com/blog/credits-photos/",
          "contentLocation": {
            "@type": "Place",
            "name": "Grande roue de Montréal, Vieux-Port"
          }
        }
      ],
      "author": {
        "@id": "https://kirodating.com/blog/auteur/pierre-handy-charles/#person"
      },
      "publisher": {
        "@id": "https://kirodating.com/#organization"
      },
      "isPartOf": {
        "@id": "https://kirodating.com/#website"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://kirodating.com/blog/aborder-quelquun-a-montreal/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Comment aborder quelqu’un sans être lourd ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "En partant de ce qui existe déjà autour de vous plutôt que d’une phrase préparée. Une remarque sur l’attente, l’activité ou le lieu donne à l’autre quelque chose à quoi répondre, et lui laisse une sortie facile. La différence entre une approche agréable et une approche pesante tient rarement aux mots : elle tient à la capacité de s’arrêter quand la réponse est courte."
          }
        },
        {
          "@type": "Question",
          "name": "Où rencontrer des gens à Montréal quand on est célibataire ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les endroits où vous avez déjà une raison d’être : une activité de groupe, un cours, un festival, un atelier, une ligue sportive, un événement de quartier. Ce sont des contextes où parler à un inconnu est normal parce que tout le monde est là pour la même chose. Un lieu où vous n’avez rien à faire d’autre que rencontrer quelqu’un est presque toujours le plus difficile."
          }
        },
        {
          "@type": "Question",
          "name": "Est-ce qu’on peut aborder quelqu’un au gym ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pas pendant l’entraînement. Quelqu’un au milieu d’une série, avec des écouteurs, est occupé — et le lui rappeler n’a rien d’agréable. Les moments de transition sont différents : après un cours, en rangeant, en sortant. Le critère n’est pas le lieu mais la disponibilité réelle de la personne à ce moment précis."
          }
        },
        {
          "@type": "Question",
          "name": "Comment savoir si la personne a envie de continuer la conversation ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Regardez la réciprocité, pas la politesse. Une personne qui a envie de continuer développe ses réponses, pose des questions à son tour et amène elle-même de nouveaux sujets. Des réponses courtes, aucune question en retour et un retour rapide au téléphone ou à l’activité sont une réponse claire, même sans mots."
          }
        },
        {
          "@type": "Question",
          "name": "Comment proposer de se revoir après une première conversation ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simplement, concrètement, et de façon facile à refuser. « J’ai aimé jaser avec toi, ça te dirait un café un de ces jours ? » fonctionne mieux que « on devrait faire quelque chose un jour », parce que la deuxième formule n’engage personne et meurt d’elle-même. Si la réponse est oui, proposez un moment précis dans la foulée."
          }
        }
      ]
    }
  ]
}
```

## 13. Problèmes restants et risques

- **A1 — lien mort préexistant** : la page `/en/blog/photo-credits/` lie le photographe vers `/en/blog/author/pierre-handy-charles/`, qui n'est pas générée (l'auteur n'a pas d'article en anglais). Présent sur `main`, non corrigé (le garde-fou ne contrôle que les liens des articles). Correctif possible : lier vers la page auteur FR ou générer la page EN. Décision de Pierre.
- **A3 — `--kiro-muted` (#79797D)** : 4,4:1 sur blanc, 4,1:1 sur le canvas, sous le seuil AA pour du texte de 12-14 px. Le blog utilise `--kiro-text-2` (#5F5F5F) pour les métadonnées. À remonter à la fondation (le centre d'aide est concerné de la même façon).
- Liens de l'ancien en-tête vers `/#concept` et `/#abonnements` retirés (plus de navigation de la landing dans le blog, conformément à la maquette).
- Vérifié en Chromium uniquement ; pas d'appareil réel ni Safari/Firefox.
- Polices : captures et Lighthouse sans Google Fonts (bac à sable) ; à revérifier en préproduction Vercel.
- Revue visuelle à l'œil sur un échantillon (liste dans `captures/MANIFEST.md`) ; les 84 combinaisons sont couvertes par les contrôles automatiques.
- Le registre central `audits/REPORT_REGISTRY.md` (projet claude.ai) n'a pas été mis à jour par cet agent : ligne à ajouter (BLOG-REFONTE-2026-10-29 · IMPLÉMENTÉ + TESTÉ (local) · NON POUSSÉ · NON DÉPLOYÉ · `docs/audits/KIRO_BLOG_REFONTE_2026-10-29.md`).

## 14. Opérations non effectuées

Push, merge, rebase, tag, PR, déploiement Vercel, modification du contenu des articles, application de `landing.patch`, mise à jour du registre projet : **NON EFFECTUÉS**.

## 15. Auto-évaluation GO / NO-GO

**GO pour revue et intégration**, sous réserve de : (1) revue du diff et des captures par l'agent C puis par Pierre ; (2) vérification visuelle sur un iPhone et un Android réels en préproduction Vercel (pas en production) ; (3) décision de Pierre sur les mentions A2 (au minimum appliquer `landing.patch` pour la traduction) et sur A1. Rien dans ce changement ne touche la landing, le contenu ni le contrat SEO ; le retour arrière est un simple revert du commit d'intégration. **Intégrer par squash merge** (ou merge de la pointe seule) : trois commits intermédiaires ne construisent pas le blog (C-B-01, § 16).

## 16. Revue indépendante — cycles 1 et 2

Source des constats : `/home/claude/kiro/C-review/blog/REVIEW_BLOG_2026-10-29.md` (REVIEW-BLOG-2026-10-29, cycle 1 sur `97adcc3`, cycle 2 sur `9402999`).

Revue de `claude/blog-refonte` @ `97adcc3` par l'agent de revue (C) : **APPROUVÉ LOCALEMENT, 0 bloquant, 0 majeur**. Corrections apportées dans de nouveaux commits sur la même branche, sans rebase ni amend (historique conservé).

| Constat | Gravité | Description | Suite donnée |
|---|---|---|---|
| C-B-01 | info | Les commits `fcc5fbb`, `886e5a6`, `574a03c` ne construisent pas le blog : `config.mjs` retire `PATHS.appCss` alors que `build-blog.mjs` ne cesse de le lire qu'à `ded864a`. Vérifié : `node scripts/build-blog.mjs` sort en code 1 sur ces trois commits (« The "path" argument … Received undefined ») et en 0 à partir de `ded864a`. La landing (`vite build`) n'est pas concernée. | **Non réécrit** (consigne : pas de rebase). **Intégration recommandée : squash merge de la branche, ou merge de la seule pointe** — ne pas cherry-picker ni déployer un commit intermédiaire. |
| C-B-02 | mineur | Liens de signature < 44 px de haut (≈ 145 × 17 sur la carte « À la une », ≈ 135 × 16 sur les articles). | Corrigé — `a345291`, puis repris par `61ccd51` (C-B-12) : lien en `inline-flex` de 44 px compensé par une marge négative. Mesuré : 145 × 44 et 135 × 44 à 390 et 1440 px ; rendu visuel inchangé (`work/captures/wip/byline-both.png`). |
| C-B-03 | mineur | axe `landmark-complementary-is-top-level` : `<aside class="kb-toc-side">` imbriqué dans `<article>` (articles à 1440 px). | Corrigé — `e361880` : conteneur `<div>`, sémantique portée par le `<nav aria-label="Sommaire">` ; test de non-régression. axe (toutes règles activées) : plus aucune violation de repère à 1440 et 390 px. |
| C-B-04 | mineur | Pages de catégorie sur mobile : la puce de filtre active est hors écran dans la rangée horizontale. | Corrigé — `8fadcd3` : `blog.js` fait défiler la **rangée** (jamais la page) jusqu'à la puce active, d'un coup, sans animation ; ordre et URL inchangés. Vérifié à 360 et 390 px, avec et sans `prefers-reduced-motion` : puce active visible sur `/blog/categorie/conversation-et-profil/` et `/blog/categorie/montreal-et-regions/`, `scrollY = scrollX = 0`, aucun défilement de page. Capture : `work/captures/cycle1/categorie-montreal-et-regions-390-haut.png`. |
| C-B-05 | info | Le chrome du blog ne lie plus `/#concept`, `/#abonnements`, `/#jeux` ni `mailto:contact@kirosocial.com` (ce dernier reste sur les 2 pages de crédits photo). Aucune URL du blog perdue ; archives atteignables par `/blog/` → « Archives 2026 » → `/blog/2026/` → `/blog/2026/08/` (idem EN). | Conforme à la maquette ; aucune action. À signaler à Pierre (déjà au § 5). |
| C-B-06 | info | L'encart est inséré **avant** le H2 le plus proche de 40 % (fin de section) alors que la consigne dit « après le H2 ». Positions mesurées : 54 %, 46 %, 46 %, 45 %. | Interprétation conservée (n'isole pas un intertitre de son texte) ; **confirmation de Pierre** demandée. |
| C-B-07 | info (préexistant) | `/en/blog/photo-credits/` : 6 liens vers `/en/blog/author/pierre-handy-charles/`, page non générée — identique sur `bdbbe06` ; le garde-fou de liens ne couvre pas ces pages. | = A1 (§ 13). Chantier séparé : générer la page auteur EN ou lier la page FR, et étendre le garde-fou. |
| C-B-08 | info | Seul écart de la liste des fichiers : renommage des 2 actifs à empreinte du blog. | Attendu (déploiement Vercel atomique) ; aucune action. |
| C-B-09 | info | Rapport nommé `docs/audits/KIRO_BLOG_REFONTE_2026-10-29.md` (consigne du coordinateur) et non `REFONTE_BLOG_<date>.md` (prompt) ; inscription au registre projet `audits/REPORT_REGISTRY.md` non vérifiable. | Identifiant stable BLOG-REFONTE-2026-10-29 conservé ; **ligne de registre à ajouter** par le coordinateur/Pierre (§ 13). |
| C-B-10 | info (préexistant) | Page crédits photo FR au vouvoiement (« ce que vous avez le droit d'en faire », « Reprenez… écrivez-nous »), identique sur `bdbbe06` ; la fondation demande le tutoiement. | Hors périmètre de ce chantier (libellés existants) ; à reprendre dans un chantier de libellés. |
| C-B-11 | info | Limites de la revue : pas de polices distantes, pas de Lighthouse côté revue, pas d'appareil réel, réglages Vercel non consultés. | Contrôle iPhone/Android en préproduction Vercel avant production (déjà au § 15). |
| C-B-12 (cycle 2) | mineur | Effet de bord de C-B-02 : la cible du nom d'auteur (`margin: -13px 0`) recouvrait la moitié haute de la ligne de date sur la carte « À la une » (360-390 px) ; toucher le haut de la date ouvrait la page auteur. | Corrigé — `61ccd51`, voir § 16.3. |
| Ajout B-1 | mineur | Trouvé en relançant axe avec toutes ses règles : `label-content-name-mismatch` sur la pastille de langue (aria-label « Lire le blog en français » sans le texte visible « FR »). La version FR de ce libellé était en outre rédigée en français sur un lien `lang="en-CA"`. | Corrigé — `446a2bf` : texte visible en tête du nom (« EN Read the blog in English », complément en `sr-only`, dans la langue du lien). |
| Ajout B-2 | info | axe `color-contrast-enhanced` (niveau **AAA**, 7:1) sur le rouge d'action, les chapeaux et les métadonnées. | Hors objectif : la fondation vise **AA** (§ 10), toutes les paires sont ≥ 4,5:1. Non modifié. |


### 16.1 Commits du cycle 1

| SHA | Message |
|---|---|
| `a345291` | fix(blog): zone tactile de 44 px pour le nom de l'auteur (C-B-02) |
| `e361880` | fix(blog): sommaire latéral sans repère complémentaire imbriqué (C-B-03) |
| `446a2bf` | fix(blog): nom accessible du lien de langue cohérent avec le texte visible |
| `8fadcd3` | feat(blog): puce de filtre active ramenée dans la rangée sur mobile (C-B-04) |
| (suivant) | docs(audits): revue indépendante cycle 1 |

### 16.2 Revalidation après le cycle 1 (sur `8fadcd3`)

| Contrôle | Résultat |
|---|---|
| `npm run lint` | 16 erreurs, identiques à la baseline ; fichiers du blog : 0 |
| `npm test` | 51/51 + 26/26 |
| `npm run build`, `npm run build:site` | OK, OK |
| Comparaison de `dist/` | 168 → 168 fichiers (seuls les noms à empreinte du blog changent : `blog.14as5dcngf.css`, `blog.k8008jycmc.js`) ; landing 119/119 identiques (sha256), `index.html` identique ; `<head>` 38/38 identiques hors feuille de style, JSON-LD identique ; flux, sitemaps, robots, index de recherche identiques (RSS hors `<lastBuildDate>`) ; aucun lien apparu, aucun nouveau lien mort (`work/logs/compare-dist-cycle1.txt`) |
| Rendu de la landing `/` | 0 pixel différent à 1440 et 390 px |
| axe-core 4.14.0, **toutes règles activées**, articles FR/EN + accueil + catégorie à 1440 et 390 px | seule violation restante : `color-contrast-enhanced` (AAA, hors objectif). 0 violation A/AA, 0 violation de repère (`work/logs/axe-cycle1.json`) |
| Captures + contrôles automatiques | 84/84 sans remarque (défilement horizontal, cibles < 44 px, texte sur image, H1, erreurs JS) — `work/captures/final/` |
| Clavier | menu : piège du focus, Échap, focus rendu ; sommaire et FAQ au clavier ; progression statique en mouvement réduit ; partage → « Lien copié » |
| Lighthouse mobile | FR article 98 / 100 / 96 / 100 ; EN article 97 / 100 / 96 / 100 |
| `git apply --check ref/seo/landing.patch` | OK |

Statut inchangé : **IMPLÉMENTÉ + TESTÉ (local), NON POUSSÉ, NON DÉPLOYÉ**. Recommandation : GO pour intégration **par squash merge** (C-B-01), après validation sur appareils réels en préproduction.

### 16.3 Cycle 2 — C-B-12 (sur `9402999`)

Revue cycle 2 : **APPROUVÉ LOCALEMENT**, C-B-02/03/04 levés, un nouveau MINEUR (C-B-12). Correctif : `61ccd51` — fix(blog): zones tactiles de 44 px sans chevauchement (C-B-12).

- **Cause** : C-B-02 agrandissait les liens avec une marge négative symétrique (`margin: -13px 0`) ; la zone débordait sur les lignes voisines. Un balayage systématique (`work/tools/overlap.cjs`) a montré le même défaut, plus discret, sur le fil d'Ariane (au-dessus du H1), la catégorie d'article (sur le H1) et les liens de signature d'article.
- **Correctif** :
  - carte « À la une » : le nom de l'auteur n'est plus un lien ; toute la carte mène à l'article (une seule cible). La page auteur reste liée depuis l'article, « Les auteurs » et le pied de page (aucune page sans lien entrant) ;
  - fil d'Ariane, catégorie d'article, nom d'auteur (article et page des auteurs) : cible de 44 px étendue d'**un seul côté**, vers un espace vide réservé (marge de l'en-tête de page ; 26 px au-dessus de la signature ; 14 px de plus sous le fil d'Ariane d'article) ; le lien « Lire en français » de la signature s'étend vers le bas, dans l'espace réservé avant la couverture ;
  - test : la carte « À la une » ne contient qu'un lien (`templates.test.mjs`, 27 tests).
- **Preuves** (`work/tools/overlap.cjs`, 9 pages × 7 largeurs 360-1440 : accueil FR/EN, 2 articles, catégorie, auteurs, auteur, crédits, recherche) — balayage `elementFromPoint` de chaque ligne de date et de signature + recouvrement des boîtes réelles (`getClientRects`) cible/cible et cible/texte :
  - sur `9402999` : **156 remarques**, dont la date de la carte « À la une » touchée par le lien auteur sur 150 points sur 396 (`work/logs/overlap-9402999.json`) ;
  - sur `61ccd51` : **0 remarque** ; les dates de la carte mènent toutes à l'article (`work/logs/overlap-after-cb12.json`).
  - Tailles mesurées : fil d'Ariane 63 × 44 et 44 × 44, catégorie 163 × 44, nom d'auteur 135 × 44, « Lire en français » 97 × 44 ; contrôles automatiques : 84/84 captures sans cible < 44 px. Rendus : `work/captures/cycle2/`.
- **Revalidation sur `61ccd51`** : lint 16 erreurs = baseline (blog : 0) ; tests 51 + 27 ; build et build:site OK ; dist : landing 119/119 identiques (sha256), `<head>` 38/38 identiques hors feuille de style, JSON-LD identique, flux/sitemaps/robots/index identiques (RSS hors `<lastBuildDate>`), aucun lien apparu, aucune page sans lien entrant (`work/logs/compare-dist-cycle2.txt`) ; axe (toutes règles) : seule `color-contrast-enhanced` (AAA) ; clavier inchangé (piège du focus, Échap, FAQ, progression statique) ; Lighthouse mobile article FR 98 / 100 / 96 / 100, `/blog/` 98 / 100 / 96 / 100 ; `landing.patch` s'applique.

Statut : **IMPLÉMENTÉ + TESTÉ (local), NON POUSSÉ, NON DÉPLOYÉ**. Constats ouverts : C-B-01 (intégration par squash merge), C-B-06 (confirmation de Pierre), C-B-07/09/10 (hors périmètre, suivis). Recommandation : GO pour intégration par squash merge après validation sur appareils réels en préproduction.
