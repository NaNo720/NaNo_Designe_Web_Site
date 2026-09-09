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
  const lightboxDialog = document.querySelector('.lightbox-dialog');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxStandardMedia = document.getElementById('lightbox-standard-media');
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

  // Éléments du Lecteur de Brand Book (Style Pentagram & Behance)
  const lightboxBrandbookPlayer = document.getElementById('lightbox-brandbook-player');
  const bbDeckStage = document.getElementById('brandbook-deck-stage');
  const bbStageFrame = document.getElementById('brandbook-stage-frame');
  const bbScrollStage = document.getElementById('brandbook-scroll-stage');
  const bbScrollFlow = document.getElementById('brandbook-scroll-flow');
  const bbSlideImg = document.getElementById('brandbook-slide-img');
  const bbPrevBtn = document.getElementById('bb-prev-btn');
  const bbNextBtn = document.getElementById('bb-next-btn');
  const bbSlideCounter = document.getElementById('bb-slide-counter');
  const bbSlideTitle = document.getElementById('bb-slide-title');
  const bbProgressBar = document.getElementById('brandbook-progress-bar');
  const bbThumbsStrip = document.getElementById('brandbook-thumbs-strip');
  const bbViewDeckBtn = document.getElementById('bb-view-deck-btn');
  const bbViewScrollBtn = document.getElementById('bb-view-scroll-btn');
  const bbFullscreenToggle = document.getElementById('bb-fullscreen-toggle');
  const bbSpecsBox = document.getElementById('brandbook-specs-box');
  const bbSpecsCount = document.getElementById('bb-specs-count');
  const bbBtnPdf = document.getElementById('lightbox-btn-pdf');

  // État local du Brand Book
  let currentBrandbookSlides = [];
  let currentSlideIndex = 0;
  let currentBrandbookMode = 'deck'; // 'deck' ou 'scroll'

  // Initialisation au chargement du DOM
  document.addEventListener('DOMContentLoaded', async () => {
    parseUrlParams();
    await loadProjects();
    setupEventListeners();
    setupBrandbookListeners();
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

    const isBrandbook = project.variant === 'avec-charte' || 
                        (project.variantLabel && project.variantLabel.toLowerCase().includes('charte')) ||
                        (project.title && project.title.toLowerCase().includes('charte')) ||
                        (Array.isArray(project.brandbookSlides) && project.brandbookSlides.length > 0);

    card.innerHTML = `
      <div class="pinterest-card-badges">
        <span class="pinterest-badge-category">${project.categoryLabel || project.category}</span>
        ${project.variantLabel ? `<span class="pinterest-badge-variant">${project.variantLabel}</span>` : ''}
        ${isBrandbook ? `<span class="pinterest-badge-variant" style="background: rgba(201, 168, 76, 0.28); border-color: var(--border-gold); color: #FFF; font-weight: 700;">✦ Brand Book (38 Planches)</span>` : ''}
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
          <span class="pinterest-footer-action">${isBrandbook ? 'Feuilleter 16:9 ➔' : 'Étude de cas ↗'}</span>
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

  // ==============================================================================
  // MOTEUR DE BRAND BOOK HAUTE FIDÉLITÉ (PENTAGRAM & BEHANCE)
  // ==============================================================================

  function setupBrandbookListeners() {
    if (bbPrevBtn) bbPrevBtn.addEventListener('click', prevBrandbookSlide);
    if (bbNextBtn) bbNextBtn.addEventListener('click', nextBrandbookSlide);
    
    if (bbViewDeckBtn) {
      bbViewDeckBtn.addEventListener('click', () => toggleBrandbookMode('deck'));
    }
    if (bbViewScrollBtn) {
      bbViewScrollBtn.addEventListener('click', () => toggleBrandbookMode('scroll'));
    }

    if (bbFullscreenToggle) {
      bbFullscreenToggle.addEventListener('click', toggleBrandbookFullscreen);
    }

    // Navigation Clavier pour la charte
    document.addEventListener('keydown', (e) => {
      if (!lightboxModal || !lightboxModal.classList.contains('is-open')) return;
      if (!currentBrandbookSlides || currentBrandbookSlides.length === 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextBrandbookSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevBrandbookSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleBrandbookFullscreen();
      }
    });

    // Gestes tactiles sur mobile (Swipe)
    if (bbStageFrame) {
      let touchStartX = 0;
      bbStageFrame.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      bbStageFrame.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 40) {
          nextBrandbookSlide();
        } else if (touchEndX > touchStartX + 40) {
          prevBrandbookSlide();
        }
      }, { passive: true });
    }
  }

  function getBrandbookSlidesForProject(project) {
    if (!project) return null;

    if (Array.isArray(project.brandbookSlides) && project.brandbookSlides.length > 0) {
      return project.brandbookSlides.map((slide, idx) => {
        if (typeof slide === 'string') {
          return {
            title: `Planche ${(idx + 1).toString().padStart(2, '0')}`,
            url: slide
          };
        }
        return slide;
      });
    }

    const isWithCharte = project.variant === 'avec-charte' || 
                         (project.variantLabel && project.variantLabel.toLowerCase().includes('charte')) ||
                         (project.title && project.title.toLowerCase().includes('charte'));

    if (isWithCharte) {
      return generateMasterBrandbookSlides(project);
    }

    return null;
  }

  function generateMasterBrandbookSlides(project) {
    const clientName = (project.client || 'MAISON BAOBAB BIO').toUpperCase();

    function makeSvgSlide(title, sub, contentSvg) {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="pGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5E3A9"/>
      <stop offset="50%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#8F7124"/>
    </linearGradient>
    <linearGradient id="pDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12121E"/>
      <stop offset="100%" stop-color="#06060B"/>
    </linearGradient>
    <pattern id="gridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(201,168,76,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#pDark)"/>
  <rect width="1920" height="1080" fill="url(#gridPattern)"/>
  
  <rect x="70" y="55" width="8" height="36" fill="url(#pGold)"/>
  <text x="95" y="74" fill="#C9A84C" font-family="'Space Grotesk', monospace, sans-serif" font-size="15" font-weight="700" letter-spacing="3">${clientName}</text>
  <text x="95" y="94" fill="rgba(255,255,255,0.45)" font-family="'Space Grotesk', monospace, sans-serif" font-size="13" letter-spacing="2">BRAND IDENTITY GUIDELINES • NANO DESIGN STUDIO DAKAR</text>
  
  <text x="1850" y="78" fill="#FFF" font-family="'Syne', sans-serif" font-size="18" font-weight="700" text-anchor="end">${title}</text>
  <text x="1850" y="96" fill="#C9A84C" font-family="'Space Grotesk', monospace, sans-serif" font-size="13" text-anchor="end" letter-spacing="1">${sub}</text>
  <line x1="70" y1="120" x2="1850" y2="120" stroke="rgba(201,168,76,0.22)" stroke-width="1.5"/>
  
  ${contentSvg}
  
  <line x1="70" y1="995" x2="1850" y2="995" stroke="rgba(201,168,76,0.22)" stroke-width="1.5"/>
  <text x="70" y="1030" fill="rgba(201,168,76,0.8)" font-family="'Space Grotesk', monospace, sans-serif" font-size="14" letter-spacing="2">FORMAT MASTER 1920 × 1080 PX • RATIO 16:9 • LIVRE DE MARQUE OFFICIEL</text>
  <text x="1850" y="1030" fill="rgba(255,255,255,0.4)" font-family="'Space Grotesk', monospace, sans-serif" font-size="14" text-anchor="end" letter-spacing="1">SYSTÈME GRAPHIQUE NANO DESIGN • DAKAR, SÉNÉGAL</text>
</svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
    }

    return [
      {
        title: "01. Couverture & Identité Institutionnelle",
        url: makeSvgSlide(
          "01 / 10 • COUVERTURE DU BRAND BOOK",
          "SYSTEM IDENTIFICATION & STANDARDS",
          `
          <g transform="translate(960, 490)">
            <circle cx="0" cy="-50" r="140" fill="none" stroke="url(#pGold)" stroke-width="3" stroke-dasharray="8 6"/>
            <polygon points="0,-160 120,-20 75,100 -75,100 -120,-20" fill="none" stroke="rgba(201,168,76,0.3)" stroke-width="2"/>
            <path d="M-60,30 L0,-90 L60,30 L30,30 L0,-30 L-30,30 Z" fill="url(#pGold)"/>
            <text x="0" y="140" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="52" font-weight="800" text-anchor="middle" letter-spacing="8">${clientName}</text>
            <text x="0" y="185" fill="#C9A84C" font-family="'Playfair Display', serif" font-size="24" font-style="italic" text-anchor="middle">Livre de Marque & Système Visuel de Référence</text>
            <rect x="-180" y="225" width="360" height="38" rx="19" fill="rgba(201,168,76,0.12)" stroke="rgba(201,168,76,0.4)" stroke-width="1.2"/>
            <text x="0" y="249" fill="#E8D49E" font-family="'Space Grotesk', monospace" font-size="14" font-weight="700" text-anchor="middle" letter-spacing="3">VOLUME 01 • ÉDITION COMPLÈTE (38 PLANCHES)</text>
          </g>
          `
        )
      },
      {
        title: "02. Construction Géométrique & Grille au Nombre d'Or",
        url: makeSvgSlide(
          "02 / 10 • CONSTRUCTION GÉOMÉTRIQUE",
          "GOLDEN RATIO & GEOMETRIC SYSTEM",
          `
          <g transform="translate(960, 530)">
            <circle cx="0" cy="0" r="280" fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="1"/>
            <circle cx="0" cy="0" r="173" fill="none" stroke="rgba(201,168,76,0.25)" stroke-width="1.5" stroke-dasharray="6 6"/>
            <circle cx="0" cy="0" r="107" fill="none" stroke="rgba(201,168,76,0.35)" stroke-width="2"/>
            <circle cx="0" cy="0" r="66" fill="none" stroke="url(#pGold)" stroke-width="2"/>
            <line x1="-450" y1="0" x2="450" y2="0" stroke="rgba(201,168,76,0.4)" stroke-width="1" stroke-dasharray="4 4"/>
            <line x1="0" y1="-320" x2="0" y2="320" stroke="rgba(201,168,76,0.4)" stroke-width="1" stroke-dasharray="4 4"/>
            <path d="M-80,40 L0,-120 L80,40 L40,40 L0,-40 L-40,40 Z" fill="url(#pGold)" stroke="#FFF" stroke-width="1"/>
            <text x="310" y="-10" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15">Φ = 1.618 (PROPORTION DORÉE)</text>
            <text x="310" y="20" fill="rgba(255,255,255,0.5)" font-family="'Space Grotesk', monospace" font-size="13">Rayon majeur R1 = 280 mm</text>
            <text x="310" y="45" fill="rgba(255,255,255,0.5)" font-family="'Space Grotesk', monospace" font-size="13">Précision modulaire : 1:1 Pixel Perfect</text>
            <text x="-310" y="-10" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15" text-anchor="end">AXES DE SYMÉTRIE</text>
            <text x="-310" y="20" fill="rgba(255,255,255,0.5)" font-family="'Space Grotesk', monospace" font-size="13" text-anchor="end">Angle invariant : 45.00°</text>
          </g>
          `
        )
      },
      {
        title: "03. Variantes Chromatiques & Contraste",
        url: makeSvgSlide(
          "03 / 10 • VARIATIONS OFFICIELLES",
          "CHROMATIC CONTRAST & BACKGROUND MODES",
          `
          <g transform="translate(110, 220)">
            <rect x="0" y="0" width="530" height="620" rx="14" fill="#0C0C16" stroke="rgba(201,168,76,0.3)" stroke-width="1.5"/>
            <text x="35" y="55" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15" font-weight="700">01. VERSION SOMBRE • MASTER</text>
            <g transform="translate(265, 340)">
              <circle cx="0" cy="-30" r="85" fill="none" stroke="url(#pGold)" stroke-width="2"/>
              <path d="M-40,20 L0,-60 L40,20 L20,20 L0,-20 L-20,20 Z" fill="url(#pGold)"/>
              <text x="0" y="95" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="28" font-weight="800" text-anchor="middle" letter-spacing="4">${clientName}</text>
            </g>

            <rect x="580" y="0" width="530" height="620" rx="14" fill="#F8F6F0" stroke="rgba(201,168,76,0.5)" stroke-width="1.5"/>
            <text x="615" y="55" fill="#7A5E1E" font-family="'Space Grotesk', monospace" font-size="15" font-weight="700">02. VERSION CLAIRE • PAPIER & LÉGAL</text>
            <g transform="translate(845, 340)">
              <circle cx="0" cy="-30" r="85" fill="none" stroke="#7A5E1E" stroke-width="2"/>
              <path d="M-40,20 L0,-60 L40,20 L20,20 L0,-20 L-20,20 Z" fill="#0C0C16"/>
              <text x="0" y="95" fill="#0C0C16" font-family="'Syne', sans-serif" font-size="28" font-weight="800" text-anchor="middle" letter-spacing="4">${clientName}</text>
            </g>

            <rect x="1160" y="0" width="530" height="620" rx="14" fill="#151522" stroke="rgba(201,168,76,0.3)" stroke-width="1.5"/>
            <text x="1195" y="55" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15" font-weight="700">03. MONOCHROME • GRAVURE & FOIL</text>
            <g transform="translate(1425, 340)">
              <circle cx="0" cy="-30" r="85" fill="none" stroke="#FFFFFF" stroke-width="2"/>
              <path d="M-40,20 L0,-60 L40,20 L20,20 L0,-20 L-20,20 Z" fill="#FFFFFF"/>
              <text x="0" y="95" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="28" font-weight="800" text-anchor="middle" letter-spacing="4">${clientName}</text>
            </g>
          </g>
          `
        )
      },
      {
        title: "04. Nuancier Institutionnel (Pantone, CMJN, RVB, Hex)",
        url: makeSvgSlide(
          "04 / 10 • NUANCIER OFFICIEL",
          "COLOR PALETTE CODES",
          `
          <g transform="translate(120, 240)">
            <rect x="0" y="0" width="380" height="340" rx="12" fill="url(#pGold)"/>
            <rect x="0" y="340" width="380" height="230" rx="12" fill="#0E0E18" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
            <text x="25" y="380" fill="#FFF" font-family="'Syne', sans-serif" font-size="20" font-weight="700">OR LAITON DAKAR</text>
            <text x="25" y="415" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15">HEX : #C9A84C</text>
            <text x="25" y="445" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">PANTONE : 10398 C</text>
            <text x="25" y="475" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">CMJN : C18 M28 J75 N10</text>

            <rect x="430" y="0" width="380" height="340" rx="12" fill="#0C0C14" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <rect x="430" y="340" width="380" height="230" rx="12" fill="#0E0E18" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
            <text x="455" y="380" fill="#FFF" font-family="'Syne', sans-serif" font-size="20" font-weight="700">NOIR ÉBÈNE SÉNÉGALAIS</text>
            <text x="455" y="415" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15">HEX : #0C0C14</text>
            <text x="455" y="445" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">PANTONE : BLACK 6 C</text>
            <text x="455" y="475" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">CMJN : C75 M68 J60 N90</text>

            <rect x="860" y="0" width="380" height="340" rx="12" fill="#F4EFE2"/>
            <rect x="860" y="340" width="380" height="230" rx="12" fill="#0E0E18" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
            <text x="885" y="380" fill="#FFF" font-family="'Syne', sans-serif" font-size="20" font-weight="700">SABLE IVOIRE ALMADIES</text>
            <text x="885" y="415" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15">HEX : #F4EFE2</text>
            <text x="885" y="445" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">PANTONE : 7527 C</text>
            <text x="885" y="475" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">CMJN : C4 M5 J10 N0</text>

            <rect x="1290" y="0" width="380" height="340" rx="12" fill="#7A5E1E"/>
            <rect x="1290" y="340" width="380" height="230" rx="12" fill="#0E0E18" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
            <text x="1315" y="380" fill="#FFF" font-family="'Syne', sans-serif" font-size="20" font-weight="700">BRONZE TERROU PROFOND</text>
            <text x="1315" y="415" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15">HEX : #7A5E1E</text>
            <text x="1315" y="445" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">PANTONE : 4505 C</text>
            <text x="1315" y="475" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="14">CMJN : C32 M45 J88 N25</text>
          </g>
          `
        )
      },
      {
        title: "05. Système Typographique & Hiérarchie Éditoriale",
        url: makeSvgSlide(
          "05 / 10 • SYSTÈME TYPOGRAPHIQUE",
          "FONTS HIERARCHY & ROLES",
          `
          <g transform="translate(130, 230)">
            <rect x="0" y="0" width="780" height="600" rx="14" fill="#0C0C16" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
            <text x="50" y="60" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700">TYPOGRAPHIE PRIMAIRE • SYNE (TITRES)</text>
            <text x="50" y="140" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="56" font-weight="800">Aa Bb Cc 123</text>
            <text x="50" y="210" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="30" font-weight="600">L'Excellence du Geste Créatif à Dakar</text>
            <line x1="50" y1="280" x2="730" y2="280" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <text x="50" y="340" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700">TYPOGRAPHIE SECONDAIRE • PLAYFAIR DISPLAY</text>
            <text x="50" y="410" fill="#F5E3A9" font-family="'Playfair Display', serif" font-size="40" font-style="italic">Élégance, Héritage & Raffinement</text>

            <rect x="830" y="0" width="800" height="600" rx="14" fill="#0C0C16" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>
            <text x="880" y="60" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700">CORPS DE TEXTE • PLUS JAKARTA SANS</text>
            <text x="880" y="130" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20">
              Lecture fluide et confortable sur smartphone, tablettes et supports imprimés institutionnels.
            </text>
            <text x="880" y="200" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700">DONNÉES CHIFFRÉES • SPACE GROTESK</text>
            <text x="880" y="270" fill="#FFFFFF" font-family="'Space Grotesk', monospace" font-size="44" font-weight="700">1920 × 1080 • +221 33 800</text>
          </g>
          `
        )
      },
      {
        title: "06. Zone de Protection & Tailles Minimales",
        url: makeSvgSlide(
          "06 / 10 • ZONE D'EXCLUSION",
          "PROTECTION BOUNDS & MINIMUM SIZES",
          `
          <g transform="translate(960, 500)">
            <rect x="-320" y="-180" width="640" height="360" rx="8" fill="rgba(201,168,76,0.04)" stroke="#C9A84C" stroke-width="1.5" stroke-dasharray="8 6"/>
            <path d="M-60,30 L0,-90 L60,30 L30,30 L0,-30 L-30,30 Z" fill="url(#pGold)"/>
            <text x="0" y="110" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="38" font-weight="800" text-anchor="middle" letter-spacing="6">${clientName}</text>
            <text x="0" y="240" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="18" text-anchor="middle" font-weight="700">RÈGLE DE ZONE D'EXCLUSION : DISTANCE X</text>
            <text x="0" y="270" fill="rgba(255,255,255,0.7)" font-family="'Space Grotesk', monospace" font-size="15" text-anchor="middle">
              Aucun élément ne doit pénétrer dans le périmètre X.
            </text>
          </g>
          `
        )
      },
      {
        title: "07. Papeterie de Prestige & Finitions Dorure à Chaud",
        url: makeSvgSlide(
          "07 / 10 • PAPETERIE INSTITUTIONNELLE",
          "BUSINESS COLLATERAL & LUXURY STATIONERY",
          `
          <g transform="translate(960, 520)">
            <g transform="translate(-320, -120) rotate(-6)">
              <rect x="-180" y="-110" width="360" height="220" rx="10" fill="#0C0C16" stroke="rgba(201,168,76,0.5)" stroke-width="2"/>
              <path d="M-20,-20 L0,-60 L20,-20 L10,-20 L0,-40 L-10,-20 Z" fill="url(#pGold)"/>
              <text x="0" y="25" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="3">${clientName}</text>
              <text x="0" y="50" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="11" text-anchor="middle">DIRECTION GÉNÉRALE • DAKAR</text>
            </g>
            <g transform="translate(180, 20) rotate(8)">
              <rect x="-180" y="-110" width="360" height="220" rx="10" fill="#F4EFE2" stroke="rgba(201,168,76,0.5)" stroke-width="1.5"/>
              <text x="-140" y="-40" fill="#0C0C16" font-family="'Syne', sans-serif" font-size="16" font-weight="700">MAMADOU NDIAYE</text>
              <text x="-140" y="-20" fill="#7A5E1E" font-family="'Space Grotesk', monospace" font-size="11">DIRECTEUR ASSOCIÉ</text>
              <text x="-140" y="30" fill="#333" font-family="'Space Grotesk', monospace" font-size="11">contact@nanodesign.sn • Dakar</text>
            </g>
            <text x="0" y="290" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="16" text-anchor="middle" font-weight="700">PAPIER COTON 650G • MARQUAGE LAITON DORÉ À CHAUD</text>
          </g>
          `
        )
      },
      {
        title: "08. Signalétique Architecturale & Enseigne Murale 3D",
        url: makeSvgSlide(
          "08 / 10 • SIGNALÉTIQUE ARCHITECTURALE",
          "3D BRASS SIGNAGE ELEVATION",
          `
          <g transform="translate(960, 500)">
            <rect x="-650" y="-220" width="1300" height="440" rx="14" fill="#0D0D18" stroke="rgba(201,168,76,0.3)" stroke-width="1.5"/>
            <g transform="translate(0, -20)">
              <path d="M-50,20 L0,-80 L50,20 L25,20 L0,-30 L-25,20 Z" fill="url(#pGold)"/>
              <text x="0" y="90" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="44" font-weight="800" text-anchor="middle" letter-spacing="8">${clientName}</text>
              <text x="0" y="130" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="16" text-anchor="middle" letter-spacing="4">SIÈGE SOCIAL DAKAR</text>
            </g>
            <text x="0" y="190" fill="#C9A84C" font-family="'Space Grotesk', monospace" font-size="15" text-anchor="middle">Lettres boîtiers laiton massif brossé • Rétro-éclairage LED 3000K</text>
          </g>
          `
        )
      },
      {
        title: "09. Écosystème Digital, Application Mobile & Favicon",
        url: makeSvgSlide(
          "09 / 10 • APPLICATION DIGITALE & MOBILE",
          "APP ICON & RESPONSIVE DESIGN",
          `
          <g transform="translate(960, 520)">
            <g transform="translate(-360, -40)">
              <rect x="-90" y="-90" width="180" height="180" rx="40" fill="#0C0C16" stroke="url(#pGold)" stroke-width="2"/>
              <path d="M-25,12 L0,-40 L25,12 L12,12 L0,-12 L-12,12 Z" fill="url(#pGold)"/>
              <text x="0" y="135" fill="#FFF" font-family="'Space Grotesk', monospace" font-size="14" font-weight="700" text-anchor="middle">APP ICON 1024 × 1024</text>
            </g>
            <g transform="translate(0, -40)">
              <circle cx="0" cy="0" r="90" fill="#0C0C16" stroke="url(#pGold)" stroke-width="2"/>
              <path d="M-25,12 L0,-40 L25,12 L12,12 L0,-12 L-12,12 Z" fill="url(#pGold)"/>
              <text x="0" y="135" fill="#FFF" font-family="'Space Grotesk', monospace" font-size="14" font-weight="700" text-anchor="middle">AVATAR RÉSEAUX SOCIAUX</text>
            </g>
            <g transform="translate(360, -40)">
              <rect x="-50" y="-50" width="100" height="100" rx="20" fill="#0C0C16" stroke="url(#pGold)" stroke-width="2"/>
              <path d="M-15,8 L0,-22 L15,8 L7,8 L0,-7 L-7,8 Z" fill="url(#pGold)"/>
              <text x="0" y="135" fill="#FFF" font-family="'Space Grotesk', monospace" font-size="14" font-weight="700" text-anchor="middle">FAVICON WEB 32 PX</text>
            </g>
          </g>
          `
        )
      },
      {
        title: "10. Règles d'Intégrité de Marque & Interdictions Formelles",
        url: makeSvgSlide(
          "10 / 10 • RÈGLES D'INTÉGRITÉ",
          "FORBIDDEN ALTERATIONS & PRESERVATION",
          `
          <g transform="translate(130, 240)">
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="380" height="320" rx="12" fill="#0F0F1A" stroke="rgba(230,57,70,0.4)" stroke-width="1.5"/>
              <line x1="150" y1="70" x2="230" y2="150" stroke="#E63946" stroke-width="3"/>
              <text x="190" y="220" fill="#E63946" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700" text-anchor="middle">NE PAS DÉFORMER</text>
            </g>
            <g transform="translate(430, 0)">
              <rect x="0" y="0" width="380" height="320" rx="12" fill="#0F0F1A" stroke="rgba(230,57,70,0.4)" stroke-width="1.5"/>
              <line x1="150" y1="70" x2="230" y2="150" stroke="#E63946" stroke-width="3"/>
              <text x="190" y="220" fill="#E63946" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700" text-anchor="middle">COULEURS HORS CHARTE</text>
            </g>
            <g transform="translate(860, 0)">
              <rect x="0" y="0" width="380" height="320" rx="12" fill="#0F0F1A" stroke="rgba(230,57,70,0.4)" stroke-width="1.5"/>
              <line x1="150" y1="70" x2="230" y2="150" stroke="#E63946" stroke-width="3"/>
              <text x="190" y="220" fill="#E63946" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700" text-anchor="middle">PAS D'OMBRE PORTÉE</text>
            </g>
            <g transform="translate(1290, 0)">
              <rect x="0" y="0" width="380" height="320" rx="12" fill="#0F0F1A" stroke="rgba(230,57,70,0.4)" stroke-width="1.5"/>
              <line x1="150" y1="70" x2="230" y2="150" stroke="#E63946" stroke-width="3"/>
              <text x="190" y="220" fill="#E63946" font-family="'Space Grotesk', monospace" font-size="16" font-weight="700" text-anchor="middle">NE PAS PIVOTER L'AXE</text>
            </g>
          </g>
          `
        )
      }
    ];
  }

  function renderBrandbook(slides, project) {
    currentBrandbookSlides = slides || [];
    currentSlideIndex = 0;

    if (bbThumbsStrip) {
      bbThumbsStrip.innerHTML = '';
      currentBrandbookSlides.forEach((slide, idx) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = `brandbook-thumb-item ${idx === 0 ? 'active' : ''}`;
        thumb.setAttribute('data-index', idx);
        thumb.setAttribute('aria-label', `Aller à la planche ${idx + 1}`);
        thumb.innerHTML = `
          <img src="${slide.url}" alt="${slide.title}" class="brandbook-thumb-img" loading="lazy">
          <span class="brandbook-thumb-num">${(idx + 1).toString().padStart(2, '0')}</span>
        `;
        thumb.addEventListener('click', () => {
          goToBrandbookSlide(idx);
        });
        bbThumbsStrip.appendChild(thumb);
      });
    }

    if (bbScrollFlow) {
      bbScrollFlow.innerHTML = '';
      currentBrandbookSlides.forEach((slide, idx) => {
        const item = document.createElement('div');
        item.className = 'brandbook-scroll-item';
        item.innerHTML = `
          <img src="${slide.url}" alt="${slide.title}" loading="lazy">
          <div class="brandbook-scroll-caption">
            <span><strong>Planche ${(idx + 1).toString().padStart(2, '0')}</strong> • ${slide.title}</span>
            <span>1920 × 1080 • NANO DESIGN</span>
          </div>
        `;
        bbScrollFlow.appendChild(item);
      });
    }

    toggleBrandbookMode('deck');
    goToBrandbookSlide(0);
  }

  function goToBrandbookSlide(index) {
    if (!currentBrandbookSlides || currentBrandbookSlides.length === 0) return;

    if (index < 0) index = 0;
    if (index >= currentBrandbookSlides.length) index = currentBrandbookSlides.length - 1;

    currentSlideIndex = index;
    const slide = currentBrandbookSlides[currentSlideIndex];

    if (bbSlideImg) {
      bbSlideImg.style.opacity = '0';
      setTimeout(() => {
        bbSlideImg.src = slide.url;
        bbSlideImg.alt = slide.title;
        bbSlideImg.style.opacity = '1';
      }, 120);
    }

    if (bbSlideCounter) {
      bbSlideCounter.textContent = `Planche ${(currentSlideIndex + 1).toString().padStart(2, '0')} / ${currentBrandbookSlides.length.toString().padStart(2, '0')}`;
    }

    if (bbSlideTitle) {
      bbSlideTitle.textContent = slide.title;
    }

    if (bbProgressBar) {
      const pct = ((currentSlideIndex + 1) / currentBrandbookSlides.length) * 100;
      bbProgressBar.style.width = `${pct}%`;
    }

    if (bbThumbsStrip) {
      const thumbs = bbThumbsStrip.querySelectorAll('.brandbook-thumb-item');
      thumbs.forEach((t, i) => {
        if (i === currentSlideIndex) {
          t.classList.add('active');
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          t.classList.remove('active');
        }
      });
    }
  }

  function nextBrandbookSlide() {
    if (!currentBrandbookSlides || currentBrandbookSlides.length === 0) return;
    const nextIdx = (currentSlideIndex + 1) % currentBrandbookSlides.length;
    goToBrandbookSlide(nextIdx);
  }

  function prevBrandbookSlide() {
    if (!currentBrandbookSlides || currentBrandbookSlides.length === 0) return;
    const prevIdx = (currentSlideIndex - 1 + currentBrandbookSlides.length) % currentBrandbookSlides.length;
    goToBrandbookSlide(prevIdx);
  }

  function toggleBrandbookMode(mode) {
    currentBrandbookMode = mode;
    if (mode === 'scroll') {
      if (bbDeckStage) bbDeckStage.style.display = 'none';
      if (bbScrollStage) bbScrollStage.style.display = 'block';
      if (bbViewDeckBtn) bbViewDeckBtn.classList.remove('active');
      if (bbViewScrollBtn) bbViewScrollBtn.classList.add('active');
    } else {
      if (bbDeckStage) bbDeckStage.style.display = 'flex';
      if (bbScrollStage) bbScrollStage.style.display = 'none';
      if (bbViewDeckBtn) bbViewDeckBtn.classList.add('active');
      if (bbViewScrollBtn) bbViewScrollBtn.classList.remove('active');
    }
  }

  function toggleBrandbookFullscreen() {
    if (!bbStageFrame) return;

    if (!document.fullscreenElement) {
      if (bbStageFrame.requestFullscreen) {
        bbStageFrame.requestFullscreen();
      } else if (bbStageFrame.webkitRequestFullscreen) {
        bbStageFrame.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  // ==============================================================================
  // GESTION DU MODAL LIGHTBOX ÉTUDE DE CAS
  // ==============================================================================

  function openLightbox(project) {
    if (!lightboxModal) return;
    currentActiveProject = project;

    const brandbookSlides = getBrandbookSlidesForProject(project);
    const isBrandbook = Boolean(brandbookSlides && brandbookSlides.length > 0);

    if (isBrandbook) {
      if (lightboxDialog) lightboxDialog.classList.add('brandbook-mode');
      if (lightboxStandardMedia) lightboxStandardMedia.style.display = 'none';
      if (lightboxBrandbookPlayer) lightboxBrandbookPlayer.style.display = 'flex';
      if (bbSpecsBox) bbSpecsBox.style.display = 'flex';
      if (bbSpecsCount) bbSpecsCount.textContent = `${brandbookSlides.length} Planches HD`;
      renderBrandbook(brandbookSlides, project);
    } else {
      if (lightboxDialog) lightboxDialog.classList.remove('brandbook-mode');
      if (lightboxStandardMedia) lightboxStandardMedia.style.display = 'flex';
      if (lightboxBrandbookPlayer) lightboxBrandbookPlayer.style.display = 'none';
      if (bbSpecsBox) bbSpecsBox.style.display = 'none';

      if (lightboxImg) {
        lightboxImg.src = project.imageUrl || '';
        lightboxImg.alt = project.title;
        lightboxImg.style.display = project.imageUrl ? 'block' : 'none';
      }
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

    if (lightboxCta) {
      const categoryMap = {
        'logos': 'logo',
        'web': 'siteweb',
        'supports': 'support'
      };
      const quoteService = categoryMap[project.category] || 'logo';
      lightboxCta.href = `index.html#devis?service=${quoteService}&variant=${encodeURIComponent(project.variant || '')}`;
      lightboxCta.innerHTML = isBrandbook
        ? `<span>Demander une charte graphique similaire ✦</span>`
        : `<span>Demander un devis similaire ✦</span>`;
    }

    if (lightboxLiveLink) {
      if (project.projectUrl && project.projectUrl.trim()) {
        lightboxLiveLink.href = project.projectUrl;
        lightboxLiveLink.style.display = 'inline-flex';
      } else {
        lightboxLiveLink.style.display = 'none';
      }
    }

    if (bbBtnPdf) {
      if (project.brandbookPdf && project.brandbookPdf.trim()) {
        bbBtnPdf.href = project.brandbookPdf;
        bbBtnPdf.style.display = 'inline-flex';
      } else {
        bbBtnPdf.style.display = 'none';
      }
    }

    document.body.style.overflow = 'hidden';
    lightboxModal.classList.add('is-open');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('is-open');
    document.body.style.overflow = '';
    currentActiveProject = null;
    currentBrandbookSlides = [];
  }

})();
