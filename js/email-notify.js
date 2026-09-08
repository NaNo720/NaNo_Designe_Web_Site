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
  const STUDIO_EMAIL = 'nanodesign221@gmail.com';

  // Clé d'accès API Web3Forms (configurable dans localStorage ou window.SUPABASE_CONFIG)
  function getAccessKey() {
    return (
      (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.emailKey) ||
      localStorage.getItem('nano_web3forms_key') ||
      '0777b34c-a98d-4e14-8bad-7ef0b12646f4'
    );
  }

  // Configuration EmailJS pour l'envoi d'accusé de réception direct au client
  function getEmailJsConfig() {
    const defaultCfg = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.emailJs) || {};
    return {
      serviceId: localStorage.getItem('nano_emailjs_service') || defaultCfg.serviceId || 'service_yz4recq',
      templateId: localStorage.getItem('nano_emailjs_template') || defaultCfg.templateId || 'template_so07v9n',
      publicKey: localStorage.getItem('nano_emailjs_public_key') || defaultCfg.publicKey || 'N9a3cGbbjXljXvnW_'
    };
  }

  const NanoNotify = {
    // --------------------------------------------------------------------------
    // 1. GESTION DES NOTIFICATIONS DEVIS (STUDIO + CLIENT)
    // --------------------------------------------------------------------------
    async sendQuoteEmail(quote) {
      // 1.1 Alerte complète envoyée au studio Nano Design
      const studioPromise = this.sendStudioQuoteAlert(quote);

      // 1.2 Accusé de réception officiel envoyé directement dans la boîte mail du client
      const clientPromise = this.sendClientQuoteReceipt(quote);

      const [studioRes, clientRes] = await Promise.allSettled([studioPromise, clientPromise]);
      return {
        studio: studioRes.status === 'fulfilled' ? studioRes.value : null,
        client: clientRes.status === 'fulfilled' ? clientRes.value : null
      };
    },

    // 1.1 Alerte détaillée au studio via Web3Forms
    async sendStudioQuoteAlert(quote) {
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

    // 1.2 Accusé de réception envoyé directement à l'adresse du client via EmailJS
    async sendClientQuoteReceipt(quote) {
      const client = quote.client || {};
      if (!client.email) {
        console.log('[NanoNotify] Aucun email client renseigné pour l\'accusé de réception.');
        return { success: false, reason: 'no_email' };
      }

      const emailJs = getEmailJsConfig();
      if (!emailJs.serviceId || !emailJs.templateId || !emailJs.publicKey) {
        console.warn('[NanoNotify] Configuration EmailJS incomplète.');
        return { success: false, reason: 'missing_config' };
      }

      const templateParams = {
        to_name: client.name || 'Client',
        name: client.name || 'Client',
        to_email: client.email,
        email: client.email,
        client_email: client.email,
        user_email: client.email,
        reply_to: STUDIO_EMAIL,
        from_name: 'Nano Design Studio Dakar',
        quote_id: quote.id,
        service_label: quote.serviceLabel || 'Projet de Design',
        budget: client.budget || 'Non spécifié',
        timeline: client.timeline || 'Non spécifié',
        description: client.description || 'Projet confié à l\'équipe Nano Design.'
      };

      try {
        // Priorité 1 : Utiliser le SDK officiel EmailJS chargé dans la page
        if (window.emailjs && typeof window.emailjs.send === 'function') {
          const res = await window.emailjs.send(emailJs.serviceId, emailJs.templateId, templateParams, emailJs.publicKey);
          console.log('[NanoNotify] Accusé de réception client envoyé via EmailJS SDK:', res);
          return { success: true, sdk: true };
        }

        // Priorité 2 : Fallback via l'API REST EmailJS
        const payload = {
          service_id: emailJs.serviceId,
          template_id: emailJs.templateId,
          user_id: emailJs.publicKey,
          template_params: templateParams
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log('[NanoNotify] Accusé de réception devis transmis au client via EmailJS REST avec succès.');
          return { success: true };
        } else {
          const errData = await response.text();
          console.warn('[NanoNotify] Réponse EmailJS client:', response.status, errData);
          return { success: false, status: response.status, error: errData };
        }
      } catch (err) {
        console.warn('[NanoNotify] Erreur communication EmailJS:', err);
        return { success: false, error: err.message };
      }
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
