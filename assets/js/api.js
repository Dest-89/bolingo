/**
 * BOLINGO API Module - GitHub Backend
 * Centralized API communication layer using GitHub as content storage
 * Replaces Google Apps Script backend
 */

const API = (() => {
  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    owner: 'Dest-89',
    repo: 'bolingo',
    branch: 'main',
    contentPaths: {
      blogCategories: 'content/blog/categories.json',
      blogPosts: 'content/blog/posts',
      storeCategories: 'content/store/categories.json',
      storeProducts: 'content/store/products',
      directoryListings: 'content/directory/listings',
      images: 'assets/images'
    }
  };

  const GITHUB_API_BASE = 'https://api.github.com';
  const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}`;

  // Storage keys
  const TOKEN_KEY = 'bolingo_github_token';
  const CACHE_PREFIX = 'bolingo_cache_';

  // Cache TTLs in milliseconds
  const CACHE_TTL = {
    categories: 30 * 60 * 1000,    // 30 minutes
    list: 5 * 60 * 1000,           // 5 minutes
    single: 10 * 60 * 1000,        // 10 minutes
    etags: 60 * 60 * 1000          // 1 hour
  };

  // Memory cache for runtime
  const memoryCache = new Map();

  // ============================================
  // YAML FRONTMATTER PARSER
  // ============================================

  const YAML = {
    /**
     * Parse YAML frontmatter from markdown content
     */
    parse(content) {
      const lines = content.split('\n');
      const result = {};
      let i = 0;
      let currentKey = null;
      let inArray = false;
      let arrayKey = null;

      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines
        if (!trimmed) {
          i++;
          continue;
        }

        // Array item (starts with -)
        if (trimmed.startsWith('- ')) {
          if (arrayKey) {
            if (!Array.isArray(result[arrayKey])) {
              result[arrayKey] = [];
            }
            result[arrayKey].push(this.parseValue(trimmed.substring(2).trim()));
          }
          i++;
          continue;
        }

        // Key-value pair
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const valueStr = line.substring(colonIndex + 1).trim();

          if (!valueStr) {
            // Start of array or nested object
            arrayKey = key;
            result[key] = [];
          } else {
            arrayKey = null;
            result[key] = this.parseValue(valueStr);
          }
        }

        i++;
      }

      return result;
    },

    /**
     * Parse a YAML value
     */
    parseValue(str) {
      if (!str) return '';

      // Remove quotes
      if ((str.startsWith('"') && str.endsWith('"')) ||
          (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
      }

      // Boolean
      if (str === 'true') return true;
      if (str === 'false') return false;

      // Null
      if (str === 'null' || str === '~') return null;

      // Number
      if (/^-?\d+\.?\d*$/.test(str)) {
        return str.includes('.') ? parseFloat(str) : parseInt(str, 10);
      }

      // Array inline [item1, item2]
      if (str.startsWith('[') && str.endsWith(']')) {
        return str.slice(1, -1).split(',').map(s => this.parseValue(s.trim()));
      }

      return str;
    },

    /**
     * Convert object to YAML frontmatter string
     */
    stringify(obj) {
      let yaml = '';

      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) continue;

        if (Array.isArray(value)) {
          yaml += `${key}:\n`;
          value.forEach(item => {
            yaml += `  - ${this.stringifyValue(item)}\n`;
          });
        } else {
          yaml += `${key}: ${this.stringifyValue(value)}\n`;
        }
      }

      return yaml;
    },

    /**
     * Stringify a single value
     */
    stringifyValue(value) {
      if (typeof value === 'string') {
        // Quote strings with special characters
        if (value.includes(':') || value.includes('#') || value.includes('"') ||
            value.includes("'") || value.includes('\n') || value.startsWith(' ')) {
          return `"${value.replace(/"/g, '\\"')}"`;
        }
        return value;
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      if (value === null) return 'null';
      return String(value);
    }
  };

  // ============================================
  // MARKDOWN PARSER
  // ============================================

  /**
   * Parse markdown file with frontmatter
   */
  function parseMarkdown(content) {
    const lines = content.split('\n');

    // Check for frontmatter
    if (lines[0].trim() !== '---') {
      return { frontmatter: {}, content: content };
    }

    // Find closing ---
    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      return { frontmatter: {}, content: content };
    }

    const frontmatterStr = lines.slice(1, endIndex).join('\n');
    const markdownContent = lines.slice(endIndex + 1).join('\n').trim();

    return {
      frontmatter: YAML.parse(frontmatterStr),
      content: markdownContent
    };
  }

  /**
   * Create markdown file with frontmatter
   */
  function createMarkdown(frontmatter, content) {
    return `---\n${YAML.stringify(frontmatter)}---\n\n${content}`;
  }

  // ============================================
  // CACHING SYSTEM
  // ============================================

  const Cache = {
    /**
     * Generate cache key
     */
    key(type, identifier = '') {
      return `${CACHE_PREFIX}${type}_${identifier}`;
    },

    /**
     * Get from cache with TTL check
     */
    get(type, identifier = '') {
      const key = this.key(type, identifier);

      // Check memory cache first
      if (memoryCache.has(key)) {
        const cached = memoryCache.get(key);
        if (Date.now() < cached.expires) {
          return cached.data;
        }
        memoryCache.delete(key);
      }

      // Check storage
      const storage = type === 'categories' ? localStorage : sessionStorage;
      const stored = storage.getItem(key);

      if (stored) {
        try {
          const cached = JSON.parse(stored);
          if (Date.now() < cached.expires) {
            // Also store in memory for faster access
            memoryCache.set(key, cached);
            return cached.data;
          }
          storage.removeItem(key);
        } catch (e) {
          storage.removeItem(key);
        }
      }

      return null;
    },

    /**
     * Set cache with TTL
     */
    set(type, data, identifier = '') {
      const key = this.key(type, identifier);
      const ttl = CACHE_TTL[type] || CACHE_TTL.single;
      const cached = {
        data,
        expires: Date.now() + ttl,
        timestamp: Date.now()
      };

      // Store in memory
      memoryCache.set(key, cached);

      // Store in storage
      const storage = type === 'categories' ? localStorage : sessionStorage;
      try {
        storage.setItem(key, JSON.stringify(cached));
      } catch (e) {
        // Storage full, clear old items
        this.clearExpired();
      }
    },

    /**
     * Invalidate cache for a type
     */
    invalidate(type, identifier = '') {
      if (identifier) {
        const key = this.key(type, identifier);
        memoryCache.delete(key);
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      } else {
        // Invalidate all of this type
        const prefix = `${CACHE_PREFIX}${type}_`;

        // Memory cache
        for (const key of memoryCache.keys()) {
          if (key.startsWith(prefix)) {
            memoryCache.delete(key);
          }
        }

        // Storage
        [sessionStorage, localStorage].forEach(storage => {
          for (let i = storage.length - 1; i >= 0; i--) {
            const key = storage.key(i);
            if (key && key.startsWith(prefix)) {
              storage.removeItem(key);
            }
          }
        });
      }
    },

    /**
     * Clear expired cache entries
     */
    clearExpired() {
      const now = Date.now();

      [sessionStorage, localStorage].forEach(storage => {
        for (let i = storage.length - 1; i >= 0; i--) {
          const key = storage.key(i);
          if (key && key.startsWith(CACHE_PREFIX)) {
            try {
              const cached = JSON.parse(storage.getItem(key));
              if (cached.expires < now) {
                storage.removeItem(key);
              }
            } catch (e) {
              storage.removeItem(key);
            }
          }
        }
      });
    }
  };

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  function getAdminToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setAdminToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function hasAdminToken() {
    return !!getAdminToken();
  }

  // ============================================
  // GITHUB API HELPERS
  // ============================================

  /**
   * Make authenticated GitHub API request
   */
  async function githubFetch(endpoint, options = {}) {
    const token = getAdminToken();
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response;
  }

  /**
   * Fetch raw content from GitHub (no auth needed for public repos)
   * Uses cache-busting to bypass GitHub's CDN cache
   */
  async function fetchRawContent(path, bustCache = false) {
    let url = `${GITHUB_RAW_BASE}/${path}`;

    // Add cache-busting parameter to bypass GitHub CDN cache
    if (bustCache) {
      url += `?t=${Date.now()}`;
    }

    const response = await fetch(url, {
      cache: bustCache ? 'no-store' : 'default'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch content: ${response.status}`);
    }

    return response.text();
  }

  /**
   * List files in a directory via GitHub API
   */
  async function listFiles(dirPath) {
    const cacheKey = `files_${dirPath}`;
    const cached = Cache.get('list', cacheKey);
    if (cached) return cached;

    const response = await githubFetch(
      `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${dirPath}?ref=${CONFIG.branch}`
    );
    const files = await response.json();

    // Filter for markdown files only
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    Cache.set('list', mdFiles, cacheKey);
    return mdFiles;
  }

  /**
   * Get file content via GitHub API (includes SHA for updates)
   */
  async function getFile(path) {
    const response = await githubFetch(
      `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`
    );
    const file = await response.json();

    // Decode base64 content
    const content = atob(file.content);

    return {
      content,
      sha: file.sha,
      path: file.path
    };
  }

  /**
   * Create or update file via GitHub API
   */
  async function saveFile(path, content, message, sha = null) {
    const token = getAdminToken();
    if (!token) {
      throw new Error('Admin authentication required. Please enter your GitHub token.');
    }

    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(content))), // Base64 encode with UTF-8 support
      branch: CONFIG.branch
    };

    if (sha) {
      body.sha = sha; // Required for updates
    }

    const response = await githubFetch(
      `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    return response.json();
  }

  /**
   * Delete file via GitHub API
   */
  async function deleteFile(path, message, sha) {
    const token = getAdminToken();
    if (!token) {
      throw new Error('Admin authentication required. Please enter your GitHub token.');
    }

    const response = await githubFetch(
      `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sha,
          branch: CONFIG.branch
        })
      }
    );

    return response.json();
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async function checkHealth() {
    try {
      const response = await githubFetch(`/repos/${CONFIG.owner}/${CONFIG.repo}`);
      const repo = await response.json();
      return {
        ok: true,
        status: 'healthy',
        repo: repo.full_name,
        backend: 'github'
      };
    } catch (error) {
      return {
        ok: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // ============================================
  // BLOG ENDPOINTS
  // ============================================

  async function getBlogCategories() {
    const cached = Cache.get('categories', 'blog');
    if (cached) return { ok: true, data: cached };

    const content = await fetchRawContent(CONFIG.contentPaths.blogCategories);
    if (!content) return { ok: true, data: [] };

    const categories = JSON.parse(content);
    Cache.set('categories', categories, 'blog');

    return { ok: true, data: categories };
  }

  async function getBlogPosts(categorySlug = null) {
    const cacheKey = categorySlug ? `posts_${categorySlug}` : 'posts_all';
    const cached = Cache.get('list', cacheKey);
    if (cached) return { ok: true, data: cached };

    const files = await listFiles(CONFIG.contentPaths.blogPosts);
    const posts = [];

    for (const file of files) {
      const content = await fetchRawContent(file.path);
      if (!content) continue;

      const { frontmatter } = parseMarkdown(content);

      // Filter by category if specified
      if (categorySlug && frontmatter.category_slug !== categorySlug) {
        continue;
      }

      // Skip drafts on public endpoints
      if (frontmatter.status === 'draft') continue;

      posts.push({
        ...frontmatter,
        // Ensure backward compatibility with old API format
        image_url: frontmatter.featured_image_url || frontmatter.image_url
      });
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    Cache.set('list', posts, cacheKey);
    return { ok: true, data: posts };
  }

  async function getBlogPost(slug) {
    if (!slug) throw new Error('Post slug is required');

    const cacheKey = `post_${slug}`;
    const cached = Cache.get('single', cacheKey);
    if (cached) return { ok: true, data: cached };

    const filePath = `${CONFIG.contentPaths.blogPosts}/${slug}.md`;
    const content = await fetchRawContent(filePath);

    if (!content) {
      throw new Error('Post not found');
    }

    const { frontmatter, content: markdownContent } = parseMarkdown(content);

    const post = {
      ...frontmatter,
      content: markdownContent,
      content_md: markdownContent,
      image_url: frontmatter.featured_image_url || frontmatter.image_url
    };

    Cache.set('single', post, cacheKey);
    return { ok: true, data: post };
  }

  async function createBlogCategory(data) {
    const { data: categories } = await getBlogCategories();

    // Check for duplicate slug
    if (categories.find(c => c.slug === data.slug)) {
      throw new Error('A category with this slug already exists');
    }

    categories.push({
      slug: data.slug,
      name: data.name,
      description: data.description || ''
    });

    await saveFile(
      CONFIG.contentPaths.blogCategories,
      JSON.stringify(categories, null, 2),
      `Add blog category: ${data.name}`
    );

    Cache.invalidate('categories', 'blog');
    return { ok: true, data: data };
  }

  async function createBlogPost(data) {
    const slug = data.slug;
    const filePath = `${CONFIG.contentPaths.blogPosts}/${slug}.md`;

    // Check if file already exists
    try {
      await getFile(filePath);
      throw new Error('A post with this slug already exists');
    } catch (e) {
      if (!e.message.includes('Not Found') && !e.message.includes('already exists')) {
        // File doesn't exist, which is what we want
      } else if (e.message.includes('already exists')) {
        throw e;
      }
    }

    const frontmatter = {
      slug: data.slug,
      title: data.title,
      category_slug: data.category_slug || data.category_id,
      category_name: data.category_name || '',
      author: data.author || 'BOLINGO Team',
      excerpt: data.excerpt || '',
      featured_image_url: data.featured_image_url || data.image_url || '',
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim())) : [],
      published_at: data.published_at || new Date().toISOString(),
      status: data.status || 'published'
    };

    const content = data.content_md || data.content || '';
    const markdown = createMarkdown(frontmatter, content);

    await saveFile(filePath, markdown, `Add blog post: ${data.title}`);

    Cache.invalidate('list');
    return { ok: true, data: { ...frontmatter, content } };
  }

  async function updateBlogPost(slug, data) {
    const filePath = `${CONFIG.contentPaths.blogPosts}/${slug}.md`;
    const file = await getFile(filePath);
    const { frontmatter: existing, content: existingContent } = parseMarkdown(file.content);

    const frontmatter = {
      ...existing,
      ...data,
      slug: data.slug || existing.slug,
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim())) : existing.tags,
      updated_at: new Date().toISOString()
    };

    // Remove content from frontmatter
    delete frontmatter.content;
    delete frontmatter.content_md;

    const content = data.content_md || data.content || existingContent;
    const markdown = createMarkdown(frontmatter, content);

    await saveFile(filePath, markdown, `Update blog post: ${frontmatter.title}`, file.sha);

    Cache.invalidate('list');
    Cache.invalidate('single', `post_${slug}`);

    return { ok: true, data: { ...frontmatter, content } };
  }

  async function deleteBlogPost(slug) {
    const filePath = `${CONFIG.contentPaths.blogPosts}/${slug}.md`;
    const file = await getFile(filePath);

    await deleteFile(filePath, `Delete blog post: ${slug}`, file.sha);

    Cache.invalidate('list');
    Cache.invalidate('single', `post_${slug}`);

    return { ok: true };
  }

  async function updateBlogCategory(slug, data) {
    const { data: categories } = await getBlogCategories();
    const index = categories.findIndex(c => c.slug === slug);

    if (index === -1) {
      throw new Error('Category not found');
    }

    categories[index] = {
      ...categories[index],
      ...data
    };

    // Get current file SHA
    const file = await getFile(CONFIG.contentPaths.blogCategories);

    await saveFile(
      CONFIG.contentPaths.blogCategories,
      JSON.stringify(categories, null, 2),
      `Update blog category: ${data.name || categories[index].name}`,
      file.sha
    );

    Cache.invalidate('categories', 'blog');
    return { ok: true, data: categories[index] };
  }

  async function deleteBlogCategory(slug) {
    const { data: categories } = await getBlogCategories();
    const filtered = categories.filter(c => c.slug !== slug);

    if (filtered.length === categories.length) {
      throw new Error('Category not found');
    }

    const file = await getFile(CONFIG.contentPaths.blogCategories);

    await saveFile(
      CONFIG.contentPaths.blogCategories,
      JSON.stringify(filtered, null, 2),
      `Delete blog category: ${slug}`,
      file.sha
    );

    Cache.invalidate('categories', 'blog');
    return { ok: true };
  }

  // ============================================
  // STORE ENDPOINTS
  // ============================================

  async function getStoreCategories() {
    const cached = Cache.get('categories', 'store');
    if (cached) return { ok: true, data: cached };

    const content = await fetchRawContent(CONFIG.contentPaths.storeCategories);
    if (!content) return { ok: true, data: [] };

    const categories = JSON.parse(content);
    Cache.set('categories', categories, 'store');

    return { ok: true, data: categories };
  }

  async function getStoreProducts(categorySlug = null) {
    const cacheKey = categorySlug ? `products_${categorySlug}` : 'products_all';
    const cached = Cache.get('list', cacheKey);
    if (cached) return { ok: true, data: cached };

    const files = await listFiles(CONFIG.contentPaths.storeProducts);
    const products = [];

    for (const file of files) {
      const content = await fetchRawContent(file.path);
      if (!content) continue;

      const { frontmatter, content: description } = parseMarkdown(content);

      if (categorySlug && frontmatter.category_slug !== categorySlug) {
        continue;
      }

      if (frontmatter.status === 'inactive') continue;

      products.push({
        ...frontmatter,
        name: frontmatter.title || frontmatter.name,
        description: description || frontmatter.description,
        image_url: frontmatter.featured_image_url || frontmatter.image_url
      });
    }

    // Sort by name
    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    Cache.set('list', products, cacheKey);
    return { ok: true, data: products };
  }

  async function getStoreProduct(slug) {
    if (!slug) throw new Error('Product slug is required');

    const cacheKey = `product_${slug}`;
    const cached = Cache.get('single', cacheKey);
    if (cached) return { ok: true, data: cached };

    const filePath = `${CONFIG.contentPaths.storeProducts}/${slug}.md`;
    const content = await fetchRawContent(filePath);

    if (!content) {
      throw new Error('Product not found');
    }

    const { frontmatter, content: description } = parseMarkdown(content);

    const product = {
      ...frontmatter,
      name: frontmatter.title || frontmatter.name,
      description: description,
      description_md: description,
      image_url: frontmatter.featured_image_url || frontmatter.image_url
    };

    Cache.set('single', product, cacheKey);
    return { ok: true, data: product };
  }

  async function createStoreCategory(data) {
    const { data: categories } = await getStoreCategories();

    if (categories.find(c => c.slug === data.slug)) {
      throw new Error('A category with this slug already exists');
    }

    categories.push({
      slug: data.slug,
      name: data.name,
      description: data.description || ''
    });

    await saveFile(
      CONFIG.contentPaths.storeCategories,
      JSON.stringify(categories, null, 2),
      `Add store category: ${data.name}`
    );

    Cache.invalidate('categories', 'store');
    return { ok: true, data: data };
  }

  async function createStoreProduct(data) {
    const slug = data.slug;
    const filePath = `${CONFIG.contentPaths.storeProducts}/${slug}.md`;

    const frontmatter = {
      slug: data.slug,
      title: data.title || data.name,
      category_slug: data.category_slug || data.category_id,
      category_name: data.category_name || '',
      price: parseFloat(data.price) || 0,
      featured_image_url: data.featured_image_url || data.image_url || '',
      thrivecart_checkout_url: data.thrivecart_checkout_url || '',
      sku: data.sku || '',
      brand: data.brand || '',
      status: data.status || 'active',
      created_at: new Date().toISOString()
    };

    const content = data.short_description || data.description || '';
    const markdown = createMarkdown(frontmatter, content);

    await saveFile(filePath, markdown, `Add product: ${frontmatter.title}`);

    Cache.invalidate('list');
    return { ok: true, data: { ...frontmatter, description: content } };
  }

  async function updateStoreProduct(slug, data) {
    console.log('[API.updateStoreProduct] Received data:', data);
    console.log('[API.updateStoreProduct] Status in data:', data.status);

    const filePath = `${CONFIG.contentPaths.storeProducts}/${slug}.md`;
    const file = await getFile(filePath);
    const { frontmatter: existing, content: existingContent } = parseMarkdown(file.content);

    console.log('[API.updateStoreProduct] Existing frontmatter:', existing);

    const frontmatter = {
      ...existing,
      ...data,
      slug: data.slug || existing.slug,
      price: data.price !== undefined ? parseFloat(data.price) : existing.price,
      updated_at: new Date().toISOString()
    };

    delete frontmatter.description;
    delete frontmatter.short_description;

    console.log('[API.updateStoreProduct] Merged frontmatter:', frontmatter);
    console.log('[API.updateStoreProduct] Status in merged frontmatter:', frontmatter.status);

    const content = data.short_description || data.description || existingContent;
    const markdown = createMarkdown(frontmatter, content);

    console.log('[API.updateStoreProduct] Final markdown (first 500 chars):', markdown.substring(0, 500));

    await saveFile(filePath, markdown, `Update product: ${frontmatter.title}`, file.sha);

    Cache.invalidate('list');
    Cache.invalidate('single', `product_${slug}`);

    return { ok: true, data: { ...frontmatter, description: content } };
  }

  async function deleteStoreProduct(slug) {
    const filePath = `${CONFIG.contentPaths.storeProducts}/${slug}.md`;
    const file = await getFile(filePath);

    await deleteFile(filePath, `Delete product: ${slug}`, file.sha);

    Cache.invalidate('list');
    Cache.invalidate('single', `product_${slug}`);

    return { ok: true };
  }

  async function updateStoreCategory(slug, data) {
    const { data: categories } = await getStoreCategories();
    const index = categories.findIndex(c => c.slug === slug);

    if (index === -1) {
      throw new Error('Category not found');
    }

    categories[index] = { ...categories[index], ...data };

    const file = await getFile(CONFIG.contentPaths.storeCategories);

    await saveFile(
      CONFIG.contentPaths.storeCategories,
      JSON.stringify(categories, null, 2),
      `Update store category: ${data.name || categories[index].name}`,
      file.sha
    );

    Cache.invalidate('categories', 'store');
    return { ok: true, data: categories[index] };
  }

  async function deleteStoreCategory(slug) {
    const { data: categories } = await getStoreCategories();
    const filtered = categories.filter(c => c.slug !== slug);

    if (filtered.length === categories.length) {
      throw new Error('Category not found');
    }

    const file = await getFile(CONFIG.contentPaths.storeCategories);

    await saveFile(
      CONFIG.contentPaths.storeCategories,
      JSON.stringify(filtered, null, 2),
      `Delete store category: ${slug}`,
      file.sha
    );

    Cache.invalidate('categories', 'store');
    return { ok: true };
  }

  // ============================================
  // DIRECTORY ENDPOINTS
  // ============================================

  async function getDirectoryListings(filters = {}) {
    const cacheKey = `listings_${JSON.stringify(filters)}`;
    const cached = Cache.get('list', cacheKey);
    if (cached) return { ok: true, data: cached };

    const files = await listFiles(CONFIG.contentPaths.directoryListings);
    const listings = [];

    for (const file of files) {
      const content = await fetchRawContent(file.path);
      if (!content) continue;

      const { frontmatter, content: description } = parseMarkdown(content);

      // Apply filters
      if (filters.state && frontmatter.state !== filters.state) continue;
      if (filters.type && frontmatter.type !== filters.type) continue;
      if (filters.access && frontmatter.access !== filters.access) continue;
      if (filters.species) {
        const species = frontmatter.species_tags || [];
        if (!species.some(s => s.toLowerCase().includes(filters.species.toLowerCase()))) {
          continue;
        }
      }
      if (filters.q) {
        const searchStr = `${frontmatter.name} ${description}`.toLowerCase();
        if (!searchStr.includes(filters.q.toLowerCase())) {
          continue;
        }
      }

      if (frontmatter.status === 'inactive') continue;

      listings.push({
        ...frontmatter,
        description: description,
        species: frontmatter.species_tags || [],
        image_url: frontmatter.featured_image_url || frontmatter.image_url
      });
    }

    // Sort by name
    listings.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    Cache.set('list', listings, cacheKey);
    return { ok: true, data: listings };
  }

  async function getDirectoryListing(slug) {
    if (!slug) throw new Error('Listing slug is required');

    const cacheKey = `listing_${slug}`;
    const cached = Cache.get('single', cacheKey);
    if (cached) return { ok: true, data: cached };

    const filePath = `${CONFIG.contentPaths.directoryListings}/${slug}.md`;
    const content = await fetchRawContent(filePath);

    if (!content) {
      throw new Error('Listing not found');
    }

    const { frontmatter, content: description } = parseMarkdown(content);

    const listing = {
      ...frontmatter,
      description: description,
      description_md: description,
      species: frontmatter.species_tags || [],
      image_url: frontmatter.featured_image_url || frontmatter.image_url
    };

    Cache.set('single', listing, cacheKey);
    return { ok: true, data: listing };
  }

  async function createDirectoryListing(data) {
    const slug = data.slug;
    const filePath = `${CONFIG.contentPaths.directoryListings}/${slug}.md`;

    const frontmatter = {
      slug: data.slug,
      name: data.name,
      type: data.type,
      access: data.access,
      state: data.state,
      city: data.city || '',
      address: data.address || '',
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      species_tags: data.species_tags ?
        (Array.isArray(data.species_tags) ? data.species_tags : data.species_tags.split(',').map(s => s.trim())) : [],
      amenities: data.amenities ?
        (Array.isArray(data.amenities) ? data.amenities : data.amenities.split(',').map(a => a.trim())) : [],
      featured_image_url: data.featured_image_url || data.image_url || '',
      website_url: data.website_url || '',
      contact_email: data.contact_email || '',
      regulations: data.regulations || '',
      status: data.status || 'active',
      created_at: new Date().toISOString()
    };

    const content = data.description_md || data.description || '';
    const markdown = createMarkdown(frontmatter, content);

    await saveFile(filePath, markdown, `Add listing: ${data.name}`);

    Cache.invalidate('list');
    return { ok: true, data: { ...frontmatter, description: content } };
  }

  async function updateDirectoryListing(slug, data) {
    const filePath = `${CONFIG.contentPaths.directoryListings}/${slug}.md`;
    const file = await getFile(filePath);
    const { frontmatter: existing, content: existingContent } = parseMarkdown(file.content);

    const frontmatter = {
      ...existing,
      ...data,
      slug: data.slug || existing.slug,
      species_tags: data.species_tags ?
        (Array.isArray(data.species_tags) ? data.species_tags : data.species_tags.split(',').map(s => s.trim())) : existing.species_tags,
      amenities: data.amenities ?
        (Array.isArray(data.amenities) ? data.amenities : data.amenities.split(',').map(a => a.trim())) : existing.amenities,
      updated_at: new Date().toISOString()
    };

    delete frontmatter.description;
    delete frontmatter.description_md;

    const content = data.description_md || data.description || existingContent;
    const markdown = createMarkdown(frontmatter, content);

    await saveFile(filePath, markdown, `Update listing: ${frontmatter.name}`, file.sha);

    Cache.invalidate('list');
    Cache.invalidate('single', `listing_${slug}`);

    return { ok: true, data: { ...frontmatter, description: content } };
  }

  async function deleteDirectoryListing(slug) {
    const filePath = `${CONFIG.contentPaths.directoryListings}/${slug}.md`;
    const file = await getFile(filePath);

    await deleteFile(filePath, `Delete listing: ${slug}`, file.sha);

    Cache.invalidate('list');
    Cache.invalidate('single', `listing_${slug}`);

    return { ok: true };
  }

  // ============================================
  // IMAGE UPLOAD
  // ============================================

  async function uploadImage(file, folder = 'general') {
    const token = getAdminToken();
    if (!token) {
      throw new Error('Admin authentication required');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    const path = `${CONFIG.contentPaths.images}/${folder}/${timestamp}-${safeName}`;

    // Read file as base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];

          const response = await githubFetch(
            `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: `Upload image: ${safeName}`,
                content: base64,
                branch: CONFIG.branch
              })
            }
          );

          const result = await response.json();

          // Return the raw GitHub URL for the image
          const imageUrl = `${GITHUB_RAW_BASE}/${path}`;

          resolve({
            ok: true,
            url: imageUrl,
            path: path
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // ============================================
  // ADMIN HELPERS
  // ============================================

  /**
   * Get all content for admin dashboard
   */
  async function getAllContent() {
    const [blogCats, storeCats, posts, products, listings] = await Promise.all([
      getBlogCategories(),
      getStoreCategories(),
      getBlogPostsAdmin(),
      getStoreProductsAdmin(),
      getDirectoryListingsAdmin()
    ]);

    return {
      blogCategories: blogCats.data,
      storeCategories: storeCats.data,
      posts: posts.data,
      products: products.data,
      listings: listings.data
    };
  }

  /**
   * Get all blog posts including drafts (admin only)
   * Always fetches fresh data (no cache) for admin views
   */
  async function getBlogPostsAdmin() {
    // Skip local cache for admin - always get fresh from GitHub
    Cache.invalidate('list', `files_${CONFIG.contentPaths.blogPosts}`);

    const files = await listFiles(CONFIG.contentPaths.blogPosts);
    const posts = [];

    for (const file of files) {
      // Use cache-busting for admin to get fresh data
      const content = await fetchRawContent(file.path, true);
      if (!content) continue;

      const { frontmatter, content: markdownContent } = parseMarkdown(content);

      posts.push({
        ...frontmatter,
        content: markdownContent,
        image_url: frontmatter.featured_image_url || frontmatter.image_url
      });
    }

    posts.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));

    return { ok: true, data: posts };
  }

  /**
   * Get all products including inactive (admin only)
   * Always fetches fresh data (no cache) for admin views
   */
  async function getStoreProductsAdmin() {
    // Skip local cache for admin - always get fresh from GitHub
    Cache.invalidate('list', `files_${CONFIG.contentPaths.storeProducts}`);

    const files = await listFiles(CONFIG.contentPaths.storeProducts);
    const products = [];

    for (const file of files) {
      // Use cache-busting for admin to get fresh data
      const content = await fetchRawContent(file.path, true);
      if (!content) continue;

      const { frontmatter, content: description } = parseMarkdown(content);

      products.push({
        ...frontmatter,
        name: frontmatter.title || frontmatter.name,
        description: description,
        image_url: frontmatter.featured_image_url || frontmatter.image_url
      });
    }

    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return { ok: true, data: products };
  }

  /**
   * Get all listings including inactive (admin only)
   * Always fetches fresh data (no cache) for admin views
   */
  async function getDirectoryListingsAdmin() {
    // Skip local cache for admin - always get fresh from GitHub
    Cache.invalidate('list', `files_${CONFIG.contentPaths.directoryListings}`);

    const files = await listFiles(CONFIG.contentPaths.directoryListings);
    const listings = [];

    for (const file of files) {
      // Use cache-busting for admin to get fresh data
      const content = await fetchRawContent(file.path, true);
      if (!content) continue;

      const { frontmatter, content: description } = parseMarkdown(content);

      listings.push({
        ...frontmatter,
        description: description,
        species: frontmatter.species_tags || [],
        image_url: frontmatter.featured_image_url || frontmatter.image_url
      });
    }

    listings.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return { ok: true, data: listings };
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Configuration
    CONFIG,

    // Token management
    getAdminToken,
    setAdminToken,
    hasAdminToken,

    // Health
    checkHealth,

    // Blog - Read
    getBlogCategories,
    getBlogPosts,
    getBlogPost,

    // Blog - Write
    createBlogCategory,
    createBlogPost,
    updateBlogCategory,
    updateBlogPost,
    deleteBlogCategory,
    deleteBlogPost,

    // Store - Read
    getStoreCategories,
    getStoreProducts,
    getStoreProduct,

    // Store - Write
    createStoreCategory,
    createStoreProduct,
    updateStoreCategory,
    updateStoreProduct,
    deleteStoreCategory,
    deleteStoreProduct,

    // Directory - Read
    getDirectoryListings,
    getDirectoryListing,

    // Directory - Write
    createDirectoryListing,
    updateDirectoryListing,
    deleteDirectoryListing,

    // Images
    uploadImage,

    // Admin helpers
    getAllContent,
    getBlogPostsAdmin,
    getStoreProductsAdmin,
    getDirectoryListingsAdmin,

    // Cache control
    invalidateCache: Cache.invalidate.bind(Cache),
    clearCache: Cache.clearExpired.bind(Cache)
  };
})();

// Make API available globally
window.API = API;
