// Sahil's Dairy Product Catalog Data
// Sourced and designed to reflect premium quality and nutritional transparency

const products = [
  {
    id: "milk-gold",
    name: "Sahil's Gold Premium Milk",
    category: "Milk",
    price: 66,
    volume: "1 Litre",
    rating: 4.9,
    reviewsCount: 342,
    description: "Rich, creamy, and pasteurized premium whole milk. Sourced directly from healthy cows, Sahil's Gold Milk is packed with essential calcium, proteins, and vitamins, making it the perfect choice for the entire family. Ideal for boiling, making delicious tea, coffee, creamy curd, and traditional sweets.",
    nutrition: {
      "Energy": "74 kcal",
      "Protein": "3.3g",
      "Fats": "4.5g",
      "Calcium": "125mg",
      "Carbohydrates": "4.8g"
    },
    ingredients: "Standardized Cow & Buffalo Milk, Vitamin A & D Fortification",
    shelfLife: "48 Hours from packaging under refrigeration.",
    storage: "Store continuously under refrigeration at 4°C or below.",
    svgType: "milk-gold"
  },
  {
    id: "milk-toned",
    name: "Sahil's Toned Lite Milk",
    category: "Milk",
    price: 27,
    volume: "500 ml",
    rating: 4.8,
    reviewsCount: 218,
    description: "A nutritious, low-fat alternative for a healthy lifestyle. Sahil's Toned Milk provides all the essential goodness of milk, including rich protein and calcium, but with a minimized fat percentage. Perfect for fitness enthusiasts, weight managers, and daily consumption.",
    nutrition: {
      "Energy": "58 kcal",
      "Protein": "3.2g",
      "Fats": "3.0g",
      "Calcium": "120mg",
      "Carbohydrates": "4.7g"
    },
    ingredients: "Toned Milk, Vitamin A & D Fortification",
    shelfLife: "48 Hours from packaging under refrigeration.",
    storage: "Store continuously under refrigeration at 4°C or below.",
    svgType: "milk-toned"
  },
  {
    id: "fresh-curd",
    name: "Sahil's Thick Fresh Curd",
    category: "Curd",
    price: 35,
    volume: "400 g",
    rating: 4.9,
    reviewsCount: 189,
    description: "Made from pasteurized toned milk using selected active cultures, Sahil's Curd is thick, delicious, and easy to digest. It supports gut health, improves digestion, and serves as a refreshing accompaniment to standard Indian meals.",
    nutrition: {
      "Energy": "60 kcal",
      "Protein": "4.0g",
      "Fats": "3.1g",
      "Calcium": "150mg",
      "Carbohydrates": "4.0g"
    },
    ingredients: "Pasteurized Toned Milk, Active Lactic Cultures",
    shelfLife: "10 Days from packaging.",
    storage: "Keep refrigerated at 4°C or below.",
    svgType: "curd"
  },
  {
    id: "premium-paneer",
    name: "Sahil's Fresh Premium Paneer",
    category: "Paneer",
    price: 90,
    volume: "200 g",
    rating: 4.7,
    reviewsCount: 154,
    description: "Incredibly soft, fresh, and high-protein cottage cheese. Sahil's Premium Paneer is made under strict hygienic conditions using pure milk, preserving its soft texture and milky flavor. Excellent for preparing paneer tikka, butter masala, or healthy salads.",
    nutrition: {
      "Energy": "265 kcal",
      "Protein": "18.3g",
      "Fats": "20.5g",
      "Calcium": "480mg",
      "Carbohydrates": "1.8g"
    },
    ingredients: "Pasteurized Cow & Buffalo Milk, Citric Acid (coagulant)",
    shelfLife: "15 Days from packaging.",
    storage: "Store in refrigerator; soak in warm water for 5 minutes before cooking for maximum softness.",
    svgType: "paneer"
  },
  {
    id: "pure-ghee",
    name: "Sahil's Pure Cow Ghee",
    category: "Ghee",
    price: 680,
    volume: "1 Litre",
    rating: 5.0,
    reviewsCount: 512,
    description: "Premium aromatic cow ghee prepared through traditional methods. Known for its rich golden color, granular texture, and mouth-watering aroma, Sahil's Cow Ghee is rich in natural antioxidants, fat-soluble vitamins, and promotes robust immunity and bone health.",
    nutrition: {
      "Energy": "897 kcal",
      "Protein": "0.0g",
      "Fats": "99.7g",
      "Calcium": "0.0mg",
      "Carbohydrates": "0.0g"
    },
    ingredients: "Pure Cow Milk Fat (Clarified Butter)",
    shelfLife: "12 Months from packaging.",
    storage: "Store in a cool, dry place. Keep away from direct sunlight. Do not refrigerate.",
    svgType: "ghee"
  },
  {
    id: "salted-butter",
    name: "Sahil's Classic Salted Butter",
    category: "Butter",
    price: 52,
    volume: "100 g",
    rating: 4.8,
    reviewsCount: 295,
    description: "Rich, creamy, and spreadable salted butter that enhances the taste of everything it touches. Sourced from the finest cream, Sahil's butter has just the right amount of saltiness to complement your toasts, paranthas, bakes, and gourmet dishes.",
    nutrition: {
      "Energy": "722 kcal",
      "Protein": "0.6g",
      "Fats": "80.0g",
      "Calcium": "20mg",
      "Carbohydrates": "0.0g"
    },
    ingredients: "Pasteurized Sweet Cream, Common Salt, Natural Annatto Color",
    shelfLife: "12 Months under frozen conditions.",
    storage: "Store in refrigerator (below 4°C) or freezer.",
    svgType: "butter"
  },
  {
    id: "cheese-slices",
    name: "Sahil's Creamy Cheese Slices",
    category: "Cheese",
    price: 135,
    volume: "200 g (10 Slices)",
    rating: 4.9,
    reviewsCount: 167,
    description: "Individually wrapped, rich, and creamy processed cheese slices. They melt beautifully, making them perfect for homemade burgers, sandwiches, pizzas, and wraps. Packed with calcium and dairy protein.",
    nutrition: {
      "Energy": "315 kcal",
      "Protein": "16.0g",
      "Fats": "25.0g",
      "Calcium": "600mg",
      "Carbohydrates": "4.5g"
    },
    ingredients: "Cheese, Water, Milk Solids, Emulsifiers, Common Salt, Preservatives",
    shelfLife: "9 Months from packaging.",
    storage: "Store under refrigeration at 4°C or below.",
    svgType: "cheese"
  },
  {
    id: "mango-lassi",
    name: "Sahil's Sweet Mango Lassi",
    category: "Lassi",
    price: 30,
    volume: "250 ml",
    rating: 4.9,
    reviewsCount: 284,
    description: "A delicious, thick drink that combines the goodness of fresh yogurt and premium Alphonso mango pulp. Perfectly sweetened and chilled, Sahil's Mango Lassi is a refreshing, probiotic-rich summer thirst quencher.",
    nutrition: {
      "Energy": "92 kcal",
      "Protein": "2.2g",
      "Fats": "1.8g",
      "Calcium": "85mg",
      "Carbohydrates": "16.5g"
    },
    ingredients: "Pasteurized Milk, Alphonso Mango Pulp, Sugar, Lactic Culture",
    shelfLife: "7 Days from packaging.",
    storage: "Keep refrigerated and serve chilled.",
    svgType: "lassi"
  },
  {
    id: "masala-chaas",
    name: "Sahil's Cool Masala Chaas",
    category: "Buttermilk",
    price: 20,
    volume: "500 ml",
    rating: 4.7,
    reviewsCount: 198,
    description: "A traditional spiced buttermilk crafted to cool you down instantly. Prepared with diluted fresh curd and infused with roasted cumin powder, fresh coriander, ginger, mint, and black salt. An excellent natural digestive aid.",
    nutrition: {
      "Energy": "28 kcal",
      "Protein": "1.1g",
      "Fats": "0.9g",
      "Calcium": "45mg",
      "Carbohydrates": "3.5g"
    },
    ingredients: "Buttermilk, Spices (Cumin, Coriander, Ginger, Mint), Black Salt",
    shelfLife: "5 Days from packaging.",
    storage: "Keep refrigerated. Shake well before drinking.",
    svgType: "chaas"
  },
  {
    id: "icecream-vanilla",
    name: "Sahil's Rich Vanilla Tub",
    category: "Ice Cream",
    price: 180,
    volume: "700 ml (1+1 Offer)",
    rating: 4.8,
    reviewsCount: 309,
    description: "Creamy, smooth, and delicious vanilla ice cream. Made using 100% real milk cream and authentic vanilla bean extract. A classic crowd-pleaser, perfect on its own or paired with hot chocolate fudge, brownies, and gulab jamun.",
    nutrition: {
      "Energy": "198 kcal",
      "Protein": "3.8g",
      "Fats": "11.0g",
      "Calcium": "130mg",
      "Carbohydrates": "21.0g"
    },
    ingredients: "Cream, Milk Solids, Sugar, Vanilla Bean Extract, Stabilizers & Emulsifiers",
    shelfLife: "12 Months from packaging (stored below -18°C).",
    storage: "Store in freezer at -18°C or below.",
    svgType: "icecream"
  },
  {
    id: "dairy-sweets",
    name: "Sahil's Premium Milk Peda",
    category: "Dairy Sweets",
    price: 240,
    volume: "400 g (Box of 16)",
    rating: 4.9,
    reviewsCount: 412,
    description: "A timeless, authentic Indian sweet. Handcrafted by reducing pure cow milk slowly to produce rich khoa, then blended with sugar, green cardamom, and garnished with premium almonds and pistachios. Made with love and zero artificial preservatives.",
    nutrition: {
      "Energy": "410 kcal",
      "Protein": "8.5g",
      "Fats": "16.0g",
      "Calcium": "210mg",
      "Carbohydrates": "58.0g"
    },
    ingredients: "Concentrated Milk Solids (Khoa), Sugar, Cardamom, Almonds & Pistachios",
    shelfLife: "15 Days from packaging.",
    storage: "Store in a cool, dry place or refrigerate for longer shelf life.",
    svgType: "sweets"
  }
];

// Exporting to browser window for index.html/main.js integration
if (typeof window !== 'undefined') {
  window.productsData = products;
}
