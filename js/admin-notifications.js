// ==============================================================================
// SYSTÈME DE NOTIFICATIONS EN DIRECT — NANO DESIGN STUDIO DAKAR
// ==============================================================================
// Gère les carillons audio haute fidélité (Web Audio API synthétisé),
// les notifications natives de bureau (Push Notification API) et les alertes visuelles.
// ==============================================================================

(function() {
  'use strict';

  let soundEnabled = localStorage.getItem('nano_sound_notif') !== 'false';
  let pushEnabled = localStorage.getItem('nano_push_notif') === 'true';

  // Synthétiseur Audio Web Audio API (aucun fichier MP3 requis, latence zéro)
  function playNotificationChime(type) {
    if (!soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'payment') {
        // Carillon Paiement Reçu : Arpège triomphal et chaleureux (Wave / Orange Money / Carte)
        // C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          gain.gain.setValueAtTime(0.001, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.09 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.7);
        });

      } else if (type === 'message') {
        // Carillon Message Contact : Double pulsation cristalline douce
        // A4 (440Hz) -> C#5 (554Hz)
        const notes = [440, 554.37];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.16, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.6);
        });

      } else {
        // Carillon Nouveau Devis : Cloche haut de gamme F#5 (740Hz) -> B5 (988Hz)
        const notes = [739.99, 987.77];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.11);

          gain.gain.setValueAtTime(0.001, now + idx * 0.11);
          gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.11 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.11);
          osc.stop(now + idx * 0.11 + 0.65);
        });
      }
    } catch (err) {
      console.warn('[NanoNotifications] Impossible d’émettre le son:', err);
    }
  }

  // Notification native système (Windows / Mac / Mobile)
  function showSystemNotification(title, body, tag) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: body || 'Activité sur le studio Nano Design Dakar',
          icon: 'assets/Logo.png',
          badge: 'assets/Logo.png',
          tag: tag || 'nano-notification',
          renotify: true
        });

        notif.onclick = function() {
          window.focus();
          this.close();
        };
      } catch (err) {
        console.warn('[NanoNotifications] Erreur push notification:', err);
      }
    }
  }

  // Demande d'autorisation pour les notifications système
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert("Votre navigateur ne supporte pas les notifications de bureau.");
      return false;
    }

    if (Notification.permission === 'granted') {
      pushEnabled = true;
      localStorage.setItem('nano_push_notif', 'true');
      return true;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      pushEnabled = true;
      localStorage.setItem('nano_push_notif', 'true');
      showSystemNotification(
        '✦ Nano Design Studio Dakar',
        'Les alertes de devis et paiements sont désormais actives sur votre appareil !'
      );
      return true;
    } else {
      pushEnabled = false;
      localStorage.setItem('nano_push_notif', 'false');
      return false;
    }
  }

  // API publique du gestionnaire d'alertes
  const NanoAlert = {
    playChime(type) {
      playNotificationChime(type);
    },

    notifyQuote(quote) {
      const clientName = (quote.client && quote.client.name) || quote.client_name || 'Nouveau client';
      const service = quote.serviceLabel || quote.service_label || 'Prestation sur-mesure';
      const ref = quote.id || 'Nouveau';

      // 1. Carillon sonore
      playNotificationChime('quote');

      // 2. Notification Push Native
      showSystemNotification(
        `✦ Nouveau Devis (${ref})`,
        `${clientName} • ${service}`,
        `quote-${ref}`
      );
    },

    notifyPayment(quote) {
      const clientName = (quote.client && quote.client.name) || quote.client_name || 'Client';
      const amount = quote.amount || 'Montant reçu';
      const provider = quote.provider || 'Wave / OM';

      // 1. Carillon paiement
      playNotificationChime('payment');

      // 2. Notification Push Native
      showSystemNotification(
        `🟢 Paiement Confirmé : ${amount}`,
        `${clientName} a réglé via ${provider}. Facture acquittée générée.`,
        `payment-${quote.id}`
      );
    },

    notifyMessage(msg) {
      const sender = msg.name || 'Visiteur';
      const subject = msg.subject || 'Nouveau message';

      // 1. Carillon message
      playNotificationChime('message');

      // 2. Notification Push Native
      showSystemNotification(
        `✉️ Nouveau Message : ${sender}`,
        subject,
        `msg-${msg.id}`
      );
    },

    toggleSound() {
      soundEnabled = !soundEnabled;
      localStorage.setItem('nano_sound_notif', soundEnabled ? 'true' : 'false');
      if (soundEnabled) playNotificationChime('quote');
      return soundEnabled;
    },

    isSoundEnabled() {
      return soundEnabled;
    },

    async requestPush() {
      return await requestNotificationPermission();
    },

    isPushEnabled() {
      return 'Notification' in window && Notification.permission === 'granted';
    }
  };

  window.NanoAlert = NanoAlert;
})();
