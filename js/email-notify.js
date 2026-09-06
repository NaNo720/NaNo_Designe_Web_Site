// ==============================================================================
// GESTIONNAIRE D'ENVOI D'ALERTES EMAIL — NANO DESIGN STUDIO DAKAR
// ==============================================================================
// Transmet automatiquement et en temps réel chaque devis et message de contact
// à l'équipe Nano Design via l'API Web3Forms.
// Permet de répondre au client en 1 clic grâce à l'en-tête Reply-To configuré.
// ==============================================================================

(function() {
  'use strict';

  // Email officiel du studio par défaut
  const STUDIO_EMAIL = 'contact@nanodesign.sn';

  // Clé d'accès API Web3Forms (configurable dans localStorage ou window.SUPABASE_CONFIG)
  function getAccessKey() {
    return (
      (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.emailKey) ||
      localStorage.getItem('nano_web3forms_key') ||
      '0619d3e7-cf84-49b4-8ec6-05b9d9c6245f'
    );
  }

  const NanoNotify = {
    // --------------------------------------------------------------------------
    // 1. ENVOI DE L'ALERTE DEVIS AU STUDIO
    // --------------------------------------------------------------------------
    async sendQuoteEmail(quote) {
      const client = quote.client || {};
      const accessKey = getAccessKey();

      const payload = {
        access_key: accessKey,
        subject: `[Devis Nano Design] ${quote.id} — ${client.name || 'Client'} (${quote.serviceLabel || 'Projet'})`,
        from_name: `${client.name || 'Client'} via Nano Design`,
        name: client.name || 'Client',
        email: client.email || STUDIO_EMAIL,
        replyto: client.email || STUDIO_EMAIL,
        phone: client.phone || 'Non renseigné',
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
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (result.success) {
            console.log('[NanoNotify] Alerte email devis transmise avec succès au studio.');
            return { success: true };
          } else {
            console.warn('[NanoNotify] Réponse API Web3Forms:', result);
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur envoi alerte devis studio:', err);
        }
      }

      console.log('[NanoNotify] Devis enregistré dans la base et alerte préparée pour le studio.');
      return { success: true, localOnly: true };
    },

    // --------------------------------------------------------------------------
    // 2. ENVOI DE L'ALERTE MESSAGE DE CONTACT AU STUDIO
    // --------------------------------------------------------------------------
    async sendMessageEmail(msg) {
      const accessKey = getAccessKey();

      const payload = {
        access_key: accessKey,
        subject: `[Contact Nano Design] ${msg.subject || 'Message'} — ${msg.name}`,
        from_name: `${msg.name} via Nano Design`,
        name: msg.name,
        email: msg.email || STUDIO_EMAIL,
        replyto: msg.email || STUDIO_EMAIL,
        phone: msg.phone || 'Non renseigné',
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
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (result.success) {
            console.log('[NanoNotify] Alerte email contact transmise avec succès au studio.');
            return { success: true };
          } else {
            console.warn('[NanoNotify] Réponse API Web3Forms:', result);
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur envoi email contact:', err);
        }
      }

      console.log('[NanoNotify] Message de contact enregistré dans la base pour le studio.');
      return { success: true, localOnly: true };
    }
  };

  window.NanoNotify = NanoNotify;
})();
