/**
 * BOLINGO Admin Page JavaScript
 * Handles admin forms and API POST requests
 */

(function() {
  'use strict';

  // DOM Elements
  let tokenInput;
  let tokenStatus;
  let saveTokenBtn;
  let clearTokenBtn;

  /**
   * Update token status display
   */
  function updateTokenStatus() {
    if (!tokenStatus) return;

    if (API.hasAdminToken()) {
      tokenStatus.innerHTML = '<span class="admin__token-status--set">&#10003; Token is set</span>';
    } else {
      tokenStatus.innerHTML = '<span class="admin__token-status--not-set">&#9888; No token set - POST requests will fail</span>';
    }
  }

  /**
   * Initialize token management
   */
  function initTokenManagement() {
    tokenInput = document.getElementById('admin-token');
    tokenStatus = document.getElementById('token-status');
    saveTokenBtn = document.getElementById('save-token');
    clearTokenBtn = document.getElementById('clear-token');

    // Load existing token into input (masked)
    if (API.hasAdminToken()) {
      tokenInput.placeholder = 'Token is set (enter new to replace)';
    }

    updateTokenStatus();

    // Save token
    saveTokenBtn?.addEventListener('click', () => {
      const token = tokenInput.value.trim();
      if (!token) {
        UI.showToast('Please enter a token', 'warning');
        return;
      }
      API.setAdminToken(token);
      tokenInput.value = '';
      tokenInput.placeholder = 'Token is set (enter new to replace)';
      updateTokenStatus();
      UI.showToast('Token saved successfully', 'success');
    });

    // Clear token
    clearTokenBtn?.addEventListener('click', () => {
      API.setAdminToken(null);
      tokenInput.value = '';
      tokenInput.placeholder = 'Enter your admin token';
      updateTokenStatus();
      UI.showToast('Token cleared', 'info');
    });
  }

  /**
   * Initialize tab navigation
   */
  function initTabs() {
    const tabs = document.querySelectorAll('.admin__tab');
    const panels = document.querySelectorAll('.admin__panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;

        // Update tabs
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Update panels
        panels.forEach(p => {
          p.classList.remove('active');
        });
        document.getElementById(`panel-${targetId}`)?.classList.add('active');
      });
    });
  }

  /**
   * Generate slug from name
   */
  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Auto-generate slug from name input
   */
  function initSlugGeneration() {
    const nameSlugPairs = [
      ['blog-cat-name', 'blog-cat-slug'],
      ['blog-post-title', 'blog-post-slug'],
      ['store-cat-name', 'store-cat-slug'],
      ['product-name', 'product-slug'],
      ['listing-name', 'listing-slug']
    ];

    nameSlugPairs.forEach(([nameId, slugId]) => {
      const nameInput = document.getElementById(nameId);
      const slugInput = document.getElementById(slugId);

      if (nameInput && slugInput) {
        nameInput.addEventListener('input', () => {
          // Only auto-generate if slug is empty or matches previous auto-generation
          if (!slugInput.dataset.manuallyEdited) {
            slugInput.value = generateSlug(nameInput.value);
          }
        });

        // Mark as manually edited if user changes it
        slugInput.addEventListener('input', () => {
          slugInput.dataset.manuallyEdited = 'true';
        });
      }
    });
  }

  /**
   * Load blog categories into select
   */
  async function loadBlogCategories() {
    const select = document.getElementById('blog-post-category');
    if (!select) return;

    try {
      const response = await API.getBlogCategories();
      const categories = response.data || response.categories || response || [];

      select.innerHTML = '<option value="">Select category...</option>';
      categories.forEach(cat => {
        // Use category_id as value (API requires category_id, not slug)
        select.innerHTML += `<option value="${Templates.escapeHtml(cat.category_id)}">${Templates.escapeHtml(cat.name)}</option>`;
      });
    } catch (error) {
      console.error('Error loading blog categories:', error);
      select.innerHTML = '<option value="">Error loading categories</option>';
    }
  }

  /**
   * Load store categories into select
   */
  async function loadStoreCategories() {
    const select = document.getElementById('product-category');
    if (!select) return;

    try {
      const response = await API.getStoreCategories();
      const categories = response.data || response.categories || response || [];

      select.innerHTML = '<option value="">Select category...</option>';
      categories.forEach(cat => {
        // Use category_id as value (API requires category_id, not slug)
        select.innerHTML += `<option value="${Templates.escapeHtml(cat.category_id)}">${Templates.escapeHtml(cat.name)}</option>`;
      });
    } catch (error) {
      console.error('Error loading store categories:', error);
      select.innerHTML = '<option value="">Error loading categories</option>';
    }
  }

  /**
   * Initialize inline category creation for blog
   */
  function initInlineBlogCategory() {
    const addBtn = document.getElementById('add-blog-category-inline');
    const inlineForm = document.getElementById('inline-blog-category');
    const saveBtn = document.getElementById('save-inline-blog-category');
    const cancelBtn = document.getElementById('cancel-inline-blog-category');
    const nameInput = document.getElementById('inline-blog-cat-name');

    addBtn?.addEventListener('click', () => {
      inlineForm.style.display = 'block';
      nameInput?.focus();
    });

    cancelBtn?.addEventListener('click', () => {
      inlineForm.style.display = 'none';
      nameInput.value = '';
    });

    saveBtn?.addEventListener('click', async () => {
      const name = nameInput?.value?.trim();
      if (!name) {
        UI.showToast('Please enter a category name', 'warning');
        return;
      }

      const slug = generateSlug(name);

      try {
        UI.setButtonLoading(saveBtn, true);
        await API.createBlogCategory({ name, slug });
        UI.showToast('Category created!', 'success');
        inlineForm.style.display = 'none';
        nameInput.value = '';
        await loadBlogCategories();

        // Select the new category
        const select = document.getElementById('blog-post-category');
        if (select) {
          select.value = slug;
        }
      } catch (error) {
        UI.showToast(error.message || 'Failed to create category', 'error');
      } finally {
        UI.setButtonLoading(saveBtn, false, 'Add Category');
      }
    });
  }

  /**
   * Initialize inline category creation for store
   */
  function initInlineStoreCategory() {
    const addBtn = document.getElementById('add-store-category-inline');
    const inlineForm = document.getElementById('inline-store-category');
    const saveBtn = document.getElementById('save-inline-store-category');
    const cancelBtn = document.getElementById('cancel-inline-store-category');
    const nameInput = document.getElementById('inline-store-cat-name');

    addBtn?.addEventListener('click', () => {
      inlineForm.style.display = 'block';
      nameInput?.focus();
    });

    cancelBtn?.addEventListener('click', () => {
      inlineForm.style.display = 'none';
      nameInput.value = '';
    });

    saveBtn?.addEventListener('click', async () => {
      const name = nameInput?.value?.trim();
      if (!name) {
        UI.showToast('Please enter a category name', 'warning');
        return;
      }

      const slug = generateSlug(name);

      try {
        UI.setButtonLoading(saveBtn, true);
        await API.createStoreCategory({ name, slug });
        UI.showToast('Category created!', 'success');
        inlineForm.style.display = 'none';
        nameInput.value = '';
        await loadStoreCategories();

        // Select the new category
        const select = document.getElementById('product-category');
        if (select) {
          select.value = slug;
        }
      } catch (error) {
        UI.showToast(error.message || 'Failed to create category', 'error');
      } finally {
        UI.setButtonLoading(saveBtn, false, 'Add Category');
      }
    });
  }

  /**
   * Show form message
   */
  function showFormMessage(msgElId, message, isError = false) {
    const msgEl = document.getElementById(msgElId);
    if (!msgEl) return;

    msgEl.innerHTML = isError
      ? `<div class="error-state" style="padding: var(--space-3);">${Templates.escapeHtml(message)}</div>`
      : Templates.successMessage(message);
    msgEl.style.display = 'block';

    // Auto-hide success after 5 seconds
    if (!isError) {
      setTimeout(() => {
        msgEl.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(formId, apiMethod, msgElId, transformData = null) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check token
      if (!API.hasAdminToken()) {
        showFormMessage(msgElId, 'Please set your admin token first', true);
        UI.showToast('Admin token required', 'error');
        return;
      }

      // Validate form
      const validation = UI.validateForm(form);
      if (!validation.isValid) {
        showFormMessage(msgElId, validation.errors.join(', '), true);
        return;
      }

      // Get form data
      let data = UI.formDataToObject(form);

      // Transform data if needed (e.g., convert comma-separated to arrays)
      if (transformData) {
        data = transformData(data);
      }

      // Get submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;

      try {
        UI.setButtonLoading(submitBtn, true);

        // Call API
        await apiMethod(data);

        // Success
        showFormMessage(msgElId, 'Successfully created! The new item will appear on the public pages.');
        UI.showToast('Created successfully!', 'success');
        form.reset();

        // Reset slug manual edit flag
        form.querySelectorAll('[data-manually-edited]').forEach(el => {
          delete el.dataset.manuallyEdited;
        });

      } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage(msgElId, error.message || 'Failed to create. Please try again.', true);
        UI.showToast(error.message || 'Submission failed', 'error');
      } finally {
        UI.setButtonLoading(submitBtn, false, originalText);
      }
    });
  }

  /**
   * Transform blog post data
   */
  function transformBlogPostData(data) {
    // Convert tags to array
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    // Add published date
    data.published_at = new Date().toISOString();
    return data;
  }

  /**
   * Transform listing data
   */
  function transformListingData(data) {
    // Convert comma-separated fields to arrays
    if (data.species && typeof data.species === 'string') {
      data.species = data.species.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (data.amenities && typeof data.amenities === 'string') {
      data.amenities = data.amenities.split(',').map(a => a.trim()).filter(Boolean);
    }
    return data;
  }

  /**
   * Initialize all forms
   */
  function initForms() {
    // Blog Category
    handleFormSubmit(
      'form-blog-category',
      API.createBlogCategory,
      'msg-blog-category'
    );

    // Blog Post
    handleFormSubmit(
      'form-blog-post',
      API.createBlogPost,
      'msg-blog-post',
      transformBlogPostData
    );

    // Store Category
    handleFormSubmit(
      'form-store-category',
      API.createStoreCategory,
      'msg-store-category'
    );

    // Store Product
    handleFormSubmit(
      'form-store-product',
      API.createStoreProduct,
      'msg-store-product'
    );

    // Directory Listing
    handleFormSubmit(
      'form-directory-listing',
      API.createDirectoryListing,
      'msg-directory-listing',
      transformListingData
    );
  }

  /**
   * Initialize admin page
   */
  function init() {
    initTokenManagement();
    initTabs();
    initSlugGeneration();
    initInlineBlogCategory();
    initInlineStoreCategory();
    initForms();

    // Load categories for dropdowns
    loadBlogCategories();
    loadStoreCategories();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
