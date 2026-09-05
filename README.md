# Nano Design — Studio Créatif Dakar 🇸🇳

> **Plateforme web haute-fidélité pour le studio Nano Design (Dakar, Sénégal).**  
> Identité visuelle sombre & or, typographie soignée, tunnel de devis interactif, espace d'administration temps réel relié à Supabase, facturation automatisée et passerelle de paiement Wave / Orange Money.

---

## 🌟 Fonctionnalités Clés

### 1. Site Public Vitrine (`index.html`)
* **Accueil Cinématographique** : Présentation premium du studio avec esthétique noire & laiton doré.
* **Catalogue de Prestations** : Design web/mobile, branding/logos, marketing digital, signalétique & habillage mural.
* **Portfolio Filtrable** : Catégories de réalisations avec fiches détaillées.
* **Tunnel de Devis Interactif (Wizard 2 étapes)** :
  * **Étape 1** : Sélection intuitive de la prestation (Logo avec/sans charte, Site vitrine/e-commerce, Support print/web).
  * **Étape 2** : Cahier des charges, coordonnées client, budget et délai souhaité.
  * **Transmission instantanée** vers la base de données Supabase avec notification email et alertes en direct.
* **Formulaire de Contact & Localisation** : Envoi de messages avec carte Google Maps intégrée de Dakar.
* **Questions Fréquentes (FAQ)** : Accordéon interactif pour lever tous les freins clients.
* **Télémétrie en Direct (`site-analytics.js`)** : Mesure concrète des visiteurs uniques, sessions, pages vues, pays et taux de conversion du tunnel sans cookies tiers.

### 2. Espace Studio Privé (`admin.html`)
* **Portail Sécurisé** : Écran d'authentification privé avec identifiant et mot de passe.
* **Gestion des Devis Reçus** :
  * Affichage en temps réel des demandes issues du tunnel.
  * Bouton **« Voir le brief 📋 »** : consultation du cahier des charges complet et des attentes client.
  * Contact direct en un clic sur **WhatsApp** ou par **Email**.
* **Facturation Officielle A4** :
  * Génération automatique de facture personnalisée pour chaque devis.
  * Téléchargement PDF / Impression directe.
  * Partage direct sur WhatsApp avec message pré-rempli pour le client.
* **Module d'Encaissement & Paiement (Phase 2)** :
  * Fixation manuelle du montant convenu.
  * Génération de liens de paiement pour les clients.
* **Gestion des Messages de Contact** :
  * Lecture complète du message dans un modal dédié.
  * Bascule d'état rapide (Lu / Non lu).
* **Statistiques Réelles d'Audience** :
  * Visiteurs uniques réels, profondeur de session, taux de conversion direct du tunnel, pays dominants détectés (Sénégal, Côte d'Ivoire, France, etc.) et affluence par section.
* **Système d'Alertes en Temps Réel** :
  * Carillons sonores synthétisés (Web Audio API sans dépendance externe).
  * Notifications Push natives de bureau.

### 3. Portail de Règlement Client (`pay.html`)
* Page dédiée et épurée où le client règle sa facture via **Wave**, **Orange Money** ou **Carte Bancaire**.

---

## 📁 Arborescence du Projet

```text
nano-design/
│
├── index.html              # Site vitrine public officiel
├── admin.html              # Espace d'administration privé du studio
├── pay.html                # Portail de règlement pour les clients
│
├── supabase-schema.sql     # Script SQL complet pour la base Supabase PostgreSQL
├── robots.txt              # Configuration du référencement SEO
├── .htaccess               # Directives de sécurité et redirection pour serveurs Apache
├── netlify.toml            # Configuration pour déploiement sur Netlify
├── vercel.json             # Configuration pour déploiement sur Vercel
├── _redirects              # Règles de redirection d'URL
├── .gitignore              # Fichiers exclus du suivi Git
├── .env.example            # Fichier d'exemple pour variables d'environnement
├── README.md               # Documentation du projet
│
├── assets/                 # Médias et identité de marque
│   └── Logo.png            # Logo officiel Nano Design
│
├── css/                    # Feuilles de styles modulaires
│   ├── style.css           # Styles globaux, typographies, tokens et site public
│   ├── tunnel-devis.css    # Styles du wizard de devis en plusieurs étapes
│   └── admin-modal.css     # Styles des modals studio (Brief, Facture, Messages)
│
└── js/                     # Logique applicative JavaScript
    ├── main.js             # Navigation, animations, modales de services et filtres
    ├── devis-wizard.js     # Logique interactive du tunnel de devis
    ├── supabase-config.js  # Identifiants de connexion Supabase Cloud
    ├── supabase-client.js  # Adaptateur Supabase & synchronisation temps réel
    ├── site-analytics.js   # Moteur de tracking d'audience et de conversion en direct
    ├── admin-notifications.js # Alertes sonores Web Audio & notifications de bureau
    ├── admin-dashboard.js  # Fonctions utilitaires et données de secours
    └── email-notify.js     # Dispatcheur de notifications email
```

---

## 🚀 Démarrage Rapide en Local

Le projet a été conçu en **Vanilla HTML/CSS/JavaScript moderne**, sans build complexe ni dépendance lourde :

1. **Cloner ou télécharger le dépôt** :
   ```bash
   git clone https://github.com/votre-compte/nano-design.git
   cd nano-design
   ```

2. **Lancer un serveur local** (recommandé pour bénéficier des Web Workers, modules et du son) :
   * **Avec VS Code** : Installer l'extension **Live Server**, faire un clic droit sur `index.html` > *Open with Live Server*.
   * **Avec Python** :
     ```bash
     python -m http.server 8080
     ```
     Puis ouvrir [http://localhost:8080](http://localhost:8080) dans votre navigateur.
   * **Avec Node.js** :
     ```bash
     npx serve .
     ```

3. **Accéder à l'espace Admin Studio** :
   * URL directe : [http://localhost:8080/admin.html](http://localhost:8080/admin.html)
   * Ou depuis `index.html` : appuyer sur le raccourci secret `Ctrl + Shift + A`
   * **Identifiants par défaut** :
     * **Identifiant** : `admin`
     * **Mot de passe** : `nano2026`

---

## 🗄️ Configuration de la Base de Données Supabase

Le projet est déjà configuré pour se connecter à Supabase. Si vous déployez sur votre propre projet Supabase :

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Rendez-vous dans **SQL Editor** sur votre tableau de bord Supabase.
3. Copiez et exécutez l'intégralité du script [`supabase-schema.sql`](./supabase-schema.sql).
4. Renseignez vos clés dans `js/supabase-config.js` :
   ```javascript
   window.SUPABASE_CONFIG = {
     url: 'https://votre-projet.supabase.co',
     anonKey: 'votre-cle-publique-anon'
   };
   ```

---

## 🌐 Déploiement en Production

Le projet est prêt à être déployé sur n'importe quelle plateforme en moins de 2 minutes :

* **Vercel** : Importez le dépôt GitHub, Vercel détecte automatiquement la configuration grâce au fichier `vercel.json`.
* **Netlify** : Glissez-déposez le dossier ou liez le dépôt GitHub (géré par `netlify.toml`).
* **Hébergement classique (LWS, cPanel, Apache)** : Téléversez tous les fichiers dans le dossier `public_html` (le fichier `.htaccess` gère automatiquement la sécurité et la compression).

---

## 🔒 Sécurité & Bonnes Pratiques

* Les clés publiques Supabase (`anonKey`) ne disposent que des droits d'insertion et de lecture protégés par les politiques RLS (*Row Level Security*).
* Aucun mot de passe ni clé secrète (*service_role*) n'est stocké dans le dépôt public.
* Le stockage hybride assure un fonctionnement continu et transparent même en cas d'indisponibilité réseau ou hors-ligne grâce au repli automatique sur `localStorage`.

---

© 2026 **Nano Design** — Dakar, Sénégal. Tous droits réservés.
