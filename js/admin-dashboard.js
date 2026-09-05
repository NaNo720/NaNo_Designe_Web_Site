/**
 * NANO DESIGN DAKAR — ESPACE ADMIN STUDIO & PAIEMENT (PHASE 2 PREVIEW)
 * Gestion des devis, paiements Wave / Orange Money, portfolio et messages
 */

(function () {
  'use strict';

  // Données initiales de démonstration
  const defaultQuotes = [
    {
      id: 'ND-2026-4821',
      date: '02 Septembre 2026',
      serviceLabel: 'Créer un site web — Site vitrine sur-mesure',
      client: {
        name: 'Moussa Diop',
        company: 'Teranga Prestige Hospitality',
        email: 'moussa@terangagroup.sn',
        phone: '+221 77 452 10 98',
        description: 'Refonte complète du site pour notre complexe hôtelier aux Almadies. Design haut de gamme sombre avec système de réservation.',
        budget: '1.5M - 3M FCFA',
        timeline: '1 mois (Standard)'
      },
      status: 'En cours',
      paymentStatus: 'En attente',
      amount: '1 800 000 FCFA'
    },
    {
      id: 'ND-2026-3910',
      date: '28 Août 2026',
      serviceLabel: 'Créer un logo — Avec charte graphique complète',
      client: {
        name: 'Fatou Ndiaye',
        company: 'Maison Baobab Cosmétiques',
        email: 'f.ndiaye@baobab-beauty.com',
        phone: '+221 78 120 44 33',
        description: 'Identité de marque pour notre gamme bio haut de gamme exportée vers Paris et Abidjan. Typographie raffinée et monogramme.',
        budget: '500k - 1.5M FCFA',
        timeline: 'Moins de 2 semaines (Express)'
      },
      status: 'Validé',
      paymentStatus: 'Payé',
      amount: '750 000 FCFA',
      provider: 'Wave'
    },
    {
      id: 'ND-2026-3105',
      date: '20 Août 2026',
      serviceLabel: 'Visuel / Support — Support imprimé (Habillage mural)',
      client: {
        name: 'Ibrahima Sarr',
        company: 'Sénégal Tech Hub',
        email: 'ibrahima@techhub.sn',
        phone: '+221 76 998 00 12',
        description: 'Signalétique intérieure en laiton brossé et habillage mural acoustique pour nos nouveaux bureaux à Diamniadio.',
        budget: '1.5M - 3M FCFA',
        timeline: '2 à 3 mois'
      },
      status: 'Nouveau',
      paymentStatus: 'Non généré',
      amount: 'À définir'
    }
  ];

  const defaultMessages = [
    {
      id: 'MSG-102',
      date: '03 Septembre 2026',
      name: 'Awa Cissé',
      email: 'awa.cisse@artdakar.org',
      phone: '+221 70 811 22 33',
      subject: 'Partenariat Biennale de Dakar 2026',
      message: 'Bonjour l’équipe Nano Design, nous avons adoré vos réalisations signalétiques. Nous aimerions échanger sur l’identité visuelle de notre pavillon.',
      status: 'Non lu'
    },
    {
      id: 'MSG-101',
      date: '30 Août 2026',
      name: 'Cheikh Tidiane Wade',
      email: 'ct.wade@fintech-west.com',
      phone: '+221 77 300 19 82',
      subject: 'Demande de rendez-vous au studio',
      message: 'Nous serions ravis de passer à votre studio aux Almadies ce jeudi pour une présentation de projet fintech mobile.',
      status: 'Traité'
    }
  ];

  // Récupération ou initialisation du LocalStorage
  function getStoredQuotes() {
    try {
      const stored = localStorage.getItem('nano_quotes');
      if (!stored) {
        localStorage.setItem('nano_quotes', JSON.stringify(defaultQuotes));
        return defaultQuotes;
      }
      return JSON.parse(stored);
    } catch (e) {
      return defaultQuotes;
    }
  }

  function saveQuotes(quotes) {
    localStorage.setItem('nano_quotes', JSON.stringify(quotes));
  }

  function getStoredMessages() {
    try {
      const stored = localStorage.getItem('nano_messages');
      if (!stored) {
        localStorage.setItem('nano_messages', JSON.stringify(defaultMessages));
        return defaultMessages;
      }
      return JSON.parse(stored);
    } catch (e) {
      return defaultMessages;
    }
  }

  // Éléments du DOM
  const adminOverlay = document.getElementById('admin-modal-overlay');
  const btnOpenAdmin = document.getElementById('btn-open-admin');
  const btnCloseAdmin = document.getElementById('btn-close-admin');
  const adminTabs = document.querySelectorAll('.admin-tab-btn');
  const adminPanes = document.querySelectorAll('.admin-pane');

  const quotesTableBody = document.getElementById('admin-quotes-tbody');
  const messagesTableBody = document.getElementById('admin-messages-tbody');
  const quotesCountBadge = document.getElementById('admin-quotes-counter');
  const statQuotesTotal = document.getElementById('admin-stat-total-quotes');
  const statPaidTotal = document.getElementById('admin-stat-paid-amount');

  // Modal Simulateur Paiement
  const paymentSimModal = document.getElementById('payment-simulation-modal');
  const paymentBoxAmount = document.getElementById('payment-box-amount');
  const paymentBoxQuoteId = document.getElementById('payment-box-quote-id');
  const paymentBoxClient = document.getElementById('payment-box-client');
  const providerPills = document.querySelectorAll('.provider-pill');
  const btnConfirmSimPayment = document.getElementById('btn-confirm-sim-payment');
  const btnCancelSimPayment = document.getElementById('btn-cancel-sim-payment');

  let currentPayingQuoteId = null;
  let selectedProvider = 'wave';

  // Toggle de la fenêtre Admin
  if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener('click', () => {
      renderQuotesTable();
      renderMessagesTable();
      adminOverlay.classList.add('is-open');
    });
  }

  if (btnCloseAdmin) {
    btnCloseAdmin.addEventListener('click', () => {
      adminOverlay.classList.remove('is-open');
    });
  }

  adminOverlay.addEventListener('click', (e) => {
    if (e.target === adminOverlay) {
      adminOverlay.classList.remove('is-open');
    }
  });

  // Changement d'onglet
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminTabs.forEach(t => t.classList.remove('active'));
      adminPanes.forEach(p => p.classList.remove('is-active'));

      tab.classList.add('active');
      const targetPaneId = tab.getAttribute('data-tab-target');
      const targetPane = document.getElementById(targetPaneId);
      if (targetPane) {
        targetPane.classList.add('is-active');
      }
    });
  });

  // Rendu de la table des devis
  function renderQuotesTable() {
    const quotes = getStoredQuotes();
    if (quotesCountBadge) quotesCountBadge.textContent = quotes.length;
    if (statQuotesTotal) statQuotesTotal.textContent = quotes.length;

    let totalPaid = 0;
    quotesTableBody.innerHTML = '';

    quotes.forEach((q, index) => {
      const tr = document.createElement('tr');

      let statusBadge = '';
      if (q.status === 'Nouveau') {
        statusBadge = `<span class="status-tag status-new">● Nouveau</span>`;
      } else if (q.status === 'Validé') {
        statusBadge = `<span class="status-tag status-paid">✓ Validé</span>`;
      } else {
        statusBadge = `<span class="status-tag status-pending">◐ En cours</span>`;
      }

      let payBadge = '';
      if (q.paymentStatus === 'Payé') {
        payBadge = `<span class="status-tag status-paid">Payé (${q.provider || 'Wave'})</span>`;
        totalPaid += 750000; // estimation démo
      } else if (q.paymentStatus === 'En attente') {
        payBadge = `<span class="status-tag status-pending">En attente</span>`;
      } else {
        payBadge = `<span class="status-tag" style="background:rgba(255,255,255,0.06);color:var(--text-muted);">Non émis</span>`;
      }

      tr.innerHTML = `
        <td><strong style="color:var(--gold-light);">${q.id}</strong><br><small style="color:var(--text-muted);">${q.date}</small></td>
        <td><strong>${q.client.name}</strong><br><small style="color:var(--text-muted);">${q.client.company || 'Direct'} • ${q.client.phone}</small></td>
        <td><span style="color:var(--text-primary);font-weight:500;">${q.serviceLabel}</span><br><small style="color:var(--text-muted);">Budget : ${q.client.budget || 'N/C'}</small></td>
        <td>${statusBadge}</td>
        <td>${payBadge}</td>
        <td>
          <button class="btn-generate-pay" data-quote-id="${q.id}">
            ${q.paymentStatus === 'Payé' ? 'Voir Reçu' : 'Générer Paiement'}
          </button>
        </td>
      `;

      quotesTableBody.appendChild(tr);
    });

    if (statPaidTotal) {
      statPaidTotal.textContent = totalPaid > 0 ? '750 000 FCFA' : '0 FCFA';
    }

    // Écouteurs pour les boutons de paiement
    document.querySelectorAll('.btn-generate-pay').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qId = btn.getAttribute('data-quote-id');
        openPaymentSimulation(qId);
      });
    });
  }

  // Rendu de la table des messages de contact
  function renderMessagesTable() {
    const messages = getStoredMessages();
    if (!messagesTableBody) return;
    messagesTableBody.innerHTML = '';

    messages.forEach(msg => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:var(--gold-light);">${msg.id}</strong><br><small style="color:var(--text-muted);">${msg.date}</small></td>
        <td><strong>${msg.name}</strong><br><small style="color:var(--text-muted);">${msg.phone} • ${msg.email}</small></td>
        <td><strong>${msg.subject}</strong><br><small style="color:var(--text-secondary);">${msg.message.substring(0, 75)}...</small></td>
        <td><span class="status-tag ${msg.status === 'Non lu' ? 'status-new' : 'status-paid'}">${msg.status}</span></td>
      `;
      messagesTableBody.appendChild(tr);
    });
  }

  // Ouverture du simulateur de paiement Wave / OM (Phase 2)
  function openPaymentSimulation(quoteId) {
    const quotes = getStoredQuotes();
    const targetQuote = quotes.find(q => q.id === quoteId);
    if (!targetQuote) return;

    currentPayingQuoteId = quoteId;
    if (paymentBoxQuoteId) paymentBoxQuoteId.textContent = targetQuote.id;
    if (paymentBoxClient) paymentBoxClient.textContent = `${targetQuote.client.name} — ${targetQuote.serviceLabel}`;

    const defaultAmt = targetQuote.amount && targetQuote.amount !== 'À définir' ? targetQuote.amount : '650 000 FCFA';
    if (paymentBoxAmount) paymentBoxAmount.textContent = defaultAmt;

    if (paymentSimModal) {
      paymentSimModal.classList.add('is-open');
    }
  }

  // Sélection du provider de paiement
  providerPills.forEach(pill => {
    pill.addEventListener('click', () => {
      providerPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedProvider = pill.getAttribute('data-provider');
    });
  });

  // Annuler le paiement
  if (btnCancelSimPayment) {
    btnCancelSimPayment.addEventListener('click', () => {
      if (paymentSimModal) paymentSimModal.classList.remove('is-open');
    });
  }

  // Confirmer le paiement simulé
  if (btnConfirmSimPayment) {
    btnConfirmSimPayment.addEventListener('click', () => {
      const quotes = getStoredQuotes();
      const idx = quotes.findIndex(q => q.id === currentPayingQuoteId);

      if (idx !== -1) {
        quotes[idx].status = 'Validé';
        quotes[idx].paymentStatus = 'Payé';
        quotes[idx].provider = selectedProvider === 'wave' ? 'Wave' : (selectedProvider === 'om' ? 'Orange Money' : 'Carte Bancaire');
        quotes[idx].amount = paymentBoxAmount ? paymentBoxAmount.textContent : '650 000 FCFA';
        saveQuotes(quotes);
      }

      if (paymentSimModal) paymentSimModal.classList.remove('is-open');
      renderQuotesTable();

      if (window.showToast) {
        window.showToast(`Paiement de ${paymentBoxAmount.textContent} validé via ${selectedProvider.toUpperCase()} !`);
      }
    });
  }

  // Écouter les nouveaux devis ajoutés par le wizard
  window.addEventListener('nanoQuoteAdded', (e) => {
    renderQuotesTable();
  });

  // Initialisation au chargement
  renderQuotesTable();
  renderMessagesTable();
})();
