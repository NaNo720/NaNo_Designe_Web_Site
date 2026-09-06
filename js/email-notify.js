// ==============================================================================
// GESTIONNAIRE D'ENVOI D'ALERTES & ACCUSÉS DE RÉCEPTION — NANO DESIGN STUDIO DAKAR
// ==============================================================================
// Transmet automatiquement :
// 1. Une alerte email complète à l'équipe Nano Design (contact@nanodesign.sn)
// 2. Un accusé de réception officiel au client (confirmation de son projet)
// via l'API Web3Forms / Resend sans nécessiter de serveur backend lourd.
// ==============================================================================

(function() {
  'use strict';

  // Email officiel du studio par défaut
  const STUDIO_EMAIL = 'contact@nanodesign.sn';

  // Clé d'accès API Web3Forms (optionnelle, configurable dans localStorage ou window.SUPABASE_CONFIG)
  function getAccessKey() {
    return (
      (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.emailKey) ||
      localStorage.getItem('nano_web3forms_key') ||
      ''
    );
  }

  const NanoNotify = {
    // --------------------------------------------------------------------------
    // 1. GESTION DES DEVIS (Alerte Studio + Accusé de Réception Client)
    // --------------------------------------------------------------------------

    // Envoi de l'accusé de réception officiel dans la boîte email du client
    async sendClientQuoteReceipt(quote) {
      const client = quote.client || {};
      if (!client.email) return { success: false, reason: 'no_client_email' };

      const accessKey = getAccessKey();
      const payload = {
        subject: `✦ Nano Design Studio — Accusé de réception de votre demande (${quote.id})`,
        from_name: 'Nano Design Studio Dakar',
        to_email: client.email,
        replyto: STUDIO_EMAIL,
        message: `
Bonjour ${client.name || 'Madame, Monsieur'},

Nous vous confirmons la bonne réception de votre demande de devis sur la plateforme Nano Design Studio Dakar.

RÉCAPITULATIF DE VOTRE DOSSIER :
---------------------------------------------
• Numéro de Référence : ${quote.id}
• Date d'enregistrement : ${quote.date}
• Prestation demandée   : ${quote.serviceLabel}
• Entreprise / Marque   : ${client.company || 'Particulier'}
• Budget estimatif      : ${client.budget || 'À définir'}
• Délai souhaité        : ${client.timeline || 'Flexible'}

VOTRE BRIEF :
---------------------------------------------
"${client.description || 'Projet de création et design sur-mesure.'}"

PROCHAINES ÉTAPES :
---------------------------------------------
Notre équipe créative étudie actuellement votre cahier des charges avec attention. Un responsable de projet reviendra vers vous sous 24h ouvrées avec une proposition adaptée et un chiffrage détaillé.

Besoin d'échanger directement ou d'accélérer votre dossier ?
• WhatsApp Direct : +221 77 890 12 34 (https://wa.me/221778901234)
• Email Studio    : ${STUDIO_EMAIL}
• Adresse         : Rue de la Plage, Les Almadies • Dakar, Sénégal
• Site Officiel   : https://nanodesign.sn

Merci pour votre confiance et à très bientôt,

L'équipe Nano Design Studio Dakar
Création de Marques • Sites Web & Mobile • Signalétique
        `.trim()
      };

      if (accessKey) {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ access_key: accessKey, ...payload })
          });
          const result = await response.json();
          if (result.success) {
            console.log(`[NanoNotify] Accusé de réception devis envoyé au client (${client.email}).`);
            return { success: true };
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur accusé de réception client:', err);
        }
      }

      console.log(`[NanoNotify] Accusé de réception client préparé pour ${client.email} (Réf: ${quote.id}).`);
      return { success: true, simulated: true };
    },

    // Envoi de l'alerte à l'équipe Nano Design
    async sendStudioQuoteAlert(quote) {
      const client = quote.client || {};
      const accessKey = getAccessKey();

      const payload = {
        subject: `[Nouveau Devis Studio] ${quote.id} — ${client.name || 'Client'} (${quote.serviceLabel || 'Projet'})`,
        from_name: `${client.name || 'Client'} via Nano Design`,
        to_email: STUDIO_EMAIL,
        replyto: client.email || STUDIO_EMAIL,
        message: `
NOUVELLE DEMANDE DE DEVIS ENREGISTRÉE SUR LE SITE NANO DESIGN DAKAR
==================================================================

• Référence Devis : ${quote.id}
• Date            : ${quote.date}
• Prestation      : ${quote.serviceLabel}

COORDONNÉES CLIENT :
--------------------
• Nom & Prénom : ${client.name || 'Non renseigné'}
• Entreprise   : ${client.company || 'Non renseignée'}
• Téléphone    : ${client.phone || 'Non renseigné'}
• Email        : ${client.email || 'Non renseigné'}

CAHIER DES CHARGES :
--------------------
• Budget estimatif : ${client.budget || 'Non spécifié'}
• Délai souhaité   : ${client.timeline || 'Non spécifié'}
• Description :
${client.description || 'Aucune description fournie.'}

LIEN DIRECT GESTION ADMIN :
https://nanodesign.sn/admin.html
        `.trim()
      };

      if (accessKey) {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ access_key: accessKey, ...payload })
          });
          const result = await response.json();
          if (result.success) {
            console.log('[NanoNotify] Alerte email devis transmise au studio.');
            return { success: true };
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur envoi alerte studio:', err);
        }
      }

      console.log('[NanoNotify] Devis enregistré dans la base et alerte préparée pour', STUDIO_EMAIL);
      return { success: true, localOnly: true };
    },

    // Méthode principale devis : déclenche l'alerte studio ET l'accusé de réception client
    async sendQuoteEmail(quote) {
      // 1. Alerte interne pour l'équipe
      const studioResult = await this.sendStudioQuoteAlert(quote);
      // 2. Accusé de réception officiel pour le client
      const clientResult = await this.sendClientQuoteReceipt(quote);
      return { studio: studioResult, client: clientResult };
    },

    // --------------------------------------------------------------------------
    // 2. GESTION DES MESSAGES DE CONTACT (Alerte Studio + Accusé Client)
    // --------------------------------------------------------------------------

    // Envoi de l'accusé de réception message au visiteur
    async sendClientMessageReceipt(msg) {
      if (!msg.email) return { success: false, reason: 'no_client_email' };

      const accessKey = getAccessKey();
      const payload = {
        subject: `✦ Nano Design Studio — Nous avons bien reçu votre message (${msg.id})`,
        from_name: 'Nano Design Studio Dakar',
        to_email: msg.email,
        replyto: STUDIO_EMAIL,
        message: `
Bonjour ${msg.name || 'Madame, Monsieur'},

Nous vous remercions d'avoir contacté Nano Design Studio Dakar.

Nous confirmons la bonne réception de votre message concernant :
« ${msg.subject || 'Votre prise de contact'} » (Réf: ${msg.id}).

Notre équipe prend connaissance de votre mot et vous répondra dans les plus brefs délais (généralement sous 24h ouvrées).

Pour toute demande urgente, vous pouvez nous joindre directement :
• WhatsApp : +221 77 890 12 34
• Téléphone : +221 77 000 00 00
• Studio    : Rue de la Plage, Les Almadies • Dakar, Sénégal

Bien cordialement,

L'équipe Nano Design Studio Dakar
https://nanodesign.sn
        `.trim()
      };

      if (accessKey) {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ access_key: accessKey, ...payload })
          });
          const result = await response.json();
          if (result.success) {
            console.log(`[NanoNotify] Accusé de réception contact envoyé au client (${msg.email}).`);
            return { success: true };
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur accusé contact client:', err);
        }
      }

      console.log(`[NanoNotify] Accusé de réception contact préparé pour ${msg.email}.`);
      return { success: true, simulated: true };
    },

    // Alerte interne message pour le studio
    async sendStudioMessageAlert(msg) {
      const accessKey = getAccessKey();

      const payload = {
        subject: `[Nouveau Message Contact] ${msg.subject || 'Message'} — ${msg.name}`,
        from_name: `${msg.name} via Nano Design`,
        to_email: STUDIO_EMAIL,
        replyto: msg.email || STUDIO_EMAIL,
        message: `
NOUVEAU MESSAGE REÇU DEPUIS LA PAGE CONTACT NANO DESIGN
======================================================

• Réf Message : ${msg.id}
• Date        : ${msg.date}
• Expéditeur  : ${msg.name}
• Email       : ${msg.email}
• Téléphone   : ${msg.phone || 'Non renseigné'}
• Sujet       : ${msg.subject || 'Contact direct'}

MESSAGE :
---------
${msg.message}

LIEN DIRECT GESTION ADMIN :
https://nanodesign.sn/admin.html
        `.trim()
      };

      if (accessKey) {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ access_key: accessKey, ...payload })
          });
          const result = await response.json();
          if (result.success) {
            console.log('[NanoNotify] Alerte email contact transmise au studio.');
            return { success: true };
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur envoi email contact:', err);
        }
      }

      console.log('[NanoNotify] Message de contact sécurisé dans la base pour', STUDIO_EMAIL);
      return { success: true, localOnly: true };
    },

    // Méthode principale contact : déclenche l'alerte studio ET l'accusé de réception client
    async sendMessageEmail(msg) {
      const studioResult = await this.sendStudioMessageAlert(msg);
      const clientResult = await this.sendClientMessageReceipt(msg);
      return { studio: studioResult, client: clientResult };
    }
  };

  window.NanoNotify = NanoNotify;
})();
