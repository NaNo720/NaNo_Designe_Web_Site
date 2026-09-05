// ==============================================================================
// GESTIONNAIRE D'ENVOI D'ALERTES EMAIL — NANO DESIGN STUDIO DAKAR
// ==============================================================================
// Transmet automatiquement les devis et messages par email à l'équipe Nano Design
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
    // Envoi automatique d'une alerte lors de la soumission d'un devis
    async sendQuoteEmail(quote) {
      const client = quote.client || {};
      const accessKey = getAccessKey();

      const payload = {
        subject: `[Devis Nano Design] ${quote.id} — ${client.name || 'Client'} (${quote.serviceLabel || 'Projet'})`,
        from_name: `${client.name || 'Client'} via Nano Design`,
        to_email: STUDIO_EMAIL,
        message: `
NOUVELLE DEMANDE DE DEVIS ENREGISTRÉE SUR LE SITE NANO DESIGN DAKAR
==================================================================

• Référence Devis : ${quote.id}
• Date : ${quote.date}
• Prestation : ${quote.serviceLabel}

COORDONNÉES CLIENT :
--------------------
• Nom & Prénom : ${client.name || 'Non renseigné'}
• Entreprise : ${client.company || 'Non renseignée'}
• Téléphone : ${client.phone || 'Non renseigné'}
• Email : ${client.email || 'Non renseigné'}

CAHIER DES CHARGES DU PROJET :
------------------------------
• Budget estimatif : ${client.budget || 'Non spécifié'}
• Délai souhaité : ${client.timeline || 'Non spécifié'}
• Description du besoin :
${client.description || 'Aucune description fournie.'}

LIEN DIRECT TABLEAU DE BORD :
https://nanodesign.sn/admin.html
        `.trim()
      };

      // Si une clé Web3Forms est fournie, envoi HTTP direct
      if (accessKey) {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ access_key: accessKey, ...payload })
          });
          const result = await response.json();
          if (result.success) {
            console.log('[NanoNotify] Alerte email devis transmise avec succès.');
            return { success: true };
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur envoi email API:', err);
        }
      }

      // En mode fallback / sans clé externe : journalisation propre
      console.log('[NanoNotify] Devis sécurisé dans Supabase et notification préparée pour', STUDIO_EMAIL);
      return { success: true, localOnly: true };
    },

    // Envoi automatique d'une alerte lors d'un message de contact
    async sendMessageEmail(msg) {
      const accessKey = getAccessKey();

      const payload = {
        subject: `[Contact Nano Design] ${msg.subject || 'Nouveau message'} — ${msg.name}`,
        from_name: `${msg.name} via Nano Design`,
        to_email: STUDIO_EMAIL,
        message: `
NOUVEAU MESSAGE REÇU DEPUIS LA PAGE CONTACT
===========================================

• Réf Message : ${msg.id}
• Date : ${msg.date}
• Expéditeur : ${msg.name}
• Email : ${msg.email}
• Téléphone : ${msg.phone || 'Non renseigné'}
• Sujet : ${msg.subject || 'Contact direct'}

MESSAGE :
---------
${msg.message}
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
            console.log('[NanoNotify] Alerte email contact transmise avec succès.');
            return { success: true };
          }
        } catch (err) {
          console.warn('[NanoNotify] Erreur envoi email contact:', err);
        }
      }

      console.log('[NanoNotify] Message de contact sécurisé dans Supabase pour', STUDIO_EMAIL);
      return { success: true, localOnly: true };
    }
  };

  window.NanoNotify = NanoNotify;
})();
