# Blog Kiro — documentation technique

> Section blog de `kirodating.com`. Génération statique au build, zéro impact
> sur la landing page React existante.

---

## 1. Pourquoi un générateur statique et pas React

Le site est une **SPA Vite sans rendu serveur**. Tout le contenu de la page
d'accueil est injecté par JavaScript après le chargement. C'est acceptable pour
une landing page dont on ne cherche pas à positionner chaque section, mais
c'est rédhibitoire pour un blog : Googlebot indexe le HTML servi en priorité,
et le rendu JavaScript est différé, partiel et non garanti.

Trois options ont été envisagées :

| Option | SEO | Risque de régression | Coût |
| --- | --- | --- | --- |
| SPA + `react-router` | Faible — contenu absent du HTML initial | Moyen (routage global) | Faible |
| Migration Next.js | Excellent | **Élevé** — réécriture du site | Élevé |
| **Génération statique au build** | **Excellent** — contenu dans le HTML | **Nul** — sortie séparée | Faible |

La troisième a été retenue. Concrètement :

- chaque article est un fichier HTML complet, servi tel quel ;
- aucun JavaScript n'est nécessaire pour lire un article ;
- le bundle de la landing page n'augmente pas d'un octet ;
- `dist/index.html` et tous les assets Vite ne sont jamais touchés ;
- si le générateur tombe en panne, la landing page continue de se construire
  (`npm run build:site`).

## 2. Arborescence

```
premium-landing-page/
├── content/blog/                  ← LE CONTENU (c'est ici qu'on écrit)
│   ├── taxonomy.json              catégories et tags (FR + EN)
│   ├── authors.json               auteurs
│   ├── fr/                        articles français   → /blog/<slug>/
│   │   └── _MODELE-ARTICLE.md     modèle commenté à copier
│   └── en/                        articles anglais    → /en/blog/<slug>/
│       └── _ARTICLE-TEMPLATE.md
│
├── scripts/
│   ├── build-blog.mjs             orchestrateur : lit le contenu, écrit dist/
│   └── blog/
│       ├── config.mjs             domaine, langues, pagination, libellés
│       ├── content.mjs            lecture Markdown, validation, rendu
│       ├── seo.mjs                <head>, Open Graph, Twitter, JSON-LD
│       ├── templates.mjs          gabarits HTML (index, article, listes…)
│       ├── feeds.mjs              sitemaps, RSS, robots.txt, index de recherche
│       └── utils.mjs              fonctions pures (slug, dates, pagination…)
│
├── styles/blog.css                styles du blog (concaténés aux jetons du site)
├── public/blog-assets/blog.js     partage + recherche (amélioration progressive)
└── docs/
    ├── BLOG.md                    ce fichier
    ├── SEO-STRATEGIE.md           clusters, quick wins, maillage interne
    └── seo/sujets.csv             base de données des sujets d'articles
```

## 3. Commandes

| Commande | Effet |
| --- | --- |
| `npm run build` | `vite build` **puis** génération du blog. C'est ce que Vercel exécute. |
| `npm run build:site` | Landing page seule (dépannage). |
| `npm run blog:build` | Blog seul, sur un `dist/` existant. Itération rapide sur le contenu. |
| `npm run preview` | Sert `dist/` en local — le blog est navigable à `/blog/`. |

### Le blog en développement

`npm run dev` ne sert que l'application React : les pages du blog sont des
fichiers statiques produits dans `dist/`, que le serveur de dev ignore par
défaut. Le plugin `kiro-blog-dev-server` de `vite.config.js` comble ce trou —
il sert `/blog/...`, `/en/blog/...`, `/blog-assets/...`, les sitemaps et
`robots.txt` depuis `dist/`. Il est en `apply: 'serve'`, donc sans aucun effet
sur la construction de production.

Il n'y a pas de rechargement à chaud sur ces pages : après avoir modifié un
article, relance `npm run blog:build` puis rafraîchis l'onglet.

Boucle de travail sur un article :

```bash
npm run build:site      # une fois, pour créer dist/
npm run blog:build      # à chaque modification de contenu (< 1 s)
npm run dev             # http://localhost:5173/blog/  ← ou preview sur :4173
```

Si une page du blog s'affiche « non générée » en dev, c'est que `dist/` est
vide ou obsolète : relance les deux commandes ci-dessus.

## 4. Publier un article

1. Copier `content/blog/fr/_MODELE-ARTICLE.md` vers `content/blog/fr/mon-slug.md`.
   **Le nom du fichier devient l'URL** : `/blog/mon-slug/`.
2. Remplir le frontmatter (les champs obligatoires sont signalés dans le modèle).
3. Écrire le corps en Markdown. Ne pas mettre de `# H1` : il vient de `title`.
4. Retirer `draft: true`.
5. `npm run blog:build` — le build échoue s'il manque quelque chose.
6. Commit + push. Vercel reconstruit et publie.

### Publication programmée

Une date `publishedAt` dans le futur suffit : l'article reste dans le dépôt et
n'est généré ni dans le HTML, ni dans le sitemap, ni dans le RSS tant que la
date n'est pas atteinte. Deux articles par semaine peuvent ainsi être écrits
d'avance et publiés au fil de l'eau par un simple redéploiement.

### Le build échoue — et c'est voulu

Le générateur **refuse de construire** et sort en code 1 si :

- un champ obligatoire manque (`title`, `description`, `publishedAt`, `category`, `author`) ;
- la catégorie n'existe pas dans `taxonomy.json` ;
- l'auteur n'existe pas dans `authors.json` ;
- deux articles de la même langue partagent le même slug ;
- la date de publication est illisible ;
- le bloc `:root` de `src/index.css` est introuvable.

Un tag non déclaré produit un **avertissement** (build vert) : le tag est publié
mais sans libellé traduit. Mieux vaut le déclarer.

## 5. URLs générées

| Type | Français | Anglais |
| --- | --- | --- |
| Index | `/blog/` | `/en/blog/` |
| Pagination | `/blog/page/2/` | `/en/blog/page/2/` |
| Article | `/blog/<slug>/` | `/en/blog/<slug>/` |
| Catégorie | `/blog/categorie/<slug>/` | `/en/blog/category/<slug>/` |
| Tag | `/blog/tag/<slug>/` | `/en/blog/tag/<slug>/` |
| Auteur | `/blog/auteur/<slug>/` | `/en/blog/author/<slug>/` |
| Recherche | `/blog/recherche/` | `/en/blog/search/` |
| RSS | `/blog/rss.xml` | `/en/blog/rss.xml` |

Plus, à la racine : `/sitemap.xml` (index), `/sitemap-pages.xml`,
`/sitemap-blog.xml`, `/robots.txt`.

**Les URLs d'articles sont plates** (`/blog/<slug>/`, sans segment de catégorie).
Un article peut donc changer de catégorie sans casser son URL — c'est la
pratique de Bumble et de Hinge, et cela évite la dette d'URL observée chez
Match (`/p/dating-advice/first-date-tips-dating-advice/second-date/`). La
hiérarchie reste visible dans le fil d'Ariane et dans `BreadcrumbList`.

> ⚠️ **Ne jamais renommer le slug d'un article publié** sans mettre en place une
> redirection 301. Les liens entrants et le classement acquis sont attachés à
> l'URL. Idem pour les clés (`key`) de `taxonomy.json`.

## 6. SEO technique intégré

Chaque page émet automatiquement :

- `<title>`, `<meta name="description">`, `<link rel="canonical">` ;
- `<meta name="robots">` avec `max-image-preview:large` (vignettes dans les SERP) ;
- Open Graph complet (`og:title`, `og:description`, `og:image` 1200×630, `og:locale`, `og:type`) ;
- Twitter Cards `summary_large_image` ;
- `hreflang` réciproques FR ⇄ EN + `x-default`, **uniquement** quand la
  traduction existe réellement (voir `translationKey`) ;
- `rel="prev"` / `rel="next"` sur les index paginés ;
- un graphe JSON-LD unique par page.

### Données structurées par type de page

| Page | `@graph` |
| --- | --- |
| Index du blog | `Organization`, `WebSite`, `Blog`, `BreadcrumbList` |
| Article | `Organization`, `WebSite`, `BlogPosting`, `FAQPage` (si FAQ), `BreadcrumbList` |
| Catégorie / tag | `Organization`, `WebSite`, `CollectionPage` + `ItemList`, `BreadcrumbList` |
| Auteur | idem + `Person`/`Organization` |

`FAQPage` n'est émis que si l'article déclare au moins une question : un bloc
FAQ vide ou générique est pénalisant, pas neutre.

### Titre SERP distinct du H1

Le champ facultatif `seoTitle` du frontmatter remplace la balise `<title>`
sans toucher au H1. Utile exactement dans ce cas : un H1 conversationnel qui
parle à l'émotion du lecteur (« Des matchs, des “salut”, jamais de date »)
et un `<title>` optimisé pour la requête cible (« Comment décrocher un premier
date sur une app de rencontre »). Quand `seoTitle` est absent, le `<title>`
vaut `{title} | Kiro`. Quand il est présent, il est utilisé **tel quel** —
garde-le sous 60 caractères.

### La page de recherche est en `noindex`

C'est un outil pour les lecteurs, pas du contenu. Elle est également en
`Disallow` dans `robots.txt`. Toutes les autres pages sont indexables.

## 7. Cohérence visuelle avec le site

Le blog **ne duplique pas** les jetons de design. Au build, `build-blog.mjs`
extrait le bloc `:root { … }` de `src/index.css` et le concatène à
`styles/blog.css`. Changer une couleur de marque dans `src/index.css` la change
automatiquement sur le blog au prochain build.

L'entête et le pied de page du blog reprennent volontairement le balisage et
les classes de `TopNav.jsx` / `Footer.jsx` (`.top-nav`, `.site-footer`,
`.section-inner`, `.card`…). Ils sont réécrits en HTML statique plutôt
qu'importés en React, parce que ces composants dépendent de `react-i18next`,
`framer-motion` et de l'état du navigateur — impossible à rendre au build sans
alourdir considérablement la chaîne.

**Conséquence à connaître** : une refonte visuelle de l'entête ou du pied de
page du site doit être répercutée dans `scripts/blog/templates.mjs` (fonctions
`header` et `footer`) et dans `styles/blog.css`. C'est le seul point de
duplication assumé de l'architecture — il est délibéré, documenté, et limité à
deux fonctions.

La feuille de style et le script sont écrits avec une **empreinte de contenu**
dans leur nom (`blog.4o0n1vos0k.css`) : cache immuable côté CDN, invalidation
automatique dès qu'un octet change.

### Auteurs localisés

Dans `authors.json`, `name`, `jobTitle` et `bio` acceptent soit une chaîne,
soit un objet `{ fr, en }`. C'est ce qui permet à « L'équipe Kiro » de
s'afficher « The Kiro team » sur les pages anglaises — dans le byline, sur la
page auteur, dans le RSS et dans le JSON-LD — sans dupliquer l'auteur.

## 7 bis. Mobile et typographie

Deux mécanismes valent d'être connus avant de toucher aux gabarits.

**Navigation mobile.** En dessous de 720 px la barre horizontale est masquée
(comme sur la landing page). Le blog fournit à la place un menu `<details>`
natif — aucun JavaScript, fermable au clavier, avec les liens du site, la
recherche et la version dans l'autre langue. Sans lui, une page d'article
n'offrirait aucune navigation sur téléphone.

**Images de couverture.** `.post-cover img` porte `height: auto`. Ce n'est pas
décoratif : sans cette déclaration, l'attribut HTML `height="630"` l'emporte
sur `aspect-ratio` et la couverture devient un bandeau vertical rogné sur
mobile. Le ratio suit exactement l'asset (1200 × 630, identique au format
Open Graph), donc une couverture conforme n'est jamais rognée.

**Typographie française.** `frenchTypography()` (dans `utils.mjs`) insère les
espaces insécables imposées par l'orthographe française : fine insécable
(U+202F) dans les guillemets et avant `! ? ; %`, insécable normale (U+00A0)
avant `:`. Sans elle, une ligne peut commencer par un `»` orphelin — très
visible sur mobile. Elle s'applique à trois endroits, et uniquement au
français :

1. les nœuds de texte de Markdown (le corps des articles) — les blocs de code,
   les attributs et les URLs ne passent pas par là ;
2. les champs du frontmatter (`title`, `seoTitle`, `excerpt`, `description`,
   questions de FAQ), qui ne transitent pas par Markdown ;
3. les chaînes d'interface de `UI.fr`, traitées une fois au chargement du
   module — une chaîne ajoutée plus tard est couverte automatiquement.

⚠️ Piège associé : en JavaScript, `\s` englobe U+00A0 et U+202F. Un
`replace(/\s+/g, ' ')` naïf annule toute la typographie. C'est pour cette
raison que `stripHtml()` compacte les blancs avec `[^\S\u00A0\u202F]+`, et que
la recherche côté client normalise les insécables avant de comparer.

## 8. Performance

- Aucun framework, aucune dépendance chargée côté client.
- Le seul JavaScript (`blog-assets/blog.<hash>.js`, ~4 ko) est en `defer` et
  purement optionnel : partage et recherche. Sans lui, tout reste lisible.
- L'index de recherche (`search-index.json`) n'est téléchargé que sur la page
  de recherche, à la première frappe.
- Images en `loading="lazy"` + `decoding="async"`, dimensions déclarées pour
  éviter tout décalage de mise en page (CLS).
- Image de couverture en `fetchpriority="high"` : c'est le LCP de la page.

## 9. Ajouter une langue

1. Ajouter une entrée dans `LANGS` (`scripts/blog/config.mjs`) : `locale`,
   `ogLocale`, `base`, `dir`, `segments`.
2. Ajouter le bloc correspondant dans `UI` (mêmes clés que `fr`).
3. Créer `content/blog/<code>/`.
4. Ajouter les libellés de langue dans `taxonomy.json` (`label`, `slug`,
   `description`) et `authors.json` (`bio`).

Aucun autre fichier à modifier : `hreflang`, sitemaps, RSS et navigation
suivent automatiquement.

## 10. Déploiement

Rien à configurer sur Vercel. Le site est un déploiement statique : les
fichiers de `dist/blog/**/index.html` sont servis directement sur leurs URLs.
Il n'y a **pas** de `vercel.json` avec une réécriture attrape-tout vers
`index.html` — et il ne faut surtout pas en ajouter, cela masquerait toutes les
pages du blog derrière la SPA.

Le domaine utilisé pour les URLs absolues (canonical, Open Graph, sitemap) vient
de `VITE_SITE_URL`, exactement comme pour le reste du site. Valeur par défaut :
`https://kirodating.com`.

### Après le premier déploiement

1. Google Search Console → soumettre `https://kirodating.com/sitemap.xml`.
2. Vérifier `/blog/` avec l'outil d'inspection d'URL (rendu + données structurées).
3. Tester une page article dans le validateur de résultats enrichis de Google.
4. Vérifier le rendu d'un partage sur Facebook (débogueur Open Graph) et sur X.

## 11. Ce qui reste à faire

- [ ] **Lancer `npm install` une fois** pour installer proprement `marked` et
      `gray-matter` et mettre à jour `package-lock.json`. Ce sont des
      dépendances de **développement** : elles servent au build et ne partent
      jamais dans le bundle client.
- [ ] Créer le dossier `public/images/blog/` pour les couvertures d'articles
      (16:9, 1200×675, `.webp`). L'image Open Graph de repli
      (`public/images/og-kiro.jpg`) existe déjà.
- [ ] Rédiger le premier article (voir `docs/SEO-STRATEGIE.md`).

## 12. Journal des vérifications — fondations (04/08/2026)

| Vérification | Résultat |
| --- | --- |
| Génération sur 15 articles de test (12 FR + 3 EN) | 60 fichiers, 0 erreur |
| Génération à vide (0 article) | pages cohérentes, message d'état vide, JSON-LD valide |
| JSON-LD | 50/50 pages, tous parsés sans erreur |
| Sitemaps et RSS | XML bien formés (parseur strict) |
| Liens internes | 100 % résolus vers une page réellement générée |
| Pagination | `/blog/page/2/` et `/3/` + `rel="prev"`/`rel="next"` corrects |
| `hreflang` | réciproques FR ⇄ EN + `x-default`, uniquement quand la traduction existe |
| Recherche côté client | fonctionnelle, accents ignorés, URL synchronisée (`?q=`) |
| Rendu visuel | conforme à l'identité Kiro, desktop et mobile (390 px) |
| ESLint sur les fichiers du blog | 0 erreur |
| ESLint global | 729 erreurs — **identique avant et après** (baseline préexistante du dépôt) |
| Fichiers JSON du projet | tous valides, aucune clé de traduction perdue |

**Non vérifié dans cet environnement** : `vite build` et `npm test` n'ont pas pu
être exécutés (le binaire natif de `rolldown` installé est compilé pour macOS,
et la validation tournait sur une VM Linux). Aucun fichier de `src/utils/` n'a
été touché, donc les tests unitaires existants ne sont pas concernés. **À
relancer localement** : `npm install && npm run build && npm test`.

## 13. Journal des vérifications — premier article (04/08/2026)

Générés : 30 fichiers, 2 articles (FR + EN), 18 URL au sitemap.

| Vérification | Résultat |
| --- | --- |
| Build du blog | vert, 0 avertissement |
| Contenu présent dans le HTML servi | oui — texte intégral, sans JavaScript |
| `<title>` | FR 58 car. · EN 45 car. (via `seoTitle`) |
| Méta-descriptions | FR 154 car. · EN 152 car. |
| Canonical | correct sur les deux versions |
| `hreflang` | `fr-CA` ⇄ `en-CA` réciproques + `x-default` → FR |
| JSON-LD | `Organization`, `WebSite`, `BlogPosting`, `FAQPage`, `BreadcrumbList` — tous parsés |
| `FAQPage` | 10 questions (FR), 8 (EN), toutes visibles sur la page |
| Open Graph / Twitter | complets, image 1200×630 réelle |
| Sitemaps, RSS, index de recherche | XML/JSON valides |
| Liens internes | tous résolus, aucune ancre morte |
| Accessibilité | 1 seul H1 par page, tous les `img` avec `alt`, `lang`, lien d'évitement |
| Rendu | vérifié 1280 px et 390 px, FR et EN |
| Erreurs JavaScript | aucune |
| ESLint sur les fichiers du blog | 0 erreur |

### Correctifs mobile et typographie (04/08/2026, après relecture)

| Problème constaté | Cause | Correctif |
| --- | --- | --- |
| Couverture rognée en bandeau vertical sur mobile | l'attribut `height="630"` primait sur `aspect-ratio`, faute de `height: auto` | ratio calé sur l'asset (1200 × 630) + `height: auto` |
| Débordement horizontal à 390 px (447 px de contenu) | le dernier maillon du fil d'Ariane en `white-space: nowrap` refusait de rétrécir | passage à la ligne autorisé, `min-width: 0`, et masquage du maillon redondant avec le H1 sur les articles seulement |
| Aucune navigation sur téléphone | `.nav-center` masqué sous 720 px sans remplacement | menu `<details>` natif, sans JavaScript |
| `»` orphelin en début de ligne dans le H1 | espaces ordinaires dans les guillemets | `frenchTypography()` appliqué au corps, au frontmatter et à l'interface |

Vérifié après correctif : aucun débordement horizontal à 390 et 494 px, ratio
de couverture exact (1,9), 0 faute typographique sur l'ensemble des pages
françaises, page anglaise intacte (aucune insécable française), desktop
inchangé, ESLint toujours à 0 sur les fichiers du blog.

**Point d'accessibilité connu** : le pied de page utilise des `<h4>` pour les
titres de colonnes, ce qui crée un saut de niveau après le dernier `<h2>` de
l'article. Le comportement est identique sur la landing page React
(`Footer.jsx`), donc le blog reste cohérent avec le site. Ce n'est pas un échec
WCAG A/AA, mais si le pied de page est retravaillé un jour, c'est l'occasion de
corriger les deux au même endroit.

---

## 14. Ajouts du 8 août 2026 (article 2)

### Nouveaux champs de frontmatter, tous facultatifs

| Champ | Rôle |
| --- | --- |
| `coverVector` | SVG de l'illustration. Quand il existe, c'est lui que le navigateur affiche via `<picture>` — net à toute densité d'écran. Le raster `cover` reste la source de l'Open Graph (les réseaux sociaux refusent le SVG) et le repli. |
| `coverSrcset` | Jeu de rasters pour ce repli, du plus petit au plus grand. **Chaque taille doit être rasterisée depuis le vectoriel**, jamais agrandie depuis une taille inférieure. |
| `coverTitle` | Attribut `title` de l'image, repris dans le sitemap images. |
| `coverCaption` | Légende visible sous l'illustration. |
| `coverCredit` | Crédit visible sous la légende. Obligatoire dès qu'une image vient d'un tiers. |
| `template` | `true` sur un fichier de documentation. Il est alors ignoré partout, **y compris en mode relecture**. Sans ça, les modèles produiraient une page `/blog/mon-slug-seo/`. |

### La une

Par défaut, la une est **l'article le plus récent** : aucune intervention n'est
nécessaire quand un nouvel article paraît. `featured: true` sert à épingler un
article en tête malgré la chronologie, et **un seul épinglage est honoré, le
plus récent** — sans cette limite, un vieil article dont on aurait oublié de
retirer le drapeau resterait indéfiniment devant des articles plus frais.

Le badge « À la une » suit la carte de tête, pas le drapeau.

### Relecture locale d'un brouillon

```bash
npm run blog:preview   # BLOG_PREVIEW_DRAFTS=1 node scripts/build-blog.mjs
```

Génère aussi les pages des articles `draft: true` ou datés dans le futur, et
affiche leur URL locale complète dans le terminal. Trois garanties :

1. le mode **échoue** si `VERCEL` ou `NODE_ENV=production` sont présents ;
2. les brouillons sont chargés dans un **tableau séparé** — ils n'entrent donc
   dans aucun index, catégorie, tag, page auteur, article relié, flux RSS ou
   index de recherche, non par filtrage mais parce qu'ils ne sont pas dans les
   données ;
3. chaque page produite est `noindex` quoi qu'en dise son frontmatter, et
   n'est jamais ajoutée au sitemap.

`draft: true` bloque la publication **quelle que soit la date**. Vérifié sur les
trois cas : date passée, date du jour, date future.

### Garde-fou anti-lien-mort

`scripts/blog/links.mjs` fait **échouer le build** dès qu'un lien d'article
pointe vers une page de blog qui n'est pas générée. Une référence à un article
à venir doit donc rester du texte simple ; elle est suivie dans
`docs/seo/registre-contenus.csv` et activée le jour de la publication de la
cible. Couvert par 11 tests (`npm test`).

### Fiche auteur

Une seule source de vérité : `content/blog/authors.json`. Un auteur peut porter
`jobTitle` (affiché) et `jobTitleSchema` (JSON-LD, plus court), `url`,
`urlLabel`, `bio` et `avatar`. La signature en tête d'article renvoie à la page
auteur, et un encadré en fin d'article reprend nom, titre, biographie, lien vers
tous ses articles et lien externe en `rel="author"`.

### Sitemap images

`<urlset>` porte l'espace de noms `image:` et chaque article déclare son
illustration (`<image:loc>`, `<image:title>`, `<image:caption>`). Sans effet si
un article n'a pas de couverture.

### Génération des illustrations

`scripts/covers/banniere-diaspora-caribeenne.mjs` produit la bannière de
l'article 2 à partir des textes officiels qui définissent chaque drapeau
(constitution ou loi), sources citées en commentaire. La constante `SELECTION`
suffit à décliner la même grammaire visuelle pour un autre article. Ce script
ne fait pas partie du build.

`scripts/media/importer-photos.mjs` vérifie auteur et licence auprès de l'API de
Wikimedia Commons **avant** de télécharger une photographie, et refuse le
fichier si l'un des deux ne correspond plus à ce qui était attendu.
