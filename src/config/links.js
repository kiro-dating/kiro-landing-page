/**
 * Liens officiels Kiro — TOUS surchargeables par variables d'environnement.
 *
 * Sur Vercel : Settings → Environment Variables, préfixe obligatoire `VITE_`
 * (les valeurs sont intégrées au moment du BUILD — redéployer après un
 * changement). Sans variable définie, la valeur par défaut ci-dessous
 * s'applique. Voir `.env.example` à la racine pour la liste complète.
 */
const env = import.meta.env;

/* Domaine officiel du site (aussi utilisé par index.html pour les metas) */
export const SITE_URL = env.VITE_SITE_URL || 'https://kirodating.com';

/* Centre d'aide officiel de Kiro. Source unique : toutes les surfaces
   Support / Aide / Légal en dérivent.

   ATTENTION — ne jamais repointer vers kirosocial.com : Kiro Social est un
   AUTRE projet, son ancien centre d'aide (kirosocial.com/aide) ne répond plus
   (404 DEPLOYMENT_NOT_FOUND) et ne fait plus partie du parcours Kiro.
   Le contrôle src/utils/__tests__/links.test.js échoue si cela se reproduit. */
const HELP_BASE = (env.VITE_HELP_BASE || 'https://aide.kirodating.com').replace(/\/+$/, '');

export const LINKS = {
  // Help Center
  terms: env.VITE_TERMS_URL || `${HELP_BASE}/conditions-utilisation`,
  privacy: env.VITE_PRIVACY_URL || `${HELP_BASE}/politique-confidentialite`,
  support: env.VITE_SUPPORT_URL || `${HELP_BASE}/support`,

  // Contact
  contactEmail: env.VITE_CONTACT_EMAIL || 'contact@kirosocial.com',
  supportEmail: env.VITE_SUPPORT_EMAIL || 'support@kirosocial.com',

  // Tester l'application
  telegram: env.VITE_TELEGRAM_URL || 'https://t.me/REMPLACER_PAR_LE_LIEN_DU_GROUPE',
  whatsapp: env.VITE_WHATSAPP_URL || 'https://whatsapp.com/channel/REMPLACER_PAR_LE_LIEN_DE_LA_CHAINE',
  testflightStore: env.VITE_TESTFLIGHT_STORE_URL || 'https://apps.apple.com/us/app/testflight/id899247664',
  testflight: env.VITE_TESTFLIGHT_URL || 'https://testflight.apple.com/join/REMPLACER',
  playstore: env.VITE_PLAYSTORE_URL || 'https://play.google.com/store/apps/details?id=REMPLACER',

  // Réseaux sociaux
  tiktok: env.VITE_TIKTOK_URL || 'https://www.tiktok.com/@kirosocial',
  instagram: env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/kirosocial',
  facebook: env.VITE_FACEBOOK_URL || 'https://www.facebook.com/kirosocial',
};
