/**
 * GADGON – Main App Logic
 * Instagram-style grid + Reel/Swipe product viewer
 * WhatsApp ordering flow
 */

// ============================
// STATE
// ============================
let currentProducts = [...PRODUCTS];
let activeCategory = 'all';
let activeView = 'grid'; // 'grid' | 'single'
let modalProductIndex = -1;
let touchStartX = 0;
let touchStartY = 0;

// ============================
// DOM REFERENCES
// ============================
const splashScreen = document.getElementById('splash-screen');
const app = document.getElementById('app');
const productsGrid = document.getElementById('products-grid');
const productCount = document.getElementById('product-count');
const noResults = document.getElementById('no-results');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const searchToggle = document.getElementById('search-toggle-btn');
const gridViewBtn = document.getElementById('grid-view-btn');
const singleViewBtn = document.getElementById('single-view-btn');
const mainHeader = document.getElementById('main-header');

// Modal
const productModal = document.getElementById('product-modal');
const modalClose = document.getElementById('modal-close-btn');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');
const modalImg = document.getElementById('modal-img');
const modalBadge = document.getElementById('modal-badge');
const modalCategory = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalOldPrice = document.getElementById('modal-old-price');
const modalSpecs = document.getElementById('modal-specs');
const modalWaBtn = document.getElementById('modal-wa-btn');
const modalDots = document.getElementById('modal-dots');

// Bottom Nav
const navHome = document.getElementById('nav-home');
const navExplore = document.getElementById('nav-explore');
const navDeals = document.getElementById('nav-deals');
const navAbout = document.getElementById('nav-about');

// ============================
// SPLASH SCREEN
// ============================
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            app.classList.remove('hidden');
            renderProducts(PRODUCTS);
        }, 600);
    }, 2000);
});

// ============================
// RENDER PRODUCTS
// ============================
function renderProducts(products) {
    currentProducts = products;
    productsGrid.innerHTML = '';
    noResults.classList.add('hidden');
    productsGrid.classList.remove('hidden');

    if (products.length === 0) {
        noResults.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        productCount.textContent = '0 Products';
        return;
    }

    productCount.textContent = `${products.length} Product${products.length !== 1 ? 's' : ''}`;

    products.forEach((product, index) => {
        const card = createProductCard(product, index);
        productsGrid.appendChild(card);
    });

    // Update modal dots
    renderModalDots();
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.setProperty('--card-index', index);
    card.setAttribute('data-id', product.id);
    card.setAttribute('id', `product-card-${product.id}`);

    const waMsg = encodeURIComponent(
        `🛍️ Hi GADGON! I want to order:\n\n` +
        `📦 Product: ${product.name}\n` +
        `💰 Price: ${product.price}\n` +
        `🔗 Link: https://www.gadgon.com\n\n` +
        `Please confirm availability! ✅`
    );
    const waUrl = `https://wa.me/${GADGON_CONFIG.whatsappNumber}?text=${waMsg}`;

    const badgeClass = product.badge || '';
    const badgeMap = { hot: '🔥 Hot', new: '✨ New', sale: '🏷️ Sale' };

    card.innerHTML = `
    <div class="card-image-wrap">
      <img 
        src="${product.image}" 
        alt="${product.name}" 
        class="card-img"
        loading="lazy"
        onerror="this.src='assets/images/hero-banner.png'"
      />
      ${badgeClass ? `<span class="card-badge ${badgeClass}">${badgeMap[badgeClass]}</span>` : ''}
      <a 
        href="${waUrl}" 
        target="_blank" 
        class="card-wa-quick"
        id="wa-quick-${product.id}"
        aria-label="Order ${product.name} on WhatsApp"
        onclick="event.stopPropagation()"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
    <div class="card-info">
      <div class="card-category">${product.categoryLabel}</div>
      <div class="card-name">${product.name}</div>
      <div class="card-price-row">
        <span class="card-price">${product.price}</span>
        ${product.oldPrice ? `<span class="card-old-price">${product.oldPrice}</span>` : ''}
      </div>
    </div>
  `;

    // Open modal on card click (not on WA button)
    card.addEventListener('click', (e) => {
        if (e.target.closest('.card-wa-quick')) return;
        const idx = currentProducts.findIndex(p => p.id === product.id);
        openModal(idx);
    });

    return card;
}

// ============================
// PRODUCT MODAL
// ============================
function openModal(index) {
    if (index < 0 || index >= currentProducts.length) return;
    modalProductIndex = index;
    populateModal(currentProducts[index]);
    productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    updateModalDots();
}

function closeModal() {
    productModal.classList.add('hidden');
    document.body.style.overflow = '';
    modalProductIndex = -1;
}

function populateModal(product) {
    const waMsg = encodeURIComponent(
        `🛍️ Hi GADGON! I want to order:\n\n` +
        `📦 Product: ${product.name}\n` +
        `💰 Price: ${product.price}\n` +
        `🔗 Link: https://www.gadgon.com\n\n` +
        `Please confirm availability! ✅`
    );
    const waUrl = `https://wa.me/${GADGON_CONFIG.whatsappNumber}?text=${waMsg}`;

    modalImg.src = product.image;
    modalImg.alt = product.name;

    // Badge
    const badgeMap = { hot: '🔥 Hot Pick', new: '✨ New Arrival', sale: '🏷️ On Sale' };
    if (product.badge) {
        modalBadge.textContent = badgeMap[product.badge] || '';
        modalBadge.className = `modal-badge ${product.badge}`;
        modalBadge.style.display = '';
    } else {
        modalBadge.style.display = 'none';
    }

    modalCategory.textContent = product.categoryLabel;
    modalTitle.textContent = product.name;
    modalDesc.textContent = product.description;
    modalPrice.textContent = product.price;
    modalOldPrice.textContent = product.oldPrice || '';

    // Specs
    modalSpecs.innerHTML = '';
    if (product.specs && product.specs.length) {
        product.specs.forEach(spec => {
            const tag = document.createElement('span');
            tag.className = 'spec-tag';
            tag.textContent = spec;
            modalSpecs.appendChild(tag);
        });
    }

    modalWaBtn.href = waUrl;

    // Scroll to top
    document.getElementById('modal-content').scrollTop = 0;
}

function navigateModal(direction) {
    const newIndex = modalProductIndex + direction;
    if (newIndex >= 0 && newIndex < currentProducts.length) {
        modalProductIndex = newIndex;
        // Animate transition
        modalImg.style.opacity = '0';
        setTimeout(() => {
            populateModal(currentProducts[modalProductIndex]);
            modalImg.style.opacity = '1';
            updateModalDots();
        }, 150);
    }
}

// Modal dots
function renderModalDots() {
    modalDots.innerHTML = '';
    PRODUCTS.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'modal-dot';
        modalDots.appendChild(dot);
    });
}

function updateModalDots() {
    const dots = modalDots.querySelectorAll('.modal-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === modalProductIndex);
    });
}

// Modal events
modalClose.addEventListener('click', closeModal);
modalPrev.addEventListener('click', () => navigateModal(-1));
modalNext.addEventListener('click', () => navigateModal(1));

productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeModal();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (productModal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigateModal(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigateModal(-1);
});

// Touch/swipe for modal
productModal.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

productModal.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        // Horizontal swipe
        if (dx < 0) navigateModal(1);
        else navigateModal(-1);
    }
}, { passive: true });

// ============================
// SEARCH
// ============================
searchToggle.addEventListener('click', () => {
    const isOpen = searchBar.classList.toggle('open');
    if (isOpen) {
        setTimeout(() => searchInput.focus(), 100);
    } else {
        searchInput.value = '';
        filterProducts();
    }
});

searchInput.addEventListener('input', () => {
    filterProducts();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterProducts();
    searchInput.focus();
});

// ============================
// CATEGORY FILTER
// ============================
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        filterProducts();
    });
});

function filterProducts() {
    const query = searchInput.value.trim().toLowerCase();

    let filtered = PRODUCTS;

    // Category filter
    if (activeCategory !== 'all') {
        filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Search filter
    if (query) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.categoryLabel.toLowerCase().includes(query)
        );
    }

    renderProducts(filtered);
}

// ============================
// VIEW TOGGLE (Grid / Single)
// ============================
gridViewBtn.addEventListener('click', () => {
    activeView = 'grid';
    productsGrid.classList.remove('single-col');
    gridViewBtn.classList.add('active');
    singleViewBtn.classList.remove('active');
});

singleViewBtn.addEventListener('click', () => {
    activeView = 'single';
    productsGrid.classList.add('single-col');
    singleViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
});

// ============================
// BOTTOM NAV
// ============================
const navButtons = [navHome, navExplore, navDeals, navAbout];

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const page = btn.dataset.page;

        if (page === 'home') {
            activeCategory = 'all';
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-cat="all"]').classList.add('active');
            renderProducts(PRODUCTS);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (page === 'explore') {
            // Open search
            searchBar.classList.add('open');
            setTimeout(() => searchInput.focus(), 100);
        }

        if (page === 'deals') {
            // Show sale items
            const deals = PRODUCTS.filter(p => p.badge === 'sale' || p.badge === 'hot');
            activeCategory = 'all';
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-cat="all"]').classList.add('active');
            renderProducts(deals);
            // Scroll to products
            document.getElementById('products-section-header').scrollIntoView({ behavior: 'smooth' });
        }

        if (page === 'about') {
            showAboutModal();
        }
    });
});

// ============================
// ABOUT MODAL (Simple)
// ============================
function showAboutModal() {
    const about = document.createElement('div');
    about.className = 'modal-overlay';
    about.id = 'about-modal';
    about.innerHTML = `
    <div style="
      background: #13131f;
      border-radius: 24px;
      max-width: 380px;
      width: 90%;
      padding: 32px 24px;
      border: 1px solid rgba(255,255,255,0.08);
      text-align: center;
      position: relative;
    ">
      <button onclick="document.getElementById('about-modal').remove()" style="
        position: absolute; top: 16px; right: 16px;
        background: rgba(255,255,255,0.05); border: none; 
        width: 34px; height: 34px; border-radius: 50%;
        color: white; cursor: pointer; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
      ">✕</button>
      <img src="assets/images/logo.png" style="width: 120px; margin: 0 auto 16px; filter: drop-shadow(0 0 20px rgba(108,99,255,0.5));" alt="GADGON Logo" />
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">About GADGON</h2>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Your go-to destination for next-generation gadgets.<br/>
        Premium tech at the best prices,<br/>delivered with ease.
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a href="https://wa.me/${GADGON_CONFIG.whatsappNumber}?text=Hi%20GADGON!%20I%20have%20a%20question%20about%20your%20store." 
           target="_blank"
           style="
            display: flex; align-items: center; justify-content: center; gap: 10px;
            padding: 14px; background: #25D366; border-radius: 14px;
            color: white; font-weight: 700; font-size: 15px; text-decoration: none;
           ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Contact Us on WhatsApp
        </a>
      </div>
    </div>
  `;
    document.body.appendChild(about);
    about.addEventListener('click', (e) => { if (e.target === about) about.remove(); });
}

// ============================
// SCROLL EFFECTS
// ============================
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header shadow on scroll
    if (scrollY > 10) {
        mainHeader.classList.add('scrolled');
    } else {
        mainHeader.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
}, { passive: true });

// ============================
// INIT
// ============================
renderModalDots();
console.log('%c🚀 GADGON Store Loaded!', 'color: #6c63ff; font-size: 16px; font-weight: bold;');
