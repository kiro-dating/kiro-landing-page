# Brief — Article 2 : rencontres dans la diaspora caribéenne au Canada

> **Statut : préparation locale. Rien n'est publié, indexé ni déployé.**
> Brouillon : `content/blog/fr/_brouillon-diaspora-caribeenne-canada.md` (`draft: true`)
> Mots-clés : [`docs/seo/mots-cles-article-2.csv`](../seo/mots-cles-article-2.csv)
> Références futures : [`docs/seo/registre-contenus.csv`](../seo/registre-contenus.csv)
> Rédigé le 5 août 2026. **Révision 3 du 7 août 2026** : D-1 à D-11 validées,
> bannière refondue en cinq États souverains (Barbade à la place de la
> Martinique), tests passés au runner du projet. En attente de validation finale
> avant publication.

## Révisions — ce qui a changé

| Point | Version 1 | Version actuelle |
| --- | --- | --- |
| Couverture | Cinq drapeaux « des cinq plus grandes communautés » | **Cinq États souverains caribéens** — Haïti, Jamaïque, Rép. dominicaine, Trinité-et-Tobago, Barbade. Sélection éditoriale, jamais un classement |
| Martinique | Absente | **Retirée de la bannière** (révision 3). Reste mentionnée dans le texte, avec nuance |
| Auteur | « L'équipe Kiro » | **Pierre Handy Charles**, fiche complète — voir §14 |
| Île Maurice | Non traitée | **Section dédiée, explicitement non caribéenne** — voir §15 |
| Cluster | Liste plate d'articles | **Hiérarchie de resserrement 2 → 3 → 4 → 5 + branches** — voir §10 |
| Article | Plan seulement | **Rédigé, 2 651 mots** |

**Formulation à bannir dans tout le dossier** : « les cinq drapeaux des
communautés ». On écrit désormais « cinq références caribéennes », et la
sélection est présentée comme **éditoriale**, jamais comme démographique.

---

## 1. Le constat qui change le plan initial

La recherche SEO a fait remonter trois faits qui obligent à ajuster le sujet
provisoire (« Comment rencontrer des célibataires dans la diaspora caribéenne
au Canada »). Ils sont donnés ici en premier parce qu'ils commandent tout le
reste.

### En français, le mot « rencontre » sabote la moitié des requêtes

« Rencontre » signifie **à la fois** *dating* **et** *réunion communautaire*.
Ce n'est pas une subtilité théorique : `rencontre haïtienne Montréal` ne
ramène **aucun** site de rencontre. Le haut de la page est occupé par la
Maison d'Haïti, le Bureau de la communauté haïtienne de Montréal,
l'Encyclopédie du MEM de la Ville de Montréal et les Journées internationales
de la diaspora haïtienne. Même chose pour `rencontre haïtienne Canada`, qui
ramène en plus la page Wikipédia de *Rencontre*, un lieu-dit de Terre-Neuve.

**Conséquence :** cibler cette requête, c'est se battre contre la Ville de
Montréal sur une intention qui n'est pas la nôtre. À écarter.

### « Antillais », « caribéen » et « haïtien » ne sont pas interchangeables

| Terme | Ce que la recherche ramène réellement | Ce qu'on en fait |
| --- | --- | --- |
| **antillais** | Le **seul** terme français avec une intention *dating* prouvée — mais les acteurs positionnés (97tibo, meetissimo, noirsdesirs) visent tous la France et les Antilles françaises. Le mot « Québec » ajouté à la requête est **ignoré** par Google, faute de page crédible. | **La plus grosse opportunité du dossier.** À placer dans le titre. |
| **caribéen** | Vide concurrentiel total côté rencontre, mais le mot vit surtout dans le registre culturel, gastronomique et touristique (Tourisme Montréal, associations étudiantes). Intention culturelle plus que relationnelle. | À occuper par défaut, sans parier dessus seul. |
| **haïtien** | La masse démographique — mais une page de résultats entièrement détournée vers l'institutionnel. | **À réserver** pour les articles 3 et 4, avec des formulations qui contournent le piège (« célibataires haïtiens », « où rencontrer des Haïtiens à… »). |
| **créole** | Part vers La Réunion, les Seychelles, la France. Trop dispersé. | Mot de texture dans le corps, jamais une cible. |
| **West Indian** (EN) | ⚠️ Bascule vers le *dating* sud-asiatique au Canada (Shaadi, gofordesi). | **À ne jamais cibler.** |

Point de ton, aussi important que le point SEO : dans l'usage québécois,
« antillais » évoque souvent les Antilles françaises, et **beaucoup de
Québécois d'origine haïtienne ne se reconnaissent pas dans ce mot**. Les
traiter comme synonymes serait perçu immédiatement. L'article doit assumer la
distinction — ce qui est aussi un actif de crédibilité, et répond au passage
à une question réellement posée (« Antillais et Haïtien, c'est pareil ? »).

### Le créneau francophone canadien est structurellement vacant

Rankontre est le seul concurrent réellement structuré (site + iOS + Android,
blog, présence depuis ~2014) — et **son angle mort est béant : aucune mention
du Canada, de Montréal ou du Québec, et aucun contenu en français**. Or la
plus grande communauté haïtienne francophone hors d'Haïti est à Montréal.
CaribbeanCupid couvre le créneau anglophone avec des pages géographiques
industrialisées, sans un mot de français. Aucun acteur canadien ou québécois
crédible n'existe sur ce sujet.

**Asymétrie fondamentale : la communauté est francophone, l'offre est
anglophone.**

---

## 2. Sujet et titre recommandés

### Recommandation — version 2, validée

> **H1 éditorial :** Rencontres caribéennes et antillaises au Canada : trouver
> quelqu'un qui comprend d'où tu viens *(94 caractères — un H1 n'a pas de
> limite d'affichage)*
>
> **Titre SERP (`seoTitle`) :** Rencontres caribéennes au Canada : trouver des
> célibataires *(59 caractères — repli validé, D-9)*
>
> **Slug :** `rencontres-caribeennes-antillaises-canada`

`seoTitle` remplace intégralement le `<title>` — la marque n'est pas ajoutée
derrière (`templates.mjs` : `post.seoTitle || \`${post.title} | ${BRAND}\``).
Les 59 caractères sont donc les 59 caractères affichés.

**Trois vérifications demandées, faites :**

| Vérification | Résultat |
| --- | --- |
| **Longueur du title** | **Repli retenu (D-9 validée) : « Rencontres caribéennes au Canada : trouver des célibataires », 59 caractères.** Tient dans l'affichage habituel de Google sans troncature. |
| **Résultats Google présents** | Aucun acteur canadien crédible sur `rencontre caribéenne Canada` ni `rencontre antillaise Canada`. Les positionnés (97tibo, meetissimo, noirsdesirs) visent la France et les Antilles françaises. Créneau réellement libre. |
| **Caribéen vs antillais** | Deux mots, deux intentions. « Antillais » est le seul terme français à intention *dating* prouvée, mais il évoque les Antilles françaises dans l'usage québécois. « Caribéen » est plus large et plus neutre, mais vit surtout dans un registre culturel. D'où la combinaison : « caribéennes » dans le titre SERP, « caribéennes et antillaises » dans le H1, et une section entière consacrée à la distinction. |
| **Pertinence de « célibataires »** | Confirmée. `rencontrer des célibataires caribéens au Canada` est un motif de requête réel et le mot lève l'ambiguïté fatale de « rencontre » (*dating* vs réunion communautaire). C'est précisément ce que le titre doit faire. |
| **Cannibalisation** | Aucun mot-clé réservé n'apparaît dans le titre, le slug, la description ou les H2. « Haïti » n'est présent que dans le corps et les données. « Montréal », « Toronto » et « chrétien » n'apparaissent pas comme cibles. Contrôle détaillé en §10. |

**Description** (`description`) : ramenée de 187 à 156 caractères pour tenir dans
l'affichage habituel.

### Les autres candidats évalués

| Titre | Aligné sur ce qu'on **tape** | Aligné sur ce qu'on **ressent** | Verdict |
| --- | --- | --- | --- |
| Rencontres dans la diaspora caribéenne au Canada | Faible — « diaspora » est un mot de journaliste, pas de célibataire | Moyen | Trop institutionnel, sonne comme un rapport |
| Comment rencontrer des célibataires caribéens au Canada | Bon — calque une requête réelle | Faible — froid, interchangeable | Correct mais sans identité |
| Rencontrer quelqu'un qui comprend d'où tu viens | Faible en SEO seul | **Excellent** | Fort en clic, nul en recherche |
| **Rencontres caribéennes et antillaises au Canada : trouver quelqu'un qui comprend d'où tu viens** | **Bon** | **Bon** | **Recommandé** |
| Rencontres antillaises et haïtiennes au Québec | **Excellent en SEO pur** | Moyen | ⚠️ **Casse l'entonnoir** — voir décision D-1 |

### Décision D-1 — VALIDÉE : portée pancanadienne

La recherche pure recommanderait « Rencontres antillaises et **haïtiennes** au
**Québec** ». C'est le meilleur titre du point de vue SEO isolé.

**Mais il entre en collision avec la stratégie d'entonnoir prévue :** « haïtien
+ Québec » est exactement le sujet de l'article 3, et « célibataires haïtiens
Montréal » celui de l'article 4. Utiliser ces termes maintenant, dans un
article censé rester large, condamnerait les deux suivants à la
cannibalisation.

Ma recommandation est de **tenir l'entonnoir** : garder cet article
pan-canadien et pan-caribéen, y placer « antillaises » (le terme à intention
*dating*, non défendu au Canada), et réserver « haïtien » aux articles
suivants — où il sera traité en profondeur plutôt qu'en mot-clé.

Haïti reste évidemment très présent **dans le corps** de l'article, dans les
chiffres et dans l'illustration. Ce qui est réservé, c'est la **cible SEO**.

**Validé le 6 août 2026.** L'article reste l'entrée générale du cluster.

---

## 3. Mot-clé principal et secondaires

**Principal :** `rencontre caribéenne Canada` / `rencontre antillaise Canada`
(carrefour, traité comme une cible unique).

**Secondaires, dans le corps :**
`rencontre antillaise Québec` · `rencontrer des célibataires caribéens au Canada` ·
`application de rencontre caribéenne` · `rencontre diaspora caribéenne` ·
`rencontrer quelqu'un qui partage ma culture` · `trouver l'amour dans la diaspora` ·
`rencontre afro-caribéenne`

**Réservés pour plus tard** (voir le registre) : tout ce qui combine
« haïtien » avec Montréal ou Québec, « application de rencontre haïtienne »,
« rencontre chrétienne haïtienne », les requêtes Toronto et les requêtes
anglaises.

**Interdits :** `rencontres interculturelles Canada` (requête détenue par la
Semaine québécoise des rencontres interculturelles du gouvernement du Québec —
imbattable et sans valeur pour Kiro) et `West Indian dating Canada`.

---

## 4. Public et promesse

**Public.** Personnes d'origine caribéenne au Canada — arrivées récemment,
arrivées enfant, ou nées ici de parents caribéens ; francophones, anglophones
ou bilingues ; à Montréal, Laval, Ottawa, Toronto ou ailleurs ; en recherche
d'une relation sérieuse ou simplement d'un cercle plus large ; ouvertes aux
relations interculturelles mais sensibles aux références partagées.

**Promesse.** Expliquer honnêtement pourquoi il est difficile de rencontrer
quelqu'un qui partage certaines de ses références au Canada, quels moyens
existent réellement, où ils s'arrêtent — et comment s'y prendre sans réduire
personne à son origine. **Aucune promesse de rencontrer une personne d'une
origine donnée.**

---

## 5. Plan détaillé

Le plan complet vit dans le corps du brouillon
(`content/blog/fr/_brouillon-diaspora-caribeenne-canada.md`), section par
section, avec les notes de traitement. Structure retenue :

1. **Introduction** — la scène, le fil du premier article, le désir nommé sans défensive, la limite annoncée.
2. **H2 — Antillais, caribéen, haïtien : trois mots, trois réalités** *(placé en premier : c'est la confusion la plus fréquente, et la traiter d'emblée établit la crédibilité)*
3. **H2 — Pourquoi vouloir quelqu'un qui comprend certaines références** *(avec contrepoint obligatoire sur les couples interculturels)*
4. **H2 — La diaspora caribéenne au Canada n'est pas une communauté** *(chiffres StatCan + écart Canada/Québec)*
5. **H2 — Où se font ces rencontres aujourd'hui** *(catégories, aucun lieu inventé)*
6. **H2 — Pourquoi ça ne suffit pas toujours**
7. **H2 — Utiliser une application sans réduire quelqu'un à son origine**
8. **H2 — Montréal, Toronto, Ottawa : ce qui change d'une ville à l'autre** *(sans liens sortants)*
9. **H2 — Comment Kiro aborde le contexte plutôt que l'origine**
10. **H2 — Une première rencontre qui se passe bien**
11. **H2 — Ce qu'il faut retenir**
12. **Pour finir**

**Longueur visée : 2 500 à 3 200 mots.** Volontairement plus court que
l'article 1 : c'est un article de transition, pas un second pilier, et il ne
doit pas concurrencer le premier.

### Les six questions retenues pour la FAQ

Sélectionnées parmi vingt questions réellement observées :

1. Antillais et Haïtien, est-ce que c'est la même chose ?
2. Pourquoi les applications ne me proposent que des gens qui ne me ressemblent pas ?
3. Existe-t-il une application de rencontre caribéenne ou haïtienne au Canada ?
4. Je suis né ici mais mes parents sont caribéens — dois-je sortir avec quelqu'un de la communauté ?
5. Comment gérer la pression familiale sur le choix d'un partenaire ?
6. Comment s'intéresser à la culture de quelqu'un sans être maladroit ?

---

## 6. Données démographiques vérifiées

Toutes les données viennent du **Recensement de 2021 de Statistique Canada**,
variable « **origine ethnique ou culturelle** », total des réponses (uniques
et multiples), données-échantillon de 25 %.

### Canada

| Rang | Origine | Effectif |
| --- | --- | --- |
| 1 | Jamaïcaine | 249 070 |
| 2 | Haïtienne | 178 995 |
| 3 | Trinidadienne / Tobagonienne | 77 405 |
| 4 | Barbadienne | 31 440 |
| 5 | Cubaine | 30 065 |
| 6 | Dominicaine (Rép. dominicaine) | 22 125 |
| — | **Total origines caribéennes** | **774 510** |

Par région métropolitaine : Toronto 314 795 · Montréal 200 120 ·
Ottawa-Gatineau 36 150 · Vancouver 16 790 · Edmonton 16 030 · Calgary 15 755.

Ce classement est une **affirmation de Statistique Canada elle-même**, pas une
déduction : l'article officiel du 23 juillet 2025 parle des « six plus grandes
communautés caribéennes au Canada aujourd'hui » et les développe dans cet
ordre. *(Vérifié directement à la source.)*

### Québec et Montréal — un classement complètement différent

| Rang | Origine | Québec | RMR de Montréal |
| --- | --- | --- | --- |
| 1 | Haïtienne | 156 070 | 142 535 |
| 2 | Jamaïcaine | 11 395 | 10 100 |
| 3 | Dominicaine (Rép. dom.) | 10 880 | non publié |
| 4 | Cubaine | 10 280 | non publié |
| 5 | Trinidadienne / Tobagonienne | 5 665 | 5 130 |

87,2 % des personnes déclarant une origine haïtienne au Canada vivent au
Québec. À l'inverse, seulement 4,6 % des personnes d'origine jamaïcaine.
**Les deux classements ne sont pas interchangeables et ne doivent jamais être
présentés comme un seul.**

### Lieu de naissance — une variable différente

Haïti est le **2ᵉ pays de naissance** des personnes immigrantes au Québec, tous
pays confondus (86 105 personnes), derrière la France et devant l'Algérie.
Aucun autre pays caribéen n'entre dans le top 10 québécois.
*(Ministère de l'Immigration, de la Francisation et de l'Intégration, d'après
le tableau personnalisé CO-2439 de Statistique Canada.)*

### Le cas du Guyana

Statistique Canada classe « Guyanais » (code 412) parmi les **origines
sud-américaines**, pas caribéennes — alors que le Guyana est membre fondateur
de la CARICOM et culturellement rattaché à la Caraïbe anglophone. 97 210
personnes ont déclaré une origine guyanaise, ce qui les placerait au 3ᵉ rang si
on les comptait. **L'article doit mentionner les deux lectures** plutôt que de
trancher silencieusement.

### Formulations interdites

| À ne pas écrire | Pourquoi |
| --- | --- |
| « Les X plus grandes communautés caribéennes » sans préciser Canada ou Québec | Les deux classements sont incompatibles : la Jamaïque est 1ʳᵉ au Canada et 2ᵉ au Québec avec 22 fois moins d'effectifs qu'Haïti. |
| « X Canadiens d'origine haïtienne » | 35,5 % des répondants ont déclaré plus d'une origine ; jusqu'à six réponses par personne. Ce sont des **réponses**, pas des personnes. |
| « X immigrants haïtiens » à partir du chiffre 178 995 | C'est une origine déclarée, incluant les personnes nées ici. Le chiffre des personnes nées en Haïti est différent (86 105 au Québec). |
| « La communauté caribéenne a augmenté depuis 2016 » | Interdit par la source : les données de 2021 sur l'origine ne sont pas comparables aux recensements précédents. |
| « La population noire du Canada, c'est-à-dire la diaspora caribéenne » | Seulement 21,0 % de la population noire du Canada est née dans les Caraïbes ; et les populations indo-caribéennes et hispano-caribéennes ne sont pas recensées comme noires. |
| « Le Guyana, pays caribéen selon Statistique Canada » | Faux — StatCan le classe en Amérique du Sud. On peut l'inclure culturellement, pas en l'attribuant à StatCan. |

### Sources

- Statistique Canada, [« Toronto Caribbean Carnival: Let the music play, backed up by data »](https://www.statcan.gc.ca/o1/en/plus/8342-toronto-caribbean-carnival-let-music-play-backed-data), 23 juillet 2025 *(vérifié directement)*
- Profils d'intérêt spécial, origine ethnique ou culturelle — [Canada](https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/sip/details/page.cfm?PoiId=2&Lang=E&Dguid=2021A000011124&TId=12) · [Québec](https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/sip/details/page.cfm?PoiId=2&Lang=E&Dguid=2021A000224&TId=12) · [RMR de Montréal](https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/sip/details/page.cfm?PoiId=2&Lang=E&Dguid=2021S0503462&TId=12)
- [Liste des origines ethniques ou culturelles de 2021](https://www23.statcan.gc.ca/imdb/p3VD.pl?Function=getVDStruct&TVD=1310929&CVD=1310930&CPV=3&CST=01042021&CLV=1&MLV=6) — structure « 3 – Origines caribéennes »
- Statistique Canada, [*La diversité des populations noires au Canada, 2021*](https://www150.statcan.gc.ca/n1/pub/89-657-x/89-657-x2024005-fra.htm), nº 89-657-X
- MIFI, [*Population immigrée au Québec et au Canada, recensement de 2021*](https://cdn-contenu.quebec.ca/cdn-contenu/immigration/publications/fr/recherches-statistiques/PUB_Pop_immigree_Quebec_regions_2021.pdf)

### Non vérifié — à consulter manuellement si besoin

Les effectifs des origines caribéennes plus petites (Grenade, Sainte-Lucie,
Saint-Vincent, Bahamas, Guadeloupe, Martinique…) ne sont pas publiés dans les
pages accessibles. Ils sont **nécessairement inférieurs à 22 125** (borne
supérieure officielle). Pour les chiffres exacts : tableau **98-10-0355-01**
de Statistique Canada.

---

## 7. Bannière — version 3 (refonte complète)

> **Statut : produite localement, non publiée.**
> Script : `scripts/covers/banniere-diaspora-caribeenne.mjs`
> Sorties : `public/images/blog/rencontres-caribeennes-canada-diaspora-illustration.{svg,webp}`
> et `…-2400.webp` (2400 × 1260, pour la réutilisation et Google Images)

Les variantes de la version 2 ont été **supprimées**.

**Révision 3, validée :** la Martinique est retirée de la bannière et remplacée
par la **Barbade**. La règle est désormais explicite et vérifiable —
**uniquement des États souverains**, donc aucune colonne ne peut se lire comme
une prise de position territoriale ou politique. Le texte de l'article continue
de mentionner la Martinique et la Guadeloupe là où c'est pertinent, avec nuance.

Sélection finale : **Haïti · Jamaïque · République dominicaine ·
Trinité-et-Tobago · Barbade**.

### 7.1 Principe

Une seule illustration horizontale, cinq colonnes verticales.

Ce qui fait que c'est **une** illustration et non cinq vignettes :

1. **Un horizon unique**, défini par une seule sinusoïde dans les coordonnées
   globales du canevas. Chaque colonne n'en montre que son tronçon, donc la
   ligne se poursuit d'une colonne à l'autre sans rupture.
2. **Un fil de liaison pointillé** qui traverse délibérément les colonnes *et*
   les intervalles, avec un point par colonne. C'est le seul élément qui ignore
   les séparations — l'idée graphique de l'article en une ligne.
3. **Une grammaire commune** : même relief à deux plans, mêmes palmiers, même
   texture, même traitement typographique.

### 7.2 Chaque colonne est construite à partir de son drapeau

| Colonne | Ciel | Terre | Motif repris du drapeau |
| --- | --- | --- | --- |
| **Haïti** | `#00209F` | `#D21034` | Bicolore à partage horizontal → l'horizon *est* la ligne de partage, et un disque bas figure le soleil |
| **Jamaïque** | `#009639` | `#08331C` | Le sautoir, à pleine colonne, en or `#FFD100` |
| **Rép. dominicaine** | `#002D62` | `#CE1126` | La croix blanche, décentrée vers le haut |
| **Trinité-et-Tobago** | `#C8102E` | `#141414` | La bande diagonale et son liseré |
| **Barbade** | `#00267F` | `#E9B830` | Le triband vertical → la bande d'or centrale, reprise à pleine colonne. La terre est l'or du drapeau, légèrement adouci ; le libellé passe en encre foncée, du blanc sur de l'or ne se lit pas |

Sous l'horizon : deux plans de relief, un liseré clair sur chaque crête, trois
palmiers schématiques. Tout est en noir à faible opacité, **jamais en aplat
clair** — un aplat clair délave la couleur et donne du gris ; c'est l'erreur
qu'a corrigée la deuxième itération.

### 7.3 Ce qui est exact, et ce qui ne l'est pas

C'est la distinction la plus importante du dossier, et elle doit rester lisible
dans toute légende publiée :

- **Les petits drapeaux, en bas de chaque colonne, sont exacts.** Géométrie
  dérivée du texte officiel, **proportions officielles respectées** — d'où des
  largeurs différentes pour une même hauteur. Aucun étirement, aucun recadrage.
- **Les grandes bandes ne sont pas des drapeaux** et ne prétendent pas l'être.
  Ce sont des compositions qui reprennent une palette et une géométrie. **Ne
  jamais les légender « le drapeau de… ».**

Bases légales : Constitution haïtienne de 1987 art. 3 ; formulation officielle
jamaïcaine (ambiguë, lecture littérale retenue) ; Constitution dominicaine
art. 31 ; National Emblems Act de Trinité-et-Tobago, chap. 19:04 ; Barbade,
proportions officielles 2:3 et trois bandes verticales égales.

Haïti et la République dominicaine sont en **drapeau civil**, sans armoiries —
base constitutionnelle explicite pour la seconde, usage vexillologique établi
mais sans base constitutionnelle pour la première.

⚠️ **Réserve propre à la Barbade, à ne pas perdre de vue.** Il n'existe **pas de
planche de construction officielle du trident**. Flags of the World le dit
mot pour mot : *« Different sources differ in the representation of the shape of
the trident — possibly it is not entirely defined. »* Les bandes et les
proportions sont donc exactes ; la tête de trident est une **reconstruction
fidèle à la description publiée** (trois pointes, la centrale plus haute, hampe
brisée sous la traverse), pas la reproduction d'une géométrie officielle qui
n'existe pas. Les seules couleurs officielles barbadiennes sont des références
British Colour Council (outremer BCC 148, or BS O/002) qui ne se convertissent
pas exactement en hexadécimal ; les valeurs employées viennent des conversions
RGB relevées par FOTW.

**Aucun fichier tiers n'a été téléchargé.** Wikimedia Commons est inaccessible
depuis cet environnement, et je n'ai pas cherché à contourner. Tout est
construit géométriquement — donc **aucune licence tierce ne s'applique à cette
illustration**, ce qui est précisément ce qu'il faut pour une image destinée à
être reprise par d'autres sites.

### 7.4 Réutilisabilité

Le script expose une constante `SELECTION`. Changer cette liste suffit à
produire une bannière pour un autre article : `['haiti']` seul, ou une sélection
hispanophone, ou Cuba — dont la colonne est déjà définie. La grammaire visuelle
reste identique, ce qui construit une identité reconnaissable d'un article à
l'autre. C'est l'objectif annoncé : un élément graphique réutilisable, pas une
image jetable.

### 7.5 Paquet SEO image

| Élément | Valeur |
| --- | --- |
| **Nom de fichier** | `rencontres-caribeennes-canada-diaspora-illustration.webp` |
| **ALT** | Composition verticale réunissant les drapeaux d'Haïti, de la Jamaïque, de la République dominicaine, de Trinité-et-Tobago et de la Barbade pour illustrer la diversité caribéenne. *(178 caractères — au-dessus des 125 habituellement recommandés ; conservé tel quel sur ta demande)* |
| **TITLE** | Rencontres caribéennes au Canada — Haïti, Jamaïque, République dominicaine, Trinité-et-Tobago, Barbade |
| **Légende** *(visible)* | Une sélection de cinq États caribéens illustrant la diversité culturelle, linguistique et historique de la diaspora au Canada. Sélection éditoriale, et non un classement démographique. |
| **Crédit** *(visible)* | Illustration : Kiro. Réutilisation autorisée avec attribution et lien vers kirodating.com. |
| **Open Graph** | L'image est déjà l'`og:image` et le `twitter:image` de l'article, au format 1200 × 630 attendu. `og:image:alt` reprend l'ALT. |
| **Description Pinterest** | Antillais, caribéen, haïtien : ce n'est pas la même chose. Où rencontrer des célibataires qui partagent tes références au Canada — Haïti, Jamaïque, République dominicaine, Trinité-et-Tobago, Barbade. Guide complet sur le blog Kiro. |
| **Poids** | 36,7 ko en 1200 × 630 · 79,3 ko en 2400 × 1260 |

**Métadonnées XMP/IPTC écrites dans les deux WebP** (`exiftool`, vérifiées à la
relecture) : `dc:Title`, `dc:Description`, `dc:Creator`, `dc:Rights`,
`dc:Subject` (9 mots-clés), `photoshop:Credit`, `photoshop:Source`,
`xmpRights:Marked`, `xmpRights:UsageTerms`, `xmpRights:WebStatement`,
`iptcCore:CreatorWorkURL`. Une image reprise ailleurs porte donc sa propre
attribution, même détachée de la page.

*(L'IPTC IIM historique n'existe pas dans le conteneur WebP ; XMP est le
mécanisme normalisé pour ce format. C'est ce que lisent Google Images et les
outils de gestion de droits.)*

### 7.6 Sitemap images — implémenté

L'architecture le permettait proprement, c'est fait :

- `scripts/blog/feeds.mjs` : espace de noms `image:` ajouté à `<urlset>`, et
  nœud `<image:image>` avec `<image:loc>`, `<image:title>`, `<image:caption>`.
  Sans effet si un article n'a pas de couverture.
- `scripts/build-blog.mjs` : chaque article déclare son illustration.
- `scripts/blog/content.mjs` : nouveaux champs facultatifs `coverTitle`,
  `coverCaption`, `coverCredit`.
- `scripts/blog/templates.mjs` : attribut `title` sur l'image et `<figcaption>`
  visible sous l'illustration.

L'article 1 en bénéficie automatiquement : sa couverture est désormais déclarée
elle aussi. **Son fichier Markdown n'est pas modifié.**

**Réserve honnête** : le sitemap images est un signal secondaire. Ce qui compte
davantage pour Google Images, c'est l'ALT, la légende visible, le texte autour
de l'image et le nom de fichier — tous traités ci-dessus.

### 7.7 Pourquoi la Martinique est absente de la bannière

Retirée sur ta décision, pour ne pas donner prise à une lecture territoriale ou
politique. L'historique reste consigné ici parce qu'il servira le jour où un
article martiniquais existera — et parce qu'il justifie la règle « États
souverains uniquement » :

- drapeau « aux serpents » sorti de l'usage officiel en 2018, contesté ;
- drapeau « Ipséité » **annulé** par le tribunal administratif de la Martinique
  le 15 novembre 2021 (jugement n° 1900632 et suivants) ;
- vainqueur de la consultation de janvier 2023 **retiré pour plagiat** ;
- drapeau rouge-vert-noir adopté le 3 février 2023 (44 voix pour, 1 abstention)
  mais **pour les manifestations sportives et culturelles**, et politiquement
  connoté depuis 1968 ;
- aucune spécification technique officielle ;
- colibri de la Collectivité = logo de designer, 2016, non réutilisable.

## 8. Paragraphe de transition pour l'article 1

> ⚠️ **L'article 1 n'a pas été modifié.** Le texte ci-dessous est une
> proposition, à insérer **seulement** le jour où l'article 2 sera publié.

**Emplacement recommandé :** dans la section « Étape 1 : ton profil est ta
première conversation », juste après la sous-section « Se démarquer ne veut
pas dire être la personne la plus attirante » — c'est-à-dire là où l'article
parle déjà de dire qui on est et ce qu'on cherche.

**Texte proposé :**

> Cette question de ce qu'on cherche vraiment se pose avec encore plus
> d'acuité quand on souhaite rencontrer quelqu'un qui comprend certaines
> dimensions de sa culture, de sa langue ou de son parcours. C'est une
> réalité que vivent beaucoup de personnes issues des diasporas au Canada, et
> les applications généralistes y répondent mal.
>
> *À lire aussi : [Rencontres caribéennes et antillaises au Canada](/blog/rencontres-caribeennes-antillaises-canada/)*

**Règle d'activation :** le lien ne peut être ajouté qu'une fois l'article 2
publié. Le garde-fou du générateur fera échouer le build si on l'ajoute trop
tôt (voir section 10).

---

## 9. Taxonomie — décision D-4

**Aucune nouvelle catégorie n'est nécessaire.**

`taxonomy.json` contient déjà `diaspora` — « Diaspora & communautés » —
définie comme : *« Rencontres haïtiennes, afro-caribéennes, africaines et
interculturelles au Québec »*. C'est exactement ce sujet. Créer
« Rencontres et communautés » en parallèle ferait doublon et diluerait les
deux.

Une seule retouche est à envisager plus tard : la description de la catégorie
dit « au Québec » alors que cet article est pancanadien. À élargir en
« au Québec et au Canada » au moment de la publication — un changement de
libellé, pas de clé, donc sans effet sur les URLs.

**Tags retenus** (tous existent déjà) : `afro-caribeen`, `haiti`,
`couple-mixte`, `canada`, `montreal`.

À ajouter à `taxonomy.json` seulement si les futurs articles le justifient :
`toronto`, `seconde-generation`. Pas maintenant — un tag utilisé une seule
fois ne sert à rien.

---

## 10. Comment les liens futurs seront activés

### Le mécanisme

Un contrôle a été ajouté à `scripts/build-blog.mjs` : **tout lien d'article
pointant vers `/blog/…` ou `/en/blog/…` qui ne correspond pas à une page
réellement générée fait échouer le build**, avec le fichier et l'URL fautive.

Ce n'est pas un avertissement mais un échec, pour la même raison que la
validation du frontmatter : un lien mort en production coûte un lecteur et un
signal d'indexation, un build rouge coûte trente secondes.

Vérifié : un lien vers `/blog/article-qui-nexiste-pas/` fait bien échouer le
build avec le message attendu ; le build normal reste vert.

Les liens vers la landing page (`/`, `/#jeux`) et vers le centre d'aide ne
sont pas concernés — le générateur ne les maîtrise pas.

### La règle de rédaction

Tant qu'un article cible n'existe pas, sa mention reste **du texte simple**.
Jamais de `href="#"`, jamais de bouton désactivé, jamais de formulation qui
laisse croire que le contenu est disponible.

### Le registre

[`docs/seo/registre-contenus.csv`](../seo/registre-contenus.csv) — 11 entrées,
avec pour chacune : identifiant, titre provisoire, ville ou communauté,
mot-clé cible, intention, article source, emplacement prévu du lien, priorité,
statut (`idea` / `planned` / `draft` / `published`), URL prévue, date de
création, notes.

Le jour où un article passe à `published`, il suffit de retrouver dans le
registre les articles sources et l'emplacement prévu, d'ajouter le lien, et de
laisser le build confirmer qu'il résout.

### La hiérarchie de resserrement

```
Article 2 — GÉNÉRAL (celui-ci)
Rencontres caribéennes et antillaises au Canada
        ↓
Article 3 — PROVINCE
Rencontres caribéennes et antillaises au Québec
        ↓
Article 4 — VILLE
Comment rencontrer des célibataires caribéens à Montréal
        ↓
Article 5 — COMMUNAUTÉ
Rencontre haïtienne à Montréal : guide pour créer une relation sérieuse
```

Branches indépendantes, rattachées à l'article 2 ou à l'article 4 :

- Rencontres caribéennes à Toronto
- Rencontres caribéennes à Ottawa-Gatineau
- Rencontres chrétiennes dans la diaspora haïtienne
- Rencontres pour nouveaux arrivants à Montréal
- Rencontres dans les diasporas insulaires à Montréal *(voir §15)*
- Couple interculturel au Québec
- Né ici, parents là-bas
- Les applications de rencontre haïtiennes vues du Canada
- Événements caribéens à Montréal
- Rencontres caribéennes à Laval
- Caribbean Dating in Canada *(version anglaise de l'article 2)*

### Contrôle de non-cannibalisation

Ce qui appartient aux articles suivants et **n'apparaît nulle part** dans le
titre, le `seoTitle`, le slug, la description ou les H2 de l'article 2 :

| Réservé à | Termes |
| --- | --- |
| Article 3 | `rencontre antillaise Québec`, `rencontre caribéenne Québec` |
| Article 4 | `célibataires caribéens Montréal` |
| Article 5 | `rencontre haïtienne Montréal`, `célibataires haïtiens Montréal` |
| Branche Toronto | `Caribbean dating Toronto` |
| Branche foi | `rencontre chrétienne haïtienne` |
| Branche Maurice | `rencontre mauricienne Montréal` |

Vérifié sur le texte rédigé : « Montréal », « Toronto » et « Ottawa » n'existent
que dans une section descriptive, sans mot-clé commercial accolé. « Haïti » et
« haïtienne » n'apparaissent que dans les définitions, les données et une
réponse de FAQ. Aucune de ces occurrences ne constitue une cible.

### Points d'ancrage futurs

Chaque mention de ville ou de communauté susceptible de devenir un lien est
enregistrée dans le registre — **jamais dans le HTML public**. Colonnes
ajoutées à cet effet : `trigger_text`, `future_anchor`, `source_section`,
`lien_public` (toujours `false` aujourd'hui) et `do_not_link`.

Exemple, tel qu'il figure dans le registre :

```yaml
- id: rencontres-caribeennes-toronto
  trigger_text: Toronto
  future_anchor: rencontrer des célibataires caribéens à Toronto
  source_section: « Montréal, Toronto, Ottawa : ce qui change d'une ville à l'autre »
  status: planned
  public_link: false
```

### Procédure d'activation d'un lien, le jour venu

1. vérifier que la page cible répond en **HTTP 200** ;
2. vérifier son **canonical** ;
3. vérifier son **indexabilité** (pas de `noindex`, présence au sitemap) ;
4. ajouter le lien dans l'article source, à l'emplacement prévu au registre ;
5. régénérer le **sitemap** (automatique au build) ;
6. exécuter le **build** — le garde-fou valide que le lien résout ;
7. exécuter `node --test scripts/blog/links.test.mjs` ;
8. passer l'entrée du registre à `public_link: true`.

## 11. Règles de rédaction propres à ce sujet

**V-1 — Aucune généralisation.** Jamais « les Haïtiens pensent que », jamais
« dans la culture caribéenne, on ». Toujours « certaines personnes »,
« souvent », « pour beaucoup ».

**V-2 — Aucun lieu, événement ou organisme inventé.** Tout nom propre devra
être vérifié à la source avant publication, avec sa date. En cas de doute :
parler par catégories.

**V-3 — Les relations interculturelles sont traitées positivement**, pas comme
un second choix. Le contrepoint est obligatoire dans la section 3, pas relégué
en fin d'article.

**V-4 — Kiro n'est pas une application ethnique.** L'article ne doit à aucun
moment laisser croire qu'elle est réservée à une communauté, ni promettre de
rencontrer une personne d'une origine donnée.

**V-5 — Vocabulaire identitaire choisi consciemment.** La terminologie
(« noir », « racisé », « communauté ») fait l'objet d'un débat actif au
Québec. Rester descriptif et sobre ; ne pas emprunter le vocabulaire militant
d'un camp.

**V-6 — Ton identique à l'article 1** : québécois, tutoiement, direct, aucune
promesse. Typographie française automatique.

---

## 12. Décisions

### Validées le 6 août 2026

| # | Décision | Arbitrage retenu |
| --- | --- | --- |
| **D-1** | Portée du titre | **Pancanadienne.** Entrée générale du cluster. |
| **D-2** | Éléments de la couverture | **Cinq références caribéennes** : Haïti, Jamaïque, Martinique, République dominicaine, Trinité-et-Tobago. Ni Canada ni Québec. Sélection éditoriale, jamais démographique. |
| **D-3** | Couverture générée | **Oui**, à partir des textes officiels, sans téléchargement de fichier tiers. |
| **D-4** | Catégorie | **`diaspora`**, existante. Aucune nouvelle catégorie. |
| **D-5** | Garde-fou anti-lien-mort | **Conservé**, extrait dans `scripts/blog/links.mjs` et couvert par 11 tests. |
| **D-6** | Date de publication | **Samedi 8 août 2026.** Inscrite au brouillon. |
| **D-7** | Auteur | **Pierre Handy Charles.** Voir §14. |

### Validées le 7 août 2026

| # | Décision | Recommandation |
| --- | --- | --- |
| **D-8** | Martinique | **Sans objet** — retirée de la bannière |
| **D-9** | Longueur du `seoTitle` | **Validée** — repli à 59 caractères |
| **D-10** | Variante retenue | **Validée** — variante principale, mise à jour avec les cinq États souverains |
| **D-11** | Emplacement du brouillon | **Validée** — reste dans `content/blog/fr/`, deux verrous (voir §16) |
| **D-12** | Galerie : une seule photo, ou aucune | ouverte — voir §17 |
| **D-13** | Licencier des archives, ou commander une séance photo | ouverte — voir §17 |

## 13. Fichiers créés ou modifiés localement

Tous **non commités**, sur `main`, sans toucher aux quatre commits en attente
de push ni aux modifications déjà présentes de `Hero.css` et `PhoneShowcase.css`.

### Créés

| Fichier | Rôle |
| --- | --- |
| `content/blog/fr/_brouillon-diaspora-caribeenne-canada.md` | Article 2 rédigé, `draft: true` |
| `docs/briefs/article-2-diaspora-caribeenne.md` | Ce document |
| `docs/seo/mots-cles-article-2.csv` | 24 mots-clés analysés |
| `docs/seo/registre-contenus.csv` | 16 entrées, hiérarchie de cluster et points d'ancrage |
| `scripts/blog/links.mjs` | Garde-fou anti-lien-mort, extrait pour être testable |
| `scripts/blog/links.test.mjs` | 11 tests du garde-fou |
| `scripts/covers/article-2-cover.mjs` | Générateur de couverture, sources citées |
| `public/images/blog/…-variante-a.svg` · `.webp` | Couverture variante A |
| `public/images/blog/…-variante-b.svg` · `.webp` | Couverture variante B |

### Modifiés

| Fichier | Modification |
| --- | --- |
| `scripts/build-blog.mjs` | Garde-fou déplacé dans `links.mjs` ; `Person.url` ajouté au JSON-LD de la page auteur |
| `scripts/blog/content.mjs` | `bio` et `jobTitleSchema` localisés dans `decorate()` |
| `scripts/blog/seo.mjs` | `jobTitle` court et `description` de l'auteur dans le JSON-LD `BlogPosting` |
| `scripts/blog/templates.mjs` | Encadré auteur ; nom de l'auteur lié à sa page |
| `scripts/blog/config.mjs` | Trois libellés d'interface FR/EN pour l'encadré auteur |
| `content/blog/authors.json` | Fiche `pierre-handy-charles` |
| `styles/blog.css` | Styles de l'encadré auteur |

**Conséquence assumée** : l'encadré auteur est un composant global. Le fichier
Markdown de l'article 1 n'est **pas** modifié, mais sa page rendue affichera
désormais l'encadré de « L'équipe Kiro ». C'était la demande — « créer ou
réutiliser un véritable composant auteur » — et un composant ne peut pas
s'appliquer à un seul article.

---

## 14. Fiche auteur

Une seule source de vérité : `content/blog/authors.json`. Rien n'est écrit en
dur ailleurs — ni dans un gabarit, ni dans le frontmatter d'un article.

| Champ | Valeur |
| --- | --- |
| `name` | Pierre Handy Charles |
| `type` | `Person` |
| `jobTitle` *(affiché)* | Développeur full-stack, entrepreneur technologique et fondateur de Kiro |
| `jobTitleSchema` *(JSON-LD)* | Développeur full-stack et entrepreneur technologique |
| `url` | `https://www.pierrehandy.com/` |
| `avatar` | `null` — aucune image locale autorisée n'existe |
| `slug` | `pierre-handy-charles` → `/blog/auteur/pierre-handy-charles/` |

**Biographie** (FR) :

> Pierre Handy Charles est un développeur full-stack et entrepreneur
> technologique basé à Montréal. Il conçoit des produits web et mobiles autour
> de l'expérience utilisateur, des communautés et des nouvelles façons de créer
> des connexions en ligne.

**Ce que le portfolio corrobore réellement**, vérifié sur la page :
« développeur full-stack », « entrepreneur », « basé à Montréal », React,
Next.js, développement mobile, UI/UX. Le portfolio se décrit aussi comme
« finance-focused product builder ».

**Ce qui vient de toi et non de la page** : « fondateur de Kiro » et la mention
des communautés et des connexions en ligne. Ce sont tes propres affirmations sur
toi-même, pas des inventions — mais elles ne sont pas vérifiables sur le
portfolio, et c'est signalé ici plutôt que passé sous silence.

**Aucun titre scientifique n'est attribué.** Ni psychologue, ni sociologue, ni
thérapeute, ni expert des relations. Le portfolio confirme une identité et un
parcours technique ; il n'est présenté nulle part comme une source de l'article.

**LinkedIn** : aucun lien ajouté. Aucune URL LinkedIn validée n'existe dans le
projet, et le portfolio n'en expose pas.

**Données structurées produites** (vérifiées sur une simulation de build) :

```json
{
  "@type": "Person",
  "name": "Pierre Handy Charles",
  "url": "https://www.pierrehandy.com/",
  "jobTitle": "Développeur full-stack et entrepreneur technologique",
  "description": "Pierre Handy Charles est un développeur full-stack et entrepreneur technologique basé à Montréal. …"
}
```

Ce qui apparaît sur la page rendue : la signature en tête d'article, liée à la
page auteur ; l'encadré auteur en fin d'article (nom, titre, biographie, lien
vers tous ses articles, lien vers le portfolio en `rel="author"`) ; la page
`/blog/auteur/pierre-handy-charles/` qui liste ses articles.

---

## 15. Île Maurice — hors périmètre caribéen

**L'île Maurice ne fait pas partie des Caraïbes.** C'est un État insulaire de
l'océan Indien, rattaché géographiquement à l'Afrique.

**Formulations interdites**, sans exception :

- « communauté caribéenne mauricienne »
- « île caribéenne de Maurice »
- « pays des Caraïbes comme Maurice »

La communauté mauricienne est mentionnée dans **une section distincte**, placée
après le corps caribéen, qui ouvre sur les autres diasporas insulaires. Le
rapprochement s'y fait explicitement sur le **vécu** — insularité, créole,
migration, famille dispersée — et le texte dit noir sur blanc que la géographie
ne suit pas. La section fait douze lignes : la mention reste secondaire et ne
déforme pas le sujet.

**Aucun positionnement SEO** sur `rencontre mauricienne Montréal`. Le mot-clé est
consigné au registre avec `status: idea`, `theme: diasporas-insulaires`,
`do_not_link: true`, et ne sera repris que si une recherche dédiée démontre une
intention réelle.

**Aucune affirmation démographique locale** n'est faite sur cette communauté :
le texte ne dit pas qu'elle est « très présente à Montréal », faute de donnée
officielle citable. Il dit qu'elle « peut également chercher des espaces où… »,
ce qui est une hypothèse de besoin, pas un chiffre.

---

## 16. Preuve que le brouillon reste hors du build public

**Deux verrous indépendants**, découverts et vérifiés séparément :

1. `draft: true` — `scripts/blog/content.mjs` ignore le fichier avant toute
   autre opération (`if (data.draft === true) continue;`).
2. `publishedAt: '2026-08-08'` est **dans le futur** — le même chargeur applique
   `if (publishedAt.getTime() > now) continue;`. Même si `draft` était retiré
   par erreur aujourd'hui, l'article resterait invisible jusqu'au 8 août.

Build exécuté après suppression complète de `dist/` :

```
✓ 30 fichiers écrits dans dist/ — 2 article(s), 18 URL(s) au sitemap

fichiers générés contenant une trace du brouillon : 0
URL /blog/rencontres-caribeennes-antillaises-canada/ générée : false
catégorie « diaspora » générée : false
page auteur pierre-handy-charles générée : false
occurrences dans sitemap-blog.xml : 0
occurrences dans search-index.json : 0
occurrences dans rss.xml : 0
occurrences dans l'index du blog : 0
```

**Simulation de publication** (brouillon activé et daté d'hier, puis restauré) :
la page se génère correctement, le JSON-LD `Person` est conforme, la page auteur
apparaît, la typographie française est appliquée (110 espaces fines
insécables), et **le corps de l'article ne contient aucun lien** — donc aucun
lien mort possible.

⚠️ **Une observation à signaler** : le générateur écrit dans `dist/` sans purger
les fichiers obsolètes. Après la simulation, la page de test est restée sur le
disque jusqu'à ce que je supprime `dist/`. Sans conséquence en production —
`vite build` vide `dist/` avant, et le pipeline est `vite build && node
scripts/build-blog.mjs` — mais à connaître si le générateur est un jour lancé
seul après un changement de slug.

---

## 17. Photographies — sélection vérifiée sous critères stricts

> **Aucune photo n'a été téléchargée.** Les restrictions de cet environnement
> l'interdisent et je ne les ai pas contournées. Ce qui suit est une sélection
> vérifiée, prête à télécharger quand tu auras tranché.

### 17.1 Ce qui était atteignable, et ce qui ne l'était pas

| Source | État |
| --- | --- |
| **Unsplash** | ✅ atteignable, licences lues sur les pages |
| **Pexels** | ✅ atteignable, licences lues sur les pages |
| **Wikimedia Commons** | ❌ **inatteignable** — domaine en cache seul, HTTPS direct refusé |
| **Flickr / Flickr Commons** | ❌ **inatteignable** — recherche bloquée par robots.txt |
| **Openverse** | ❌ non vérifiable |

**Conséquence assumée : zéro entrée Commons et zéro entrée Flickr dans cette
liste.** Aucune n'a été inventée pour combler le trou. Ces deux sources devront
être refaites depuis un navigateur ordinaire — c'est là que vivent les archives
de Carifiesta et de Caribana.

**Section CC BY-SA : vide.** Le seul gisement réaliste de partage à l'identique
était Commons, inatteignable. Rien n'a été deviné.

### 17.2 Limite honnête : je n'ai pas pu voir les images

Le récupérateur de pages ne rend pas les fichiers image, et les domaines
`images.unsplash.com` et `images.pexels.com` sont bloqués. **Aucun pixel n'a été
regardé.** Tout ce qui concerne les visages, les logos et le texte lisible est
donc *déduit* du titre, du texte alternatif et des étiquettes de la page — et
signalé comme tel. Ces champs doivent être vérifiés à l'œil avant publication.

### 17.3 Les cinq photos dont la licence est vérifiée

| # | Sujet | Photographe | Licence lue sur la page | Lieu déclaré |
| --- | --- | --- | --- | --- |
| **P1** | [Musicien de rue au steelpan, centre-ville de Toronto, l'hiver](https://www.pexels.com/photo/man-in-black-jacket-playing-drum-11305346/) | Domenik drz | Pexels — « Free to use », usage commercial permis | **Toronto, ON** |
| P2 | [Jerk chicken, riz aux pois, banane plantain](https://www.pexels.com/photo/traditional-caribbean-cuisine-27556985/) | Snappr | Pexels — « Free to use » | Houston, TX |
| P3 | [Queue de bœuf jamaïcaine, riz aux pois](https://www.pexels.com/photo/delicious-jamaican-oxtail-and-rice-dish-30746554/) | Thomas Wilson | Pexels — « Free to use » | non déclaré |
| P4 | [Devanture de marché local, Toronto](https://www.pexels.com/photo/charming-local-marketfront-in-toronto-canada-33476709/) | Özge Alpaslan | Pexels — « Free to use » | **Toronto, ON** |
| P5 | [Fleurs, marché Jean-Talon](https://unsplash.com/photos/yellow-and-purple-flowers-in-brown-wooden-pot-Z6aEqlh7LCE) | Thomas Lardeau | Unsplash License | **Montréal** |

**Crédits prêts à coller :**

```
Photo : Domenik drz / Pexels
Photo : Snappr / Pexels
Photo : Thomas Wilson / Pexels
Photo : Özge Alpaslan / Pexels
Photo : Thomas Lardeau / Unsplash
```

**Visages, logos, texte** — P2 et P3 sont des assiettes en gros plan : aucun
visage, confiance élevée. P1, P4 et P5 : à vérifier à l'œil. Sur P1, la personne
porte un capuchon de nuit ; sur P4, des pancartes de prix sont probables.

### 17.4 Trois rejets, et pourquoi

**Rejet 1 — la photo de steelpan la mieux cadrée est celle d'un mineur.**
`pexels.com/photo/a-teenager-plays-the-drum-10738145/`, du même photographe.
Le titre de la page dit *teenager*. Aucune licence ne couvre l'image d'un
enfant, et une application de rencontre est le pire contexte imaginable pour ça.
**Écartée sans discussion.** C'est pour cette raison que la P1 retenue est la
version « man in black jacket » et pas celle-ci — les deux se ressemblent, ne
pas les confondre au téléchargement.

**Rejet 2 — les trois photos de carnaval torontois.** Licence Unsplash valide
(Kyle Hinkson × 2, Acuit David), mais **visages de foule et de danseuses,
inévitablement identifiables**. La licence Unsplash ne transmet aucune
autorisation de la personne photographiée, et les conditions Pexels interdisent
explicitement de laisser croire qu'une personne recommande un produit. Sur une
page de rencontres, un visage se lit comme un témoignage. Au Québec, c'est aussi
le droit à l'image (art. 3 et 36 C.c.Q. ; *Aubry c. Éditions Vice-Versa*).

**Rejet 3 — une photo de Kyle Hinkson dont la description dit
« crowd of people with red smoke and palestinian flags ».** Licence
irréprochable, sujet sans rapport et politiquement chargé. Rejet éditorial.

### 17.5 Ce qui n'existe pas dans les sources atteignables

Résultat négatif, aussi utile que le reste :

- **Cuisine haïtienne** : rien. Ni griot, ni diri kole, ni soup joumou, ni
  pikliz. Le seul résultat « Haïti » est un portrait avec drapeau — visage
  identifiable, hors sujet.
- **Cuisine trinidadienne** : rien. « doubles » et « roti » ramènent des plats
  sud-asiatiques, qui sont une autre tradition culinaire.
- **Cuisine dominicaine et barbadienne** : rien de spécifique.
- **« Caribana » sur Unsplash** : **zéro résultat**, littéralement.
- **Carifiesta, Montréal, communauté caribéenne** : rien d'utilisable.
  C'est le plus gros trou du dossier — le volet « culture » est Toronto ou rien.
- **Steelpan en gros plan** : la recherche ramène un tongue drum, une poêle et
  des contenants métalliques. ⚠️ Un tongue drum **n'est pas** un steelpan.

### 17.6 Le problème qui demeure : la galerie ne colle pas à cet article

Tu as posé la règle : aucune image décorative, chaque image illustre précisément
sa section. Les sections de l'article 2 sont le vocabulaire, la langue, la
famille, la foi, les données, les lieux, les applications, les villes, la
sécurité. **Une assiette de queue de bœuf n'illustre aucune d'entre elles.**

D'où la recommandation : **une seule photo dans l'article 2, la P1**, en regard
de « le sport, la danse, la musique » dans la section « Où se font ces
rencontres aujourd'hui ». Elle est canadienne, caribéenne par l'instrument,
urbaine, hivernale — et elle dit quelque chose de juste. P2 à P5 sont conservées
pour les articles de ville et un futur volet gastronomie.

### 17.7 Deux pièges de légende

- **Ne jamais légender P2 ou P3 comme canadiennes.** P2 est prise à Houston,
  P3 n'a pas de lieu déclaré.
- **Ne jamais légender une soupe générique « soup joumou ».** Le lectorat
  haïtien visé par cet article le verrait immédiatement.

### 17.8 Performance — déjà en place

`width` et `height` explicites sur chaque image, `loading="lazy"` et
`decoding="async"` sur les vignettes, `fetchpriority="high"` réservé à la
couverture, `aspect-ratio` avec `height: auto`, conversion WebP. Le composant de
légende et de crédit (`<figcaption>`, `.post-cover-credit`) est en place et se
généralise sans effort aux photos du corps.

### 17.9 Ce que je ferais

Le puits est sec. Deux pistes qui donneraient vraiment quelque chose :

1. **Licencier directement** les archives de Carifiesta et de Caribana. Leurs
   auteurs sont actifs. Un accord par image, avec autorisation des personnes,
   règle aussi le droit à l'image — ce qu'aucune photo de banque ne réglera.
2. **Commander une séance.** Un photographe montréalais, un après-midi à
   Saint-Michel ou à Rivière-des-Prairies, coûterait probablement moins que la
   revue juridique des alternatives, et donnerait du griot qui est vraiment du
   griot.
