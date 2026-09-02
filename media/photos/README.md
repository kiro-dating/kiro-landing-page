# Photographies originales — sources

Ce dossier contient les **originaux**. Il n'est pas publié : Vite ne copie que
`public/`. Les fichiers réellement servis aux lecteurs sont produits à partir
d'ici par `scripts/media/photos-kiro.mjs`.

```
media/photos/<collection>/<identifiant>.jpg        ← ici, l'original
        ↓  node scripts/media/photos-kiro.mjs
public/images/blog/photos/<collection>/            ← versionné, publié
        <identifiant>-480.avif   <identifiant>-480.webp
        <identifiant>-900.avif   <identifiant>-900.webp
        <identifiant>-1560.avif  <identifiant>-1560.webp
        <identifiant>.jpg                           ← repli universel
```

## Nomenclature

**L'identifiant du fichier est la clé du registre** `content/blog/photos.json`.
Les deux doivent être identiques, sans quoi le build échoue — c'est voulu.

- **Collection** = le sujet, pas l'article : `montreal`, pas
  `aborder-quelquun-a-montreal`. Une même photo peut illustrer plusieurs
  articles au fil du temps ; elle ne change pas de lieu pour autant. C'est le
  champ `articles` du registre qui fait le lien avec les articles, et la page
  `/blog/credits-photos` qui l'affiche.
- **Identifiant** = le lieu, en minuscules, mots séparés par des traits d'union,
  du plus général au plus précis : `belvedere-kondiaronk-mont-royal`,
  `square-dorchester-fontaine`. C'est aussi le nom de fichier vu par les
  moteurs de recherche : il doit décrire l'image sans la deviner.
- **Extension** : `.jpg` pour la source, quel que soit le format d'origine.

## Ajouter une photographie

1. Déposer l'original ici, sous `<collection>/<identifiant>.jpg`.
2. Ajouter l'entrée correspondante dans `content/blog/photos.json`
   (photographe, licence, lieu, texte alternatif, légende). Laisser `width` et
   `height` de côté : ils sont mesurés, pas saisis.
3. `node scripts/media/photos-kiro.mjs` — dérive les fichiers, embarque les
   métadonnées IPTC/XMP, et écrit les dimensions dans le registre.
4. Citer la photo dans un article : `![](photo:<identifiant>)`.
5. `npm test` — les garde-fous vérifient que tout se tient.

`sharp` n'est pas une dépendance du projet : les dérivées étant versionnées, ni
le build ni le déploiement n'en ont besoin. Pour cette opération ponctuelle,
`npm i --no-save sharp`.

## État actuel des sources

Les six fichiers présents sont les versions **réduites à 2048 px** transmises
lors de l'intégration : leurs métadonnées EXIF, y compris la géolocalisation,
avaient déjà été retirées en amont. Elles suffisent largement au rendu (la
colonne d'article fait 772 px, soit 1544 px en écran 2×).

Pour repartir des fichiers pleine résolution : les déposer ici sous les mêmes
noms, puis `node scripts/media/photos-kiro.mjs --force`. Rien d'autre à
toucher — ni les articles, ni le registre.
