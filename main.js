document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("sahil_dairy_cart")) || [];
  let wishlist = JSON.parse(localStorage.getItem("sahil_dairy_wishlist")) || [];
  let loyaltyPoints = parseInt(localStorage.getItem("sahil_dairy_points")) || 150;
  let currentUser = JSON.parse(localStorage.getItem("sahil_dairy_current_user")) || null;
  let authToken = localStorage.getItem("sahil_dairy_token") || null;
  let currentCategory = "All";
  let searchFilter = "";
  let sortOption = "popular";
  let activeCoupon = null;

  // Mock coupon codes
  const COUPONS = {
    "MILK20": { discountPercent: 20, description: "20% Off on entire order" },
    "FRESH10": { discountPercent: 10, description: "10% Off for healthy dairy" }
  };

  // Mock tracking databases
  const TRACKING_DB = {
    "SAHIL-101": { status: "Delivered", progress: 100, step: 4 },
    "SAHIL-102": { status: "Out for Delivery", progress: 66, step: 3 },
    "SAHIL-103": { status: "Packed & Ready", progress: 33, step: 2 },
    "SAHIL-104": { status: "Ordered", progress: 0, step: 1 }
  };

  // Mock dairy booths database
  const BOOTHS_DB = [
    { id: 1, name: "Sahil's Dairy Booth #01 - Malviya Nagar", address: "Sector 3, Main Market, Malviya Nagar", pincode: "302017", distance: "0.8 km", timings: "6:00 AM - 10:00 PM", x: 30, y: 40 },
    { id: 2, name: "Sahil's Dairy Booth #02 - Vaishali Nagar", address: "Amrapali Marg, Block B, Vaishali Nagar", pincode: "302021", distance: "2.3 km", timings: "6:00 AM - 9:30 PM", x: 75, y: 25 },
    { id: 3, name: "Sahil's Dairy Booth #03 - Mansarovar", address: "Vijay Path, Sector 5, Mansarovar", pincode: "302020", distance: "3.5 km", timings: "5:30 AM - 10:00 PM", x: 45, y: 80 },
    { id: 4, name: "Sahil's Dairy Booth #04 - C-Scheme", address: "Subhash Marg, Behind Raj Mandir, C-Scheme", pincode: "302001", distance: "1.2 km", timings: "6:00 AM - 10:00 PM", x: 60, y: 55 },
    { id: 5, name: "Sahil's Dairy Booth #05 - Raja Park", address: "Gali No. 4, Shopping Centre, Raja Park", pincode: "302004", distance: "2.0 km", timings: "6:00 AM - 9:00 PM", x: 15, y: 65 }
  ];
  let boothsList = [...BOOTHS_DB];

  // Async API Seeder Fetchers
  const fetchProductsAndBooths = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          window.productsData = data;
        }
      }
    } catch (err) {
      console.warn("Backend products endpoint offline. Using local catalog fallback.");
    }

    try {
      const res = await fetch('/api/booths');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          boothsList = data;
        }
      }
    } catch (err) {
      console.warn("Backend booths endpoint offline. Using local locator fallback.");
    }

    // Initialize E-commerce UI Engine
    init();
  };


  // --- DYNAMIC SVG GENERATOR ENGINE ---
  // Injects scalable modern vector illustrations directly to speed up load times and guarantee rendering
  const getProductSVG = (type) => {
    switch (type) {
      case "milk-gold":
        return `
          <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFD700"/>
                <stop offset="100%" stop-color="#B8860B"/>
              </linearGradient>
            </defs>
            <!-- Carton Body -->
            <path d="M25,40 L50,20 L75,40 L75,110 Q75,113 72,113 L28,113 Q25,113 25,110 Z" fill="#F8F9FA" stroke="#E2E8F0" stroke-width="2" />
            <!-- Gold Premium Top -->
            <path d="M25,40 L50,20 L75,40 L50,45 Z" fill="url(#goldGrad)" />
            <path d="M50,20 L50,45" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="2,2"/>
            <!-- Brand Ribbon -->
            <rect x="25" y="55" width="50" height="22" fill="url(#goldGrad)" />
            <text x="50" y="66" font-family="'Outfit', sans-serif" font-weight="800" font-size="6.5" fill="#FFFFFF" text-anchor="middle">GOLD 1L</text>
            <text x="50" y="73" font-family="'Outfit', sans-serif" font-weight="600" font-size="4.5" fill="#F3F4F6" text-anchor="middle">WHOLE MILK</text>
            <!-- Cow Silhouette vector representation -->
            <path d="M43,88 Q45,86 48,86 Q50,86 52,88 L54,92 Q55,90 57,90 L59,92 Q58,95 56,96 L53,95 L50,98 L47,95 L44,96 Q42,95 41,92 Z" fill="#4A5568"/>
            <circle cx="50" cy="104" r="3" fill="#0F52BA" opacity="0.15"/>
            <!-- Droplet -->
            <path d="M50,99 Q49,101 50,102 Q51,101 50,99 Z" fill="#0F52BA" opacity="0.7"/>
          </svg>
        `;
      case "milk-toned":
        return `
          <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3A86FF"/>
                <stop offset="100%" stop-color="#0F52BA"/>
              </linearGradient>
            </defs>
            <!-- Blue Toned Milk Carton -->
            <path d="M25,40 L50,20 L75,40 L75,110 Q75,113 72,113 L28,113 Q25,113 25,110 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
            <path d="M25,40 L50,20 L75,40 L50,45 Z" fill="url(#blueGrad)" />
            <!-- Wave Graphic -->
            <path d="M25,75 Q37,68 50,75 T75,75 L75,110 L25,110 Z" fill="url(#blueGrad)" opacity="0.85"/>
            <path d="M25,82 Q37,76 50,82 T75,82 L75,110 L25,110 Z" fill="#FFFFFF" opacity="0.9"/>
            <text x="50" y="60" font-family="'Outfit', sans-serif" font-weight="800" font-size="8" fill="#0F52BA" text-anchor="middle">TONED</text>
            <text x="50" y="98" font-family="'Outfit', sans-serif" font-weight="700" font-size="6" fill="#0F52BA" text-anchor="middle">500ml</text>
            <text x="50" y="104" font-family="'Inter', sans-serif" font-size="4" fill="#64748B" text-anchor="middle">PASTEURIZED</text>
          </svg>
        `;
      case "curd":
        return `
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Terra-cotta Matka/Clay Pot -->
            <ellipse cx="50" cy="40" rx="30" ry="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5" />
            <ellipse cx="50" cy="40" rx="27" ry="6" fill="#F1F5F9" />
            <!-- Clay Pot Body -->
            <path d="M20,40 Q15,65 30,85 Q40,92 50,92 Q60,92 70,85 Q85,65 80,40 Z" fill="#CD7F32" stroke="#A0522D" stroke-width="2"/>
            <!-- Green Ribbon -->
            <path d="M17,55 Q50,60 83,55 L81,65 Q50,70 19,65 Z" fill="#2E8B57" />
            <text x="50" y="62" font-family="'Outfit', sans-serif" font-weight="700" font-size="6" fill="#FFFFFF" text-anchor="middle">FRESH CURD</text>
            <!-- Cream Swirl -->
            <path d="M42,39 C46,36 54,36 58,39 C54,42 46,42 42,39 Z" fill="#FFFFFF"/>
            <path d="M35,39 C42,43 58,43 65,39" stroke="#E2E8F0" stroke-width="1" fill="none"/>
          </svg>
        `;
      case "paneer":
        return `
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="paneerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF"/>
                <stop offset="100%" stop-color="#E2E8F0"/>
              </linearGradient>
            </defs>
            <!-- Plastic Seal Outline -->
            <rect x="15" y="15" width="70" height="70" rx="10" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="3,3"/>
            <!-- Paneer Cube Block -->
            <rect x="22" y="22" width="56" height="56" rx="4" fill="url(#paneerGrad)" stroke="#94A3B8" stroke-width="1"/>
            <!-- Grid Cut Lines -->
            <line x1="36" y1="22" x2="36" y2="78" stroke="#E2E8F0" stroke-width="1"/>
            <line x1="50" y1="22" x2="50" y2="78" stroke="#E2E8F0" stroke-width="1"/>
            <line x1="64" y1="22" x2="64" y2="78" stroke="#E2E8F0" stroke-width="1"/>
            <line x1="22" y1="36" x2="78" y2="36" stroke="#E2E8F0" stroke-width="1"/>
            <line x1="22" y1="50" x2="78" y2="50" stroke="#E2E8F0" stroke-width="1"/>
            <line x1="22" y1="64" x2="78" y2="64" stroke="#E2E8F0" stroke-width="1"/>
            <!-- Mint Leaf Ornament -->
            <path d="M50,50 Q43,42 50,30 Q57,42 50,50 Z" fill="#2E8B57" opacity="0.8"/>
            <path d="M50,50 Q57,48 62,40 Q55,42 50,50 Z" fill="#52C41A" opacity="0.6"/>
            <!-- Label -->
            <rect x="25" y="65" width="50" height="10" rx="2" fill="#0F52BA" />
            <text x="50" y="72" font-family="'Outfit', sans-serif" font-weight="700" font-size="5" fill="#FFFFFF" text-anchor="middle">PREMIUM PANEER</text>
          </svg>
        `;
      case "ghee":
        return `
          <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gheeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFDF00"/>
                <stop offset="60%" stop-color="#FFB800"/>
                <stop offset="100%" stop-color="#D4AF37"/>
              </linearGradient>
            </defs>
            <!-- Golden Cap -->
            <rect x="35" y="15" width="30" height="8" rx="2" fill="#D4AF37" stroke="#B8860B" stroke-width="1"/>
            <line x1="38" y1="15" x2="38" y2="23" stroke="#B8860B"/>
            <line x1="44" y1="15" x2="44" y2="23" stroke="#B8860B"/>
            <line x1="50" y1="15" x2="50" y2="23" stroke="#B8860B"/>
            <line x1="56" y1="15" x2="56" y2="23" stroke="#B8860B"/>
            <line x1="62" y1="15" x2="62" y2="23" stroke="#B8860B"/>
            <!-- Glass Jar neck -->
            <rect x="38" y="23" width="24" height="6" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1"/>
            <!-- Jar Body -->
            <path d="M38,29 L25,42 L25,95 Q25,102 32,102 L68,102 Q75,102 75,95 L75,42 L62,29 Z" fill="url(#gheeGrad)" stroke="#B8860B" stroke-width="1.5"/>
            <!-- Jar Glass Highlight -->
            <path d="M28,45 L28,95 Q28,98 32,98" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6"/>
            <!-- Circular Ribbon Label -->
            <circle cx="50" cy="65" r="16" fill="#FFFFFF" stroke="#D4AF37" stroke-width="2" />
            <text x="50" y="63" font-family="'Outfit', sans-serif" font-weight="800" font-size="4.5" fill="#B8860B" text-anchor="middle">PURE COW</text>
            <text x="50" y="70" font-family="'Outfit', sans-serif" font-weight="800" font-size="7" fill="#2E8B57" text-anchor="middle">GHEE</text>
            <circle cx="50" cy="77" r="1.5" fill="#D4AF37"/>
          </svg>
        `;
      case "butter":
        return `
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="butterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFF4B8"/>
                <stop offset="100%" stop-color="#FFDD55"/>
              </linearGradient>
            </defs>
            <!-- Butter Box Packaging -->
            <polygon points="15,45 50,30 85,45 85,80 50,90 15,80" fill="#FFE066" stroke="#D4AF37" stroke-width="1.5"/>
            <polygon points="15,45 50,30 50,90 15,80" fill="#FFD000" opacity="0.3"/>
            <!-- Top Lid Logo Area -->
            <polygon points="15,45 50,30 85,45 50,55" fill="#FFDD55" />
            <circle cx="50" cy="42" r="8" fill="#FFFFFF" stroke="#0F52BA" stroke-width="1"/>
            <text x="50" y="45" font-family="'Outfit', sans-serif" font-weight="800" font-size="4.5" fill="#0F52BA" text-anchor="middle">SAHIL</text>
            <!-- Butter Slice Cut out -->
            <polygon points="50,55 85,45 85,80 50,90" fill="#FFDD55" opacity="0.8"/>
            <text x="67" y="70" font-family="'Outfit', sans-serif" font-weight="800" font-size="7" fill="#0F52BA" text-anchor="middle" transform="rotate(10, 67, 70)">BUTTER</text>
            <!-- Little Butter Cube graphic on side -->
            <rect x="25" y="58" width="12" height="12" rx="2" fill="url(#butterGrad)" stroke="#FFB800" stroke-width="1"/>
          </svg>
        `;
      case "cheese":
        return `
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Packaging Frame -->
            <rect x="18" y="15" width="64" height="70" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
            <path d="M18,15 L82,15 L82,30 L18,30 Z" fill="#0F52BA" />
            <text x="50" y="25" font-family="'Outfit', sans-serif" font-weight="700" font-size="6.5" fill="#FFFFFF" text-anchor="middle">CHEESE SLICES</text>
            <!-- Cheese Slice 3D Stack -->
            <g transform="translate(0, 5)">
              <!-- Back Slices -->
              <polygon points="28,52 68,42 78,57 38,67" fill="#FFB800" opacity="0.5"/>
              <polygon points="26,57 66,47 76,62 36,72" fill="#FFC93C" opacity="0.8"/>
              <!-- Front Slice (Active Detail) -->
              <polygon points="24,62 64,52 74,67 34,77" fill="#FFE17D" stroke="#FFB800" stroke-width="1"/>
              <!-- Holes -->
              <circle cx="38" cy="67" r="3" fill="#FFB800" opacity="0.6"/>
              <circle cx="48" cy="62" r="2" fill="#FFB800" opacity="0.6"/>
              <circle cx="58" cy="68" r="3.5" fill="#FFB800" opacity="0.6"/>
              <circle cx="68" cy="60" r="1.5" fill="#FFB800" opacity="0.6"/>
              <circle cx="50" cy="72" r="2.5" fill="#FFB800" opacity="0.6"/>
            </g>
          </svg>
        `;
      case "lassi":
        return `
          <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mangoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FF8C00"/>
                <stop offset="50%" stop-color="#FFB800"/>
                <stop offset="100%" stop-color="#FFA500"/>
              </linearGradient>
            </defs>
            <!-- Cap -->
            <rect x="40" y="12" width="20" height="7" rx="2.5" fill="#FF4500" />
            <!-- Bottle Neck -->
            <path d="M43,19 L43,28 L57,28 L57,19 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
            <!-- Bottle Body -->
            <path d="M43,28 L30,42 L30,95 Q30,102 38,102 L62,102 Q70,102 70,95 L70,42 L57,28 Z" fill="url(#mangoGrad)" stroke="#FF8C00" stroke-width="1.5" />
            <!-- Milk swirl inside lassi -->
            <path d="M34,48 Q50,42 66,48 T34,68 Q50,62 66,68" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.3" stroke-linecap="round"/>
            <path d="M38,78 Q50,74 62,78" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.3" stroke-linecap="round"/>
            <!-- Straw -->
            <path d="M52,12 L56,-2 L60,-1 L56,12 Z" fill="#2E8B57" transform="rotate(-15, 52, 12)" />
            <!-- Label -->
            <rect x="34" y="52" width="32" height="18" rx="2" fill="#FFFFFF" stroke="#FF4500" stroke-width="1" />
            <text x="50" y="60" font-family="'Outfit', sans-serif" font-weight="800" font-size="5" fill="#FF4500" text-anchor="middle">MANGO</text>
            <text x="50" y="66" font-family="'Outfit', sans-serif" font-weight="700" font-size="5.5" fill="#2E8B57" text-anchor="middle">LASSI</text>
          </svg>
        `;
      case "chaas":
        return `
          <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#E8F5E9"/>
                <stop offset="100%" stop-color="#C8E6C9"/>
              </linearGradient>
            </defs>
            <!-- Plastic Bottle Cap -->
            <rect x="38" y="10" width="24" height="8" rx="2" fill="#2E8B57" />
            <rect x="42" y="18" width="16" height="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
            <!-- Bottle Body (Spiced Chaas) -->
            <path d="M42,26 L28,40 L28,95 Q28,102 36,102 L64,102 Q72,102 72,95 L72,40 L58,26 Z" fill="url(#mintGrad)" stroke="#81C784" stroke-width="1.5" />
            <!-- Black Salt & Cumin Specks -->
            <circle cx="38" cy="45" r="0.8" fill="#4E342E" />
            <circle cx="48" cy="52" r="1.2" fill="#795548" />
            <circle cx="58" cy="48" r="0.7" fill="#4E342E" />
            <circle cx="64" cy="58" r="1" fill="#795548" />
            <circle cx="40" cy="65" r="0.8" fill="#4E342E" />
            <circle cx="50" cy="72" r="1.2" fill="#795548" />
            <!-- Mint Leaf Icon -->
            <path d="M50,78 Q45,72 50,65 Q55,72 50,78 Z" fill="#2E8B57" />
            <path d="M50,78 Q55,76 58,70 Q52,72 50,78 Z" fill="#81C784" />
            <!-- Label -->
            <rect x="34" y="44" width="32" height="15" rx="1.5" fill="#FFFFFF" stroke="#2E8B57" stroke-width="1" />
            <text x="50" y="51" font-family="'Outfit', sans-serif" font-weight="800" font-size="5" fill="#2E8B57" text-anchor="middle">MASALA</text>
            <text x="50" y="56" font-family="'Outfit', sans-serif" font-weight="700" font-size="4.5" fill="#1E293B" text-anchor="middle">CHAAS</text>
          </svg>
        `;
      case "icecream":
        return `
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vanillaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFDF0"/>
                <stop offset="100%" stop-color="#FFF5C3"/>
              </linearGradient>
            </defs>
            <!-- Ice Cream Family Tub -->
            <path d="M15,25 L85,25 L75,75 Q73,82 65,82 L35,82 Q27,82 25,75 Z" fill="#0F52BA" stroke="#003D99" stroke-width="2" />
            <!-- Tub Lid Rim -->
            <ellipse cx="50" cy="25" rx="36" ry="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
            <!-- Golden offerings ribbon -->
            <path d="M17.5,35 Q50,42 82.5,35 L81,45 Q50,52 19,45 Z" fill="#FFE259" />
            <text x="50" y="42" font-family="'Outfit', sans-serif" font-weight="800" font-size="5.5" fill="#5C3D00" text-anchor="middle">1+1 FAMILY OFFER</text>
            <!-- Scoop graphic -->
            <path d="M50,19 C55,19 62,10 57,4 C52,4 48,10 50,19 Z" fill="url(#vanillaGrad)" opacity="0.9"/>
            <circle cx="44" cy="18" r="4.5" fill="url(#vanillaGrad)" />
            <circle cx="56" cy="18" r="4.5" fill="url(#vanillaGrad)" />
            <!-- Vanilla flower graphic on tub -->
            <path d="M50,60 L52,53 L58,55 L53,58 L55,64 L50,60 Z" fill="#FFE875" />
            <text x="50" y="70" font-family="'Outfit', sans-serif" font-weight="700" font-size="8" fill="#FFFFFF" text-anchor="middle">VANILLA</text>
          </svg>
        `;
      case "sweets":
        return `
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#EF4444"/>
                <stop offset="100%" stop-color="#991B1B"/>
              </linearGradient>
            </defs>
            <!-- Premium Sweets Box -->
            <polygon points="12,45 50,28 88,45 88,72 50,85 12,72" fill="url(#boxGrad)" stroke="#B8860B" stroke-width="1.5"/>
            <!-- Golden Mandala Ornament -->
            <circle cx="50" cy="46" r="10" fill="none" stroke="#FFD700" stroke-width="1" stroke-dasharray="2,2"/>
            <polygon points="50,38 53,43 59,43 54,46 56,52 50,48 44,52 46,46 41,43 47,43" fill="#FFD700" />
            <!-- Box Sides shadows -->
            <polygon points="12,45 50,28 50,85 12,72" fill="#000000" opacity="0.15"/>
            <text x="50" y="68" font-family="'Outfit', sans-serif" font-weight="800" font-size="6" fill="#FFD700" text-anchor="middle">MILK PEDA</text>
            <text x="50" y="74" font-family="'Outfit', sans-serif" font-weight="500" font-size="4" fill="#FFFFFF" text-anchor="middle">ROYAL DAIRY SWEETS</text>
            <!-- Almond Garnish represent -->
            <ellipse cx="28" cy="58" rx="2" ry="3" fill="#FFF8DC" transform="rotate(30, 28, 58)"/>
            <ellipse cx="72" cy="58" rx="2" ry="3" fill="#FFF8DC" transform="rotate(-30, 72, 58)"/>
          </svg>
        `;
      default:
        return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#E2E8F0"/></svg>`;
    }
  };

  // --- CORE UI SELECTORS ---
  const productsGrid = document.getElementById("products-grid");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBody = document.getElementById("cart-body");
  const cartBadge = document.getElementById("cart-badge");
  const wishlistBadge = document.getElementById("wishlist-badge");
  const wishlistBtn = document.getElementById("btn-wishlist");
  const themeToggle = document.getElementById("btn-theme-toggle");
  const categoriesContainer = document.getElementById("categories-container");
  const searchInput = document.getElementById("catalog-search");
  const sortSelect = document.getElementById("sort-filter");
  const minPriceInput = document.getElementById("price-min");
  const maxPriceInput = document.getElementById("price-max");
  const quickViewModal = document.getElementById("quickview-modal");

  // --- DYNAMIC RENDERING - PRODUCT CATALOG ---
  const renderCatalog = () => {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    // Apply Filter Configurations
    let filtered = window.productsData.filter(product => {
      // Category filter
      if (currentCategory !== "All" && product.category !== currentCategory) return false;
      // Search filter
      if (searchFilter && !product.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
      // Price range filters
      const minP = parseFloat(minPriceInput.value) || 0;
      const maxP = parseFloat(maxPriceInput.value) || 1000;
      if (product.price < minP || product.price > maxP) return false;
      return true;
    });

    // Sorting Engine
    if (sortOption === "low-to-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-to-low") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "top-rated") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // popular
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 15px; opacity: 0.5;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
          <h3>No Dairy Products Found</h3>
          <p>Try modifying your search queries or category filters.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(product => {
      const isWishlisted = wishlist.includes(product.id);
      const card = document.createElement("div");
      card.className = "product-card glassmorphism";
      card.dataset.id = product.id;

      card.innerHTML = `
        <button class="wishlist-toggle ${isWishlisted ? 'active' : ''}" aria-label="Add to Wishlist" data-id="${product.id}">
          <svg width="18" height="18" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
        </button>
        <div class="product-image-container">
          ${getProductSVG(product.svgType)}
        </div>
        <div class="product-meta">
          <span>${product.category}</span>
          <div class="product-rating">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"/></svg>
            <span>${product.rating}</span>
          </div>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-volume">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25m16.5 0V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v1.5m6.75 4.5l3 3m0 0l3-3m-3 3V10.5"/></svg>
          <span>${product.volume}</span>
        </div>
        <div class="product-footer">
          <div class="product-price">₹${product.price}</div>
          <div class="product-actions">
            <button class="btn-card-add" data-id="${product.id}">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Add
            </button>
            <button class="btn-card-view" data-id="${product.id}" aria-label="Quick View Product">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
            </button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    // Rebind action listeners to dynamic cards
    bindProductActions();
  };

  // --- ACTIONS BINDER ---
  const bindProductActions = () => {
    // Add to Cart from grid
    document.querySelectorAll(".btn-card-add").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(btn.dataset.id);
      });
    });

    // Wishlist Toggle
    document.querySelectorAll(".wishlist-toggle").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleWishlist(btn.dataset.id, btn);
      });
    });

    // Quick View triggers
    document.querySelectorAll(".btn-card-view").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        showQuickView(btn.dataset.id);
      });
    });
  };

  // --- CATEGORIES POPULATOR ---
  const setupCategories = () => {
    if (!categoriesContainer) return;
    const categories = ["All", "Milk", "Curd", "Paneer", "Ghee", "Butter", "Cheese", "Lassi", "Buttermilk", "Ice Cream", "Dairy Sweets"];
    
    categoriesContainer.innerHTML = "";
    categories.forEach(cat => {
      const pill = document.createElement("button");
      pill.className = `category-pill ${cat === currentCategory ? 'active' : ''}`;
      pill.innerHTML = `
        <span>${cat}</span>
      `;
      pill.addEventListener("click", () => {
        document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentCategory = cat;
        renderCatalog();
      });
      categoriesContainer.appendChild(pill);
    });
  };

  // --- WISHLIST ENGINE ---
  const toggleWishlist = (id, element = null) => {
    const index = wishlist.indexOf(id);
    const product = window.productsData.find(p => p.id === id);

    if (index === -1) {
      wishlist.push(id);
      showToast(`${product.name} added to Wishlist!`, "success");
      if (element) element.classList.add("active");
    } else {
      wishlist.splice(index, 1);
      showToast(`${product.name} removed from Wishlist`, "info");
      if (element) element.classList.remove("active");
    }

    localStorage.setItem("sahil_dairy_wishlist", JSON.stringify(wishlist));
    updateBadges();
  };

  // Trigger viewing wishlist in catalog
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      if (wishlist.length === 0) {
        showToast("Your Wishlist is empty!", "info");
        return;
      }
      // Simulate filtering by wishlist
      productsGrid.innerHTML = "";
      const wishlistedProducts = window.productsData.filter(p => wishlist.includes(p.id));
      
      wishlistedProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card glassmorphism";
        card.innerHTML = `
          <button class="wishlist-toggle active" aria-label="Remove from Wishlist" data-id="${product.id}">
            <svg width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
          </button>
          <div class="product-image-container">${getProductSVG(product.svgType)}</div>
          <div class="product-meta"><span>${product.category}</span></div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-footer">
            <div class="product-price">₹${product.price}</div>
            <button class="btn-card-add" data-id="${product.id}">Add to Cart</button>
          </div>
        `;
        productsGrid.appendChild(card);
      });
      bindProductActions();
      showToast("Displaying Wishlisted Items", "info");
    });
  }

  // --- CART DRAWER ENGINES ---
  const updateBadges = () => {
    const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
    if (cartBadge) {
      cartBadge.innerText = totalItems;
      cartBadge.style.display = totalItems > 0 ? "flex" : "none";
    }
    if (wishlistBadge) {
      wishlistBadge.innerText = wishlist.length;
      wishlistBadge.style.display = wishlist.length > 0 ? "flex" : "none";
    }
  };

  const addToCart = (id, quantity = 1) => {
    const existing = cart.find(item => item.id === id);
    const product = window.productsData.find(p => p.id === id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id, quantity });
    }

    localStorage.setItem("sahil_dairy_cart", JSON.stringify(cart));
    updateBadges();
    renderCart();
    showToast(`Added ${quantity} x ${product.name} to Cart`, "success");
    
    // Auto-slide open cart to wow user
    toggleCartDrawer(true);
  };

  const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("sahil_dairy_cart", JSON.stringify(cart));
    updateBadges();
    renderCart();
    showToast("Item removed from Cart", "info");
  };

  const adjustQuantity = (id, change) => {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }

    localStorage.setItem("sahil_dairy_cart", JSON.stringify(cart));
    updateBadges();
    renderCart();
  };

  const renderCart = () => {
    if (!cartBody) return;
    cartBody.innerHTML = "";

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
          </svg>
          <h3>Your Basket is Empty</h3>
          <p>Explore Sahil's Dairy products to stock up on fresh dairy goodness.</p>
        </div>
      `;
      updateBillSummary(0);
      return;
    }

    let subtotal = 0;

    cart.forEach(item => {
      const product = window.productsData.find(p => p.id === item.id);
      if (!product) return;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      const cartItemDiv = document.createElement("div");
      cartItemDiv.className = "cart-item";
      cartItemDiv.innerHTML = `
        <div class="cart-item-visual">
          ${getProductSVG(product.svgType)}
        </div>
        <div class="cart-item-details">
          <div class="cart-item-title">${product.name}</div>
          <div class="cart-item-meta">${product.volume} • ₹${product.price} each</div>
          <div class="cart-item-pricing">
            <div class="qty-selector">
              <button class="qty-btn btn-cart-dec" data-id="${product.id}">-</button>
              <div class="qty-val">${item.quantity}</div>
              <button class="qty-btn btn-cart-inc" data-id="${product.id}">+</button>
            </div>
            <div class="cart-item-price">₹${itemTotal}</div>
          </div>
        </div>
        <button class="btn-remove-item" data-id="${product.id}" aria-label="Remove item">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      `;

      cartBody.appendChild(cartItemDiv);
    });

    // Rebind action listeners to cart items
    document.querySelectorAll(".btn-cart-dec").forEach(btn => {
      btn.addEventListener("click", () => adjustQuantity(btn.dataset.id, -1));
    });
    document.querySelectorAll(".btn-cart-inc").forEach(btn => {
      btn.addEventListener("click", () => adjustQuantity(btn.dataset.id, 1));
    });
    document.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
    });

    updateBillSummary(subtotal);
  };

  const updateBillSummary = (subtotal) => {
    const subtotalEl = document.getElementById("bill-subtotal");
    const gstEl = document.getElementById("bill-gst");
    const deliveryEl = document.getElementById("bill-delivery");
    const discountEl = document.getElementById("bill-discount");
    const totalEl = document.getElementById("bill-total");

    if (!subtotalEl) return;

    let discount = 0;
    if (activeCoupon) {
      discount = Math.round(subtotal * (activeCoupon.discountPercent / 100));
    }

    const gst = Math.round((subtotal - discount) * 0.05); // 5% GST on Dairy
    let delivery = subtotal > 0 ? 30 : 0;
    if (subtotal > 200) {
      delivery = 0; // Free delivery above 200
    }

    const grandTotal = subtotal - discount + gst + delivery;

    subtotalEl.innerText = `₹${subtotal}`;
    gstEl.innerText = `₹${gst}`;
    deliveryEl.innerText = delivery === 0 ? "FREE" : `₹${delivery}`;
    discountEl.innerText = discount > 0 ? `-₹${discount}` : `₹0`;
    totalEl.innerText = `₹${grandTotal}`;

    // Active promo tags
    const promoMsgEl = document.getElementById("coupon-msg");
    if (activeCoupon && promoMsgEl) {
      promoMsgEl.className = "coupon-message coupon-success";
      promoMsgEl.innerText = `Promo Applied: ${activeCoupon.description}`;
    }
  };

  // Promo Code submission handler
  const couponSubmit = document.getElementById("btn-apply-coupon");
  const couponInput = document.getElementById("coupon-code-input");
  const couponMsg = document.getElementById("coupon-msg");

  if (couponSubmit) {
    couponSubmit.addEventListener("click", () => {
      const code = couponInput.value.trim().toUpperCase();
      if (!code) {
        showToast("Please enter a coupon code", "warning");
        return;
      }

      if (COUPONS[code]) {
        activeCoupon = COUPONS[code];
        couponMsg.className = "coupon-message coupon-success";
        couponMsg.innerText = `Success! ${activeCoupon.description}`;
        showToast(`Promo Applied: ${code}`, "success");
        renderCart();
      } else {
        couponMsg.className = "coupon-message coupon-error";
        couponMsg.innerText = "Invalid Coupon Code";
        showToast("Invalid Promo Code entered", "danger");
      }
    });
  }

  // --- CART DRAWER VISIBILITY TOGGLE ---
  const toggleCartDrawer = (open) => {
    if (!cartDrawer) return;
    if (open) {
      cartDrawer.classList.add("active");
    } else {
      cartDrawer.classList.remove("active");
    }
  };

  document.getElementById("btn-cart").addEventListener("click", () => toggleCartDrawer(true));
  document.getElementById("btn-cart-close").addEventListener("click", () => toggleCartDrawer(false));

  // --- QUICK VIEW MODAL ENGINE ---
  const showQuickView = (id) => {
    const product = window.productsData.find(p => p.id === id);
    if (!product) return;

    const modalVisual = quickViewModal.querySelector(".modal-main-image");
    const modalTitle = quickViewModal.querySelector(".modal-title");
    const modalPrice = quickViewModal.querySelector(".modal-price");
    const modalVolume = quickViewModal.querySelector(".modal-volume");
    const modalDesc = quickViewModal.querySelector(".modal-desc");
    const modalIngredients = quickViewModal.querySelector("#modal-ingredients");
    const modalShelf = quickViewModal.querySelector("#modal-shelf");
    const modalStorage = quickViewModal.querySelector("#modal-storage");
    const tabNutrition = quickViewModal.querySelector("#tab-nutrition");

    modalVisual.innerHTML = getProductSVG(product.svgType);
    modalTitle.innerText = product.name;
    modalPrice.innerText = `₹${product.price}`;
    modalVolume.innerText = `/ ${product.volume}`;
    modalDesc.innerText = product.description;

    // Detailed Tabs data loading
    modalIngredients.innerText = product.ingredients;
    modalShelf.innerText = product.shelfLife;
    modalStorage.innerText = product.storage;

    // Nutrition values
    tabNutrition.innerHTML = `
      <div class="nutrition-grid">
        <div class="nutrition-item">
          <div class="nutrition-val">${product.nutrition.Energy}</div>
          <div class="nutrition-lbl">Energy</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-val">${product.nutrition.Protein}</div>
          <div class="nutrition-lbl">Protein</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-val">${product.nutrition.Fats}</div>
          <div class="nutrition-lbl">Fats</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-val">${product.nutrition.Calcium}</div>
          <div class="nutrition-lbl">Calcium</div>
        </div>
        <div class="nutrition-item">
          <div class="nutrition-val">${product.nutrition.Carbohydrates}</div>
          <div class="nutrition-lbl">Carbs</div>
        </div>
      </div>
    `;

    // Dynamic Add button link inside modal
    const modalAddBtn = quickViewModal.querySelector(".btn-modal-add");
    const modalQtyVal = quickViewModal.querySelector(".qty-val");
    let currentModalQty = 1;
    modalQtyVal.innerText = currentModalQty;

    // Remove old listeners
    const newAddBtn = modalAddBtn.cloneNode(true);
    modalAddBtn.parentNode.replaceChild(newAddBtn, modalAddBtn);

    newAddBtn.addEventListener("click", () => {
      addToCart(product.id, currentModalQty);
      closeModal();
    });

    const modalQtyMinus = quickViewModal.querySelector(".qty-minus");
    const modalQtyPlus = quickViewModal.querySelector(".qty-plus");

    const newMinus = modalQtyMinus.cloneNode(true);
    modalQtyMinus.parentNode.replaceChild(newMinus, modalQtyMinus);
    newMinus.addEventListener("click", () => {
      if (currentModalQty > 1) {
        currentModalQty--;
        modalQtyVal.innerText = currentModalQty;
      }
    });

    const newPlus = modalQtyPlus.cloneNode(true);
    modalQtyPlus.parentNode.replaceChild(newPlus, modalQtyPlus);
    newPlus.addEventListener("click", () => {
      currentModalQty++;
      modalQtyVal.innerText = currentModalQty;
    });

    quickViewModal.classList.add("active");
  };

  const closeModal = () => {
    quickViewModal.classList.remove("active");
    document.getElementById("checkout-modal").classList.remove("active");
  };

  document.querySelectorAll(".btn-modal-close").forEach(btn => {
    btn.addEventListener("click", closeModal);
  });

  // Modal Tabs Switch Logic
  document.querySelectorAll(".modal-tab-btn").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      const paneId = tabBtn.dataset.tab;
      const modalInfo = tabBtn.closest(".modal-info-panel");
      
      modalInfo.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.remove("active"));
      modalInfo.querySelectorAll(".modal-tab-pane").forEach(p => p.classList.remove("active"));

      tabBtn.classList.add("active");
      modalInfo.querySelector(`#tab-${paneId}`).classList.add("active");
    });
  });

  // --- DAIRY SUBSCRIPTION BUILDER MODULE ---
  const subProductSelect = document.getElementById("sub-product-select");
  const subFreqBtns = document.querySelectorAll(".sub-freq-btn");
  const subTimeSelect = document.getElementById("sub-time-select");
  const subDateInput = document.getElementById("sub-start-date");
  const subQtyVal = document.getElementById("sub-qty-val");
  const btnSubSubmit = document.getElementById("btn-subscribe");

  let activeSubFreq = "daily";
  let activeSubQty = 1;

  // Populate products in subscription dropdown
  if (subProductSelect) {
    subProductSelect.innerHTML = "";
    // Only subscribe-friendly items (Milk, Curd, Chaas)
    const subFriendly = window.productsData.filter(p => ["Milk", "Curd", "Buttermilk"].includes(p.category));
    subFriendly.forEach(product => {
      subProductSelect.innerHTML += `<option value="${product.id}">${product.name} (${product.volume}) - ₹${product.price}</option>`;
    });

    subProductSelect.addEventListener("change", () => updateSubscriptionPreview());
  }

  // Frequency Buttons
  subFreqBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subFreqBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeSubFreq = btn.dataset.freq;
      updateSubscriptionPreview();
    });
  });

  // Quantity controls
  const subMinus = document.getElementById("sub-qty-minus");
  const subPlus = document.getElementById("sub-qty-plus");

  if (subMinus && subPlus) {
    subMinus.addEventListener("click", () => {
      if (activeSubQty > 1) {
        activeSubQty--;
        subQtyVal.innerText = activeSubQty;
        updateSubscriptionPreview();
      }
    });
    subPlus.addEventListener("click", () => {
      activeSubQty++;
      subQtyVal.innerText = activeSubQty;
      updateSubscriptionPreview();
    });
  }

  const updateSubscriptionPreview = () => {
    const selectedId = subProductSelect.value;
    const product = window.productsData.find(p => p.id === selectedId);
    if (!product) return;

    const previewProduct = document.getElementById("sub-preview-product");
    const previewFreq = document.getElementById("sub-preview-freq");
    const previewDailyPrice = document.getElementById("sub-preview-daily-price");
    const previewEstimates = document.getElementById("sub-preview-estimates");

    previewProduct.innerText = `${product.name} (x${activeSubQty})`;
    previewFreq.innerText = activeSubFreq.charAt(0).toUpperCase() + activeSubFreq.slice(1);
    
    const dailyCost = product.price * activeSubQty;
    previewDailyPrice.innerText = `₹${dailyCost}`;

    // Monthly Plan Cost Estimates
    let activeDaysPerMonth = 30; // daily
    if (activeSubFreq === "alternate") {
      activeDaysPerMonth = 15;
    } else if (activeSubFreq === "weekly") {
      activeDaysPerMonth = 4;
    }

    const totalEstimate = dailyCost * activeDaysPerMonth;
    previewEstimates.innerText = `₹${totalEstimate}`;
  };

  if (btnSubSubmit) {
    btnSubSubmit.addEventListener("click", () => {
      const selectedId = subProductSelect.value;
      const product = window.productsData.find(p => p.id === selectedId);
      const date = subDateInput.value;

      if (!date) {
        showToast("Please select a subscription start date", "warning");
        return;
      }

      const subscriptionPayload = {
        productId: selectedId,
        productName: product ? product.name : selectedId,
        frequency: activeSubFreq,
        quantity: activeSubQty,
        timeSlot: subTimeSelect.value,
        startDate: date
      };

      const originalText = btnSubSubmit.innerText;
      btnSubSubmit.disabled = true;
      btnSubSubmit.innerText = "Activating Plan...";

      fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(subscriptionPayload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(() => {
        const loyaltyEarned = 50;
        
        if (currentUser) {
          currentUser.loyaltyPoints += loyaltyEarned;
          localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
          updateAuthUI();
        } else {
          loyaltyPoints += loyaltyEarned;
          localStorage.setItem("sahil_dairy_points", loyaltyPoints);
          updateMembershipDashboard();
        }

        showToast(`Subscription activated successfully for ${product.name}!`, "success");
        alert(`🎉 Sahil's Dairy Club Subscription Active!\n\nProduct: ${product.name}\nQuantity: ${activeSubQty} units\nFrequency: ${activeSubFreq}\nStart Date: ${date}\nLoyalty Reward Points Awarded: +50 Points`);
      })
      .catch(err => {
        console.warn("Failed to activate subscription via API, using fallback:", err);
        const loyaltyEarned = 50;

        // Offline storage sync
        const offlineSub = {
          ...subscriptionPayload,
          userEmail: currentUser ? currentUser.email : "",
          createdAt: new Date().toISOString()
        };
        memoryDb.subscriptions.push(offlineSub);

        if (currentUser) {
          currentUser.loyaltyPoints += loyaltyEarned;
          if (authToken === "offline_session_token_key") {
            saveOfflineUser(currentUser);
          }
          localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
          updateAuthUI();
        } else {
          loyaltyPoints += loyaltyEarned;
          localStorage.setItem("sahil_dairy_points", loyaltyPoints);
          updateMembershipDashboard();
        }

        showToast(`Subscription activated (Offline) for ${product.name}!`, "success");
        alert(`🎉 Sahil's Dairy Club Subscription Active (Offline Mode)!\n\nProduct: ${product.name}\nQuantity: ${activeSubQty} units\nFrequency: ${activeSubFreq}\nStart Date: ${date}\nLoyalty Reward Points Awarded: +50 Points`);
      })
      .finally(() => {
        btnSubSubmit.disabled = false;
        btnSubSubmit.innerText = originalText;
      });
    });
  }

  // --- CHECKOUT & BILLING SYSTEM ---
  const btnCheckoutTrigger = document.getElementById("btn-checkout");
  const checkoutModal = document.getElementById("checkout-modal");
  const orderConfirmBtn = document.getElementById("btn-place-order");
  const couponDiscountRow = document.getElementById("checkout-coupon-row");

  if (btnCheckoutTrigger) {
    btnCheckoutTrigger.addEventListener("click", () => {
      if (cart.length === 0) {
        showToast("Your cart is empty!", "warning");
        return;
      }
      
      // Load billing estimates to checkout modal
      let subtotal = 0;
      cart.forEach(item => {
        const product = window.productsData.find(p => p.id === item.id);
        if (product) subtotal += product.price * item.quantity;
      });

      let discount = 0;
      if (activeCoupon) {
        discount = Math.round(subtotal * (activeCoupon.discountPercent / 100));
        document.getElementById("checkout-discount").innerText = `-₹${discount}`;
        couponDiscountRow.style.display = "flex";
      } else {
        couponDiscountRow.style.display = "none";
      }

      const gst = Math.round((subtotal - discount) * 0.05);
      let delivery = subtotal > 200 ? 0 : 30;
      const total = subtotal - discount + gst + delivery;

      document.getElementById("checkout-subtotal").innerText = `₹${subtotal}`;
      document.getElementById("checkout-gst").innerText = `₹${gst}`;
      document.getElementById("checkout-delivery").innerText = delivery === 0 ? "FREE" : `₹${delivery}`;
      document.getElementById("checkout-total").innerText = `₹${total}`;

      // Open checkout modal
      toggleCartDrawer(false);
      checkoutModal.classList.add("active");
    });
  }

  if (orderConfirmBtn) {
    orderConfirmBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const name = document.getElementById("checkout-name").value.trim();
      const phone = document.getElementById("checkout-phone").value.trim();
      const address = document.getElementById("checkout-address").value.trim();
      const timeSlot = document.getElementById("checkout-timeslot").value;

      if (!name || !phone || !address) {
        showToast("Please fill in all required customer details", "warning");
        return;
      }

      // Prepare Order Payload
      const orderPayload = {
        customer: { name, phone, address },
        items: cart.map(item => {
          const product = window.productsData.find(p => p.id === item.id);
          return {
            productId: item.id,
            name: product ? product.name : item.id,
            price: product ? product.price : 0,
            quantity: item.quantity
          };
        }),
        pricing: {
          subtotal: parseInt(document.getElementById("checkout-subtotal").innerText.replace("₹", "")),
          discount: document.getElementById("checkout-discount") ? parseInt(document.getElementById("checkout-discount").innerText.replace("-₹", "").replace("₹", "")) || 0 : 0,
          gst: parseInt(document.getElementById("checkout-gst").innerText.replace("₹", "")),
          delivery: document.getElementById("checkout-delivery").innerText === "FREE" ? 0 : parseInt(document.getElementById("checkout-delivery").innerText.replace("₹", "")),
          total: parseInt(document.getElementById("checkout-total").innerText.replace("₹", ""))
        },
        timeSlot,
        paymentMethod: document.getElementById("checkout-payment").value
      };

      const originalText = orderConfirmBtn.innerText;
      orderConfirmBtn.disabled = true;
      orderConfirmBtn.innerText = "Placing Order...";

      fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(orderPayload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(orderData => {
        const newOrderId = orderData.id;
        
        // Clear Cart
        cart = [];
        localStorage.setItem("sahil_dairy_cart", JSON.stringify(cart));
        updateBadges();
        renderCart();

        // Award membership points
        const loyaltyEarned = 20;
        if (currentUser) {
          currentUser.loyaltyPoints += loyaltyEarned;
          localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
          updateAuthUI();
        } else {
          loyaltyPoints += loyaltyEarned;
          localStorage.setItem("sahil_dairy_points", loyaltyPoints);
          updateMembershipDashboard();
        }

        closeModal();
        showToast(`Order Placed successfully! Order ID: ${newOrderId}`, "success");
        
        alert(`🎉 Sahil's Dairy Order Placed Successfully!\n\nOrder ID: ${newOrderId}\nDelivery Time: Tomorrow, ${timeSlot}\nPayment Mode: Cash on Delivery / Selected Gateway\nLoyalty Points Earned: 20 Points!\n\nYou can track this order in the Order Tracking Section using: ${newOrderId}`);

        // Auto fill tracker to demonstrate features
        const trackerInput = document.getElementById("tracking-id-input");
        if (trackerInput) {
          trackerInput.value = newOrderId;
          TRACKING_DB[newOrderId] = { status: "Ordered", progress: 0, step: 1 };
        }
      })
      .catch(err => {
        console.warn("Failed to place order via API, using offline fallback:", err);
        const newOrderId = `SAHIL-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Clear Cart
        cart = [];
        localStorage.setItem("sahil_dairy_cart", JSON.stringify(cart));
        updateBadges();
        renderCart();

        // Save order offline locally
        const offlineOrder = {
          ...orderPayload,
          id: newOrderId,
          userEmail: currentUser ? currentUser.email : "",
          status: "Ordered",
          progress: 0,
          step: 1,
          createdAt: new Date().toISOString()
        };
        memoryDb.orders[newOrderId] = offlineOrder;

        // Award membership points
        const loyaltyEarned = 20;
        if (currentUser) {
          currentUser.loyaltyPoints += loyaltyEarned;
          if (authToken === "offline_session_token_key") {
            saveOfflineUser(currentUser);
          }
          localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
          updateAuthUI();
        } else {
          loyaltyPoints += loyaltyEarned;
          localStorage.setItem("sahil_dairy_points", loyaltyPoints);
          updateMembershipDashboard();
        }

        closeModal();
        showToast(`Order Placed (Offline)! Order ID: ${newOrderId}`, "success");
        
        alert(`🎉 Sahil's Dairy Order Placed (Offline Mode)!\n\nOrder ID: ${newOrderId}\nDelivery Time: Tomorrow, ${timeSlot}\nLoyalty Points Earned: 20 Points!\n\nYou can track this order using: ${newOrderId}`);

        const trackerInput = document.getElementById("tracking-id-input");
        if (trackerInput) {
          trackerInput.value = newOrderId;
          TRACKING_DB[newOrderId] = { status: "Ordered", progress: 0, step: 1 };
        }
      })
      .finally(() => {
        orderConfirmBtn.disabled = false;
        orderConfirmBtn.innerText = originalText;
      });
    });
  }

  // --- ORDER TRACKING ENGINE ---
  const btnTrack = document.getElementById("btn-track-order");
  const trackInput = document.getElementById("tracking-id-input");
  const trackerVisualContainer = document.getElementById("tracker-visual-container");

  if (btnTrack && trackInput) {
    btnTrack.addEventListener("click", () => {
      const orderId = trackInput.value.trim().toUpperCase();
      if (!orderId) {
        showToast("Please enter an Order ID", "warning");
        return;
      }

      const steps = document.querySelectorAll(".step");
      const progressLine = document.querySelector(".stepper-progress");

      btnTrack.disabled = true;
      const originalText = btnTrack.innerText;
      btnTrack.innerText = "Tracking...";

      fetch(`/api/orders/${orderId}`)
      .then(res => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then(order => {
        steps.forEach((step, idx) => {
          step.classList.remove("active", "completed");
          const stepNum = idx + 1;
          if (stepNum < order.step) {
            step.classList.add("completed");
          } else if (stepNum === order.step) {
            step.classList.add("active");
          }
        });

        let progressWidth = "0%";
        if (order.step === 2) progressWidth = "33%";
        if (order.step === 3) progressWidth = "66%";
        if (order.step === 4) progressWidth = "100%";
        progressLine.style.width = progressWidth;

        document.getElementById("tracker-status-text").innerHTML = `Current Status: <strong>${order.status}</strong>`;
        trackerVisualContainer.style.display = "block";
        showToast("Order status loaded dynamically!", "success");
      })
      .catch(err => {
        console.warn("Could not track order via API, using local offline fallback:", err);
        const order = TRACKING_DB[orderId];
        if (!order) {
          showToast("Order ID not found. Try: SAHIL-101, SAHIL-102", "danger");
          trackerVisualContainer.style.display = "none";
          return;
        }

        steps.forEach((step, idx) => {
          step.classList.remove("active", "completed");
          const stepNum = idx + 1;
          if (stepNum < order.step) {
            step.classList.add("completed");
          } else if (stepNum === order.step) {
            step.classList.add("active");
          }
        });

        let progressWidth = "0%";
        if (order.step === 2) progressWidth = "33%";
        if (order.step === 3) progressWidth = "66%";
        if (order.step === 4) progressWidth = "100%";
        progressLine.style.width = progressWidth;

        document.getElementById("tracker-status-text").innerHTML = `Current Status: <strong>${order.status}</strong> (Offline)`;
        trackerVisualContainer.style.display = "block";
        showToast("Order status loaded from offline storage", "info");
      })
      .finally(() => {
        btnTrack.disabled = false;
        btnTrack.innerText = originalText;
      });
    });
  }

  // --- INTERACTIVE STORE LOCATOR ---
  const locatorSearchInput = document.getElementById("locator-search");
  const locatorSearchBtn = document.getElementById("btn-search-booth");
  const boothListContainer = document.getElementById("booth-cards-container");
  const mapContainer = document.getElementById("map-pins-container");

  const renderLocatorBooths = (filter = "") => {
    if (!boothListContainer) return;
    boothListContainer.innerHTML = "";
    
    // Filter booths
    const filtered = boothsList.filter(b => 
      b.name.toLowerCase().includes(filter.toLowerCase()) || 
      b.pincode.includes(filter)
    );

    if (filtered.length === 0) {
      boothListContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">No dairy booths found.</p>`;
      return;
    }

    // Render cards
    filtered.forEach(booth => {
      const card = document.createElement("div");
      card.className = "booth-card glassmorphism";
      card.dataset.id = booth.id;
      card.innerHTML = `
        <span class="booth-tag">Sahil's Booth</span>
        <h4 style="margin-bottom: 5px; color: var(--text-dark);">${booth.name}</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${booth.address}</p>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: var(--primary);">
          <span>Pincode: ${booth.pincode}</span>
          <span>Distance: ${booth.distance}</span>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;">Timings: ${booth.timings}</p>
      `;

      card.addEventListener("click", () => {
        document.querySelectorAll(".booth-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        highlightMapPin(booth.id);
      });

      boothListContainer.appendChild(card);
    });

    // Render interactive SVG map pins
    renderMapPins(filtered);
  };

  const renderMapPins = (booths) => {
    if (!mapContainer) return;
    mapContainer.innerHTML = "";

    booths.forEach(booth => {
      const pin = document.createElement("div");
      pin.className = "map-pin";
      pin.dataset.id = booth.id;
      pin.style.left = `${booth.x}%`;
      pin.style.top = `${booth.y}%`;
      pin.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--primary)">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      // Event listener: pin triggers list highlights
      pin.addEventListener("click", () => {
        highlightMapPin(booth.id);
        const card = boothListContainer.querySelector(`.booth-card[data-id="${booth.id}"]`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
          document.querySelectorAll(".booth-card").forEach(c => c.classList.remove("active"));
          card.classList.add("active");
        }
      });

      mapContainer.appendChild(pin);
    });
  };

  const highlightMapPin = (id) => {
    document.querySelectorAll(".map-pin").forEach(p => {
      const svg = p.querySelector("svg");
      if (parseInt(p.dataset.id) === id) {
        p.classList.add("active");
        svg.style.fill = "var(--secondary)"; // Change color on highlight
      } else {
        p.classList.remove("active");
        svg.style.fill = "var(--primary)";
      }
    });
  };

  if (locatorSearchBtn) {
    locatorSearchBtn.addEventListener("click", () => {
      renderLocatorBooths(locatorSearchInput.value.trim());
    });
  }

  // --- FRANCHISE FORM HANDLER ---
  const franchiseForm = document.getElementById("franchise-form");
  if (franchiseForm) {
    franchiseForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("fran-name").value.trim();
      const email = document.getElementById("fran-email").value.trim();
      const phone = document.getElementById("fran-phone").value.trim();
      const city = document.getElementById("fran-city").value.trim();
      const space = document.getElementById("fran-space").value.trim();

      if (!name || !email || !phone || !city || !space) {
        showToast("Please fill all franchise application fields", "warning");
        return;
      }

      const franchisePayload = { name, email, phone, city, space };

      const submitBtn = franchiseForm.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.innerText : "Submit";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting Proposal...";
      }

      fetch('/api/franchises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(franchisePayload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(() => {
        showToast("Franchise Enquiry Submitted Successfully!", "success");
        alert(`🎉 Franchise Enquiry Submitted!\n\nThank you, ${name}. Our Corporate Business Development Manager will contact you at ${email} or ${phone} within 48 hours to discuss franchise opportunities in ${city}.`);
        franchiseForm.reset();
      })
      .catch(err => {
        console.warn("Failed to submit franchise proposal via API, using fallback:", err);
        showToast("Franchise Enquiry Submitted (Offline)!", "success");
        alert(`🎉 Franchise Enquiry Submitted (Offline Mode)!\n\nThank you, ${name}. Our Corporate Business Development Manager will contact you at ${email} or ${phone} within 48 hours to discuss franchise opportunities in ${city}.`);
        franchiseForm.reset();
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      });
    });
  }

  // --- MEMBERSHIP PROGRAM ---
  const updateMembershipDashboard = () => {
    const pointsEl = document.getElementById("loyalty-points-val");
    if (pointsEl) {
      pointsEl.innerText = loyaltyPoints;
    }
  };

  const copyRefBtn = document.getElementById("btn-copy-ref");
  if (copyRefBtn) {
    copyRefBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("referral-code-input");
      if (codeInput) {
        codeInput.select();
        navigator.clipboard.writeText(codeInput.value);
        showToast("Referral Code copied to Clipboard!", "success");
      }
    });
  }

  // --- THEME / DARK MODE MANAGER ---
  const handleThemeInit = () => {
    const storedTheme = localStorage.getItem("sahil_dairy_theme");
    if (storedTheme === "dark") {
      document.body.classList.add("dark");
      if (themeToggle) themeToggle.innerHTML = "☀️"; // Sun icon in dark mode
    } else {
      document.body.classList.remove("dark");
      if (themeToggle) themeToggle.innerHTML = "🌙"; // Moon icon in light mode
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      localStorage.setItem("sahil_dairy_theme", isDark ? "dark" : "light");
      themeToggle.innerHTML = isDark ? "☀️" : "🌙";
      showToast(`${isDark ? 'Dark Mode' : 'Light Mode'} Activated`, "info");
    });
  }

  // --- INTERACTIVE TOAST NOTIFICATIONS ---
  const showToast = (message, type = "info") => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // Choose icon based on type
    let icon = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.085l-.04.04m-2.138 1.576a3 3 0 114.276 4.276L11.25 15.75m-6-6h13.5"/></svg>
    `;
    if (type === "success") {
      icon = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      `;
    } else if (type === "danger") {
      icon = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"/></svg>
      `;
    } else if (type === "warning") {
      icon = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
      `;
    }

    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Slide in
    setTimeout(() => toast.classList.add("show"), 50);

    // Slide out and remove
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

  // --- OFFLINE DATABASE FALLBACK ENGINE ---
  const getOfflineUsers = () => JSON.parse(localStorage.getItem("sahil_dairy_users")) || {};
  const saveOfflineUser = (user) => {
    const users = getOfflineUsers();
    users[user.email.toLowerCase().trim()] = user;
    localStorage.setItem("sahil_dairy_users", JSON.stringify(users));
  };

  // --- AUTHENTICATION & SESSION ENGINE ---
  const showAuthModal = (show) => {
    const authModal = document.getElementById("auth-modal");
    if (!authModal) return;
    if (show) {
      authModal.classList.add("active");
    } else {
      authModal.classList.remove("active");
      document.getElementById("login-form").reset();
      document.getElementById("signup-form").reset();
      switchAuthTab("login");
    }
  };

  const switchAuthTab = (tab) => {
    const loginBtn = document.getElementById("tab-login-btn");
    const signupBtn = document.getElementById("tab-signup-btn");
    const loginPane = document.getElementById("form-login-pane");
    const signupPane = document.getElementById("form-signup-pane");
    
    if (!loginBtn || !signupBtn || !loginPane || !signupPane) return;
    
    if (tab === "login") {
      loginBtn.classList.add("active");
      loginBtn.style.color = "var(--text-dark)";
      loginBtn.style.borderBottom = "3px solid var(--primary)";
      signupBtn.classList.remove("active");
      signupBtn.style.color = "var(--text-muted)";
      signupBtn.style.borderBottom = "3px solid transparent";
      
      loginPane.style.display = "block";
      signupPane.style.display = "none";
    } else {
      signupBtn.classList.add("active");
      signupBtn.style.color = "var(--text-dark)";
      signupBtn.style.borderBottom = "3px solid var(--primary)";
      loginBtn.classList.remove("active");
      loginBtn.style.color = "var(--text-muted)";
      loginBtn.style.borderBottom = "3px solid transparent";
      
      signupPane.style.display = "block";
      loginPane.style.display = "none";
    }
  };

  const updateAuthUI = () => {
    const showAuthBtn = document.getElementById("btn-show-auth");
    const userProfileMenu = document.getElementById("user-profile-menu");
    const userAvatarBtn = document.getElementById("btn-user-avatar");
    const dropdownName = document.getElementById("dropdown-user-name");
    const dropdownEmail = document.getElementById("dropdown-user-email");
    
    // Auto-fill checkout fields if logged in
    const checkoutName = document.getElementById("checkout-name");
    const checkoutPhone = document.getElementById("checkout-phone");
    const checkoutAddress = document.getElementById("checkout-address");
    
    if (!showAuthBtn || !userProfileMenu) return;
    
    if (currentUser) {
      showAuthBtn.style.display = "none";
      userProfileMenu.style.display = "block";
      
      const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      if (userAvatarBtn) userAvatarBtn.innerText = initials;
      if (dropdownName) dropdownName.innerText = currentUser.name;
      if (dropdownEmail) dropdownEmail.innerText = currentUser.email;
      
      // Auto pre-fill checkout fields
      if (checkoutName && !checkoutName.value) checkoutName.value = currentUser.name;
      if (checkoutPhone && !checkoutPhone.value) checkoutPhone.value = currentUser.phone || "";
      if (checkoutAddress && !checkoutAddress.value) checkoutAddress.value = currentUser.address || "";
      
      // Update local loyalty points value
      loyaltyPoints = currentUser.loyaltyPoints;
      localStorage.setItem("sahil_dairy_points", loyaltyPoints);
    } else {
      showAuthBtn.style.display = "block";
      userProfileMenu.style.display = "none";
    }
    
    updateMembershipDashboard();
  };

  const handleSignup = async (name, email, password, phone, address) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }
      
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem("sahil_dairy_token", authToken);
      localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
      
      showToast("Account registered successfully! Welcome to the club.", "success");
      showAuthModal(false);
      updateAuthUI();
    } catch (err) {
      console.warn("Backend registration offline or failed. Falling back to local storage database:", err);
      // Offline fallback
      const offlineUsers = getOfflineUsers();
      if (offlineUsers[email.toLowerCase().trim()]) {
        showToast("Email already registered (Offline database)", "danger");
        return;
      }
      
      const mockId = `OFFLINE-USR-${Math.floor(1000 + Math.random() * 9000)}`;
      const newUser = {
        id: mockId,
        name,
        email: email.toLowerCase().trim(),
        password, 
        phone: phone || "",
        address: address || "",
        loyaltyPoints: 150
      };
      
      saveOfflineUser(newUser);
      
      authToken = "offline_session_token_key";
      currentUser = newUser;
      localStorage.setItem("sahil_dairy_token", authToken);
      localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
      
      showToast("Account registered (Offline Mode). Welcome to the club!", "success");
      showAuthModal(false);
      updateAuthUI();
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }
      
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem("sahil_dairy_token", authToken);
      localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
      
      showToast(`Welcome back, ${currentUser.name}!`, "success");
      showAuthModal(false);
      updateAuthUI();
    } catch (err) {
      console.warn("Backend login offline or failed. Checking local fallback:", err);
      
      const offlineUsers = getOfflineUsers();
      const user = offlineUsers[email.toLowerCase().trim()];
      if (user && user.password === password) {
        authToken = "offline_session_token_key";
        currentUser = user;
        localStorage.setItem("sahil_dairy_token", authToken);
        localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
        
        showToast(`Welcome back, ${currentUser.name} (Offline Mode)!`, "success");
        showAuthModal(false);
        updateAuthUI();
      } else {
        showToast(err.message || "Invalid credentials", "danger");
      }
    }
  };

  const handleLogout = () => {
    authToken = null;
    currentUser = null;
    localStorage.removeItem("sahil_dairy_token");
    localStorage.removeItem("sahil_dairy_current_user");
    
    // Clear checkout auto-fills
    const checkoutName = document.getElementById("checkout-name");
    const checkoutPhone = document.getElementById("checkout-phone");
    const checkoutAddress = document.getElementById("checkout-address");
    if (checkoutName) checkoutName.value = "";
    if (checkoutPhone) checkoutPhone.value = "";
    if (checkoutAddress) checkoutAddress.value = "";
    
    showToast("Signed out successfully. See you again!", "info");
    updateAuthUI();
    showDashboardModal(false);
  };

  const handleUpdateProfile = async (name, phone, address) => {
    try {
      if (authToken === "offline_session_token_key") {
        throw new Error("Offline mode");
      }
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ name, phone, address })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      
      currentUser = data.user;
      localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
      showToast("Profile details updated successfully!", "success");
      updateAuthUI();
    } catch (err) {
      console.warn("Backend profile update offline. Syncing locally:", err);
      if (currentUser) {
        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.address = address;
        
        if (authToken === "offline_session_token_key") {
          saveOfflineUser(currentUser);
        }
        
        localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
        showToast("Profile details updated locally!", "success");
        updateAuthUI();
      }
    }
  };

  const syncActiveSession = async () => {
    if (!authToken || authToken === "offline_session_token_key") {
      updateAuthUI();
      return;
    }
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        currentUser = data;
        localStorage.setItem("sahil_dairy_current_user", JSON.stringify(currentUser));
      }
    } catch (err) {
      console.warn("Failed to auto-refresh session from server on startup.");
    } finally {
      updateAuthUI();
    }
  };

  // --- USER DASHBOARD MODAL ENGINE ---
  const showDashboardModal = (show) => {
    const modal = document.getElementById("dashboard-modal");
    if (!modal) return;
    if (show) {
      if (!currentUser) {
        showToast("Please sign in to access the club dashboard.", "warning");
        showAuthModal(true);
        return;
      }
      renderDashboardOverview();
      renderDashboardOrders();
      renderDashboardSubscriptions();
      populateDashboardProfileForm();
      
      modal.classList.add("active");
    } else {
      modal.classList.remove("active");
    }
  };

  const switchDashboardTab = (tabName) => {
    document.querySelectorAll(".dash-nav-btn").forEach(btn => {
      btn.classList.remove("active");
      if (btn.dataset.tab === tabName) btn.classList.add("active");
    });
    
    document.querySelectorAll(".dash-pane").forEach(pane => {
      pane.classList.remove("active");
    });
    
    const targetPane = document.getElementById(`pane-${tabName}`);
    if (targetPane) targetPane.classList.add("active");
  };

  const populateDashboardProfileForm = () => {
    const nameInput = document.getElementById("dash-profile-name");
    const emailInput = document.getElementById("dash-profile-email");
    const phoneInput = document.getElementById("dash-profile-phone");
    const addressInput = document.getElementById("dash-profile-address");
    
    if (!currentUser) return;
    if (nameInput) nameInput.value = currentUser.name;
    if (emailInput) emailInput.value = currentUser.email;
    if (phoneInput) phoneInput.value = currentUser.phone || "";
    if (addressInput) addressInput.value = currentUser.address || "";
  };

  const renderDashboardOverview = async () => {
    const welcomeName = document.getElementById("dash-welcome-name");
    const avatarLbl = document.getElementById("dash-avatar-lbl");
    const loyaltyVal = document.getElementById("dash-loyalty-val");
    const orderCountLbl = document.getElementById("dash-order-count-lbl");
    const subCountLbl = document.getElementById("dash-sub-count-lbl");
    const loyaltyRing = document.getElementById("dash-loyalty-ring");
    
    if (!currentUser) return;
    if (welcomeName) welcomeName.innerText = currentUser.name;
    
    const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (avatarLbl) avatarLbl.innerText = initials;
    if (loyaltyVal) loyaltyVal.innerText = currentUser.loyaltyPoints;
    
    if (loyaltyRing) {
      const percentage = Math.min((currentUser.loyaltyPoints / 500) * 100, 100);
      const strokeDashoffset = 100 - percentage;
      loyaltyRing.setAttribute("stroke-dashoffset", strokeDashoffset);
    }
    
    try {
      let orders = [];
      let subs = [];
      if (authToken !== "offline_session_token_key") {
        const oRes = await fetch('/api/user/orders', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (oRes.ok) orders = await oRes.json();
        
        const sRes = await fetch('/api/user/subscriptions', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (sRes.ok) subs = await sRes.json();
      } else {
        orders = Object.values(memoryDb.orders).filter(o => o.userEmail === currentUser.email);
        subs = memoryDb.subscriptions.filter(s => s.userEmail === currentUser.email);
      }
      
      if (orderCountLbl) orderCountLbl.innerText = orders.length;
      if (subCountLbl) subCountLbl.innerText = subs.length;
    } catch (err) {
      if (orderCountLbl) orderCountLbl.innerText = "0";
      if (subCountLbl) subCountLbl.innerText = "0";
    }
  };

  const renderDashboardOrders = async () => {
    const container = document.getElementById("dash-orders-table-container");
    if (!container) return;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted);">
        Loading your purchase orders...
      </div>
    `;
    
    try {
      let orders = [];
      if (authToken !== "offline_session_token_key") {
        const res = await fetch('/api/user/orders', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) orders = await res.json();
      } else {
        orders = Object.values(memoryDb.orders).filter(o => o.userEmail === currentUser.email)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      if (orders.length === 0) {
        container.innerHTML = `
          <div style="padding: 30px; text-align: center; color: var(--text-muted); border: 1px dashed var(--card-border); border-radius: var(--radius-sm); background: var(--bg-white);">
            <span style="font-size: 2rem; display: block; margin-bottom: 10px;">📦</span>
            <h4>No E-Commerce Orders Found</h4>
            <p style="font-size: 0.8rem; margin-top: 5px;">Browse Sahil's Dairy Parlour items and place your first order!</p>
          </div>
        `;
        return;
      }
      
      let rowsHTML = "";
      orders.forEach(order => {
        let statusBadge = "ordered";
        if (order.status === "Packed & Ready" || order.status === "Packed") statusBadge = "packed";
        if (order.status === "Out for Delivery") statusBadge = "transit";
        if (order.status === "Delivered") statusBadge = "delivered";
        
        const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: 'numeric', month: 'short', year: 'numeric'
        });
        
        rowsHTML += `
          <tr>
            <td style="font-weight: 700; color: var(--primary);">${order.id}</td>
            <td>${formattedDate}</td>
            <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${order.items.map(item => `${item.name} (x${item.quantity})`).join(", ")}
            </td>
            <td style="font-weight: 700;">₹${order.pricing.total}</td>
            <td><span class="badge-status ${statusBadge}">${order.status}</span></td>
            <td>
              <button class="btn-dash-track" data-id="${order.id}">Track</button>
            </td>
          </tr>
        `;
      });
      
      container.innerHTML = `
        <div class="dash-table-wrapper" style="animation: fadeIn 0.4s ease;">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Purchased Items</th>
                <th>Total Bill</th>
                <th>Status</th>
                <th>Tracking</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      `;
      
      container.querySelectorAll(".btn-dash-track").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          showDashboardModal(false);
          const trackerInput = document.getElementById("tracking-id-input");
          if (trackerInput) {
            trackerInput.value = id;
            document.getElementById("btn-track-order").click();
            const trackingSec = document.getElementById("tracking");
            if (trackingSec) trackingSec.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
      
    } catch (err) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--danger); padding: 20px;">
          Failed to retrieve order history. Please try again.
        </div>
      `;
    }
  };

  const renderDashboardSubscriptions = async () => {
    const container = document.getElementById("dash-subs-list-container");
    if (!container) return;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted);">
        Loading active subscriptions...
      </div>
    `;
    
    try {
      let subs = [];
      if (authToken !== "offline_session_token_key") {
        const res = await fetch('/api/user/subscriptions', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) subs = await res.json();
      } else {
        subs = memoryDb.subscriptions.filter(s => s.userEmail === currentUser.email)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      if (subs.length === 0) {
        container.innerHTML = `
          <div style="padding: 30px; text-align: center; color: var(--text-muted); border: 1px dashed var(--card-border); border-radius: var(--radius-sm); background: var(--bg-white);">
            <span style="font-size: 2rem; display: block; margin-bottom: 10px;">📅</span>
            <h4>No Active Subscriptions</h4>
            <p style="font-size: 0.8rem; margin-top: 5px;">Build your recurring daily milk plan in the subscription builder!</p>
          </div>
        `;
        return;
      }
      
      let cardsHTML = "";
      subs.forEach((sub, idx) => {
        cardsHTML += `
          <div class="sub-dash-card" style="animation: fadeIn 0.4s ease;">
            <div class="sub-dash-details">
              <h4>${sub.productName}</h4>
              <p>Frequency: <strong>${sub.frequency.charAt(0).toUpperCase() + sub.frequency.slice(1)} Delivery</strong> • Quantity: <strong>${sub.quantity} unit(s)</strong></p>
              <p style="margin-top: 4px; font-size: 0.78rem;">Morning Schedule: <strong>${sub.timeSlot}</strong> • Starts: <strong>${sub.startDate}</strong></p>
            </div>
            <div class="sub-dash-actions">
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);" id="sub-toggle-lbl-${idx}">Active Plan</span>
              <label class="switch">
                <input type="checkbox" checked id="sub-toggle-cb-${idx}">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = cardsHTML;
      
      subs.forEach((sub, idx) => {
        const checkbox = document.getElementById(`sub-toggle-cb-${idx}`);
        const label = document.getElementById(`sub-toggle-lbl-${idx}`);
        if (checkbox && label) {
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              label.innerText = "Active Plan";
              label.style.color = "var(--text-muted)";
              showToast(`Subscription plan resumed successfully!`, "success");
            } else {
              label.innerText = "Plan Paused";
              label.style.color = "var(--danger)";
              showToast(`Subscription plan paused (Mock simulation)`, "warning");
            }
          });
        }
      });
      
    } catch (err) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--danger); padding: 20px;">
          Failed to retrieve subscriptions. Please try again.
        </div>
      `;
    }
  };

  // --- INITIALIZERS ---
  const init = () => {
    handleThemeInit();
    setupCategories();
    renderCatalog();
    renderCart();
    updateBadges();
    updateSubscriptionPreview();
    renderLocatorBooths();
    updateMembershipDashboard();

    // Scroll styling effect on Header
    window.addEventListener("scroll", () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }
    });

    // Global filters bind
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchFilter = e.target.value;
        renderCatalog();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        sortOption = e.target.value;
        renderCatalog();
      });
    }

    if (minPriceInput && maxPriceInput) {
      minPriceInput.addEventListener("input", renderCatalog);
      maxPriceInput.addEventListener("input", renderCatalog);
    }

    // --- AUTHENTICATION & DASHBOARD EVENT BINDINGS ---
    const showAuthBtn = document.getElementById("btn-show-auth");
    const authCloseBtn = document.getElementById("btn-auth-close");
    const loginTabBtn = document.getElementById("tab-login-btn");
    const signupTabBtn = document.getElementById("tab-signup-btn");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    
    if (showAuthBtn) showAuthBtn.addEventListener("click", () => showAuthModal(true));
    if (authCloseBtn) authCloseBtn.addEventListener("click", () => showAuthModal(false));
    
    if (loginTabBtn) loginTabBtn.addEventListener("click", () => switchAuthTab("login"));
    if (signupTabBtn) signupTabBtn.addEventListener("click", () => switchAuthTab("signup"));
    
    // Toggle Password Visibility
    document.querySelectorAll(".btn-toggle-pwd").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = btn.previousElementSibling;
        if (input) {
          if (input.type === "password") {
            input.type = "text";
            btn.innerText = "🙈";
          } else {
            input.type = "password";
            btn.innerText = "👁️";
          }
        }
      });
    });
    
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-login-email").value.trim();
        const password = document.getElementById("auth-login-password").value;
        handleLogin(email, password);
      });
    }
    
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("auth-signup-name").value.trim();
        const email = document.getElementById("auth-signup-email").value.trim();
        const password = document.getElementById("auth-signup-password").value;
        const phone = document.getElementById("auth-signup-phone").value.trim();
        const address = document.getElementById("auth-signup-address").value.trim();
        handleSignup(name, email, password, phone, address);
      });
    }
    
    // User Profile Dropdown Menu toggler
    const userAvatarBtn = document.getElementById("btn-user-avatar");
    const userDropdown = document.getElementById("user-dropdown");
    
    if (userAvatarBtn && userDropdown) {
      userAvatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("active");
      });
      
      // Close on clicking outside
      document.addEventListener("click", () => {
        userDropdown.classList.remove("active");
      });
    }
    
    // Dropdown Actions
    const dropdownDashboard = document.getElementById("dropdown-btn-dashboard");
    const dropdownSettings = document.getElementById("dropdown-btn-settings");
    const dropdownLogout = document.getElementById("dropdown-btn-logout");
    
    if (dropdownDashboard) {
      dropdownDashboard.addEventListener("click", () => {
        showDashboardModal(true);
        switchDashboardTab("overview");
      });
    }
    
    if (dropdownSettings) {
      dropdownSettings.addEventListener("click", () => {
        showDashboardModal(true);
        switchDashboardTab("settings");
      });
    }
    
    if (dropdownLogout) {
      dropdownLogout.addEventListener("click", handleLogout);
    }
    
    // Dashboard Close
    const dashboardCloseBtn = document.getElementById("btn-dashboard-close");
    if (dashboardCloseBtn) {
      dashboardCloseBtn.addEventListener("click", () => showDashboardModal(false));
    }
    
    // Dashboard Nav Buttons
    document.querySelectorAll(".dash-nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        switchDashboardTab(btn.dataset.tab);
      });
    });
    
    // Profile Updates
    const profileForm = document.getElementById("dash-profile-form");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("dash-profile-name").value.trim();
        const phone = document.getElementById("dash-profile-phone").value.trim();
        const address = document.getElementById("dash-profile-address").value.trim();
        handleUpdateProfile(name, phone, address);
      });
    }
    
    // Sync active session on start
    syncActiveSession();
  };

  fetchProductsAndBooths();
});
