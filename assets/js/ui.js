/**
 * BOLINGO UI Utilities Module
 * Common UI helpers and utilities
 */

const UI = (() => {
  /**
   * Get query parameter from URL
   */
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  /**
   * Set query parameters in URL without page reload
   */
  function setQueryParams(params) {
    const urlParams = new URLSearchParams(window.location.search);

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        urlParams.delete(key);
      } else {
        urlParams.set(key, value);
      }
    });

    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  /**
   * Debounce function for search inputs
   */
  function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Smooth scroll to element
   */
  function scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  /**
   * Set page metadata (SEO)
   */
  function setPageMeta({ title, description, ogTitle, ogDescription, ogImage, canonical }) {
    // Title
    if (title) {
      document.title = title + ' | BOLINGO';
    }

    // Meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // Open Graph title
    if (ogTitle || title) {
      let ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement('meta');
        ogTitleMeta.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleMeta);
      }
      ogTitleMeta.content = (ogTitle || title) + ' | BOLINGO';
    }

    // Open Graph description
    if (ogDescription || description) {
      let ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (!ogDescMeta) {
        ogDescMeta = document.createElement('meta');
        ogDescMeta.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescMeta);
      }
      ogDescMeta.content = ogDescription || description;
    }

    // Open Graph image
    if (ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.content = ogImage;
    }

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }

  /**
   * Show notification toast
   */
  function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast__message">${Templates.escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Close notification">&times;</button>
    `;

    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 16px 24px;
          border-radius: 8px;
          background-color: #333;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9999;
          animation: slideIn 0.3s ease;
          max-width: 400px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .toast--success { background-color: #4CAF50; }
        .toast--error { background-color: #E74C3C; }
        .toast--warning { background-color: #F39C12; }
        .toast--info { background-color: #3498DB; }
        .toast__close {
          background: none;
          border: none;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Close button handler
    toast.querySelector('.toast__close').addEventListener('click', () => {
      toast.remove();
    });

    // Auto remove
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }

  /**
   * Form validation helper
   */
  function validateForm(form) {
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    const errors = [];

    inputs.forEach(input => {
      // Remove previous error styling
      input.classList.remove('form-input--error');
      const existingError = input.parentNode.querySelector('.form-error');
      if (existingError) existingError.remove();

      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('form-input--error');

        const label = form.querySelector(`label[for="${input.id}"]`);
        const fieldName = label ? label.textContent.replace(' *', '') : input.name;
        errors.push(`${fieldName} is required`);

        // Add error message below input
        const errorSpan = document.createElement('span');
        errorSpan.className = 'form-error';
        errorSpan.textContent = 'This field is required';
        input.parentNode.appendChild(errorSpan);
      }

      // Email validation
      if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
          isValid = false;
          input.classList.add('form-input--error');
          errors.push('Please enter a valid email address');
        }
      }
    });

    return { isValid, errors };
  }

  /**
   * Render content into container
   */
  function render(container, content) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = content;
    }
  }

  /**
   * Add loading state to button
   */
  function setButtonLoading(button, isLoading, originalText = null) {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<span class="loading__spinner" style="width:16px;height:16px;margin-right:8px;"></span>Loading...';
    } else {
      button.disabled = false;
      button.textContent = originalText || button.dataset.originalText || 'Submit';
    }
  }

  /**
   * Format form data to object
   */
  function formDataToObject(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      // Handle arrays (checkboxes with same name)
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });
    return data;
  }

  /**
   * Intersection Observer for lazy loading/animations
   */
  function observeElements(selector, callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          if (!options.persistent) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, { ...defaultOptions, ...options });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
    return observer;
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyboardNav(container, itemSelector) {
    const items = container.querySelectorAll(itemSelector);
    if (!items.length) return;

    let currentIndex = 0;

    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        items[currentIndex].focus();
      }
    });
  }

  /**
   * Copy text to clipboard
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
      return true;
    } catch {
      showToast('Failed to copy', 'error');
      return false;
    }
  }

  /**
   * Check if element is in viewport
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Pluralize word
   */
  function pluralize(count, singular, plural = null) {
    if (count === 1) return `${count} ${singular}`;
    return `${count} ${plural || singular + 's'}`;
  }

  // Public API
  return {
    getQueryParam,
    setQueryParams,
    debounce,
    scrollToElement,
    setPageMeta,
    showToast,
    validateForm,
    render,
    setButtonLoading,
    formDataToObject,
    observeElements,
    handleKeyboardNav,
    copyToClipboard,
    isInViewport,
    pluralize
  };
})();

// Make UI available globally
window.UI = UI;
