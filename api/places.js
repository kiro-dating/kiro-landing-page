/**
 * SQUELETTE — deviendra `api/places.js` à la racine du projet (fonction Vercel).
 *
 * Flux : ville détectée côté serveur (en-tête Vercel, silencieux, sans pop-up)
 *        → API de lieux avec la clé SECRÈTE (jamais côté client)
 *        → JSON propre, mis en cache CDN 24 h par ville.
 *
 * Prérequis (à faire dans Vercel, pas dans le code) :
 *   Settings → Environment Variables → KIRO_PLACES_KEY = ta clé Yelp ou Foursquare
 *   Settings → Environment Variables → KIRO_PLACES_PROVIDER = "yelp" | "foursquare"
 */

const PROVIDERS = {
  /* Yelp Fusion — excellent en Amérique du Nord, faible en Haïti/Antilles */
  yelp: async (city, key) => {
    const url = new URL('https://api.yelp.com/v3/businesses/search');
    url.searchParams.set('location', city);
    url.searchParams.set('categories', 'restaurants,cafes,lounges,bars');
    url.searchParams.set('attributes', 'hot_and_new');
    url.searchParams.set('sort_by', 'rating');
    url.searchParams.set('limit', '10');
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`yelp ${res.status}`);
    const data = await res.json();
    return (data.businesses || []).map((b) => ({
      id: b.id,
      name: b.name,
      category: b.categories?.[0]?.title || '',
      rating: b.rating || null,
      image: b.image_url || null,
    }));
  },

  /* Foursquare Places — meilleure couverture mondiale (Haïti incluse) */
  foursquare: async (city, key) => {
    const url = new URL('https://api.foursquare.com/v3/places/search');
    url.searchParams.set('near', city);
    url.searchParams.set('categories', '13065,13032,13003,10032'); // resto, café, bar, night
    url.searchParams.set('sort', 'RATING');
    url.searchParams.set('limit', '10');
    url.searchParams.set('fields', 'fsq_id,name,categories,rating,photos');
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) throw new Error(`foursquare ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((p) => ({
      id: p.fsq_id,
      name: p.name,
      category: p.categories?.[0]?.name || '',
      rating: p.rating || null,
      image: p.photos?.[0] ? `${p.photos[0].prefix}600x800${p.photos[0].suffix}` : null,
    }));
  },
};

export default async function handler(req, res) {
  try {
    /* 1. Ville du visiteur — fournie par Vercel, silencieuse, sans pop-up */
    const city = decodeURIComponent(req.headers['x-vercel-ip-city'] || '');
    const country = req.headers['x-vercel-ip-country'] || '';
    if (!city) {
      /* Ville inconnue (VPN, bot…) : le front garde sa liste statique */
      return res.status(204).end();
    }

    /* 2. Appel du fournisseur avec la clé secrète (env var, jamais exposée) */
    const key = process.env.KIRO_PLACES_KEY;
    const provider = PROVIDERS[process.env.KIRO_PLACES_PROVIDER || 'foursquare'];
    if (!key || !provider) return res.status(204).end();

    const places = await provider(`${city}, ${country}`, key);
    const withImages = places.filter((p) => p.image);
    if (withImages.length < 4) {
      /* Trop peu de résultats exploitables : fallback statique côté front */
      return res.status(204).end();
    }

    /* 3. Cache CDN : 24 h par ville — ~1 appel API par ville et par jour,
       quel que soit le nombre de visiteurs */
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.status(200).json({ city, places: withImages.slice(0, 10) });
  } catch {
    /* Toute erreur = silence : le front affiche le statique */
    return res.status(204).end();
  }
}
