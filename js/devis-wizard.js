/**
 * NANO DESIGN DAKAR — TUNNEL DE DEVIS INTERACTIF
 * Gestion du Wizard multi-étapes sans rechargement de page
 */

(function () {
  'use strict';

  // État du devis
  const state = {
    serviceCategory: 'website', // 'logo' | 'website' | 'visual'
    serviceVariant: 'ecommerce', // 'charte' | 'sans_charte' | 'vitrine' | 'ecommerce' | 'print' | 'web'
    serviceLabel: 'Créer un site web — Site e-commerce',
    client: {
      name: '',
      company: '',
      email: '',
      phone: '',
      description: '',
      budget: '500k - 1.5M FCFA',
      timeline: '1 mois (Standard)'
    }
  };

  const labelsMap = {
    'logo': {
      title: 'Créer un logo',
      variants: {
        'charte': 'Avec charte graphique complète',
        'sans_charte': 'Sans charte graphique (logo seul)'
      }
    },
    'website': {
      title: 'Créer un site web',
      variants: {
        'vitrine': 'Site vitrine sur-mesure',
        'ecommerce': 'Site e-commerce performant'
      }
    },
    'visual': {
      title: 'Visuel / Support',
      variants: {
        'print': 'Support imprimé (Plaquette, catalogue, habillage)',
        'web': 'Support web (Bannières, réseaux sociaux, pub)'
      }
    }
  };

  // Éléments du DOM
  const stepNodes = document.querySelectorAll('.wizard-step-node');
  const paneStep1 = document.getElementById('wizard-pane-1');
  const paneStep2 = document.getElementById('wizard-pane-2');
  const paneStep3 = document.getElementById('wizard-pane-3');

  const mainCards = document.querySelectorAll('.service-choice-card');
  const subContainers = {
    'logo': document.getElementById('sub-options-logo'),
    'website': document.getElementById('sub-options-website'),
    'visual': document.getElementById('sub-options-visual')
  };

  const btnStep1Next = document.getElementById('btn-step1-next');
  const btnStep2Back = document.getElementById('btn-step2-back');
  const btnModifySelection = document.getElementById('btn-modify-selection');
  const summarySelectionText = document.getElementById('summary-selection-text');

  const devisForm = document.getElementById('devis-step2-form');
  const budgetChips = document.querySelectorAll('.budget-chip');
  const timelineChips = document.querySelectorAll('.timeline-chip');
  let devisStep2ShownAt = 0;

  // Mise à jour de l'affichage du récapitulatif
  function updateSummaryText() {
    const catData = labelsMap[state.serviceCategory];
    const variantLabel = catData.variants[state.serviceVariant] || '';
    state.serviceLabel = `${catData.title} — ${variantLabel}`;
    if (summarySelectionText) {
      summarySelectionText.textContent = state.serviceLabel;
    }
  }

  // Navigation entre étapes
  function goToStep(stepNumber) {
    // Maj de l'indicateur de progression
    stepNodes.forEach((node, idx) => {
      node.classList.remove('active', 'completed');
      if (idx + 1 === stepNumber) {
        node.classList.add('active');
      } else if (idx + 1 < stepNumber) {
        node.classList.add('completed');
      }
    });

    // Maj des panneaux
    paneStep1.classList.remove('is-active');
    paneStep2.classList.remove('is-active');
    paneStep3.classList.remove('is-active');

    if (stepNumber === 1) paneStep1.classList.add('is-active');
    if (stepNumber === 2) {
      updateSummaryText();
      paneStep2.classList.add('is-active');
      devisStep2ShownAt = Date.now();
    }
    if (stepNumber === 3) paneStep3.classList.add('is-active');

    // Scroll doux vers le haut du wizard
    const wizardEl = document.getElementById('devis-wizard');
    if (wizardEl) {
      wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Gestion de la sélection principale (Étape 1)
  function selectMainCategory(catKey) {
    state.serviceCategory = catKey;

    mainCards.forEach(card => {
      const cardKey = card.getAttribute('data-service');
      if (cardKey === catKey) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // Affichage des sous-options correspondantes
    Object.keys(subContainers).forEach(key => {
      const cont = subContainers[key];
      if (cont) {
        if (key === catKey) {
          cont.style.display = 'block';
          // Sélectionner la première sous-option par défaut si non définie
          const activeSub = cont.querySelector('.sub-option-card.selected') || cont.querySelector('.sub-option-card');
          if (activeSub) {
            selectVariant(activeSub.getAttribute('data-variant'), cont);
          }
        } else {
          cont.style.display = 'none';
        }
      }
    });

    updateSummaryText();
  }

  // Gestion de la sélection de sous-option
  function selectVariant(variantKey, container) {
    state.serviceVariant = variantKey;
    const parent = container || subContainers[state.serviceCategory];
    if (parent) {
      parent.querySelectorAll('.sub-option-card').forEach(card => {
        if (card.getAttribute('data-variant') === variantKey) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
    }
    updateSummaryText();
  }

  // Attachement des écouteurs Étape 1
  mainCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-service');
      selectMainCategory(cat);
    });
  });

  document.querySelectorAll('.sub-option-card').forEach(subCard => {
    subCard.addEventListener('click', () => {
      const variant = subCard.getAttribute('data-variant');
      selectVariant(variant);
    });
  });

  if (btnStep1Next) {
    btnStep1Next.addEventListener('click', () => {
      goToStep(2);
    });
  }

  if (btnStep2Back) {
    btnStep2Back.addEventListener('click', () => {
      goToStep(1);
    });
  }

  if (btnModifySelection) {
    btnModifySelection.addEventListener('click', () => {
      goToStep(1);
    });
  }

  // Chips Budget & Délais
  budgetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      budgetChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.client.budget = chip.getAttribute('data-value');
    });
  });

  timelineChips.forEach(chip => {
    chip.addEventListener('click', () => {
      timelineChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.client.timeline = chip.getAttribute('data-value');
    });
  });

  // Soumission du formulaire final (Étape 2)
  if (devisForm) {
    devisForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const antiBot = window.StudioSecurity ? window.StudioSecurity.antiBot : null;
      const honeypotEl = document.getElementById('devis-website');
      const honeypotValue = honeypotEl ? honeypotEl.value : '';
      if (antiBot && (antiBot.isHoneypotTriggered(honeypotValue) || antiBot.isLikelyBotBrowser() || antiBot.isSubmittedTooFast(devisStep2ShownAt))) {
        // Soumission silencieusement ignorée : signaux de bot détectés
        devisForm.reset();
        return;
      }

      const name = document.getElementById('devis-name').value.trim();
      const company = document.getElementById('devis-company').value.trim();
      const email = document.getElementById('devis-email').value.trim();
      const phone = document.getElementById('devis-phone').value.trim();
      const desc = document.getElementById('devis-desc').value.trim();

      if (!name || !email || !phone || !desc) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      const sec = window.StudioSecurity ? window.StudioSecurity.sanitize : null;
      if (sec && !sec.isValidEmail(email)) {
        alert('Veuillez saisir une adresse email valide.');
        return;
      }

      if (sec && sec.isFakeEmail(email)) {
        alert('Merci d\'indiquer une adresse email valide et joignable : nous en avons besoin pour vous transmettre votre devis.');
        return;
      }

      if (sec && !sec.isValidPhone(phone)) {
        alert('Veuillez saisir un numéro de téléphone joignable (ex: 77 123 45 67 ou +221 77 123 45 67).');
        return;
      }

      if (sec && !sec.isValidBrief(desc, 20)) {
        alert('Pour que nous puissions évaluer votre projet avec précision, merci de décrire votre besoin en au moins deux phrases (au moins 20 caractères).');
        return;
      }

      state.client.name = sec ? sec.cleanText(name, 120) : name;
      state.client.company = (sec ? sec.cleanText(company, 150) : company) || 'Particulier';
      state.client.email = sec ? sec.cleanText(email, 150) : email;
      state.client.phone = sec ? sec.cleanText(phone, 40) : phone;
      state.client.description = sec ? sec.cleanText(desc, 3000) : desc;

      // Génération de la référence du devis
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const quoteId = `ND-${new Date().getFullYear()}-${randomNum}`;
      const quoteDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const quoteObject = {
        id: quoteId,
        date: quoteDate,
        serviceCategory: state.serviceCategory,
        serviceVariant: state.serviceVariant,
        serviceLabel: state.serviceLabel,
        client: state.client,
        status: 'Nouveau',
        paymentStatus: 'Non généré',
        suggestedAmount: 'Sur devis'
      };

      // Sauvegarde dans la base de données Supabase (avec fallback local automatique)
      if (window.nanoDB && typeof window.nanoDB.saveQuote === 'function') {
        window.nanoDB.saveQuote(quoteObject);
      } else {
        try {
          const existing = JSON.parse(localStorage.getItem('nano_quotes') || '[]');
          existing.unshift(quoteObject);
          localStorage.setItem('nano_quotes', JSON.stringify(existing));
          window.dispatchEvent(new CustomEvent('nanoQuoteAdded', { detail: quoteObject }));
        } catch (err) {
          console.error('Erreur de stockage devis:', err);
        }
      }

      // Transmission de la notification par email au studio
      if (window.NanoNotify && typeof window.NanoNotify.sendQuoteEmail === 'function') {
        window.NanoNotify.sendQuoteEmail(quoteObject);
      }

      // Enregistrement de la conversion réelle dans le moteur d'analytics
      if (window.NanoAnalytics && typeof window.NanoAnalytics.recordTunnelCompletion === 'function') {
        window.NanoAnalytics.recordTunnelCompletion();
      }

      // Remplissage de l'écran de succès
      const refIdEl = document.getElementById('success-quote-id');
      const refServiceEl = document.getElementById('success-service-name');
      const refClientEl = document.getElementById('success-client-name');
      const refBudgetEl = document.getElementById('success-budget-val');
      const refTimelineEl = document.getElementById('success-timeline-val');

      if (refIdEl) refIdEl.textContent = quoteId;
      if (refServiceEl) refServiceEl.textContent = state.serviceLabel;
      if (refClientEl) refClientEl.textContent = `${state.client.name} (${state.client.company})`;
      if (refBudgetEl) refBudgetEl.textContent = state.client.budget;
      if (refTimelineEl) refTimelineEl.textContent = state.client.timeline;

      // Bouton WhatsApp direct avec message pré-rempli
      const btnWhatsApp = document.getElementById('btn-quote-whatsapp');
      if (btnWhatsApp) {
        const waMessage = `Bonjour Nano Design ! Je viens de configurer un devis sur votre site :\n\n• Réf : ${quoteId}\n• Prestation : ${state.serviceLabel}\n• Client : ${state.client.name} (${state.client.company})\n• Contact : ${state.client.phone} / ${state.client.email}\n• Budget : ${state.client.budget}\n• Délai : ${state.client.timeline}\n• Projet : ${state.client.description}\n\nPouvons-nous en discuter ?`;
        btnWhatsApp.href = `https://wa.me/221778901234?text=${encodeURIComponent(waMessage)}`;
      }

      // Aller à l'étape 3
      goToStep(3);

      // Déclencher notification toast
      if (window.showToast) {
        window.showToast('Votre demande de devis a été transmise avec succès !');
      }
    });
  }

  // Bouton "Nouveau Devis" depuis l'étape 3
  const btnNewQuote = document.getElementById('btn-new-quote');
  if (btnNewQuote) {
    btnNewQuote.addEventListener('click', () => {
      if (devisForm) devisForm.reset();
      selectMainCategory('website');
      goToStep(1);
    });
  }

  // Initialisation par défaut
  selectMainCategory('website');
  selectVariant('ecommerce');
})();
