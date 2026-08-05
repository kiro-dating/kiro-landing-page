# Stratégie SEO du blog Kiro — Phase 1

> Document vivant. Août 2026.
> Base de données des sujets : [`docs/seo/sujets.csv`](./seo/sujets.csv) — 152 sujets.
> Mise en œuvre technique : [`docs/BLOG.md`](./BLOG.md).

---

## Avertissement méthodologique

Cette recherche a été menée **sans accès à Ahrefs, Semrush ou Search Console**.
Les mentions « volume élevé / moyen / faible » et « difficulté » sont des
**estimations qualitatives** fondées sur des signaux observables : nombre et
qualité des résultats retournés, présence d'éditeurs affiliés professionnels
(un affilié qui investit = requête rentable), fraîcheur des contenus concurrents,
présence de médias grand public québécois, ou au contraire absence totale de
résultat pertinent.

**Aucun chiffre de volume n'a été inventé.** Avant d'engager un budget de
production au-delà des 30 premiers articles, faire valider les priorités avec un
outil de volume réel et avec Search Console une fois les premières données
collectées.

Une précision géographique importante : les outils de recherche utilisés
renvoient des résultats majoritairement indexés depuis les États-Unis. La SERP
réellement vue depuis Montréal est plus locale et **moins polluée par les sites
`.fr`**. Plusieurs des quick wins listés plus bas sont donc probablement encore
meilleurs qu'estimé.

---

## 1. Le constat qui structure toute la stratégie

**Aucune application de rencontre ne fait de content marketing en français au
Québec.** Le terrain éditorial est entièrement laissé à trois familles d'acteurs :

| Famille | Acteurs | Force | Faiblesse exploitable |
| --- | --- | --- | --- |
| **Affiliés / comparateurs** | `topsiterencontre.quebec` (leader, ~78 articles), `topsiterencontre.ca`, `reseaurencontre.ca`, `sitederencontrequebec.ca` | Fraîcheur agressive (tout est daté 2026), maillage serré, format « interview d'experte » | Aucune autorité produit. Historique éditorial toxique (articles sur le libertinage, les « femmes russes/slaves », les cam sites). Positionnement structurellement orienté agences matrimoniales est-européennes. |
| **Plateformes à pages programmatiques** | `jecontacte`, `jasez.ca`, `qcrencontre`, `reseaucontact`, `proximeety.ca` | Occupent massivement `rencontre + [ville]` | Pages générées automatiquement, minces, sans conseil éditorial. Concurrence **large mais qualitativement faible**. |
| **Médias québécois** | Silo 57, Narcity, Time Out, Tastet, The Main, Salut Bonjour, La Presse | Autorité de domaine très forte sur le lifestyle et le saisonnier | Ils listent des restos ; ils n'expliquent jamais *comment dater*. Ils ne rankeront jamais sur « comment relancer après un ghosting ». |

### Les six conclusions

1. **Le terrain éditorial est vide.** Kiro peut devenir la voix de référence —
   un avantage qu'un affilié ne peut pas répliquer : il n'a ni produit, ni
   données, ni histoires d'utilisateurs.
2. **Le head commercial (`meilleure application de rencontre Québec`) est cher
   et défendu.** Ne pas l'attaquer au mois 1 : au mois 9-12, une fois
   l'autorité thématique construite par le local et la diaspora.
3. **La diaspora haïtienne et créolophone est un océan bleu.** Les requêtes
   `rencontre haïtienne Montréal` renvoient aujourd'hui la Maison d'Haïti,
   l'Encyclopédie du MEM et le CIDIHCA — des institutions culturelles, pas du
   dating. **Google n'a littéralement rien de pertinent à servir.** Les seuls
   acteurs (Rankontre, HaitianMeet, haitidating, Renmen) sont anglophones,
   centrés États-Unis/Haïti, avec un SEO faible et zéro contenu éditorial.
4. **Le local québécois est faiblement défendu qualitativement.** Du vrai
   contenu local (quartiers réels, lieux réels, ton québécois) déloge une page
   programmatique.
5. **Le saisonnier est verrouillé par les médias** — mais uniquement sur
   l'angle « quoi faire ». L'angle « comment dater » est libre.
6. **L'angle produit de Kiro est un différenciateur éditorial** : anti-swipe,
   jeux brise-glace, traduction créole. Il ouvre un cluster entier
   (conversation, brise-glace, couple bilingue) que personne ne traite ici.

---

## 2. Ce qu'on retient des leaders du marché

Analyse de Tinder (Swipe Life), Bumble (The Buzz), Hinge (Newsroom), Match
(Dating Advice) et eHarmony (Dating Advice).

**Constat préalable : aucun des cinq n'a de blog francophone réel.** Le `/fr/`
de Bumble sert du contenu 100 % anglais avec un `og:locale=fr` — le pire des
deux mondes. L'espace francophone est libre.

### Ce qu'on reprend (et qui est déjà implémenté)

| Pratique | Qui le fait bien | Statut dans notre blog |
| --- | --- | --- |
| Fil d'Ariane visible + `BreadcrumbList` | Match, eHarmony | ✅ automatique |
| Date de publication **et** de mise à jour | Match, eHarmony (Tinder et Bumble n'affichent aucune date) | ✅ automatique |
| Temps de lecture affiché | Match uniquement | ✅ automatique |
| Table des matières ancrée | eHarmony uniquement | ✅ dès 3 sections H2 |
| Bloc FAQ en fin d'article + `FAQPage` | Match (« Key points »), eHarmony (« Q&A ») | ✅ champ `faq` du frontmatter |
| Articles reliés sur plusieurs niveaux | eHarmony (3 niveaux) | ✅ auto : catégorie → tags → récence |
| Catégories nommées par étape du parcours affectif, pas par mot-clé | eHarmony | ✅ voir `taxonomy.json` |
| Taxonomie de tags transversale en parallèle des catégories | eHarmony, Bumble | ✅ |
| Pagination explicite à URLs indexables | Bumble (« Page 1 sur 77 ») | ✅ `/blog/page/N/` |
| Recherche interne | Bumble, Hinge | ✅ côté client, `noindex` |
| Auteur nommé + relecteur expert | eHarmony (photos, titres, bios) | ⚙️ structure prête (`authors.json`), à alimenter |
| URLs plates et stables | Bumble, Hinge | ✅ `/blog/<slug>/` |

### Ce qu'on ne copie pas

1. **La localisation coquille de Bumble** — `og:locale=fr` sur du contenu
   anglais. Notre blog est écrit en **français québécois** (blonde/chum, souper,
   fin de semaine), pas traduit du français de France, encore moins de l'anglais.
2. **L'incohérence d'URL de Hinge** — `/newsroom/2024-GenZ-Report` à côté de
   `/brazil2025` et `/dating-sunday-2025`. Majuscules dans les URLs, séparateurs
   variables. Notre `slugify` interdit structurellement ce cas.
3. **Externaliser les conseils sur un domaine tiers** — Hinge envoie ses
   conseils sécurité sur `help.hinge.co` (Zendesk) et `hinge.nfaq.co`. Toute
   l'autorité SEO part ailleurs. Nos guides restent sur `kirodating.com`.
4. **Le blog fantôme façon Swipe Life** — 16 pages d'articles avec des
   références à 2018 et une coquille jamais corrigée dans un slug
   (`/post/maire-kondo`). **Deux articles par mois maintenus valent mieux qu'un
   stock mort.**
5. **La qualité éditoriale sacrifiée au volume, façon Match** — H1 en minuscules
   (« why do i miss my ex so much? »), anglicismes fautifs (« Second Date:
   advices… »), fautes en production chez eHarmony aussi (« committment »). En
   français, ces négligences coûtent beaucoup plus cher en crédibilité.
6. **Le ton lifestyle sans CTA de Swipe Life** — des articles bien écrits, et
   aucun lien vers l'inscription. Le trafic ne convertit jamais.

### L'idée à voler absolument

**Le rapport de données annuel, nommé et « brandé ».** Hinge publie son
*D.A.T.E. Report*, Tinder son *Year in Swipe*. Ce sont les plus gros
générateurs de backlinks presse du secteur — et **personne ne le fait pour le
marché québécois**. À planifier pour l'année 2 : « Le Portrait des célibataires
du Québec », avec section méthodologie et PDF téléchargeable.

---

## 3. Les 12 clusters thématiques

Structure hub-and-spoke : une page pilier par cluster, reliée à ses satellites,
avec des ponts transversaux aux intersections à forte valeur.

| # | Cluster | Catégorie du blog | Page pilier | Intention | Volume est. | Difficulté est. |
| --- | --- | --- | --- | --- | --- | --- |
| C3 ⭐ | Diaspora haïtienne & créolophone | `diaspora` | Rencontres haïtiennes au Québec : le guide complet 2026 | I + T | Faible/moyen mais **extrêmement qualifié** | **Très faible** |
| C2 | Rencontres locales (Montréal, villes, Ontario fr.) | `montreal-et-regions` | Rencontrer des célibataires à Montréal : le guide par quartier | I + T | Moyen/élevé | Faible/moyenne |
| C5 | Nouveaux arrivants & immigration | `nouveaux-arrivants` | Refaire sa vie amoureuse après avoir immigré au Québec | I | Moyen | **Faible** |
| C6 | Rencontres chrétiennes & foi | `foi-et-valeurs` | Rencontres chrétiennes au Québec : le guide 2026 | I + T | Moyen, intention transactionnelle très haute | Faible/moyenne |
| C9 ⭐ | Conversation, profil, brise-glace | `conversation-et-profil` | Comment démarrer une conversation sur une app de rencontre | I | Moyen/élevé | Faible/moyenne |
| C8 | Premier rendez-vous & idées de dates | `premier-rendez-vous` | 40 idées de premier rendez-vous à Montréal, par quartier et par budget | I | Élevé | Moyenne/élevée |
| C4 | Communautés afro-caribéennes & culturelles | `diaspora` | Rencontres afro-caribéennes au Québec : le guide 2026 | I + T | Moyen (agrégé) | Faible |
| C7 | Rencontre sérieuse & relation durable | `relation-serieuse` | Rencontre sérieuse au Québec : comment trouver une vraie relation | I + C | Élevé | Moyenne/élevée |
| C10 | Sécurité, arnaques, vie privée | `securite` | Se protéger sur les apps de rencontre au Québec | I | Moyen | Faible/moyenne |
| C11 | Saisonnier & culture dating québécoise | `montreal-et-regions` | Le calendrier du célibataire au Québec | I | Élevé mais très concentré (janv., févr., déc.) | Moyenne |
| C1 | Comparatifs & « meilleure app » | `comparatifs` | Meilleure application de rencontre au Québec 2026 : le guide honnête | C + T | Élevé | **Élevée** |
| C12 | Canada anglophone & bilingue | `comparatifs` / EN | Dating in Montreal as a Newcomer: The 2026 Guide | C + I | Élevé mais SERP mondiale saturée | Élevée sur le générique, faible sur les croisements |

⭐ = clusters signature de Kiro.

### Trois notes qui comptent plus que les autres

**Sur C1** — Kiro est juge et partie sur les comparatifs. Assumer frontalement :
« on est une app de rencontre, voici pourquoi on parle quand même des autres ».
La transparence radicale est le seul moyen de battre un affilié sur ce terrain,
et c'est un excellent signal E-E-A-T.

**Sur C3** — ce cluster doit être **écrit par ou avec des membres de la
communauté**. Un contenu perçu comme extérieur ou exotisant détruirait la
crédibilité de Kiro sur son cœur de cible. Le contre-modèle est sous nos yeux :
le principal concurrent a bâti son blog sur des articles type « rencontrer une
femme russe ». La légitimité culturelle sera l'actif défendable de Kiro, bien
plus que n'importe quel mot-clé.

**Sur C12** — ne pas attaquer l'anglais générique (`best dating apps Canada`).
Se limiter aux croisements où Kiro a une légitimité unique : diaspora,
bilinguisme, Montréal, nouveaux arrivants. **15 % de l'effort éditorial maximum.**

---

## 4. Les 15 quick wins

Classés par rapport opportunité/effort. Chacun repose sur une observation
directe de SERP.

| # | Sujet | Ce qui a été observé |
| --- | --- | --- |
| 1 | **Rencontres haïtiennes au Québec (pilier)** | La requête renvoie des institutions culturelles, pas du dating. Vide sémantique total. |
| 2 | **Rencontre haïtienne à Montréal-Nord / Saint-Michel / RDP** | Aucun résultat de dating géolocalisé sur ces quartiers, qui concentrent pourtant la communauté. |
| 3 | **Dater / flirter en créole** | `rencontre créole` ne renvoie que `jecontacte` et des apps sans rapport. Différenciateur produit direct. |
| 4 | **Comparatif Rankontre / HaitianMeet en français** | Ces apps n'ont aucune couverture éditoriale francophone. Requêtes de marque non défendues. |
| 5 | **Vie amoureuse des nouveaux arrivants** | `immigrantquebec.com`, `immigrer.com`, `pvtistes.net` dominent l'intégration — et **s'arrêtent à l'amitié**. Pont non construit. |
| 6 | **Foi + diaspora haïtienne (église et fréquentations)** | Croisement C3×C6 : strictement aucun résultat. Double niche, très forte intention. |
| 7 | **Rencontres chrétiennes au Québec (éditorial)** | Niche tenue par des plateformes, **aucun blog**. Public à forte intention matrimoniale. |
| 8 | **Rencontres antillaises / afro à Montréal** | `blacksandwhites.ca`, `afrosmeet`, `97tibo` : sites vieillissants, zéro contenu de fond. |
| 9 | **Villes secondaires** (Sherbrooke, Trois-Rivières, Gatineau, Laval, Longueuil) | Occupées par des pages programmatiques. Volume faible par ville, **cumul important**. |
| 10 | **Premier message / brise-glace en français québécois** | SERP occupée par des sites **français** (dragueurdeparis, loveshortcut, moncoachingseduction). Aucun québécois. |
| 11 | **Couple bilingue / aimer dans deux langues** | Uniquement des sources françaises généralistes. Rien de canadien. Alignement produit parfait. |
| 12 | **« Qui paie au premier rendez-vous au Québec ? »** | Traité uniquement par des sources françaises, où les normes diffèrent. Excellent candidat *featured snippet*. |
| 13 | **Fatigue des apps / dating burnout** | Quasi rien en français canadien. Sujet en croissance, aligné avec le positionnement anti-swipe. |
| 14 | **« Pis, t'as-tu quelqu'un ? » — les fêtes en famille** | Un seul blog personnel et un article Noovo daté de la pandémie. Fort potentiel de partage. |
| 15 | **Arnaques sentimentales ciblant les nouveaux arrivants** | Les médias couvrent la fraude en général ; personne ne traite la vulnérabilité spécifique des immigrants. **Aimant à backlinks presse.** |

**Séquencement suggéré** : quick wins 1→4 (bloc diaspora, 4-6 semaines), puis
5-7 (immigration + foi), puis 9-10 (local + conversation). C1 et C12 génériques
attendent le mois 9.

---

## 5. Base de données des sujets

[`docs/seo/sujets.csv`](./seo/sujets.csv) — **152 sujets**, une ligne par article :

| Colonne | Contenu |
| --- | --- |
| `id` | Identifiant stable |
| `cluster`, `cluster_nom` | C1…C12 |
| `categorie_blog` | Clé de `content/blog/taxonomy.json` — à recopier dans le frontmatter |
| `pilier` | `oui` = page pilier du cluster (2 000-3 500 mots) |
| `titre_h1` | H1 proposé |
| `mot_cle_principal` | Requête cible |
| `intention` | informationnelle / commerciale / transactionnelle / navigationnelle |
| `priorite` | 1 = quick win (0-4 mois) · 2 = moyen terme (4-9 mois) · 3 = long terme (9 mois +) |
| `langue` | `fr`, `en`, `fr+ht` |
| `statut` | `a-rediger` → `en-cours` → `publie` — **à tenir à jour** |
| `slug`, `date_publication`, `notes` | À remplir au fil des publications |

Répartition : **87 sujets en priorité 1**, 61 en priorité 2, 4 en priorité 3.
139 FR · 12 EN · 1 FR/créole. 12 pages piliers.

> **Ne pas publier les 152 articles.** Publier les priorités 1 sur 6 à 8 mois,
> mesurer, puis laisser les données arbitrer la suite. Un cluster de 15 articles
> excellents bat un cluster de 40 articles moyens — surtout face à un concurrent
> dont la faiblesse principale est précisément un blog gonflé de contenu obsolète.

---

## 6. Les 25 questions à traiter en FAQ

À placer dans le champ `faq` des pages piliers correspondantes (génère
automatiquement le balisage `FAQPage`).

| # | Question | Page cible |
| --- | --- | --- |
| 1 | Quelle est la meilleure application de rencontre au Québec ? | Pilier C1 |
| 2 | Quelle application de rencontre est vraiment gratuite au Canada ? | Pilier C1 |
| 3 | Existe-t-il une application de rencontre québécoise (pas américaine) ? | Pilier C1 |
| 4 | Existe-t-il une application de rencontre pour la communauté haïtienne au Canada ? | Pilier C3 |
| 5 | Comment rencontrer des célibataires haïtiens à Montréal ? | Pilier C3 |
| 6 | Comment rencontrer des gens à Montréal sans utiliser Tinder ? | Pilier C2 |
| 7 | Où sortir à Montréal quand on est célibataire ? | Pilier C2 |
| 8 | Comment se faire des amis quand on vient d'arriver au Québec ? | Pilier C5 |
| 9 | Comment fonctionne la séduction au Québec ? | Pilier C5 |
| 10 | Que veulent dire « chum », « blonde » et « tomber en amour » ? | Lexique québécois |
| 11 | Qui paie au premier rendez-vous au Québec ? | Article dédié |
| 12 | Que faire pour un premier rendez-vous à Montréal sans dépenser cher ? | Pilier C8 |
| 13 | Quoi écrire dans un premier message sur une app de rencontre ? | Pilier C9 |
| 14 | Que faire quand quelqu'un arrête de répondre (ghosting) ? | Article dédié |
| 15 | Comment savoir si quelqu'un cherche une relation sérieuse ? | Pilier C7 |
| 16 | Combien de temps attendre avant de se voir en vrai ? | Cluster C9 |
| 17 | Comment reconnaître une arnaque sentimentale ? | Pilier C10 |
| 18 | Comment savoir si un profil est faux ? | Cluster C10 |
| 19 | Est-ce que les applications de rencontre sont sécuritaires ? | Pilier C10 |
| 20 | Comment trouver un ou une partenaire chrétien·ne au Québec ? | Pilier C6 |
| 21 | Peut-on utiliser une app de rencontre quand on est croyant ? | Cluster C6 |
| 22 | Comment dater quand on ne parle pas encore bien français ? | C5 × C9 |
| 23 | Est-ce qu'une relation peut marcher si on ne parle pas la même langue ? | C9 |
| 24 | Quel est le meilleur moment de l'année pour s'inscrire sur une app ? | C11 |
| 25 | Comment présenter son partenaire à une famille traditionnelle ? | C3 × C4 |

---

## 7. Maillage interne — les règles

1. **Tout satellite pointe vers son pilier** dès le premier tiers du texte, en
   ancre descriptive exacte (`rencontres haïtiennes au Québec`), jamais
   « cliquez ici ».
2. **Tout pilier liste ses satellites** dans un bloc structuré en milieu de
   page — pas seulement en pied.
3. **3 à 5 liens internes minimum par article**, dont au moins un vers un autre
   cluster (le pont transversal).
4. **Maximum 1 lien produit dans le corps**, placé après une valeur réellement
   délivrée. Le bloc CTA de bas de page est ajouté automatiquement par le
   générateur — ne pas le dupliquer. Le sur-CTA détruit la crédibilité
   éditoriale et les signaux d'engagement.
5. **Ancres variées** : ne jamais répéter la même ancre exacte plus de deux fois
   vers une même URL sur l'ensemble du site.

### Les 10 ponts transversaux prioritaires

Ce sont eux qui créent l'autorité thématique composite qu'aucun affilié ne peut
copier.

| Pont | Ancre type | Pourquoi |
| --- | --- | --- |
| C3 ↔ C6 | « la place de l'église dans les fréquentations » | Intersection la plus sous-exploitée du marché. |
| C3 ↔ C2 | « les quartiers de la communauté haïtienne à Montréal » | Ancre la niche communautaire dans le SEO local. |
| C3 ↔ C9 | « dater en créole » | Relie la niche au différenciateur produit. Chemin de conversion le plus court. |
| C5 ↔ C2 | « où rencontrer du monde dans ta ville » | Transforme une intention informationnelle en intention locale. |
| C5 ↔ C10 | « les arnaques qui ciblent les nouveaux arrivants » | Forte utilité sociale, protège la réputation de marque. |
| C5 ↔ C9 | « draguer dans une langue qui n'est pas la tienne » | Alignement produit direct. |
| C4 ↔ C3 | « rencontres afro-caribéennes » | Parent/enfant : C4 est l'ombrelle, C3 le spécifique. Lien bidirectionnel. |
| C8 ↔ C2 | « les meilleurs endroits par quartier » | Même intention géo, renforcement mutuel. |
| C11 ↔ C8 | « nos idées de dates d'hiver » | **Essentiel** : sans ce pont, le trafic saisonnier de pic est perdu. |
| C7 ↔ C1 | « quelle app pour du sérieux » | Chemin informationnel → commercial. Principal tunnel de conversion SEO. |

### Trois pages-ressources « aimants à liens » (hors des 152 articles)

Elles ne convertissent pas directement mais captent les backlinks (médias,
organismes, institutions) qui feront ranker tout le reste :

1. Annuaire des organismes communautaires haïtiens du Grand Montréal.
2. Calendrier annuel des événements pour célibataires au Québec.
3. Page-ressource sur la fraude amoureuse, avec les recours officiels québécois.

---

## 8. Ligne éditoriale

- **Français québécois**, pas français de France. Chum, blonde, fin de semaine,
  souper, tomber en amour, dépanneur. Tutoiement.
- **Direct, sans recette miracle.** Aucune promesse de résultat. On écrit comme
  on parlerait à un ami.
- **Longueur** : 900-1 300 mots pour un conseil ciblé, 2 000-3 500 mots pour une
  page pilier visant un mot-clé disputé.
- **Un H1 unique** (champ `title`), 5 à 9 `H2`, `H3` au besoin.
- **Sources externes solides uniquement** : Statistique Canada, Institut de la
  statistique du Québec, médias québécois, organismes communautaires.
- **Relecture obligatoire.** Une faute en français québécois coûte plus cher en
  crédibilité qu'un mot-clé manquant.
- **E-E-A-T** : sur la sécurité, les arnaques et la santé relationnelle, citer
  des spécialistes nommés et renseigner un auteur avec `jobTitle` et `bio`.

## 9. Rythme et suivi

**Deux articles par semaine.** Le générateur gère la publication programmée
(date `publishedAt` dans le futur) : on peut écrire quatre articles d'avance et
les laisser sortir tout seuls.

Rituel mensuel suggéré :

1. Mettre à jour `statut`, `slug` et `date_publication` dans `sujets.csv`.
2. Relever dans Search Console les requêtes où le blog apparaît en position
   5-20 — ce sont les articles à enrichir en priorité (meilleur rendement que
   d'en écrire un nouveau).
3. Rafraîchir les articles saisonniers **sur la même URL**, jamais en créer une
   nouvelle. Mettre à jour `updatedAt`.
4. Ajouter les nouveaux sujets découverts (PAA, recherches internes du blog,
   questions récurrentes du support) à la base de sujets.

## 10. Premier pilier publié — et ses articles de soutien

**Publié le 4 août 2026** : `/blog/decrocher-premier-rendez-vous-application-rencontre/`
(cluster C9), avec sa version anglaise adaptée
`/en/blog/turn-a-match-into-a-first-date/` (cluster C12).

Mot-clé principal : *comment décrocher un premier rendez-vous sur une
application de rencontre*. Angle retenu : un **diagnostic en six étapes** du
parcours match → date, plutôt qu'un guide de plus sur une seule tranche.

### Pourquoi cet angle

L'analyse SERP a montré que le marché francophone est découpé en tranches, et
que chaque acteur vend la sienne : un photographe optimise les photos, un coach
vend des premiers messages, un SaaS vend des relances, Meetic traite le timing.
**Personne n'assemble la chaîne** — et c'est structurellement difficile pour
eux, parce que leur modèle d'affaires repose sur une seule étape. Résultat : le
lecteur ne sait jamais *où* ça casse chez lui.

Deux zones sont apparues complètement vierges et sont occupées par l'article :

1. **La logistique après le « oui »** — verrouiller un créneau, gérer les 48 h
   avant le rendez-vous, répondre à un report. Aucun contenu francophone.
2. **Le contexte physique québécois** — l'hiver de cinq mois, les distances
   Laval/Rive-Sud, le 5 à 7 comme format de premier date. Structurellement
   inaccessible aux sites `.fr` qui dominent la SERP.

### Les 9 articles de soutien à produire (dans cet ordre)

Chacun traite une étape du parcours et pointe vers le pilier avec une ancre
descriptive. Le pilier les listera en retour au fur et à mesure.

| # | Article de soutien | Étape | Mot-clé principal | Priorité |
| --- | --- | --- | --- | --- |
| 1 | 25 premiers messages qui obtiennent vraiment une réponse | 3 | premier message application de rencontre | 1 |
| 2 | Pourquoi tu n'as pas de match : les 10 causes réelles | 1-2 | pourquoi je n'ai pas de match | 1 |
| 3 | Ton profil vu par quelqu'un d'autre : l'audit en 12 points | 1 | améliorer son profil de rencontre | 1 |
| 4 | Après combien de messages proposer de se voir ? | 5 | quand proposer un rendez-vous | 1 |
| 5 | Pourquoi les conversations meurent après trois messages | 4 | conversation qui s'arrête rencontre | 1 |
| 6 | Se faire ghoster : ce que ça dit (et ne dit pas) de toi | 4 | pourquoi je me fais ghoster | 1 |
| 7 | 20 idées de premier date à Montréal, été comme hiver | 6 | idées premier rendez-vous Montréal | 1 |
| 8 | La checklist sécurité du premier rendez-vous | 6 | sécurité premier rendez-vous | 1 |
| 9 | Compatibilité et personnalité : ce qu'une app peut vraiment mesurer | — | Big Five compatibilité | 2 |

Deux sujets connexes à traiter séparément, avec un ton différent :
« Les apps ne sont pas conçues pour que tu trouves » (positionnement de marque,
générateur de backlinks) et « Comment fonctionne le modèle Big Five »
(explicatif, renforce l'E-E-A-T du produit).

### Le concurrent à surveiller

Ce n'est pas Tinder. C'est **`qupidr.com`**, une autre application québécoise
qui construit déjà un cluster SEO en français canadien (premier date au Québec,
shadowban, rencontres en région) — mais qui n'a pas encore d'article sur le
passage du match au rendez-vous. Fenêtre ouverte, course de vitesse.

## 11. Prochaines étapes

- [ ] Produire les articles de soutien 1 à 4 ci-dessus (4 premières semaines).
- [ ] Rédiger le pilier C3 (`rencontre haïtienne Québec`) : concurrence nulle,
      alignement produit maximal.
- [ ] Créer `public/images/og-kiro.jpg` (1200×630) et le dossier
      `public/images/blog/` pour les couvertures.
- [ ] Soumettre `sitemap.xml` à Google Search Console et à Bing Webmaster Tools.
- [ ] Valider les 30 premiers sujets avec un vrai outil de volume.
- [ ] Identifier des contributeurs issus de la communauté haïtienne pour le
      cluster C3.
- [ ] Planifier « Le Portrait des célibataires du Québec » (rapport annuel,
      générateur de backlinks presse) pour l'année 2.
