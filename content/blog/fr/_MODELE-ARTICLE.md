---
# ═══════════════════════════════════════════════════════════════════════════
# MODÈLE D'ARTICLE — Blog Kiro (français)
# ───────────────────────────────────────────────────────────────────────────
# 1. Copier ce fichier :  content/blog/fr/mon-slug-seo.md
#    Le NOM DU FICHIER devient l'URL : /blog/mon-slug-seo/
# 2. Retirer `draft: true` quand l'article est prêt à être publié.
# 3. Lancer `npm run blog:build` pour vérifier, `npm run build` pour générer tout.
#
# Le générateur REFUSE de construire si un champ obligatoire manque, si la
# catégorie n'existe pas, si l'auteur est inconnu ou si un slug est en double.
# C'est volontaire : mieux vaut un build rouge qu'une page mal balisée en ligne.
# ═══════════════════════════════════════════════════════════════════════════

# ── OBLIGATOIRE ────────────────────────────────────────────────────────────

# H1 de la page ET <title> (suffixé « | Kiro » automatiquement).
# 50-60 caractères idéalement. Le mot-clé principal le plus à gauche possible.
# Écrire pour un humain d'abord : un titre qui donne envie de cliquer.
title: 'Titre de l’article avec le mot-clé principal'

# Titre de la balise <title>, quand il doit différer du H1. FACULTATIF.
# Utilisé tel quel (le suffixe « | Kiro » n'est PAS ajouté) : garde 50-60 car.
# À quoi ça sert : le H1 peut être conversationnel et parler à l'émotion du
# lecteur, pendant que le <title> reste optimisé pour la requête cible.
# Sans ce champ, le <title> vaut « {title} | Kiro ».
seoTitle: 'Le titre optimisé pour la SERP, 50-60 caractères'

# Slug SEO. Optionnel : par défaut, le nom du fichier est utilisé.
# Toujours en minuscules, sans accent, mots séparés par des tirets, 3-6 mots.
# ⚠️ Une fois publié, NE JAMAIS le changer sans mettre en place une redirection.
slug: 'mon-slug-seo'

# Méta-description : 140-160 caractères. Ce n'est pas un facteur de classement
# mais c'est ce qui décide du clic dans Google. Une promesse + un bénéfice.
description: 'Ce que le lecteur va apprendre, en une phrase claire et concrète qui donne envie de cliquer depuis Google.'

# Date de publication (ISO). Une date future = publication programmée :
# l'article reste dans le dépôt mais n'est pas généré tant que la date n'est
# pas atteinte.
publishedAt: '2026-08-04'

# Catégorie — UNE SEULE, clé issue de content/blog/taxonomy.json
category: 'conversation-et-profil'

# Auteur — clé issue de content/blog/authors.json
author: 'equipe-kiro'

# ── RECOMMANDÉ ─────────────────────────────────────────────────────────────

# Date de dernière mise à jour. À renseigner à chaque révision de fond :
# la fraîcheur affichée est un signal fort, et trois des cinq grandes apps
# de rencontre ne l'affichent même pas. Facile à faire mieux qu'elles.
updatedAt: '2026-08-04'

# Résumé affiché sous le H1 et dans les cartes d'articles. 1 à 2 phrases.
# Sans lui, un extrait automatique du corps est utilisé — c'est moins bon.
excerpt: 'Le chapô de l’article : ce qu’on va y trouver, sur un ton direct, en une ou deux phrases.'

# Image de couverture. Chemin dans public/ — format 16:9, idéalement 1200×675,
# en .webp. Sert aussi d'image Open Graph et Twitter Card.
cover: '/images/blog/mon-slug-seo.webp'
coverAlt: 'Description de l’image pour l’accessibilité et le SEO image.'

# Tags transversaux — clés issues de taxonomy.json. 2 à 5 maximum.
tags:
  - 'premier-message'
  - 'montreal'

# ── OPTIONNEL ──────────────────────────────────────────────────────────────

# Brouillon : l'article est ignoré par le générateur (aucune page, aucun
# sitemap, aucun RSS). Retirer cette ligne pour publier.
draft: true

# Mise en avant : l'article apparaît en grande carte en haut du blog.
featured: false

# Temps de lecture forcé (minutes). Par défaut, calculé automatiquement.
# readingTime: 8

# Articles reliés, par slug. Les emplacements restants sont complétés
# automatiquement (même catégorie, puis tags partagés, puis récence).
# related:
#   - 'autre-article'

# Version anglaise du même article : mettre la MÊME valeur dans les deux
# fichiers FR et EN. C'est ce qui génère les balises hreflang réciproques.
# Sans cette clé, aucun hreflang n'est émis — ce qui est préférable à un
# hreflang qui pointe vers une traduction inexistante.
# translationKey: 'mon-sujet'

# Désindexation (page utile aux lecteurs, sans valeur pour Google).
# noindex: false

# URL canonique forcée — uniquement en cas de contenu republié ailleurs.
# canonical: 'https://kirodating.com/blog/autre-page/'

# ── FAQ ────────────────────────────────────────────────────────────────────
# Génère un bloc dépliant en fin d'article ET les données structurées
# schema.org/FAQPage (éligibilité aux résultats enrichis de Google).
#
# Règles : 3 à 6 questions maximum ; reprendre les formulations RÉELLES des
# internautes (« Autres questions posées » de Google) ; répondre en 40-60 mots,
# la réponse directe dès la première phrase. Ne pas dupliquer mot pour mot le
# corps de l'article. Le Markdown est accepté dans les réponses.
faq:
  - q: 'Une question telle que les gens la tapent réellement dans Google ?'
    a: 'La réponse directe en première phrase, puis une précision utile. Entre 40 et 60 mots.'
  - q: 'Deuxième question fréquente ?'
    a: 'Réponse courte, concrète, sans détour. Un [lien interne](/blog/autre-article/) est possible.'
---

<!--
  ═══════════════════════════════════════════════════════════════════════════
  STRUCTURE RECOMMANDÉE DU CORPS
  ───────────────────────────────────────────────────────────────────────────
  · Pas de `# H1` ici : le H1 vient du champ `title`.
  · Commencer par 2-3 paragraphes d'introduction : le problème, pourquoi ça
    compte au Québec, et ce que l'article apporte concrètement.
  · Ensuite des `## H2` (5 à 9), subdivisés en `### H3` si besoin.
    Les H2 génèrent automatiquement la table des matières (à partir de 3 H2).
  · Longueur : 900-1 300 mots pour un article d'actualité ou de conseil ciblé,
    2 000-3 500 mots pour une page pilier qui vise un mot-clé disputé.
  · Liens internes : 3 à 5 minimum, dont au moins un vers un autre cluster.
    Ancres descriptives (« rencontres haïtiennes au Québec »), jamais « ici ».
  · Liens externes : uniquement vers des sources solides (Statistique Canada,
    médias québécois, organismes). Ils s'ouvrent automatiquement dans un
    nouvel onglet avec rel="noopener".
  · UN SEUL appel à l'action produit dans le corps, après avoir délivré de la
    valeur. Le bloc CTA de bas de page est ajouté automatiquement — ne pas
    le dupliquer.
  · Ton : québécois, direct, tutoiement, aucune promesse miracle. On écrit
    comme on parlerait à un ami, pas comme un site d'affiliation.
  ═══════════════════════════════════════════════════════════════════════════
-->

Premier paragraphe : poser le problème concret, dans le contexte québécois.
Le lecteur doit se reconnaître en trois lignes.

Deuxième paragraphe : annoncer ce que l'article apporte, sans en faire un
sommaire scolaire.

## Premier H2 : la question principale

Le corps du texte. Les paragraphes courts se lisent mieux sur mobile — et
l'essentiel du trafic du blog viendra du mobile.

- Une liste quand l'information est énumérable
- Chaque point commence par le mot qui porte le sens
- Trois à sept points, pas plus

### Un H3 si la section a besoin d'être découpée

Détail, exemple, nuance.

> Une citation ou un encadré met en valeur une idée forte, un témoignage ou
> une donnée. À utiliser avec parcimonie.

## Deuxième H2

Contenu.

| Colonne | Ce que ça veut dire |
| --- | --- |
| Exemple | Les tableaux restent lisibles sur mobile (défilement horizontal). |

## Et Kiro dans tout ça ?

L'unique passage produit du corps. Il doit répondre à une question que le
lecteur se pose déjà à ce stade de l'article, pas interrompre sa lecture.

## Pour résumer

Trois à cinq lignes qui reprennent l'essentiel. C'est souvent ce que Google
utilise pour les extraits enrichis.
