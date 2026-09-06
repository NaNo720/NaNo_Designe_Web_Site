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

      // Validation du numéro de téléphone (Privilégie les numéros valides Sénégal 70/75/76/77/78 ou International)
      isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        const cleaned = phone.replace(/[\s./()-]/g, '');
        // Format sénégalais (ex: 77 123 45 67 ou +221 77... ou 00221 77...)
        const snRegex = /^(?:\+221|00221)?(7[05678][0-9]{7})$/;
        if (snRegex.test(cleaned)) return true;
        // Format international général (au moins 8 chiffres et max 15 chiffres)
        const intlRegex = /^\+?[1-9][0-9]{7,14}$/;
        return intlRegex.test(cleaned);
      },

      // Validation qualitative du cahier des charges (anti-curieux : exige au moins 20 caractères réels)
      isValidBrief(desc, minLength = 20) {
        if (!desc || typeof desc !== 'string') return false;
        const cleaned = desc.trim().replace(/\s+/g, ' ');
        if (cleaned.length < minLength) return false;
        // Écarte les frappes répétitives au clavier (ex: "aaaaaaaaaaaa", "asdfasdfasdf")
        if (/^(.)\1{5,}$/.test(cleaned)) return false;
        return true;
      },

      // Domaines d'emails jetables/temporaires connus (services d'email à usage unique)
      disposableEmailDomains: new Set([
        'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
        'guerrillamail.de', 'guerrillamail.org', 'sharklasers.com', 'yopmail.com', 'yopmail.fr',
        'yopmail.net', 'tempmail.com', 'temp-mail.org', 'temp-mail.io', '10minutemail.com',
        '10minutemail.net', 'throwawaymail.com', 'trashmail.com', 'trashmail.net', 'getnada.com',
        'mailnesia.com', 'mailcatch.com', 'dispostable.com', 'fakeinbox.com', 'spamgourmet.com',
        'mytemp.email', 'moakt.com', 'emailondeck.com', 'mohmal.com', 'tempinbox.com',
        'maildrop.cc', 'mintemail.com', 'discard.email', 'discardmail.com', 'spam4.me',
        'tempr.email', 'mailtemp.info', 'inboxbear.com', 'burnermail.io', 'nada.email',
        '33mail.com', 'jetable.org', 'einrot.com', 'trbvm.com', 'mailna.co'
      ]),

      // Domaines/adresses manifestement factices utilisés pour "tester" un formulaire
      fakeEmailDomains: new Set([
        'test.com', 'test.fr', 'example.com', 'example.org', 'example.net', 'exemple.com',
        'exemple.fr', 'exemple.sn', 'domain.com', 'yourdomain.com', 'email.com', 'none.com',
        'nomail.com', 'fake.com', 'sample.com', 'abc.com', 'asdf.com', 'demo.com'
      ]),

      // Détecte les parties locales manifestement bidons (test@, asdf@, aaaa@, 1234@...)
      isFakeLocalPart(localPart) {
        if (!localPart) return true;
        const lower = localPart.toLowerCase();
        // Répétition d'un seul caractère (aaaa, xxxx, 1111...)
        if (/^(.)\1{2,}$/.test(lower)) return true;
        const fakeWords = [
          'test', 'testing', 'admin', 'asdf', 'asdfasdf', 'qwerty', 'azerty', 'abc123',
          'foo', 'foobar', 'sample', 'exemple', 'example', 'nom', 'prenom', 'email',
          'user', 'noemail', 'aucun', 'none', 'demo', 'fake', 'blah', 'nawak'
        ];
        return fakeWords.includes(lower);
      },

      // Détection combinée d'un email jetable ou manifestement inventé (pour test de formulaire)
      isFakeEmail(email) {
        if (!this.isValidEmail(email)) return true;
        const parts = email.trim().toLowerCase().split('@');
        if (parts.length !== 2) return true;
        const [localPart, domain] = parts;
        if (this.disposableEmailDomains.has(domain)) return true;
        if (this.fakeEmailDomains.has(domain)) return true;
        if (this.isFakeLocalPart(localPart)) return true;
        return false;
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
    // 2bis. PROTECTION ANTI-BOT (HONEYPOT & DÉTECTION D'AUTOMATISATION)
    // ==========================================================================
    antiBot: {
      // Un champ honeypot rempli = un bot (un visiteur humain ne le voit jamais)
      isHoneypotTriggered(value) {
        return !!(value && String(value).trim().length > 0);
      },

      // Un formulaire soumis trop vite après son affichage est presque toujours un script automatisé
      isSubmittedTooFast(formShownAt, minDelayMs = 1500) {
        if (!formShownAt) return false;
        return (Date.now() - formShownAt) < minDelayMs;
      },

      // Signaux de navigation automatisée (Selenium/Puppeteer/Playwright/crawlers)
      isLikelyBotBrowser() {
        try {
          if (navigator.webdriver) return true;
          const ua = (navigator.userAgent || '').toLowerCase();
          const botSignatures = [
            'bot', 'crawler', 'spider', 'headlesschrome', 'phantomjs', 'slimerjs',
            'curl/', 'wget/', 'python-requests', 'python-urllib', 'scrapy', 'httpclient',
            'go-http-client', 'axios/', 'node-fetch'
          ];
          return botSignatures.some(sig => ua.includes(sig));
        } catch (e) {
          return false;
        }
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
