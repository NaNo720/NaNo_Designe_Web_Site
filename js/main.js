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
  // 4. Gestion Dynamique & Filtrage du Portfolio Studio
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  let activePublicFilter = 'all';

  // SVGs vectoriels haute fidélité pour les réalisations initiales ou fallback
  function getProjectThumbnailHtml(project) {
    if (project.imageUrl && project.imageUrl.trim()) {
      return `<img src="${project.imageUrl}" alt="${project.title}" class="project-thumb-img" loading="lazy">`;
    }

    switch (project.id) {
      case 'PROJ-01':
        return `
          <svg class="project-thumb-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="250" fill="#0C0C14"/>
            <rect x="25" y="25" width="350" height="200" rx="8" fill="#131320" stroke="rgba(201, 168, 76, 0.3)" stroke-width="1.5"/>
            <circle cx="50" cy="45" r="4" fill="#E63946"/>
            <circle cx="62" cy="45" r="4" fill="#FBBF24"/>
            <circle cx="74" cy="45" r="4" fill="#34D399"/>
            <rect x="100" y="40" width="120" height="10" rx="5" fill="rgba(255,255,255,0.1)"/>
            <rect x="45" y="75" width="180" height="24" rx="4" fill="url(#pGoldGrad)"/>
            <rect x="45" y="112" width="220" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
            <rect x="45" y="130" width="160" height="10" rx="5" fill="rgba(255,255,255,0.15)"/>
            <rect x="45" y="160" width="110" height="28" rx="14" fill="#C9A84C"/>
            <rect x="250" y="75" width="105" height="113" rx="8" fill="#1A1A2A" stroke="rgba(201,168,76,0.2)"/>
            <path d="M275 130L295 105L315 135L335 120L345 145H265Z" fill="rgba(201,168,76,0.4)"/>
          </svg>
        `;
      case 'PROJ-02':
        return `
          <svg class="project-thumb-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="250" fill="#0A0A0F"/>
            <circle cx="200" cy="125" r="70" stroke="rgba(201,168,76,0.2)" stroke-width="1.5" stroke-dasharray="3 3"/>
            <circle cx="200" cy="125" r="50" stroke="#C9A84C" stroke-width="1.8"/>
            <path d="M200 85 C190 105 180 115 160 125 C180 135 190 145 200 165 C210 145 220 135 240 125 C220 115 210 105 200 85 Z" fill="url(#pGoldGrad)" opacity="0.9"/>
            <text x="200" y="210" font-family="'Playfair Display', serif" font-size="16" fill="#F4F4F8" text-anchor="middle" letter-spacing="4">MAISON BAOBAB</text>
            <text x="200" y="225" font-family="'Space Grotesk', monospace" font-size="8" fill="#C9A84C" text-anchor="middle" letter-spacing="3">COSMÉTIQUES BIO DAKAR</text>
          </svg>
        `;
      case 'PROJ-03':
        return `
          <svg class="project-thumb-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="250" fill="#0E0E16"/>
            <rect x="30" y="30" width="340" height="190" fill="#141420" stroke="rgba(255,255,255,0.06)"/>
            <line x1="30" y1="90" x2="370" y2="90" stroke="rgba(255,255,255,0.04)"/>
            <line x1="30" y1="150" x2="370" y2="150" stroke="rgba(255,255,255,0.04)"/>
            <rect x="90" y="65" width="220" height="120" rx="4" fill="#191928" stroke="#C9A84C" stroke-width="2"/>
            <circle cx="105" cy="80" r="3" fill="#C9A84C"/>
            <circle cx="295" cy="80" r="3" fill="#C9A84C"/>
            <circle cx="105" cy="170" r="3" fill="#C9A84C"/>
            <circle cx="295" cy="170" r="3" fill="#C9A84C"/>
            <text x="200" y="125" font-family="'Syne', sans-serif" font-weight="700" font-size="20" fill="url(#pGoldGrad)" text-anchor="middle" letter-spacing="3">SÉNÉGAL TECH</text>
            <text x="200" y="148" font-family="'Space Grotesk', monospace" font-size="10" fill="#9E9EB2" text-anchor="middle" letter-spacing="2">TOUR DIAMNIADIO • ÉTAGE 08</text>
          </svg>
        `;
      case 'PROJ-04':
        return `
          <svg class="project-thumb-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="250" fill="#09090E"/>
            <rect x="70" y="30" width="115" height="190" rx="14" fill="#13131E" stroke="#C9A84C" stroke-width="1.2"/>
            <rect x="85" y="45" width="85" height="15" rx="3" fill="rgba(201,168,76,0.3)"/>
            <circle cx="127" cy="105" r="28" fill="rgba(255,255,255,0.06)"/>
            <rect x="85" y="145" width="85" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
            <rect x="85" y="160" width="60" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
            <rect x="215" y="45" width="115" height="175" rx="14" fill="#171725" stroke="rgba(255,255,255,0.1)" stroke-width="1.2"/>
            <rect x="230" y="65" width="85" height="50" rx="6" fill="url(#pGoldGrad)" opacity="0.4"/>
            <rect x="230" y="125" width="85" height="10" rx="4" fill="#C9A84C"/>
            <rect x="230" y="145" width="50" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
          </svg>
        `;
      case 'PROJ-05':
        return `
          <svg class="project-thumb-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="250" fill="#0D0D15"/>
            <polygon points="200,60 255,155 145,155" stroke="#C9A84C" stroke-width="2" fill="none"/>
            <polygon points="200,85 235,145 165,145" fill="rgba(201,168,76,0.15)"/>
            <circle cx="200" cy="120" r="12" fill="#E5C875"/>
            <text x="200" y="195" font-family="'Syne', sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">ALMADIES CAPITAL</text>
            <text x="200" y="212" font-family="'Space Grotesk', monospace" font-size="8" fill="#9E9EB2" text-anchor="middle" letter-spacing="2">INVESTISSEMENT & CONSEIL</text>
          </svg>
        `;
      case 'PROJ-06':
        return `
          <svg class="project-thumb-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="250" fill="#0A0A10"/>
            <path d="M40 210 L140 70 L240 210 Z" fill="rgba(201,168,76,0.2)"/>
            <path d="M160 210 L260 70 L360 210 Z" fill="rgba(201,168,76,0.1)"/>
            <rect x="70" y="110" width="260" height="80" rx="6" fill="#12121E" stroke="#C9A84C" stroke-width="1.5"/>
            <text x="200" y="155" font-family="'Playfair Display', serif" font-size="22" font-style="italic" fill="url(#pGoldGrad)" text-anchor="middle">Café des Arts</text>
            <text x="200" y="175" font-family="'Space Grotesk', monospace" font-size="8" fill="#C9A84C" text-anchor="middle" letter-spacing="3">HABILLAGE FAÇADE • NGOR DAKAR</text>
          </svg>
        `;
      default:
        return `
          <svg class="project-thumb-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="250" fill="#0C0C15"/>
            <circle cx="200" cy="115" r="60" stroke="rgba(201,168,76,0.2)" stroke-width="1.5"/>
            <circle cx="200" cy="115" r="45" stroke="#C9A84C" stroke-width="1.5" stroke-dasharray="4 4"/>
            <text x="200" y="123" font-family="'Syne', sans-serif" font-weight="700" font-size="20" fill="url(#pGoldGrad)" text-anchor="middle">NANO</text>
            <text x="200" y="195" font-family="'Space Grotesk', monospace" font-size="9" fill="#9E9EB2" text-anchor="middle" letter-spacing="3">${(project.client || 'STUDIO CRÉATIF').toUpperCase()}</text>
          </svg>
        `;
    }
  }

  async function loadAndRenderPortfolio() {
    const grid = document.getElementById('portfolio-grid-container') || document.querySelector('.portfolio-grid');
    if (!grid) return;

    let projects = [];
    if (window.nanoDB && typeof window.nanoDB.getProjects === 'function') {
      projects = await window.nanoDB.getProjects();
    } else {
      try {
        const stored = localStorage.getItem('nano_portfolio');
        if (stored) projects = JSON.parse(stored);
      } catch (e) { }
    }

    if (!projects || projects.length === 0) return;

    grid.innerHTML = '';

    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-category', p.category || 'web');

      const tags = Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',') : []);
      const tagsHtml = tags.map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');

      const overlayAction = p.projectUrl && p.projectUrl.trim()
        ? `<a href="${p.projectUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-gold btn-sm">Visiter le site ↗</a>`
        : `<a href="#contact" class="btn btn-outline-gold btn-sm">Détail du projet</a>`;

      card.innerHTML = `
        <div class="project-thumb-wrapper">
          <span class="project-badge-cat">${p.categoryLabel || p.category}</span>
          ${getProjectThumbnailHtml(p)}
          <div class="project-overlay-link">
            ${overlayAction}
          </div>
        </div>
        <div class="project-info">
          <span class="project-client-name">${p.client}</span>
          <h4 class="project-title">${p.title}</h4>
          <p class="project-summary">${p.description}</p>
          <div class="project-footer-row">
            <div class="project-tech-tags">
              ${tagsHtml}
            </div>
            <a href="#devis" class="link-more">Devis similaire →</a>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    applyPublicPortfolioFilter(activePublicFilter);
  }

  function applyPublicPortfolioFilter(filterValue) {
    activePublicFilter = filterValue;
    const cards = document.querySelectorAll('.portfolio-grid .project-card');
    cards.forEach(card => {
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
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter') || 'all';
      applyPublicPortfolioFilter(filterValue);
    });
  });

  // Initialisation et écouteurs d'événements
  loadAndRenderPortfolio();

  window.addEventListener('nanoProjectSaved', () => loadAndRenderPortfolio());
  window.addEventListener('nanoProjectDeleted', () => loadAndRenderPortfolio());
  if (window.nanoDB && typeof window.nanoDB.subscribeProjects === 'function') {
    window.nanoDB.subscribeProjects(() => loadAndRenderPortfolio());
  }

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
