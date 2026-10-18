/**
 * Configuration centrale du blog Kiro.
 *
 * Tout ce qui est susceptible de changer (domaine, pagination, libellés,
 * segments d'URL) vit ici. Aucun autre module du générateur ne doit contenir
 * de valeur en dur.
 *
 * Le domaine suit exactement la même logique que le site : variable
 * d'environnement `VITE_SITE_URL`, sinon la valeur par défaut du projet.
 * (cf. vite.config.js et src/config/links.js)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readOgPreview } from '../og-preview.mjs';
import { frenchTypography } from './utils.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Racine du projet (premium-landing-page/) */
export const ROOT = path.resolve(here, '../..');

export const PATHS = {
  root: ROOT,
  content: path.join(ROOT, 'content', 'blog'),
  styles: path.join(ROOT, 'styles'),
  appCss: path.join(ROOT, 'src', 'index.css'),
  publicDir: path.join(ROOT, 'public'),
  /** Sortie : le dossier produit par `vite build` */
  dist: path.join(ROOT, 'dist'),
  /** Photographies : originaux hors dépôt public, dérivés web publiés. */
  photoSources: path.join(ROOT, 'media', 'photos'),
  photoOutput: path.join(ROOT, 'public', 'images', 'blog', 'photos'),
};

/** Chemin de site d'une photographie dérivée, sans extension ni largeur. */
export const photoBase = (collection, id) => `/images/blog/photos/${collection}/${id}`;

/** Domaine officiel, sans barre oblique finale. */
export const SITE_URL = (process.env.VITE_SITE_URL || 'https://kirodating.com').replace(/\/+$/, '');

/**
 * Centre d'aide officiel de Kiro.
 *
 * Le générateur du blog est un script Node : il ne peut pas importer
 * `src/config/links.js`, qui dépend de `import.meta.env` (Vite). Les deux
 * runtimes lisent donc la MÊME variable d'environnement `VITE_HELP_BASE` et
 * appliquent la même valeur par défaut — un seul réglage suffit à déplacer le
 * centre d'aide partout.
 *
 * ATTENTION — ne jamais repointer vers kirosocial.com : c'est un autre projet
 * et son ancien centre d'aide ne répond plus.
 */
const HELP_BASE = (process.env.VITE_HELP_BASE || 'https://aide.kirodating.com').replace(/\/+$/, '');

/** Pages du centre d'aide réellement publiées sous ce domaine (vérifiées). */
export const HELP = {
  base: `${HELP_BASE}/`,
  support: `${HELP_BASE}/support`,
  terms: `${HELP_BASE}/conditions-utilisation`,
  privacy: `${HELP_BASE}/politique-confidentialite`,
};

/** Adresse de contact affichée dans le pied de page du blog. */
export const CONTACT_EMAIL = process.env.VITE_CONTACT_EMAIL || 'contact@kirosocial.com';

/**
 * Licences des photographies publiées sur le blog.
 *
 * Une seule table, pour une raison précise : le champ `license` de Schema.org
 * et le champ XMP `WebStatement` embarqué dans le fichier doivent porter
 * EXACTEMENT la même URL. Si les deux divergent, Google considère la
 * déclaration comme non fiable et n'affiche pas le badge de licence.
 *
 * `deed` est la page lisible par un humain, `legal` le texte juridique complet.
 * C'est `deed` qui est déclarée partout : c'est ce qu'un réutilisateur doit lire.
 *
 * Ajouter une licence = ajouter une entrée ici. Une photo qui référence une clé
 * absente de cette table fait échouer le build — jamais de licence approximative.
 */
export const PHOTO_LICENSES = {
  'CC-BY-NC-4.0': {
    id: 'CC-BY-NC-4.0',
    spdx: 'CC-BY-NC-4.0',
    deed: {
      fr: 'https://creativecommons.org/licenses/by-nc/4.0/deed.fr',
      en: 'https://creativecommons.org/licenses/by-nc/4.0/',
    },
    legal: 'https://creativecommons.org/licenses/by-nc/4.0/legalcode',
    label: 'CC BY-NC 4.0',
    short: {
      fr: 'réutilisation non commerciale, avec attribution',
      en: 'non-commercial reuse, with attribution',
    },
    summary: {
      fr: 'Vous pouvez copier, redistribuer et adapter cette photographie à des fins non commerciales, à condition de créditer le photographe.',
      en: 'You may copy, redistribute and adapt this photograph for non-commercial purposes, provided you credit the photographer.',
    },
  },
};

/** Nom de la marque, utilisé dans les <title> et le JSON-LD. */
export const BRAND = 'Kiro';

/** Nombre d'articles par page sur les index paginés. */
export const PER_PAGE = 12;

/** Nombre d'articles reliés affichés en bas d'un article. */
export const RELATED_COUNT = 3;

/** Vitesse de lecture retenue pour l'estimation (mots/minute, lecture FR sur écran). */
export const WORDS_PER_MINUTE = 200;

/**
 * Langues du blog.
 *
 * `locale`      : code BCP-47 complet, utilisé pour hreflang et <html lang>
 * `ogLocale`    : format Open Graph (underscore)
 * `base`        : préfixe de toutes les URLs du blog dans cette langue
 * `segments`    : segments d'URL traduits (catégorie / tag / auteur / page…)
 * `isDefault`   : la langue qui reçoit `x-default`
 *
 * Ajouter une langue = ajouter une entrée ici + un dossier content/blog/<code>.
 * Rien d'autre à toucher.
 */
export const LANGS = {
  fr: {
    code: 'fr',
    locale: 'fr-CA',
    ogLocale: 'fr_CA',
    isDefault: true,
    base: '/blog',
    dir: 'fr',
    segments: {
      category: 'categorie',
      tag: 'tag',
      author: 'auteur',
      page: 'page',
      search: 'recherche',
      authors: 'auteurs',
      photoCredits: 'credits-photos',
    },
  },
  en: {
    code: 'en',
    locale: 'en-CA',
    ogLocale: 'en_CA',
    isDefault: false,
    base: '/en/blog',
    dir: 'en',
    segments: {
      category: 'category',
      tag: 'tag',
      author: 'author',
      page: 'page',
      search: 'search',
      authors: 'authors',
      photoCredits: 'photo-credits',
    },
  },
};

export const LANG_CODES = Object.keys(LANGS);

/** Libellés d'interface du blog. Aucune chaîne visible ne doit être écrite ailleurs. */
export const UI = {
  fr: {
    blog: 'Blog',
    home: 'Accueil',
    blogTitle: 'Le blog Kiro',
    blogTagline:
      'Du match à la vraie rencontre : profil, conversation, premiers rendez-vous — sans filtre, sans recette magique.',
    metaTitleIndex: 'Blog Kiro — conversation, profil et premiers rendez-vous',
    metaDescIndex:
      'Conseils de rencontres écrits sans recette magique : profil, premier message, conversation, organisation d’un premier rendez-vous, sécurité, et guides pour les communautés du Québec et du Canada.',
    readingTime: (m) => `${m} min de lecture`,
    publishedOn: 'Publié le',
    updatedOn: 'Mis à jour le',
    by: 'Par',
    categories: 'Catégories',
    category: 'Catégorie',
    tags: 'Sujets',
    tag: 'Sujet',
    author: 'Auteur',
    allArticles: 'Tous les articles',
    inThisArticle: 'Dans cet article',
    faqTitle: 'Questions fréquentes',
    aboutAuthor: 'À propos de l’auteur',
    authorAllPosts: (n) => `Tous les articles de ${n}`,
    authorWebsite: 'Site personnel',
    authorElsewhere: 'Aussi sur',
    relatedTitle: 'À lire ensuite',
    share: 'Partager',
    shareOn: (n) => `Partager sur ${n}`,
    copyLink: 'Copier le lien',
    copied: 'Lien copié',
    previous: 'Précédent',
    next: 'Suivant',
    pageOf: (a, b) => `Page ${a} sur ${b}`,
    search: 'Rechercher',
    searchTitle: 'Rechercher dans le blog',
    searchPlaceholder: 'Un sujet, une ville, une question…',
    searchNoResult: 'Aucun article ne correspond à cette recherche.',
    searchPrompt: 'Tape un mot pour lancer la recherche.',
    searchCount: (n) => (n === 1 ? '1 article trouvé' : `${n} articles trouvés`),
    empty: 'Aucun article publié pour l’instant. Reviens bientôt.',
    ctaTitle: 'Arrête de swiper. Viens rencontrer.',
    ctaText:
      'Kiro, c’est l’app de rencontre qui casse la glace : jeux brise-glace, traduction instantanée (créole inclus) et vraies conversations.',
    ctaButton: 'Découvrir Kiro',
    breadcrumbAria: 'Fil d’Ariane',
    paginationAria: 'Pagination',
    featured: 'À la une',
    otherLang: 'Read in English',
    minRead: 'min',
    backToBlog: '← Retour au blog',
    articlesIn: (n) => `Articles classés dans « ${n} »`,
    articlesTagged: (n) => `Articles sur le sujet « ${n} »`,
    articlesBy: (n) => `Articles de ${n}`,
    /* ── Redesign éditorial ─────────────────────────────────────────────── */
    featuredEyebrow: 'À la une',
    latest: 'Derniers articles',
    browse: 'Parcourir',
    filters: 'Filtrer',
    filtersClose: 'Fermer les filtres',
    moreOptions: 'Plus d’options',
    archives: 'Archives',
    archivesAll: 'Toutes les archives',
    archivesTitle: 'Archives du blog',
    archiveYear: (y) => `Articles publiés en ${y}`,
    archiveMonth: (m, y) => `Articles publiés en ${m} ${y}`,
    archiveYearMeta: (y) => `Tous les articles du blog Kiro publiés en ${y} : conseils rencontres, conversation, profil et premiers rendez-vous.`,
    archiveMonthMeta: (m, y) => `Les articles du blog Kiro publiés en ${m} ${y}.`,
    exploreTopics: 'Explorer par sujet',
    authors: 'Les auteurs',
    authorsTitle: 'Les auteurs du blog',
    authorsMeta: 'Qui écrit sur le blog Kiro : parcours, rôle et articles publiés.',
    allAuthors: 'Tous les auteurs',
    articleCount: (n) => (n === 1 ? '1 article' : `${n} articles`),
    writesAbout: 'Écrit surtout sur',
    photoCredits: 'Crédits photo',
    photoCreditsTitle: 'Crédits et licence des photographies',
    photoCreditsMeta:
      'Les photographies publiées sur le blog Kiro : auteur, lieu, article, et conditions de réutilisation.',
    photoCreditsIntro:
      'Les photographies qui illustrent ce blog sont des originaux, pris sur place. Cette page dit qui les a faites, où, et ce que vous avez le droit d’en faire.',
    photoCreditsHowTo: 'Réutiliser une photographie',
    photoCreditsUnused: 'Non publiée pour l’instant',
    photoCreditsSeenIn: 'Publiée dans',
    photoCreditsPhotographer: 'Photographe',
    photoCreditsPlace: 'Lieu',
    photoCreditsLicense: 'Licence',
    photoCreditsCount: (n) => (n === 1 ? '1 photographie' : `${n} photographies`),
    openSearch: 'Ouvrir la recherche',
    closeSearch: 'Fermer la recherche',
    searchIntro: 'Cherche un sujet, une ville, une question — ou parcours ce qui suit.',
    suggestions: 'Suggestions de recherche',
    popularTopics: 'Sujets fréquents',
    recentArticles: 'Articles récents',
    previousArticle: 'Article précédent',
    nextArticle: 'Article suivant',
    inCategory: 'Dans la même catégorie',
    resources: 'Ressources',
    months: [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    ],
    footerPitch:
      'Kiro aide à passer du match à une vraie rencontre : profil, conversation, jeux brise-glace et planification de date.',
  },
  en: {
    blog: 'Blog',
    home: 'Home',
    blogTitle: 'The Kiro blog',
    blogTagline:
      'From match to real date: profile, conversation, first dates — no filters, no magic formulas.',
    metaTitleIndex: 'Kiro Blog — conversation, profiles and first dates',
    metaDescIndex:
      'Dating advice written without magic formulas: profiles, first messages, conversation, planning a first date, safety, and guides for communities across Quebec and Canada.',
    readingTime: (m) => `${m} min read`,
    publishedOn: 'Published on',
    updatedOn: 'Updated on',
    by: 'By',
    categories: 'Categories',
    category: 'Category',
    tags: 'Topics',
    tag: 'Topic',
    author: 'Author',
    allArticles: 'All articles',
    inThisArticle: 'In this article',
    faqTitle: 'Frequently asked questions',
    aboutAuthor: 'About the author',
    authorAllPosts: (n) => `All articles by ${n}`,
    authorWebsite: 'Personal website',
    relatedTitle: 'Read next',
    share: 'Share',
    shareOn: (n) => `Share on ${n}`,
    copyLink: 'Copy link',
    copied: 'Link copied',
    previous: 'Previous',
    next: 'Next',
    pageOf: (a, b) => `Page ${a} of ${b}`,
    search: 'Search',
    searchTitle: 'Search the blog',
    searchPlaceholder: 'A topic, a city, a question…',
    searchNoResult: 'No article matches this search.',
    searchPrompt: 'Type a word to start searching.',
    searchCount: (n) => (n === 1 ? '1 article found' : `${n} articles found`),
    empty: 'No article published yet. Check back soon.',
    ctaTitle: 'Stop swiping. Start meeting.',
    ctaText:
      'Kiro is the dating app that breaks the ice: icebreaker games, instant translation (Creole included) and real conversations.',
    ctaButton: 'Discover Kiro',
    breadcrumbAria: 'Breadcrumb',
    paginationAria: 'Pagination',
    featured: 'Featured',
    otherLang: 'Lire en français',
    minRead: 'min',
    backToBlog: '← Back to the blog',
    articlesIn: (n) => `Articles in “${n}”`,
    articlesTagged: (n) => `Articles tagged “${n}”`,
    articlesBy: (n) => `Articles by ${n}`,
    /* ── Editorial redesign ─────────────────────────────────────────────── */
    featuredEyebrow: 'Featured',
    latest: 'Latest articles',
    browse: 'Browse',
    filters: 'Filter',
    filtersClose: 'Close filters',
    moreOptions: 'More options',
    archives: 'Archives',
    archivesAll: 'All archives',
    archivesTitle: 'Blog archives',
    archiveYear: (y) => `Articles published in ${y}`,
    archiveMonth: (m, y) => `Articles published in ${m} ${y}`,
    archiveYearMeta: (y) => `Every Kiro blog article published in ${y}: dating advice, conversation, profiles and first dates.`,
    archiveMonthMeta: (m, y) => `Kiro blog articles published in ${m} ${y}.`,
    exploreTopics: 'Explore by topic',
    authors: 'The authors',
    authorsTitle: 'Blog authors',
    authorsMeta: 'Who writes on the Kiro blog: background, role and published articles.',
    allAuthors: 'All authors',
    articleCount: (n) => (n === 1 ? '1 article' : `${n} articles`),
    writesAbout: 'Mostly writes about',
    photoCredits: 'Photo credits',
    photoCreditsTitle: 'Photo credits and licence',
    photoCreditsMeta:
      'The photographs published on the Kiro blog: author, place, article, and reuse conditions.',
    photoCreditsIntro:
      'The photographs on this blog are originals, taken on location. This page says who made them, where, and what you may do with them.',
    photoCreditsHowTo: 'Reusing a photograph',
    photoCreditsUnused: 'Not published yet',
    photoCreditsSeenIn: 'Published in',
    photoCreditsPhotographer: 'Photographer',
    photoCreditsPlace: 'Place',
    photoCreditsLicense: 'Licence',
    photoCreditsCount: (n) => (n === 1 ? '1 photograph' : `${n} photographs`),
    openSearch: 'Open search',
    closeSearch: 'Close search',
    searchIntro: 'Look for a topic, a city, a question — or browse below.',
    suggestions: 'Search suggestions',
    popularTopics: 'Common topics',
    recentArticles: 'Recent articles',
    previousArticle: 'Previous article',
    nextArticle: 'Next article',
    inCategory: 'In the same category',
    resources: 'Resources',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    footerPitch:
      'Kiro helps you go from a match to a real date: profile, conversation, icebreaker games and date planning.',
  },
};

/**
 * Les chaînes d'interface francophones suivent les mêmes règles typographiques
 * que les articles : insécable dans les guillemets et avant les ponctuations
 * doubles. Appliqué ici une fois pour toutes, plutôt qu'à chaque point
 * d'affichage — impossible d'oublier une chaîne ajoutée plus tard.
 */
const withFrenchTypography = (dict) =>
  Object.fromEntries(
    Object.entries(dict).map(([key, value]) => {
      if (typeof value === 'function') return [key, (...args) => frenchTypography(value(...args))];
      if (typeof value === 'string') return [key, frenchTypography(value)];
      return [key, value];
    }),
  );

UI.fr = withFrenchTypography(UI.fr);

/** Image Open Graph de repli quand un article n'a pas de couverture. */
/**
 * Image de partage par défaut du blog.
 *
 * Lue depuis le manifeste produit par `npm run og`, pas écrite en dur : le nom
 * du fichier porte l'empreinte de ses sources, précisément pour qu'un aperçu
 * modifié reçoive une NOUVELLE URL. Sans ça, Facebook et WhatsApp continueraient
 * de servir la version qu'ils ont mise en cache, parfois pendant des semaines.
 */
export const DEFAULT_OG_IMAGE = readOgPreview(ROOT).image;

/** Comptes sociaux — repris de src/config/links.js (sameAs du JSON-LD Organization). */
export const SOCIAL = [
  'https://www.tiktok.com/@kirosocial',
  'https://www.instagram.com/kirosocial',
  'https://www.facebook.com/kirosocial',
];
