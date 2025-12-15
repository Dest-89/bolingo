/**
 * BOLINGO Homepage JavaScript
 * Handles dynamic content loading for the homepage
 */

(function() {
  'use strict';

  // Number of items to show in each section
  const ITEMS_TO_SHOW = 6;

  /**
   * Load featured directory listings
   */
  async function loadFeaturedListings() {
    const container = document.getElementById('featured-listings');
    if (!container) return;

    container.innerHTML = Templates.loadingGrid(ITEMS_TO_SHOW);

    try {
      const response = await API.getDirectoryListings();
      const listings = response.data || response.listings || response || [];

      if (!Array.isArray(listings) || listings.length === 0) {
        container.innerHTML = Templates.emptyState(
          'No Listings Yet',
          'Check back soon for featured hunting spots.',
          true,
          'View Directory',
          '/directory.html'
        );
        return;
      }

      const featured = listings.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.listingCard).join('');
      container.setAttribute('aria-busy', 'false');

    } catch (error) {
      console.error('Error loading featured listings:', error);
      container.innerHTML = Templates.errorState(
        'Unable to Load Listings',
        'We couldn\'t load the hunting spots. Please try again later.'
      );
    }
  }

  /**
   * Load featured blog posts
   */
  async function loadFeaturedPosts() {
    const container = document.getElementById('featured-posts');
    if (!container) return;

    container.innerHTML = Templates.loadingGrid(ITEMS_TO_SHOW);

    try {
      const response = await API.getBlogPosts();
      const posts = response.data || response.posts || response || [];

      if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML = Templates.emptyState(
          'No Posts Yet',
          'Check back soon for hunting tips and stories.',
          true,
          'View Blog',
          '/blog.html'
        );
        return;
      }

      // Sort by date (newest first) and take first 6
      const sorted = [...posts].sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0);
        const dateB = new Date(b.published_at || b.created_at || 0);
        return dateB - dateA;
      });

      const featured = sorted.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.postCard).join('');
      container.setAttribute('aria-busy', 'false');

    } catch (error) {
      console.error('Error loading featured posts:', error);
      container.innerHTML = Templates.errorState(
        'Unable to Load Posts',
        'We couldn\'t load the blog posts. Please try again later.'
      );
    }
  }

  /**
   * Load featured products
   */
  async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    container.innerHTML = Templates.loadingGrid(ITEMS_TO_SHOW);

    try {
      const response = await API.getStoreProducts();
      const products = response.data || response.products || response || [];

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = Templates.emptyState(
          'No Products Yet',
          'Check back soon for quality hunting gear.',
          true,
          'View Store',
          '/store.html'
        );
        return;
      }

      const featured = products.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.productCard).join('');
      container.setAttribute('aria-busy', 'false');

    } catch (error) {
      console.error('Error loading featured products:', error);
      container.innerHTML = Templates.errorState(
        'Unable to Load Products',
        'We couldn\'t load the products. Please try again later.'
      );
    }
  }

  /**
   * Initialize newsletter form
   */
  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const messageEl = document.getElementById('newsletter-message');

    if (!form || !messageEl) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = form.querySelector('input[type="email"]').value;

      if (!email || !email.includes('@')) {
        messageEl.textContent = 'Please enter a valid email address.';
        messageEl.style.color = 'var(--color-error)';
        messageEl.style.display = 'block';
        return;
      }

      // Simulate subscription (frontend-only placeholder)
      messageEl.textContent = 'Thanks for subscribing! We\'ll be in touch soon.';
      messageEl.style.color = 'var(--color-success)';
      messageEl.style.display = 'block';
      form.reset();

      // Show toast
      if (typeof UI !== 'undefined') {
        UI.showToast('Successfully subscribed!', 'success');
      }
    });
  }

  /**
   * Initialize animations on scroll
   */
  function initScrollAnimations() {
    if (typeof UI !== 'undefined' && UI.observeElements) {
      UI.observeElements('.card, .step, .trust__content', (el) => {
        el.classList.add('animate-slide-up');
      });
    }
  }

  /**
   * Initialize the homepage
   */
  function init() {
    // Load all featured content in parallel
    Promise.all([
      loadFeaturedListings(),
      loadFeaturedPosts(),
      loadFeaturedProducts()
    ]).catch(console.error);

    // Initialize interactive elements
    initNewsletterForm();
    initScrollAnimations();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
