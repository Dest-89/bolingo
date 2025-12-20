/**
 * BOLINGO Admin Dashboard JavaScript
 * Full CMS functionality for managing blog, store, and directory content
 */

const AdminApp = (function() {
  'use strict';

  // ==========================================================================
  // State
  // ==========================================================================
  const state = {
    isAuthenticated: false,
    currentPanel: 'dashboard',
    blogCategories: [],
    storeCategories: [],
    posts: [],
    products: [],
    listings: [],
    editingItem: null,
    editingType: null,
    searchDebounce: null
  };

  // ==========================================================================
  // DOM Elements Cache
  // ==========================================================================
  const elements = {};

  function cacheElements() {
    elements.loginScreen = document.getElementById('login-screen');
    elements.loginToken = document.getElementById('login-token');
    elements.loginBtn = document.getElementById('login-btn');
    elements.loginError = document.getElementById('login-error');
    elements.adminLayout = document.getElementById('admin-layout');
    elements.sidebar = document.getElementById('admin-sidebar');
    elements.menuToggle = document.getElementById('menu-toggle');
    elements.headerTitle = document.getElementById('header-title');
    elements.logoutBtn = document.getElementById('logout-btn');
    elements.modalsContainer = document.getElementById('modals-container');
    elements.toastContainer = document.getElementById('toast-container');
    elements.loadingOverlay = document.getElementById('loading');

    // Stats
    elements.statPosts = document.getElementById('stat-posts');
    elements.statProducts = document.getElementById('stat-products');
    elements.statListings = document.getElementById('stat-listings');
    elements.blogCount = document.getElementById('blog-count');
    elements.storeCount = document.getElementById('store-count');
    elements.directoryCount = document.getElementById('directory-count');

    // Lists
    elements.blogCategoriesList = document.getElementById('blog-categories-list');
    elements.storeCategoriesList = document.getElementById('store-categories-list');
    elements.postsTbody = document.getElementById('posts-tbody');
    elements.productsTbody = document.getElementById('products-tbody');
    elements.listingsTbody = document.getElementById('listings-tbody');

    // Filters
    elements.filterPostCategory = document.getElementById('filter-post-category');
    elements.filterProductCategory = document.getElementById('filter-product-category');
    elements.filterListingState = document.getElementById('filter-listing-state');

    // Search inputs
    elements.searchPosts = document.getElementById('search-posts');
    elements.searchProducts = document.getElementById('search-products');
    elements.searchListings = document.getElementById('search-listings');
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatPrice(price) {
    if (!price && price !== 0) return '-';
    return '$' + parseFloat(price).toFixed(2);
  }

  function getProductStatusLabel(status) {
    const labels = {
      'active': 'In Stock',
      'coming_soon': 'Coming Soon',
      'out_of_stock': 'Out of Stock',
      'inactive': 'Hidden'
    };
    return labels[status] || 'In Stock';
  }

  function getProductStatusClass(status) {
    const classes = {
      'active': 'active',
      'coming_soon': 'warning',
      'out_of_stock': 'inactive',
      'inactive': 'inactive'
    };
    return classes[status] || 'active';
  }

  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast--${type}`;

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `
      <div class="admin-toast__icon">${icons[type] || icons.info}</div>
      <span class="admin-toast__message">${escapeHtml(message)}</span>
      <button class="admin-toast__close" onclick="this.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ==========================================================================
  // Loading States
  // ==========================================================================
  function showLoading() {
    elements.loadingOverlay.classList.add('active');
  }

  function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
  }

  function setButtonLoading(btn, loading, originalText = null) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.innerHTML = '<span class="admin-loading__spinner" style="width:16px;height:16px;border-width:2px;"></span>';
    } else {
      btn.disabled = false;
      btn.textContent = originalText || btn.dataset.originalText || 'Submit';
    }
  }

  // ==========================================================================
  // Authentication
  // ==========================================================================
  function checkAuth() {
    const token = API.hasAdminToken();
    if (token) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    state.isAuthenticated = false;
    elements.loginScreen.classList.remove('hidden');
    elements.adminLayout.style.display = 'none';
  }

  function showDashboard() {
    state.isAuthenticated = true;
    elements.loginScreen.classList.add('hidden');
    elements.adminLayout.style.display = 'flex';
    loadAllContent();
  }

  async function handleLogin() {
    const token = elements.loginToken.value.trim();

    if (!token) {
      elements.loginError.textContent = 'Please enter your GitHub token';
      elements.loginError.classList.add('active');
      return;
    }

    setButtonLoading(elements.loginBtn, true);
    elements.loginError.classList.remove('active');

    try {
      // Test the token by making a simple API call
      API.setAdminToken(token);

      // Try to fetch something to verify
      await API.getBlogCategories();

      showToast('Welcome to BOLINGO Admin', 'success');
      showDashboard();
    } catch (error) {
      API.setAdminToken(null);
      elements.loginError.textContent = 'Invalid token or API error. Please try again.';
      elements.loginError.classList.add('active');
    } finally {
      setButtonLoading(elements.loginBtn, false, 'Sign In');
    }
  }

  function handleLogout() {
    API.setAdminToken(null);
    API.clearCache();
    state.posts = [];
    state.products = [];
    state.listings = [];
    state.blogCategories = [];
    state.storeCategories = [];
    showToast('Logged out successfully', 'info');
    showLogin();
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================
  function initNavigation() {
    // Panel navigation
    document.querySelectorAll('[data-panel]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const panel = btn.dataset.panel;
        navigateToPanel(panel);
      });
    });

    // Mobile menu toggle
    elements.menuToggle?.addEventListener('click', () => {
      elements.sidebar.classList.toggle('open');
    });

    // Close sidebar on panel click (mobile)
    document.querySelectorAll('.admin-nav-item[data-panel]').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          elements.sidebar.classList.remove('open');
        }
      });
    });
  }

  function navigateToPanel(panelId) {
    state.currentPanel = panelId;

    // Update nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.panel === panelId) {
        item.classList.add('active');
      }
    });

    // Update panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`panel-${panelId}`)?.classList.add('active');

    // Update header title
    const titles = {
      dashboard: 'Dashboard',
      blog: 'Blog Management',
      store: 'Store Management',
      directory: 'Directory Management',
      settings: 'Settings'
    };
    elements.headerTitle.textContent = titles[panelId] || 'Dashboard';
  }

  // ==========================================================================
  // Load Content
  // ==========================================================================
  async function loadAllContent() {
    showLoading();

    try {
      await Promise.all([
        loadBlogCategories(),
        loadStoreCategories(),
        loadPosts(),
        loadProducts(),
        loadListings()
      ]);
      updateStats();
    } catch (error) {
      console.error('Error loading content:', error);
      showToast('Error loading some content', 'error');
    } finally {
      hideLoading();
    }
  }

  async function loadBlogCategories() {
    try {
      const result = await API.getBlogCategories();
      state.blogCategories = result.data || result || [];
      renderBlogCategories();
      populateCategoryFilter('blog');
    } catch (error) {
      console.error('Error loading blog categories:', error);
    }
  }

  async function loadStoreCategories() {
    try {
      const result = await API.getStoreCategories();
      state.storeCategories = result.data || result || [];
      renderStoreCategories();
      populateCategoryFilter('store');
    } catch (error) {
      console.error('Error loading store categories:', error);
    }
  }

  async function loadPosts() {
    try {
      const result = await API.getBlogPostsAdmin();
      state.posts = result.data || result || [];
      renderPosts();
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  async function loadProducts() {
    try {
      const result = await API.getStoreProductsAdmin();
      state.products = result.data || result || [];
      renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async function loadListings() {
    try {
      const result = await API.getDirectoryListingsAdmin();
      state.listings = result.data || result || [];
      renderListings();
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  }

  // ==========================================================================
  // Render Functions
  // ==========================================================================
  function updateStats() {
    elements.statPosts.textContent = state.posts.length;
    elements.statProducts.textContent = state.products.length;
    elements.statListings.textContent = state.listings.length;
    elements.blogCount.textContent = state.posts.length;
    elements.storeCount.textContent = state.products.length;
    elements.directoryCount.textContent = state.listings.length;
  }

  function renderBlogCategories() {
    if (!elements.blogCategoriesList) return;

    if (state.blogCategories.length === 0) {
      elements.blogCategoriesList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: var(--space-4); color: var(--color-text-muted);">
          No categories yet. Create your first category to get started.
        </div>
      `;
      return;
    }

    elements.blogCategoriesList.innerHTML = state.blogCategories.map(cat => `
      <div class="admin-category-card">
        <span class="admin-category-card__name">${escapeHtml(cat.name)}</span>
        <div class="admin-category-card__actions">
          <button class="admin-table__btn" onclick="AdminApp.editCategory('blog', '${escapeHtml(cat.slug)}')" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="admin-table__btn admin-table__btn--delete" onclick="AdminApp.deleteCategory('blog', '${escapeHtml(cat.slug)}')" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderStoreCategories() {
    if (!elements.storeCategoriesList) return;

    if (state.storeCategories.length === 0) {
      elements.storeCategoriesList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: var(--space-4); color: var(--color-text-muted);">
          No categories yet. Create your first category to get started.
        </div>
      `;
      return;
    }

    elements.storeCategoriesList.innerHTML = state.storeCategories.map(cat => `
      <div class="admin-category-card">
        <span class="admin-category-card__name">${escapeHtml(cat.name)}</span>
        <div class="admin-category-card__actions">
          <button class="admin-table__btn" onclick="AdminApp.editCategory('store', '${escapeHtml(cat.slug)}')" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="admin-table__btn admin-table__btn--delete" onclick="AdminApp.deleteCategory('store', '${escapeHtml(cat.slug)}')" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderPosts(filtered = null) {
    const posts = filtered || state.posts;

    if (!elements.postsTbody) return;

    if (posts.length === 0) {
      elements.postsTbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="admin-empty">
              <div class="admin-empty__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <h3 class="admin-empty__title">No Posts Yet</h3>
              <p class="admin-empty__text">Create your first blog post to get started</p>
              <button class="admin-btn admin-btn--primary" onclick="AdminApp.openModal('post')">Create Post</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    elements.postsTbody.innerHTML = posts.map(post => {
      const category = state.blogCategories.find(c => c.slug === post.category_slug) || {};
      return `
        <tr>
          <td>
            <div class="admin-table__item">
              <img src="${escapeHtml(post.featured_image_url) || 'https://via.placeholder.com/48'}" alt="" class="admin-table__thumb">
              <div>
                <div class="admin-table__title">${escapeHtml(post.title)}</div>
                <div class="admin-table__subtitle">${escapeHtml(post.slug)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(category.name || post.category_slug || '-')}</td>
          <td><span class="admin-table__badge admin-table__badge--${post.status === 'active' ? 'published' : 'draft'}">${post.status === 'active' ? 'Published' : 'Draft'}</span></td>
          <td>${formatDate(post.published_at || post.created_at)}</td>
          <td>
            <div class="admin-table__actions">
              <button class="admin-table__btn" onclick="AdminApp.editPost('${escapeHtml(post.slug)}')" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="admin-table__btn admin-table__btn--delete" onclick="AdminApp.deletePost('${escapeHtml(post.slug)}')" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderProducts(filtered = null) {
    const products = filtered || state.products;

    if (!elements.productsTbody) return;

    if (products.length === 0) {
      elements.productsTbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="admin-empty">
              <div class="admin-empty__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3 class="admin-empty__title">No Products Yet</h3>
              <p class="admin-empty__text">Add your first product to the store</p>
              <button class="admin-btn admin-btn--primary" onclick="AdminApp.openModal('product')">Add Product</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    elements.productsTbody.innerHTML = products.map(product => {
      const category = state.storeCategories.find(c => c.slug === product.category_slug) || {};
      return `
        <tr>
          <td>
            <div class="admin-table__item">
              <img src="${escapeHtml(product.featured_image_url) || 'https://via.placeholder.com/48'}" alt="" class="admin-table__thumb">
              <div>
                <div class="admin-table__title">${escapeHtml(product.title)}</div>
                <div class="admin-table__subtitle">${escapeHtml(product.sku || product.slug)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(category.name || product.category_slug || '-')}</td>
          <td>${formatPrice(product.price)}</td>
          <td><span class="admin-table__badge admin-table__badge--${getProductStatusClass(product.status)}">${getProductStatusLabel(product.status)}</span></td>
          <td>
            <div class="admin-table__actions">
              <button class="admin-table__btn" onclick="AdminApp.editProduct('${escapeHtml(product.slug)}')" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="admin-table__btn admin-table__btn--delete" onclick="AdminApp.deleteProduct('${escapeHtml(product.slug)}')" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderListings(filtered = null) {
    const listings = filtered || state.listings;

    if (!elements.listingsTbody) return;

    if (listings.length === 0) {
      elements.listingsTbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="admin-empty">
              <div class="admin-empty__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 class="admin-empty__title">No Listings Yet</h3>
              <p class="admin-empty__text">Add your first hunting location</p>
              <button class="admin-btn admin-btn--primary" onclick="AdminApp.openModal('listing')">Add Listing</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    elements.listingsTbody.innerHTML = listings.map(listing => `
      <tr>
        <td>
          <div class="admin-table__item">
            <img src="${escapeHtml(listing.featured_image_url) || 'https://via.placeholder.com/48'}" alt="" class="admin-table__thumb">
            <div>
              <div class="admin-table__title">${escapeHtml(listing.name)}</div>
              <div class="admin-table__subtitle">${escapeHtml(listing.city || '')}${listing.city && listing.state ? ', ' : ''}${escapeHtml(listing.state || '')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(listing.type || '-')}</td>
        <td>${escapeHtml(listing.state || '-')}</td>
        <td><span class="admin-table__badge admin-table__badge--${listing.access === 'Free' ? 'published' : 'draft'}">${escapeHtml(listing.access || 'Unknown')}</span></td>
        <td>
          <div class="admin-table__actions">
            <button class="admin-table__btn" onclick="AdminApp.editListing('${escapeHtml(listing.slug)}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="admin-table__btn admin-table__btn--delete" onclick="AdminApp.deleteListing('${escapeHtml(listing.slug)}')" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ==========================================================================
  // Filters & Search
  // ==========================================================================
  function populateCategoryFilter(type) {
    const categories = type === 'blog' ? state.blogCategories : state.storeCategories;
    const select = type === 'blog' ? elements.filterPostCategory : elements.filterProductCategory;

    if (!select) return;

    select.innerHTML = `<option value="">All Categories</option>` +
      categories.map(cat => `<option value="${escapeHtml(cat.slug)}">${escapeHtml(cat.name)}</option>`).join('');
  }

  function initSearch() {
    // Posts search
    elements.searchPosts?.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase();
      const categoryFilter = elements.filterPostCategory?.value;

      const filtered = state.posts.filter(post => {
        const matchesSearch = !query ||
          post.title?.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query);
        const matchesCategory = !categoryFilter || post.category_slug === categoryFilter;
        return matchesSearch && matchesCategory;
      });

      renderPosts(filtered);
    }, 300));

    elements.filterPostCategory?.addEventListener('change', () => {
      elements.searchPosts?.dispatchEvent(new Event('input'));
    });

    // Products search
    elements.searchProducts?.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase();
      const categoryFilter = elements.filterProductCategory?.value;

      const filtered = state.products.filter(product => {
        const matchesSearch = !query ||
          product.title?.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query);
        const matchesCategory = !categoryFilter || product.category_slug === categoryFilter;
        return matchesSearch && matchesCategory;
      });

      renderProducts(filtered);
    }, 300));

    elements.filterProductCategory?.addEventListener('change', () => {
      elements.searchProducts?.dispatchEvent(new Event('input'));
    });

    // Listings search
    elements.searchListings?.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase();
      const stateFilter = elements.filterListingState?.value;

      const filtered = state.listings.filter(listing => {
        const matchesSearch = !query ||
          listing.name?.toLowerCase().includes(query) ||
          listing.city?.toLowerCase().includes(query);
        const matchesState = !stateFilter || listing.state === stateFilter;
        return matchesSearch && matchesState;
      });

      renderListings(filtered);
    }, 300));

    elements.filterListingState?.addEventListener('change', () => {
      elements.searchListings?.dispatchEvent(new Event('input'));
    });
  }

  // ==========================================================================
  // Modals
  // ==========================================================================
  function openModal(type, data = null) {
    state.editingItem = data;
    state.editingType = type;

    const modals = {
      'blog-category': createBlogCategoryModal,
      'store-category': createStoreCategoryModal,
      'post': createPostModal,
      'product': createProductModal,
      'listing': createListingModal,
      'confirm': createConfirmModal
    };

    const createFn = modals[type];
    if (!createFn) return;

    const modal = createFn(data);
    elements.modalsContainer.innerHTML = modal;

    const modalEl = elements.modalsContainer.querySelector('.admin-modal');
    setTimeout(() => modalEl?.classList.add('active'), 10);

    // Setup image upload if present
    initImageUpload();

    // Auto-generate slug
    initSlugGeneration();
  }

  function closeModal() {
    const modal = elements.modalsContainer.querySelector('.admin-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        elements.modalsContainer.innerHTML = '';
        state.editingItem = null;
        state.editingType = null;
      }, 300);
    }
  }

  // Modal Templates
  function createBlogCategoryModal(data = null) {
    const isEdit = !!data;
    return `
      <div class="admin-modal">
        <div class="admin-modal__content">
          <div class="admin-modal__header">
            <h2 class="admin-modal__title">${isEdit ? 'Edit' : 'New'} Blog Category</h2>
            <button class="admin-modal__close" onclick="AdminApp.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="admin-modal__body">
            <form id="category-form">
              <div class="admin-form-group">
                <label class="admin-form-label admin-form-label--required">Category Name</label>
                <input type="text" class="admin-form-input" name="name" id="modal-name" value="${escapeHtml(data?.name || '')}" required>
              </div>
              <div class="admin-form-group">
                <label class="admin-form-label admin-form-label--required">Slug</label>
                <input type="text" class="admin-form-input" name="slug" id="modal-slug" value="${escapeHtml(data?.slug || '')}" required ${isEdit ? 'readonly' : ''}>
                <p class="admin-form-help">URL-friendly identifier (auto-generated from name)</p>
              </div>
              <div class="admin-form-group">
                <label class="admin-form-label">Description</label>
                <textarea class="admin-form-textarea" name="description" rows="3">${escapeHtml(data?.description || '')}</textarea>
              </div>
            </form>
          </div>
          <div class="admin-modal__footer">
            <button class="admin-btn admin-btn--ghost" onclick="AdminApp.closeModal()">Cancel</button>
            <button class="admin-btn admin-btn--primary" id="modal-submit" onclick="AdminApp.saveBlogCategory()">
              ${isEdit ? 'Update' : 'Create'} Category
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function createStoreCategoryModal(data = null) {
    const isEdit = !!data;
    return `
      <div class="admin-modal">
        <div class="admin-modal__content">
          <div class="admin-modal__header">
            <h2 class="admin-modal__title">${isEdit ? 'Edit' : 'New'} Store Category</h2>
            <button class="admin-modal__close" onclick="AdminApp.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="admin-modal__body">
            <form id="category-form">
              <div class="admin-form-group">
                <label class="admin-form-label admin-form-label--required">Category Name</label>
                <input type="text" class="admin-form-input" name="name" id="modal-name" value="${escapeHtml(data?.name || '')}" required>
              </div>
              <div class="admin-form-group">
                <label class="admin-form-label admin-form-label--required">Slug</label>
                <input type="text" class="admin-form-input" name="slug" id="modal-slug" value="${escapeHtml(data?.slug || '')}" required ${isEdit ? 'readonly' : ''}>
                <p class="admin-form-help">URL-friendly identifier (auto-generated from name)</p>
              </div>
              <div class="admin-form-group">
                <label class="admin-form-label">Description</label>
                <textarea class="admin-form-textarea" name="description" rows="3">${escapeHtml(data?.description || '')}</textarea>
              </div>
            </form>
          </div>
          <div class="admin-modal__footer">
            <button class="admin-btn admin-btn--ghost" onclick="AdminApp.closeModal()">Cancel</button>
            <button class="admin-btn admin-btn--primary" id="modal-submit" onclick="AdminApp.saveStoreCategory()">
              ${isEdit ? 'Update' : 'Create'} Category
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function createPostModal(data = null) {
    const isEdit = !!data;
    const categoryOptions = state.blogCategories.map(cat =>
      `<option value="${escapeHtml(cat.slug)}" ${data?.category_slug === cat.slug ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`
    ).join('');

    return `
      <div class="admin-modal">
        <div class="admin-modal__content admin-modal__content--lg">
          <div class="admin-modal__header">
            <h2 class="admin-modal__title">${isEdit ? 'Edit' : 'New'} Blog Post</h2>
            <button class="admin-modal__close" onclick="AdminApp.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="admin-modal__body">
            <form id="post-form">
              <div class="admin-form-group">
                <label class="admin-form-label admin-form-label--required">Title</label>
                <input type="text" class="admin-form-input" name="title" id="modal-name" value="${escapeHtml(data?.title || '')}" required>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Slug</label>
                  <input type="text" class="admin-form-input" name="slug" id="modal-slug" value="${escapeHtml(data?.slug || '')}" required ${isEdit ? 'readonly' : ''}>
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Category</label>
                  <select class="admin-form-select" name="category_slug" required>
                    <option value="">Select category...</option>
                    ${categoryOptions}
                  </select>
                </div>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Excerpt</label>
                <textarea class="admin-form-textarea" name="excerpt" rows="2">${escapeHtml(data?.excerpt || '')}</textarea>
                <p class="admin-form-help">Brief summary shown in listings</p>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Content</label>
                <textarea class="admin-form-textarea" name="content" rows="10" style="min-height: 200px;">${escapeHtml(data?.content || '')}</textarea>
                <p class="admin-form-help">Supports Markdown formatting</p>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Featured Image</label>
                <div class="admin-image-upload" id="image-upload">
                  <input type="file" class="admin-image-upload__input" id="image-input" accept="image/*">
                  <div class="admin-image-upload__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="admin-image-upload__text">Click or drag image here</p>
                  <p class="admin-image-upload__hint">PNG, JPG up to 5MB</p>
                  <div class="admin-image-upload__preview" id="image-preview" ${data?.featured_image_url ? 'class="active"' : ''}>
                    <img src="${escapeHtml(data?.featured_image_url || '')}" alt="Preview" id="preview-img">
                  </div>
                </div>
                <input type="hidden" name="featured_image_url" id="featured-image-url" value="${escapeHtml(data?.featured_image_url || '')}">
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label">Author</label>
                  <input type="text" class="admin-form-input" name="author" value="${escapeHtml(data?.author || 'BOLINGO Team')}">
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">Status</label>
                  <select class="admin-form-select" name="status">
                    <option value="active" ${data?.status === 'active' ? 'selected' : ''}>Published</option>
                    <option value="draft" ${data?.status === 'draft' ? 'selected' : ''}>Draft</option>
                  </select>
                </div>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Tags</label>
                <input type="text" class="admin-form-input" name="tags" value="${escapeHtml((data?.tags || []).join(', '))}">
                <p class="admin-form-help">Comma-separated list</p>
              </div>
            </form>
          </div>
          <div class="admin-modal__footer">
            <button class="admin-btn admin-btn--ghost" onclick="AdminApp.closeModal()">Cancel</button>
            <button class="admin-btn admin-btn--primary" id="modal-submit" onclick="AdminApp.savePost()">
              ${isEdit ? 'Update' : 'Create'} Post
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function createProductModal(data = null) {
    const isEdit = !!data;
    const categoryOptions = state.storeCategories.map(cat =>
      `<option value="${escapeHtml(cat.slug)}" ${data?.category_slug === cat.slug ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`
    ).join('');

    return `
      <div class="admin-modal">
        <div class="admin-modal__content admin-modal__content--lg">
          <div class="admin-modal__header">
            <h2 class="admin-modal__title">${isEdit ? 'Edit' : 'New'} Product</h2>
            <button class="admin-modal__close" onclick="AdminApp.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="admin-modal__body">
            <form id="product-form">
              <div class="admin-form-group">
                <label class="admin-form-label admin-form-label--required">Product Name</label>
                <input type="text" class="admin-form-input" name="title" id="modal-name" value="${escapeHtml(data?.title || '')}" required>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Slug</label>
                  <input type="text" class="admin-form-input" name="slug" id="modal-slug" value="${escapeHtml(data?.slug || '')}" required ${isEdit ? 'readonly' : ''}>
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">SKU</label>
                  <input type="text" class="admin-form-input" name="sku" value="${escapeHtml(data?.sku || '')}">
                </div>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Category</label>
                  <select class="admin-form-select" name="category_slug" required>
                    <option value="">Select category...</option>
                    ${categoryOptions}
                  </select>
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Price</label>
                  <input type="number" class="admin-form-input" name="price" step="0.01" min="0" value="${data?.price || ''}" required>
                </div>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label">Brand</label>
                  <input type="text" class="admin-form-input" name="brand" value="${escapeHtml(data?.brand || '')}">
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">Status</label>
                  <select class="admin-form-select" name="status">
                    <option value="active" ${data?.status === 'active' || !data?.status ? 'selected' : ''}>In Stock</option>
                    <option value="coming_soon" ${data?.status === 'coming_soon' ? 'selected' : ''}>Coming Soon</option>
                    <option value="out_of_stock" ${data?.status === 'out_of_stock' ? 'selected' : ''}>Out of Stock</option>
                    <option value="inactive" ${data?.status === 'inactive' ? 'selected' : ''}>Hidden</option>
                  </select>
                </div>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Description</label>
                <textarea class="admin-form-textarea" name="content" rows="6">${escapeHtml(data?.content || '')}</textarea>
                <p class="admin-form-help">Supports Markdown formatting</p>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Featured Image</label>
                <div class="admin-image-upload" id="image-upload">
                  <input type="file" class="admin-image-upload__input" id="image-input" accept="image/*">
                  <div class="admin-image-upload__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="admin-image-upload__text">Click or drag image here</p>
                  <p class="admin-image-upload__hint">PNG, JPG up to 5MB</p>
                  <div class="admin-image-upload__preview" id="image-preview" ${data?.featured_image_url ? 'class="active"' : ''}>
                    <img src="${escapeHtml(data?.featured_image_url || '')}" alt="Preview" id="preview-img">
                  </div>
                </div>
                <input type="hidden" name="featured_image_url" id="featured-image-url" value="${escapeHtml(data?.featured_image_url || '')}">
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">ThriveCart Checkout URL</label>
                <input type="url" class="admin-form-input" name="thrivecart_checkout_url" value="${escapeHtml(data?.thrivecart_checkout_url || '')}">
                <p class="admin-form-help">Link to ThriveCart checkout page</p>
              </div>
            </form>
          </div>
          <div class="admin-modal__footer">
            <button class="admin-btn admin-btn--ghost" onclick="AdminApp.closeModal()">Cancel</button>
            <button class="admin-btn admin-btn--primary" id="modal-submit" onclick="AdminApp.saveProduct()">
              ${isEdit ? 'Update' : 'Create'} Product
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function createListingModal(data = null) {
    const isEdit = !!data;

    return `
      <div class="admin-modal">
        <div class="admin-modal__content admin-modal__content--lg">
          <div class="admin-modal__header">
            <h2 class="admin-modal__title">${isEdit ? 'Edit' : 'New'} Directory Listing</h2>
            <button class="admin-modal__close" onclick="AdminApp.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="admin-modal__body">
            <form id="listing-form">
              <div class="admin-form-group">
                <label class="admin-form-label admin-form-label--required">Location Name</label>
                <input type="text" class="admin-form-input" name="name" id="modal-name" value="${escapeHtml(data?.name || '')}" required>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Slug</label>
                  <input type="text" class="admin-form-input" name="slug" id="modal-slug" value="${escapeHtml(data?.slug || '')}" required ${isEdit ? 'readonly' : ''}>
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Type</label>
                  <select class="admin-form-select" name="type" required>
                    <option value="">Select type...</option>
                    <option value="Wildlife Management Area" ${data?.type === 'Wildlife Management Area' ? 'selected' : ''}>Wildlife Management Area</option>
                    <option value="National Forest" ${data?.type === 'National Forest' ? 'selected' : ''}>National Forest</option>
                    <option value="State Park" ${data?.type === 'State Park' ? 'selected' : ''}>State Park</option>
                    <option value="Private Land" ${data?.type === 'Private Land' ? 'selected' : ''}>Private Land</option>
                    <option value="Hunting Club" ${data?.type === 'Hunting Club' ? 'selected' : ''}>Hunting Club</option>
                    <option value="Outfitter" ${data?.type === 'Outfitter' ? 'selected' : ''}>Outfitter</option>
                  </select>
                </div>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">Access</label>
                  <select class="admin-form-select" name="access" required>
                    <option value="Free" ${data?.access === 'Free' ? 'selected' : ''}>Free</option>
                    <option value="Permit Required" ${data?.access === 'Permit Required' ? 'selected' : ''}>Permit Required</option>
                    <option value="Membership" ${data?.access === 'Membership' ? 'selected' : ''}>Membership</option>
                    <option value="Fee" ${data?.access === 'Fee' ? 'selected' : ''}>Fee</option>
                  </select>
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">Status</label>
                  <select class="admin-form-select" name="status">
                    <option value="active" ${data?.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${data?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                  </select>
                </div>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Address</label>
                <input type="text" class="admin-form-input" name="address" value="${escapeHtml(data?.address || '')}">
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label">City</label>
                  <input type="text" class="admin-form-input" name="city" value="${escapeHtml(data?.city || '')}">
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label admin-form-label--required">State</label>
                  <select class="admin-form-select" name="state" required>
                    <option value="">Select state...</option>
                    <option value="VA" ${data?.state === 'VA' ? 'selected' : ''}>Virginia</option>
                    <option value="NC" ${data?.state === 'NC' ? 'selected' : ''}>North Carolina</option>
                    <option value="MD" ${data?.state === 'MD' ? 'selected' : ''}>Maryland</option>
                    <option value="WV" ${data?.state === 'WV' ? 'selected' : ''}>West Virginia</option>
                    <option value="PA" ${data?.state === 'PA' ? 'selected' : ''}>Pennsylvania</option>
                  </select>
                </div>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label">Latitude</label>
                  <input type="number" class="admin-form-input" name="latitude" step="0.0001" value="${data?.latitude || ''}">
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">Longitude</label>
                  <input type="number" class="admin-form-input" name="longitude" step="0.0001" value="${data?.longitude || ''}">
                </div>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Description</label>
                <textarea class="admin-form-textarea" name="content" rows="6">${escapeHtml(data?.content || '')}</textarea>
                <p class="admin-form-help">Supports Markdown formatting</p>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Featured Image</label>
                <div class="admin-image-upload" id="image-upload">
                  <input type="file" class="admin-image-upload__input" id="image-input" accept="image/*">
                  <div class="admin-image-upload__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="admin-image-upload__text">Click or drag image here</p>
                  <p class="admin-image-upload__hint">PNG, JPG up to 5MB</p>
                  <div class="admin-image-upload__preview" id="image-preview" ${data?.featured_image_url ? 'class="active"' : ''}>
                    <img src="${escapeHtml(data?.featured_image_url || '')}" alt="Preview" id="preview-img">
                  </div>
                </div>
                <input type="hidden" name="featured_image_url" id="featured-image-url" value="${escapeHtml(data?.featured_image_url || '')}">
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label">Species (comma-separated)</label>
                  <input type="text" class="admin-form-input" name="species_tags" value="${escapeHtml((data?.species_tags || []).join(', '))}">
                  <p class="admin-form-help">e.g., Whitetail Deer, Wild Turkey, Waterfowl</p>
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">Amenities (comma-separated)</label>
                  <input type="text" class="admin-form-input" name="amenities" value="${escapeHtml((data?.amenities || []).join(', '))}">
                  <p class="admin-form-help">e.g., Parking, Boat Ramp, Restrooms</p>
                </div>
              </div>

              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-form-label">Website URL</label>
                  <input type="url" class="admin-form-input" name="website_url" value="${escapeHtml(data?.website_url || '')}">
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">Contact Email</label>
                  <input type="email" class="admin-form-input" name="contact_email" value="${escapeHtml(data?.contact_email || '')}">
                </div>
              </div>

              <div class="admin-form-group">
                <label class="admin-form-label">Regulations</label>
                <textarea class="admin-form-textarea" name="regulations" rows="3">${escapeHtml(data?.regulations || '')}</textarea>
              </div>
            </form>
          </div>
          <div class="admin-modal__footer">
            <button class="admin-btn admin-btn--ghost" onclick="AdminApp.closeModal()">Cancel</button>
            <button class="admin-btn admin-btn--primary" id="modal-submit" onclick="AdminApp.saveListing()">
              ${isEdit ? 'Update' : 'Create'} Listing
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function createConfirmModal(data) {
    return `
      <div class="admin-modal">
        <div class="admin-modal__content" style="max-width: 400px;">
          <div class="admin-modal__body">
            <div class="admin-confirm">
              <div class="admin-confirm__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 class="admin-confirm__title">Confirm Delete</h3>
              <p class="admin-confirm__text">Are you sure you want to delete this item?</p>
              <div class="admin-confirm__item">${escapeHtml(data.title || data.name)}</div>
              <p class="admin-confirm__text">This action cannot be undone.</p>
            </div>
          </div>
          <div class="admin-modal__footer" style="justify-content: center;">
            <button class="admin-btn admin-btn--ghost" onclick="AdminApp.closeModal()">Cancel</button>
            <button class="admin-btn admin-btn--danger" id="confirm-delete-btn" onclick="AdminApp.confirmDelete()">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Image Upload
  // ==========================================================================
  function initImageUpload() {
    const uploadArea = document.getElementById('image-upload');
    const fileInput = document.getElementById('image-input');
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const hiddenInput = document.getElementById('featured-image-url');

    if (!uploadArea) return;

    // Click to upload
    uploadArea.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput.click();
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleImageFile(files[0]);
      }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
      }
    });

    async function handleImageFile(file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        preview.classList.add('active');
      };
      reader.readAsDataURL(file);

      // Upload to GitHub
      showToast('Uploading image...', 'info');

      try {
        const url = await API.uploadImage(file);
        hiddenInput.value = url;
        showToast('Image uploaded successfully', 'success');
      } catch (error) {
        console.error('Upload error:', error);
        showToast('Failed to upload image', 'error');
        preview.classList.remove('active');
      }
    }
  }

  // ==========================================================================
  // Slug Generation
  // ==========================================================================
  function initSlugGeneration() {
    const nameInput = document.getElementById('modal-name');
    const slugInput = document.getElementById('modal-slug');

    if (!nameInput || !slugInput || slugInput.readOnly) return;

    nameInput.addEventListener('input', () => {
      if (!slugInput.dataset.manuallyEdited) {
        slugInput.value = generateSlug(nameInput.value);
      }
    });

    slugInput.addEventListener('input', () => {
      slugInput.dataset.manuallyEdited = 'true';
    });
  }

  // ==========================================================================
  // Form Helpers
  // ==========================================================================
  function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      // Handle arrays (comma-separated)
      if (key === 'tags' || key === 'species_tags' || key === 'amenities') {
        data[key] = value.split(',').map(s => s.trim()).filter(Boolean);
      } else if (key === 'price' || key === 'latitude' || key === 'longitude') {
        data[key] = value ? parseFloat(value) : null;
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return { isValid: false, errors: ['Form not found'] };

    const errors = [];

    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim()) {
        errors.push(`${input.name || 'Field'} is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  // Blog Categories
  async function saveBlogCategory() {
    const validation = validateForm('category-form');
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    const data = getFormData('category-form');
    const btn = document.getElementById('modal-submit');

    setButtonLoading(btn, true);

    try {
      if (state.editingItem) {
        await API.updateBlogCategory(data.slug, data);
        showToast('Category updated', 'success');
      } else {
        await API.createBlogCategory(data);
        showToast('Category created', 'success');
      }
      closeModal();
      await loadBlogCategories();
      updateStats();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setButtonLoading(btn, false, state.editingItem ? 'Update Category' : 'Create Category');
    }
  }

  function editCategory(type, slug) {
    const categories = type === 'blog' ? state.blogCategories : state.storeCategories;
    const category = categories.find(c => c.slug === slug);
    if (category) {
      openModal(`${type}-category`, category);
    }
  }

  async function deleteCategory(type, slug) {
    const categories = type === 'blog' ? state.blogCategories : state.storeCategories;
    const category = categories.find(c => c.slug === slug);

    if (!category) return;

    state.pendingDelete = { type: `${type}-category`, slug, item: category };
    openModal('confirm', category);
  }

  // Store Categories
  async function saveStoreCategory() {
    const validation = validateForm('category-form');
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    const data = getFormData('category-form');
    const btn = document.getElementById('modal-submit');

    setButtonLoading(btn, true);

    try {
      if (state.editingItem) {
        await API.updateStoreCategory(data.slug, data);
        showToast('Category updated', 'success');
      } else {
        await API.createStoreCategory(data);
        showToast('Category created', 'success');
      }
      closeModal();
      await loadStoreCategories();
      updateStats();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setButtonLoading(btn, false, state.editingItem ? 'Update Category' : 'Create Category');
    }
  }

  // Blog Posts
  async function savePost() {
    const validation = validateForm('post-form');
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    const data = getFormData('post-form');
    const btn = document.getElementById('modal-submit');

    // Add timestamps
    if (!state.editingItem) {
      data.published_at = new Date().toISOString();
      data.created_at = new Date().toISOString();
    }

    setButtonLoading(btn, true);

    try {
      if (state.editingItem) {
        await API.updateBlogPost(data.slug, data);
        showToast('Post updated', 'success');
      } else {
        await API.createBlogPost(data);
        showToast('Post created', 'success');
      }
      closeModal();
      await loadPosts();
      updateStats();
    } catch (error) {
      console.error('Error saving post:', error);
      showToast(error.message || 'Failed to save post', 'error');
    } finally {
      setButtonLoading(btn, false, state.editingItem ? 'Update Post' : 'Create Post');
    }
  }

  function editPost(slug) {
    const post = state.posts.find(p => p.slug === slug);
    if (post) {
      openModal('post', post);
    }
  }

  async function deletePost(slug) {
    const post = state.posts.find(p => p.slug === slug);
    if (!post) return;

    state.pendingDelete = { type: 'post', slug, item: post };
    openModal('confirm', post);
  }

  // Products
  async function saveProduct() {
    const validation = validateForm('product-form');
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    const data = getFormData('product-form');
    const btn = document.getElementById('modal-submit');

    // Debug: Log the form data being saved
    console.log('[saveProduct] Form data collected:', data);
    console.log('[saveProduct] Status value:', data.status);

    // Add timestamp
    if (!state.editingItem) {
      data.created_at = new Date().toISOString();
    }

    setButtonLoading(btn, true);

    try {
      if (state.editingItem) {
        console.log('[saveProduct] Updating product:', data.slug);
        const result = await API.updateStoreProduct(data.slug, data);
        console.log('[saveProduct] Update result:', result);
        showToast('Product updated', 'success');
      } else {
        console.log('[saveProduct] Creating new product');
        await API.createStoreProduct(data);
        showToast('Product created', 'success');
      }
      closeModal();

      // Wait a moment for GitHub to process the commit before reloading
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('[saveProduct] Reloading products...');
      await loadProducts();
      console.log('[saveProduct] Products reloaded, state.products:', state.products.map(p => ({slug: p.slug, status: p.status})));
      updateStats();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast(error.message || 'Failed to save product', 'error');
    } finally {
      setButtonLoading(btn, false, state.editingItem ? 'Update Product' : 'Create Product');
    }
  }

  function editProduct(slug) {
    const product = state.products.find(p => p.slug === slug);
    if (product) {
      openModal('product', product);
    }
  }

  async function deleteProduct(slug) {
    const product = state.products.find(p => p.slug === slug);
    if (!product) return;

    state.pendingDelete = { type: 'product', slug, item: product };
    openModal('confirm', product);
  }

  // Listings
  async function saveListing() {
    const validation = validateForm('listing-form');
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    const data = getFormData('listing-form');
    const btn = document.getElementById('modal-submit');

    // Add timestamp
    if (!state.editingItem) {
      data.created_at = new Date().toISOString();
    }

    setButtonLoading(btn, true);

    try {
      if (state.editingItem) {
        await API.updateDirectoryListing(data.slug, data);
        showToast('Listing updated', 'success');
      } else {
        await API.createDirectoryListing(data);
        showToast('Listing created', 'success');
      }
      closeModal();
      await loadListings();
      updateStats();
    } catch (error) {
      console.error('Error saving listing:', error);
      showToast(error.message || 'Failed to save listing', 'error');
    } finally {
      setButtonLoading(btn, false, state.editingItem ? 'Update Listing' : 'Create Listing');
    }
  }

  function editListing(slug) {
    const listing = state.listings.find(l => l.slug === slug);
    if (listing) {
      openModal('listing', listing);
    }
  }

  async function deleteListing(slug) {
    const listing = state.listings.find(l => l.slug === slug);
    if (!listing) return;

    state.pendingDelete = { type: 'listing', slug, item: listing };
    openModal('confirm', listing);
  }

  // Confirm delete
  async function confirmDelete() {
    if (!state.pendingDelete) return;

    const { type, slug } = state.pendingDelete;
    const btn = document.getElementById('confirm-delete-btn');

    setButtonLoading(btn, true);

    try {
      switch (type) {
        case 'blog-category':
          await API.deleteBlogCategory(slug);
          await loadBlogCategories();
          break;
        case 'store-category':
          await API.deleteStoreCategory(slug);
          await loadStoreCategories();
          break;
        case 'post':
          await API.deleteBlogPost(slug);
          await loadPosts();
          break;
        case 'product':
          await API.deleteStoreProduct(slug);
          await loadProducts();
          break;
        case 'listing':
          await API.deleteDirectoryListing(slug);
          await loadListings();
          break;
      }

      showToast('Item deleted successfully', 'success');
      closeModal();
      updateStats();
    } catch (error) {
      console.error('Error deleting:', error);
      showToast(error.message || 'Failed to delete item', 'error');
    } finally {
      setButtonLoading(btn, false, 'Delete');
      state.pendingDelete = null;
    }
  }

  // ==========================================================================
  // Cache Management
  // ==========================================================================
  function clearCache() {
    API.clearCache();
    showToast('Cache cleared. Reloading content...', 'info');
    loadAllContent();
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================
  function init() {
    cacheElements();
    initNavigation();
    initSearch();

    // Login handlers
    elements.loginBtn?.addEventListener('click', handleLogin);
    elements.loginToken?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });

    // Logout handler
    elements.logoutBtn?.addEventListener('click', handleLogout);

    // Close modal on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Close modal on backdrop click
    elements.modalsContainer?.addEventListener('click', (e) => {
      if (e.target.classList.contains('admin-modal')) {
        closeModal();
      }
    });

    // Check authentication
    checkAuth();
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================================================
  // Public API
  // ==========================================================================
  return {
    openModal,
    closeModal,
    saveBlogCategory,
    saveStoreCategory,
    savePost,
    saveProduct,
    saveListing,
    editCategory,
    deleteCategory,
    editPost,
    deletePost,
    editProduct,
    deleteProduct,
    editListing,
    deleteListing,
    confirmDelete,
    clearCache,
    showToast,
    navigateToPanel
  };

})();
