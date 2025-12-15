/**
 * BOLINGO Homepage JavaScript
 * Handles dynamic content loading for the homepage
 */

(function() {
  'use strict';

  // Number of items to show in each section
  const ITEMS_TO_SHOW = 6;

  // Demo data for when API is empty
  const DEMO_LISTINGS = [
    {
      slug: 'back-bay-wildlife-refuge',
      name: 'Back Bay National Wildlife Refuge',
      description: 'Premier waterfowl hunting destination with 9,000 acres of beach, dunes, woodland, and marshes. Excellent duck and goose hunting during migration season.',
      type: 'Public',
      access: 'Permit Required',
      state: 'VA',
      city: 'Virginia Beach',
      species: ['Waterfowl', 'Duck', 'Goose'],
      image_url: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=600&h=400&fit=crop'
    },
    {
      slug: 'great-dismal-swamp',
      name: 'Great Dismal Swamp NWR',
      description: 'Over 112,000 acres of forested wetlands offering deer, bear, and small game hunting. A true wilderness experience in coastal Virginia.',
      type: 'Public',
      access: 'Free Access',
      state: 'VA',
      city: 'Suffolk',
      species: ['Deer', 'Bear', 'Turkey', 'Squirrel'],
      image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&h=400&fit=crop'
    },
    {
      slug: 'chickahominy-wma',
      name: 'Chickahominy Wildlife Management Area',
      description: 'Popular destination for deer and turkey hunters with rolling terrain and mixed hardwood forests. Excellent for bow hunting.',
      type: 'Public',
      access: 'License Required',
      state: 'VA',
      city: 'Charles City',
      species: ['Deer', 'Turkey', 'Dove'],
      image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop'
    },
    {
      slug: 'hog-island-wma',
      name: 'Hog Island Wildlife Management Area',
      description: 'Coastal hunting area featuring waterfowl and upland game. Beautiful marsh landscapes and abundant wildlife.',
      type: 'Public',
      access: 'Permit Required',
      state: 'VA',
      city: 'Surry',
      species: ['Waterfowl', 'Deer', 'Rabbit'],
      image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop'
    },
    {
      slug: 'ragged-island-wma',
      name: 'Ragged Island Wildlife Management Area',
      description: 'Prime waterfowl hunting along the James River. Managed blinds available during duck season.',
      type: 'Public',
      access: 'Lottery Draw',
      state: 'VA',
      city: 'Isle of Wight',
      species: ['Duck', 'Goose', 'Teal'],
      image_url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=600&h=400&fit=crop'
    },
    {
      slug: 'mattaponi-wma',
      name: 'Mattaponi Wildlife Management Area',
      description: 'Diverse hunting opportunities in the Virginia Piedmont. Known for excellent deer and turkey populations.',
      type: 'Public',
      access: 'License Required',
      state: 'VA',
      city: 'Caroline',
      species: ['Deer', 'Turkey', 'Quail'],
      image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop'
    }
  ];

  const DEMO_POSTS = [
    {
      slug: 'best-waterfowl-spots-hampton-roads',
      title: 'Top 5 Waterfowl Hunting Spots in Hampton Roads',
      excerpt: 'Discover the best locations for duck and goose hunting in the Hampton Roads region. From coastal marshes to inland ponds.',
      category_name: 'Hunting Spots',
      category_slug: 'hunting-spots',
      author: 'Mike Harrison',
      published_at: '2025-12-10',
      image_url: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=600&h=400&fit=crop'
    },
    {
      slug: 'deer-hunting-preparation-guide',
      title: 'Complete Deer Season Preparation Guide',
      excerpt: 'Everything you need to know to prepare for a successful deer hunting season. Gear, scouting, and tactics covered.',
      category_name: 'Guides',
      category_slug: 'guides',
      author: 'Sarah Mitchell',
      published_at: '2025-12-08',
      image_url: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=600&h=400&fit=crop'
    },
    {
      slug: 'essential-gear-cold-weather',
      title: 'Essential Gear for Cold Weather Hunting',
      excerpt: 'Stay warm and effective in the field with our guide to the best cold weather hunting gear and layering strategies.',
      category_name: 'Gear Reviews',
      category_slug: 'gear-reviews',
      author: 'Tom Bradley',
      published_at: '2025-12-05',
      image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&h=400&fit=crop'
    },
    {
      slug: 'virginia-hunting-regulations-2025',
      title: 'Virginia Hunting Regulations Update 2025',
      excerpt: 'Important changes to Virginia hunting regulations you need to know. Season dates, bag limits, and new requirements.',
      category_name: 'Regulations',
      category_slug: 'regulations',
      author: 'BOLINGO Staff',
      published_at: '2025-12-01',
      image_url: 'https://images.unsplash.com/photo-1541704328070-20bf4601ae3e?w=600&h=400&fit=crop'
    },
    {
      slug: 'turkey-calling-techniques',
      title: 'Master Turkey Calling: Tips from the Pros',
      excerpt: 'Learn the calling techniques that will help you bag more gobblers this spring. From yelps to purrs and everything in between.',
      category_name: 'Tips & Tactics',
      category_slug: 'tips-tactics',
      author: 'Jim Carson',
      published_at: '2025-11-28',
      image_url: 'https://images.unsplash.com/photo-1508005244655-f1300e7a35ab?w=600&h=400&fit=crop'
    },
    {
      slug: 'bow-hunting-beginners',
      title: 'Bow Hunting for Beginners: Getting Started',
      excerpt: 'A comprehensive guide for those new to bow hunting. Equipment selection, practice routines, and your first hunt.',
      category_name: 'Guides',
      category_slug: 'guides',
      author: 'Amanda Price',
      published_at: '2025-11-25',
      image_url: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=600&h=400&fit=crop'
    }
  ];

  const DEMO_PRODUCTS = [
    {
      slug: 'pro-hunter-backpack',
      name: 'Pro Hunter 45L Backpack',
      description: 'Rugged, waterproof hunting backpack with meat hauling frame. Built for serious backcountry hunters.',
      price: 249.99,
      category_name: 'Packs & Bags',
      category_slug: 'packs-bags',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
      thrivecart_checkout_url: ''
    },
    {
      slug: 'thermal-hunting-jacket',
      name: 'Elite Thermal Hunting Jacket',
      description: 'Insulated, scent-blocking jacket with silent fabric. Perfect for cold weather stand hunting.',
      price: 329.99,
      category_name: 'Apparel',
      category_slug: 'apparel',
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop',
      thrivecart_checkout_url: ''
    },
    {
      slug: 'rangefinder-pro-1200',
      name: 'RangeFinder Pro 1200',
      description: 'Precision laser rangefinder with angle compensation. Range up to 1200 yards with 0.5 yard accuracy.',
      price: 189.99,
      category_name: 'Optics',
      category_slug: 'optics',
      image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=400&fit=crop',
      thrivecart_checkout_url: ''
    },
    {
      slug: 'hunting-knife-set',
      name: 'Field Dressing Knife Set',
      description: 'Professional 4-piece knife set with carrying case. Includes skinning, caping, and gut hook knives.',
      price: 89.99,
      category_name: 'Knives & Tools',
      category_slug: 'knives-tools',
      image_url: 'https://images.unsplash.com/photo-1568149279631-55dfd836f609?w=600&h=400&fit=crop',
      thrivecart_checkout_url: ''
    },
    {
      slug: 'trail-camera-cellular',
      name: 'CellTrack Pro Trail Camera',
      description: 'Cellular trail camera with HD video and instant photo alerts. Monitor your hunting spots from anywhere.',
      price: 299.99,
      category_name: 'Trail Cameras',
      category_slug: 'trail-cameras',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
      thrivecart_checkout_url: ''
    },
    {
      slug: 'duck-decoy-set',
      name: 'Premium Mallard Decoy Set (12)',
      description: 'Ultra-realistic mallard decoys with weighted keels. Includes 6 drakes and 6 hens.',
      price: 159.99,
      category_name: 'Decoys',
      category_slug: 'decoys',
      image_url: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=600&h=400&fit=crop',
      thrivecart_checkout_url: ''
    }
  ];

  /**
   * Load featured directory listings
   */
  async function loadFeaturedListings() {
    const container = document.getElementById('featured-listings');
    if (!container) return;

    container.innerHTML = Templates.loadingGrid(ITEMS_TO_SHOW);

    try {
      const response = await API.getDirectoryListings();
      let listings = response.data || response.listings || response || [];

      // Use demo data if API returns empty
      if (!Array.isArray(listings) || listings.length === 0) {
        listings = DEMO_LISTINGS;
      }

      const featured = listings.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.listingCard).join('');
      container.setAttribute('aria-busy', 'false');

    } catch (error) {
      console.error('Error loading featured listings:', error);
      // Fallback to demo data on error
      const featured = DEMO_LISTINGS.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.listingCard).join('');
      container.setAttribute('aria-busy', 'false');
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
      let posts = response.data || response.posts || response || [];

      // Use demo data if API returns empty
      if (!Array.isArray(posts) || posts.length === 0) {
        posts = DEMO_POSTS;
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
      // Fallback to demo data on error
      const featured = DEMO_POSTS.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.postCard).join('');
      container.setAttribute('aria-busy', 'false');
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
      let products = response.data || response.products || response || [];

      // Use demo data if API returns empty
      if (!Array.isArray(products) || products.length === 0) {
        products = DEMO_PRODUCTS;
      }

      const featured = products.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.productCard).join('');
      container.setAttribute('aria-busy', 'false');

    } catch (error) {
      console.error('Error loading featured products:', error);
      // Fallback to demo data on error
      const featured = DEMO_PRODUCTS.slice(0, ITEMS_TO_SHOW);
      container.innerHTML = featured.map(Templates.productCard).join('');
      container.setAttribute('aria-busy', 'false');
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
