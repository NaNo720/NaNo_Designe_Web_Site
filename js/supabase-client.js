// ==============================================================================
// ADAPTATEUR SUPABASE & STOCKAGE HYBRIDE — NANO DESIGN STUDIO
// ==============================================================================
// Gère la persistance en base de données PostgreSQL temps réel avec bascule
// transparente et sécurisée vers le stockage local en cas d'absence de clés.
// ==============================================================================

(function () {
  'use strict';

  let client = null;

  function initClient() {
    const config = window.SUPABASE_CONFIG || {};
    const url = (config.url || '').trim();
    const key = (config.anonKey || '').trim();

    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(url, key);
        return client;
      } catch (err) {
        console.warn('[NanoDB] Erreur d’initialisation Supabase, utilisation du cache local:', err);
        client = null;
      }
    }
    return null;
  }

  // Initialisation immédiate ou différée
  initClient();

  // Helper pour mapper un devis de l'application vers la table Supabase
  function quoteToDb(q) {
    const clientData = q.client || {};
    return {
      id: q.id,
      date: q.date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      service_category: q.serviceCategory || null,
      service_variant: q.serviceVariant || null,
      service_label: q.serviceLabel || 'Prestation sur-mesure',
      client_name: clientData.name || q.client_name || 'Client',
      client_company: clientData.company || q.client_company || '',
      client_phone: clientData.phone || q.client_phone || '',
      client_email: clientData.email || q.client_email || '',
      client_description: clientData.description || q.client_description || '',
      client_budget: clientData.budget || q.client_budget || 'Non spécifié',
      client_timeline: clientData.timeline || q.client_timeline || 'Non spécifié',
      status: q.status || 'Nouveau',
      payment_status: q.paymentStatus || q.payment_status || 'Non généré',
      amount: q.amount || 'Sur devis',
      provider: q.provider || null,
      txn: q.txn || null,
      paid_date: q.paidDate || q.paid_date || null
    };
  }

  // Helper pour mapper une ligne Supabase vers l'objet Devis de l'application
  function dbToQuote(row) {
    return {
      id: row.id,
      date: row.date,
      serviceCategory: row.service_category,
      serviceVariant: row.service_variant,
      serviceLabel: row.service_label,
      client: {
        name: row.client_name,
        company: row.client_company,
        phone: row.client_phone,
        email: row.client_email,
        description: row.client_description,
        budget: row.client_budget,
        timeline: row.client_timeline
      },
      status: row.status,
      paymentStatus: row.payment_status,
      amount: row.amount,
      provider: row.provider,
      txn: row.txn,
      paidDate: row.paid_date
    };
  }

  const NanoDB = {
    // Statut de connexion
    isConfigured() {
      const cfg = window.SUPABASE_CONFIG || {};
      return Boolean(cfg.url && cfg.anonKey && cfg.url.includes('supabase.co'));
    },

    getClient() {
      if (!client) initClient();
      return client;
    },

    // Sauvegarde des identifiants depuis l'interface admin
    setCredentials(url, anonKey) {
      if (url) localStorage.setItem('nano_supabase_url', url.trim());
      if (anonKey) localStorage.setItem('nano_supabase_key', anonKey.trim());
      if (window.SUPABASE_CONFIG) {
        window.SUPABASE_CONFIG.url = (url || '').trim();
        window.SUPABASE_CONFIG.anonKey = (anonKey || '').trim();
      }
      return initClient();
    },

    // ========================================================================
    // GESTION DES DEVIS (QUOTES)
    // ========================================================================
    async getQuotes() {
      const cli = this.getClient();
      if (cli) {
        try {
          const { data, error } = await cli
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            const mapped = data.map(dbToQuote);
            // Sauvegarder dans le cache local
            localStorage.setItem('nano_quotes', JSON.stringify(mapped));
            return mapped;
          }
          console.warn('[NanoDB] Erreur lecture quotes Supabase, repli local:', error);
        } catch (e) {
          console.warn('[NanoDB] Exception Supabase:', e);
        }
      }

      // Repli LocalStorage
      try {
        return JSON.parse(localStorage.getItem('nano_quotes') || '[]');
      } catch (err) {
        return [];
      }
    },

    async getQuoteById(id) {
      if (!id) return null;
      const cli = this.getClient();
      if (cli) {
        try {
          const { data, error } = await cli
            .from('quotes')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            return dbToQuote(data);
          }
        } catch (e) {
          console.warn('[NanoDB] Erreur getQuoteById Supabase:', e);
        }
      }

      // Repli local
      const localQuotes = await this.getQuotes();
      return localQuotes.find(q => q.id === id) || null;
    },

    async saveQuote(quoteObj) {
      if (!quoteObj.id) {
        quoteObj.id = `ND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // 1. Sauvegarde locale immédiate
      try {
        const existing = JSON.parse(localStorage.getItem('nano_quotes') || '[]');
        const idx = existing.findIndex(q => q.id === quoteObj.id);
        if (idx >= 0) existing[idx] = quoteObj;
        else existing.unshift(quoteObj);
        localStorage.setItem('nano_quotes', JSON.stringify(existing));
      } catch (e) {
        console.warn(e);
      }

      // 2. Envoi asynchrone à Supabase
      const cli = this.getClient();
      if (cli) {
        try {
          const dbRow = quoteToDb(quoteObj);
          const { data, error } = await cli
            .from('quotes')
            .upsert(dbRow, { onConflict: 'id' })
            .select();

          if (error) {
            console.error('[NanoDB] Erreur enregistrement devis Supabase:', error);
          } else {
            console.log('[NanoDB] Devis synchronisé sur Supabase:', quoteObj.id);
          }
        } catch (e) {
          console.error('[NanoDB] Exception saveQuote Supabase:', e);
        }
      }

      window.dispatchEvent(new CustomEvent('nanoQuoteAdded', { detail: quoteObj }));
      return quoteObj;
    },

    async updateQuote(quoteId, updates) {
      if (!quoteId) return null;

      // 1. Mise à jour cache local
      try {
        const existing = JSON.parse(localStorage.getItem('nano_quotes') || '[]');
        const idx = existing.findIndex(q => q.id === quoteId);
        if (idx !== -1) {
          existing[idx] = { ...existing[idx], ...updates };
          localStorage.setItem('nano_quotes', JSON.stringify(existing));
        }
      } catch (e) { }

      // 2. Mise à jour Supabase
      const cli = this.getClient();
      if (cli) {
        try {
          const dbUpdates = {};
          if (updates.status !== undefined) dbUpdates.status = updates.status;
          if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
          if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
          if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
          if (updates.txn !== undefined) dbUpdates.txn = updates.txn;
          if (updates.paidDate !== undefined) dbUpdates.paid_date = updates.paidDate;

          const { error } = await cli
            .from('quotes')
            .update(dbUpdates)
            .eq('id', quoteId);

          if (error) {
            console.error('[NanoDB] Erreur mise à jour devis Supabase:', error);
          }
        } catch (e) {
          console.error('[NanoDB] Exception updateQuote Supabase:', e);
        }
      }

      window.dispatchEvent(new CustomEvent('nanoQuoteUpdated', { detail: { id: quoteId, updates } }));
      return true;
    },

    async deleteQuote(quoteId) {
      try {
        const existing = JSON.parse(localStorage.getItem('nano_quotes') || '[]');
        const filtered = existing.filter(q => q.id !== quoteId);
        localStorage.setItem('nano_quotes', JSON.stringify(filtered));
      } catch (e) { }

      const cli = this.getClient();
      if (cli) {
        try {
          await cli.from('quotes').delete().eq('id', quoteId);
        } catch (e) { }
      }
      return true;
    },

    // ========================================================================
    // GESTION DES MESSAGES DE CONTACT
    // ========================================================================
    async getMessages() {
      const cli = this.getClient();
      if (cli) {
        try {
          const { data, error } = await cli
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            localStorage.setItem('nano_messages', JSON.stringify(data));
            return data;
          }
        } catch (e) { }
      }

      try {
        return JSON.parse(localStorage.getItem('nano_messages') || '[]');
      } catch (err) {
        return [];
      }
    },

    async saveMessage(msgObj) {
      if (!msgObj.id) {
        msgObj.id = `MSG-${Math.floor(100 + Math.random() * 900)}`;
      }

      // Cache local
      try {
        const msgs = JSON.parse(localStorage.getItem('nano_messages') || '[]');
        msgs.unshift(msgObj);
        localStorage.setItem('nano_messages', JSON.stringify(msgs));
      } catch (e) { }

      // Supabase
      const cli = this.getClient();
      if (cli) {
        try {
          await cli.from('messages').upsert({
            id: msgObj.id,
            date: msgObj.date,
            name: msgObj.name,
            email: msgObj.email,
            phone: msgObj.phone || '',
            subject: msgObj.subject || 'Message formulaire contact',
            message: msgObj.message,
            status: msgObj.status || 'Non lu'
          }, { onConflict: 'id' });
          console.log('[NanoDB] Message synchronisé sur Supabase:', msgObj.id);
        } catch (e) {
          console.warn('[NanoDB] Exception saveMessage:', e);
        }
      }

      window.dispatchEvent(new CustomEvent('nanoMessageAdded', { detail: msgObj }));
      return msgObj;
    },

    async updateMessage(msgId, updates) {
      try {
        const msgs = JSON.parse(localStorage.getItem('nano_messages') || '[]');
        const idx = msgs.findIndex(m => m.id === msgId);
        if (idx !== -1) {
          msgs[idx] = { ...msgs[idx], ...updates };
          localStorage.setItem('nano_messages', JSON.stringify(msgs));
        }
      } catch (e) { }

      const cli = this.getClient();
      if (cli) {
        try {
          await cli.from('messages').update(updates).eq('id', msgId);
        } catch (e) { }
      }
      return true;
    },

    // ========================================================================
    // ABONNEMENT TEMPS RÉEL (SUPABASE REALTIME)
    // ========================================================================
    subscribeQuotes(callback) {
      const cli = this.getClient();
      if (!cli) return null;

      try {
        return cli
          .channel('nano_quotes_channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, (payload) => {
            console.log('[NanoDB Realtime] Changement détecté sur les devis:', payload.eventType);
            if (typeof callback === 'function') {
              callback(payload);
            }
          })
          .subscribe();
      } catch (err) {
        console.warn('[NanoDB Realtime] Non disponible:', err);
        return null;
      }
    },

    subscribeMessages(callback) {
      const cli = this.getClient();
      if (!cli) return null;

      try {
        return cli
          .channel('nano_messages_channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
            console.log('[NanoDB Realtime] Nouveau message détecté:', payload.eventType);
            if (typeof callback === 'function') {
              callback(payload);
            }
          })
          .subscribe();
      } catch (err) {
        return null;
      }
    }
  };

  // Exposition globale
  window.nanoDB = NanoDB;
})();
