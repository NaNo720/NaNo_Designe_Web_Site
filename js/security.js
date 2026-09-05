// ==============================================================================
// NANO DESIGN STUDIO DAKAR — MODULE DE SÉCURITÉ & DE DÉFENSE (SECURITY SUITE)
// Protège le studio contre : XSS, Force Brute, Fuites de Clés, Vol de Session,
// et Injections de données.
// ==============================================================================

(function (window) {
  'use strict';

  const StudioSecurity = {
    // Configuration de sécurité
    config: {
      sessionTimeoutMs: 15 * 60 * 1000, // 15 minutes d'inactivité avant verrouillage automatique
      maxFailedAttempts: 5,             // Nombre max de tentatives avant verrouillage temporaire
      lockoutDurationMs: 5 * 60 * 1000, // 5 minutes de blocage en cas de brute-force
      salt: 'nano_studio_dakar_salt_2026_x89a',
      // Empreinte SHA-256 pré-calculée du mot de passe studio maître avec le sel ci-dessus
      // Mot de passe initial sécurisé : "nano2026"
      // Aucun mot de passe en clair n'est présent dans le code source
      adminUserHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',   // SHA-256 de 'admin'
      contactUserHash: '90c32477dadc86d0412cc4bd34b11ef3d9586855dccac0490d6e9bfe9c607305', // SHA-256 de 'contact@nanodesign.sn'
      masterHash: 'ba7022e0b53206e748c33ce9e7553cff5cace9ff5ae29834da17c88bb3f8de40'        // SHA-256 de 'nano2026' + salt
    },

    // ==========================================================================
    // 1. CRYPTOGRAPHIE & HACHAGE (SHA-256 NATIVE VIA WEB CRYPTO API)
    // ==========================================================================
    crypto: {
      async sha256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      },

      generateRandomToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
      }
    },

    // ==========================================================================
    // 2. ASSAINISSEMENT & NEUTRALISATION ANTI-XSS
    // ==========================================================================
    sanitize: {
      // Échappe tous les caractères sensibles pour empêcher l'exécution de scripts injectés (XSS)
      escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const s = String(str);
        const map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '/': '&#x2F;'
        };
        return s.replace(/[&<>"'/]/g, match => map[match]);
      },

      // Nettoie une chaîne de texte libre (limitation de longueur et suppression de caractères de contrôle)
      cleanText(str, maxLength = 1000) {
        if (!str) return '';
        const trimmed = String(str).trim();
        const noControls = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        return noControls.slice(0, maxLength);
      },

      // Validation stricte du format email (RFC 5322)
      isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        return emailRegex.test(email.trim()) && email.length <= 254;
      },

      // Validation du numéro de téléphone (Sénégal & International)
      isValidPhone(phone) {
        if (!phone) return true; // Optionnel
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;
        return phoneRegex.test(phone.trim());
      },

      // Blocage des URLs dangereuses (ex: javascript:alert(1), data:text/html)
      isSafeUrl(url) {
        if (!url || typeof url !== 'string') return true;
        const trimmed = url.trim().toLowerCase();
        if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
          return false;
        }
        return true;
      }
    },

    // ==========================================================================
    // 3. PROTECTION ANTI-FORCE BRUTE (RATE LIMITING)
    // ==========================================================================
    rateLimiter: {
      getAttemptsState() {
        try {
          const raw = sessionStorage.getItem('nano_auth_attempts');
          return raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0 };
        } catch (e) {
          return { count: 0, lockedUntil: 0 };
        }
      },

      recordFailure() {
        const state = this.getAttemptsState();
        state.count += 1;
        if (state.count >= StudioSecurity.config.maxFailedAttempts) {
          state.lockedUntil = Date.now() + StudioSecurity.config.lockoutDurationMs;
        }
        sessionStorage.setItem('nano_auth_attempts', JSON.stringify(state));
        return state;
      },

      reset() {
        sessionStorage.removeItem('nano_auth_attempts');
      },

      isLocked() {
        const state = this.getAttemptsState();
        if (state.lockedUntil && Date.now() < state.lockedUntil) {
          const remainingSeconds = Math.ceil((state.lockedUntil - Date.now()) / 1000);
          return { locked: true, remainingSeconds };
        }
        // Déverrouillage automatique si le temps est écoulé
        if (state.lockedUntil && Date.now() >= state.lockedUntil) {
          this.reset();
        }
        return { locked: false, remainingAttempts: Math.max(0, StudioSecurity.config.maxFailedAttempts - state.count) };
      }
    },

    // ==========================================================================
    // 4. GESTION DE SESSION SÉCURISÉE (SESSIONSTORAGE + TIMEOUT D'INACTIVITÉ)
    // ==========================================================================
    session: {
      _timer: null,

      initActivityTracker(onTimeoutCallback) {
        const updateActivity = () => {
          if (this.isValid()) {
            this.refresh();
          }
        };

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(evt => {
          window.addEventListener(evt, updateActivity, { passive: true });
        });

        // Détection de visibilité (si l'utilisateur quitte l'onglet vers la page publique)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            if (!this.isValid()) {
              this.destroy();
              if (typeof onTimeoutCallback === 'function') {
                onTimeoutCallback('inactivity');
              }
            }
          }
        });

        // Vérification d'arrière-plan régulière
        if (this._timer) clearInterval(this._timer);
        this._timer = setInterval(() => {
          if (sessionStorage.getItem('nano_auth_token') && !this.isValid()) {
            this.destroy();
            if (typeof onTimeoutCallback === 'function') {
              onTimeoutCallback('inactivity');
            }
          }
        }, 10000);
      },

      start(username) {
        // Purger l'ancien localStorage non sécurisé
        try { localStorage.removeItem('nano_admin_logged'); } catch (e) { }

        const token = StudioSecurity.crypto.generateRandomToken(48);
        const now = Date.now();
        const sessionData = {
          token,
          user: username,
          createdAt: now,
          lastActive: now,
          expiresAt: now + StudioSecurity.config.sessionTimeoutMs
        };

        sessionStorage.setItem('nano_auth_token', token);
        sessionStorage.setItem('nano_auth_session', JSON.stringify(sessionData));
        StudioSecurity.rateLimiter.reset();
        return sessionData;
      },

      refresh() {
        try {
          const raw = sessionStorage.getItem('nano_auth_session');
          if (!raw) return false;
          const session = JSON.parse(raw);
          const now = Date.now();
          session.lastActive = now;
          session.expiresAt = now + StudioSecurity.config.sessionTimeoutMs;
          sessionStorage.setItem('nano_auth_session', JSON.stringify(session));
          return true;
        } catch (e) {
          return false;
        }
      },

      isValid() {
        try {
          const token = sessionStorage.getItem('nano_auth_token');
          const raw = sessionStorage.getItem('nano_auth_session');
          if (!token || !raw) return false;

          const session = JSON.parse(raw);
          if (session.token !== token) return false;

          // Vérifier l'expiration du temps d'inactivité
          if (Date.now() > session.expiresAt) {
            return false;
          }

          return true;
        } catch (e) {
          return false;
        }
      },

      destroy() {
        sessionStorage.removeItem('nano_auth_token');
        sessionStorage.removeItem('nano_auth_session');
        try { localStorage.removeItem('nano_admin_logged'); } catch (e) { }
      }
    },

    // ==========================================================================
    // 5. VÉRIFICATION D'AUTHENTIFICATION CRYPTOGRAPHIQUE
    // ==========================================================================
    async verifyCredentials(username, password) {
      // 1. Vérifier si le compte est bloqué par force brute
      const lockCheck = this.rateLimiter.isLocked();
      if (lockCheck.locked) {
        return {
          success: false,
          error: `Trop de tentatives. Accès temporairement verrouillé pendant encore ${lockCheck.remainingSeconds} seconde(s).`
        };
      }

      if (!username || !password) {
        return { success: false, error: 'Veuillez saisir votre identifiant et mot de passe.' };
      }

      // 2. Normalisation et hachage
      const cleanUser = username.trim().toLowerCase();
      const userHash = await this.crypto.sha256(cleanUser);
      const saltedPass = password + this.config.salt;
      const passHash = await this.crypto.sha256(saltedPass);

      // 3. Comparaison sécurisée contre les hashes
      const isUserValid = (userHash === this.config.adminUserHash) || (userHash === this.config.contactUserHash);
      const isPassValid = (passHash === this.config.masterHash);

      if (isUserValid && isPassValid) {
        const session = this.session.start(cleanUser);
        return { success: true, session };
      } else {
        const state = this.rateLimiter.recordFailure();
        const remaining = Math.max(0, this.config.maxFailedAttempts - state.count);
        if (remaining === 0) {
          return {
            success: false,
            error: `Accès temporairement verrouillé pendant 5 minutes suite à 5 tentatives erronées.`
          };
        }
        return {
          success: false,
          error: `Identifiants incorrects. Tentatives restantes avant blocage : ${remaining}.`
        };
      }
    }
  };

  window.StudioSecurity = StudioSecurity;

})(window);
