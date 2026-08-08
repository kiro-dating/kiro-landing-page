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
};

/** Domaine officiel, sans barre oblique finale. */
export const SITE_URL = (process.env.VITE_SITE_URL || 'https://kirodating.com').replace(/\/+$/, '');

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
      'Rencontres, relations et vie de couple au Québec — sans filtre, sans recette magique.',
    metaTitleIndex: 'Blog Kiro — conseils rencontres, relations et vie de couple au Québec',
    metaDescIndex:
      'Conseils de rencontres, guides locaux et réponses honnêtes pour les célibataires du Québec, du Canada et de la diaspora. Écrit par l’équipe Kiro.',
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
  },
  en: {
    blog: 'Blog',
    home: 'Home',
    blogTitle: 'The Kiro blog',
    blogTagline: 'Dating, relationships and real talk for singles in Quebec and Canada.',
    metaTitleIndex: 'Kiro Blog — dating advice for Quebec and Canada',
    metaDescIndex:
      'Dating advice, local guides and honest answers for singles across Quebec, Canada and the diaspora. Written by the Kiro team.',
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
export const DEFAULT_OG_IMAGE = '/images/og-kiro.jpg';

/** Comptes sociaux — repris de src/config/links.js (sameAs du JSON-LD Organization). */
export const SOCIAL = [
  'https://www.tiktok.com/@kirosocial',
  'https://www.instagram.com/kirosocial',
  'https://www.facebook.com/kirosocial',
];
