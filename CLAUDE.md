# BOLINGO - Hunting Directory, Blog & Store

## Project Overview
A production-ready MVP website for the hunting niche featuring:
- **Directory**: Searchable hunting location database (Hampton, VA region)
- **Blog**: Categories and posts with dynamic content
- **Store**: Product catalog with ThriveCart checkout integration
- **Admin Portal**: Token-based content management

## Tech Stack
- Vanilla HTML5/CSS3/JavaScript (no frameworks)
- Google Apps Script backend API
- ThriveCart for checkout processing

## Design System
**Theme**: Lodge Luxury - Refined wilderness aesthetic

### Typography
- **Headings**: `Bebas Neue` - Bold, impactful display font
- **Body**: `Source Serif 4` - Elegant, readable serif
- **Accents**: `Cormorant Garamond` - Refined, classic serif

### Color Palette
```css
--color-primary: #C9A227;        /* Aged brass/antique gold */
--color-secondary: #2A4A1A;      /* Deep forest green */
--color-accent: #8B4513;         /* Saddle brown */
--color-bg-dark: #0C0B09;        /* Warm near-black */
--color-bg-card: #161412;        /* Dark walnut */
--color-text: #E8E4DC;           /* Warm off-white */
--color-text-muted: #9C9588;     /* Weathered stone */
```

## File Structure
```
/bolingo
├── /components
│   ├── header.html              # Reusable header
│   └── footer.html              # Reusable footer
├── /assets
│   ├── /css
│   │   └── styles.css           # All styles (mobile-first)
│   └── /js
│       ├── api.js               # API communication layer
│       ├── ui.js                # UI utilities (toasts, loading)
│       ├── templates.js         # HTML template functions
│       ├── headerFooter.js      # Component loader
│       └── /pages
│           ├── home.js          # Homepage logic
│           ├── directory.js     # Directory listing page
│           ├── listing.js       # Single listing detail
│           ├── blog.js          # Blog posts list
│           ├── blogCategory.js  # Posts by category
│           ├── post.js          # Single post detail
│           ├── store.js         # Products list
│           ├── storeCategory.js # Products by category
│           ├── product.js       # Single product detail
│           └── admin.js         # Admin portal
├── index.html                   # Homepage
├── directory.html               # Directory listing
├── listing.html                 # Single listing (?slug=...)
├── blog.html                    # Blog posts list
├── blog-category.html           # Posts by category (?slug=...)
├── post.html                    # Single post (?slug=...)
├── store.html                   # Products list
├── store-category.html          # Products by category (?slug=...)
├── product.html                 # Single product (?slug=...)
├── about.html                   # About page
├── contact.html                 # Contact form
├── privacy.html                 # Privacy policy
├── terms.html                   # Terms of service
├── admin.html                   # Admin portal
└── 404.html                     # Error page
```

## API Configuration

### Base URL
```
https://script.google.com/macros/s/AKfycbxM9VoOA-Hch13zwC5A_uVllmVcO3pL_dbam1ITKjwp1h7ihz5b7kfwN7t82VAYCTlfng/exec
```

### GET Endpoints (Public)
| Endpoint | Description | Query Params |
|----------|-------------|--------------|
| `/health` | API health check | - |
| `/blog/categories` | List blog categories | - |
| `/blog/posts` | List blog posts | `category_slug` |
| `/blog/post` | Single blog post | `slug` (required) |
| `/store/categories` | List store categories | - |
| `/store/products` | List products | `category_slug` |
| `/store/product` | Single product | `slug` (required) |
| `/directory/listings` | List hunting locations | `state`, `type`, `access`, `species`, `q` |
| `/directory/listing` | Single location | `slug` (required) |

### POST Endpoints (Admin)
Requires `X-ADMIN-TOKEN` header.

| Endpoint | Description |
|----------|-------------|
| `/blog/category` | Create blog category |
| `/blog/post` | Create blog post |
| `/store/category` | Create store category |
| `/store/product` | Create product |
| `/directory/listing` | Create directory listing |

## Development

### Running Locally
```bash
# Python
cd /Volumes/Line_16/bolingo && python3 -m http.server 8000

# Node.js
npx serve /Volumes/Line_16/bolingo

# Then open http://localhost:8000 or the serve URL
```

### Key Files to Modify

**Styling**: `assets/css/styles.css`
- CSS variables at top of file for colors, fonts, spacing
- Mobile-first responsive breakpoints

**Templates**: `assets/js/templates.js`
- Card templates for listings, posts, products
- Loading states and error messages

**API**: `assets/js/api.js`
- Endpoint definitions and fetch logic
- Token management for admin

## Known Issues
- API endpoints may return health check response when no data exists
- Content must be added via Admin portal before displaying on frontend

## Admin Portal Usage
1. Navigate to `/admin.html`
2. Enter admin token (from API administrator)
3. Use tabs to create: Blog Categories, Blog Posts, Store Categories, Products, Directory Listings
4. ThriveCart URL required for product checkout (leave blank for "Coming Soon")

## Deployment
Static hosting compatible: Netlify, Vercel, GitHub Pages
No build step required - deploy directly.
