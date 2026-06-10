// Brand + tenant record for Anthony's. Scraped from kcanthonysongrand.com.
// Founded 1978 -> 48 years in 2026 (the site says "serving since 1978").

export const RESTAURANT = {
  slug: "anthonys-on-grand",
  name: "Anthony's",
  fullName: "Anthony's Restaurant & Lounge",
  tagline: "Italian Jewel on Grand Avenue",
  italianTagline: "La Migliore Cucina Italiana",
  italianTaglineEn: "The Best Italian Cuisine",
  foundedYear: 1978,
  yearsOfLegacy: 2026 - 1978, // 48
  address: {
    line1: "701 Grand Blvd.",
    city: "Kansas City",
    state: "MO",
    zip: "64106",
  },
  phone: "(816) 221-4088",
  phoneHref: "tel:+18162214088",
  hours: [
    { label: "Lunch", value: "Tue–Fri 11–3 · Sat 12–3" },
    { label: "Dinner", value: "Tue–Thu 3–9 · Fri & Sat 3–10" },
    { label: "Sunday", value: "Dinner all day 12–8" },
  ],
  social: {
    facebook: "https://www.facebook.com/anthonysongrandkc",
    instagram: "https://www.instagram.com/anthonys.on.grand/",
  },
  // Sales-tax rate applied at checkout (Kansas City, MO prepared-food ~ combined).
  taxRate: 0.0975,
} as const;
