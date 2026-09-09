// ==============================================================================
// NANO DESIGN STUDIO — LOGIQUE CATALOGUE RÉALISATIONS (PINTEREST STYLE)
// Gestion de la grille masonry, filtres contextuels et Lightbox étude de cas
// ==============================================================================

(function () {
  'use strict';

  // Configuration des sous-filtres par domaine
  const SUBFILTER_CONFIG = {
    'logos': [
      { id: 'all', label: 'Tous les logos' },
      { id: 'avec-charte', label: 'Avec charte graphique' },
      { id: 'sans-charte', label: 'Sans charte graphique' },
      { id: 'refonte', label: 'Refonte & Identité' }
    ],
    'web': [
      { id: 'all', label: 'Tous les sites & apps' },
      { id: 'vitrine', label: 'Sites Vitrines' },
      { id: 'ecommerce', label: 'E-Commerce & Plateformes' },
      { id: 'app', label: 'Applications Mobiles' }
    ],
    'supports': [
      { id: 'all', label: 'Tous les supports' },
      { id: 'signaletique-murale', label: 'Signalétique Murale' },
      { id: 'print', label: 'Supports Imprimés & Print' },
      { id: 'habillage', label: 'Habillage & Décoration' }
    ]
  };

  // État local du catalogue
  let allProjects = [];
  let currentDomain = 'all';
  let currentVariant = 'all';
  let currentActiveProject = null;

  // Éléments DOM
  const gridContainer = document.getElementById('catalog-masonry-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  const domainBtns = document.querySelectorAll('.catalog-domain-btn');
  const subfiltersWrapper = document.getElementById('catalog-subfilters-wrapper');
  const totalCountEl = document.getElementById('catalog-total-count');

  // Modale Lightbox
  const lightboxModal = document.getElementById('catalog-lightbox-modal');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxIdTag = document.getElementById('lightbox-id-tag');
  const lightboxCatBadge = document.getElementById('lightbox-cat-badge');
  const lightboxVariantBadge = document.getElementById('lightbox-variant-badge');
  const lightboxClientLead = document.getElementById('lightbox-client-lead');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxTags = document.getElementById('lightbox-tags');
  const lightboxCta = document.getElementById('lightbox-cta-quote');
  const lightboxLiveLink = document.getElementById('lightbox-live-link');

  // Initialisation au chargement du DOM
  document.addEventListener('DOMContentLoaded', async () => {
    parseUrlParams();
    await loadProjects();
    setupEventListeners();
    renderSubfilters();
    renderGallery();
  });

  // Analyse des paramètres d'URL (ex: ?cat=logos&sub=avec-charte)
  function parseUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('cat');
      const subParam = params.get('sub');

      if (catParam && ['all', 'logos', 'web', 'supports'].includes(catParam)) {
        currentDomain = catParam;
      }
      if (subParam) {
        currentVariant = subParam;
      }
    } catch (e) {
      console.warn('[Catalog] Erreur lecture params URL:', e);
    }
  }

  // Chargement des projets via NanoDB ou secours local
  async function loadProjects() {
    if (window.nanoDB && typeof window.nanoDB.getProjects === 'function') {
      try {
        allProjects = await window.nanoDB.getProjects();
      } catch (e) {
        console.warn('[Catalog] Exception chargement nanoDB:', e);
      }
    }

    if (!Array.isArray(allProjects) || allProjects.length === 0) {
      try {
        const stored = localStorage.getItem('nano_portfolio');
        if (stored) allProjects = JSON.parse(stored);
      } catch (err) { }
    }

    updateDomainCounters();
  }

  // Mise à jour des compteurs par domaine
  function updateDomainCounters() {
    if (totalCountEl) {
      totalCountEl.textContent = allProjects.length;
    }

    domainBtns.forEach(btn => {
      const domain = btn.getAttribute('data-domain');
      const countEl = btn.querySelector('.catalog-domain-count');
      if (countEl) {
        if (domain === 'all') {
          countEl.textContent = allProjects.length;
        } else {
          const count = allProjects.filter(p => p.category === domain).length;
          countEl.textContent = count;
        }
      }
    });
  }

  // Configuration des écouteurs globaux
  function setupEventListeners() {
    // Clics sur les onglets Domaines
    domainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedDomain = btn.getAttribute('data-domain');
        if (selectedDomain === currentDomain) return;

        currentDomain = selectedDomain;
        currentVariant = 'all'; // réinitialiser le sous-filtre

        // Mise à jour visuelle des boutons
        domainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Mettre à jour l'URL sans rechargement
        updateUrlParams();

        // Rendu
        renderSubfilters();
        renderGallery();
      });
    });

    // Fermeture de la Lightbox
    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', closeLightbox);
    }

    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
          closeLightbox();
        }
      });
    }

    // Touche Échap pour fermer la Lightbox
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('is-open')) {
        closeLightbox();
      }
    });

    // Écoute des synchronisations temps réel (Supabase et admin)
    window.addEventListener('nanoProjectSaved', async () => {
      await loadProjects();
      renderGallery();
    });

    window.addEventListener('nanoProjectDeleted', async () => {
      await loadProjects();
      renderGallery();
    });
  }

  // Rendu de la barre des sous-filtres contextuels
  function renderSubfilters() {
    if (!subfiltersWrapper) return;

    if (currentDomain === 'all' || !SUBFILTER_CONFIG[currentDomain]) {
      subfiltersWrapper.innerHTML = '';
      subfiltersWrapper.classList.remove('is-visible');
      return;
    }

    const subList = SUBFILTER_CONFIG[currentDomain];
    subfiltersWrapper.innerHTML = '';

    subList.forEach(item => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `catalog-subfilter-chip ${item.id === currentVariant ? 'active' : ''}`;
      chip.setAttribute('data-variant', item.id);
      chip.innerHTML = `<span>${item.label}</span>`;

      chip.addEventListener('click', () => {
        if (currentVariant === item.id) return;
        currentVariant = item.id;

        subfiltersWrapper.querySelectorAll('.catalog-subfilter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        updateUrlParams();
        renderGallery();
      });

      subfiltersWrapper.appendChild(chip);
    });

    subfiltersWrapper.classList.add('is-visible');
  }

  // Met à jour l'URL avec les filtres sans recharger la page
  function updateUrlParams() {
    const params = new URLSearchParams();
    if (currentDomain !== 'all') params.set('cat', currentDomain);
    if (currentVariant !== 'all') params.set('sub', currentVariant);

    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
    window.history.replaceState({}, '', newUrl);
  }

  // Filtrage des projets
  function getFilteredProjects() {
    return allProjects.filter(project => {
      // 1. Filtrage par domaine
      if (currentDomain !== 'all' && project.category !== currentDomain) {
        return false;
      }

      // 2. Filtrage par sous-type (variante)
      if (currentVariant !== 'all') {
        const projVariant = (project.variant || '').toLowerCase();
        const projVariantLabel = (project.variantLabel || '').toLowerCase();
        const searchVariant = currentVariant.toLowerCase();

        // Correspondance directe ou par libellé
        const matchDirect = projVariant === searchVariant;
        const matchLabel = projVariantLabel.includes(searchVariant.replace('-', ' '));

        // Correspondance intelligente selon les tags du projet
        const tagsStr = Array.isArray(project.tags) ? project.tags.join(' ').toLowerCase() : (project.tags || '').toLowerCase();
        const matchTag = tagsStr.includes(searchVariant.replace('-', ' '));

        if (!matchDirect && !matchLabel && !matchTag) {
          return false;
        }
      }

      return true;
    });
  }

  // Rendu de la grille Masonry style Pinterest
  function renderGallery() {
    if (!gridContainer) return;

    // Activer le bouton de domaine correspondant
    domainBtns.forEach(btn => {
      if (btn.getAttribute('data-domain') === currentDomain) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const filtered = getFilteredProjects();
    gridContainer.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      gridContainer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    gridContainer.style.display = '';

    filtered.forEach((project, index) => {
      const card = createPinterestCard(project, index);
      gridContainer.appendChild(card);
    });
  }

  // Création d'une carte Pinterest Masonry
  function createPinterestCard(project, index) {
    const card = document.createElement('article');
    card.className = 'pinterest-card';
    card.setAttribute('data-id', project.id);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Voir la réalisation ${project.title} pour ${project.client}`);

    const hasImg = Boolean(project.imageUrl && project.imageUrl.trim());
    const tags = Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? project.tags.split(',') : []);

    const mediaHtml = hasImg
      ? `<div class="pinterest-card-media">
           <img src="${project.imageUrl}" 
                alt="${project.title} - Nano Design Studio" 
                class="pinterest-card-img" 
                loading="${index < 4 ? 'eager' : 'lazy'}"
                onerror="this.parentElement.innerHTML='<div class=\\'pinterest-placeholder\\'><span class=\\'pinterest-placeholder-icon\\'>✦</span><span class=\\'pinterest-placeholder-title\\'>${project.title}</span></div>'" />
         </div>`
      : `<div class="pinterest-placeholder">
           <span class="pinterest-placeholder-icon">✦</span>
           <span class="pinterest-placeholder-title">${project.title}</span>
         </div>`;

    card.innerHTML = `
      <div class="pinterest-card-badges">
        <span class="pinterest-badge-category">${project.categoryLabel || project.category}</span>
        ${project.variantLabel ? `<span class="pinterest-badge-variant">${project.variantLabel}</span>` : ''}
      </div>
      <button type="button" class="pinterest-quick-zoom" title="Agrandir et voir l'étude de cas" aria-label="Agrandir">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      ${mediaHtml}
      <div class="pinterest-card-overlay">
        <span class="pinterest-card-client">${project.client || 'Client Privé'}</span>
        <h3 class="pinterest-card-title">${project.title}</h3>
      </div>
      <div class="pinterest-card-footer">
        <div class="pinterest-footer-title">${project.title}</div>
        <div class="pinterest-footer-bottom">
          <span class="pinterest-footer-client">${project.client || 'Nano Design'}</span>
          <span class="pinterest-footer-action">Étude de cas ↗</span>
        </div>
      </div>
    `;

    // Clic pour ouvrir la Lightbox
    const openHandler = (e) => {
      e.preventDefault();
      openLightbox(project);
    };

    card.addEventListener('click', openHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(project);
      }
    });

    return card;
  }

  // Ouverture de la modale Lightbox avec les métadonnées complètes
  function openLightbox(project) {
    if (!lightboxModal) return;
    currentActiveProject = project;

    // Remplissage des champs
    if (lightboxImg) {
      lightboxImg.src = project.imageUrl || '';
      lightboxImg.alt = project.title;
      lightboxImg.style.display = project.imageUrl ? 'block' : 'none';
    }

    if (lightboxIdTag) lightboxIdTag.textContent = project.id || 'PROJET';
    if (lightboxCatBadge) lightboxCatBadge.textContent = project.categoryLabel || project.category;
    
    if (lightboxVariantBadge) {
      if (project.variantLabel) {
        lightboxVariantBadge.textContent = project.variantLabel;
        lightboxVariantBadge.style.display = 'inline-block';
      } else {
        lightboxVariantBadge.style.display = 'none';
      }
    }

    if (lightboxClientLead) lightboxClientLead.textContent = project.client || 'CLIENT CONFIDENTIEL';
    if (lightboxTitle) lightboxTitle.textContent = project.title;
    if (lightboxDesc) lightboxDesc.textContent = project.description || 'Conception et réalisation sur-mesure signées par l\'équipe créative Nano Design Dakar.';

    // Tags
    if (lightboxTags) {
      lightboxTags.innerHTML = '';
      const tags = Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? project.tags.split(',') : []);
      tags.forEach(t => {
        if (t.trim()) {
          const pill = document.createElement('span');
          pill.className = 'lightbox-tag-pill';
          pill.textContent = `#${t.trim()}`;
          lightboxTags.appendChild(pill);
        }
      });
    }

    // CTA Devis avec redirection pré-sélectionnée
    if (lightboxCta) {
      const categoryMap = {
        'logos': 'logo',
        'web': 'siteweb',
        'supports': 'support'
      };
      const quoteService = categoryMap[project.category] || 'logo';
      lightboxCta.href = `index.html#devis?service=${quoteService}&variant=${encodeURIComponent(project.variant || '')}`;
      lightboxCta.innerHTML = `<span>Demander un devis similaire ✦</span>`;
    }

    // Lien live externe
    if (lightboxLiveLink) {
      if (project.projectUrl && project.projectUrl.trim()) {
        lightboxLiveLink.href = project.projectUrl;
        lightboxLiveLink.style.display = 'inline-flex';
      } else {
        lightboxLiveLink.style.display = 'none';
      }
    }

    // Empêcher le défilement de l'arrière-plan
    document.body.style.overflow = 'hidden';
    lightboxModal.classList.add('is-open');
  }

  // Fermeture de la modale Lightbox
  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('is-open');
    document.body.style.overflow = '';
    currentActiveProject = null;
  }

})();
