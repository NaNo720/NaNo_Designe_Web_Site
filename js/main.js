/**
 * NANO DESIGN DAKAR — SCRIPT PRINCIPAL
 * Navigation, modales "Voir +", filtres portfolio, accordéon FAQ, interactions
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Toast Notification Global
  // ==========================================================================
  const toastEl = document.getElementById('studio-toast');
  const toastMsgEl = document.getElementById('toast-msg');

  window.showToast = function (message) {
    if (!toastEl || !toastMsgEl) return;
    toastMsgEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 4500);
  };

  // ==========================================================================
  // 2. Navigation Header & Scroll
  // ==========================================================================
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Highlighting navigation au scroll
    let currentSection = '';
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // Menu mobile
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('is-open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
      });
    });
  }

  // ==========================================================================
  // 3. Modales "Voir +" (Services & À propos)
  // ==========================================================================
  const modalBackdrop = document.getElementById('studio-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-service-title');
  const modalSubhead = document.getElementById('modal-service-subhead');
  const modalContent = document.getElementById('modal-service-content');
  const modalDeliverablesList = document.getElementById('modal-deliverables-list');

  // Données détaillées pour chaque service (liens "Voir +")
  const servicesDetails = {
    'web': {
      title: 'Design Web & Expériences Mobiles UI/UX',
      subhead: 'Architecture Digitale & Développement Haute Fidélité',
      content: `Notre pôle digital conçoit des plateformes web et des applications mobiles qui dépassent le simple rôle informatif pour devenir de véritables leviers de réputation et de conversion. De l'audit ergonomique initial aux maquettes Figma ultra-haute-définition, chaque micro-interaction est pensée pour susciter l'émotion et accélérer l'action de vos visiteurs à Dakar comme à l'international.`,
      deliverables: [
        'Audit UX approfondi et wireframes interactifs',
        'Direction artistique & design system modulaire',
        'Intégration responsive Pixel Perfect (Mobile first)',
        'Optimisation SEO technique et vitesse Core Web Vitals',
        'Connexion aux passerelles de paiement locales (Wave, OM)',
        'Formation complète à la gestion de vos contenus'
      ]
    },
    'branding': {
      title: 'Identité Visuelle & Branding Stratégique',
      subhead: 'Direction Artistique & Chartes Graphiques Complètes',
      content: `Une identité de marque réussie doit s’imposer au premier regard tout en restant intemporelle. Nano Design sculpte des territoires de marque complets : du logotype géométrique aux typographies exclusives, en passant par les textures, palettes chromatiques et directives éditoriales. Nous donnons à votre entreprise une voix visuelle noble et affirmée.`,
      deliverables: [
        'Logotype vectoriel complet (versions claire, sombre, icône)',
        'Livre de marque (Brand Guidelines) de 35+ pages',
        'Palette colorimétrique harmonisée (HEX, RGB, CMJN, Pantone)',
        'Typographies de marque & hiérarchie visuelle',
        'Templates réseaux sociaux (Instagram, LinkedIn, X)',
        'Papeterie d’entreprise (cartes de visite, papier en-tête)'
      ]
    },
    'marketing': {
      title: 'Marketing Digital & Stratégie d’Acquisition',
      subhead: 'Tunnels de Vente, Campagnes Ciblées & Contenu à Fort Impact',
      content: `Créer une belle marque est indispensable ; la rendre incontournable est notre mission marketing. Nous structurons vos tunnels d'acquisition client, créons vos campagnes sponsorisées ultra-ciblées (Meta, Google, LinkedIn) et sculptons du contenu à haute valeur perçue qui fidélise votre audience au Sénégal et dans la sous-région.`,
      deliverables: [
        'Stratégie éditoriale et calendrier de publication',
        'Création de visuels publicitaires et animations vidéo courtes',
        'Configuration et gestion de campagnes sponsorisées',
        'Tunnels de devis et landing pages à fort taux de conversion',
        'Tracking analytique avancé et rapports d’impact mensuels',
        'Optimisation de présence Google Business et e-réputation'
      ]
    },
    'signage': {
      title: 'Signalétique & Habillage Mural d’Espace',
      subhead: 'Mise en Valeur Architecturale, Enseignes & Décoration de Siège',
      content: `Nano Design prolonge l’expérience de votre marque dans le monde physique. Nous concevons et supervisons la fabrication de signalétiques architecturales intérieures et extérieures pour sièges sociaux, boutiques de prestige, galeries et hôtels à Dakar. Lettres en laiton découpées, totems rétro-éclairés, vinyles sablés et fresques murales.`,
      deliverables: [
        'Modélisations 3D d’implantation dans vos locaux',
        'Enseignes lumineuses et lettres boîtier relief',
        'Habillages muraux acoustiques et fresques sur-mesure',
        'Plaques de porte, orientation et totems d’accueil',
        'Sélection de matériaux nobles (laiton brossé, bois, verre)',
        'Supervision technique et accompagnement à la pose'
      ]
    },
    'about': {
      title: 'Manifeste & Vision du Studio Nano Design',
      subhead: 'Studio de Création Contemporain Ancré à Dakar',
      content: `Fondé à Dakar par une équipe passionnée d'exigence et de beauté formelle, Nano Design est né d'un constat simple : les entreprises africaines et internationales méritent une présence visuelle et digitale au sommet des standards mondiaux, sans aucun compromis. Notre approche combine rigueur technique millimétrée, sensibilité esthétique africaine contemporaine et obsession de la conversion commerciale.`,
      deliverables: [
        'Studio indépendant à taille humaine, réactif et disponible',
        'Interlocuteur créatif unique dédié tout au long du projet',
        'Méthodologie agile en 4 temps : Immersion, Direction, Exécution, Déploiement',
        'Contrats clairs avec cession intégrale des droits d’auteur',
        'Garantie satisfaction et support technique post-lancement',
        'Rayonnement à Dakar, en Afrique de l’Ouest et à l’international'
      ]
    }
  };

  // Ouverture modale au clic sur un bouton "Voir +"
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute('data-open-modal');
      const data = servicesDetails[serviceKey];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalSubhead.textContent = data.subhead;
      modalContent.innerHTML = `<p>${data.content}</p>`;

      modalDeliverablesList.innerHTML = '';
      data.deliverables.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        modalDeliverablesList.appendChild(li);
      });

      modalBackdrop.classList.add('is-open');
    });
  });

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('is-open');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ==========================================================================
  // 4. Filtrage dynamique du Portfolio
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // ==========================================================================
  // 5. Accordéon FAQ Interactif
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    const answerPane = item.querySelector('.faq-answer-pane');

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Fermer les autres accordéons
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherPane = otherItem.querySelector('.faq-answer-pane');
          if (otherPane) otherPane.style.maxHeight = null;
        }
      });

      if (!isActive) {
        item.classList.add('active');
        answerPane.style.maxHeight = answerPane.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        answerPane.style.maxHeight = null;
      }
    });
  });

  // Ouvrir la première question par défaut
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    const firstPane = firstItem.querySelector('.faq-answer-pane');
    firstItem.classList.add('active');
    if (firstPane) firstPane.style.maxHeight = firstPane.scrollHeight + 'px';
  }

  // Bouton "Voir toute la FAQ"
  const btnExpandFaq = document.getElementById('btn-expand-faq');
  if (btnExpandFaq) {
    btnExpandFaq.addEventListener('click', () => {
      faqItems.forEach(item => {
        const pane = item.querySelector('.faq-answer-pane');
        item.classList.add('active');
        if (pane) pane.style.maxHeight = pane.scrollHeight + 'px';
      });
      btnExpandFaq.textContent = 'Toutes les réponses sont affichées';
      btnExpandFaq.disabled = true;
      btnExpandFaq.style.opacity = '0.6';
    });
  }

  // ==========================================================================
  // 6. Formulaire de Contact Direct
  // ==========================================================================
  const contactForm = document.getElementById('direct-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        alert('Veuillez remplir les champs obligatoires.');
        return;
      }

      const newMsg = {
        id: `MSG-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        name: name,
        email: email,
        phone: phone || 'Non renseigné',
        subject: subject || 'Message via site web',
        message: message,
        status: 'Non lu'
      };

      if (window.nanoDB && typeof window.nanoDB.saveMessage === 'function') {
        window.nanoDB.saveMessage(newMsg);
      } else {
        try {
          const msgs = JSON.parse(localStorage.getItem('nano_messages') || '[]');
          msgs.unshift(newMsg);
          localStorage.setItem('nano_messages', JSON.stringify(msgs));
        } catch (err) {
          console.error(err);
        }
      }

      // Transmission de l'alerte email au studio
      if (window.NanoNotify && typeof window.NanoNotify.sendMessageEmail === 'function') {
        window.NanoNotify.sendMessageEmail(newMsg);
      }

      window.showToast(`Merci ${name} ! Votre message a été transmis à l'équipe Nano Design.`);
      contactForm.reset();
    });
  }

  // ==========================================================================
  // 7. Accès discret Studio pour l'équipe (Raccourci Clavier & Paramètre URL)
  // ==========================================================================
  // Raccourci clavier secret : Ctrl + Shift + A (ou Ctrl + Shift + S)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

  // Détection discrète via URL (ex: https://nanodesign.sn/?studio ou ?admin)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('studio') || urlParams.has('admin')) {
    window.location.href = 'admin.html';
  }

})();
