# Kiro — Landing Page

Page d'accueil premium pour **Kiro**, une application de rencontre destinée à la diaspora haïtienne.
Construite avec React 19, Vite 8, Framer Motion et Supabase.

---

## 📋 Table des matières

- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration Supabase](#-configuration-supabase)
- [Lancer le projet](#-lancer-le-projet)
- [Lancer les tests](#-lancer-les-tests)
- [Structure du projet](#-structure-du-projet)
- [Architecture Supabase](#-architecture-supabase)
- [Internationalisation (i18n)](#-internationalisation-i18n)
- [Build de production](#-build-de-production)

---

## 🛠 Stack technique

| Outil | Version | Rôle |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 8 | Build tool & dev server |
| Framer Motion | 12 | Animations |
| Supabase JS | 2 | Backend / base de données |
| i18next | 26 | Internationalisation (FR/EN) |
| libphonenumber-js | 1 | Validation numéro de téléphone |
| Vitest | 4 | Tests unitaires |
| lucide-react | latest | Icônes SVG |

---

## 📦 Installation

> **Prérequis :** Node.js `>= 20.19` ou `>= 22.12`. Si vous utilisez nvm :
> ```bash
> nvm install 22
> nvm use 22
> ```

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd premium-landing-page
```

### 2. Installer les dépendances

```bash
npm install
```

---

## 🔐 Configuration Supabase

### 1. Créer le fichier `.env` à la racine

```bash
cp .env.example .env   # ou créez-le manuellement
```

> ⚠️ Le fichier `.env` est ignoré par Git (`.gitignore`). Ne commitez jamais vos clés.

### 2. Remplir les variables

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

Retrouvez vos clés dans votre tableau de bord Supabase → **Settings → API**.

### 3. Créer la table `waitlist_users` dans Supabase

Exécutez ce SQL dans l'éditeur Supabase :

```sql
create table if not exists waitlist_users (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  email       text not null,
  phone       text,
  country     text,
  age         text,
  gender      text,
  status      text default 'pending',
  source      text default 'landing_page'
);
```

> Pensez à activer Row Level Security (RLS) et à créer une policy `INSERT` pour `anon` si nécessaire.

---

## 🚀 Lancer le projet

### Développement local

```bash
npm run dev
```

Le site sera disponible sur [http://localhost:5173](http://localhost:5173).

### Aperçu du build de production

```bash
npm run preview
```

---

## 🧪 Lancer les tests

Le projet utilise **Vitest** pour les tests unitaires.

### Lancer tous les tests (une seule fois)

```bash
npm test
```

### Lancer les tests en mode "watch" (relance à chaque modification)

```bash
npm run test:watch
```

### Exemple de sortie attendue

```
✓ src/utils/__tests__/phoneValidation.test.js (19 tests)

  ✓ Valid numbers
    ✓ accepts a valid Canadian number (Montreal 514)
    ✓ accepts a valid Canadian number with country dial prefix
    ✓ accepts a valid Haitian number
    ✓ accepts a valid French number

  ✓ Invalid numbers
    ✓ rejects a number that is too short
    ✓ rejects a number with wrong country format
    ✓ rejects random digit strings
    ✓ rejects a French number for Canada country code

  ✓ Edge cases
    ✓ rejects empty string
    ✓ rejects null / undefined / whitespace
    ✓ handles numbers with spaces, dashes, parentheses
    ✓ handles unknown country code gracefully

  ✓ E.164 Formatting
    ✓ Canada, Haiti, France → correct E.164 format

Test Files  1 passed (1)
     Tests  19 passed (19)
```

### Où sont les tests ?

```
src/utils/__tests__/
  phoneValidation.test.js   → Validation des numéros de téléphone
```

### Ajouter de nouveaux tests

Créez un fichier `*.test.js` dans `src/utils/__tests__/`. Vitest le détectera automatiquement.

---

## 📁 Structure du projet

```
premium-landing-page/
├── public/                        # Fichiers statiques
├── src/
│   ├── components/                # Composants React
│   │   ├── Hero.jsx               # Section héro avec animations
│   │   ├── WaitlistCard.jsx       # Formulaire d'inscription waitlist
│   │   ├── Features.jsx           # Section fonctionnalités
│   │   ├── Partnerships.jsx       # Section partenariats créateurs
│   │   ├── AppPreview.jsx         # Preview de l'application
│   │   ├── InteractiveBackground.jsx # Background animé
│   │   ├── TextEffect.jsx         # Animation de texte (fade-in blur)
│   │   ├── TextScramble.jsx       # Animation scramble au survol
│   │   └── Button.jsx             # Composant bouton réutilisable
│   ├── lib/
│   │   └── supabaseClient.js      # Client Supabase (singleton)
│   ├── locales/
│   │   ├── fr/translation.json    # Traductions françaises
│   │   └── en/translation.json    # Traductions anglaises
│   ├── services/
│   │   └── waitlistService.js     # Logique d'insertion Supabase
│   ├── utils/
│   │   ├── phoneValidation.js     # Validation numéro (libphonenumber-js)
│   │   └── __tests__/
│   │       └── phoneValidation.test.js
│   ├── App.jsx                    # Composant racine
│   ├── index.css                  # Styles globaux (tokens, glassmorphism)
│   └── main.jsx                   # Point d'entrée React
├── .env                           # Variables d'environnement (non committé)
├── vite.config.js                 # Config Vite + Vitest
├── package.json
└── README.md
```

---

## 🗄 Architecture Supabase

Le formulaire d'inscription collecte :

| Champ | Type | Description |
|---|---|---|
| `email` | text | Adresse email |
| `phone` | text | Numéro E.164 (ex: `+15142345678`) |
| `country` | text | Code pays interne (ex: `+1_CA`) |
| `age` | text | Tranche d'âge sélectionnée |
| `gender` | text | Sexe sélectionné |
| `status` | text | `pending` par défaut |
| `source` | text | `landing_page` par défaut |

> Les numéros de téléphone sont toujours normalisés au format **E.164** avant l'envoi grâce à `libphonenumber-js`.

---

## 🌍 Internationalisation (i18n)

Le site supporte **Français** et **Anglais** via `i18next`.

Les fichiers de traductions se trouvent dans :
- `src/locales/fr/translation.json` — Français (langue par défaut)
- `src/locales/en/translation.json` — Anglais

Pour ajouter une nouvelle langue :
1. Créer un dossier `src/locales/<code>/`
2. Y ajouter un fichier `translation.json` en suivant la même structure
3. Enregistrer la nouvelle langue dans `src/i18n.js`

---

## 🏗 Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans le dossier `dist/`.

> ⚠️ Assurez-vous que votre fichier `.env` est correctement rempli avant de builder pour la production.

---

## 📄 Licence

Propriétaire — tous droits réservés © Kiro
