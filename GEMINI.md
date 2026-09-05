# Prompt — Site web Nano Design (structure complète)

# Role
Agis comme un Technologue Creatif Senior de classe mondiale et Lead Ingenieur Frontend. Tu construis des landing pages haute-fidelite, cinematographiques, "1:1 Pixel Perfect". Chaque site que tu produis doit ressembler a un instrument digital — chaque scroll est intentionnel, chaque animation est ponderee et professionnelle. Eradique tous les patterns generiques d'IA.

# Brief
Construis un site web pour **Nano Design**, studio de création basé à Dakar (Sénégal), proposant : design de sites web/mobile, identité visuelle/branding, marketing digital, signalétique/habillage mural. Style visuel : élégant/premium, tons sombres, typographie soignée. Le site doit inclure les sections et le parcours suivants :

## 1. Accueil
Page hub qui présente le studio en un coup d'œil et redirige vers chacune des sections ci-dessous (Services, Réalisations, À propos, Contact, Devis, FAQ).

## 2. Services
- Liste des prestations proposées (design web/mobile, branding, marketing digital, signalétique...).
- Chaque prestation a un résumé court en page Accueil/Services, avec un lien **"Voir +"** vers le détail complet de l'offre.

## 3. Réalisations (Portfolio)
- Catégories : **Logos**, **Sites web**, (autres à définir : marketing, signalétique...).
- Aperçu de projets par catégorie, avec **"Voir +"** vers une page portfolio complète (filtrable par catégorie idéalement).

## 4. À propos
- Bloc **"Infos sur l'entreprise"** : qui est Nano Design, mission, valeurs, méthode de travail.
- Lien **"Voir +"** vers une page À propos complète.

## 5. Contact
- Bloc **"Comment nous contacter"** : email, téléphone/WhatsApp, adresse, réseaux sociaux.
- Lien **"Voir +"** vers une page Contact avec formulaire.
- **Carte de localisation** intégrée (ex. Google Maps) montrant l'adresse du studio à Dakar.

## 6. Devis (fonctionnalité centrale — tunnel interactif)
C'est la section la plus importante du site : un **assistant de devis en plusieurs étapes** qui guide le client selon son besoin.

**Étape 1 — Type de prestation** (le client choisit une des 3 options) :

- **Créer un logo**
  - Avec charte graphique
  - Sans charte graphique
- **Créer un site web**
  - Site vitrine
  - Site e-commerce
- **Visuel / support**
  - Support imprimé
  - Support web

**Étape 2 — Formulaire final**, affiché après le choix (quelle que soit la branche empruntée) :
- Informations du client : nom, entreprise, email, téléphone
- Cahier des charges : description libre du projet, budget indicatif (optionnel), délai souhaité (optionnel)
- Un résumé rappelant le choix fait à l'étape 1 (ex. "Site web — E-commerce")
- Bouton d'envoi → transmission par email à l'équipe Nano Design

## 7. Questions Fréquentes (FAQ)
- Liste de questions/réponses courantes (tarifs, délais, processus de travail, zone d'intervention...).
- Aperçu sur la page d'accueil avec **"Voir +"** vers la page FAQ complète.

## 8. Espace admin (phase 2 — nécessite un backend)
Espace privé, accessible uniquement à Nano Design via identifiant/mot de passe, permettant de :
- **Gérer le portfolio** : ajouter, modifier, supprimer des créations (logos, sites, visuels) affichées dans la section Réalisations, sans toucher au code.
- **Consulter les devis reçus** : liste des demandes envoyées via le tunnel de devis, avec leur détail (type de prestation, infos client, cahier des charges).
- **Voir les messages de contact reçus** via le formulaire de la page Contact.
- **Statistiques de visite** du site (nombre de visiteurs, pages consultées).

⚠️ Contrairement aux sections 1 à 7 (pages publiques, réalisables en HTML statique), cette partie nécessite une **base de données**, une **authentification sécurisée**, et un **hébergement avec backend** — c'est un chantier technique distinct, à traiter après la mise en ligne du site public si les délais sont serrés.

## 9. Paiement en ligne (phase 2 — lié à l'espace admin)
Le paiement n'est **pas automatique** à la fin du tunnel de devis : le client envoie sa demande, Nano Design discute et fixe le montant manuellement, puis déclenche la demande de paiement.

- Depuis l'**espace admin**, possibilité de générer une demande de paiement liée à un devis (montant saisi manuellement par Nano Design après discussion).
- Le client reçoit un **lien de paiement** (par email ou sur le site) et règle en ligne.
- Moyens de paiement acceptés : **Mobile Money** (Orange Money, Wave) et **carte bancaire**.
- Solution technique recommandée : un agrégateur de paiement adapté au Sénégal (ex. PayDunya, CinetPay ou Kkiapay), qui gère à la fois le Mobile Money et les cartes, plutôt qu'une solution internationale comme Stripe.
- L'admin doit pouvoir voir le **statut de chaque paiement** (en attente / payé) dans son tableau de bord.

## Exigences techniques
- Site responsive (mobile/tablette/desktop)
- Navigation claire entre les 6 sections depuis un menu commun
- Le tunnel de devis doit être fluide : chaque choix de l'étape 1 mène directement au même formulaire final, sans rechargement de page si possible (parcours en une page avec étapes, façon wizard)
- Cohérence visuelle avec l'identité déjà définie (tons sombres, typographie  + sans-serif technique, accent laiton/or)
- Formulaires fonctionnels (devis + contact) envoyant les données par email

## Contenu à préciser avant construction
- Textes définitifs pour Services, À propos, FAQ (ou dois-je les rédiger ?)
- Visuels de réalisations à intégrer (logos, captures de sites avec lien de redirection vers le site du client ou vers la page de la réalisation) une fois disponibles
- Liste des questions fréquentes réelles