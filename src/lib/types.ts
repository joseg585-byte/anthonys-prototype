// Shared domain types for the Anthony's prototype.
// Multi-tenant from day one: every record is scoped to a restaurant (tenant).

export type Category =
  | "Appetizers"
  | "Soup & Salad"
  | "Pasta"
  | "Specialties"
  | "Desserts";

export const CATEGORY_ORDER: Category[] = [
  "Appetizers",
  "Soup & Salad",
  "Pasta",
  "Specialties",
  "Desserts",
];

export interface MenuAddon {
  label: string;
  priceCents: number;
}

export interface MenuItem {
  id: string; // stable slug, also the DB primary-key seed
  category: Category;
  name: string;
  description: string;
  priceCents: number;
  image?: string; // path under /public, omitted -> typographic card
  tags?: Array<"vegetarian" | "vegan">;
  addons?: MenuAddon[];
  featured?: boolean;
  sortOrder: number;
}

export interface CartLine {
  itemId: string;
  name: string;
  priceCents: number; // unit price incl. selected addon
  addonLabel?: string;
  qty: number;
  image?: string;
}

export type OrderStatus = "received" | "preparing" | "ready" | "completed";

export interface OrderItem {
  name: string;
  qty: number;
  priceCents: number;
  addonLabel?: string;
}

export interface Order {
  id: string;
  shortCode: string; // human-friendly ticket number, e.g. "A-204"
  restaurantSlug: string;
  status: OrderStatus;
  customerFirstName: string;
  customerLastName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes?: string;
  createdAt: number; // epoch ms
}
