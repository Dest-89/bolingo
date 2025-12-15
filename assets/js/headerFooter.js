/**
 * BOLINGO Header & Footer Loader
 * Loads reusable header and footer components into all pages
 */

const HeaderFooter = (() => {
  /**
   * Fetch and inject HTML component
   */
  async function loadComponent(url, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Target element "${targetSelector}" not found`);
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
      }
      const html = await response.text();
      target.innerHTML = html;
      return true;
    } catch (error) {
      console.error(`Error loading component from ${url}:`, error);
      // Fallback content
      target.innerHTML = `<div style="padding: 1rem; text-align: center; color: #888;">Component failed to load</div>`;
      return false;
    }
  }

  /**
   * Set active nav link based on current page
   */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    // Map pages to nav items
    const navMap = {
      'index.html': 'home',
      '': 'home',
      'directory.html': 'directory',
      'listing.html': 'directory',
      'blog.html': 'blog',
      'blog-category.html': 'blog',
      'post.html': 'blog',
      'store.html': 'store',
      'store-category.html': 'store',
      'product.html': 'store',
      'about.html': 'about',
      'contact.html': 'contact',
      'admin.html': 'admin'
    };

    const activeKey = navMap[currentPage];

    document.querySelectorAll('.header__nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      const linkPage = href.split('/').pop();
      const linkKey = navMap[linkPage];

      if (linkKey === activeKey) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /**
   * Initialize mobile menu toggle
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.header__menu-toggle');
    const nav = document.querySelector('.header__nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', nav.classList.contains('active'));

      // Prevent body scroll when menu is open
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('.header__nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  /**
   * Update footer year
   */
  function updateFooterYear() {
    const yearEl = document.querySelector('.footer__year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /**
   * Initialize header and footer
   */
  async function init() {
    // Load components
    await Promise.all([
      loadComponent('/components/header.html', '#header-placeholder'),
      loadComponent('/components/footer.html', '#footer-placeholder')
    ]);

    // Initialize functionality
    setActiveNavLink();
    initMobileMenu();
    updateFooterYear();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    init,
    loadComponent,
    setActiveNavLink
  };
})();

// Make HeaderFooter available globally
window.HeaderFooter = HeaderFooter;
