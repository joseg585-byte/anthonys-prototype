import type { MenuItem, Modifier } from "@/lib/types";

// ---------------------------------------------------------------------------
// FULL dinner menu scraped from https://www.kcanthonysongrand.com/dinner-menu/
// Descriptions are verbatim. Prices stored in cents. Images that exist are
// Anthony's OWN photography (public/images/menu/*). Three dishes without a
// usable in-house photo (Lasagna, Tiramisu, Linguine w/ Clam Sauce) use
// licensed Unsplash imagery; the rest render as engraved typographic cards.
//
// MODIFIERS — Phase 1 research (live site scrape 2026-06-10):
//   Anthony's actual add-ons found on kcanthonysongrand.com/dinner-menu/:
//     - Meatball +$4.50 | Sausage +$5.00 | Meat Sauce +$4.50 (sugo pastas)
//     - Chicken +$6.50 (Jerri Jean pastas)
//     - Chicken +$6.50 | Shrimp +$7.50 (Pasta Angela)
//   Industry-standard additions (no other modifiers listed on site):
//     - Extra Parmesan, GF Pasta sub, Side Marinara, prep flags
// ---------------------------------------------------------------------------

// ── Modifier definitions ───────────────────────────────────────────────────

const M: Record<string, Modifier> = {
  // Add-ons confirmed from Anthony's website
  ADD_MEATBALL:   { id: "add-meatball",   name: "Add Meatball",          priceCents: 450, category: "add-on" },
  ADD_SAUSAGE:    { id: "add-sausage",    name: "Add Sausage",           priceCents: 500, category: "add-on" },
  ADD_MEAT_SAUCE: { id: "add-meat-sauce", name: "Add Meat Sauce",        priceCents: 450, category: "add-on" },
  ADD_CHICKEN:    { id: "add-chicken",    name: "Add Chicken",           priceCents: 650, category: "add-on" },
  ADD_SHRIMP:     { id: "add-shrimp",     name: "Add Shrimp",            priceCents: 750, category: "add-on" },
  // Industry-standard add-ons
  EXTRA_PARM:     { id: "extra-parmesan", name: "Extra Parmesan",        priceCents: 200, category: "add-on" },
  SIDE_MARINARA:  { id: "side-marinara",  name: "Side of Marinara",      priceCents: 300, category: "add-on" },
  SIDE_BREAD:     { id: "side-bread",     name: "Side of Italian Bread", priceCents: 300, category: "add-on" },
  // Substitution
  GF_PASTA:       { id: "gf-pasta",       name: "Gluten-Free Pasta",     priceCents: 300, category: "substitution" },
  // Preparation flags (free)
  EXTRA_SAUCE:    { id: "extra-sauce",    name: "Extra Sauce",           priceCents: 0,   category: "preparation" },
  LIGHT_SAUCE:    { id: "light-sauce",    name: "Light Sauce",           priceCents: 0,   category: "preparation" },
  SAUCE_SIDE:     { id: "sauce-on-side",  name: "Sauce on the Side",     priceCents: 0,   category: "preparation" },
  WELL_DONE:      { id: "well-done",      name: "Well Done",             priceCents: 0,   category: "preparation" },
  DRESSING_SIDE:  { id: "dressing-side",  name: "Dressing on the Side",  priceCents: 0,   category: "preparation" },
  NO_ONIONS:      { id: "no-onions",      name: "No Onions",             priceCents: 0,   category: "preparation" },
};

// ── Modifier bundles ───────────────────────────────────────────────────────
// Base extras available on all pasta (industry standard)
const PASTA_BASE  = [M.EXTRA_PARM, M.GF_PASTA, M.SAUCE_SIDE, M.EXTRA_SAUCE];

// Sugo-based pastas: meatball / sausage / meat sauce confirmed on site
const PASTA_SUGO    = [M.ADD_MEATBALL, M.ADD_SAUSAGE, M.ADD_MEAT_SAUCE, ...PASTA_BASE];
// Jerri Jean pastas: meatball / sausage / chicken confirmed on site
const PASTA_PROTEIN = [M.ADD_MEATBALL, M.ADD_SAUSAGE, M.ADD_CHICKEN,    ...PASTA_BASE];
// Cream sauce pastas: chicken / shrimp confirmed on site (Pasta Angela)
const PASTA_CREAM   = [M.ADD_CHICKEN, M.ADD_SHRIMP,                      ...PASTA_BASE];
// Neutral pastas (no protein on site): just the base extras
const PASTA_PLAIN   = [...PASTA_BASE];

// Fried appetizers: extra dipping sauce
const FRIED_APP = [M.SIDE_MARINARA, M.EXTRA_SAUCE];

// Specialty entrées: sauce and cooking prep
const SPECIALTY = [M.EXTRA_SAUCE, M.LIGHT_SAUCE, M.SAUCE_SIDE, M.WELL_DONE, M.SIDE_MARINARA];

// ── Menu ──────────────────────────────────────────────────────────────────

export const MENU: MenuItem[] = [
  // ─────────────────────────── Appetizers ──────────────────────────────

  {
    id: "jazz",
    category: "Appetizers",
    name: "Jazz",
    description: "Fresh garlic, Romano cheese and herbs in olive oil. Great for dipping.",
    priceCents: 800,
    tags: ["vegetarian"],
    sortOrder: 1,
  },
  {
    id: "cheese-and-olives",
    category: "Appetizers",
    name: "Cheese & Olives",
    description: "Aged provolone served with our marinated olive salad.",
    priceCents: 1400,
    tags: ["vegetarian"],
    sortOrder: 2,
  },
  {
    id: "pickled-peppers-olives",
    category: "Appetizers",
    name: "Pickled Peppers & Olives",
    description: "Sweet and spicy.",
    priceCents: 1100,
    tags: ["vegan"],
    sortOrder: 3,
  },
  {
    id: "antipasto",
    category: "Appetizers",
    name: "Antipasto",
    description: "Pickled peppers, Italian olives, aged provolone and smoked ham.",
    priceCents: 1800,
    image: "/images/menu/antipasto.jpg",
    sortOrder: 4,
  },
  {
    id: "fried-provolone",
    category: "Appetizers",
    name: "Fried Provolone",
    description: "Hand-cut triangles covered in seasoned bread crumbs. Served with sugo.",
    priceCents: 1400,
    tags: ["vegetarian"],
    modifiers: FRIED_APP,
    allowsSpecialRequests: true,
    sortOrder: 5,
  },
  {
    id: "toasted-ravioli",
    category: "Appetizers",
    name: "Toasted Ravioli",
    description: "Filled with ricotta cheese and deep-fried in seasoned bread crumbs. Served with sugo.",
    priceCents: 1400,
    tags: ["vegetarian"],
    modifiers: FRIED_APP,
    allowsSpecialRequests: true,
    sortOrder: 6,
  },
  {
    id: "fried-calamari",
    category: "Appetizers",
    name: "Fried Calamari",
    description: "Served with sugo and home-made mogu, a olive oil, garlic and lemon sauce.",
    priceCents: 1700,
    modifiers: FRIED_APP,
    allowsSpecialRequests: true,
    sortOrder: 7,
  },
  {
    id: "stuffed-artichoke",
    category: "Appetizers",
    name: "Stuffed Artichoke",
    description: "A fresh baked artichoke baked with bread crumbs, topped with butter and garlic.",
    priceCents: 1700,
    tags: ["vegetarian"],
    modifiers: [M.EXTRA_SAUCE, M.LIGHT_SAUCE],
    allowsSpecialRequests: true,
    sortOrder: 8,
  },
  {
    id: "italian-broccoli",
    category: "Appetizers",
    name: "Italian Broccoli",
    description: "Fresh broccoli sauteed with garlic, olive oil and spices.",
    priceCents: 1200,
    tags: ["vegan"],
    sortOrder: 9,
  },

  // ─────────────────────────── Soup & Salad ────────────────────────────

  {
    id: "todays-soup",
    category: "Soup & Salad",
    name: "Today's Soup",
    description: "Made fresh daily. Served with bread and butter.",
    priceCents: 650,
    allowsSpecialRequests: true,
    sortOrder: 1,
  },
  {
    id: "house-salad",
    category: "Soup & Salad",
    name: "House Salad",
    description: "Choice of house Italian or Ranch dressing. Served with bread and butter.",
    priceCents: 650,
    image: "/images/menu/house-salad.jpg",
    tags: ["vegetarian"],
    modifiers: [M.DRESSING_SIDE, M.EXTRA_PARM, M.SIDE_BREAD],
    allowsSpecialRequests: true,
    sortOrder: 2,
  },

  // ─────────────────────────────── Pasta ───────────────────────────────

  {
    id: "linguini-with-sugo",
    category: "Pasta",
    name: "Linguini with Sugo",
    description: "Linguine tossed in and topped with our homemade sugo.",
    priceCents: 1600,
    tags: ["vegan"],
    modifiers: PASTA_SUGO,
    allowsSpecialRequests: true,
    sortOrder: 1,
  },
  {
    id: "lasagna",
    category: "Pasta",
    name: "Lasagna",
    description: "Layered with sugo, Parmesan and Ricotta.",
    priceCents: 1900,
    image: "/images/menu/lasagna.jpg",
    tags: ["vegetarian"],
    modifiers: PASTA_SUGO,
    allowsSpecialRequests: true,
    sortOrder: 2,
  },
  {
    id: "ravioli",
    category: "Pasta",
    name: "Ravioli",
    description: "Filled with ricotta.",
    priceCents: 1800,
    tags: ["vegetarian"],
    modifiers: PASTA_SUGO,
    allowsSpecialRequests: true,
    sortOrder: 3,
  },
  {
    id: "ravioli-jerri-jean",
    category: "Pasta",
    name: "Ravioli Jerri Jean",
    description:
      "Onions and tomatoes marinated in our house zugo pureed then sauteed with fresh garlic, olive oil, butter and a pinch of red pepper over our ricotta filled ravioli.",
    priceCents: 2200,
    image: "/images/menu/ravioli-jerri-jean.jpg",
    tags: ["vegetarian"],
    modifiers: PASTA_PROTEIN,
    allowsSpecialRequests: true,
    sortOrder: 4,
  },
  {
    id: "pasta-aglio-e-olio",
    category: "Pasta",
    name: "Pasta Aglio E Olio",
    description: "Linguini sauteed with olive oil, garlic, butter and spices.",
    priceCents: 1900,
    tags: ["vegetarian"],
    modifiers: [M.ADD_CHICKEN, M.ADD_SHRIMP, ...PASTA_BASE],
    allowsSpecialRequests: true,
    sortOrder: 5,
  },
  {
    id: "pasta-angela",
    category: "Pasta",
    name: "Pasta Angela",
    description: "Linguine pasta sautéed in a Parmesan cheese, butter and garlic cream sauce.",
    priceCents: 2000,
    tags: ["vegetarian"],
    modifiers: PASTA_CREAM,
    allowsSpecialRequests: true,
    sortOrder: 6,
  },
  {
    id: "pasta-con-fungi-piselli",
    category: "Pasta",
    name: "Pasta con Fungi Piselli",
    description: "Linguini topped with peas and mushrooms, sauteed in sugo.",
    priceCents: 2000,
    image: "/images/menu/pasta-fungi-piselli.jpg",
    tags: ["vegan"],
    modifiers: [M.ADD_CHICKEN, ...PASTA_BASE],
    allowsSpecialRequests: true,
    sortOrder: 7,
  },
  {
    id: "linguine-with-clam-sauce",
    category: "Pasta",
    name: "Linguine with Clam Sauce",
    description: "Chopped clams sauteed in olive oil, butter and garlic.",
    priceCents: 2200,
    image: "/images/menu/linguine-clam.jpg",
    modifiers: PASTA_PLAIN,
    allowsSpecialRequests: true,
    sortOrder: 8,
  },
  {
    id: "pasta-con-broccoli",
    category: "Pasta",
    name: "Pasta con Broccoli",
    description:
      "Our home-made red cream sauce with broccoli, fresh mushrooms, garlic, and a pinch of red pepper served with penne pasta.",
    priceCents: 2400,
    image: "/images/menu/pasta-con-broccoli.jpg",
    tags: ["vegetarian"],
    modifiers: PASTA_CREAM,
    allowsSpecialRequests: true,
    sortOrder: 9,
  },
  {
    id: "pasta-jerri-jean",
    category: "Pasta",
    name: "Pasta Jerri Jean",
    description:
      "Onions and tomatoes marinated in our house zugo pureed then sauteed with fresh garlic, olive oil, butter and a pinch of red pepper over pasta.",
    priceCents: 2000,
    image: "/images/menu/pasta-jerri-jean.jpg",
    tags: ["vegetarian"],
    modifiers: PASTA_PROTEIN,
    allowsSpecialRequests: true,
    featured: true,
    sortOrder: 10,
  },
  {
    id: "pasta-puttanesca",
    category: "Pasta",
    name: "Pasta Puttanesca",
    description:
      "Shrimp, calamari, chopped clams, mushrooms, and crushed tomatoes sauteed with fresh garlic, butter and a pinch of red pepper poured over linguini pasta.",
    priceCents: 2900,
    image: "/images/menu/pasta-puttanesca.jpg",
    modifiers: PASTA_PLAIN,
    allowsSpecialRequests: true,
    sortOrder: 11,
  },
  {
    id: "pasta-marinara",
    category: "Pasta",
    name: "Pasta Marinara",
    description:
      "Linguini sauteed with fresh tomatoes, white wine, garlic, onions and Italian herbs & spices.",
    priceCents: 2000,
    tags: ["vegan"],
    modifiers: [M.ADD_CHICKEN, M.ADD_SHRIMP, M.ADD_MEATBALL, M.NO_ONIONS, ...PASTA_BASE],
    allowsSpecialRequests: true,
    sortOrder: 12,
  },

  // ────────────────────────── Specialties ──────────────────────────────

  {
    id: "eggplant-parmesan",
    category: "Specialties",
    name: "Eggplant Parmesan",
    description:
      "Breaded slices of fresh eggplant topped with sugo, grated Parmesan and melted mozzarella.",
    priceCents: 1950,
    tags: ["vegetarian"],
    modifiers: SPECIALTY,
    allowsSpecialRequests: true,
    sortOrder: 1,
  },
  {
    id: "chicken-parmesan",
    category: "Specialties",
    name: "Chicken Parmesan",
    description: "Breaded chicken breast topped with sugo, grated Parmesan and melted mozzarella.",
    priceCents: 2150,
    modifiers: SPECIALTY,
    allowsSpecialRequests: true,
    sortOrder: 2,
  },
  {
    id: "veal-parmesan",
    category: "Specialties",
    name: "Veal Parmesan",
    description: "Breaded veal topped with sugo, grated Parmesan and melted mozzarella.",
    priceCents: 2450,
    modifiers: SPECIALTY,
    allowsSpecialRequests: true,
    sortOrder: 3,
  },
  {
    id: "chicken-broccoli",
    category: "Specialties",
    name: "Chicken Broccoli",
    description:
      "Breaded chicken breast topped with broccoli and fresh mushrooms, served in a white wine, butter and garlic sauce.",
    priceCents: 2250,
    modifiers: [M.EXTRA_SAUCE, M.LIGHT_SAUCE, M.SAUCE_SIDE, M.WELL_DONE],
    allowsSpecialRequests: true,
    sortOrder: 4,
  },
  {
    id: "chicken-spiedini",
    category: "Specialties",
    name: "Chicken Spiedini",
    description:
      "Four large pieces of chicken breast tenders coated in our seasoned breadcrumbs, rolled and deep-fried on a skewer, then cooked in our garlic-lemon and olive oil sauce.",
    priceCents: 2550,
    image: "/images/menu/chicken-spiedini.jpg",
    modifiers: [M.EXTRA_SAUCE, M.LIGHT_SAUCE, M.SAUCE_SIDE, M.WELL_DONE],
    allowsSpecialRequests: true,
    featured: true,
    sortOrder: 5,
  },
  {
    id: "pollo-parmesan",
    category: "Specialties",
    name: "Pollo Parmesan",
    description: "Breaded chicken breast topped with melted mozzarella, sugo and parmesan cheese.",
    priceCents: 2150,
    modifiers: SPECIALTY,
    allowsSpecialRequests: true,
    sortOrder: 6,
  },
  {
    id: "chicken-lemonata",
    category: "Specialties",
    name: "Chicken Lemonata",
    description: "Two grilled chicken breasts, topped with a white wine, lemon and butter sauce.",
    priceCents: 2650,
    image: "/images/menu/chicken-lemonata.jpg",
    modifiers: [M.EXTRA_SAUCE, M.LIGHT_SAUCE, M.SAUCE_SIDE, M.WELL_DONE],
    allowsSpecialRequests: true,
    sortOrder: 7,
  },
  {
    id: "scampi-spino",
    category: "Specialties",
    name: "Scampi Spino",
    description: "Eight shrimp lightly breaded and broiled, served in a garlic, butter and lemon sauce.",
    priceCents: 2750,
    modifiers: [M.EXTRA_SAUCE, M.LIGHT_SAUCE, M.SAUCE_SIDE, M.WELL_DONE],
    allowsSpecialRequests: true,
    sortOrder: 8,
  },

  // ─────────────────────────── Desserts ────────────────────────────────

  {
    id: "cheesecake",
    category: "Desserts",
    name: "Cheesecake",
    description: "Homemade cheesecake cups.",
    priceCents: 750,
    tags: ["vegetarian"],
    sortOrder: 1,
  },
  {
    id: "tiramisu",
    category: "Desserts",
    name: "Tiramisu",
    description:
      "Lady fingers dipped in coffee, layered with a whipped mix of cocoa, Mascarpone cheese and sugar.",
    priceCents: 750,
    image: "/images/menu/tiramisu.jpg",
    tags: ["vegetarian"],
    featured: true,
    sortOrder: 2,
  },
  {
    id: "cannoli",
    category: "Desserts",
    name: "Cannoli (2)",
    description:
      "Ricotta cheese mixed with chocolate, whipped cream, almonds, vanilla and powdered sugar, then stuffed into two homemade cannoli shells.",
    priceCents: 750,
    tags: ["vegetarian"],
    sortOrder: 3,
  },
  {
    id: "four-layer",
    category: "Desserts",
    name: "Four Layer",
    description:
      "Homemade pecan crust, sweetened cream cheese, chocolate pudding and whipped cream.",
    priceCents: 750,
    tags: ["vegetarian"],
    sortOrder: 4,
  },
  {
    id: "spumoni-ice-cream",
    category: "Desserts",
    name: "Spumoni Ice Cream",
    description: "Spumoni ice cream topped with our homemade rum sauce.",
    priceCents: 650,
    tags: ["vegetarian"],
    sortOrder: 5,
  },
];

export const MENU_BY_ID: Record<string, MenuItem> = Object.fromEntries(
  MENU.map((m) => [m.id, m]),
);
